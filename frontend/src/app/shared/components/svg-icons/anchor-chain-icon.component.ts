import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-anchor-chain',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="anchor-chain-wrapper"
      [style.width]="width"
      [style.height]="height"
      role="img"
      aria-label="Catena con Ancora Marina"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 160 600"
        width="100%"
        height="100%"
      >
        <defs>
          <linearGradient id="ironVertComp" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="25%" stop-color="#334155"/>
            <stop offset="50%" stop-color="#64748b"/>
            <stop offset="75%" stop-color="#334155"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>

          <linearGradient id="ironHorizComp" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="35%" stop-color="#475569"/>
            <stop offset="70%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>

          <linearGradient id="brassStockComp" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#bc6c25"/>
            <stop offset="30%" stop-color="#fefae0"/>
            <stop offset="70%" stop-color="#dda15e"/>
            <stop offset="100%" stop-color="#6b3a0a"/>
          </linearGradient>

          <radialGradient id="brassFinialComp" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="40%" stop-color="#dda15e"/>
            <stop offset="85%" stop-color="#bc6c25"/>
            <stop offset="100%" stop-color="#542a04"/>
          </radialGradient>

          <g id="linkUnitComp">
            <path d="M 12,0 C 5.37,0 0,6 0,14 L 0,42 C 0,50 5.37,56 12,56 C 18.63,56 24,50 24,42 L 24,14 C 24,6 18.63,0 12,0 Z" fill="url(#ironVertComp)" stroke="#0b1329" stroke-width="1.5"/>
            <path d="M 12,10 C 8.7,10 6,12.5 6,16 L 6,40 C 6,43.5 8.7,46 12,46 C 15.3,46 18,43.5 18,40 L 18,16 C 18,12.5 15.3,10 12,10 Z" fill="#07192f" opacity="0.8"/>
            <rect x="5.5" y="25" width="13" height="6" rx="2" fill="url(#ironHorizComp)" stroke="#0b1329" stroke-width="1"/>
            <line x1="8" y1="27" x2="16" y2="27" stroke="#94a3b8" stroke-width="0.75" opacity="0.8"/>
          </g>

          <g id="linkSideComp">
            <rect x="0" y="0" width="10" height="48" rx="5" fill="url(#ironVertComp)" stroke="#0b1329" stroke-width="1.5"/>
            <line x1="5" y1="4" x2="5" y2="44" stroke="#94a3b8" stroke-width="1.2" opacity="0.7"/>
          </g>
        </defs>

        <g>
          <!-- Chain Column -->
          <g transform="translate(68, 0)">
            <use href="#linkUnitComp" x="0" y="0" />
            <use href="#linkSideComp" x="7" y="36" />
            <use href="#linkUnitComp" x="0" y="68" />
            <use href="#linkSideComp" x="7" y="104" />
            <use href="#linkUnitComp" x="0" y="136" />
            <use href="#linkSideComp" x="7" y="172" />
            <use href="#linkUnitComp" x="0" y="204" />
            <use href="#linkSideComp" x="7" y="240" />
            <use href="#linkUnitComp" x="0" y="272" />
            <use href="#linkSideComp" x="7" y="308" />
            <use href="#linkUnitComp" x="0" y="340" />
          </g>

          <!-- Anchor Assembly -->
          <g transform="translate(80, 380)">
            <circle cx="0" cy="18" r="18" fill="none" stroke="url(#ironVertComp)" stroke-width="8"/>
            <circle cx="0" cy="18" r="18" fill="none" stroke="#07192f" stroke-width="1.5"/>
            <rect x="-14" y="28" width="28" height="6" rx="2" fill="url(#brassStockComp)" stroke="#542a04" stroke-width="1"/>

            <!-- Stock -->
            <rect x="-70" y="44" width="140" height="12" rx="4" fill="url(#brassStockComp)" stroke="#542a04" stroke-width="1.5"/>
            <circle cx="-68" cy="50" r="10" fill="url(#brassFinialComp)" stroke="#542a04" stroke-width="1.2"/>
            <circle cx="68" cy="50" r="10" fill="url(#brassFinialComp)" stroke="#542a04" stroke-width="1.2"/>
            <rect x="-10" y="42" width="20" height="16" rx="2" fill="url(#ironHorizComp)" stroke="#0b1329" stroke-width="1"/>

            <!-- Shank -->
            <path d="M -7,54 L -6,140 L 6,140 L 7,54 Z" fill="url(#ironVertComp)" stroke="#07192f" stroke-width="1.5"/>
            <line x1="0" y1="56" x2="0" y2="138" stroke="#94a3b8" stroke-width="1.5" opacity="0.6"/>

            <!-- Arms & Flukes -->
            <path d="M -68,125 C -60,175 -25,195 0,195 C 25,195 60,175 68,125 C 58,135 30,175 0,175 C -30,175 -58,135 -68,125 Z" fill="url(#ironVertComp)" stroke="#07192f" stroke-width="2"/>
            <polygon points="-68,125 -82,108 -52,128" fill="url(#ironHorizComp)" stroke="#07192f" stroke-width="1.5"/>
            <polygon points="68,125 82,108 52,128" fill="url(#ironHorizComp)" stroke="#07192f" stroke-width="1.5"/>
            <circle cx="0" cy="195" r="7" fill="url(#brassFinialComp)" stroke="#542a04" stroke-width="1"/>
          </g>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .anchor-chain-wrapper {
      display: block;
      overflow: visible;
    }
  `],
})
export class AnchorChainComponent {
  @Input() width = '120px';
  @Input() height = '450px';
}
