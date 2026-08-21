import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { BehaviorSubject, interval } from 'rxjs';

interface VersionData {
  version: string;
  timestamp: string;
  hash: string;
}

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  public currentVersion: string = '';
  private currentHash: string | null = null;
  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  updateAvailable$ = this.updateAvailableSubject.asObservable();
  private versionUrl = 'assets/version.json';

  constructor(private http: HttpClient) {
    // Initial check
    this.checkForUpdate();
    
    // Check every 5 minutes
    interval(5 * 60 * 1000).subscribe(() => {
      this.checkForUpdate();
    });
  }

  public checkForUpdate(): void {
    const timestamp = new Date().getTime();
    this.http.get<VersionData>(`${this.versionUrl}?t=${timestamp}`)
      .pipe(first())
      .subscribe({
        next: (response) => {
          if (!this.currentHash) {
            // First load, store the hash
            this.currentHash = response.hash;
            this.currentVersion = response.version;
            console.log(`Current version: ${response.version} (${response.hash})`);
          } else if (this.currentHash !== response.hash) {
            // Hash mismatch, update available
            console.log(`New version available: ${response.version} (${response.hash})`);
            this.currentHash = response.hash;
            this.currentVersion = response.version;
            this.updateAvailableSubject.next(true);
          }
        },
        error: (err) => {
          console.error('Error checking version', err);
        }
      });
  }

  applyUpdate(): void {
    window.location.reload();
  }
}
