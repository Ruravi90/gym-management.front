import { Component, OnInit } from '@angular/core';
import { VersionService } from '@shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'gym-management-frontend';

  constructor(private versionService: VersionService) {}

  ngOnInit(): void {
    // Version check is initialized in the service constructor
  }
}
