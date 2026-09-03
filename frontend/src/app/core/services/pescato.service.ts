import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PescatoItem } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PescatoService {
  private api = inject(ApiService);

  public getPescatoList(params?: { available?: boolean | string; date?: string; search?: string; all?: boolean }): Observable<{ success: boolean; count: number; data: PescatoItem[] }> {
    return this.api.get<{ success: boolean; count: number; data: PescatoItem[] }>('/pescato', params);
  }

  public getPescatoById(id: string): Observable<{ success: boolean; data: PescatoItem }> {
    return this.api.get<{ success: boolean; data: PescatoItem }>(`/pescato/${id}`);
  }

  public createPescato(item: Partial<PescatoItem>): Observable<{ success: boolean; message: string; data: PescatoItem }> {
    return this.api.post<{ success: boolean; message: string; data: PescatoItem }>('/pescato', item);
  }

  public updatePescato(id: string, item: Partial<PescatoItem>): Observable<{ success: boolean; message: string; data: PescatoItem }> {
    return this.api.put<{ success: boolean; message: string; data: PescatoItem }>(`/pescato/${id}`, item);
  }

  public deletePescato(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`/pescato/${id}`);
  }
}
