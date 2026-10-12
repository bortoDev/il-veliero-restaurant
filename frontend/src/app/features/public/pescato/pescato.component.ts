import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PescatoService } from '../../../core/services/pescato.service';
import { AuthService } from '../../../core/services/auth.service';
import { PescatoItem } from '../../../core/models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

interface LightboxState {
  isOpen: boolean;
  images: string[];
  activeIndex: number;
  title: string;
}

@Component({
  selector: 'app-pescato',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SkeletonLoaderComponent,
    ModalComponent,
  ],
  template: `
    <div class="diario-di-bordo-page">
      <!-- EMBLEM HERO: "Diario del Pescato" -->
      <section class="diario-hero-section">
        <div class="container hero-inner">
          <h1 class="hero-title">Diario del Pescato</h1>

          <div class="hero-links-row">
            <a routerLink="/menu" class="btn btn-outline-white btn-sm">
              Consulta il Menù
            </a>
            <a href="tel:0424500200" class="btn btn-gold btn-sm">
              Chiama 0424 500 200
            </a>
          </div>
        </div>
      </section>

      <!-- MAIN EDITORIAL FEED -->
      <section class="section diario-feed-section">
        <div class="container feed-container">
          <!-- INLINE MANAGER CONTROL BAR -->
          <div *ngIf="isManager()" class="manager-action-bar">
            <div class="manager-bar-info">
              <i class="fa-solid fa-user-shield text-accent"></i>
              <div>
                <strong>Pannello Gestione Diario del Pescato</strong>
                <span>Pubblica nuovi arrivi o aggiorna le immagini d'autore.</span>
              </div>
            </div>
            <button (click)="openAddModal()" class="btn btn-gold btn-sm">
              <i class="fa-solid fa-plus"></i> + Nuovo Post
            </button>
          </div>

          <!-- Share / Toast Feedback -->
          <div *ngIf="shareToastMessage()" class="share-toast-notification">
            <i class="fa-solid fa-circle-check"></i>
            <span>{{ shareToastMessage() }}</span>
          </div>

          <!-- SKELETON LOADER STATE -->
          <app-skeleton-loader *ngIf="isLoading()" type="pescato-card" [count]="3"></app-skeleton-loader>

          <!-- Empty State -->
          <div *ngIf="!isLoading() && catches().length === 0" class="empty-state">
            <i class="fa-solid fa-water empty-icon"></i>
            <h3>Nessun post nel Diario del Pescato</h3>
            <p>I nuovi arrivi del giorno verranno pubblicati a breve con gli scatti delle selezioni mattutine.</p>
            <button *ngIf="isManager()" (click)="openAddModal()" class="btn btn-gold btn-sm mt-3">
              <i class="fa-solid fa-plus"></i> Pubblica il Primo Post
            </button>
          </div>

          <!-- CHRONOLOGICAL EDITORIAL FEED -->
          <div *ngIf="!isLoading() && catches().length > 0" class="diario-editorial-feed">
                        <article
              *ngFor="let item of catches(); let i = index"
              class="diario-post-entry"
              [style.animation-delay]="(i * 100) + 'ms'"
            >
              <!-- 1. DATE LINE DIVIDER (Interrotto dalla data) -->
              <div class="post-timeline-divider">
                <span class="divider-line"></span>
                <time class="divider-date">{{ formatDiaryDate(item.catchDate || item.createdAt) }}</time>
                <span class="divider-line"></span>
              </div>

              <!-- 2. POST HEADER & TITLE -->
              <header class="post-header">
                <div class="post-title-row">
                  <h2 class="post-title">{{ item.title }}</h2>

                  <!-- Manager Controls (Discreet) -->
                  <div *ngIf="isManager()" class="manager-inline-controls">
                    <button
                      (click)="openEditModal(item)"
                      class="btn-manager-action"
                      title="Modifica post"
                    >
                      <i class="fa-solid fa-pen-to-square"></i> Modifica
                    </button>
                    <button
                      (click)="deletePost(item)"
                      class="btn-manager-action delete"
                      title="Elimina post"
                    >
                      <i class="fa-solid fa-trash-can"></i> Elimina
                    </button>
                  </div>
                </div>
              </header>

              <!-- 3. PHOTO SHOWCASE (Side Rotary Wheel + Horizontal Slide Track) -->
              <div
                class="post-photo-showcase"
                [class.has-multi-photos]="getPostImages(item).length > 1"
                (mouseenter)="pausePostRotation(item, i)"
                (mouseleave)="resumePostRotation(item, i)"
              >
                <div class="photo-stage-wrapper">
                  <!-- ART CANVAS FRAME (Pure Photo, Touch Swipe & Mouse Drag) -->
                  <div
                    class="art-canvas-frame"
                    [ngStyle]="getFrameStyle(item, i)"
                    (touchstart)="onTouchStart(item, i, $event)"
                    (touchmove)="onTouchMove(item, i, $event)"
                    (touchend)="onTouchEnd(item, i, $event)"
                    (mousedown)="onMouseDown(item, i, $event)"
                    (mousemove)="onMouseMove(item, i, $event)"
                    (mouseup)="onMouseUp(item, i, $event)"
                    (mouseleave)="onMouseLeave(item, i)"
                    (click)="onFrameClick(item, i)"
                    tabindex="0"
                    role="button"
                    [attr.aria-label]="'Ingrandisci fotografia di ' + item.title"
                    (keydown.enter)="onFrameClick(item, i)"
                  >
                    <!-- Sliding Track (Pure Photo, Zero Blurred Bars, Smooth Gestures) -->
                    <div class="canvas-track" [ngStyle]="getTrackStyle(item, i)">
                      <div
                        *ngFor="let imgUrl of getPostImages(item); let imgIdx = index"
                        class="canvas-slide"
                      >
                        <img
                          [src]="imgUrl"
                          [alt]="item.title + (getPostImages(item).length > 1 ? ' - scatto ' + (imgIdx + 1) : '')"
                          class="canvas-img"
                          (load)="onImageLoaded(imgUrl, $event)"
                          (error)="onImgFallback($event)"
                          draggable="false"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <!-- Minimalist Floating Nav Arrows (Delicate, subtle, visible only on hover on desktop) -->
                    <ng-container *ngIf="getPostImages(item).length > 1">
                      <button
                        *ngIf="getActivePhotoIndex(item, i) > 0"
                        type="button"
                        class="canvas-nav-arrow prev"
                        (click)="prevPhoto(item, i, $event)"
                        aria-label="Foto precedente"
                        title="Foto precedente"
                      >
                        <i class="fa-solid fa-chevron-left"></i>
                      </button>
                      <button
                        *ngIf="getActivePhotoIndex(item, i) < getPostImages(item).length - 1"
                        type="button"
                        class="canvas-nav-arrow next"
                        (click)="nextPhoto(item, i, $event)"
                        aria-label="Foto successiva"
                        title="Foto successiva"
                      >
                        <i class="fa-solid fa-chevron-right"></i>
                      </button>
                    </ng-container>
                  </div>

                  <!-- SIDE ROTARY WHEEL NAV (Right side, cylindrical view with blurred photo bars) -->
                  <nav
                    *ngIf="getPostImages(item).length > 1"
                    class="photo-wheel-nav"
                    (touchstart)="onWheelTouchStart(item, i, $event)"
                    (touchmove)="onWheelTouchMove(item, i, $event)"
                    (touchend)="onWheelTouchEnd(item, i)"
                    (touchcancel)="onWheelTouchEnd(item, i)"
                    (wheel)="onWheelScroll(item, i, $event)"
                    role="region"
                    [attr.aria-label]="'Selettore rotante scatti di ' + item.title"
                  >
                    <div
                      class="wheel-track"
                      [ngStyle]="getWheelTrackStyle(item, i)"
                      [class.is-dragging]="isWheelDragging()[getPostId(item, i)]"
                    >
                      <button
                        *ngFor="let imgUrl of getPostImages(item); let imgIdx = index"
                        type="button"
                        class="wheel-item"
                        [class.active]="imgIdx === getActivePhotoIndex(item, i)"
                        [ngStyle]="getWheelItemStyle(item, i, imgIdx)"
                        (click)="onWheelItemClick(item, i, imgIdx, $event)"
                        [attr.aria-label]="'Visualizza scatto ' + (imgIdx + 1)"
                        [attr.aria-current]="imgIdx === getActivePhotoIndex(item, i) ? 'true' : null"
                      >
                        <span class="wheel-num">{{ imgIdx + 1 }}</span>
                      </button>
                    </div>
                  </nav>
                </div>
              </div>

              <!-- 4. DESCRIPTIVE STORY & NARRATIVE (Elegante, Ben Visibile e Leggibile) -->
              <div class="post-story-body">
                <p class="post-narrative-text">{{ item.description }}</p>
              </div>

              <!-- 5. MARGINAL ACTIONS (Marginali, Sobrie, Non Invadenti) -->
              <footer class="post-marginal-footer">
                <div class="marginal-actions-row">
                  <a href="tel:0424500200" class="btn-marginal-link call-link" title="Chiama Il Veliero per informazioni o prenotazioni">
                    <i class="fa-solid fa-phone"></i>
                    <span>Chiama 0424 500 200</span>
                  </a>
                  <span class="marginal-sep" aria-hidden="true">•</span>
                  <button type="button" (click)="sharePost(item)" class="btn-marginal-link share-link" title="Condividi questo pescato">
                    <i class="fa-solid fa-share-nodes"></i>
                    <span>Condividi</span>
                  </button>
                </div>
              </footer>
            </article>

            <!-- INFINITE SCROLL LOADING MORE STATE -->
            <div *ngIf="isLoadingMore()" class="feed-loading-more">
              <div class="loading-more-spinner"></div>
              <span class="loading-more-text">Caricamento altri arrivi dal mare...</span>
            </div>

            <!-- END OF FEED NOTICE -->
            <div *ngIf="!hasMore() && catches().length > 0 && !isLoading()" class="feed-end-notice">
              <span class="end-line"></span>
              <span class="end-text">Hai consultato tutti gli arrivi del Diario</span>
              <span class="end-line"></span>
            </div>

            <!-- INFINITE SCROLL SENTINEL -->
            <div #scrollSentinel class="feed-scroll-sentinel" aria-hidden="true"></div>
          </div>
        </div>
      </section>

      <!-- CINEMATIC FULLSCREEN LIGHTBOX MODAL -->
      <div
        *ngIf="lightbox().isOpen"
        class="cinematic-lightbox-backdrop"
        (click)="closeLightbox()"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div class="lightbox-stage" (click)="$event.stopPropagation()">
          <!-- Top Bar -->
          <div class="lightbox-topbar">
            <div class="lightbox-info">
              <span class="lightbox-title">{{ lightbox().title }}</span>
              <span class="lightbox-counter">
                Scatto {{ lightbox().activeIndex + 1 }} di {{ lightbox().images.length }}
              </span>
            </div>
            <button
              type="button"
              (click)="closeLightbox()"
              class="lightbox-close-btn"
              aria-label="Chiudi galleria a schermo intero"
              title="Chiudi (Esc)"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Main Image Viewport -->
          <div class="lightbox-main-viewport">
            <button
              *ngIf="lightbox().images.length > 1"
              type="button"
              (click)="prevLightboxImage()"
              class="lightbox-nav-btn prev"
              aria-label="Foto precedente (Freccia Sinistra)"
              title="Foto precedente"
            >
              <i class="fa-solid fa-chevron-left"></i>
            </button>

            <div class="lightbox-img-wrapper">
              <img
                [src]="lightbox().images[lightbox().activeIndex]"
                [alt]="lightbox().title"
                class="lightbox-hero-img"
              />
            </div>

            <button
              *ngIf="lightbox().images.length > 1"
              type="button"
              (click)="nextLightboxImage()"
              class="lightbox-nav-btn next"
              aria-label="Foto successiva (Freccia Destra)"
              title="Foto successiva"
            >
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <!-- Bottom Thumbnail Navigation Strip -->
          <div *ngIf="lightbox().images.length > 1" class="lightbox-thumbnails-strip">
            <button
              *ngFor="let img of lightbox().images; let idx = index"
              type="button"
              class="lightbox-thumb-btn"
              [class.active]="lightbox().activeIndex === idx"
              (click)="setLightboxIndex(idx)"
              [attr.aria-label]="'Visualizza scatto ' + (idx + 1)"
            >
              <img [src]="img" [alt]="'Miniatura ' + (idx + 1)" />
            </button>
          </div>
        </div>
      </div>

      <!-- MANAGER POST MODAL (Semplificato & Focalizzato) -->
      <app-modal
        *ngIf="isModalOpen()"
        [title]="editingItem() ? 'Modifica Post Diario' : 'Nuovo Post Diario del Pescato'"
        (closed)="closeModal()"
      >
        <form (ngSubmit)="savePost()" class="manager-form">
          <div class="form-group">
            <label>Titolo del Pescato *</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="formTitle"
              name="title"
              required
              placeholder="es. Dentice nostrano dell'Adriatico"
            />
          </div>

          <div class="form-group">
            <label>Descrizione & Note dello Chef *</label>
            <textarea
              class="form-control"
              [(ngModel)]="formDescription"
              name="description"
              rows="4"
              required
              placeholder="Racconta la freschezza, le caratteristiche del pescato e le preparazioni consigliate dallo Chef..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Data di Arrivo</label>
            <input
              type="date"
              class="form-control"
              [(ngModel)]="formCatchDate"
              name="catchDate"
            />
          </div>

          <div class="form-group">
            <label>Fotografie d'Autore (uno o più URL/percorsi, uno per riga)</label>
            <textarea
              class="form-control"
              [(ngModel)]="formImagesText"
              name="imagesText"
              rows="3"
              placeholder="assets/images/cards/card-pescato.jpg&#10;assets/videos/card-pescato-poster.jpg"
            ></textarea>
            <small class="field-hint">
              Inserisci uno o più percorsi immagine per creare automaticamente una composizione artistica (dittico, trittico o mosaico).
            </small>
          </div>

          <div class="modal-footer-actions">
            <button type="button" (click)="closeModal()" class="btn btn-outline btn-sm">Annulla</button>
            <button type="submit" class="btn btn-gold btn-sm" [disabled]="!formTitle || !formDescription">
              {{ editingItem() ? 'Aggiorna Post' : 'Pubblica Post' }}
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
  styles: [`
    .diario-di-bordo-page {
      position: relative;
      background: var(--bg-primary, #F1F5F9);
      min-height: 100vh;
    }

    /* Emblem Hero */
    .diario-hero-section {
      background: var(--bg-navy-dark, #1E293B);
      color: #ffffff;
      margin-top: -82px;
      padding: calc(82px + 2.75rem) 0 3.75rem;
      text-align: center;
      position: relative;
      overflow: hidden;

      .hero-inner {
        position: relative;
        z-index: 2;
        max-width: 820px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }

      .hero-title {
        font-family: var(--font-heading, 'Cinzel', serif);
        font-size: clamp(2.4rem, 4.5vw, 3.4rem);
        letter-spacing: 3px;
        color: #ffffff;
        margin-bottom: 1.75rem;
        line-height: 1.15;
      }

      .hero-diario-sub {
        color: var(--text-inverse-muted, #CBD5E1);
        font-size: 1.14rem;
        max-width: 660px;
        margin: 0 auto 2.25rem;
        line-height: 1.7;
        font-family: var(--font-serif-primary);
        font-style: italic;
      }

      .hero-links-row {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }

    /* Feed Container */
    .diario-feed-section {
      padding: 2rem 0 4rem;

      .feed-container {
        max-width: 620px;
        margin: 0 auto;
        padding: 0 1.25rem;
      }
    }

    /* Manager Control Bar */
    .manager-action-bar {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 0.9rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      border-radius: 4px;

      .manager-bar-info {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        font-size: 0.9rem;
        color: #166534;

        .text-accent {
          color: #15803d;
          font-size: 1.25rem;
        }

        strong {
          display: block;
          color: #14532d;
          font-size: 0.92rem;
        }

        span {
          font-size: 0.82rem;
          color: #166534;
        }
      }
    }

    /* Share Notification */
    .share-toast-notification {
      background: var(--bg-navy-dark, #1E293B);
      color: #ffffff;
      padding: 0.65rem 1.35rem;
      border-radius: 3px;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      font-weight: 600;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--border-accent, rgba(14, 165, 233, 0.4));
      margin-bottom: 2rem;
      animation: fadeIn 0.25s ease;

      i { color: #4ade80; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4.5rem 2rem;
      color: var(--text-muted, #64748B);

      .empty-icon {
        font-size: 2.75rem;
        color: var(--color-accent, #0369A1);
        opacity: 0.6;
        margin-bottom: 1.25rem;
      }

      h3 {
        color: var(--text-primary, #1E293B);
        font-size: 1.45rem;
        margin-bottom: 0.5rem;
        font-family: var(--font-serif-display);
      }

      p {
        max-width: 520px;
        margin: 0 auto;
        line-height: 1.65;
      }
    }

    /* Chronological Editorial Feed (Refined, Frameless, Rich Motion) */
    .diario-editorial-feed {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      width: 100%;

      .feed-loading-more {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 1.5rem 0;
        width: 100%;
        max-width: 520px;
        margin: 0 auto;
        color: var(--text-muted, #64748B);
        font-size: 0.85rem;
        font-family: var(--font-sans, system-ui, sans-serif);

        .loading-more-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(197, 168, 128, 0.25);
          border-top-color: var(--color-gold, #C5A880);
          border-radius: 50%;
          animation: feedSpin 0.75s linear infinite;
        }

        .loading-more-text {
          font-weight: 500;
          letter-spacing: 0.02em;
        }
      }

      .feed-end-notice {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        width: 100%;
        max-width: 520px;
        margin: 2.25rem auto 1.25rem;

        .end-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--border-subtle, #D4D4D8) 15%,
            var(--border-subtle, #D4D4D8) 85%,
            transparent
          );
        }

        .end-text {
          font-size: 0.76rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted, #94A3B8);
          white-space: nowrap;
        }
      }

      .feed-scroll-sentinel {
        width: 100%;
        height: 1px;
        pointer-events: none;
        visibility: hidden;
      }
    }

    @keyframes feedSpin {
      to { transform: rotate(360deg); }
    }

    .diario-post-entry {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      max-width: 520px;
      margin: 0 auto 2rem;
      background: transparent;
      opacity: 0;
      animation: postEntrance 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;

      &:not(:first-child) {
        content-visibility: auto;
        contain-intrinsic-size: auto 650px;
      }

      &:first-child .post-timeline-divider {
        margin-top: 0.25rem;
      }

      /* Unified strict max-width for clear hierarchy and left alignment */
      .post-timeline-divider,
      .post-header,
      .post-photo-showcase,
      .post-story-body,
      .post-marginal-footer {
        width: 100%;
        max-width: 520px;
        margin-left: 0;
        margin-right: 0;
      }

      /* 1. The Post Timeline Divider (Centered date interrupted by elegant horizontal lines) */
      .post-timeline-divider {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        width: 100%;
        margin: 1.25rem 0 0.75rem;

        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--border-subtle, #D4D4D8) 12%,
            var(--border-subtle, #D4D4D8) 88%,
            transparent
          );
          transform-origin: center;
          animation: expandDivider 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .divider-date {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted, #64748B);
          white-space: nowrap;
          padding: 0 0.4rem;
          transition: color 0.3s ease, letter-spacing 0.3s ease;
          user-select: none;

          &:hover {
            color: var(--color-gold, #C5A880);
            letter-spacing: 0.14em;
          }
        }
      }

      /* 2. Post Header & Prominent Title (Left-Aligned Editorial Hierarchy) */
      .post-header {
        margin-bottom: 0.65rem;
        text-align: left;

        .post-title-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          text-align: left;
          gap: 0.75rem;
          flex-wrap: wrap;

          .post-title {
            font-family: var(--font-serif-display);
            font-size: clamp(1.2rem, 1.8vw, 1.45rem);
            font-weight: 700;
            color: var(--text-primary, #1E293B);
            line-height: 1.22;
            letter-spacing: -0.015em;
            margin: 0;
            text-align: left;
            transition: color 0.25s ease;

            &:hover {
              color: var(--color-accent-hover, #075985);
            }
          }

          .manager-inline-controls {
            display: inline-flex;
            align-items: center;
            justify-content: flex-start;
            gap: 0.5rem;
            margin-top: 0.15rem;

            .btn-manager-action {
              background: transparent;
              border: 1px solid var(--border-subtle, #D4D4D8);
              padding: 0.2rem 0.55rem;
              border-radius: 3px;
              font-size: 0.72rem;
              font-weight: 600;
              color: var(--text-muted, #64748B);
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              gap: 0.3rem;
              transition: all 0.2s ease;

              &:hover {
                background: #f8fafc;
                color: var(--color-accent-hover, #075985);
                border-color: var(--color-accent, #0369A1);
              }

              &.delete:hover {
                background: #fef2f2;
                color: var(--status-danger, #DC2626);
                border-color: #fca5a5;
              }
            }
          }
        }
      }

      /* 3. The Photo Showcase (Side Rotary Wheel + Minimalist Canvas) */
      .post-photo-showcase {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        margin-bottom: 0.75rem;

        .photo-stage-wrapper {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          max-width: 520px;
          margin: 0;
          position: relative;
        }

        /* Side Rotary Wheel Navigation (Right of Photo, Cylindrical Perspective) */
        .photo-wheel-nav {
          --wheel-item-h: 26px;
          --wheel-gap: 3px;
          --wheel-step: 29px;
          --wheel-half: 13px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 140px;
          flex-shrink: 0;
          margin-left: 10px;
          margin-right: 0;
          overflow: hidden;
          perspective: 750px;
          user-select: none;
          touch-action: none;
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 15%,
            black 85%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 15%,
            black 85%,
            transparent 100%
          );

          .wheel-track {
            position: absolute;
            top: 50%;
            left: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--wheel-gap, 3px);
            transform-style: preserve-3d;
            will-change: transform;
            width: 100%;

            &.is-dragging {
              transition: none !important;
            }
          }

          .wheel-item {
            height: var(--wheel-item-h, 26px);
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            padding: 0;
            cursor: pointer;
            user-select: none;
            touch-action: none;
            outline: none;
            width: 100%;
            transform-origin: center center;
            will-change: transform, opacity;
            transition: transform 0.48s cubic-bezier(0.2, 1, 0.3, 1),
                        opacity 0.48s cubic-bezier(0.2, 1, 0.3, 1);

            .wheel-num {
              font-family: var(--font-serif-display, Georgia, serif);
              font-size: 0.85rem;
              font-weight: 500;
              color: var(--text-muted, #64748B);
              text-align: center;
              line-height: 1;
              display: inline-block;
              transition: color 0.3s ease, font-size 0.3s ease, transform 0.3s ease;
            }

            /* Desktop Hover reaction */
            @media (hover: hover) and (pointer: fine) {
              &:not(.active):hover {
                .wheel-num {
                  color: var(--color-gold, #C5A880);
                  transform: scale(1.15);
                }
              }
            }

            /* Active Wheel Item State */
            &.active {
              .wheel-num {
                color: var(--color-gold, #C5A880);
                font-size: 1.1rem;
                font-weight: 700;
                transform: scale(1.1);
                text-shadow: 0 0 12px rgba(234, 179, 8, 0.25);
              }
            }
          }
        }

        .art-canvas-frame {
          position: relative;
          max-width: 520px;
          max-height: min(50vh, 420px);
          margin: 0;
          overflow: hidden;
          border-radius: 0 !important;
          background: #0f172a;
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
          border: 1px solid rgba(226, 232, 240, 0.8);
          cursor: grab;
          touch-action: pan-y;
          user-select: none;
          transition: transform 0.35s ease,
                      box-shadow 0.35s ease;

          &:active {
            cursor: grabbing;
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 28px -4px rgba(15, 23, 42, 0.14);

            .canvas-nav-arrow {
              opacity: 0.85;
              pointer-events: auto;
            }
          }

          /* Sliding Track */
          .canvas-track {
            display: flex;
            width: 100%;
            height: 100%;
            will-change: transform;
          }

          /* Slide inside track */
          .canvas-slide {
            flex: 0 0 100%;
            width: 100%;
            height: 100%;
            min-width: 100%;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 !important;
            box-sizing: border-box;

            .canvas-img {
              width: 100%;
              height: 100%;
              object-fit: cover !important;
              object-position: center center !important;
              display: block;
              user-select: none;
              -webkit-user-drag: none;
              pointer-events: none;
              border-radius: 0 !important;
              filter: none !important;
            }
          }

          /* Minimalist Floating Nav Arrows */
          .canvas-nav-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
            color: #1E293B;
            font-size: 0.68rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 5;
            opacity: 0;
            pointer-events: none;
            transition: all 0.2s ease;

            &.prev {
              left: 8px;
            }

            &.next {
              right: 8px;
            }

            &:hover {
              background: #ffffff;
              color: var(--color-gold, #C5A880);
              transform: translateY(-50%) scale(1.08);
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
            }
          }
        }
      }

      /* 4. Story & Narrative (Leggibile, Elegante, Allineata a Sinistra) */
      .post-story-body {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        text-align: left;

        .post-narrative-text {
          font-family: var(--font-body-editorial, 'Plus Jakarta Sans', sans-serif);
          font-size: 0.92rem;
          font-weight: 450;
          font-style: normal;
          line-height: 1.55;
          color: var(--text-secondary, #334155);
          letter-spacing: 0.005em;
          margin: 0;
          max-width: 520px;
          text-align: left;
        }
      }

      /* 5. Marginal Actions (Marginali, Sobrie, Allineate a Sinistra) */
      .post-marginal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-top: 0.35rem;
        padding-top: 0;
        border-top: none;

        .marginal-actions-row {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0.75rem;

          .marginal-sep {
            color: var(--text-light, #CBD5E1);
            font-size: 0.75rem;
          }

          .btn-marginal-link {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            background: transparent;
            border: none;
            padding: 0.2rem 0.45rem;
            color: var(--text-muted, #64748B);
            font-family: var(--font-sans);
            font-size: 0.78rem;
            font-weight: 500;
            text-decoration: none;
            cursor: pointer;
            border-radius: 3px;
            transition: color 0.25s ease, background-color 0.25s ease, transform 0.2s ease;

            i {
              font-size: 0.75rem;
              color: var(--text-muted, #64748B);
              transition: color 0.25s ease, transform 0.25s ease;
            }

            &:hover {
              color: var(--color-accent-hover, #075985);
              background: rgba(3, 105, 161, 0.08);
              transform: translateY(-1px);

              i {
                color: var(--color-accent-hover, #075985);
              }
            }

            &.call-link:hover i {
              animation: ringPhone 0.6s ease-in-out;
              color: var(--color-gold, #C5A880);
            }

            &.share-link:hover i {
              animation: shareNudge 0.4s ease-in-out;
              color: var(--color-accent-hover, #075985);
            }
          }
        }
      }
    }

    /* FULLSCREEN CINEMATIC LIGHTBOX */
    .cinematic-lightbox-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(14px);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.25s ease;

      .lightbox-stage {
        display: flex;
        flex-direction: column;
        width: 100vw;
        height: 100vh;
        max-width: 1280px;
        padding: 1.5rem;
        box-sizing: border-box;

        .lightbox-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;

          .lightbox-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            .lightbox-title {
              font-family: var(--font-serif-display);
              font-size: 1.35rem;
              font-weight: 700;
              color: #ffffff;
            }

            .lightbox-counter {
              font-family: var(--font-sans);
              font-size: 0.82rem;
              color: var(--color-accent-light, #BAE6FD);
              font-weight: 600;
              letter-spacing: 0.06em;
            }
          }

          .lightbox-close-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            width: 42px;
            height: 42px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            transition: all 0.2s ease;

            &:hover {
              background: var(--status-danger, #DC2626);
              border-color: var(--status-danger, #DC2626);
            }
          }
        }

        .lightbox-main-viewport {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          position: relative;
          min-height: 0;
          padding: 1.25rem 0;

          .lightbox-nav-btn {
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.25);
            color: #ffffff;
            width: 52px;
            height: 52px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.35rem;
            transition: all 0.2s ease;
            flex-shrink: 0;

            &:hover {
              background: var(--color-accent, #0369A1);
              border-color: var(--color-accent, #0369A1);
            }
          }

          .lightbox-img-wrapper {
            flex: 1;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;

            .lightbox-hero-img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
              border-radius: 4px;
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
              animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
          }
        }

        .lightbox-thumbnails-strip {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          overflow-x: auto;

          .lightbox-thumb-btn {
            width: 72px;
            height: 52px;
            border-radius: 3px;
            overflow: hidden;
            border: 2px solid transparent;
            padding: 0;
            background: transparent;
            cursor: pointer;
            opacity: 0.5;
            transition: all 0.2s ease;
            flex-shrink: 0;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }

            &.active {
              border-color: var(--color-gold, #EAB308);
              opacity: 1;
              transform: scale(1.05);
            }

            &:hover {
              opacity: 0.9;
            }
          }
        }
      }
    }

    @keyframes postEntrance {
      0% {
        opacity: 0;
        transform: translateY(24px) scale(0.985);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes expandDivider {
      from {
        transform: scaleX(0);
        opacity: 0;
      }
      to {
        transform: scaleX(1);
        opacity: 1;
      }
    }

    @keyframes ringPhone {
      0%, 100% { transform: rotate(0); }
      20%, 60% { transform: rotate(-14deg); }
      40%, 80% { transform: rotate(14deg); }
    }

    @keyframes shareNudge {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px) scale(1.15); }
    }

    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Manager Modal */
    .manager-form {
      .field-hint {
        display: block;
        font-size: 0.8rem;
        color: var(--text-muted, #64748B);
        margin-top: 0.35rem;
      }

      .modal-footer-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }
    }

        /* Mobile Responsive Breakpoints */
    @media (max-width: 820px) {
      .diario-post-entry {
        .post-photo-showcase {
          .photo-stage-wrapper {
            max-width: 100%;
          }

          .photo-wheel-nav {
            --wheel-item-h: 24px;
            --wheel-gap: 3px;
            --wheel-step: 27px;
            --wheel-half: 12px;
            width: 34px;
            height: 130px;
            margin-left: 6px;
            margin-right: 0;

            .wheel-item {
              height: var(--wheel-item-h, 24px);
              padding: 0;

              .wheel-num {
                font-size: 0.8rem;
                min-width: auto;
                text-align: center;
              }

              &.active {
                .wheel-num {
                  font-size: 0.95rem;
                }
              }
            }
          }

          .art-canvas-frame {
            max-height: min(48vh, 380px);
            border-radius: 0 !important;

            .canvas-slide {
              padding: 0 !important;
            }

            .canvas-nav-arrow {
              display: none !important;
            }
          }
        }

        .post-story-body .post-narrative-text {
          font-size: 0.9rem;
          line-height: 1.5;
        }
      }

      .cinematic-lightbox-backdrop .lightbox-stage {
        padding: 1rem 0.75rem;

        .lightbox-main-viewport {
          .lightbox-nav-btn {
            width: 40px;
            height: 40px;
            font-size: 1.1rem;
          }
        }
      }
    }

    @media (max-width: 480px) {
      .diario-post-entry {
        .post-photo-showcase {
          .art-canvas-frame {
            max-height: min(45vh, 320px);
            border-radius: 0 !important;

            .canvas-slide {
              padding: 0 !important;
            }
          }

          .photo-wheel-nav {
            --wheel-item-h: 22px;
            --wheel-gap: 2px;
            --wheel-step: 24px;
            --wheel-half: 11px;
            width: 28px;
            height: 120px;
            margin-left: 4px;
            margin-right: 0;

            .wheel-item {
              height: var(--wheel-item-h, 22px);
              padding: 0;

              .wheel-num {
                font-size: 0.74rem;
                min-width: auto;
                text-align: center;
              }

              &.active {
                .wheel-num {
                  font-size: 0.88rem;
                }
              }
            }
          }
        }
      }
    }
  `],
})
export class PescatoComponent implements OnInit, OnDestroy {
  private pescatoService = inject(PescatoService);
  public authService = inject(AuthService);

  public readonly pageSize = 6;
  public currentPage = signal<number>(1);
  public totalPages = signal<number>(1);
  public totalCatches = signal<number>(0);
  public catches = signal<PescatoItem[]>([]);
  public isLoading = signal<boolean>(true);
  public isLoadingMore = signal<boolean>(false);
  public hasMore = computed(() => this.currentPage() < this.totalPages());
  public shareToastMessage = signal<string>('');

  private scrollObserver?: IntersectionObserver;

  @ViewChild('scrollSentinel')
  set scrollSentinel(element: ElementRef<HTMLDivElement> | undefined) {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
    if (element?.nativeElement && typeof IntersectionObserver !== 'undefined') {
      this.scrollObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            if (!this.isLoading() && !this.isLoadingMore() && this.hasMore()) {
              this.loadNextPage();
            }
          }
        },
        {
          root: null,
          rootMargin: '400px 0px',
          threshold: 0,
        }
      );
      this.scrollObserver.observe(element.nativeElement);
    }
  }

  // Single-Frame Dynamic Showcase State & Auto-Rotation
  public activePhotoIndexMap = signal<Record<string, number>>({});
  public imageRatios = signal<Record<string, number>>({});
  public dominantMatteMap = signal<Record<string, { center: string; edge: string }>>({});
  private pausedPostIds = new Set<string>();
  private rotationInterval: any = null;

  // Touch Swipe & Mouse Drag Carousel State
  public draggingPostId = signal<string | null>(null);
  public dragOffset = signal<number>(0);
  private dragStartX = 0;
  private dragStartY = 0;
  private isDraggingActive = false;
  private hasDraggedOrSwiped = false;
  private dragResetTimeout: any = null;
  private activeDragItem: PescatoItem | null = null;
  private activeDragIdx = -1;

  // Side Rotary Wheel State
  public wheelDragOffset = signal<Record<string, number>>({});
  public isWheelDragging = signal<Record<string, boolean>>({});
  private wheelTouchStartY = 0;
  private wheelTouchStartX = 0;
  private lastWheelScrollTime = 0;

  // Manager Inline Controls
  public isModalOpen = signal<boolean>(false);
  public editingItem = signal<PescatoItem | null>(null);

  // Form Fields
  public formTitle = '';
  public formDescription = '';
  public formCatchDate = new Date().toISOString().split('T')[0];
  public formImagesText = 'assets/images/cards/card-pescato.jpg';

  // Lightbox State
  public lightbox = signal<LightboxState>({
    isOpen: false,
    images: [],
    activeIndex: 0,
    title: '',
  });

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.lightbox().isOpen) return;

    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowRight') {
      this.nextLightboxImage();
    } else if (event.key === 'ArrowLeft') {
      this.prevLightboxImage();
    }
  }

  @HostListener('window:mouseup')
  handleWindowMouseUp(): void {
    if (this.isDraggingActive && this.activeDragItem) {
      this.finishDrag(this.activeDragItem, this.activeDragIdx);
    }
  }

  ngOnInit(): void {
    this.fetchCatches();
    this.startAutoRotation();
  }

  ngOnDestroy(): void {
    this.stopAutoRotation();
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
    if (this.dragResetTimeout) {
      clearTimeout(this.dragResetTimeout);
    }
  }

  isManager(): boolean {
    const user = this.authService.currentUser();
    return user !== null && (user.role === 'admin' || user.role === 'gestore');
  }

  fetchCatches(reset: boolean = true): void {
    if (reset) {
      this.isLoading.set(true);
      this.currentPage.set(1);
    }
    this.pescatoService.getPescatoList({
      all: true,
      page: 1,
      limit: this.pageSize,
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.catches.set(res.data);
          this.currentPage.set(res.page || 1);
          this.totalPages.set(res.totalPages || 1);
          if (res.total !== undefined) {
            this.totalCatches.set(res.total);
          }
          this.preloadCatchesImages(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadNextPage(): void {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMore()) return;
    this.isLoadingMore.set(true);
    const nextPage = this.currentPage() + 1;

    this.pescatoService.getPescatoList({
      all: true,
      page: nextPage,
      limit: this.pageSize,
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.catches.update((prev) => [...prev, ...res.data]);
          this.currentPage.set(res.page || nextPage);
          this.totalPages.set(res.totalPages || this.totalPages());
          if (res.total !== undefined) {
            this.totalCatches.set(res.total);
          }
          this.preloadCatchesImages(res.data);
        }
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.isLoadingMore.set(false);
      },
    });
  }

  preloadCatchesImages(catches: PescatoItem[]): void {
    catches.forEach((item) => {
      const images = this.getPostImages(item);
      images.forEach((url) => {
        if (!this.imageRatios()[url]) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            if (img.naturalWidth && img.naturalHeight) {
              const ratio = img.naturalWidth / img.naturalHeight;
              this.imageRatios.update((map) => ({ ...map, [url]: ratio }));
              this.extractDominantMatte(img, url);
            }
          };
          img.src = url;
        }
      });
    });
  }

  onImageLoaded(url: string, event: Event): void {
    const target = event?.target as HTMLImageElement;
    if (target && target.naturalWidth && target.naturalHeight) {
      const ratio = target.naturalWidth / target.naturalHeight;
      this.imageRatios.update((map) => {
        if (map[url] === ratio) return map;
        return { ...map, [url]: ratio };
      });
      this.extractDominantMatte(target, url);
    }
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h = Math.round(h * 60);
    }

    return { h, s, l };
  }

  private getDefaultMatte(): { center: string; edge: string } {
    return {
      center: '#182438',
      edge: '#0b121e',
    };
  }

  public extractDominantMatte(img: HTMLImageElement, url: string): void {
    if (!url || this.dominantMatteMap()[url]) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        this.dominantMatteMap.update((m) => ({ ...m, [url]: this.getDefaultMatte() }));
        return;
      }

      ctx.drawImage(img, 0, 0, 32, 32);
      const data = ctx.getImageData(0, 0, 32, 32).data;

      // 4-bit per channel color quantization buckets (16x16x16 bins)
      const buckets: Record<number, { count: number; r: number; g: number; b: number }> = {};

      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 128) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const { l } = this.rgbToHsl(r, g, b);
        // Exclude extreme pitch blacks (< 10%) or specular highlights (> 95%)
        if (l < 0.10 || l > 0.95) continue;

        const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
        if (!buckets[key]) {
          buckets[key] = { count: 0, r: 0, g: 0, b: 0 };
        }
        buckets[key].count++;
        buckets[key].r += r;
        buckets[key].g += g;
        buckets[key].b += b;
      }

      const sorted = Object.values(buckets).sort((a, b) => b.count - a.count);
      if (sorted.length === 0) {
        this.dominantMatteMap.update((m) => ({ ...m, [url]: this.getDefaultMatte() }));
        return;
      }

      const top = sorted[0];
      const avgR = Math.round(top.r / top.count);
      const avgG = Math.round(top.g / top.count);
      const avgB = Math.round(top.b / top.count);

      const { h, s, l } = this.rgbToHsl(avgR, avgG, avgB);

      // If nearly neutral / cool paper (s < 0.05), harmonize with soft nautical azzurro (218 deg)
      const isNeutralCool = s < 0.05 && ((h >= 170 && h <= 270) || h === 0);
      const matteHue = isNeutralCool ? 218 : h;
      const matteSat = isNeutralCool ? 16 : Math.max(12, Math.min(26, Math.round(s * 100)));

      // Adaptive Lightness: follows the image luminance closely (low contrast, pastel/dark pairing)
      let centerLight: number;
      let edgeLight: number;

      if (l >= 0.45) {
        // Light / daytime / pastel images (e.g. business card, bright daylight)
        centerLight = Math.min(78, Math.round(l * 100 * 0.92 + 6));
        edgeLight = Math.max(centerLight - 6, Math.round(centerLight * 0.92));
      } else {
        // Dark / mood / evening / seafood images
        centerLight = Math.max(16, Math.round(l * 100 * 0.95));
        edgeLight = Math.max(10, Math.round(centerLight * 0.65));
      }

      const matte = {
        center: `hsl(${matteHue}, ${matteSat}%, ${centerLight}%)`,
        edge: `hsl(${matteHue}, ${matteSat + 3}%, ${edgeLight}%)`,
      };

      this.dominantMatteMap.update((m) => ({ ...m, [url]: matte }));
    } catch {
      // Fallback for CORS SecurityError
      this.dominantMatteMap.update((m) => ({ ...m, [url]: this.getDefaultMatte() }));
    }
  }

  public getPostMatte(item: PescatoItem, postIdx: number): { center: string; edge: string } {
    const images = this.getPostImages(item);
    const activeIdx = this.getActivePhotoIndex(item, postIdx);
    const activeUrl = images[activeIdx] || images[0];
    if (activeUrl && this.dominantMatteMap()[activeUrl]) {
      return this.dominantMatteMap()[activeUrl];
    }
    return this.getDefaultMatte();
  }

  public getPostAspectRatio(item: PescatoItem, postIdx: number): string {
    const images = this.getPostImages(item);
    const firstUrl = images[0];
    const rawRatio = this.imageRatios()[firstUrl];

    if (!rawRatio || isNaN(rawRatio)) {
      return '1 / 1';
    }

    // Instagram Constraint Bounds:
    // Min ratio: Vertical 4:5 = 0.80 (1080 x 1350)
    // Max ratio: Horizontal up to 1.91:1 = 1.91 (1080 x 566)
    const clamped = Math.max(0.80, Math.min(1.91, rawRatio));

    if (Math.abs(clamped - 1.0) < 0.05) {
      return '1 / 1';
    }
    if (Math.abs(clamped - 0.80) < 0.03) {
      return '4 / 5';
    }
    if (Math.abs(clamped - 1.91) < 0.03 || Math.abs(clamped - (16 / 9)) < 0.03) {
      return '1.91 / 1';
    }

    return `${Math.round(clamped * 100) / 100} / 1`;
  }

  getFrameStyle(item: PescatoItem, postIdx: number): { [key: string]: string } {
    const images = this.getPostImages(item);
    const isMulti = images.length > 1;
    const maxW = isMulti ? '460px' : '520px';
    const aspectRatio = this.getPostAspectRatio(item, postIdx);

    return {
      width: '100%',
      'max-width': maxW,
      'aspect-ratio': aspectRatio,
    };
  }

  getPostImages(item: PescatoItem): string[] {
    // 1. If explicit images array is present
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const valid = item.images
        .filter((img) => typeof img === 'string' && img.trim().length > 0)
        .map((img) => img.trim());
      if (valid.length > 0) return valid;
    }

    // 2. If single image string is present (support newline or comma separated URLs)
    if (item.image && typeof item.image === 'string' && item.image.trim().length > 0) {
      const parts = item.image
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (parts.length > 0) {
        return parts;
      }
    }

    return ['assets/images/cards/card-pescato.jpg'];
  }

  getPostId(item: PescatoItem, idx: number): string {
    return item.id || item._id || ('post-' + idx);
  }

  getActivePhotoIndex(item: PescatoItem, idx: number): number {
    const id = this.getPostId(item, idx);
    return this.activePhotoIndexMap()[id] || 0;
  }

  setPhotoIndex(item: PescatoItem, idx: number, photoIdx: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const id = this.getPostId(item, idx);
    this.activePhotoIndexMap.update((map) => ({ ...map, [id]: photoIdx }));
    this.resetAutoRotation();
  }

  getTrackStyle(item: PescatoItem, idx: number): { [key: string]: string } {
    const activeIdx = this.getActivePhotoIndex(item, idx);
    const postId = this.getPostId(item, idx);
    const isThisDragging = this.draggingPostId() === postId;
    const rawOffset = isThisDragging ? this.dragOffset() : 0;
    // Clamping to max 120px prevents revealing further slides and ensures stopping at the next image
    const clampedOffset = Math.max(-120, Math.min(120, rawOffset));

    if (isThisDragging) {
      return {
        transform: `translateX(calc(-${activeIdx * 100}% + ${clampedOffset}px))`,
        transition: 'none',
      };
    }

    return {
      transform: `translateX(-${activeIdx * 100}%)`,
      transition: 'transform 0.48s cubic-bezier(0.2, 1, 0.3, 1)',
    };
  }

  finishDrag(item: PescatoItem, idx: number): void {
    if (!this.isDraggingActive) return;
    this.isDraggingActive = false;
    const offset = this.dragOffset();
    const current = this.getActivePhotoIndex(item, idx);
    const total = this.getPostImages(item).length;

    // Responsive threshold (14px): effortless single-image transition
    if (offset < -14 && current < total - 1) {
      this.nextPhoto(item, idx);
    } else if (offset > 14 && current > 0) {
      this.prevPhoto(item, idx);
    }

    this.draggingPostId.set(null);
    this.dragOffset.set(0);
    this.activeDragItem = null;
    this.activeDragIdx = -1;
    this.resumePostRotation(item, idx);
    this.resetAutoRotation();

    if (this.dragResetTimeout) clearTimeout(this.dragResetTimeout);
    this.dragResetTimeout = setTimeout(() => {
      this.hasDraggedOrSwiped = false;
    }, 200);
  }

  onTouchStart(item: PescatoItem, idx: number, event: TouchEvent): void {
    const images = this.getPostImages(item);
    if (images.length <= 1 || event.touches.length !== 1) return;
    this.pausePostRotation(item, idx);
    this.dragStartX = event.touches[0].clientX;
    this.dragStartY = event.touches[0].clientY;
    this.isDraggingActive = true;
    this.hasDraggedOrSwiped = false;
    this.activeDragItem = item;
    this.activeDragIdx = idx;
    this.draggingPostId.set(this.getPostId(item, idx));
    this.dragOffset.set(0);
  }

  onTouchMove(item: PescatoItem, idx: number, event: TouchEvent): void {
    if (!this.isDraggingActive || event.touches.length !== 1) return;
    const deltaX = event.touches[0].clientX - this.dragStartX;
    const deltaY = event.touches[0].clientY - this.dragStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
      if (event.cancelable) {
        event.preventDefault();
      }
      this.hasDraggedOrSwiped = true;
      const current = this.getActivePhotoIndex(item, idx);
      const total = this.getPostImages(item).length;
      let effectiveDelta = deltaX;
      if ((current === 0 && deltaX > 0) || (current === total - 1 && deltaX < 0)) {
        effectiveDelta = deltaX * 0.25;
      }
      this.dragOffset.set(effectiveDelta);
    }
  }

  onTouchEnd(item: PescatoItem, idx: number, event: TouchEvent): void {
    this.finishDrag(item, idx);
  }

  onMouseDown(item: PescatoItem, idx: number, event: MouseEvent): void {
    const images = this.getPostImages(item);
    if (images.length <= 1 || event.button !== 0) return;
    this.pausePostRotation(item, idx);
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.isDraggingActive = true;
    this.hasDraggedOrSwiped = false;
    this.activeDragItem = item;
    this.activeDragIdx = idx;
    this.draggingPostId.set(this.getPostId(item, idx));
    this.dragOffset.set(0);
  }

  onMouseMove(item: PescatoItem, idx: number, event: MouseEvent): void {
    if (!this.isDraggingActive) return;
    const deltaX = event.clientX - this.dragStartX;
    if (Math.abs(deltaX) > 4) {
      this.hasDraggedOrSwiped = true;
      const current = this.getActivePhotoIndex(item, idx);
      const total = this.getPostImages(item).length;
      let effectiveDelta = deltaX;
      if ((current === 0 && deltaX > 0) || (current === total - 1 && deltaX < 0)) {
        effectiveDelta = deltaX * 0.25;
      }
      this.dragOffset.set(effectiveDelta);
    }
  }

  onMouseUp(item: PescatoItem, idx: number, event: MouseEvent): void {
    this.finishDrag(item, idx);
  }

  onMouseLeave(item: PescatoItem, idx: number): void {
    if (this.isDraggingActive) {
      // Exiting the frame while dragging completes the transition to the next/prev photo and stops there
      this.finishDrag(item, idx);
    }
    this.resumePostRotation(item, idx);
  }

  onFrameClick(item: PescatoItem, idx: number): void {
    if (this.hasDraggedOrSwiped) {
      return;
    }
    const images = this.getPostImages(item);
    const activeIdx = this.getActivePhotoIndex(item, idx);
    this.openLightbox(images, activeIdx, item.title);
  }

  nextPhoto(item: PescatoItem, idx: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const images = this.getPostImages(item);
    if (images.length <= 1) return;
    const current = this.getActivePhotoIndex(item, idx);
    if (current < images.length - 1) {
      this.setPhotoIndex(item, idx, current + 1);
    }
  }

  prevPhoto(item: PescatoItem, idx: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const images = this.getPostImages(item);
    if (images.length <= 1) return;
    const current = this.getActivePhotoIndex(item, idx);
    if (current > 0) {
      this.setPhotoIndex(item, idx, current - 1);
    }
  }

  // Side Rotary Wheel Methods & Tactile Interactions
  getWheelTrackStyle(item: PescatoItem, postIdx: number): { [key: string]: string } {
    const activeIdx = this.getActivePhotoIndex(item, postIdx);
    const id = this.getPostId(item, postIdx);
    const isDragging = !!this.isWheelDragging()[id];
    const dragOffset = this.wheelDragOffset()[id] || 0;

    return {
      transform: `translateY(calc(-${activeIdx} * var(--wheel-step, 36px) - var(--wheel-half, 16px) + ${dragOffset}px))`,
      transition: isDragging ? 'none' : 'transform 0.48s cubic-bezier(0.2, 1, 0.3, 1)',
    };
  }

  getWheelItemStyle(item: PescatoItem, postIdx: number, imgIdx: number): { [key: string]: string } {
    const activeIdx = this.getActivePhotoIndex(item, postIdx);
    const diff = imgIdx - activeIdx;
    const d = Math.abs(diff);

    let scale = 1.0;
    let opacity = 1.0;
    let rotateX = 0;
    let pullY = 0;

    if (d === 0) {
      scale = 1.0;
      opacity = 1.0;
      rotateX = 0;
      pullY = 0;
    } else if (d === 1) {
      scale = 0.95;
      opacity = 0.45;
      rotateX = Math.sign(diff) * 5;
      pullY = Math.sign(diff) * -9;
    } else if (d === 2) {
      scale = 0.86;
      opacity = 0.20;
      rotateX = Math.sign(diff) * 12;
      pullY = Math.sign(diff) * -27;
    } else {
      scale = 0.70;
      opacity = 0;
      rotateX = Math.sign(diff) * 20;
      pullY = Math.sign(diff) * -36;
    }

    return {
      transform: `perspective(750px) translateY(${pullY}px) rotateX(${rotateX}deg) scale(${scale})`,
      opacity: `${opacity}`,
      visibility: d >= 3 ? 'hidden' : 'visible',
      pointerEvents: d >= 3 ? 'none' : 'auto',
    };
  }

  onWheelItemClick(item: PescatoItem, postIdx: number, imgIdx: number, event: Event): void {
    event.stopPropagation();
    this.setPhotoIndex(item, postIdx, imgIdx);
  }

  onWheelTouchStart(item: PescatoItem, postIdx: number, event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    this.pausePostRotation(item, postIdx);
    this.wheelTouchStartY = event.touches[0].clientY;
    this.wheelTouchStartX = event.touches[0].clientX;
    const id = this.getPostId(item, postIdx);
    this.isWheelDragging.update((m) => ({ ...m, [id]: true }));
    this.wheelDragOffset.update((m) => ({ ...m, [id]: 0 }));
  }

  onWheelTouchMove(item: PescatoItem, postIdx: number, event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    const currentY = event.touches[0].clientY;
    const currentX = event.touches[0].clientX;
    const deltaY = currentY - this.wheelTouchStartY;
    const deltaX = currentX - this.wheelTouchStartX;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (event.cancelable) event.preventDefault();
    }

    const stepThreshold = 26;
    const id = this.getPostId(item, postIdx);
    const current = this.getActivePhotoIndex(item, postIdx);
    const total = this.getPostImages(item).length;

    // Sliding finger UP (deltaY < 0) -> move wheel downward to next photo
    if (deltaY <= -stepThreshold) {
      if (current < total - 1) {
        this.setPhotoIndex(item, postIdx, current + 1);
        this.wheelTouchStartY = currentY;
        this.wheelTouchStartX = currentX;
        this.wheelDragOffset.update((m) => ({ ...m, [id]: 0 }));
        this.triggerTactileFeedback();
      } else {
        this.wheelDragOffset.update((m) => ({ ...m, [id]: deltaY * 0.2 }));
      }
    } else if (deltaY >= stepThreshold) {
      // Sliding finger DOWN (deltaY > 0) -> move wheel upward to previous photo
      if (current > 0) {
        this.setPhotoIndex(item, postIdx, current - 1);
        this.wheelTouchStartY = currentY;
        this.wheelTouchStartX = currentX;
        this.wheelDragOffset.update((m) => ({ ...m, [id]: 0 }));
        this.triggerTactileFeedback();
      } else {
        this.wheelDragOffset.update((m) => ({ ...m, [id]: deltaY * 0.2 }));
      }
    } else {
      this.wheelDragOffset.update((m) => ({ ...m, [id]: deltaY }));
    }
  }

  onWheelTouchEnd(item: PescatoItem, postIdx: number): void {
    const id = this.getPostId(item, postIdx);
    this.isWheelDragging.update((m) => ({ ...m, [id]: false }));
    this.wheelDragOffset.update((m) => ({ ...m, [id]: 0 }));
    this.resumePostRotation(item, postIdx);
  }

  onWheelScroll(item: PescatoItem, postIdx: number, event: WheelEvent): void {
    if (event.cancelable) event.preventDefault();
    const now = Date.now();
    if (now - this.lastWheelScrollTime < 130) return;
    this.lastWheelScrollTime = now;

    if (event.deltaY > 0) {
      this.nextPhoto(item, postIdx);
    } else if (event.deltaY < 0) {
      this.prevPhoto(item, postIdx);
    }
  }

  private triggerTactileFeedback(): void {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(8);
      }
    } catch {
      // Ignore if vibration is not supported or prohibited
    }
  }

  pausePostRotation(item: PescatoItem, idx: number): void {
    this.pausedPostIds.add(this.getPostId(item, idx));
  }

  resumePostRotation(item: PescatoItem, idx: number): void {
    this.pausedPostIds.delete(this.getPostId(item, idx));
  }

  startAutoRotation(): void {
    if (this.rotationInterval) return;
    this.rotationInterval = setInterval(() => {
      const items = this.catches();
      if (!items || items.length === 0) return;
      if (this.lightbox().isOpen) return;

      items.forEach((item, idx) => {
        const id = this.getPostId(item, idx);
        if (this.pausedPostIds.has(id) || this.draggingPostId() === id) return;
        const images = this.getPostImages(item);
        if (images.length > 1) {
          const current = this.getActivePhotoIndex(item, idx);
          const next = (current + 1) % images.length;
          this.activePhotoIndexMap.update((map) => ({ ...map, [id]: next }));
        }
      });
    }, 10000);
  }

  resetAutoRotation(): void {
    this.stopAutoRotation();
    this.startAutoRotation();
  }

  stopAutoRotation(): void {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
  }

  formatDiaryDate(rawDate?: string): string {
    if (!rawDate) return 'OGGI';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return rawDate.toUpperCase();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      };
      return d.toLocaleDateString('it-IT', options).replace(/\./g, '').toUpperCase();
    } catch {
      return String(rawDate).toUpperCase();
    }
  }

  sharePost(item: PescatoItem): void {
    const shareData = {
      title: `${item.title} | Diario del Pescato - Il Veliero`,
      text: `${item.title}: ${item.description}`,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      this.shareToastMessage.set('Link del diario copiato negli appunti!');
      setTimeout(() => this.shareToastMessage.set(''), 3500);
    }
  }

  // Lightbox Controls
  openLightbox(images: string[], index: number, title: string): void {
    if (!images || images.length === 0) return;
    this.lightbox.set({
      isOpen: true,
      images,
      activeIndex: Math.max(0, Math.min(index, images.length - 1)),
      title,
    });
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightbox.set({
      isOpen: false,
      images: [],
      activeIndex: 0,
      title: '',
    });
    document.body.style.overflow = '';
  }

  nextLightboxImage(): void {
    const current = this.lightbox();
    if (!current.isOpen || current.images.length <= 1) return;
    const nextIdx = (current.activeIndex + 1) % current.images.length;
    this.lightbox.update((state) => ({ ...state, activeIndex: nextIdx }));
  }

  prevLightboxImage(): void {
    const current = this.lightbox();
    if (!current.isOpen || current.images.length <= 1) return;
    const prevIdx = (current.activeIndex - 1 + current.images.length) % current.images.length;
    this.lightbox.update((state) => ({ ...state, activeIndex: prevIdx }));
  }

  setLightboxIndex(idx: number): void {
    const current = this.lightbox();
    if (!current.isOpen) return;
    if (idx >= 0 && idx < current.images.length) {
      this.lightbox.update((state) => ({ ...state, activeIndex: idx }));
    }
  }

  // Manager Actions
  openAddModal(): void {
    this.editingItem.set(null);
    this.formTitle = '';
    this.formDescription = '';
    this.formCatchDate = new Date().toISOString().split('T')[0];
    this.formImagesText = 'assets/images/cards/card-pescato.jpg';
    this.isModalOpen.set(true);
  }

  openEditModal(item: PescatoItem): void {
    this.editingItem.set(item);
    this.formTitle = item.title;
    this.formDescription = item.description;
    this.formCatchDate = item.catchDate
      ? item.catchDate.split('T')[0]
      : new Date().toISOString().split('T')[0];

    const images = this.getPostImages(item);
    this.formImagesText = images.join('\n');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingItem.set(null);
  }

  savePost(): void {
    const parsedImages = this.formImagesText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload: any = {
      title: this.formTitle.trim(),
      description: this.formDescription.trim(),
      catchDate: this.formCatchDate,
      image: parsedImages[0] || 'assets/images/cards/card-pescato.jpg',
      images: parsedImages,
      price: 0,
      isAvailable: true,
      marketLocation: 'Mercato Ittico di Chioggia',
    };

    const edit = this.editingItem();
    if (edit) {
      const id = edit.id || edit._id || '';
      this.pescatoService.updatePescato(id, payload).subscribe({
        next: (res) => {
          if (res.success) {
            if (res.data) {
              this.catches.update((list) =>
                list.map((c) => ((c.id || c._id) === id ? res.data : c))
              );
              this.preloadCatchesImages([res.data]);
            } else {
              this.fetchCatches(false);
            }
            this.closeModal();
          }
        },
      });
    } else {
      this.pescatoService.createPescato(payload).subscribe({
        next: (res) => {
          if (res.success) {
            if (res.data) {
              this.catches.update((list) => [res.data, ...list]);
              this.totalCatches.update((tot) => tot + 1);
              this.preloadCatchesImages([res.data]);
            } else {
              this.fetchCatches(true);
            }
            this.closeModal();
          }
        },
      });
    }
  }

  deletePost(item: PescatoItem): void {
    if (!confirm(`Sei sicuro di voler eliminare "${item.title}" dal Diario del Pescato?`)) return;
    const id = item.id || item._id || '';
    this.pescatoService.deletePescato(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.catches.update((list) => list.filter((c) => (c.id || c._id) !== id));
          this.totalCatches.update((tot) => Math.max(0, tot - 1));
        }
      },
    });
  }

  onImgFallback(event: any): void {
    const target = event?.target as HTMLImageElement;
    if (target && !target.src.includes('card-pescato.jpg')) {
      target.src = 'assets/images/cards/card-pescato.jpg';
    }
  }
}
