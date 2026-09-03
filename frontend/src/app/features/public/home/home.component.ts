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
        <div class="container hero-layout">
          <!-- Left Column: Veliero Ship Alone -->
          <div class="hero-left-col" #heroLeftCol>
            <div class="hero-ship-container" #heroShipEl>
              <app-veliero-ship
                size="360px"
                mode="gold"
                alt="Incisione autentica del galeone Il Veliero"
              ></app-veliero-ship>
            </div>
          </div>

          <!-- Right Column: Video Wall Grid Container with Fixed Quote -->
          <div class="hero-right-col" #heroRightCol>
            <div class="video-wall-box" #videoWallEl>
              <video
                class="video-wall-media"
                autoplay
                muted
                loop
                playsinline
                poster="assets/videos/hero-poster.jpg"
              >
                <source src="assets/videos/hero-ocean-loop.webm" type="video/webm" />
                <source src="assets/videos/hero-ocean-loop.mp4" type="video/mp4" />
              </video>
              <img
                src="assets/videos/hero-poster.jpg"
                alt="Il Veliero Experience"
                class="video-wall-fallback"
                (error)="onHeroPosterError($event)"
              />
              <div class="video-scrim"></div>
            </div>

            <!-- Fixed Non-Scaling Poetic Quote Overlay -->
            <div class="video-quote-overlay" #heroQuoteEl>
              <h2 class="video-wall-quote">
                "Il gusto autentico del mare dell'Adriatico e l'arte bianca cotta nel forno a legna del Campione del Mondo."
              </h2>
            </div>
          </div>
        </div>
      </section>

      <!-- CHEF & WORLD CHAMPION DISHOOM EDITORIAL SECTION -->
      <section class="section chef-intro-section">
        <div class="container">
          <!-- Centered Love Letter Header -->
          <div class="dishoom-love-letter">
            <span class="editorial-kicker">PASSIONE, MAESTRIA & ACCOGLIENZA</span>
            <h2 class="love-letter-title">
              Ogni piatto de Il Veliero è una dichiarazione d'amore per il nostro mare —
            </h2>
            <p class="love-letter-sub">
              il pescato freschissimo dell'Adriatico, la cura artigianale degli impasti a lunga lievitazione e la convivialità della vera tavola veneta.
            </p>
          </div>

          <!-- Editorial Asymmetrical 2-Column Photo & Story Grid -->
          <div class="dishoom-editorial-grid">
            <!-- Left Editorial Photo with Vintage Caption -->
            <div class="editorial-col-left">
              <div class="editorial-photo-frame">
                <img
                  src="assets/images/WhatsApp Image 2026-08-30 at 18.02.57.jpeg"
                  alt="Federico Bortolato e Sabina Mazzeracca a Il Veliero"
                  class="editorial-main-img"
                  (error)="onChampionLogoError($event)"
                />
                <div class="editorial-caption">
                  <span class="caption-tag">SOPRA:</span>
                  <span class="caption-text">La passione dei fondatori Federico e Sabina, custodi di una tradizione culinaria che unisce mare e arte bianca a Bassano del Grappa.</span>
                </div>
              </div>
            </div>

            <!-- Right Editorial Story & Secondary Framed Photo -->
            <div class="editorial-col-right">
              <div class="editorial-text-flow">
                <p class="editorial-lead">
                  Tutto nasce dalla ricerca quotidiana dell'eccellenza. All'alba selezioniamo il pescato fresco dai mercati dell'Adriatico, mentre in cucina i forni e gli impasti a lievitazione naturale oltre 48 ore danno vita alla pizza insignita del titolo di <strong>Campione del Mondo</strong>.
                </p>
                <p class="editorial-body">
                  Tra le sale accoglienti e il profumo del forno a legna, ogni ospite ritrova il calore sincero della tradizione marinara, dove la freschezza degli ingredienti incontra la maestria di chi ha dedicato la propria vita all'arte gastronomica.
                </p>
              </div>

              <div class="editorial-side-photo-wrap">
                <div class="editorial-photo-frame side-frame">
                  <img
                    src="assets/images/WhatsApp Image 2026-08-30 at 18.02.57 (1).jpeg"
                    alt="La pizza del Campione del Mondo cotta a legna"
                    class="editorial-side-img"
                    (error)="onChampionLogoError($event)"
                  />
                  <div class="editorial-caption">
                    <span class="caption-tag">A DESTRA:</span>
                    <span class="caption-text">La celebre pizza cotta a 450°C nel forno a legna dal Campione del Mondo Federico Bortolato.</span>
                  </div>
                </div>
              </div>

              <!-- Refined Key Highlights -->
              <div class="editorial-pills-row">
                <div class="editorial-pill">
                  <i class="fa-solid fa-trophy"></i>
                  <span>Pizza Campione del Mondo</span>
                </div>
                <div class="editorial-pill">
                  <i class="fa-solid fa-fish"></i>
                  <span>Pescato Fresco Quotidiano</span>
                </div>
                <div class="editorial-pill">
                  <i class="fa-solid fa-fire"></i>
                  <span>Forno a Legna Tradizionale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3 DISHOOM ARCHIVE FRAME CARDS WITH VIDEO LOOP -->
      <section class="section cards-showcase-section">
        <div class="container">
          <div class="section-header">
            <div class="header-decor-ship">
              <app-veliero-ship size="56px" mode="gold"></app-veliero-ship>
            </div>
            <span class="eyebrow-caps">La Tavola & l'Ospitalità</span>
            <h2 class="section-title">
              "Consulta i Menù, Scopri i Nostri Prodotti, Vieni a Trovarci"
            </h2>
            <p class="description">
              Esplora la nostra prestigiosa carta gastronomica, il diario del pescato fresco di giornata e la calorosa accoglienza a Bassano del Grappa.
            </p>
          </div>

          <div class="archive-cards-grid">
            <!-- Card 1: MENÙ -->
            <a
              routerLink="/menu"
              class="archive-frame-card"
              aria-label="Consulta il Menù e le Pizze del Campione del Mondo"
              (mouseenter)="menuVideo.playVideo()"
              (mouseleave)="menuVideo.pauseVideo()"
              (focusin)="menuVideo.playVideo()"
              (focusout)="menuVideo.pauseVideo()"
            >
              <div class="card-inner-frame">
                <div class="card-media-wrapper">
                  <app-video-card-media
                    #menuVideo
                    mp4Src="assets/videos/card-menu-loop.mp4"
                    webmSrc="assets/videos/card-menu-loop.webm"
                    posterSrc="assets/videos/card-menu-poster.svg"
                    title="Menù Il Veliero"
                  ></app-video-card-media>
                </div>
                <div class="card-caption-content">
                  <span class="card-category-tag">Carta Gastronomica</span>
                  <h3 class="card-title">MENÙ</h3>
                  <p class="card-narrative">
                    Antipasti marinari, crudi freschi dell'Adriatico, primi trafilati al bronzo e le celebri pizze a lunga lievitazione cotte nel forno a legna del Campione del Mondo.
                  </p>
                  <span class="card-action-link">
                    Consulta i Menù <i class="fa-solid fa-arrow-right-long"></i>
                  </span>
                </div>
              </div>
            </a>

            <!-- Card 2: DIARIO DI BORDO -->
            <a
              routerLink="/pescato"
              class="archive-frame-card"
              aria-label="Consulta il Diario di Bordo del Pescato del Giorno"
              (mouseenter)="pescatoVideo.playVideo()"
              (mouseleave)="pescatoVideo.pauseVideo()"
              (focusin)="pescatoVideo.playVideo()"
              (focusout)="pescatoVideo.pauseVideo()"
            >
              <div class="card-inner-frame">
                <div class="card-media-wrapper">
                  <app-video-card-media
                    #pescatoVideo
                    mp4Src="assets/videos/card-pescato-loop.mp4"
                    webmSrc="assets/videos/card-pescato-loop.webm"
                    posterSrc="assets/videos/card-pescato-poster.svg"
                    title="Pescato del Giorno"
                  ></app-video-card-media>
                </div>
                <div class="card-caption-content">
                  <span class="card-category-tag">Mercato Ittico</span>
                  <h3 class="card-title">DIARIO DI BORDO</h3>
                  <p class="card-narrative">
                    Il Diario di Bordo aggiornato ogni mattina con gli arrivi d'asta: crostacei vivi, dentici, orate, calamaretti spillo e fritture fragranti di paranza.
                  </p>
                  <span class="card-action-link">
                    Diario di Bordo <i class="fa-solid fa-arrow-right-long"></i>
                  </span>
                </div>
              </div>
            </a>

            <!-- Card 3: DOVE SIAMO -->
            <a
              routerLink="/dove-siamo"
              class="archive-frame-card"
              aria-label="Indicazioni per Raggiungerci a Bassano del Grappa"
              (mouseenter)="doveSiamoVideo.playVideo()"
              (mouseleave)="doveSiamoVideo.pauseVideo()"
              (focusin)="doveSiamoVideo.playVideo()"
              (focusout)="doveSiamoVideo.pauseVideo()"
            >
              <div class="card-inner-frame">
                <div class="card-media-wrapper">
                  <app-video-card-media
                    #doveSiamoVideo
                    mp4Src="assets/videos/card-dove-siamo-loop.mp4"
                    webmSrc="assets/videos/card-dove-siamo-loop.webm"
                    posterSrc="assets/videos/card-dove-siamo-poster.svg"
                    title="Dove Siamo"
                  ></app-video-card-media>
                </div>
                <div class="card-caption-content">
                  <span class="card-category-tag">Ospitalità & Territorio</span>
                  <h3 class="card-title">DOVE SIAMO</h3>
                  <p class="card-narrative">
                    In Via G. Fattori 7 a Bassano del Grappa (San Michele). Atmosfera calda d'archivio, cantina curata, terrazza estiva e comodo parcheggio riservato.
                  </p>
                  <span class="card-action-link">
                    Come Raggiungerci <i class="fa-solid fa-arrow-right-long"></i>
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- OPENING HOURS & LOCATION HIGHLIGHT SECTION -->
      <section class="section hours-info-section">
        <div class="container">
          <div class="hours-info-box card">
            <div class="hours-left">
              <div class="hours-header-badge">
                <i class="fa-solid fa-clock"></i>
                <span>Orari di Apertura Reali</span>
              </div>
              <h3 class="hours-main-title">Orari della Cucina</h3>
              <p class="hours-desc">
                La cucina è attiva esclusivamente nei turni indicati e non effettua pasti fuori orario. La pizzeria può effettuare aperture leggermente anticipate o prolungate.
              </p>

              <div class="schedule-chips-grid">
                <div class="schedule-chip">
                  <span class="chip-label">Pranzo Cucina</span>
                  <strong>12:00 – 14:00</strong>
                </div>
                <div class="schedule-chip">
                  <span class="chip-label">Cena Cucina</span>
                  <strong>19:00 – 22:00</strong>
                </div>
                <div class="schedule-chip chip-closed">
                  <span class="chip-label">Riposo Settimanale</span>
                  <strong>CHIUSO IL MERCOLEDÌ</strong>
                </div>
              </div>
            </div>

            <div class="hours-right">
              <div class="direct-call-box">
                <h4>Prenota il Tuo Tavolo</h4>
                <p>È consigliata la prenotazione per il fine settimana.</p>
                <div class="cta-call-group">
                  <a href="tel:0424500200" class="btn btn-gold btn-call">
                    <i class="fa-solid fa-phone"></i> 0424 500 200
                  </a>
                  <a
                    href="https://wa.me/393346232941"
                    target="_blank"
                    rel="noopener"
                    class="btn btn-whatsapp"
                  >
                    <i class="fa-brands fa-whatsapp"></i> WhatsApp 334 623 2941
                  </a>
                </div>
                <span class="direct-address">
                  <i class="fa-solid fa-location-dot"></i> Via G. Fattori 7, 36061 Bassano del Grappa (VI)
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
      background-color: var(--dishoom-bg-primary, #FAF7F2);
    }

    /* Hero Section with Solid Monocolor Background & Scroll Expansion */
    .hero-morph-wrapper {
      background: #07192F;
      color: #ffffff;
      margin-top: -68px;
      padding: calc(68px + 2.5rem) 0 4.5rem;
      position: relative;
      overflow: hidden;
      border-bottom: 1px solid var(--dishoom-brass, #C58A3E);
      box-shadow: none;
      min-height: 100vh;
      display: flex;
      align-items: center;

      .hero-layout {
        display: grid;
        grid-template-columns: 1fr 1.25fr;
        gap: 3.5rem;
        align-items: center;
        position: relative;
        z-index: 2;
        width: 100%;
      }

      .hero-left-col {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 15;

        .hero-ship-container {
          transform-origin: bottom left;
          will-change: transform;
          display: inline-block;
          filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.4));
        }
      }

      .hero-right-col {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 380px;

        .video-wall-box {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: 480px;
          border-radius: 0px;
          overflow: hidden;
          background: #000000;
          border: none;
          outline: none;
          box-shadow: none;
          transform-origin: top left;
          will-change: transform;

          .video-wall-media {
            width: 100%;
            height: 100%;
            object-fit: cover;
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
              rgba(7, 25, 47, 0.3) 0%,
              rgba(7, 25, 47, 0.6) 100%
            );
            pointer-events: none;
          }
        }

        .video-quote-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 2.5rem;
          z-index: 20;
          pointer-events: none;
          text-align: center;
          will-change: transform;
          transform-origin: center center;

          .video-wall-quote {
            color: #FAF7F2;
            font-size: clamp(1.35rem, 2.2vw, 1.85rem);
            font-style: italic;
            font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
            text-shadow: 0 4px 18px rgba(0, 0, 0, 0.9), 0 2px 6px rgba(0, 0, 0, 0.95);
            line-height: 1.55;
            max-width: 620px;
            margin: 0 auto;
          }
        }
      }
    }

    /* Dishoom Editorial & Love Letter Section */
    .chef-intro-section {
      padding: 6rem 0;
      background-color: var(--dishoom-bg-primary, #FAF7F2);
      border-bottom: 1px solid var(--dishoom-border-sand, #E5DDD0);

      .dishoom-love-letter {
        text-align: center;
        max-width: 820px;
        margin: 0 auto 4.5rem;

        .editorial-kicker {
          font-family: var(--font-body-editorial, 'Plus Jakarta Sans', sans-serif);
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: var(--tracking-eyebrow, 0.16em);
          color: var(--dishoom-brass-dark, #945C22);
          display: inline-block;
          margin-bottom: 1.25rem;
          padding: 0.25rem 0.85rem;
          border-radius: 4px;
          background: rgba(197, 138, 62, 0.08);
          border: 1px solid rgba(197, 138, 62, 0.25);
        }

        .love-letter-title {
          font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
          font-size: clamp(2rem, 3.6vw, 2.75rem);
          font-weight: 600;
          color: var(--dishoom-ink-charcoal, #1C1917);
          line-height: 1.25;
          letter-spacing: 0.02em;
          margin-bottom: 1.25rem;
        }

        .love-letter-sub {
          font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
          font-style: italic;
          font-size: 1.22rem;
          color: var(--dishoom-ink-muted, #78716C);
          line-height: 1.7;
          max-width: 720px;
          margin: 0 auto;
        }
      }

      .dishoom-editorial-grid {
        display: grid;
        grid-template-columns: 1fr 1.15fr;
        gap: 4rem;
        align-items: start;

        .editorial-col-left {
          .editorial-photo-frame {
            background: #FFFFFF;
            padding: 12px 12px 16px;
            border-radius: 3px;
            border: 1px solid var(--dishoom-border-sand, #E5DDD0);
            box-shadow: var(--dishoom-shadow-card, 0 4px 16px -2px rgba(28, 25, 23, 0.08));

            .editorial-main-img {
              width: 100%;
              height: 420px;
              object-fit: cover;
              border-radius: 2px;
              display: block;
              margin-bottom: 1rem;
            }

            .editorial-caption {
              display: flex;
              gap: 0.5rem;
              font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
              font-size: 0.95rem;
              line-height: 1.5;
              color: var(--dishoom-ink-stone, #44403C);
              padding: 0 0.25rem;

              .caption-tag {
                font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
                font-size: 0.72rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: var(--dishoom-ink-charcoal, #1C1917);
                flex-shrink: 0;
              }

              .caption-text {
                font-style: italic;
              }
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
              font-size: 1.35rem;
              line-height: 1.75;
              color: var(--dishoom-ink-charcoal, #1C1917);
              margin-bottom: 1.25rem;

              strong {
                color: var(--dishoom-brass-dark, #945C22);
              }
            }

            .editorial-body {
              font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
              font-size: 1.15rem;
              line-height: 1.8;
              color: var(--dishoom-ink-stone, #44403C);
            }
          }

          .editorial-side-photo-wrap {
            .editorial-photo-frame.side-frame {
              background: #FFFFFF;
              padding: 10px 10px 14px;
              border-radius: 3px;
              border: 1px solid var(--dishoom-border-sand, #E5DDD0);
              box-shadow: var(--dishoom-shadow-card, 0 4px 16px -2px rgba(28, 25, 23, 0.08));
              display: grid;
              grid-template-columns: 140px 1fr;
              gap: 1.25rem;
              align-items: center;

              .editorial-side-img {
                width: 140px;
                height: 110px;
                object-fit: cover;
                border-radius: 2px;
              }

              .editorial-caption {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
                font-size: 0.92rem;
                line-height: 1.45;
                color: var(--dishoom-ink-stone, #44403C);

                .caption-tag {
                  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
                  font-size: 0.72rem;
                  font-weight: 800;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  color: var(--dishoom-ink-charcoal, #1C1917);
                }

                .caption-text {
                  font-style: italic;
                }
              }
            }
          }

          .editorial-pills-row {
            display: flex;
            gap: 0.85rem;
            flex-wrap: wrap;

            .editorial-pill {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              background: var(--dishoom-bg-surface, #F5EFEB);
              padding: 0.55rem 1rem;
              border-radius: 3px;
              font-family: var(--font-body-editorial, 'Plus Jakarta Sans', sans-serif);
              font-weight: 600;
              font-size: 0.82rem;
              color: var(--dishoom-ink-charcoal, #1C1917);
              border: 1px solid var(--dishoom-border-sand, #E5DDD0);

              i {
                color: var(--dishoom-brass-dark, #945C22);
                font-size: 0.95rem;
              }
            }
          }
        }
      }
    }

    /* 3 Dishoom Archive Frame Cards */
    .cards-showcase-section {
      padding: 5.5rem 0;
      background-color: var(--dishoom-bg-primary, #FAF7F2);
      border-top: 1px solid var(--dishoom-border-sand, #E5DDD0);
      border-bottom: 1px solid var(--dishoom-border-sand, #E5DDD0);
      position: relative;

      .section-header {
        text-align: center;
        max-width: 860px;
        margin: 0 auto 3.75rem;

        .header-decor-ship {
          margin-bottom: 1rem;
          display: flex;
          justify-content: center;
          opacity: 0.9;
        }

        .eyebrow-caps {
          font-family: var(--font-sans);
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: var(--tracking-eyebrow, 0.15em);
          color: var(--dishoom-brass-dark, #945C22);
          display: block;
          margin-bottom: 0.65rem;
        }

        .section-title {
          font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
          font-size: clamp(2rem, 3.5vw, 2.65rem);
          font-weight: 600;
          color: var(--dishoom-ink-charcoal, #1C1917);
          letter-spacing: var(--tracking-wide, 0.04em);
          line-height: 1.2;
          margin-bottom: 1rem;
        }

        .description {
          font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
          font-style: italic;
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--dishoom-ink-muted, #78716C);
          max-width: 680px;
          margin: 0 auto;
        }
      }

      .archive-cards-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2.25rem;

        .archive-frame-card {
          background-color: var(--dishoom-bg-surface, #F5EFEB);
          border-radius: 4px;
          border: 1px solid var(--dishoom-brass, #C58A3E);
          outline: 1px solid rgba(197, 138, 62, 0.35);
          outline-offset: -5px;
          box-shadow: var(--dishoom-shadow-card, 0 4px 16px -2px rgba(28, 25, 23, 0.05));
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          padding: 7px;
          position: relative;
          transition: transform var(--transition-smooth, 0.35s cubic-bezier(0.16, 1, 0.3, 1)),
                      box-shadow var(--transition-smooth, 0.35s cubic-bezier(0.16, 1, 0.3, 1)),
                      border-color var(--transition-fast, 0.2s ease),
                      outline-color var(--transition-fast, 0.2s ease);

          &:hover {
            transform: translateY(-5px);
            box-shadow: var(--dishoom-shadow-hover, 0 12px 28px -4px rgba(28, 25, 23, 0.09));
            border-color: var(--dishoom-brass-dark, #945C22);
            outline-color: var(--dishoom-brass, #C58A3E);
          }

          &:focus-visible {
            outline: 2px solid var(--dishoom-brass, #C58A3E);
            outline-offset: 2px;
          }

          .card-inner-frame {
            display: flex;
            flex-direction: column;
            height: 100%;
            border-radius: 2px;
            overflow: hidden;
            background-color: var(--dishoom-bg-surface, #F5EFEB);
          }

          .card-media-wrapper {
            height: 225px;
            position: relative;
            overflow: hidden;
            border-bottom: 1px solid var(--dishoom-border-sand, #E5DDD0);
          }

          .card-caption-content {
            padding: 1.65rem 1.35rem 1.4rem;
            display: flex;
            flex-direction: column;
            flex: 1;

            .card-category-tag {
              font-family: var(--font-sans);
              font-size: 0.72rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: var(--tracking-small-caps, 0.12em);
              color: var(--dishoom-brass-dark, #945C22);
              margin-bottom: 0.45rem;
              display: block;
            }

            .card-title {
              font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
              font-size: 1.65rem;
              font-weight: 600;
              letter-spacing: var(--tracking-wide, 0.04em);
              color: var(--dishoom-ink-charcoal, #1C1917);
              line-height: 1.2;
              margin-bottom: 0.75rem;
              transition: color var(--transition-fast);
            }

            .card-narrative {
              font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
              font-style: italic;
              font-size: 1.02rem;
              line-height: 1.55;
              color: var(--dishoom-ink-stone, #44403C);
              margin-bottom: 1.5rem;
              flex: 1;
            }

            .card-action-link {
              font-family: var(--font-sans);
              font-weight: 700;
              font-size: 0.8rem;
              text-transform: uppercase;
              letter-spacing: var(--tracking-small-caps, 0.12em);
              color: var(--dishoom-brass-dark, #945C22);
              display: inline-flex;
              align-items: center;
              gap: 0.45rem;
              transition: gap var(--transition-fast), color var(--transition-fast);

              i {
                font-size: 0.85rem;
                transition: transform var(--transition-fast);
              }
            }
          }

          &:hover {
            .card-title {
              color: var(--dishoom-brass-dark, #945C22);
            }

            .card-action-link {
              gap: 0.75rem;
              color: var(--dishoom-brass, #C58A3E);

              i {
                transform: translateX(3px);
              }
            }
          }
        }
      }
    }

    /* Hours & Dining Info Box */
    .hours-info-section {
      padding: 4.5rem 0 6rem;
      background-color: var(--dishoom-bg-primary, #FAF7F2);

      .hours-info-box {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 3.5rem;
        background: var(--dishoom-bg-surface, #F5EFEB);
        padding: 3.5rem;
        border-radius: 4px;
        box-shadow: var(--dishoom-shadow-card, 0 4px 16px -2px rgba(28, 25, 23, 0.05));
        border: 1px solid var(--dishoom-border-sand, #E5DDD0);
        outline: 1px solid rgba(197, 138, 62, 0.25);
        outline-offset: -5px;

        .hours-left {
          .hours-header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            color: var(--dishoom-brass-dark, #945C22);
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: var(--tracking-eyebrow, 0.15em);
            margin-bottom: 0.75rem;
          }

          .hours-main-title {
            font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
            font-size: 2.2rem;
            color: var(--dishoom-ink-charcoal, #1C1917);
            letter-spacing: 0.04em;
            margin-bottom: 0.75rem;
          }

          .hours-desc {
            font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
            font-style: italic;
            font-size: 1.08rem;
            color: var(--dishoom-ink-muted, #78716C);
            margin-bottom: 2rem;
            line-height: 1.6;
          }

          .schedule-chips-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.25rem;

            .schedule-chip {
              background: var(--dishoom-bg-primary, #FAF7F2);
              border-radius: 3px;
              padding: 1.25rem;
              text-align: center;
              border: 1px solid var(--dishoom-border-sand, #E5DDD0);

              .chip-label {
                font-family: var(--font-sans);
                font-size: 0.72rem;
                text-transform: uppercase;
                letter-spacing: var(--tracking-small-caps, 0.12em);
                color: var(--dishoom-ink-muted, #78716C);
                display: block;
                margin-bottom: 0.35rem;
                font-weight: 600;
              }

              strong {
                font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--dishoom-ink-charcoal, #1C1917);
              }

              &.chip-closed {
                background: #FDF2F2;
                border-color: #FECACA;

                strong {
                  color: #DC2626;
                  font-size: 1.05rem;
                }
              }
            }
          }
        }

        .hours-right {
          display: flex;
          align-items: center;

          .direct-call-box {
            background: linear-gradient(145deg, #07192F 0%, #0B1B2B 65%, #0D2033 100%);
            color: #ffffff;
            border-radius: 4px;
            padding: 2.5rem;
            width: 100%;
            text-align: center;
            border: 1px solid var(--dishoom-brass, #C58A3E);
            outline: 1px solid rgba(197, 138, 62, 0.3);
            outline-offset: -5px;
            box-shadow: 0 10px 25px rgba(7, 25, 47, 0.25);

            h4 {
              color: var(--dishoom-ink-inverse, #FAF7F2);
              font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
              font-size: 1.65rem;
              margin-bottom: 0.5rem;
            }

            p {
              font-family: var(--font-serif-primary, 'Cormorant Garamond', serif);
              font-style: italic;
              color: var(--dishoom-ink-inverse-muted, #DDD3C4);
              font-size: 0.98rem;
              margin-bottom: 1.75rem;
            }

            .cta-call-group {
              display: flex;
              flex-direction: column;
              gap: 0.85rem;
              margin-bottom: 1.5rem;

              .btn-call {
                font-family: var(--font-sans);
                font-size: 0.92rem;
                padding: 0.85rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: var(--tracking-small-caps, 0.12em);
                background-color: var(--dishoom-brass, #C58A3E);
                color: #FAF7F2;
                border: 1px solid var(--dishoom-brass-dark, #945C22);

                &:hover {
                  background-color: var(--dishoom-brass-dark, #945C22);
                }
              }

              .btn-whatsapp {
                font-family: var(--font-sans);
                background: #25D366;
                color: #ffffff;
                font-weight: 700;
                font-size: 0.92rem;
                padding: 0.85rem;
                text-transform: uppercase;
                letter-spacing: var(--tracking-small-caps, 0.12em);
                border: 1px solid #1EBE5D;

                &:hover {
                  background: #1EB954;
                }
              }
            }

            .direct-address {
              font-family: var(--font-sans);
              font-size: 0.82rem;
              color: var(--dishoom-ink-inverse-muted, #DDD3C4);
              display: inline-flex;
              align-items: center;
              gap: 0.4rem;

              i {
                color: var(--dishoom-brass, #C58A3E);
              }
            }
          }
        }
      }
    }

    @media (max-width: 1024px) {
      .hero-morph-wrapper {
        min-height: auto;
        padding: 3rem 0 4rem;

        .hero-layout {
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }

        .hero-left-col {
          justify-content: center;

          .hero-ship-container {
            display: flex;
            justify-content: center;
          }
        }

        .hero-right-col {
          min-height: 280px;

          .video-wall-box {
            max-height: 380px;
          }

          .video-quote-overlay {
            padding: 1.5rem;

            .video-wall-quote {
              font-size: 1.25rem;
            }
          }
        }
      }

      .chef-intro-section .dishoom-editorial-grid {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }

      .cards-showcase-section .archive-cards-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .hours-info-section .hours-info-box {
        grid-template-columns: 1fr;
        padding: 2rem;
      }
    }
  `],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private animService = inject(AnimationService);

  @ViewChild('heroWrapper') heroWrapperRef!: ElementRef;
  @ViewChild('heroShipEl') heroShipRef!: ElementRef;
  @ViewChild('videoWallEl') videoWallRef!: ElementRef;
  @ViewChild('heroQuoteEl') heroQuoteRef!: ElementRef;

  private heroMorphTimeline: gsap.core.Timeline | null = null;

  ngAfterViewInit(): void {
    // Initialize Hero Scroll-Expansion with GSAP ScrollTrigger
    if (
      this.heroShipRef?.nativeElement &&
      this.videoWallRef?.nativeElement &&
      this.heroWrapperRef?.nativeElement
    ) {
      this.heroMorphTimeline = this.animService.initHeroVelieroMorph(
        this.heroShipRef.nativeElement,
        this.videoWallRef.nativeElement,
        this.heroWrapperRef.nativeElement,
        this.heroQuoteRef?.nativeElement
      );
    }
  }

  ngOnDestroy(): void {
    if (this.heroMorphTimeline) {
      this.heroMorphTimeline.scrollTrigger?.kill();
      this.heroMorphTimeline.kill();
      this.heroMorphTimeline = null;
    }
  }

  onHeroPosterError(event: any): void {
    event.target.src = 'assets/videos/hero-poster.svg';
  }

  onChampionLogoError(event: any): void {
    event.target.src = 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.svg';
  }
}
