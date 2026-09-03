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
    shipEl: HTMLElement | Element,
    videoWallEl: HTMLElement | Element,
    containerEl: HTMLElement | Element,
    quoteEl?: HTMLElement | Element | null
  ): gsap.core.Timeline | null {
    if (typeof window === 'undefined' || !shipEl || !videoWallEl || !containerEl) {
      return null;
    }

    if (this.prefersReducedMotion()) {
      gsap.set(shipEl, { opacity: 1 });
      return null;
    }

    // Refresh ScrollTrigger to ensure accurate layout metrics
    ScrollTrigger.refresh();

    // Set initial transform origins
    gsap.set(shipEl, { transformOrigin: 'bottom left' });
    gsap.set(videoWallEl, { transformOrigin: 'top left' });
    if (quoteEl) {
      gsap.set(quoteEl, { transformOrigin: 'center center', scale: 1 });
    }

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

    // 1. Gently scale down ship to an elegant visible size (0.58) and keep it fixed without disappearing
    tl.to(
      shipEl,
      {
        scale: 0.58,
        transformOrigin: 'bottom left',
        opacity: 1,
        ease: 'power2.out',
        duration: 0.45,
      },
      0
    );

    // 2. Smoothly expand video wall rectangle so that all 4 corners match the hero container
    tl.to(
      videoWallEl,
      {
        x: () => {
          const cRect = containerEl.getBoundingClientRect();
          const vRect = videoWallEl.getBoundingClientRect();
          const currentX = (gsap.getProperty(videoWallEl, 'x') as number) || 0;
          const leftOffset = vRect.left - cRect.left - currentX;
          return -leftOffset;
        },
        y: () => {
          const cRect = containerEl.getBoundingClientRect();
          const vRect = videoWallEl.getBoundingClientRect();
          const currentY = (gsap.getProperty(videoWallEl, 'y') as number) || 0;
          const topOffset = vRect.top - cRect.top - currentY;
          return -topOffset;
        },
        scaleX: () => {
          const cRect = containerEl.getBoundingClientRect();
          const vRect = videoWallEl.getBoundingClientRect();
          const currentScaleX = (gsap.getProperty(videoWallEl, 'scaleX') as number) || 1;
          const initialW = vRect.width / currentScaleX;
          return cRect.width / initialW;
        },
        scaleY: () => {
          const cRect = containerEl.getBoundingClientRect();
          const vRect = videoWallEl.getBoundingClientRect();
          const currentScaleY = (gsap.getProperty(videoWallEl, 'scaleY') as number) || 1;
          const initialH = vRect.height / currentScaleY;
          return cRect.height / initialH;
        },
        borderRadius: '0px',
        boxShadow: 'none',
        ease: 'power2.inOut',
        duration: 1,
      },
      0
    );

    // 3. Smoothly center the fixed, unscaled quote over the full-bleed video as it expands
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

    return tl;
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
   * Kills all active ScrollTriggers on view destroy to prevent leaks.
   */
  public killAllScrollTriggers(): void {
    if (typeof window !== 'undefined' && ScrollTrigger) {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    }
  }
}
