import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { HabitTrackerComponent } from './habit-tracker/habit-tracker.component';
import { MedalsShowcaseComponent } from './medals-showcase/medals-showcase.component';
import { KaizenComponent } from './kaizen.component';

const routes: Routes = [
  {
    path: '',
    component: KaizenComponent
  }
];

@NgModule({
  declarations: [
    KaizenComponent,
    HabitTrackerComponent,
    MedalsShowcaseComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class KaizenModule { }
