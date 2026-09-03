import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

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
        [poster]="posterSrc"
        muted
        loop
        playsinline
        preload="metadata"
        tabindex="-1"
      >
        <source *ngIf="webmSrc" [src]="webmSrc" type="video/webm" />
        <source *ngIf="mp4Src" [src]="mp4Src" type="video/mp4" />
        Il tuo browser non supporta il tag video.
      </video>

      <!-- High-Quality Static Fallback Poster Image -->
      <img
        *ngIf="posterSrc"
        [src]="posterSrc"
        [alt]="title"
        class="poster-fallback"
        [class.hidden-on-play]="isPlaying"
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
      background: var(--dishoom-bg-navy-deep, #0D2033);
    }

    .video-player {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;
    }

    .poster-fallback {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.45s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      z-index: 1;

      &.hidden-on-play {
        opacity: 0;
      }
    }

    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        180deg,
        rgba(13, 32, 51, 0.1) 0%,
        rgba(13, 32, 51, 0.45) 100%
      );
      pointer-events: none;
      z-index: 2;
      transition: background 0.4s ease;
    }

    :host:hover .video-player,
    :host:hover .poster-fallback {
      transform: scale(1.05);
    }

    :host:hover .video-overlay {
      background: linear-gradient(
        180deg,
        rgba(197, 138, 62, 0.08) 0%,
        rgba(13, 32, 51, 0.25) 100%
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
export class VideoCardMediaComponent {
  @Input() mp4Src = '';
  @Input() webmSrc = '';
  @Input() posterSrc = '';
  @Input() title = 'Media Card';

  @ViewChild('videoEl') videoRef!: ElementRef<HTMLVideoElement>;

  public isPlaying = false;

  public playVideo(): void {
    const video = this.videoRef?.nativeElement;
    if (video && video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
          })
          .catch(() => {
            // Autoplay policy or video load error; fallback smoothly to poster
            this.isPlaying = false;
          });
      }
    }
  }

  public pauseVideo(): void {
    const video = this.videoRef?.nativeElement;
    if (video && !video.paused) {
      video.pause();
      video.currentTime = 0;
      this.isPlaying = false;
    }
  }

  public onHoverStart(): void {
    this.playVideo();
  }

  public onHoverEnd(): void {
    this.pauseVideo();
  }

  onPosterError(event: any): void {
    if (this.posterSrc && this.posterSrc.endsWith('.jpg')) {
      event.target.src = this.posterSrc.replace('.jpg', '.svg');
    }
  }
}
