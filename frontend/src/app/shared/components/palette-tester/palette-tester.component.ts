import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ShipColorPreset {
  id: string;
  name: string;
  subtitle: string;
  borderHex: string;
  sailHex: string;
  hullHex?: string;
  opacity: number;
}

export interface PalettePreset {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  darkHex: string;
  accentHex: string;
  subAccentHex: string;
  vars: { [key: string]: string };
}

@Component({
  selector: 'app-palette-tester',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="palette-tester-wrapper" [class.is-open]="isOpen()">
      <!-- Toggle Floating Pill -->
      <button 
        type="button" 
        class="tester-toggle-btn" 
        (click)="toggleOpen()" 
        aria-label="Apri personalizzatore colori live"
        title="Personalizza i Colori del Veliero e del Sito in tempo reale"
      >
        <span class="icon-palette">⛵</span>
        <span class="btn-text">Personalizza Colori Live</span>
        <i class="fa-solid" [ngClass]="isOpen() ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
      </button>

      <!-- Palette Drawer / Panel -->
      <div class="tester-panel" *ngIf="isOpen()">
        <!-- Panel Header -->
        <div class="panel-header">
          <div class="header-titles">
            <h4 class="panel-title">🎨 Personalizzatore Colori Live</h4>
            <span class="panel-sub">Scegli tra i preset o usa i selettori per vedere il risultato all'istante:</span>
          </div>
          <div class="header-actions">
            <button type="button" class="btn-reset-tester" (click)="resetToDefaults()" title="Ripristina valori originali (Veliero Grigio scuro)">
              ↺ Reset
            </button>
            <button type="button" class="btn-close-panel" (click)="toggleOpen()" aria-label="Chiudi pannello">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="panel-tabs">
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'ship'"
            (click)="setTab('ship')"
          >
            ⛵ Colore Veliero
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'palette'"
            (click)="setTab('palette')"
          >
            🎨 Palette Sito
          </button>
        </div>

        <!-- ================================================================= -->
        <!-- TAB 1: COLORE VELIERO LIVE -->
        <!-- ================================================================= -->
        <div class="tab-content" *ngIf="activeTab() === 'ship'">
          <!-- Live Interactive Pickers -->
          <div class="custom-pickers-box">
            <div class="picker-row">
              <div class="picker-col">
                <label class="picker-label">
                  <span>Bordi / Scafo:</span>
                  <strong class="hex-badge">{{ currentShipBorder() }}</strong>
                </label>
                <div class="picker-input-group">
                  <input 
                    type="color" 
                    class="color-circle-input" 
                    [value]="normalizeHex(currentShipBorder())"
                    (input)="onBorderInput($event)"
                  />
                  <input 
                    type="text" 
                    class="hex-text-input" 
                    [value]="currentShipBorder()"
                    (input)="onBorderTextInput($event)"
                    placeholder="#FAF7F2"
                  />
                </div>
              </div>

              <div class="picker-col">
                <label class="picker-label">
                  <span>Campitura Vele:</span>
                  <strong class="hex-badge">{{ currentShipSail() }}</strong>
                </label>
                <div class="picker-input-group">
                  <input 
                    type="color" 
                    class="color-circle-input" 
                    [value]="normalizeHex(currentShipSail())"
                    (input)="onSailInput($event)"
                  />
                  <input 
                    type="text" 
                    class="hex-text-input" 
                    [value]="currentShipSail()"
                    (input)="onSailTextInput($event)"
                    placeholder="#FAF7F2"
                  />
                </div>
              </div>
            </div>

            <!-- Opacity Range Slider -->
            <div class="opacity-slider-wrap">
              <div class="slider-header">
                <span>Opacità Vele:</span>
                <strong>{{ (currentShipOpacity() * 100).toFixed(0) }}%</strong>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                class="opacity-range"
                [value]="currentShipOpacity()"
                (input)="onOpacityInput($event)"
              />
            </div>
          </div>

          <!-- Presets Section -->
          <div class="section-title-wrap">
            <span class="section-tag">OPZIONI PRESET VELIERO</span>
          </div>

          <div class="ship-presets-grid">
            <button
              *ngFor="let sp of shipPresets"
              type="button"
              class="ship-preset-card"
              [class.active]="isShipPresetActive(sp)"
              (click)="applyShipPreset(sp)"
            >
              <div class="preset-preview-swatch">
                <span class="swatch-border" [style.background-color]="sp.borderHex"></span>
                <span class="swatch-sail" [style.background-color]="sp.sailHex" [style.opacity]="sp.opacity"></span>
              </div>
              <div class="preset-details">
                <strong class="preset-title">{{ sp.name }}</strong>
                <small class="preset-sub">{{ sp.subtitle }}</small>
              </div>
              <span class="preset-active-pill" *ngIf="isShipPresetActive(sp)">✓ Attivo</span>
            </button>
          </div>
        </div>

        <!-- ================================================================= -->
        <!-- TAB 2: PALETTE COMPLETA SITO -->
        <!-- ================================================================= -->
        <div class="tab-content" *ngIf="activeTab() === 'palette'">
          <div class="palettes-list">
            <button
              *ngFor="let p of presets"
              type="button"
              class="palette-card"
              [class.active]="activePalette().id === p.id"
              (click)="selectPalette(p)"
            >
              <div class="palette-swatches">
                <span class="swatch dark" [style.background-color]="p.darkHex"></span>
                <span class="swatch accent" [style.background-color]="p.accentHex"></span>
                <span class="swatch sub" [style.background-color]="p.subAccentHex"></span>
                <span class="swatch paper"></span>
              </div>
              <div class="palette-info">
                <div class="palette-badge-row">
                  <span class="palette-badge">{{ p.badge }}</span>
                  <span class="active-indicator" *ngIf="activePalette().id === p.id">Attiva</span>
                </div>
                <strong class="palette-name">{{ p.name }}</strong>
                <small class="palette-desc">{{ p.subtitle }}</small>
              </div>
            </button>
          </div>
        </div>

        <!-- Panel Footer -->
        <div class="panel-footer">
          <small class="footer-note">
            ⚡ Tutte le modifiche sono <strong>immediatamente visibili dal vivo</strong> e vengono salvate nel browser.
          </small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .palette-tester-wrapper {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      font-family: var(--font-body-editorial, 'Plus Jakarta Sans', sans-serif);

      .tester-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.75rem 1.25rem;
        background: #0B2545;
        color: #FAF7F2;
        border: 1px solid rgba(0, 150, 199, 0.6);
        border-radius: 999px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55), 0 0 16px rgba(0, 150, 199, 0.35);
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        transition: all 0.25s ease;

        .icon-palette {
          font-size: 1.15rem;
        }

        i {
          font-size: 0.75rem;
          color: #0096C7;
          transition: transform 0.25s ease;
        }

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.65), 0 0 22px rgba(0, 150, 199, 0.6);
          border-color: #0096C7;
          background: #143666;
        }
      }

      .tester-panel {
        position: absolute;
        bottom: 60px;
        right: 0;
        width: 430px;
        max-width: calc(100vw - 32px);
        background: rgba(11, 37, 69, 0.98);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 150, 199, 0.45);
        border-radius: 16px;
        padding: 1.25rem;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75), 0 0 25px rgba(0, 150, 199, 0.25);
        color: #FAF7F2;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        animation: panelSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.65rem;

          .panel-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: #FAF7F2;
            margin: 0 0 0.2rem 0;
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }

          .panel-sub {
            font-size: 0.74rem;
            color: #DDD3C4;
            display: block;
            line-height: 1.35;
          }

          .header-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .btn-reset-tester {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #FAF7F2;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 0.25rem 0.6rem;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              background: #0096C7;
              border-color: #0096C7;
              color: #FFFFFF;
            }
          }

          .btn-close-panel {
            background: transparent;
            border: none;
            color: #A8A29E;
            cursor: pointer;
            font-size: 1.1rem;
            padding: 0.2rem;
            transition: color 0.2s ease;

            &:hover {
              color: #FFFFFF;
            }
          }
        }

        .panel-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          background: rgba(0, 0, 0, 0.25);
          padding: 4px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);

          .tab-btn {
            background: transparent;
            border: none;
            color: #DDD3C4;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              color: #FFFFFF;
              background: rgba(255, 255, 255, 0.06);
            }

            &.active {
              background: #0096C7;
              color: #FFFFFF;
              box-shadow: 0 2px 8px rgba(0, 150, 199, 0.4);
            }
          }
        }

        .tab-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 420px;
          overflow-y: auto;
          padding-right: 0.25rem;

          &::-webkit-scrollbar {
            width: 5px;
          }
          &::-webkit-scrollbar-thumb {
            background: rgba(0, 150, 199, 0.4);
            border-radius: 10px;
          }
        }

        .custom-pickers-box {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(0, 150, 199, 0.3);
          border-radius: 10px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;

          .picker-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }

          .picker-col {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;

            .picker-label {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 0.72rem;
              color: #DDD3C4;
              font-weight: 600;

              .hex-badge {
                font-family: monospace;
                font-size: 0.72rem;
                background: rgba(255, 255, 255, 0.12);
                padding: 1px 5px;
                border-radius: 4px;
                color: #FFFFFF;
              }
            }

            .picker-input-group {
              display: flex;
              align-items: center;
              gap: 6px;
              background: rgba(255, 255, 255, 0.06);
              border: 1px solid rgba(255, 255, 255, 0.12);
              border-radius: 6px;
              padding: 4px 6px;

              .color-circle-input {
                -webkit-appearance: none;
                border: none;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                cursor: pointer;
                background: none;
                padding: 0;

                &::-webkit-color-swatch-wrapper {
                  padding: 0;
                }
                &::-webkit-color-swatch {
                  border: 1px solid rgba(255, 255, 255, 0.4);
                  border-radius: 50%;
                }
              }

              .hex-text-input {
                background: transparent;
                border: none;
                color: #FFFFFF;
                font-family: monospace;
                font-size: 0.8rem;
                font-weight: 700;
                width: 100%;
                outline: none;
              }
            }
          }

          .opacity-slider-wrap {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 0.5rem;

            .slider-header {
              display: flex;
              justify-content: space-between;
              font-size: 0.72rem;
              color: #DDD3C4;
              font-weight: 600;

              strong {
                color: #0096C7;
              }
            }

            .opacity-range {
              width: 100%;
              accent-color: #0096C7;
              cursor: pointer;
            }
          }
        }

        .section-title-wrap {
          display: flex;
          align-items: center;
          margin-top: 0.2rem;

          .section-tag {
            font-size: 0.65rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            color: #0096C7;
            text-transform: uppercase;
          }
        }

        .ship-presets-grid {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;

          .ship-preset-card {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.55rem 0.75rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s ease;
            width: 100%;

            &:hover {
              background: rgba(0, 150, 199, 0.12);
              border-color: rgba(0, 150, 199, 0.45);
              transform: translateX(2px);
            }

            &.active {
              background: rgba(0, 150, 199, 0.2);
              border-color: #0096C7;
              box-shadow: 0 0 12px rgba(0, 150, 199, 0.35);
            }

            .preset-preview-swatch {
              position: relative;
              width: 32px;
              height: 32px;
              border-radius: 6px;
              overflow: hidden;
              border: 1px solid rgba(255, 255, 255, 0.2);
              flex-shrink: 0;

              .swatch-border {
                position: absolute;
                inset: 0;
                display: block;
              }

              .swatch-sail {
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 16px;
                height: 16px;
                border-radius: 3px;
                border: 1px solid rgba(0, 0, 0, 0.3);
                display: block;
              }
            }

            .preset-details {
              display: flex;
              flex-direction: column;
              gap: 0.1rem;
              flex: 1;

              .preset-title {
                font-size: 0.8rem;
                font-weight: 700;
                color: #FFFFFF;
              }

              .preset-sub {
                font-size: 0.68rem;
                color: #A8A29E;
                line-height: 1.2;
              }
            }

            .preset-active-pill {
              font-size: 0.6rem;
              background: #0096C7;
              color: #FFFFFF;
              font-weight: 800;
              padding: 0.15rem 0.45rem;
              border-radius: 999px;
              text-transform: uppercase;
              flex-shrink: 0;
            }
          }
        }

        .palettes-list {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;

          .palette-card {
            display: flex;
            align-items: center;
            gap: 0.85rem;
            padding: 0.65rem 0.75rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s ease;
            width: 100%;

            &:hover {
              background: rgba(255, 255, 255, 0.08);
              border-color: rgba(0, 150, 199, 0.4);
              transform: translateX(2px);
            }

            &.active {
              background: rgba(0, 150, 199, 0.16);
              border-color: #0096C7;
              box-shadow: 0 0 14px rgba(0, 150, 199, 0.3);
            }

            .palette-swatches {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2px;
              width: 34px;
              height: 34px;
              border-radius: 6px;
              overflow: hidden;
              flex-shrink: 0;
              border: 1px solid rgba(255, 255, 255, 0.15);

              .swatch {
                width: 100%;
                height: 100%;
                display: block;

                &.paper {
                  background-color: #FAF7F2;
                }
              }
            }

            .palette-info {
              display: flex;
              flex-direction: column;
              gap: 0.1rem;
              flex: 1;

              .palette-badge-row {
                display: flex;
                align-items: center;
                gap: 0.5rem;

                .palette-badge {
                  font-size: 0.62rem;
                  font-weight: 700;
                  text-transform: uppercase;
                  color: #0096C7;
                  letter-spacing: 0.06em;
                }

                .active-indicator {
                  font-size: 0.58rem;
                  background: #22c55e;
                  color: #052e16;
                  font-weight: 800;
                  padding: 0.05rem 0.35rem;
                  border-radius: 999px;
                  text-transform: uppercase;
                }
              }

              .palette-name {
                font-size: 0.8rem;
                font-weight: 700;
                color: #FFFFFF;
              }

              .palette-desc {
                font-size: 0.68rem;
                color: #A8A29E;
                line-height: 1.2;
              }
            }
          }
        }

        .panel-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 0.4rem;

          .footer-note {
            font-size: 0.68rem;
            color: #DDD3C4;
            line-height: 1.35;
          }
        }
      }
    }

    @keyframes panelSlideUp {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `],
})
export class PaletteTesterComponent implements OnInit {
  public isOpen = signal(false);
  public activeTab = signal<'ship' | 'palette'>('ship');

  // Live Ship Color Signals
  public currentShipBorder = signal<string>('#1E293B');
  public currentShipSail = signal<string>('#FFFFFF');
  public currentShipOpacity = signal<number>(1);

  // Ship Color Presets
  public shipPresets: ShipColorPreset[] = [
    {
      id: 'ship-grigio-bianco',
      name: '⚓ Veliero Grigio (Scafo Grigio & Vele Bianche)',
      subtitle: 'Asset autentico: scafo grigio neutro (#D4D4D8), vele bianche e incisione a china',
      borderHex: '#1E293B',
      sailHex: '#FFFFFF',
      hullHex: '#D4D4D8',
      opacity: 1,
    },
    {
      id: 'ship-grigio-ivory',
      name: '🏛️ Veliero Grigio & Incisione Avorio',
      subtitle: 'Scafo grigio (#D4D4D8) + vele bianche (#FFFFFF) + linee avorio (#F1F5F9)',
      borderHex: '#F1F5F9',
      sailHex: '#FFFFFF',
      hullHex: '#D4D4D8',
      opacity: 1,
    },
    {
      id: 'ship-ivory-carta',
      name: '🏛️ Avorio & Bianco Carta',
      subtitle: 'Incisione calda in color carta (#F1F5F9 / #F1F5F9)',
      borderHex: '#F1F5F9',
      sailHex: '#F1F5F9',
      opacity: 1,
    },
    {
      id: 'ship-celeste-laguna',
      name: '🌊 Celeste Laguna Ufficiale',
      subtitle: 'Azzurro istituzionale del brand (#0EA5E9 / #F1F5F9)',
      borderHex: '#0EA5E9',
      sailHex: '#F1F5F9',
      opacity: 1,
    },
    {
      id: 'ship-celeste-cielo',
      name: '💎 Celeste Cielo / Acqua Chiaro',
      subtitle: 'Tonalità pastello brillante (#BAE6FD / #F1F5F9)',
      borderHex: '#BAE6FD',
      sailHex: '#F1F5F9',
      opacity: 1,
    },
    {
      id: 'ship-argento-platino',
      name: '⚓ Argento Platino Nautico',
      subtitle: 'Tonalità metallica neutra e sobria (#E2E8F0 / #F1F5F9)',
      borderHex: '#E2E8F0',
      sailHex: '#F1F5F9',
      opacity: 1,
    },
    {
      id: 'ship-nero-carbone',
      name: '🌑 Nero Acquaforte Inciso',
      subtitle: 'Incisione originale a china (#1E293B / #F1F5F9)',
      borderHex: '#1E293B',
      sailHex: '#F1F5F9',
      opacity: 1,
    },
    {
      id: 'ship-ottone-satinato',
      name: '🪙 Ottone Satinato Dishoom',
      subtitle: 'Metallo d\'epoca dorato vintage (#C58A3E / #F1F5F9)',
      borderHex: '#C58A3E',
      sailHex: '#F1F5F9',
      opacity: 1,
    },
    {
      id: 'ship-oro-zecchino',
      name: '👑 Oro Zecchino Delicato',
      subtitle: 'Accento solare prestigioso (#EAB308 / #F1F5F9)',
      borderHex: '#EAB308',
      sailHex: '#F1F5F9',
      opacity: 1,
    },
    {
      id: 'ship-rame-brunito',
      name: '🪵 Rame & Cuoio Brunito',
      subtitle: 'Caldo tono ligneo marinaresco (#A86838 / #F1F5F9)',
      borderHex: '#A86838',
      sailHex: '#F1F5F9',
      opacity: 1,
    },
    {
      id: 'ship-pure-white',
      name: '🤍 Bianco Puro & Vele Luminose',
      subtitle: 'Massima nitidezza e contrasto (#FFFFFF / #FFFFFF)',
      borderHex: '#FFFFFF',
      sailHex: '#FFFFFF',
      opacity: 0.95,
    },
  ];

  // Site Palette Presets
  public presets: PalettePreset[] = [
    {
      id: 'palette-official',
      badge: 'Palette Ufficiale',
      name: '⛵ Slate & Azzurro Adriatico',
      subtitle: 'Ardesia (#1E293B) + Azzurro Oceano (#0EA5E9) + Oro (#EAB308)',
      darkHex: '#1E293B',
      accentHex: '#0EA5E9',
      subAccentHex: '#EAB308',
      vars: {
        '--bg-navy-dark': '#1E293B',
        '--bg-navy-deep': '#0F172A',
        '--dishoom-bg-navy-dark': '#1E293B',
        '--dishoom-bg-navy-deep': '#0F172A',
        '--dishoom-bg-navy-card': '#0F172A',
        '--dishoom-brass': '#0EA5E9',
        '--dishoom-brass-dark': '#0284C7',
        '--dishoom-brass-light': '#BAE6FD',
        '--dishoom-status-warning': '#EAB308',
        '--dishoom-border-navy-brass': 'rgba(14, 165, 233, 0.45)',
      },
    },
    {
      id: 'palette-f',
      badge: 'Palette F',
      name: '🌊 Logo Ufficiale — Oltremare & Ceruleo Chiaro',
      subtitle: 'Blu Oltremare (#081C36) + Ceruleo Chiaro (#48CAE4)',
      darkHex: '#081C36',
      accentHex: '#48CAE4',
      subAccentHex: '#C58A3E',
      vars: {
        '--dishoom-bg-navy-dark': '#081C36',
        '--dishoom-bg-navy-deep': '#0F2C54',
        '--dishoom-bg-navy-card': '#06162B',
        '--dishoom-brass': '#48CAE4',
        '--dishoom-brass-dark': '#0096C7',
        '--dishoom-brass-light': '#E0FBFC',
        '--dishoom-status-warning': '#C58A3E',
        '--dishoom-border-navy-brass': 'rgba(72, 202, 228, 0.45)',
      },
    },
    {
      id: 'palette-a',
      badge: 'Palette A',
      name: '🍕 Vulcanica & Forno a Legna',
      subtitle: 'Carbone Vulcanico (#141416) + Oro Zecchino (#D4AF37)',
      darkHex: '#141416',
      accentHex: '#D4AF37',
      subAccentHex: '#C3643B',
      vars: {
        '--dishoom-bg-navy-dark': '#141416',
        '--dishoom-bg-navy-deep': '#1C1C1F',
        '--dishoom-bg-navy-card': '#18181A',
        '--dishoom-brass': '#D4AF37',
        '--dishoom-brass-dark': '#A98622',
        '--dishoom-brass-light': '#F3E5AB',
        '--dishoom-status-warning': '#C3643B',
        '--dishoom-border-navy-brass': 'rgba(212, 175, 55, 0.35)',
      },
    },
    {
      id: 'palette-default',
      badge: 'Originale',
      name: '🌙 Blu Notte Dishoom',
      subtitle: 'Blu Notte (#07192F) + Ottone Brunito (#C58A3E)',
      darkHex: '#07192F',
      accentHex: '#C58A3E',
      subAccentHex: '#B8C7D9',
      vars: {
        '--dishoom-bg-navy-dark': '#07192F',
        '--dishoom-bg-navy-deep': '#0D2033',
        '--dishoom-bg-navy-card': '#0B1B2B',
        '--dishoom-brass': '#C58A3E',
        '--dishoom-brass-dark': '#945C22',
        '--dishoom-brass-light': '#EBD8B8',
        '--dishoom-status-warning': '#C07018',
        '--dishoom-border-navy-brass': 'rgba(197, 138, 62, 0.35)',
      },
    },
  ];

  public activePalette = signal<PalettePreset>(this.presets[0]);

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      // Restore Ship Colors from localStorage if available
      const savedBorder = localStorage.getItem('veliero_ship_border');
      const savedSail = localStorage.getItem('veliero_ship_sail');
      const savedHull = localStorage.getItem('veliero_ship_hull');
      const savedOpacity = localStorage.getItem('veliero_ship_opacity');

      const border = savedBorder || '#1E293B';
      const sail = savedSail || '#FFFFFF';
      const hull = savedHull || '#D4D4D8';
      const opacity = savedOpacity ? parseFloat(savedOpacity) : 1;

      this.currentShipBorder.set(border);
      this.currentShipSail.set(sail);
      this.currentShipOpacity.set(opacity);
      this.applyShipVars(border, sail, opacity, false, hull);

      // Restore Site Palette
      const savedId = localStorage.getItem('veliero_active_palette');
      const found = this.presets.find((p) => p.id === savedId);
      const paletteToApply = found || this.presets[0];
      this.selectPalette(paletteToApply, false);
    }
  }

  toggleOpen(): void {
    this.isOpen.update((v) => !v);
  }

  setTab(tab: 'ship' | 'palette'): void {
    this.activeTab.set(tab);
  }

  // Live Ship Color Handlers
  onBorderInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.currentShipBorder.set(val);
    this.applyShipVars(val, this.currentShipSail(), this.currentShipOpacity(), true);
  }

  onBorderTextInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.currentShipBorder.set(val);
    if (val.length >= 4) {
      this.applyShipVars(val, this.currentShipSail(), this.currentShipOpacity(), true);
    }
  }

  onSailInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.currentShipSail.set(val);
    this.applyShipVars(this.currentShipBorder(), val, this.currentShipOpacity(), true);
  }

  onSailTextInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.currentShipSail.set(val);
    if (val.length >= 4) {
      this.applyShipVars(this.currentShipBorder(), val, this.currentShipOpacity(), true);
    }
  }

  onOpacityInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.currentShipOpacity.set(val);
    this.applyShipVars(this.currentShipBorder(), this.currentShipSail(), val, true);
  }

  applyShipPreset(preset: ShipColorPreset): void {
    this.currentShipBorder.set(preset.borderHex);
    this.currentShipSail.set(preset.sailHex);
    this.currentShipOpacity.set(preset.opacity);
    this.applyShipVars(preset.borderHex, preset.sailHex, preset.opacity, true, preset.hullHex);
  }

  isShipPresetActive(preset: ShipColorPreset): boolean {
    return (
      this.currentShipBorder().toLowerCase() === preset.borderHex.toLowerCase() &&
      this.currentShipSail().toLowerCase() === preset.sailHex.toLowerCase() &&
      Math.abs(this.currentShipOpacity() - preset.opacity) < 0.05
    );
  }

  applyShipVars(border: string, sail: string, opacity: number, save = true, hull?: string): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--veliero-ship-primary', border);
      root.style.setProperty('--veliero-ship-sail', sail);
      root.style.setProperty('--veliero-ship-hull', hull || sail);
      root.style.setProperty('--veliero-ship-opacity', opacity.toString());

      if (save) {
        localStorage.setItem('veliero_ship_border', border);
        localStorage.setItem('veliero_ship_sail', sail);
        if (hull) {
          localStorage.setItem('veliero_ship_hull', hull);
        } else {
          localStorage.removeItem('veliero_ship_hull');
        }
        localStorage.setItem('veliero_ship_opacity', opacity.toString());
      }
    }
  }

  selectPalette(preset: PalettePreset, save = true): void {
    this.activePalette.set(preset);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(preset.vars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
      if (save) {
        localStorage.setItem('veliero_active_palette', preset.id);
      }
    }
  }

  resetToDefaults(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('veliero_ship_border');
      localStorage.removeItem('veliero_ship_sail');
      localStorage.removeItem('veliero_ship_hull');
      localStorage.removeItem('veliero_ship_opacity');
      localStorage.removeItem('veliero_active_palette');

      this.currentShipBorder.set('#1E293B');
      this.currentShipSail.set('#FFFFFF');
      this.currentShipOpacity.set(1);
      this.applyShipVars('#1E293B', '#FFFFFF', 1, false, '#D4D4D8');
      this.selectPalette(this.presets[0], false);
    }
  }

  normalizeHex(color: string): string {
    if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
      if (color.length === 4) {
        return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
      }
      return color;
    }
    return '#F1F5F9';
  }
}
