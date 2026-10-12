import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-video-card-media',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="video-media-container"
      (mouseenter)="playVideo()"
      (mouseleave)="pauseVideo()"
      (focusin)="playVideo()"
      (focusout)="pauseVideo()"
      role="region"
      [attr.aria-label]="title"
    >
      <!-- Video Element with Multiple Source Codecs & Fallback Poster -->
      <video
        #videoEl
        class="video-player"
        [class.video-visible]="isPlaying"
        [poster]="posterSrc"
        muted
        loop
        playsinline
        preload="metadata"
        tabindex="-1"
        (playing)="onVideoPlaying()"
        (error)="onVideoError()"
      >
        <source *ngIf="webmSrc" [src]="webmSrc" type="video/webm" />
        <source *ngIf="mp4Src" [src]="mp4Src" type="video/mp4" />
        Il tuo browser non supporta il tag video.
      </video>

      <!-- High-Quality Static Fallback Poster Image with Smooth Crossfade -->
      <img
        *ngIf="posterSrc"
        [src]="posterSrc"
        [alt]="title"
        class="poster-fallback"
        [class.poster-hidden]="isPlaying"
        loading="lazy"
        (error)="onPosterError($event)"
      />

      <!-- Atmospheric Ambient Overlay -->
      <div class="video-overlay"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      border-radius: inherit;
    }

    .video-media-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: inherit;
      background: var(--dishoom-bg-navy-dark, #0B2545);
    }

    .video-player {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      opacity: 0;
      transform: scale(1.0);
      transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);

      &.video-visible {
        opacity: 1;
        transform: scale(1.04);
      }
    }

    .poster-fallback {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.0);
      transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      z-index: 1;

      &.poster-hidden {
        opacity: 0;
        transform: scale(1.04);
      }
    }

    .video-overlay {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        180deg,
        rgba(11, 37, 69, 0.08) 0%,
        rgba(11, 37, 69, 0.45) 100%
      );
      pointer-events: none;
      z-index: 2;
      transition: background 0.4s ease;
    }

    :host:hover .video-overlay {
      background: linear-gradient(
        180deg,
        rgba(0, 150, 199, 0.08) 0%,
        rgba(11, 37, 69, 0.25) 100%
      );
    }

    @media (prefers-reduced-motion: reduce) {
      .video-player {
        display: none !important;
      }
      .poster-fallback {
        opacity: 1 !important;
        transform: none !important;
      }
    }
  `],
})
export class VideoCardMediaComponent implements AfterViewInit, OnDestroy {
  @Input() mp4Src = '';
  @Input() webmSrc = '';
  @Input() posterSrc = '';
  @Input() title = 'Media Card';

  @ViewChild('videoEl') videoRef!: ElementRef<HTMLVideoElement>;

  public isPlaying = false;
  private cdr = inject(ChangeDetectorRef);
  private elRef = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private intersectionObserver: IntersectionObserver | null = null;
  private rewindTimeoutId: any = null;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && typeof IntersectionObserver !== 'undefined') {
      const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      if (isTouch) {
        // Mobile / Touch Viewport Autoplay: starts when card enters view, pauses when scrolling out
        this.intersectionObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
                this.playVideo();
              } else {
                this.pauseVideo();
              }
            });
          },
          { threshold: [0, 0.35, 0.7] }
        );
        this.intersectionObserver.observe(this.elRef.nativeElement);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    if (this.rewindTimeoutId) {
      clearTimeout(this.rewindTimeoutId);
      this.rewindTimeoutId = null;
    }
  }

  public playVideo(): void {
    if (this.rewindTimeoutId) {
      clearTimeout(this.rewindTimeoutId);
      this.rewindTimeoutId = null;
    }

    const video = this.videoRef?.nativeElement;
    if (video && video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            this.cdr.markForCheck();
          })
          .catch(() => {
            // Autoplay policy or video load error; gracefully fallback to poster
            this.isPlaying = false;
            this.cdr.markForCheck();
          });
      }
    }
  }

  public pauseVideo(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    this.isPlaying = false;
    this.cdr.markForCheck();

    if (!video.paused) {
      video.pause();
    }

    // Reset video smoothly back to 0s once poster has crossfaded back
    this.rewindTimeoutId = setTimeout(() => {
      if (!this.isPlaying && video) {
        try {
          video.currentTime = 0;
        } catch (_) {}
      }
    }, 280);
  }

  public onVideoPlaying(): void {
    this.isPlaying = true;
    this.cdr.markForCheck();
  }

  public onVideoError(): void {
    this.isPlaying = false;
    this.cdr.markForCheck();
  }

  public onHoverStart(): void {
    this.playVideo();
  }

  public onHoverEnd(): void {
    this.pauseVideo();
  }

  onPosterError(event: any): void {
    if (this.posterSrc) {
      if (this.posterSrc.endsWith('.jpg')) {
        event.target.src = this.posterSrc.replace('.jpg', '.svg');
      } else if (this.posterSrc.endsWith('.svg')) {
        event.target.src = this.posterSrc.replace('.svg', '.jpg');
      }
    }
  }
}
