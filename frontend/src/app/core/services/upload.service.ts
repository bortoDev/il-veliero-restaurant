import { Injectable, inject } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { ApiService } from './api.service';

export interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private api = inject(ApiService);

  /**
   * Uploads an image file to the backend, optionally optimizing (compressing/resizing)
   * it client-side before sending.
   */
  public uploadImage(file: File, maxDimension = 1920, quality = 0.85): Observable<UploadResponse> {
    return from(this.optimizeImage(file, maxDimension, quality)).pipe(
      switchMap((optimizedBlob) => {
        const formData = new FormData();
        const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
        formData.append('image', optimizedBlob, fileName);
        return this.api.upload<UploadResponse>('/uploads', formData);
      })
    );
  }

  /**
   * Uploads an image normalized to Instagram Carousel standards:
   * Standard reference width = 1080px.
   * Aspect ratio clamped between 4:5 (1080x1350) and 1.91:1 (1080x566).
   * Center-cropped if exceeding bounds, and compressed as high-grade JPEG.
   */
  public uploadInstagramPhoto(file: File, quality = 0.88): Observable<UploadResponse> {
    return from(this.processInstagramImage(file, quality)).pipe(
      switchMap((optimizedBlob) => {
        const formData = new FormData();
        const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
        formData.append('image', optimizedBlob, fileName);
        return this.api.upload<UploadResponse>('/uploads', formData);
      })
    );
  }

  private processInstagramImage(file: File, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const origW = img.naturalWidth || img.width;
          const origH = img.naturalHeight || img.height;
          const origRatio = origW / origH;

          // Standard reference width: 1080px
          const targetWidth = 1080;

          // Instagram Aspect Bounds:
          // Min ratio: 4:5 = 0.80 (1080 x 1350)
          // Max ratio: 1.91:1 = 1.91 (1080 x 566)
          let targetRatio = Math.max(0.80, Math.min(1.91, origRatio));

          // Snapping for clean Instagram standard ratios
          if (Math.abs(targetRatio - 1.0) < 0.04) {
            targetRatio = 1.0;
          } else if (Math.abs(targetRatio - 0.80) < 0.03) {
            targetRatio = 0.80;
          } else if (Math.abs(targetRatio - 1.91) < 0.03) {
            targetRatio = 1.91;
          }

          const targetHeight = Math.round(targetWidth / targetRatio);

          // Calculate center-crop coordinates from source image
          let srcX = 0;
          let srcY = 0;
          let srcW = origW;
          let srcH = origH;

          if (origRatio > targetRatio) {
            // Source is wider than target ratio -> crop horizontal sides
            srcW = Math.round(origH * targetRatio);
            srcX = Math.round((origW - srcW) / 2);
          } else if (origRatio < targetRatio) {
            // Source is taller than target ratio -> crop top/bottom
            srcH = Math.round(origW / targetRatio);
            srcY = Math.round((origH - srcH) / 2);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else resolve(file);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Client-side canvas compression/resizing for high-resolution photos
   * from smartphones and digital cameras.
   */
  private optimizeImage(file: File, maxDimension: number, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // If not an image or SVG, send as is
      if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
