import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  VELIERO_SENZA_ONDE_ENGRAVING,
  VELIERO_SENZA_ONDE_SAIL_PARTS,
  VELIERO_ONDE_DIETRO,
  VELIERO_ONDE_DAVANTI,
  VELIERO_WATERLINE_CLIP_PATH,
  VELIERO_WATER_BODY_PATH,
} from './veliero-ship-paths';

export type VelieroShipMode =
  | 'default'
  | 'gold'
  | 'brass'
  | 'ivory'
  | 'white'
  | 'charcoal'
  | 'monochrome'
  | 'navy'
  | 'original'
  | 'grey'
  | 'grigio';

@Component({
  selector: 'app-veliero-ship',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="veliero-ship-wrapper"
      [class.has-waves]="withWaves"
      [style.width]="computedWidth"
      [style.height]="computedHeight"
      role="img"
      [attr.aria-label]="alt"
      [attr.aria-hidden]="ariaHidden ? 'true' : null"
    >
      <!-- Mode 1: With Waves (Hero Scene con onde espanse a tutto respiro e galleggiamento autentico) -->
      <svg
        *ngIf="withWaves; else standardShip"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="260 40 1520 1540"
        class="veliero-ship-svg veliero-ship-with-waves"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <!-- Maschera sfumata di immersione scafo: dissolve dolcemente la chiglia nei flutti senza tagli netti -->
          <linearGradient
            [attr.id]="gradId"
            x1="0"
            y1="1335"
            x2="0"
            y2="1415"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="35%" stop-color="#ffffff" stop-opacity="0.9" />
            <stop offset="70%" stop-color="#ffffff" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </linearGradient>

          <mask
            [attr.id]="maskId"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="2048"
            height="2048"
          >
            <rect x="0" y="0" width="2048" height="1335" fill="#ffffff" />
            <rect x="0" y="1335" width="2048" height="80" [attr.fill]="'url(#' + gradId + ')'" />
            <rect x="0" y="1415" width="2048" height="633" fill="#000000" />
          </mask>
        </defs>

        <!-- 1. Onde Dietro (Orizzonte marino autentico allineato alla linea di galleggiamento) -->
        <g
          class="veliero-waves-back"
          [class.anim-waves-back]="animated"
          [attr.fill]="effectiveWaveColor"
          opacity="0.8"
        >
          <!-- Flutti dietro centro (posizionati alla linea di galleggiamento Y ≈ 1435) -->
          <g transform="translate(0, 435)">
            <path [attr.d]="ondeDietroPath" />
          </g>
          <!-- Flutti dietro estensione sinistra (scia poppa) -->
          <g transform="translate(-260, 448) scale(0.92)">
            <path [attr.d]="ondeDietroPath" opacity="0.75" />
          </g>
          <!-- Flutti dietro estensione destra (scia prua) -->
          <g transform="translate(280, 425) scale(0.92)">
            <path [attr.d]="ondeDietroPath" opacity="0.75" />
          </g>
        </g>

        <!-- 2. Corpo Veliero Completo con Maschera di Immersione Autentica (oscilla con la nave, zero tagli rigidi) -->
        <g
          class="veliero-ship-body"
          [class.anim-ship]="animated"
        >
          <!-- Tutte le vele e bandiere piene e bianche (p2, p3, p4, p5) -->
          <g
            class="veliero-sails"
            [attr.fill]="effectiveSailColor"
            [attr.opacity]="sailOpacity"
            [attr.mask]="'url(#' + maskId + ')'"
          >
            <path *ngFor="let sail of sails" [attr.d]="sail" />
          </g>

          <!-- Incisione Maestra a inchiostro di china scuro -->
          <g
            class="veliero-structure"
            [attr.fill]="effectivePrimaryColor"
            [attr.mask]="'url(#' + maskId + ')'"
          >
            <path [attr.d]="engravingPath" />
          </g>
        </g>

        <!-- 3. Onde in Primo Piano (100% trasparenti, pura incisione spuma marina senza blocchi opachi) -->
        <g
          class="veliero-waves-front"
          [class.anim-waves-front]="animated"
        >
          <!-- Tratti schiuma in primo piano -->
          <g [attr.fill]="effectiveWaveColor">
            <!-- Estensione sinistra: copre la poppa e crea la scia a sinistra -->
            <g
              transform="translate(320, 1395) scale(3.5) translate(6.35,-103.45)"
              opacity="0.82"
            >
              <path [attr.d]="ondeDavantiPath" />
            </g>

            <!-- Corpo centrale onde frontali -->
            <g
              transform="translate(600, 1380) scale(3.7795275591) translate(6.3500058,-103.45207)"
              opacity="0.95"
            >
              <path [attr.d]="ondeDavantiPath" />
            </g>

            <!-- Estensione destra: crea il baffo di prua e scia d'acqua a destra -->
            <g
              transform="translate(900, 1370) scale(3.5) translate(6.35,-103.45)"
              opacity="0.85"
            >
              <path [attr.d]="ondeDavantiPath" />
            </g>
          </g>
        </g>
      </svg>

      <!-- Mode 2: Standard Ship (Compact / Footer / Dove Siamo) -->
      <ng-template #standardShip>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="390 40 1260 1410"
          class="veliero-ship-svg"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          <g
            class="veliero-sails"
            [attr.fill]="effectiveSailColor"
            [attr.opacity]="sailOpacity"
          >
            <path *ngFor="let sail of sails" [attr.d]="sail" />
          </g>

          <g
            class="veliero-structure"
            [attr.fill]="effectivePrimaryColor"
          >
            <path [attr.d]="engravingPath" />
          </g>
        </svg>
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      vertical-align: middle;
      line-height: 0;
    }

    .veliero-ship-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      line-height: 0;
      transition: opacity 0.35s ease, transform 0.35s ease;

      .veliero-ship-svg {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: 1260 / 1410;
        display: block;
        overflow: visible;
        pointer-events: none;
        user-select: none;
        -webkit-user-drag: none;

        &.veliero-ship-with-waves {
          aspect-ratio: 1520 / 1540;
        }
      }

      /* === REFINED HIGH-CLASS NAUTICAL ANIMATIONS === */
      @keyframes shipPitchHeave {
        0% {
          transform: translateY(0px) rotate(0deg);
        }
        25% {
          transform: translateY(-5px) rotate(1.1deg);
        }
        50% {
          transform: translateY(-1px) rotate(-0.5deg);
        }
        75% {
          transform: translateY(4px) rotate(-1.2deg);
        }
        100% {
          transform: translateY(0px) rotate(0deg);
        }
      }

      @keyframes wavesBackDrift {
        0% {
          transform: translateX(0px) translateY(0px);
        }
        50% {
          transform: translateX(-10px) translateY(2px);
        }
        100% {
          transform: translateX(0px) translateY(0px);
        }
      }

      @keyframes wavesFrontDrift {
        0% {
          transform: translateX(0px) translateY(0px);
        }
        50% {
          transform: translateX(10px) translateY(-3px);
        }
        100% {
          transform: translateX(0px) translateY(0px);
        }
      }

      .anim-ship {
        animation: shipPitchHeave 6.5s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        transform-origin: 1040px 1250px;
        will-change: transform;
      }

      .anim-waves-back {
        animation: wavesBackDrift 8s ease-in-out infinite;
        will-change: transform;
      }

      .anim-waves-front {
        animation: wavesFrontDrift 5.5s ease-in-out infinite;
        will-change: transform;
      }

      @media (prefers-reduced-motion: reduce) {
        .anim-ship,
        .anim-waves-back,
        .anim-waves-front {
          animation: none !important;
        }
      }
    }
  `],
})
export class VelieroShipComponent {
  private static instanceCounter = 0;
  readonly instanceId = ++VelieroShipComponent.instanceCounter;
  readonly maskId = `veliero-hull-fade-mask-${this.instanceId}`;
  readonly gradId = `veliero-hull-fade-grad-${this.instanceId}`;

  /** Master woodcut engraving path */
  readonly engravingPath = VELIERO_SENZA_ONDE_ENGRAVING;

  /** Coherent sail & banner canvas fills from VelieroSenzaOnde (all 100% white) */
  readonly sails = VELIERO_SENZA_ONDE_SAIL_PARTS;

  /** Back waves engraving path */
  readonly ondeDietroPath = VELIERO_ONDE_DIETRO;

  /** Front waves engraving path */
  readonly ondeDavantiPath = VELIERO_ONDE_DAVANTI;

  /** Natural extended waterline clipPath to immerse hull into sea */
  readonly waterlineClipPath = VELIERO_WATERLINE_CLIP_PATH;

  /** Dynamic moving water body silhouette path (occludes submerged hull dynamically) */
  readonly waterBodyPath = VELIERO_WATER_BODY_PATH;

  /** Enable wave layers and natural waterline immersion */
  @Input() withWaves = false;

  /** Water body mass fill color override (defaults to deep sea navy) */
  @Input() waterColor?: string;

  /** Enable high-class subtle nautical floating & wave drifting animations */
  @Input() animated = false;

  /** Wave line strokes color (defaults to ivory foam) */
  @Input() waveColor?: string;

  /** Primary structure/hull/rigging/hatch color override */
  @Input() primaryColor?: string;

  /** Sail canvas fill color override */
  @Input() sailColor?: string;

  /** Opacity for sail fills (0 to 1) */
  @Input() sailOpacity: number | string = 1;

  /** Unified shorthand size (e.g. '56px', '90px', '180px', '100%') */
  @Input() size?: string;

  /** Explicit width override */
  @Input() width?: string;

  /** Explicit height override */
  @Input() height?: string;

  /** Preset thematic color mode */
  @Input() mode: VelieroShipMode = 'default';

  /** Backward-compatible alias for primaryColor / legacy mode string */
  @Input() color?: string;

  /** Accessible alternative text */
  @Input() alt = 'Incisione autentica del galeone Il Veliero';

  /** Legacy variant input maintained for backwards compatibility */
  @Input() variant: 'ship' | 'emblem' = 'ship';

  /** Legacy loading input maintained for backwards compatibility */
  @Input() loading: 'lazy' | 'eager' = 'eager';

  /** Hide from screen readers if purely decorative */
  @Input() ariaHidden = false;

  get computedWidth(): string {
    if (this.width) return this.width;
    if (this.size) return this.size;
    return '100%';
  }

  get computedHeight(): string {
    if (this.height) return this.height;
    if (this.size) {
      if (this.size.endsWith('%')) {
        return 'auto';
      }
      return this.size;
    }
    return 'auto';
  }

  get effectiveWaveColor(): string {
    if (this.waveColor) return this.waveColor;
    return 'var(--veliero-wave-color, #D4D4D8)';
  }

  get effectiveWaterColor(): string {
    if (this.waterColor) return this.waterColor;
    return 'var(--veliero-water-color, #1E293B)';
  }

  get effectivePrimaryColor(): string {
    if (this.primaryColor) {
      return this.primaryColor;
    }

    if (this.color) {
      if (this.color.startsWith('#') || this.color.startsWith('rgb') || this.color === 'currentColor') {
        return this.color;
      }
      const lc = this.color.toLowerCase();
      if (lc.includes('gold') || lc.includes('brass')) return '#EAB308';
      if (lc.includes('ivory') || lc.includes('white')) return '#F1F5F9';
      if (lc.includes('navy')) return '#1E293B';
      if (lc.includes('charcoal') || lc.includes('mono')) return '#1E293B';
      return this.color;
    }

    switch (this.mode) {
      case 'gold':
      case 'brass':
        return '#EAB308';
      case 'ivory':
      case 'white':
        return '#F1F5F9';
      case 'navy':
        return '#1E293B';
      case 'charcoal':
      case 'monochrome':
        return '#1E293B';
      case 'grey':
      case 'grigio':
        return '#1E293B';
      case 'original':
      case 'default':
      default:
        return 'currentColor';
    }
  }

  get effectiveSailColor(): string {
    if (this.sailColor) {
      return this.sailColor;
    }

    switch (this.mode) {
      case 'gold':
      case 'brass':
        return '#FFFFFF';
      case 'ivory':
      case 'white':
        return 'rgba(255, 255, 255, 0.95)';
      case 'navy':
        return '#F1F5F9';
      case 'charcoal':
      case 'monochrome':
        return '#FFFFFF';
      case 'grey':
      case 'grigio':
        return '#FFFFFF';
      case 'original':
        return 'transparent';
      case 'default':
      default:
        return '#FFFFFF';
    }
  }
}
