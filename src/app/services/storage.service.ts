import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private memoryStorage: { [key: string]: string } = {};

  constructor() {}

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage not available, falling back to memory storage', e);
      this.memoryStorage[key] = value;
    }
  }

  getItem(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : (this.memoryStorage[key] || null);
    } catch (e) {
      console.warn('LocalStorage getItem failed', e);
      return this.memoryStorage[key] || null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('LocalStorage removeItem failed', e);
    }
    delete this.memoryStorage[key];
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('LocalStorage clear failed', e);
    }
    this.memoryStorage = {};
  }
}
