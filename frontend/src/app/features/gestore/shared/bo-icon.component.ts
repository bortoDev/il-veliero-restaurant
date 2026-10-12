import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Icone lineari del back-office, disegnate inline in SVG: non dipendono da
 * Font Awesome, quindi la navigazione resta usabile anche se la CDN non carica.
 */
const ICONS: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  fish: 'M6 12c2-3.5 5-5 8-5 3 0 5.5 2 7 5-1.5 3-4 5-7 5-3 0-6-1.5-8-5zM6 12 2 8.5v7zM17 11h.01',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16M8 7h7',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 11v6M12 7h.01',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  close: 'M6 6l12 12M18 6 6 18',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  logout: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  minus: 'M5 12h14',
  check: 'M5 12l5 5L19 7',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
};

@Component({
  selector: 'bo-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path [attr.d]="path"></path>
    </svg>
  `,
  styles: [`:host { display: inline-flex; line-height: 0; }`],
})
export class BoIconComponent {
  @Input({ required: true }) name!: string;
  @Input() size = 20;

  get path(): string {
    return ICONS[this.name] ?? '';
  }
}
