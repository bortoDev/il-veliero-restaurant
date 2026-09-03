import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Avviso } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AvvisoService {
  private api = inject(ApiService);

  public getActiveAvvisi(): Observable<{ success: boolean; count: number; data: Avviso[] }> {
    return this.api.get<{ success: boolean; count: number; data: Avviso[] }>('/avvisi/active');
  }

  public getAllAvvisi(params?: { severity?: string; isActive?: boolean | string; search?: string }): Observable<{ success: boolean; count: number; data: Avviso[] }> {
    return this.api.get<{ success: boolean; count: number; data: Avviso[] }>('/avvisi', params);
  }

  public getAvvisoById(id: string): Observable<{ success: boolean; data: Avviso }> {
    return this.api.get<{ success: boolean; data: Avviso }>(`/avvisi/${id}`);
  }

  public createAvviso(avviso: Partial<Avviso>): Observable<{ success: boolean; message: string; data: Avviso }> {
    return this.api.post<{ success: boolean; message: string; data: Avviso }>('/avvisi', avviso);
  }

  public updateAvviso(id: string, avviso: Partial<Avviso>): Observable<{ success: boolean; message: string; data: Avviso }> {
    return this.api.put<{ success: boolean; message: string; data: Avviso }>(`/avvisi/${id}`, avviso);
  }

  public deleteAvviso(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`/avvisi/${id}`);
  }
}
