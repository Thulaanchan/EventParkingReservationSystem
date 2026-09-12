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
import { environment } from '../../../../../../environments/environment';

/**
 * Event poster upload and preview component.
 * Validates allowed formats (JPG, JPEG, PNG, WebP) and maximum 5 MB file size.
 * Handles preview object URLs safely without memory leaks.
 */
@Component({
  selector: 'app-event-poster-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-poster-upload.component.html',
  styleUrl: './event-poster-upload.component.css'
})
export class EventPosterUploadComponent implements OnChanges, OnDestroy {
  @Input() currentPosterUrl?: string | null = null;
  @Input() disabled = false;

  @Output() posterChange = new EventEmitter<File | null>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  objectUrl: string | null = null;
  fileDimensions: string | null = null;
  errorMessage: string | null = null;
  isDragging = false;
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
    if (this.objectUrl) {
      return this.objectUrl;
    }
    return this.resolvedCurrentPosterUrl;
  }

  get previewFileName(): string {
    if (this.selectedFile) {
      return this.selectedFile.name;
    }
    if (this.currentPosterUrl) {
      const parts = this.currentPosterUrl.split('/');
      return parts[parts.length - 1] || 'Current Event Poster';
    }
    return 'Event Poster';
  }

  get previewMeta(): string {
    if (this.selectedFile) {
      const sizeStr = this.formatFileSize(this.selectedFile.size);
      return this.fileDimensions ? `${this.fileDimensions} • ${sizeStr}` : sizeStr;
    }
    return 'Existing event poster';
  }

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

  clearSelection(): void {
    if (this.disabled) {
      return;
    }
    this.revokeObjectUrl();
    this.selectedFile = null;
    this.fileDimensions = null;
    this.errorMessage = null;
    this.posterChange.emit(null);
  }

  onImageError(): void {
    this.imageError = true;
  }

  private processFile(file: File): void {
    this.errorMessage = null;

    const validationError = this.validateFile(file);
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.revokeObjectUrl();
    this.selectedFile = file;
    this.objectUrl = URL.createObjectURL(file);
    this.fileDimensions = null;

    // Determine dimensions safely for preview display
    const img = new Image();
    img.onload = () => {
      this.fileDimensions = `${img.naturalWidth} × ${img.naturalHeight} px`;
    };
    img.src = this.objectUrl;

    this.posterChange.emit(file);
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
