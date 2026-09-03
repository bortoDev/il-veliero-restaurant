import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { InfoLocale } from '../models';

@Injectable({
  providedIn: 'root',
})
export class InfoService {
  private api = inject(ApiService);

  public getInfoLocale(): Observable<{ success: boolean; data: InfoLocale }> {
    return this.api.get<{ success: boolean; data: InfoLocale }>('/info');
  }

  public updateInfoLocale(info: Partial<InfoLocale>): Observable<{ success: boolean; message: string; data: InfoLocale }> {
    return this.api.put<{ success: boolean; message: string; data: InfoLocale }>('/info', info);
  }
}
