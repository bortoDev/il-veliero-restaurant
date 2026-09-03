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
  template: `
    <div class="decor-container" aria-hidden="true">
      <div class="floating-item decor-ship">
        <app-veliero-ship size="180px"></app-veliero-ship>
      </div>
      <div class="floating-item decor-helm">
        <app-timone size="160px"></app-timone>
      </div>
      <div class="floating-item decor-compass">
        <app-rosa-dei-venti size="170px" [isSpinning]="true"></app-rosa-dei-venti>
      </div>
      <div class="floating-item decor-star">
        <app-nautical-star size="90px"></app-nautical-star>
      </div>
    </div>
  `,
  styles: [`
    .decor-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
    }

    .floating-item {
      position: absolute;
      opacity: 0.12;
      transition: opacity 0.3s ease;

      &.decor-ship {
        top: 10%;
        right: 6%;
      }

      &.decor-helm {
        bottom: 18%;
        left: 4%;
      }

      &.decor-compass {
        top: 55%;
        right: 10%;
      }

      &.decor-star {
        top: 25%;
        left: 8%;
      }
    }
  `],
})
export class NauticalDecorComponent implements AfterViewInit {
  private el = inject(ElementRef);
  private animService = inject(AnimationService);

  ngAfterViewInit(): void {
    const items = this.el.nativeElement.querySelectorAll('.floating-item');
    if (items.length > 0) {
      this.animService.initFloatingDecor(items);
    }
  }
}

