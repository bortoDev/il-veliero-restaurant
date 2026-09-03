import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rosa-dei-venti',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rosa-dei-venti-wrapper"
      [style.width]="size"
      [style.height]="size"
      [style.transform]="'rotate(' + rotation + 'deg)'"
      [class.spinning]="isSpinning"
      role="img"
      aria-label="Rosa dei Venti — Bussola Nautica"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 600"
        width="100%"
        height="100%"
      >
        <defs>
          <radialGradient id="brassHubC" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
            <stop offset="0%" stop-color="#fff2b2"/>
            <stop offset="40%" stop-color="#dda15e"/>
            <stop offset="85%" stop-color="#bc6c25"/>
            <stop offset="100%" stop-color="#6b3a0a"/>
          </radialGradient>
          <radialGradient id="compassDialBgC" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
            <stop offset="70%" stop-color="#f8fafc" stop-opacity="0.9"/>
            <stop offset="95%" stop-color="#e2e8f0" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#cbd5e1" stop-opacity="0.95"/>
          </radialGradient>
          <linearGradient id="goldLightC" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff4cc"/>
            <stop offset="50%" stop-color="#dda15e"/>
            <stop offset="100%" stop-color="#bc6c25"/>
          </linearGradient>
          <linearGradient id="goldDarkC" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#c58231"/>
            <stop offset="70%" stop-color="#8a4b12"/>
            <stop offset="100%" stop-color="#542a04"/>
          </linearGradient>
          <linearGradient id="navyLightC" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1d4e89"/>
            <stop offset="60%" stop-color="#134074"/>
            <stop offset="100%" stop-color="#0b2545"/>
          </linearGradient>
          <linearGradient id="crimsonLightC" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff758f"/>
            <stop offset="50%" stop-color="#e63946"/>
            <stop offset="100%" stop-color="#9d0208"/>
          </linearGradient>
          <linearGradient id="crimsonDarkC" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#9d0208"/>
            <stop offset="100%" stop-color="#590d22"/>
          </linearGradient>
          <filter id="compassShadowC" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#07192f" flood-opacity="0.25"/>
          </filter>
        </defs>

        <g filter="url(#compassShadowC)">
          <circle cx="300" cy="300" r="285" fill="url(#compassDialBgC)" stroke="#0b2545" stroke-width="3"/>
          <circle cx="300" cy="300" r="275" fill="none" stroke="#dda15e" stroke-width="1.5" stroke-dasharray="2 4"/>
          <circle cx="300" cy="300" r="268" fill="none" stroke="#0b2545" stroke-width="2"/>

          <!-- Dial Ticks -->
          <g stroke="#0b2545" stroke-linecap="round" opacity="0.8">
            <line x1="300" y1="32" x2="300" y2="48" stroke-width="2.5" stroke="#bc6c25"/>
            <line x1="300" y1="552" x2="300" y2="568" stroke-width="2.5" stroke="#bc6c25"/>
            <line x1="32" y1="300" x2="48" y2="300" stroke-width="2.5" stroke="#bc6c25"/>
            <line x1="552" y1="300" x2="568" y2="300" stroke-width="2.5" stroke="#bc6c25"/>
          </g>

          <circle cx="300" cy="300" r="230" fill="none" stroke="#dda15e" stroke-width="1"/>
          <circle cx="300" cy="300" r="180" fill="none" stroke="#0b2545" stroke-width="1.5"/>

          <!-- 8 Intermediate Points -->
          <g opacity="0.9">
            <polygon points="300,300 300,140 361,153" fill="url(#crimsonLightC)"/>
            <polygon points="300,300 361,153 325,188" fill="url(#crimsonDarkC)"/>
            <polygon points="300,300 460,239 447,300" fill="url(#crimsonLightC)"/>
            <polygon points="300,300 412,275 460,239" fill="url(#crimsonDarkC)"/>
            <polygon points="300,300 447,300 460,361" fill="url(#crimsonLightC)"/>
            <polygon points="300,300 460,361 412,325" fill="url(#crimsonDarkC)"/>
            <polygon points="300,300 361,447 300,460" fill="url(#crimsonLightC)"/>
            <polygon points="300,300 325,412 361,447" fill="url(#crimsonDarkC)"/>
            <polygon points="300,300 300,460 239,447" fill="url(#crimsonLightC)"/>
            <polygon points="300,300 239,447 275,412" fill="url(#crimsonDarkC)"/>
            <polygon points="300,300 140,361 153,300" fill="url(#crimsonLightC)"/>
            <polygon points="300,300 188,325 140,361" fill="url(#crimsonDarkC)"/>
            <polygon points="300,300 153,300 140,239" fill="url(#crimsonLightC)"/>
            <polygon points="300,300 140,239 188,275" fill="url(#crimsonDarkC)"/>
            <polygon points="300,300 239,153 300,140" fill="url(#crimsonLightC)"/>
            <polygon points="300,300 275,188 239,153" fill="url(#crimsonDarkC)"/>
          </g>

          <!-- 4 Secondary Points -->
          <g>
            <polygon points="300,300 445,155 300,265" fill="url(#goldLightC)" stroke="#bc6c25" stroke-width="0.5"/>
            <polygon points="300,300 445,155 335,300" fill="url(#goldDarkC)" stroke="#bc6c25" stroke-width="0.5"/>
            <polygon points="300,300 445,445 335,300" fill="url(#goldLightC)" stroke="#bc6c25" stroke-width="0.5"/>
            <polygon points="300,300 445,445 300,335" fill="url(#goldDarkC)" stroke="#bc6c25" stroke-width="0.5"/>
            <polygon points="300,300 155,445 300,335" fill="url(#goldLightC)" stroke="#bc6c25" stroke-width="0.5"/>
            <polygon points="300,300 155,445 265,300" fill="url(#goldDarkC)" stroke="#bc6c25" stroke-width="0.5"/>
            <polygon points="300,300 155,155 265,300" fill="url(#goldLightC)" stroke="#bc6c25" stroke-width="0.5"/>
            <polygon points="300,300 155,155 300,265" fill="url(#goldDarkC)" stroke="#bc6c25" stroke-width="0.5"/>
          </g>

          <!-- 4 Primary Points -->
          <g>
            <polygon points="300,300 300,55 272,300" fill="url(#navyLightC)" stroke="#07192f" stroke-width="0.75"/>
            <polygon points="300,300 300,55 328,300" fill="url(#goldLightC)" stroke="#bc6c25" stroke-width="0.75"/>
            <polygon points="300,300 545,300 300,272" fill="url(#navyLightC)" stroke="#07192f" stroke-width="0.75"/>
            <polygon points="300,300 545,300 300,328" fill="url(#goldLightC)" stroke="#bc6c25" stroke-width="0.75"/>
            <polygon points="300,300 300,545 328,300" fill="url(#navyLightC)" stroke="#07192f" stroke-width="0.75"/>
            <polygon points="300,300 300,545 272,300" fill="url(#goldLightC)" stroke="#bc6c25" stroke-width="0.75"/>
            <polygon points="300,300 55,300 300,328" fill="url(#navyLightC)" stroke="#07192f" stroke-width="0.75"/>
            <polygon points="300,300 55,300 300,272" fill="url(#goldLightC)" stroke="#bc6c25" stroke-width="0.75"/>
          </g>

          <!-- Center Rings & Hub -->
          <circle cx="300" cy="300" r="100" fill="none" stroke="#dda15e" stroke-width="1.5"/>
          <circle cx="300" cy="300" r="70" fill="none" stroke="#0b2545" stroke-width="2" stroke-dasharray="4 2"/>
          <circle cx="300" cy="300" r="45" fill="none" stroke="#dda15e" stroke-width="2"/>
          <circle cx="300" cy="300" r="30" fill="url(#brassHubC)" stroke="#542a04" stroke-width="2"/>
          <circle cx="300" cy="300" r="22" fill="url(#goldLightC)" stroke="#bc6c25" stroke-width="1.2"/>
          <circle cx="300" cy="300" r="12" fill="url(#navyLightC)" stroke="#0b2545" stroke-width="1"/>
          <circle cx="297" cy="297" r="4" fill="#ffffff" opacity="0.8"/>

          <!-- Cardinal Inscriptions -->
          <g font-family="'Cinzel', serif" font-weight="bold" text-anchor="middle" dominant-baseline="central">
            <text x="300" y="22" font-size="24" fill="#0b2545">N</text>
            <text x="580" y="300" font-size="22" fill="#0b2545">E</text>
            <text x="300" y="580" font-size="22" fill="#0b2545">S</text>
            <text x="20" y="300" font-size="22" fill="#0b2545">O</text>
          </g>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      vertical-align: middle;
    }

    .rosa-dei-venti-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);

      &.spinning {
        animation: spinSlow 30s linear infinite;
      }
    }

    @keyframes spinSlow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `],
})
export class RosaDeiVentiComponent {
  @Input() size = '160px';
  @Input() rotation = 0;
  @Input() isSpinning = false;
}
