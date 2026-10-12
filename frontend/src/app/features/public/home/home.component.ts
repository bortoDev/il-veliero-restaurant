import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VideoCardMediaComponent } from '../../../shared/components/video-card/video-card.component';
import { VelieroShipComponent } from '../../../shared/components/svg-icons';
import { AnimationService } from '../../../core/services/animation.service';
import gsap from 'gsap';

export interface ShowcaseCardItem {
  id: string;
  title: string;
  subtitle: string;
  routerLink: string;
  ariaLabel: string;
  posterSrc: string;
  webmSrc?: string;
  mp4Src?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    VideoCardMediaComponent,
    VelieroShipComponent,
  ],
  template: `
    <div class="home-page">
      <!-- HERO SECTION with Scroll-Expansion Video & Veliero Anchor -->
      <section class="hero-morph-wrapper" #heroWrapper>
        <!-- Full-Bleed Video Surface (Clipped via GPU clip-path to videoSlotEl) -->
        <div class="hero-video-fullbleed" #videoWallEl>
          <video
            #heroVideoEl
            class="video-wall-media"
            autoplay
            [muted]="true"
            muted
            loop
            playsinline
            preload="auto"
            poster="assets/videos/hero-poster.jpg"
            (loadedmetadata)="onHeroVideoLoaded()"
            (canplay)="onHeroVideoCanPlay()"
          >
            <source src="assets/videos/Temp_home_Sito_IlVeliero_desktop.mp4" type="video/mp4" />
            <source src="assets/videos/Temp_home_Sito_IlVeliero_desktop.webm" type="video/webm" />
          </video>
          <img
            src="assets/videos/hero-poster.jpg"
            alt="Il Veliero Experience"
            class="video-wall-fallback"
            (error)="onHeroPosterError($event)"
          />
          <div class="video-scrim"></div>
        </div>

        <div class="container hero-layout">
          <!-- Left Column: Veliero Ship Alone -->
          <div class="hero-left-col" #heroLeftCol>
            <div class="hero-ship-container" #heroShipEl>
              <app-veliero-ship
                size="100%"
                [withWaves]="true"
                [animated]="true"
                [primaryColor]="'#bc6c25'"
                [waveColor]="'var(--veliero-wave-color, #D4D4D8)'"
                [sailColor]="'var(--veliero-ship-sail, #FFFFFF)'"
                [sailOpacity]="'0.95'"
                alt="Incisione autentica del galeone Il Veliero"
              ></app-veliero-ship>
            </div>
          </div>

          <!-- Right Column: Video Slot Anchor with Fixed Quote -->
          <div class="hero-right-col" #heroRightCol>
            <div class="video-slot-anchor" #videoSlotEl></div>

            <!-- Fixed Non-Scaling Poetic Quote Overlay & Mobile Boat -->
            <div class="video-quote-overlay" #heroQuoteEl>
              <div class="quote-content-wrap">
                <h2 class="video-wall-quote">
                  "Ti aspettiamo a Bassano del Grappa per farti vivere un'esperienza tra il pescato fresco dell'Adriatico e la pizza del Campione del Mondo."
                </h2>
                <!-- Mobile boat under the quote -->
                <div class="hero-mobile-ship" #heroMobileShipEl>
                  <app-veliero-ship
                    size="100%"
                    [withWaves]="true"
                    [animated]="true"
                    [primaryColor]="'#bc6c25'"
                    [waveColor]="'var(--veliero-wave-color, #D4D4D8)'"
                    [sailColor]="'var(--veliero-ship-sail, #FFFFFF)'"
                    [sailOpacity]="'0.95'"
                    alt="Incisione autentica del galeone Il Veliero"
                  ></app-veliero-ship>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CHEF & WORLD CHAMPION EDITORIAL SECTION -->
      <section class="section chef-intro-section">
        <div class="container">
          <div class="editorial-header">
            <h2 class="editorial-main-title dishoom-title-layout" #editorialTitleEl>
              <span class="editorial-line-primary">
                @for (word of firstLineWords; track $index) {
                  <span class="reveal-word">{{ word }}</span>{{ ' ' }}
                }
              </span>
              <span class="editorial-line-indent">
                @for (word of secondLineWords; track $index) {
                  <span class="reveal-word">{{ word }}</span>{{ ' ' }}
                }
              </span>
            </h2>
          </div>

          <!-- Editorial Asymmetrical 2-Column Photo & Story Grid -->
          <div class="editorial-grid">
            <!-- Left Editorial Photo -->
            <div class="editorial-col-left">
              <div class="editorial-photo-frame">
                <img
                  src="assets/images/locale/premiazione-campione.jpg"
                  alt="La premiazione del Campionato del Mondo della Pizza"
                  loading="lazy"
                  class="editorial-main-img"
                  (error)="onChampionLogoError($event)"
                />
              </div>
            </div>

            <!-- Right Editorial Story & Secondary Photo -->
            <div class="editorial-col-right">
              <div class="editorial-text-flow">
                <p class="editorial-lead">
                  Tutto nasce dalla ricerca quotidiana dell'eccellenza. Selezioniamo il pescato fresco dai mercati ittici dell'Adriatico, mentre in pizzeria gli impasti a lievitazione naturale oltre 48 ore danno vita alla celebre pizza del <strong>Campione del Mondo</strong>.
                </p>
                <p class="editorial-body">
                  Tra le sale accoglienti e il profumo del forno a legna a 450°C, ogni ospite ritrova il calore autentico della tradizione gastronomica veneta.
                </p>
              </div>

              <div class="editorial-side-photo-wrap">
                <div class="editorial-photo-frame side-frame">
                  <img
                    src="assets/images/locale/sala-principale.jpg"
                    alt="La sala del ristorante Il Veliero apparecchiata"
                    loading="lazy"
                    class="editorial-side-img"
                    (error)="onChampionLogoError($event)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3 SHOWCASE CARDS (MENÙ, PESCATO, DOVE SIAMO) -->
      <section class="section cards-showcase-section">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow-caps">PASSIONE, MAESTRIA & ACCOGLIENZA</span>
            <h2 class="section-title">
              Menù, Pescato del Giorno & Dove Siamo
            </h2>
          </div>

          <div class="archive-cards-grid">
            @for (card of showcaseCards; track card.id) {
              <a
                [routerLink]="card.routerLink"
                class="veliero-large-card"
                [attr.aria-label]="card.ariaLabel"
                (mouseenter)="cardVideo.playVideo()"
                (mouseleave)="cardVideo.pauseVideo()"
                (focusin)="cardVideo.playVideo()"
                (focusout)="cardVideo.pauseVideo()"
              >
                <div class="card-media-wrapper">
                  <app-video-card-media
                    #cardVideo
                    [mp4Src]="card.mp4Src || ''"
                    [webmSrc]="card.webmSrc || ''"
                    [posterSrc]="card.posterSrc"
                    [title]="card.title"
                  ></app-video-card-media>
                </div>
                <div class="card-gradient-overlay"></div>
                <div class="veliero-card-plaque">
                  <h3 class="plaque-title">{{ card.title }}</h3>
                  <p class="plaque-subtitle">{{ card.subtitle }}</p>
                  <div class="plaque-arrow-wrap">
                    <svg class="feather-arrow" viewBox="0 0 52 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <line x1="3" y1="6" x2="48" y2="6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                      <path d="M3 2.5L7 6L3 9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M7 2.5L11 6L7 9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M11 2.5L15 6L11 9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                      <polygon points="42,2.5 49,6 42,9.5" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </a>
            }
          </div>
        </div>
      </section>

      <!-- OPENING HOURS & DIRECT BOOKING HIGHLIGHT -->
      <section class="section hours-info-section">
        <div class="container">
          <div class="hours-editorial-grid">
            <!-- Left Column: Open Frameless Editorial Hours -->
            <div class="hours-col-left">
              <span class="eyebrow-caps">ORARI DEL SERVIZIO</span>
              <h2 class="hours-main-title">Cucina & Pizzeria</h2>

              <div class="schedule-editorial-list">
                <div class="schedule-row">
                  <span class="service-label">Pranzo</span>
                  <span class="service-time">12:00 – 14:00</span>
                </div>
                <div class="schedule-row">
                  <span class="service-label">Cena</span>
                  <span class="service-time">19:00 – 22:00</span>
                </div>
                <div class="schedule-row schedule-closed">
                  <span class="service-label">Riposo settimanale</span>
                  <span class="service-time">Mercoledì chiuso</span>
                </div>
              </div>
            </div>

            <!-- Right Column: Dark Booking Block -->
            <div class="hours-col-right">
              <div class="booking-dark-panel">
                <h3 class="booking-title">Prenota il Tuo Tavolo</h3>
                <p class="booking-note">Consigliata la prenotazione per il fine settimana.</p>
                <div class="cta-call-group">
                  <a href="tel:0424500200" class="btn-call" aria-label="Chiama il Ristorante Il Veliero al numero 0424 500 200">
                    <i class="fa-solid fa-phone"></i>
                    <span>0424 500 200</span>
                  </a>
                </div>
                <span class="direct-address">
                  <i class="fa-solid fa-location-dot"></i>
                  Via G. Fattori 7, Bassano del Grappa (VI)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      position: relative;
      overflow-x: hidden;
      background-color: var(--bg-primary, #F1F5F9);
    }

    /* Hero Section with Deep Slate Navy Background & Scroll Expansion */
    .hero-morph-wrapper {
      background: linear-gradient(180deg, var(--bg-navy-dark, #1E293B) 0%, var(--bg-navy-deep, #0F172A) 100%);
      color: #ffffff;
      margin-top: -82px;
      padding: calc(82px + 2.5rem) 0 4.5rem;
      position: relative;
      overflow: hidden;
      border-bottom: none;
      box-shadow: none;
      height: 100vh;
      height: 100dvh;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.4s ease;

      .hero-video-fullbleed {
        position: absolute;
        z-index: 1;
        overflow: hidden;
        pointer-events: none;
        will-change: top, left, width, height, border-radius;

        .video-wall-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
        }

        .video-wall-fallback {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
          opacity: 0;
        }

        .video-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(30, 41, 59, 0.35) 0%,
            rgba(15, 23, 42, 0.65) 50%,
            rgba(15, 23, 42, 0.88) 100%
          );
          pointer-events: none;
        }
      }

      /* Mobile-First & Portrait Layout (Default for phones, tablets & portrait devices) */
      .hero-layout {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 0 16px;
        margin: 0 auto;
        max-width: 680px;
        position: relative;
        z-index: 2;
      }

      .hero-left-col {
        display: none;
      }

      .hero-right-col {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        .video-slot-anchor {
          position: relative;
          width: calc(100% - 32px);
          max-width: 420px;
          height: clamp(500px, 72dvh, 660px);
          aspect-ratio: auto;
          border-radius: 14px;
          box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.7);
          margin: 0 auto;
          pointer-events: none;
          transition: box-shadow 0.3s ease;

          /* Tablet Portrait (iPad Mini, Surface Pro, iPad Pro 13) */
          @media (min-width: 641px) {
            width: min(85vw, 640px);
            max-width: 640px;
            height: clamp(560px, 66dvh, 780px);
          }
        }

        .video-quote-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
          z-index: 20;
          pointer-events: none;
          text-align: center;
          will-change: transform;
          transform-origin: center center;

          .quote-content-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: calc(100% - 32px);
            max-width: 380px;
            margin: 0 auto;
            padding: 0;

            @media (min-width: 641px) {
              max-width: 540px;
            }
          }

          .video-wall-quote {
            font-size: clamp(1.2rem, 4.4vw, 1.55rem);
            font-style: italic;
            font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
            color: var(--text-inverse, #F1F5F9);
            line-height: 1.38;
            max-width: 100%;
            width: 100%;
            text-shadow:
              0 4px 24px rgba(0, 0, 0, 1),
              0 2px 8px rgba(0, 0, 0, 0.95),
              0 0 12px rgba(0, 0, 0, 0.8);

            @media (min-width: 641px) {
              font-size: clamp(1.4rem, 3vw, 1.85rem);
            }
          }

          .hero-mobile-ship {
            display: block;
            margin-top: 1rem;
            width: clamp(110px, 28vw, 135px);
            filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.85));
            transform-origin: center center;
            will-change: transform;

            @media (min-width: 641px) {
              margin-top: 1.5rem;
              width: clamp(140px, 18vw, 170px);
            }

            app-veliero-ship {
              width: 100%;
              display: block;
            }
          }
        }
      }

      /* Desktop Landscape (Laptops, Desktops, 4K Displays) */
      @media (min-width: 1025px) and (orientation: landscape) {
        padding: calc(82px + 2.5rem) 0 4.5rem;

        .hero-layout {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 5rem;
          max-width: 1380px;
          width: 100%;
          margin: 0 auto;
          height: auto;
          padding: 0 2rem;
        }

        .hero-left-col {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          z-index: 15;

          .hero-ship-container {
            transform-origin: bottom left;
            will-change: transform;
            display: inline-block;
            width: 390px;
            max-width: 94vw;
            filter: drop-shadow(0 14px 35px rgba(15, 23, 42, 0.45));

            app-veliero-ship {
              width: 100%;
              display: block;
            }
          }
        }

        .hero-right-col {
          min-height: 380px;
          width: 100%;
          height: auto;

          .video-slot-anchor {
            width: 100%;
            max-width: 100%;
            aspect-ratio: 16 / 9;
            max-height: 480px;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 16px 40px -10px rgba(15, 23, 42, 0.55);
            margin: 0;
          }

          .video-quote-overlay {
            position: absolute;
            inset: -1.75rem -2.5rem;
            padding: 0;

            .quote-content-wrap {
              width: 100%;
              max-width: 100%;
            }

            .video-wall-quote {
              font-size: clamp(1.35rem, 2.05vw, 1.85rem);
              max-width: 720px;
              line-height: 1.45;
            }

            .hero-mobile-ship {
              display: none;
            }
          }
        }
      }
    }

    /* Editorial Chef Section */
    .chef-intro-section {
      padding: 5rem 0;
      background-color: var(--bg-primary, #F1F5F9);
      border-bottom: none;

      .editorial-header {
        text-align: left;
        max-width: 980px;
        margin: 0 auto 3.5rem;

        .editorial-main-title {
          font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
          font-size: clamp(1.85rem, 3.2vw, 2.6rem);
          font-weight: 500;
          color: var(--text-primary, #1E293B);
          line-height: 1.45;
          letter-spacing: 0.02em;
          margin-top: 0;

          .editorial-line-primary {
            display: block;
            margin-bottom: 0.4rem;
          }

          .editorial-line-indent {
            display: block;
            padding-left: clamp(2.5rem, 9vw, 7rem);
          }

          .reveal-word {
            display: inline-block;
            opacity: 0.2;
            will-change: opacity;
          }
        }
      }

      .editorial-grid {
        display: grid;
        grid-template-columns: 1fr 1.15fr;
        gap: 4rem;
        align-items: start;

        .editorial-col-left {
          .editorial-photo-frame {
            background: transparent;
            padding: 0;
            border-radius: 0;
            border: none;
            box-shadow: none;

            .editorial-main-img {
              width: 100%;
              aspect-ratio: 4 / 5;
              max-height: 520px;
              object-fit: cover;
              object-position: center 30%;
              border-radius: 4px;
              display: block;
              margin-bottom: 0;
              border: 1px solid var(--border-subtle, #D4D4D8);
              box-shadow: var(--shadow-card);
            }
          }
        }

        .editorial-col-right {
          display: flex;
          flex-direction: column;
          gap: 2rem;

          .editorial-text-flow {
            .editorial-lead {
              font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
              font-size: 1.28rem;
              line-height: 1.7;
              color: var(--text-primary, #1E293B);
              margin-bottom: 1rem;

              strong {
                color: var(--color-gold-dark, #CA8A04);
              }
            }

            .editorial-body {
              font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
              font-size: 1.12rem;
              line-height: 1.75;
              color: var(--text-stone, #475569);
            }
          }

          .editorial-side-photo-wrap {
            .editorial-photo-frame.side-frame {
              background: transparent;
              padding: 0;
              border-radius: 0;
              border: none;
              box-shadow: none;
              display: block;

              .editorial-side-img {
                width: 100%;
                max-width: 360px;
                aspect-ratio: 4 / 3;
                object-fit: cover;
                border-radius: 4px;
                display: block;
                border: 1px solid var(--border-subtle, #D4D4D8);
                box-shadow: var(--shadow-card);
              }
            }
          }
        }
      }
    }

    /* 3 Showcase Vertical Cards */
    .cards-showcase-section {
      padding: 4.5rem 0 5.5rem;
      background-color: var(--bg-primary, #F1F5F9);
      border-bottom: none;

      .container {
        max-width: 1360px;
      }

      .archive-cards-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2.25rem;

        .veliero-large-card {
          position: relative;
          display: block;
          height: 560px;
          border-radius: 0;
          overflow: hidden;
          text-decoration: none;
          background-color: var(--bg-navy-dark, #1E293B);
          border: 1px solid var(--border-subtle, #D4D4D8);
          box-shadow: var(--shadow-card);
          transition: transform var(--transition-smooth), box-shadow var(--transition-smooth), border-color var(--transition-fast);

          &:hover {
            transform: translateY(-4px);
            border-color: var(--color-accent, #0EA5E9);
            box-shadow: var(--shadow-hover);

            .card-media-wrapper {
              transform: scale(1.03);
            }

            .veliero-card-plaque {
              background-color: #FAF7F2;
              border-color: var(--color-accent, #0EA5E9);

              &::before {
                border-color: rgba(14, 165, 233, 0.45);
              }

              .plaque-title {
                color: var(--color-accent, #0EA5E9);
              }

              .plaque-arrow-wrap {
                color: var(--color-accent, #0EA5E9);

                .feather-arrow {
                  transform: translateX(4px);
                }
              }
            }
          }

          .card-media-wrapper {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
            overflow: hidden;
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);

            app-video-card-media {
              width: 100%;
              height: 100%;
              display: block;
              border-radius: 0;
            }
          }

          .card-gradient-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              180deg,
              rgba(30, 41, 59, 0.05) 0%,
              rgba(30, 41, 59, 0.35) 40%,
              rgba(15, 23, 42, 0.9) 100%
            );
            pointer-events: none;
            z-index: 2;
          }

          .veliero-card-plaque {
            position: absolute;
            bottom: 1.25rem;
            left: 1.25rem;
            right: 1.25rem;
            z-index: 10;
            background: #FAF7F2;
            backdrop-filter: blur(8px);
            border-radius: 0;
            padding: 1.15rem 1.15rem 0.95rem;
            text-align: center;
            border: 1px solid var(--border-medium, #A1A1AA);
            box-shadow: 0 6px 20px rgba(30, 41, 59, 0.12);
            transition: all var(--transition-fast);

            &::before {
              content: '';
              position: absolute;
              inset: 3px;
              border: 1px solid rgba(30, 41, 59, 0.35);
              pointer-events: none;
              transition: border-color var(--transition-fast);
            }

            .plaque-title {
              font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
              font-size: 1.35rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: var(--tracking-small-caps);
              color: var(--bg-navy-dark, #1E293B);
              line-height: 1.2;
              margin: 0;
            }

            .plaque-subtitle {
              font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
              font-size: 0.92rem;
              font-style: italic;
              color: var(--text-stone, #475569);
              margin: 0.35rem 0 0;
              line-height: 1.35;
            }

            .plaque-arrow-wrap {
              display: flex;
              justify-content: flex-end;
              align-items: center;
              margin-top: 0.35rem;
              color: var(--bg-navy-dark, #1E293B);

              .feather-arrow {
                width: 44px;
                height: 10px;
                transition: transform 0.25s ease, color 0.2s ease;
              }
            }
          }
        }
      }
    }

    /* Hours & Dining Section (Frameless Editorial, Zero Nested Cards) */
    .hours-info-section {
      padding: 5rem 0 6rem;
      background-color: var(--bg-primary, #F1F5F9);

      .hours-editorial-grid {
        display: grid;
        grid-template-columns: 1.18fr 1fr;
        gap: 4.5rem;
        align-items: center;
        max-width: 1140px;
        margin: 0 auto;

        .hours-col-left {
          display: flex;
          flex-direction: column;
          justify-content: center;

          .eyebrow-caps {
            font-family: var(--font-sans);
            font-size: 0.74rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            color: var(--color-accent, #0EA5E9);
            margin-bottom: 0.6rem;
          }

          .hours-main-title {
            font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
            font-size: clamp(2.2rem, 3.4vw, 2.9rem);
            font-weight: 300;
            color: var(--text-primary, #1E293B);
            letter-spacing: 0.02em;
            margin-bottom: 2rem;
            line-height: 1.15;
          }

          .schedule-editorial-list {
            display: flex;
            flex-direction: column;
            gap: 0;

            .schedule-row {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              padding: 0.95rem 0;
              border-bottom: 1px solid rgba(203, 213, 225, 0.65);

              &:first-child {
                padding-top: 0;
              }

              &:last-child {
                border-bottom: none;
                padding-bottom: 0;
              }

              .service-label {
                font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
                font-size: 1.25rem;
                font-weight: 400;
                letter-spacing: 0.02em;
                color: var(--text-secondary, #334155);
              }

              .service-time {
                font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
                font-size: 1.35rem;
                font-weight: 400;
                letter-spacing: 0.04em;
                color: var(--text-primary, #1E293B);
              }

              &.schedule-closed {
                .service-label {
                  color: var(--text-muted, #64748B);
                }

                .service-time {
                  font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
                  font-size: 1.2rem;
                  font-style: italic;
                  font-weight: 400;
                  letter-spacing: 0.02em;
                  color: var(--status-danger, #DC2626);
                }
              }
            }
          }
        }

        .hours-col-right {
          .booking-dark-panel {
            background: linear-gradient(155deg, #0F172A 0%, #1E293B 100%);
            color: #FFFFFF;
            padding: 3.25rem 2.75rem;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 16px 40px -12px rgba(15, 23, 42, 0.28);

            .booking-title {
              color: #FFFFFF;
              font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
              font-size: clamp(1.8rem, 2.4vw, 2.2rem);
              font-weight: 300;
              letter-spacing: 0.03em;
              margin-bottom: 0.5rem;
              line-height: 1.2;
            }

            .booking-note {
              font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
              font-style: italic;
              font-weight: 300;
              color: rgba(226, 232, 240, 0.78);
              font-size: 1.05rem;
              margin-bottom: 1.75rem;
              line-height: 1.45;
            }

            .cta-call-group {
              display: flex;
              justify-content: center;
              margin-bottom: 0;

              .btn-call {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.65rem;
                padding: 0.68rem 2rem;
                font-family: var(--font-sans);
                font-size: 0.92rem;
                font-weight: 500;
                letter-spacing: 0.08em;
                color: #FFFFFF;
                background-color: var(--color-accent, #0EA5E9);
                border: 1px solid var(--color-accent-hover, #0284C7);
                border-radius: 2px;
                text-decoration: none;
                box-shadow: 0 4px 14px rgba(14, 165, 233, 0.28);
                transition: all var(--transition-fast);

                i {
                  font-size: 0.82rem;
                }

                &:hover {
                  background-color: var(--color-accent-hover, #0284C7);
                  transform: translateY(-2px);
                  box-shadow: 0 6px 18px rgba(14, 165, 233, 0.42);
                }

                &:active {
                  transform: translateY(0);
                }
              }
            }

            .direct-address {
              font-family: var(--font-sans);
              font-size: 0.8rem;
              font-weight: 400;
              letter-spacing: 0.03em;
              color: rgba(203, 213, 225, 0.75);
              display: inline-flex;
              align-items: center;
              gap: 0.45rem;
              margin-top: 1.5rem;

              i {
                color: var(--color-accent-light, #BAE6FD);
                font-size: 0.82rem;
              }
            }
          }
        }
      }
    }

    @media (max-width: 1024px), (orientation: portrait) {
      .chef-intro-section .editorial-grid {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }

      .cards-showcase-section {
        padding: 3.25rem 0 3.75rem;
        scroll-margin-top: 90px;

        .container {
          padding-left: 1.25rem;
          padding-right: 1.75rem;
        }

        .section-header {
          margin-bottom: 2rem;
          text-align: center;

          .eyebrow-caps {
            font-size: 0.72rem;
            letter-spacing: 0.16em;
            margin-bottom: 0.35rem;
          }

          .section-title {
            font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
            font-size: clamp(1.35rem, 4.6vw, 1.75rem);
            font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            line-height: 1.25;
          }
        }

        .archive-cards-grid {
          grid-template-columns: 1fr;
          gap: 1.25rem;
          max-width: 440px;
          margin: 0 auto;

          .veliero-large-card {
            aspect-ratio: 5 / 3;
            height: auto;
            width: 100%;
            position: relative;
            overflow: visible;
            border-radius: 0;
            border: none;
            box-shadow: none;

            &:active {
              transform: scale(0.99);

              .veliero-card-plaque {
                border-color: var(--color-accent, #0EA5E9);

                &::before {
                  border-color: rgba(14, 165, 233, 0.45);
                }

                .plaque-title,
                .plaque-arrow-wrap {
                  color: var(--color-accent, #0EA5E9);
                }

                .feather-arrow {
                  transform: translateX(4px);
                }
              }
            }

            .card-media-wrapper {
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              border-radius: 0;
              overflow: hidden;
              border: 1.6px solid #1E293B;
              box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);

              ::ng-deep img,
              ::ng-deep video {
                object-position: 25% center;
              }
            }

            .card-gradient-overlay {
              display: none;
            }

            .veliero-card-plaque {
              position: absolute;
              bottom: 1.25rem;
              left: clamp(44px, 13vw, 76px);
              top: auto;
              right: -24px;
              transform: none;
              width: auto;
              max-width: none;
              padding: 16px 24px 20px 20px;
              text-align: center;
              border: 1.6px solid #1E293B;
              background: #FAF5EE;
              box-shadow: -4px 6px 20px rgba(15, 23, 42, 0.16);
              z-index: 10;

              &::before {
                inset: 4px;
                border: 1px solid #1E293B;
                pointer-events: none;
              }

              .plaque-title {
                font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
                font-size: clamp(1.05rem, 3.8vw, 1.25rem);
                font-weight: 500;
                letter-spacing: 0.16em;
                color: #1E293B;
                margin: 0;
                line-height: 1.2;
              }

              .plaque-subtitle {
                font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
                font-size: clamp(0.85rem, 2.9vw, 0.96rem);
                font-style: italic;
                font-weight: 400;
                color: #334155;
                margin: 0.35rem 0 0;
                line-height: 1.35;
              }

              .plaque-arrow-wrap {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                margin-top: 0.5rem;
                padding-right: 0.4rem;
                color: #1E293B;

                .feather-arrow {
                  width: 48px;
                  height: 11px;
                }
              }
            }
          }
        }
      }

      .hours-info-section .hours-editorial-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
        max-width: 580px;

        .hours-col-right .booking-dark-panel {
          padding: 2.5rem 2rem;
        }
      }
    }

    @media (max-width: 640px) {
      .cards-showcase-section .archive-cards-grid .veliero-large-card {
        aspect-ratio: 5 / 3;
        height: auto;
      }

      .hours-info-section {
        padding: 3.5rem 0 4.5rem;

        .hours-editorial-grid {
          gap: 2.5rem;

          .hours-col-right .booking-dark-panel {
            padding: 2rem 1.5rem;
          }
        }
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .editorial-main-title .reveal-word {
        opacity: 1 !important;
      }
    }
  `],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private animService = inject(AnimationService);

  /**
   * Centralized configuration for the 3 showcase cards.
   * Swap or update video sources (local assets or external CDN URLs) with a single line here.
   */
  readonly showcaseCards: ShowcaseCardItem[] = [
    {
      id: 'menu',
      title: 'MENÙ ALLA CARTA',
      subtitle: 'Cucina marinara, crudi & forno a legna',
      routerLink: '/menu',
      ariaLabel: 'Consulta il Menù alla Carta',
      posterSrc: 'assets/images/cards/card-menu.jpg',
      webmSrc: 'assets/videos/card-menu-loop.webm',
    },
    {
      id: 'pescato',
      title: 'DIARIO DI BORDO',
      subtitle: 'Il pescato fresco del giorno',
      routerLink: '/pescato',
      ariaLabel: 'Consulta il Diario di Bordo del Pescato del Giorno',
      posterSrc: 'assets/images/cards/card-pescato.jpg',
      webmSrc: 'assets/videos/card-pescato-loop.webm',
    },
    {
      id: 'dove-siamo',
      title: 'DOVE SIAMO & ORARI',
      subtitle: 'Bassano del Grappa, orari & contatti',
      routerLink: '/dove-siamo',
      ariaLabel: 'Indicazioni e Prenotazioni a Bassano del Grappa',
      posterSrc: 'assets/images/cards/card-dove-siamo.jpg',
      webmSrc: 'assets/videos/card-dove-siamo-loop.webm',
    },
  ];

  @ViewChild('heroWrapper') heroWrapperRef!: ElementRef;
  @ViewChild('heroShipEl') heroShipRef!: ElementRef;
  @ViewChild('videoWallEl') videoWallRef!: ElementRef;
  @ViewChild('heroVideoEl') heroVideoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('videoSlotEl') videoSlotRef?: ElementRef;
  @ViewChild('heroQuoteEl') heroQuoteRef!: ElementRef;
  @ViewChild('heroMobileShipEl') heroMobileShipRef?: ElementRef;
  @ViewChild('editorialTitleEl') editorialTitleRef!: ElementRef;

  readonly firstLineWords = 'Cucina di mare adriatica –'.split(' ');
  readonly secondLineWords = 'e la pizza cotta a legna del Campione del Mondo'.split(' ');

  private heroMm: gsap.MatchMedia | null = null;
  private wordRevealTimeline: gsap.core.Timeline | null = null;
  private interactionCleanupFns: Array<() => void> = [];

  ngAfterViewInit(): void {
    this.initHeroVideoPlayback();

    if (
      this.videoWallRef?.nativeElement &&
      this.heroWrapperRef?.nativeElement
    ) {
      this.heroMm = this.animService.initHeroVelieroMorph(
        this.heroShipRef?.nativeElement || null,
        this.videoWallRef.nativeElement,
        this.heroWrapperRef.nativeElement,
        this.heroQuoteRef?.nativeElement || null,
        this.heroMobileShipRef?.nativeElement || null,
        this.videoSlotRef?.nativeElement || null
      );
    }

    if (this.editorialTitleRef?.nativeElement) {
      const words = this.editorialTitleRef.nativeElement.querySelectorAll('.reveal-word');
      if (words && words.length > 0) {
        this.wordRevealTimeline = this.animService.initWordScrollReveal(
          this.editorialTitleRef.nativeElement,
          words
        );
      }
    }
  }

  private initHeroVideoPlayback(): void {
    const video = this.heroVideoRef?.nativeElement;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playVideo = () => {
      if (video && video.paused) {
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.debug('Hero video autoplay waiting for user interaction:', err);
          });
        }
      }
    };

    // Immediate attempt
    playVideo();

    // Interaction fallback for strict browser autoplay policies
    const triggerEvents = ['click', 'touchstart', 'scroll', 'mousemove'];
    const onUserInteraction = () => {
      playVideo();
      this.interactionCleanupFns.forEach((fn) => fn());
      this.interactionCleanupFns = [];
    };

    triggerEvents.forEach((evt) => {
      window.addEventListener(evt, onUserInteraction, { once: true, passive: true });
      this.interactionCleanupFns.push(() =>
        window.removeEventListener(evt, onUserInteraction)
      );
    });
  }

  onHeroVideoCanPlay(): void {
    const video = this.heroVideoRef?.nativeElement;
    if (video && video.paused) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }

  onHeroVideoLoaded(): void {
    const video = this.heroVideoRef?.nativeElement;
    if (video && video.paused) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }

  ngOnDestroy(): void {
    this.interactionCleanupFns.forEach((fn) => fn());
    this.interactionCleanupFns = [];

    if (this.heroMm) {
      this.heroMm.revert();
      this.heroMm = null;
    }
    if (this.wordRevealTimeline) {
      this.wordRevealTimeline.scrollTrigger?.kill();
      this.wordRevealTimeline.kill();
      this.wordRevealTimeline = null;
    }
  }

  onHeroPosterError(event: any): void {
    event.target.src = 'assets/videos/hero-poster.svg';
  }

  onChampionLogoError(event: any): void {
    event.target.src = 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.svg';
  }
}
