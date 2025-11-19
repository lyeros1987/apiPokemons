import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store/models/app.state';

@Component({
  selector: 'app-pokemon-summary',
  templateUrl: './pokemon-summary.component.html',
  styleUrls: ['./pokemon-summary.component.sass']
})
export class PokemonSummaryComponent {

  summary$!: Observable<{ [letter: string]: number }>;

  constructor(private store: Store<AppState>) {
    this.summary$ = this.store.select(state => state.summary);
  }

  ngOnInit(): void {}

letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
}

