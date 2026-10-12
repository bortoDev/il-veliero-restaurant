import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PescatoItem } from '../models';

export interface PescatoListParams {
  available?: boolean | string;
  date?: string;
  search?: string;
  all?: boolean;
  page?: number;
  limit?: number;
}

export interface PescatoListResponse {
  success: boolean;
  count: number;
  total?: number;
  page?: number;
  totalPages?: number;
  data: PescatoItem[];
}

@Injectable({
  providedIn: 'root',
})
export class PescatoService {
  private api = inject(ApiService);

  public getPescatoList(params?: PescatoListParams): Observable<PescatoListResponse> {
    return this.api.get<PescatoListResponse>('/pescato', params);
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
