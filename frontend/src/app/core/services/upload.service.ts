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
