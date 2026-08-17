import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { RoutinesComponent } from './routines.component';
import { RoutineDetailComponent } from './routine-detail.component';
import { MentorComponent } from './mentor.component';
import { MeasurementsComponent } from '@shared';

const routes: Routes = [
  { path: '', component: RoutinesComponent },
  { path: 'mentor', component: MentorComponent },
  { path: 'medidas', component: MeasurementsComponent },
  { path: ':id', component: RoutineDetailComponent }
];

@NgModule({
  declarations: [
    RoutinesComponent,
    RoutineDetailComponent,
    MentorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MeasurementsComponent
  ]
})
export class RoutinesModule { }
