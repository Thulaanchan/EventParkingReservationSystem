import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';

export type PosterUploadMode = 'file' | 'url';

/**
 * Event poster upload and preview component.
 * Supports dual modes:
 * Mode 1: Upload Image File (local JPG, PNG, WebP up to 5 MB)
 * Mode 2: Image URL (direct web URL with instant preview, validation, and broken-image handling)
 */
@Component({
  selector: 'app-event-poster-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-poster-upload.component.html',
  styleUrl: './event-poster-upload.component.css'
})
export class EventPosterUploadComponent implements OnChanges, OnDestroy {
  @Input() currentPosterUrl?: string | null = null;
  @Input() disabled = false;

  @Output() posterChange = new EventEmitter<File | null>();
  @Output() posterUrlChange = new EventEmitter<string | null>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  activeMode: PosterUploadMode = 'file';

  // File mode state
  selectedFile: File | null = null;
  objectUrl: string | null = null;
  fileDimensions: string | null = null;
  fileErrorMessage: string | null = null;
  isDragging = false;

  // URL mode state
  urlInput = '';
  confirmedUrl: string | null = null;
  urlErrorMessage: string | null = null;
  urlImageError = false;

  // General state
  imageError = false;

  private readonly maxSizeBytes = 5 * 1024 * 1024; // 5 MB
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPosterUrl']) {
      this.imageError = false;
      this.urlImageError = false;
      // If the existing poster is an absolute external URL, initialize mode to URL
      if (
        this.currentPosterUrl &&
        (this.currentPosterUrl.startsWith('http://') ||
          this.currentPosterUrl.startsWith('https://')) &&
        !this.selectedFile &&
        !this.confirmedUrl
      ) {
        this.activeMode = 'url';
        this.urlInput = this.currentPosterUrl;
        this.confirmedUrl = this.currentPosterUrl;
      }
    }
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  get resolvedCurrentPosterUrl(): string | null {
    if (this.imageError || !this.currentPosterUrl || !this.currentPosterUrl.trim()) {
      return null;
    }

    try {
      const url = this.currentPosterUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return new URL(url, environment.apiUrl).toString();
    } catch {
      return null;
    }
  }

  get activePreviewUrl(): string | null {
    if (this.activeMode === 'file') {
      if (this.objectUrl) {
        return this.objectUrl;
      }
      return this.resolvedCurrentPosterUrl;
    } else {
      if (this.confirmedUrl && !this.urlImageError) {
        return this.confirmedUrl;
      }
      return this.resolvedCurrentPosterUrl;
    }
  }

  get previewFileName(): string {
    if (this.activeMode === 'file' && this.selectedFile) {
      return this.selectedFile.name;
    }
    if (this.activeMode === 'url' && this.confirmedUrl) {
      try {
        const parsed = new URL(this.confirmedUrl);
        const segments = parsed.pathname.split('/').filter(Boolean);
        return segments[segments.length - 1] || 'Web Image Poster';
      } catch {
        return 'Web Image Poster';
      }
    }
    if (this.currentPosterUrl) {
      const parts = this.currentPosterUrl.split('/');
      return parts[parts.length - 1] || 'Current Event Poster';
    }
    return 'Event Poster';
  }

  get previewMeta(): string {
    if (this.activeMode === 'file' && this.selectedFile) {
      const sizeStr = this.formatFileSize(this.selectedFile.size);
      return this.fileDimensions ? `${this.fileDimensions} • ${sizeStr}` : sizeStr;
    }
    if (this.activeMode === 'url' && this.confirmedUrl) {
      return 'Web Image URL';
    }
    return 'Existing event poster';
  }

  setMode(mode: PosterUploadMode): void {
    if (this.disabled || this.activeMode === mode) {
      return;
    }
    this.activeMode = mode;

    if (mode === 'file') {
      // Switched to File mode
      if (this.selectedFile) {
        this.posterChange.emit(this.selectedFile);
        this.posterUrlChange.emit(null);
      } else {
        this.posterChange.emit(null);
        this.posterUrlChange.emit(null);
      }
    } else {
      // Switched to URL mode
      if (this.confirmedUrl && !this.urlErrorMessage && !this.urlImageError) {
        this.posterChange.emit(null);
        this.posterUrlChange.emit(this.confirmedUrl);
      } else {
        this.posterChange.emit(null);
        this.posterUrlChange.emit(null);
      }
    }
  }

  // --- File Mode Methods ---

  openFileDialog(): void {
    if (this.disabled) {
      return;
    }
    this.fileInput?.nativeElement.click();
  }

  onFileInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.processFile(file);
    }
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    if (this.disabled) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  clearFileSelection(): void {
    if (this.disabled) {
      return;
    }
    this.revokeObjectUrl();
    this.selectedFile = null;
    this.fileDimensions = null;
    this.fileErrorMessage = null;
    this.imageError = false;
    this.posterChange.emit(null);
  }

  private processFile(file: File): void {
    this.fileErrorMessage = null;
    this.imageError = false;

    const validationError = this.validateFile(file);
    if (validationError) {
      this.fileErrorMessage = validationError;
      return;
    }

    this.revokeObjectUrl();
    this.selectedFile = file;
    this.objectUrl = URL.createObjectURL(file);
    this.fileDimensions = null;

    const img = new Image();
    img.onload = () => {
      this.fileDimensions = `${img.naturalWidth} × ${img.naturalHeight} px`;
    };
    img.src = this.objectUrl;

    // Emit file, clear URL
    this.confirmedUrl = null;
    this.posterChange.emit(file);
    this.posterUrlChange.emit(null);
  }

  private validateFile(file: File): string | null {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = this.allowedExtensions.some(ext =>
      fileName.endsWith(ext)
    );
    const hasValidMime =
      this.allowedMimeTypes.includes(file.type.toLowerCase()) || !file.type;

    if (!hasValidExtension || !hasValidMime) {
      return 'Poster must be a JPG, PNG, or WebP image.';
    }

    if (file.size > this.maxSizeBytes) {
      return 'Poster must be 5 MB or smaller.';
    }

    return null;
  }

  // --- URL Mode Methods ---

  onUrlInputChange(rawUrl: string): void {
    this.urlInput = rawUrl;
    this.urlErrorMessage = null;
    this.urlImageError = false;

    const trimmed = rawUrl.trim();
    if (!trimmed) {
      this.confirmedUrl = null;
      this.posterUrlChange.emit(null);
      return;
    }

    // Validate URL scheme
    if (!this.isValidHttpUrl(trimmed)) {
      this.urlErrorMessage = 'Please enter a valid URL starting with http:// or https://';
      this.confirmedUrl = null;
      this.posterUrlChange.emit(null);
      return;
    }

    // Valid URL structure, test load
    this.confirmedUrl = trimmed;
    this.revokeObjectUrl();
    this.selectedFile = null;
    this.posterChange.emit(null);
    this.posterUrlChange.emit(trimmed);
  }

  clearUrl(): void {
    if (this.disabled) {
      return;
    }
    this.urlInput = '';
    this.confirmedUrl = null;
    this.urlErrorMessage = null;
    this.urlImageError = false;
    this.posterUrlChange.emit(null);
  }

  onImageError(): void {
    if (this.activeMode === 'url') {
      this.urlImageError = true;
      this.urlErrorMessage = 'Unable to load image from the provided URL. Please check that the URL points to an accessible image.';
      this.posterUrlChange.emit(null);
    } else {
      this.imageError = true;
    }
  }

  private isValidHttpUrl(testString: string): boolean {
    try {
      const url = new URL(testString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }
}
