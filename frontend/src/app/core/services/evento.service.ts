import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Evento } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private api = inject(ApiService);

  public getUpcomingEventi(): Observable<{ success: boolean; count: number; data: Evento[] }> {
    return this.api.get<{ success: boolean; count: number; data: Evento[] }>('/eventi/upcoming');
  }

  public getAllEventi(params?: { timeframe?: 'upcoming' | 'past'; search?: string }): Observable<{ success: boolean; count: number; data: Evento[] }> {
    return this.api.get<{ success: boolean; count: number; data: Evento[] }>('/eventi', params);
  }

  public getEventoById(id: string): Observable<{ success: boolean; data: Evento }> {
    return this.api.get<{ success: boolean; data: Evento }>(`/eventi/${id}`);
  }

  public createEvento(evento: Partial<Evento>): Observable<{ success: boolean; message: string; data: Evento }> {
    return this.api.post<{ success: boolean; message: string; data: Evento }>('/eventi', evento);
  }

  public updateEvento(id: string, evento: Partial<Evento>): Observable<{ success: boolean; message: string; data: Evento }> {
    return this.api.put<{ success: boolean; message: string; data: Evento }>(`/eventi/${id}`, evento);
  }

  public deleteEvento(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`/eventi/${id}`);
  }
}
