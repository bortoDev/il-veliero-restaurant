import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-veliero-ship',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="veliero-ship-wrapper"
      [style.width]="size"
      [style.height]="size"
      [class.mode-gold]="effectiveMode === 'gold' || effectiveMode === 'brass'"
      [class.mode-ivory]="effectiveMode === 'ivory' || effectiveMode === 'white'"
      [class.mode-charcoal]="effectiveMode === 'charcoal' || effectiveMode === 'monochrome'"
      [class.mode-navy]="effectiveMode === 'navy'"
      [class.mode-original]="effectiveMode === 'original' || effectiveMode === 'default'"
      role="img"
      [attr.aria-label]="alt"
    >
      <img
        [src]="imageSrc"
        [alt]="alt"
        [loading]="loading"
        class="veliero-ship-img"
        (error)="onImgError($event)"
      />
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
      transition: filter 0.35s ease, transform 0.35s ease;

      .veliero-ship-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        transition: filter 0.35s ease;
        user-select: none;
        -webkit-user-drag: none;
      }

      &.mode-gold .veliero-ship-img {
        filter: sepia(1) saturate(3.2) hue-rotate(5deg) brightness(1.15) contrast(1.1);
      }

      &.mode-ivory .veliero-ship-img {
        filter: brightness(0) invert(0.96) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
      }

      &.mode-charcoal .veliero-ship-img {
        filter: grayscale(100%) brightness(0.2) contrast(1.4);
      }

      &.mode-navy .veliero-ship-img {
        filter: hue-rotate(215deg) saturate(1.8) brightness(0.85);
      }

      &.mode-original .veliero-ship-img {
        filter: none;
      }
    }
  `],
})
export class VelieroShipComponent {
  @Input() size = '300px';
  @Input() variant: 'ship' | 'emblem' = 'ship';
  @Input() mode: 'default' | 'gold' | 'brass' | 'ivory' | 'white' | 'charcoal' | 'monochrome' | 'navy' | 'original' = 'default';
  @Input() color?: string;
  @Input() alt = 'Incisione autentica del galeone Il Veliero';
  @Input() loading: 'lazy' | 'eager' = 'eager';

  get effectiveMode(): string {
    if (this.color) {
      if (this.color.toLowerCase().includes('gold') || this.color.toLowerCase().includes('brass') || this.color.toLowerCase().includes('dda15e') || this.color.toLowerCase().includes('c58a3e')) {
        return 'gold';
      }
      if (this.color.toLowerCase().includes('ivory') || this.color.toLowerCase().includes('white') || this.color.toLowerCase().includes('faf7f2') || this.color.toLowerCase().includes('ffffff')) {
        return 'ivory';
      }
      if (this.color.toLowerCase().includes('navy') || this.color.toLowerCase().includes('07192f') || this.color.toLowerCase().includes('0d2033')) {
        return 'navy';
      }
      if (this.color.toLowerCase().includes('charcoal') || this.color.toLowerCase().includes('mono') || this.color.toLowerCase().includes('1c1917')) {
        return 'charcoal';
      }
    }
    return this.mode || 'default';
  }

  get imageSrc(): string {
    return this.variant === 'emblem'
      ? 'assets/images/logos/veliero_emblema_trasparente.png'
      : 'assets/images/logos/veliero_nave_autentica.png';
  }

  onImgError(event: any): void {
    // Fallback if PNG is not accessible
    event.target.src = 'assets/images/logos/LogoVeliero.jpg';
  }
}
