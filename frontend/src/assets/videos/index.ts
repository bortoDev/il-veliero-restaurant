/**
 * Video Assets & Poster Placeholders Catalog
 * Il Veliero — Ristorante & Pizzeria dal Campione del Mondo
 */

export interface VideoAsset {
  id: string;
  title: string;
  mp4: string;
  webm: string;
  poster: string;
  description: string;
}

export const VIDEO_ASSETS = {
  hero: {
    id: 'hero-ocean',
    title: 'Mare Adriatico e Veliero',
    mp4: 'assets/videos/Temp_home_Sito_IlVeliero_desktop.mp4',
    webm: 'assets/videos/Temp_home_Sito_IlVeliero_desktop.webm',
    poster: 'assets/videos/hero-poster.jpg',
    description: 'Video loop panoramico del mare e del veliero per hero video wall',
  },
  menu: {
    id: 'card-menu',
    title: 'Pizze e Specialità di Mare',
    mp4: 'assets/videos/card-menu-loop.mp4',
    webm: 'assets/videos/card-menu-loop.webm',
    poster: 'assets/videos/card-menu-poster.svg',
    description: 'Video loop forno a legna e piatti di pesce per card Menù',
  },
  pescato: {
    id: 'card-pescato',
    title: 'Pescato Fresco del Giorno',
    mp4: 'assets/videos/card-pescato-loop.mp4',
    webm: 'assets/videos/card-pescato-loop.webm',
    poster: 'assets/videos/card-pescato-poster.svg',
    description: 'Video loop banco del pescato fresco su ghiaccio per card Pescato',
  },
  doveSiamo: {
    id: 'card-dove-siamo',
    title: 'Bassano del Grappa e Locale',
    mp4: 'assets/videos/card-dove-siamo-loop.mp4',
    webm: 'assets/videos/card-dove-siamo-loop.webm',
    poster: 'assets/videos/card-dove-siamo-poster.svg',
    description: 'Video loop Ponte Vecchio di Bassano e accoglienza per card Dove Siamo',
  },
} as const;
