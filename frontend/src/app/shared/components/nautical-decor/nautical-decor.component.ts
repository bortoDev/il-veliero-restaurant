import { Component, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../../core/services/animation.service';
import {
  RosaDeiVentiComponent,
  NauticalStarComponent,
  VelieroShipComponent,
  TimoneComponent,
} from '../svg-icons';

@Component({
  selector: 'app-nautical-decor',
  standalone: true,
  imports: [
    CommonModule,
    RosaDeiVentiComponent,
    NauticalStarComponent,
    VelieroShipComponent,
    TimoneComponent,
  ],
  template: ``,
  styles: [`:host { display: none; }`],
})
export class NauticalDecorComponent {
}

