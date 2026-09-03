import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MenuItem, MenuCategory } from '../models';

export interface MenuFilterParams {
  category?: string;
  subcategory?: string;
  available?: boolean | string;
  excludeAllergens?: string;
  search?: string;
  isChefSpecial?: boolean | string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private api = inject(ApiService);

  public getMenuItems(params?: MenuFilterParams): Observable<{ success: boolean; count: number; data: MenuItem[] }> {
    return this.api.get<{ success: boolean; count: number; data: MenuItem[] }>('/menu', params);
  }

  public getCategoriesSummary(): Observable<{ success: boolean; categories: string[]; summary: any[] }> {
    return this.api.get<{ success: boolean; categories: string[]; summary: any[] }>('/menu/categories');
  }

  public getMenuItemById(id: string): Observable<{ success: boolean; data: MenuItem }> {
    return this.api.get<{ success: boolean; data: MenuItem }>(`/menu/${id}`);
  }

  public createMenuItem(dish: Partial<MenuItem>): Observable<{ success: boolean; message: string; data: MenuItem }> {
    return this.api.post<{ success: boolean; message: string; data: MenuItem }>('/menu', dish);
  }

  public updateMenuItem(id: string, dish: Partial<MenuItem>): Observable<{ success: boolean; message: string; data: MenuItem }> {
    return this.api.put<{ success: boolean; message: string; data: MenuItem }>(`/menu/${id}`, dish);
  }

  public deleteMenuItem(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`/menu/${id}`);
  }
}
