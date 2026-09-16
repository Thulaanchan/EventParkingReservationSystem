import { Injectable, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'eventflow_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly isDarkMode = signal<boolean>(false);

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark') {
        this.setTheme(true);
      } else if (savedTheme === 'light') {
        this.setTheme(false);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.setTheme(true);
      } else {
        this.setTheme(false);
      }
    } catch {
      this.setTheme(false);
    }
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkMode());
  }

  setTheme(dark: boolean): void {
    this.isDarkMode.set(dark);

    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
    } catch {
      // Ignore private browsing storage restrictions
    }

    // Apply to root elements so dark theme is globally active across all pages
    const root = document.documentElement;
    const body = document.body;

    if (dark) {
      root.classList.add('dark-theme', 'dark');
      body?.classList.add('dark-theme', 'dark');
    } else {
      root.classList.remove('dark-theme', 'dark');
      body?.classList.remove('dark-theme', 'dark');
    }
  }
}
