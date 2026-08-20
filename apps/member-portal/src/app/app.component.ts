import { Component } from '@angular/core';
import { VersionService } from '@shared';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  constructor(private versionService: VersionService) {}
}
