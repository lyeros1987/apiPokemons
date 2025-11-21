import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PokemonDetail, PokemonListResponse } from '../model/pokemon.model';
import { BehaviorSubject, catchError, map, Observable, of, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

 private api = 'https://pokeapi.co/api/v2/pokemon';
  private cache = new Map<string, any>();

  // CAMBIO CLAVE: BehaviorSubject + permite null
  private selectedPokemonSubject = new BehaviorSubject<PokemonDetail | null>(null);
  selectedPokemon$ = this.selectedPokemonSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Paginación con caché
  getPokemonPage(limit = 20, offset = 0): Observable<PokemonListResponse> {
    const key = `page-${limit}-${offset}`;
    if (this.cache.has(key)) {
      return of(this.cache.get(key));
    }

    return this.http.get<PokemonListResponse>(`${this.api}?limit=${limit}&offset=${offset}`).pipe(
      tap(data => this.cache.set(key, data))
    );
  }

  // Búsqueda con caché
  searchAllPokemon(term: string): Observable<any[]> {
  if (!term.trim()) return of([]);

  const cacheKey = 'all-pokemon';
  term = term.toLowerCase();

  if (this.cache.has(cacheKey)) {
    const allPokemon = this.cache.get(cacheKey);
    return of(allPokemon.filter((p: any) => p.name.toLowerCase().includes(term)));
  }

  // AQUÍ ESTABA EL ERROR → cambiamos any por PokemonListResponse
  return this.http.get<PokemonListResponse>(`${this.api}?limit=1300`).pipe(
    map(res => res.results),  // ← ahora TypeScript sabe que res.results existe
    tap(pokemons => this.cache.set(cacheKey, pokemons)),
    map(pokemons => pokemons.filter((p: any) => p.name.toLowerCase().includes(term))),
    catchError(() => of([]))
  );
}

  // Detalle individual con caché
  getPokemonDetails(id: string | number): Observable<PokemonDetail> {
    const key = `detail-${id}`;
    if (this.cache.has(key)) {
      return of(this.cache.get(key));
    }

    return this.http.get<PokemonDetail>(`${this.api}/${id}`).pipe(
      tap(data => this.cache.set(key, data))
    );
  }

  // AHORA SÍ: acepta null y guarda el valor
  selectPokemon(pokemon: PokemonDetail | null) {
    this.selectedPokemonSubject.next(pokemon);
  }

  // BONUS: método para limpiar selección (opcional, pero útil)
  clearSelection() {
    this.selectPokemon(null);
  }

  // BONUS: obtener el Pokémon seleccionado actual (útil para pruebas)
  getCurrentPokemon(): PokemonDetail | null {
    return this.selectedPokemonSubject.value;
  }
}
