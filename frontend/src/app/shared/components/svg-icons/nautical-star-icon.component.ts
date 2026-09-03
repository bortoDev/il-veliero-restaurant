import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nautical-star',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="nautical-star-wrapper"
      [style.width]="size"
      [style.height]="size"
      role="img"
      aria-label="Stella Nautica a 8 Punte"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
      >
        <defs>
          <linearGradient id="starNavyComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#134074"/>
            <stop offset="70%" stop-color="#0b2545"/>
            <stop offset="100%" stop-color="#07192f"/>
          </linearGradient>

          <linearGradient id="starGoldLightComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff8db"/>
            <stop offset="50%" stop-color="#fefae0"/>
            <stop offset="100%" stop-color="#dda15e"/>
          </linearGradient>

          <linearGradient id="starGoldDarkComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#dda15e"/>
            <stop offset="70%" stop-color="#bc6c25"/>
            <stop offset="100%" stop-color="#7f3b08"/>
          </linearGradient>

          <radialGradient id="centerRivetComp" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="40%" stop-color="#dda15e"/>
            <stop offset="100%" stop-color="#8a4b12"/>
          </radialGradient>
        </defs>

        <g>
          <circle cx="100" cy="100" r="92" fill="none" stroke="#dda15e" stroke-width="1" opacity="0.6"/>
          <circle cx="100" cy="100" r="88" fill="none" stroke="#0b2545" stroke-width="0.75" stroke-dasharray="2 3" opacity="0.7"/>

          <!-- 4 Secondary Points -->
          <polygon points="100,100 139,61 100,88" fill="url(#starGoldLightComp)" stroke="#bc6c25" stroke-width="0.5"/>
          <polygon points="100,100 139,61 112,100" fill="url(#starNavyComp)" stroke="#07192f" stroke-width="0.5"/>
          <polygon points="100,100 139,139 112,100" fill="url(#starGoldLightComp)" stroke="#bc6c25" stroke-width="0.5"/>
          <polygon points="100,100 139,139 100,112" fill="url(#starNavyComp)" stroke="#07192f" stroke-width="0.5"/>
          <polygon points="100,100 61,139 100,112" fill="url(#starGoldLightComp)" stroke="#bc6c25" stroke-width="0.5"/>
          <polygon points="100,100 61,139 88,100" fill="url(#starNavyComp)" stroke="#07192f" stroke-width="0.5"/>
          <polygon points="100,100 61,61 88,100" fill="url(#starGoldLightComp)" stroke="#bc6c25" stroke-width="0.5"/>
          <polygon points="100,100 61,61 100,88" fill="url(#starNavyComp)" stroke="#07192f" stroke-width="0.5"/>

          <!-- 4 Primary Points -->
          <polygon points="100,100 100,10 86,100" fill="url(#starNavyComp)" stroke="#07192f" stroke-width="0.75"/>
          <polygon points="100,100 100,10 114,100" fill="url(#starGoldLightComp)" stroke="#bc6c25" stroke-width="0.75"/>
          <polygon points="100,100 190,100 100,86" fill="url(#starNavyComp)" stroke="#07192f" stroke-width="0.75"/>
          <polygon points="100,100 190,100 100,114" fill="url(#starGoldLightComp)" stroke="#bc6c25" stroke-width="0.75"/>
          <polygon points="100,100 100,190 114,100" fill="url(#starNavyComp)" stroke="#07192f" stroke-width="0.75"/>
          <polygon points="100,100 100,190 86,100" fill="url(#starGoldLightComp)" stroke="#bc6c25" stroke-width="0.75"/>
          <polygon points="100,100 10,100 100,114" fill="url(#starNavyComp)" stroke="#07192f" stroke-width="0.75"/>
          <polygon points="100,100 10,100 100,86" fill="url(#starGoldLightComp)" stroke="#bc6c25" stroke-width="0.75"/>

          <!-- Center Rivet -->
          <circle cx="100" cy="100" r="14" fill="url(#starGoldDarkComp)" stroke="#542a04" stroke-width="1.2"/>
          <circle cx="100" cy="100" r="9" fill="url(#centerRivetComp)" stroke="#bc6c25" stroke-width="0.8"/>
          <circle cx="98" cy="98" r="3" fill="#ffffff" opacity="0.85"/>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      vertical-align: middle;
    }

    .nautical-star-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;

      &:hover {
        transform: rotate(45deg) scale(1.08);
      }
    }
  `],
})
export class NauticalStarComponent {
  @Input() size = '48px';
}
