import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ALLERGEN_SVG_ICONS, AllergenSvgDef } from './allergen-icons.data';

export interface AllergenDef {
  number: number;
  key: string;
  aliases: string[];
  label: string;
  icon: string;
}

export const OFFICIAL_ALLERGENS: AllergenDef[] = [
  { number: 1,  key: 'pesce',              aliases: ['1', 'pesce', 'fish'],                     label: 'Pesce',           icon: 'fa-solid fa-fish' },
  { number: 2,  key: 'crostacei',          aliases: ['2', 'crostacei', 'crustaceans'],          label: 'Crostacei',       icon: 'fa-solid fa-shrimp' },
  { number: 3,  key: 'molluschi',          aliases: ['3', 'molluschi', 'molluscs'],             label: 'Molluschi',       icon: 'fa-solid fa-clover' },
  { number: 4,  key: 'glutine',            aliases: ['4', 'glutine', 'gluten'],                 label: 'Glutine',         icon: 'fa-solid fa-wheat-awn' },
  { number: 5,  key: 'uova',               aliases: ['5', 'uova', 'eggs'],                      label: 'Uova',            icon: 'fa-solid fa-egg' },
  { number: 6,  key: 'latte',              aliases: ['6', 'latte', 'dairy', 'milk', 'lattosio'], label: 'Latte',         icon: 'fa-solid fa-cheese' },
  { number: 7,  key: 'sedano',             aliases: ['7', 'sedano', 'celery'],                  label: 'Sedano',          icon: 'fa-solid fa-carrot' },
  { number: 8,  key: 'senape',             aliases: ['8', 'senape', 'mustard'],                 label: 'Senape',          icon: 'fa-solid fa-bowl-food' },
  { number: 9,  key: 'sesamo',             aliases: ['9', 'sesamo', 'semi_di_sesamo', 'sesame'], label: 'Sesamo',         icon: 'fa-solid fa-cubes-stacked' },
  { number: 10, key: 'frutta_a_guscio',    aliases: ['10', 'frutta_a_guscio', 'frutta_guscio', 'fruttaguscio', 'nuts'], label: 'Frutta a guscio', icon: 'fa-solid fa-cookie' },
  { number: 11, key: 'arachidi',           aliases: ['11', 'arachidi', 'peanuts'],              label: 'Arachidi',        icon: 'fa-solid fa-seedling' },
  { number: 12, key: 'solfiti',            aliases: ['12', 'solfiti', 'anidride_solforosa', 'sulfites'], label: 'Solfiti', icon: 'fa-solid fa-wine-glass' },
  { number: 13, key: 'lupini',             aliases: ['13', 'lupini', 'lupin'],                  label: 'Lupini',          icon: 'fa-solid fa-circle-dot' },
  { number: 14, key: 'soia',               aliases: ['14', 'soia', 'soy'],                      label: 'Soia',            icon: 'fa-solid fa-leaf' },
];

@Component({
  selector: 'app-allergen-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="allergen-pill" [title]="getAllergenTooltip(allergen)">
      <span class="allergen-num" *ngIf="getAllergenNumber(allergen)">{{ getAllergenNumber(allergen) }}</span>
      <span class="allergen-text">{{ getAllergenLabel(allergen) }}</span>
    </span>
  `,
  styles: [`
    .allergen-pill {
      display: inline-flex;
      align-items: baseline;
      gap: 0.25rem;
      background: transparent;
      border: none;
      font-size: 0.74rem;
      font-weight: 500;
      white-space: nowrap;
      line-height: 1.2;

      .allergen-num {
        font-weight: 700;
        color: var(--dishoom-brass-dark, #945C22);
        font-family: var(--font-body-editorial, sans-serif);
        font-size: 0.74rem;
      }

      .allergen-text {
        font-family: var(--font-body-editorial, sans-serif);
        letter-spacing: 0.01em;
        color: var(--dishoom-ink-espresso, #44403C);
      }
    }
  `],
})
export class AllergenBadgeComponent {
  @Input({ required: true }) allergen!: string | number;

  private findDef(val: string | number): AllergenDef | undefined {
    if (val === undefined || val === null) return undefined;
    const raw = String(val).toLowerCase().trim();
    return OFFICIAL_ALLERGENS.find(
      (def) =>
        def.number.toString() === raw ||
        def.key === raw ||
        def.aliases.includes(raw)
    );
  }

  getAllergenNumber(val: string | number): number | null {
    const def = this.findDef(val);
    return def ? def.number : null;
  }

  getAllergenLabel(val: string | number): string {
    const def = this.findDef(val);
    return def ? def.label : String(val);
  }

  getAllergenSvg(val: string | number): AllergenSvgDef | undefined {
    const def = this.findDef(val);
    if (!def) return undefined;
    return ALLERGEN_SVG_ICONS[def.key];
  }

  getAllergenTooltip(val: string | number): string {
    const def = this.findDef(val);
    if (!def) return String(val);
    return `[${def.number}] ${def.label} — Allergene ufficiale EU`;
  }
}
