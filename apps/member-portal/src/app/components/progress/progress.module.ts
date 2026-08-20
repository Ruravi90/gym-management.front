import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LevelBarComponent } from './level-bar/level-bar.component';

@NgModule({
  declarations: [
    LevelBarComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    LevelBarComponent
  ]
})
export class ProgressModule { }
