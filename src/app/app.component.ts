import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  
  hasDetail = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.hasDetail = this.router.url.includes('detail');
    });
  }
}
