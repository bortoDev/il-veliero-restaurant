import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wood-plaque',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="wood-plaque-btn"
      [class.active]="active"
      (click)="onClick()"
      [attr.aria-pressed]="active"
      [attr.aria-label]="label"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 180"
        width="100%"
        height="100%"
        class="plaque-svg"
      >
        <defs>
          <linearGradient id="plankWoodC" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#935d33"/>
            <stop offset="15%" stop-color="#ab7344"/>
            <stop offset="45%" stop-color="#804e28"/>
            <stop offset="70%" stop-color="#693e1e"/>
            <stop offset="100%" stop-color="#4f2b12"/>
          </linearGradient>

          <linearGradient id="plankWoodActiveC" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#bc6c25"/>
            <stop offset="25%" stop-color="#dda15e"/>
            <stop offset="60%" stop-color="#ab7344"/>
            <stop offset="100%" stop-color="#693e1e"/>
          </linearGradient>

          <linearGradient id="ropeHempC" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f3d5b5"/>
            <stop offset="40%" stop-color="#d4a373"/>
            <stop offset="80%" stop-color="#a07844"/>
            <stop offset="100%" stop-color="#6b4d24"/>
          </linearGradient>

          <linearGradient id="bracketIronC" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#475569"/>
            <stop offset="50%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>

          <radialGradient id="brassNailC" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="40%" stop-color="#dda15e"/>
            <stop offset="100%" stop-color="#542a04"/>
          </radialGradient>

          <filter id="plaqueDropShadowC" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#07192f" flood-opacity="0.35"/>
          </filter>
        </defs>

        <g filter="url(#plaqueDropShadowC)">
          <!-- Top Mounting Hook -->
          <g>
            <circle cx="160" cy="14" r="8" fill="url(#bracketIronC)" stroke="#0b1329" stroke-width="1.5"/>
            <circle cx="160" cy="14" r="3" fill="#94a3b8"/>
            <circle cx="160" cy="22" r="11" fill="none" stroke="url(#bracketIronC)" stroke-width="4.5"/>
          </g>

          <!-- Twin Ropes -->
          <g>
            <path d="M 154,28 Q 110,50 65,80" fill="none" stroke="url(#ropeHempC)" stroke-width="6" stroke-linecap="round"/>
            <path d="M 154,28 Q 110,50 65,80" fill="none" stroke="#543715" stroke-width="5" stroke-dasharray="4 6" stroke-linecap="round" opacity="0.6"/>
            <path d="M 166,28 Q 210,50 255,80" fill="none" stroke="url(#ropeHempC)" stroke-width="6" stroke-linecap="round"/>
            <path d="M 166,28 Q 210,50 255,80" fill="none" stroke="#543715" stroke-width="5" stroke-dasharray="4 6" stroke-linecap="round" opacity="0.6"/>
          </g>

          <!-- Eyelets -->
          <circle cx="65" cy="80" r="7" fill="none" stroke="url(#bracketIronC)" stroke-width="3"/>
          <circle cx="255" cy="80" r="7" fill="none" stroke="url(#bracketIronC)" stroke-width="3"/>

          <!-- Plank Board -->
          <g transform="translate(0, 5)">
            <rect
              x="25"
              y="75"
              width="270"
              height="85"
              rx="8"
              [attr.fill]="active ? 'url(#plankWoodActiveC)' : 'url(#plankWoodC)'"
              stroke="#3e200c"
              stroke-width="2"
            />

            <!-- Woodgrain Lines -->
            <g opacity="0.3" stroke="#331807" stroke-linecap="round" fill="none">
              <path d="M 32,88 Q 110,84 288,86" stroke-width="1.2"/>
              <path d="M 30,102 Q 90,106 180,100 T 290,104" stroke-width="1.5"/>
              <path d="M 30,126 Q 130,122 220,128 T 290,124" stroke-width="1.6"/>
              <path d="M 35,146 Q 150,150 285,144" stroke-width="1.2"/>
            </g>

            <!-- Brackets & Rivets -->
            <polygon points="25,75 45,75 25,95" fill="url(#bracketIronC)"/>
            <circle cx="33" cy="83" r="2.5" fill="url(#brassNailC)"/>
            <polygon points="295,75 275,75 295,95" fill="url(#bracketIronC)"/>
            <circle cx="287" cy="83" r="2.5" fill="url(#brassNailC)"/>
            <polygon points="25,160 45,160 25,140" fill="url(#bracketIronC)"/>
            <circle cx="33" cy="152" r="2.5" fill="url(#brassNailC)"/>
            <polygon points="295,160 275,160 295,140" fill="url(#bracketIronC)"/>
            <circle cx="287" cy="152" r="2.5" fill="url(#brassNailC)"/>

            <!-- Engraved Text Label -->
            <text
              x="160"
              y="125"
              font-family="'Cinzel', 'Georgia', serif"
              font-size="24"
              font-weight="700"
              fill="#ffffff"
              stroke="#000000"
              stroke-width="1.2"
              text-anchor="middle"
              letter-spacing="2"
            >
              {{ label }}
            </text>
          </g>
        </g>
      </svg>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .wood-plaque-btn {
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      width: 190px;
      height: 110px;
      transform-origin: top center;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;

      &:hover {
        transform: rotate(2.5deg) scale(1.05);
        filter: brightness(1.1);
      }

      &.active {
        transform: translateY(-4px) scale(1.06);
        filter: drop-shadow(0 0 12px rgba(221, 161, 94, 0.6));
      }
    }

    .plaque-svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `],
})
export class WoodPlaqueComponent {
  @Input() label = 'Pesce';
  @Input() active = false;
  @Output() selected = new EventEmitter<string>();

  onClick(): void {
    this.selected.emit(this.label);
  }
}
