import { Injectable } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  /**
   * Checks if user has requested reduced motion or if window is undefined.
   */
  public prefersReducedMotion(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }

  /**
   * Hero Scroll-Driven Morphing:
   * On scroll down, the veliero ship smoothly shrinks (scale 1.0 -> 0.32)
   * anchored strictly at bottom-left, while the video container expands
   * fluidly to fill all 4 corners of the hero container.
   */
  public initHeroVelieroMorph(
    shipEl: HTMLElement | Element | null,
    videoWallEl: HTMLElement | Element,
    containerEl: HTMLElement | Element,
    quoteEl?: HTMLElement | Element | null,
    mobileShipEl?: HTMLElement | Element | null,
    videoSlotEl?: HTMLElement | Element | null
  ): gsap.MatchMedia | null {
    if (typeof window === 'undefined' || !videoWallEl || !containerEl) {
      return null;
    }

    if (this.prefersReducedMotion()) {
      if (shipEl) gsap.set(shipEl, { opacity: 1 });
      if (mobileShipEl) gsap.set(mobileShipEl, { opacity: 1 });
      gsap.set(videoWallEl, { top: 0, left: 0, width: '100%', height: '100%', borderRadius: '0px' });
      return null;
    }

    // Refresh ScrollTrigger to ensure accurate layout metrics
    ScrollTrigger.refresh();

    const mm = gsap.matchMedia();

    // Helper: calculate exact pixel bounds of slot relative to hero container
    const computeBounds = (slotElement?: HTMLElement | Element | null) => {
      const cRect = containerEl.getBoundingClientRect();
      const slot = slotElement || videoSlotEl || containerEl;
      const sRect = slot.getBoundingClientRect();
      return {
        top: Math.max(0, Math.round(sRect.top - cRect.top)),
        left: Math.max(0, Math.round(sRect.left - cRect.left)),
        width: Math.max(10, Math.round(sRect.width)),
        height: Math.max(10, Math.round(sRect.height)),
        cWidth: Math.round(cRect.width),
        cHeight: Math.round(cRect.height),
      };
    };

    // 1. DESKTOP LANDSCAPE (> 1024px AND landscape): 2 columns, left ship fades out, video expands from right col to full screen
    mm.add('(min-width: 1025px) and (orientation: landscape)', () => {
      if (shipEl) {
        gsap.set(shipEl, { transformOrigin: 'bottom left', opacity: 1, scale: 1, x: 0 });
      }
      if (quoteEl) {
        gsap.set(quoteEl, { transformOrigin: 'center center', scale: 1, x: 0, y: 0 });
      }

      // Initial position & dimensions strictly matching the 16:9 slot in the right column
      gsap.set(videoWallEl, {
        top: () => `${computeBounds().top}px`,
        left: () => `${computeBounds().left}px`,
        width: () => `${computeBounds().width}px`,
        height: () => `${computeBounds().height}px`,
        borderRadius: '8px',
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerEl,
          start: 'top top',
          end: '+=130%',
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Veliero ship on the left smoothly fades out as video takes center stage
      if (shipEl) {
        tl.to(
          shipEl,
          {
            opacity: 0,
            scale: 0.85,
            x: -40,
            ease: 'power2.inOut',
            duration: 0.7,
          },
          0
        );
      }

      // Video smoothly expands to 100% full-screen while keeping full video visible
      tl.fromTo(
        videoWallEl,
        {
          top: () => `${computeBounds().top}px`,
          left: () => `${computeBounds().left}px`,
          width: () => `${computeBounds().width}px`,
          height: () => `${computeBounds().height}px`,
          borderRadius: '8px',
        },
        {
          top: 0,
          left: 0,
          width: () => `${computeBounds().cWidth}px`,
          height: () => `${computeBounds().cHeight}px`,
          borderRadius: '0px',
          ease: 'power2.inOut',
          duration: 1,
        },
        0
      );

      // Fade out slot shadow as it merges into full-bleed
      if (videoSlotEl) {
        tl.to(
          videoSlotEl,
          {
            boxShadow: 'none',
            duration: 0.6,
            ease: 'power1.out',
          },
          0
        );
      }

      // Quote & CTA stay visible and center horizontally and vertically over the full-bleed video
      if (quoteEl) {
        tl.to(
          quoteEl,
          {
            x: () => {
              const cRect = containerEl.getBoundingClientRect();
              const qRect = quoteEl.getBoundingClientRect();
              const currentQuoteX = (gsap.getProperty(quoteEl, 'x') as number) || 0;
              const initialCenterQuoteX = qRect.left + qRect.width / 2 - currentQuoteX;
              const targetCenterX = cRect.left + cRect.width / 2;
              return targetCenterX - initialCenterQuoteX;
            },
            y: () => {
              const cRect = containerEl.getBoundingClientRect();
              const qRect = quoteEl.getBoundingClientRect();
              const currentQuoteY = (gsap.getProperty(quoteEl, 'y') as number) || 0;
              const initialCenterQuoteY = qRect.top + qRect.height / 2 - currentQuoteY;
              const targetCenterY = cRect.top + cRect.height / 2;
              return targetCenterY - initialCenterQuoteY;
            },
            scale: 1,
            ease: 'power2.inOut',
            duration: 1,
          },
          0
        );
      }

      // Recalculate metrics on fullscreen changes (F11), window resizing, or orientation changes
      const onResizeOrFullscreen = () => {
        ScrollTrigger.refresh();
      };
      window.addEventListener('fullscreenchange', onResizeOrFullscreen);
      window.addEventListener('resize', onResizeOrFullscreen);
      window.addEventListener('orientationchange', onResizeOrFullscreen);

      return () => {
        window.removeEventListener('fullscreenchange', onResizeOrFullscreen);
        window.removeEventListener('resize', onResizeOrFullscreen);
        window.removeEventListener('orientationchange', onResizeOrFullscreen);
      };
    });

    // 2. MOBILE & TABLET PORTRAIT (all portrait screens, and landscape <= 1024px): 1 centered column
    mm.add('(max-width: 1024px), (orientation: portrait)', () => {
      if (mobileShipEl) {
        gsap.set(mobileShipEl, { transformOrigin: 'center center', scale: 1, opacity: 1 });
      }

      // Initial mobile position matching slot
      gsap.set(videoWallEl, {
        top: () => `${computeBounds().top}px`,
        left: () => `${computeBounds().left}px`,
        width: () => `${computeBounds().width}px`,
        height: () => `${computeBounds().height}px`,
        borderRadius: '14px',
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerEl,
          start: 'top top',
          end: '+=100%',
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Mobile boat under quote: smoothly fades out on scroll down
      if (mobileShipEl) {
        tl.to(
          mobileShipEl,
          {
            opacity: 0,
            scale: 0.75,
            ease: 'power2.inOut',
            duration: 0.7,
          },
          0
        );
      }

      // Expand mobile video frame to fill 100% of viewport with dynamic recalculation on refresh
      tl.fromTo(
        videoWallEl,
        {
          top: () => `${computeBounds().top}px`,
          left: () => `${computeBounds().left}px`,
          width: () => `${computeBounds().width}px`,
          height: () => `${computeBounds().height}px`,
          borderRadius: '14px',
        },
        {
          top: 0,
          left: 0,
          width: () => `${computeBounds().cWidth}px`,
          height: () => `${computeBounds().cHeight}px`,
          borderRadius: '0px',
          ease: 'power2.inOut',
          duration: 1,
        },
        0
      );

      // Fade out slot shadow on mobile
      if (videoSlotEl) {
        tl.to(
          videoSlotEl,
          {
            boxShadow: 'none',
            duration: 0.6,
            ease: 'power1.out',
          },
          0
        );
      }

      const onResizeOrFullscreen = () => {
        ScrollTrigger.refresh();
      };
      window.addEventListener('fullscreenchange', onResizeOrFullscreen);
      window.addEventListener('resize', onResizeOrFullscreen);
      window.addEventListener('orientationchange', onResizeOrFullscreen);

      return () => {
        window.removeEventListener('fullscreenchange', onResizeOrFullscreen);
        window.removeEventListener('resize', onResizeOrFullscreen);
        window.removeEventListener('orientationchange', onResizeOrFullscreen);
      };
    });

    return mm;
  }

  /**
   * Hero Scroll-Driven Morphing:
   * On scroll down, the veliero ship smoothly shrinks (scale 1.0 -> 0.35)
   * and docks into the bottom-left corner of the video wall container.
   */
  public initHeroMorph(
    shipEl: HTMLElement | Element,
    videoWallEl: HTMLElement | Element,
    containerEl: HTMLElement | Element
  ): gsap.core.Timeline | null {
    if (typeof window === 'undefined' || !shipEl || !videoWallEl || !containerEl) {
      return null;
    }

    if (this.prefersReducedMotion()) {
      gsap.set(shipEl, { opacity: 1 });
      return null;
    }

    // Refresh ScrollTrigger to ensure accurate bounding rect calculations
    ScrollTrigger.refresh();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerEl,
        start: 'top top',
        end: '+=120%',
        scrub: 1.2,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // Animate ship shrinking and docking into bottom-left of video wall
    tl.to(shipEl, {
      scale: 0.38,
      x: () => {
        const shipRect = shipEl.getBoundingClientRect();
        const wallRect = videoWallEl.getBoundingClientRect();
        // Calculate offset to align near bottom-left of the video wall
        const targetX = wallRect.left - shipRect.left + 24;
        return targetX;
      },
      y: () => {
        const shipRect = shipEl.getBoundingClientRect();
        const wallRect = videoWallEl.getBoundingClientRect();
        const targetY = wallRect.bottom - shipRect.bottom - 16;
        return targetY;
      },
      filter: 'drop-shadow(0 10px 20px rgba(7, 25, 47, 0.45))',
      ease: 'power2.inOut',
      duration: 1,
    });

    // Subtle expansion of the video wall
    tl.to(
      videoWallEl,
      {
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgba(7, 25, 47, 0.5)',
        duration: 1,
        ease: 'power2.inOut',
      },
      0
    );

    return tl;
  }

  /**
   * Nautical Footer Anchor Drop:
   * As user scrolls into the footer, the anchor descends downwards on the modular chain.
   */
  public initFooterAnchorDrop(
    chainContainerEl: HTMLElement | Element,
    anchorEl: HTMLElement | Element,
    footerEl: HTMLElement | Element
  ): gsap.core.Timeline | null {
    return this.initAnchorDrop(chainContainerEl, anchorEl, footerEl);
  }

  /**
   * Nautical Footer Anchor Drop:
   * As user scrolls into the footer, the anchor descends downwards on the modular chain.
   */
  public initAnchorDrop(
    chainContainerEl: HTMLElement | Element,
    anchorEl: HTMLElement | Element,
    footerEl: HTMLElement | Element
  ): gsap.core.Timeline | null {
    if (typeof window === 'undefined' || !chainContainerEl || !footerEl) {
      return null;
    }

    if (this.prefersReducedMotion()) {
      return null;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footerEl,
        start: 'top 80%',
        end: 'bottom bottom',
        scrub: 1.5,
      },
    });

    // Drop anchor and extend chain height
    tl.fromTo(
      chainContainerEl,
      { y: -60, opacity: 0.7 },
      { y: 80, opacity: 1, ease: 'none', duration: 1 }
    );

    if (anchorEl) {
      tl.fromTo(
        anchorEl,
        { rotation: -6 },
        { rotation: 4, ease: 'sine.inOut', yoyo: true, repeat: 1, duration: 1 },
        0
      );
    }

    return tl;
  }

  /**
   * Card Video Loop on Hover:
   * Plays video smoothly on mouseenter, resets & pauses on mouseleave.
   */
  public initCardVideoHover(
    cardEl: HTMLElement,
    videoEl: HTMLVideoElement
  ): { cleanup: () => void } {
    if (typeof window === 'undefined' || !cardEl || !videoEl) {
      return { cleanup: () => {} };
    }

    const onEnter = () => {
      if (videoEl.paused) {
        videoEl.play().catch(() => {});
      }
      if (!this.prefersReducedMotion()) {
        gsap.to(cardEl, {
          y: -8,
          scale: 1.025,
          boxShadow: '0 20px 35px rgba(7, 25, 47, 0.25)',
          duration: 0.35,
          ease: 'power2.out',
        });
      }
    };

    const onLeave = () => {
      if (!videoEl.paused) {
        videoEl.pause();
        videoEl.currentTime = 0;
      }
      if (!this.prefersReducedMotion()) {
        gsap.to(cardEl, {
          y: 0,
          scale: 1,
          boxShadow: '0 4px 12px rgba(7, 25, 47, 0.08)',
          duration: 0.35,
          ease: 'power2.out',
        });
      }
    };

    cardEl.addEventListener('mouseenter', onEnter);
    cardEl.addEventListener('mouseleave', onLeave);
    cardEl.addEventListener('focusin', onEnter);
    cardEl.addEventListener('focusout', onLeave);

    return {
      cleanup: () => {
        cardEl.removeEventListener('mouseenter', onEnter);
        cardEl.removeEventListener('mouseleave', onLeave);
        cardEl.removeEventListener('focusin', onEnter);
        cardEl.removeEventListener('focusout', onLeave);
      },
    };
  }

  /**
   * Notice / Event Banner Hover Fill Effect:
   * Animate a smooth fill background wipe across the banner on hover.
   */
  public initBannerHoverFill(bannerEl: HTMLElement, fillEl: HTMLElement): { cleanup: () => void } {
    if (typeof window === 'undefined' || !bannerEl || !fillEl) {
      return { cleanup: () => {} };
    }

    const onEnter = () => {
      if (this.prefersReducedMotion()) return;
      gsap.to(fillEl, {
        scaleX: 1,
        duration: 0.4,
        ease: 'power2.out',
        transformOrigin: 'left center',
      });
    };

    const onLeave = () => {
      if (this.prefersReducedMotion()) return;
      gsap.to(fillEl, {
        scaleX: 0,
        duration: 0.35,
        ease: 'power2.in',
        transformOrigin: 'right center',
      });
    };

    bannerEl.addEventListener('mouseenter', onEnter);
    bannerEl.addEventListener('mouseleave', onLeave);

    return {
      cleanup: () => {
        bannerEl.removeEventListener('mouseenter', onEnter);
        bannerEl.removeEventListener('mouseleave', onLeave);
      },
    };
  }

  /**
   * Animates floating nautical background elements with smooth continuous oscillations.
   */
  public initFloatingDecor(elements: Element[] | NodeListOf<Element> | string): gsap.core.Tween | null {
    if (this.prefersReducedMotion()) return null;

    return gsap.to(elements, {
      y: '+=15',
      rotation: '+=3',
      duration: 3.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: {
        amount: 1.5,
        from: 'random',
      },
    });
  }

  /**
   * Hero section entrance animation: staggered title, subtitle, and CTA reveal.
   */
  public animateHeroEntrance(
    title: Element | string,
    subtitle: Element | string,
    cta: Element | string,
    banner?: Element | string
  ): gsap.core.Timeline {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (this.prefersReducedMotion()) {
      gsap.set([title, subtitle, cta, banner].filter(Boolean), { opacity: 1 });
      return tl;
    }

    if (banner) {
      tl.from(banner, { y: -20, opacity: 0, duration: 0.6 });
    }

    tl.from(subtitle, { y: 20, opacity: 0, duration: 0.7 }, '-=0.3')
      .from(title, { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
      .from(cta, { y: 20, opacity: 0, duration: 0.6, stagger: 0.15 }, '-=0.4');

    return tl;
  }

  /**
   * Interactive card zoom/expand hover animation.
   */
  public animateCardHover(element: Element, isHovered: boolean): void {
    if (this.prefersReducedMotion()) return;

    if (isHovered) {
      gsap.to(element, {
        scale: 1.03,
        y: -6,
        boxShadow: '0 20px 30px rgba(11, 37, 69, 0.15)',
        duration: 0.35,
        ease: 'power2.out',
      });
    } else {
      gsap.to(element, {
        scale: 1,
        y: 0,
        boxShadow: '0 4px 12px rgba(11, 37, 69, 0.08)',
        duration: 0.35,
        ease: 'power2.out',
      });
    }
  }

  /**
   * Detail modal popup zoom-in entrance.
   */
  public animateModalEntrance(modalContent: Element | string): gsap.core.Tween | null {
    if (this.prefersReducedMotion()) return null;

    return gsap.fromTo(
      modalContent,
      { scale: 0.85, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }
    );
  }

  /**
   * Staggered fade and slide reveal for lists (dishes, catches, notices, events).
   */
  public animateListEntrance(elements: Element[] | NodeListOf<Element> | string): gsap.core.Tween | null {
    if (this.prefersReducedMotion()) return null;

    return gsap.from(elements, {
      y: 25,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
    });
  }

  /**
   * Editorial Word-by-Word Scroll Reveal:
   * As user scrolls down towards the title, words transition progressively
   * from faded/muted (opacity 0.2) to fully sharp and crisp (opacity 1.0)
   * in a smooth scrubbed sequence inspired by high-end editorial designs (e.g. Dishoom).
   */
  public initWordScrollReveal(
    titleEl: HTMLElement | Element,
    words: (HTMLElement | Element)[] | NodeListOf<Element>
  ): gsap.core.Timeline | null {
    if (typeof window === 'undefined' || !titleEl || !words || (words as any).length === 0) {
      return null;
    }

    if (this.prefersReducedMotion()) {
      gsap.set(words, { opacity: 1 });
      return null;
    }

    const wordsArray = Array.from(words);
    gsap.set(wordsArray, { opacity: 0.2 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: titleEl,
        start: 'top 85%',
        end: 'top 35%',
        scrub: 0.3,
        invalidateOnRefresh: true,
      },
    });

    // Animate each word in a discrete, distinct sequence with zero overlapping blur
    wordsArray.forEach((word) => {
      tl.to(word, {
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    });

    return tl;
  }

  /**
   * Kills all active ScrollTriggers on view destroy to prevent leaks.
   */
  public killAllScrollTriggers(): void {
    if (typeof window !== 'undefined' && ScrollTrigger) {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    }
  }
}
