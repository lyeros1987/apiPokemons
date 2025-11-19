import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { Pokemon, PokemonListResponse } from 'src/app/model/pokemon.model';
import { PaginationService } from 'src/app/services/pagination.service';
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

  pokemons: Pokemon[] = [];
  totalRecords = 0;
  limit = 20;
  loading = true;
  first = 0;  // ← Para PrimeNG lazy

  filterControl = new FormControl('');
  private destroy$ = new Subject<void>();

  constructor(private pokemonService: PokemonService,private store: Store) {}

  ngOnInit(): void {
    this.loadData(0, this.limit);

    this.filterControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => !term || term.length >= 3),  // ← SOLO 3+ LETRAS
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.first = 0;
      this.loadData(0, this.limit, term?.trim());
    });
  
  }

  onPageChange(event: any) {
    this.first = event.first;
    const limit = event.rows;
    const offset = event.first;  // ← PrimeNG ya da offset
    console.log('PAGINATION → offset:', offset);

    this.loadData(offset, limit, this.filterControl.value?.trim() || '');
     this.updateSummaryInStore();
  }

  private loadData(offset: number, limit: number, search = '') {
  this.loading = true;

  if (search) {
    // BÚSQUEDA GLOBAL → ignora offset y limit
    this.pokemonService.searchAllPokemon(search).subscribe({
      next: (results) => {
        this.pokemons = results;
        this.totalRecords = results.length;
        this.loading = false;
        this.updateSummaryInStore();
      },
      error: () => {
        this.pokemons = [];
        this.totalRecords = 0;
        this.loading = false;
      }
    });
  } else {
    // PAGINACIÓN NORMAL → como antes
    this.pokemonService.getPokemonPage(limit, offset).subscribe({
      next: (res: PokemonListResponse) => {
        this.pokemons = res.results;
        this.totalRecords = res.count;
        this.loading = false;
        this.updateSummaryInStore();
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}

  onViewDetail(pokemon: Pokemon) {
  this.pokemonService.getPokemonDetails(pokemon.name).subscribe(detail => {
    this.pokemonService.selectPokemon(detail);  // ← ENVÍA AL DETALLE
  });
}

// Ver si este Pokémon está en favoritos
isFavorite(pokemon: any): boolean {
  const favs = this.getFavorites();
  return favs.some((f: any) => f.name === pokemon.name);
}

// Obtener favoritos del localStorage
getFavorites(): any[] {
  const data = localStorage.getItem('pokemon-favorites');
  return data ? JSON.parse(data) : [];
}

// Marcar / desmarcar favorito
toggleFavorite(pokemon: any, event: Event) {
  event.stopPropagation();

  // Si ya tiene detalles completos → usamos directamente
  if (pokemon.height) {
    this.saveOrRemoveFavorite(pokemon);
  } else {
    // Si solo tiene name/url → traemos los detalles completos
    this.pokemonService.getPokemonDetails(pokemon.name).subscribe({
      next: (fullDetail) => {
        this.saveOrRemoveFavorite(fullDetail);
      }
    });
  }
}

private saveOrRemoveFavorite(poke: any) {
  let favorites = this.getFavorites();

  const exists = favorites.some((f: any) => f.name === poke.name);
  if (exists) {
    // QUITAR
    favorites = favorites.filter((f: any) => f.name !== poke.name);
  } else {
    // GUARDAR EL POKÉMON COMPLETO (con height, weight, types, etc.)
    favorites.push(poke);
  }

  localStorage.setItem('pokemon-favorites', JSON.stringify(favorites));
  this.updateFavorites(); // ← actualiza header
}
private updateFavorites() {
  window.dispatchEvent(new Event('favorites-changed'));
}
private updateSummaryInStore() {
  const currentPokemons = this.pokemons; // ← ESTA ES LA LISTA QUE SE VE EN PANTALLA
  const summary = this.calculateSummary(currentPokemons);
  this.store.dispatch(updateSummary({ summary }));
}
private calculateSummary(pokemons: any[]): { [letter: string]: number } {
  const summary: { [letter: string]: number } = {};

  pokemons.forEach(p => {
    const firstLetter = p.name.charAt(0).toUpperCase();
    summary[firstLetter] = (summary[firstLetter] || 0) + 1;
  });

  // Rellenar letras sin Pokémon con 0
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    if (!(letter in summary)) summary[letter] = 0;
  }

  return summary;
}


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  }


 