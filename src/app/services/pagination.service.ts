import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  constructor() { }

   private currentPage = 1;
  get() { return this.currentPage; }
  set(page: number) { this.currentPage = page; }
}

