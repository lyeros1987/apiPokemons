import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, combineLatest, debounceTime, delay, distinctUntilChanged, filter, map, merge, Observable, of, shareReplay, startWith, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { Pokemon, PokemonListResponse } from 'src/app/model/pokemon.model';
import { PokemonService } from 'src/app/services/pokemon.service';
import { Store } from '@ngrx/store';
import { updateSummary } from '../../store/models/summary.actions';
import { calculateSummary } from '../../utils/summary.utils';


@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.sass']
})
export class PokemonListComponent {

  // ==================================================================
  // PRIMERO: EL DESTROY$ (¡SIEMPRE PRIMERO!)
  // ==================================================================
  // Este es el botón de "apagar todo" cuando salimos de la página
  // Tiene que estar declarado ANTES de cualquier observable que use takeUntil(this.destroy$)
  private destroy$ = new Subject<void>();

  // ==================================================================
  // VARIABLES CLÁSICAS (las que PrimeNG necesita)
  // ==================================================================
  pokemons: Pokemon[] = [];
  totalRecords = 0;
  limit = 20;
  loading = true;
  first = 0;

  // ==================================================================
  // BUSCADOR
  // ==================================================================
  filterControl = new FormControl('');

  // ==================================================================
  // SUBJECTS → BOTONES REACTIVOS
  // ==================================================================
  private pageChange$ = new BehaviorSubject<{ offset: number; limit: number }>({
    offset: 0,
    limit: 20
  });

  private searchTerm$ = this.filterControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    startWith(''),
    shareReplay(1)
  );

  // ==================================================================
  // OBSERVABLE PRINCIPAL → AHORA SÍ PUEDE USAR destroy$
  // ==================================================================
  private data$ = combineLatest([this.pageChange$, this.searchTerm$]).pipe(
    tap(() => this.loading = true),
    switchMap(([{ offset, limit }, searchTerm]) => {
      const term = (searchTerm?.trim() || '');
      if (term && term.length >= 3) {
        return this.pokemonService.searchAllPokemon(term).pipe(
          map(results => ({ results, count: results.length }))
        );
      } else {
        return this.pokemonService.getPokemonPage(limit, offset).pipe(
          map((res: PokemonListResponse) => ({
            results: res.results,
            count: res.count
          }))
        );
      }
    }),
    tap(({ results, count }) => {
      this.pokemons = results;
      this.totalRecords = count;
      this.loading = false;
      this.updateSummaryInStore();
    }),
    shareReplay(1),
    takeUntil(this.destroy$) // ← Ahora sí está bien declarado arriba
  );

  // ==================================================================
  // ASYNC PIPE OBSERVABLES (nivel dios)
  // ==================================================================
  pokemons$ = this.data$.pipe(
    map(data => data.results),
    startWith([] as Pokemon[])
  );

  totalRecords$ = this.data$.pipe(
    map(data => data.count),
    startWith(0)
  );

  loading$ = merge(
    of(true),
    this.pageChange$,
    this.searchTerm$.pipe(filter(t => t!.length >= 3 || t === ''))
  ).pipe(
    switchMap(() => this.data$.pipe(
      map(() => false),
      startWith(true)
    )),
    startWith(true)
  );

  first$ = this.pageChange$.pipe(
    map(p => p.offset),
    startWith(0)
  );

  // ==================================================================
  constructor(
    private pokemonService: PokemonService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.pageChange$.next({ offset: 0, limit: this.limit });
    this.data$.subscribe(); // Activa todo el flujo
  }

  onPageChange(event: any) {
    this.first = event.first;
    const offset = event.first;
    const limit = event.rows;
    this.pageChange$.next({ offset, limit });
  }

  onViewDetail(pokemon: Pokemon) {
    this.pokemonService.getPokemonDetails(pokemon.name).subscribe(detail => {
      this.pokemonService.selectPokemon(detail);
    });
  }

  // ==================================================================
  // FAVORITOS (todo igual)
  // ==================================================================
  isFavorite(pokemon: any): boolean {
    const favs = this.getFavorites();
    return favs.some((f: any) => f.name === pokemon.name);
  }

  getFavorites(): any[] {
    const data = localStorage.getItem('pokemon-favorites');
    return data ? JSON.parse(data) : [];
  }

  toggleFavorite(pokemon: any, event: Event) {
    event.stopPropagation();
    if (pokemon.height) {
      this.saveOrRemoveFavorite(pokemon);
    } else {
      this.pokemonService.getPokemonDetails(pokemon.name).subscribe({
        next: (fullDetail) => this.saveOrRemoveFavorite(fullDetail)
      });
    }
  }

  private saveOrRemoveFavorite(poke: any) {
    let favorites = this.getFavorites();
    const exists = favorites.some((f: any) => f.name === poke.name);
    if (exists) {
      favorites = favorites.filter((f: any) => f.name !== poke.name);
    } else {
      favorites.push(poke);
    }
    localStorage.setItem('pokemon-favorites', JSON.stringify(favorites));
    this.updateFavorites();
  }

 private updateFavorites() {
  // Dispara el evento para que el header se actualice
  window.dispatchEvent(new Event('favorites-changed'));

  // NUEVO: Si ya no hay favoritos → cierra el detalle
  const favorites = this.getFavorites();
  if (favorites.length === 0) {
    this.pokemonService.selectPokemon(null); // ← Cierra el detalle
  }
}
  // ==================================================================
  // SUMMARY
  // ==================================================================
  private updateSummaryInStore() {
    const summary = this.calculateSummary(this.pokemons);
    this.store.dispatch(updateSummary({ summary }));
  }

  private calculateSummary(pokemons: Pokemon[]): { [letter: string]: number } {
    const summary = pokemons.reduce((acc, p) => {
      const letter = p.name.charAt(0).toUpperCase();
      acc[letter] = (acc[letter] || 0) + 1;
      return acc;
    }, {} as { [letter: string]: number });

    for (let i = 65; i <= 90; i++) {
      const letter = String.fromCharCode(i);
      if (!(letter in summary)) summary[letter] = 0;
    }
    return summary;
  }

  // ==================================================================
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  }


 