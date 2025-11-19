import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PokemonDetail, PokemonListResponse } from '../model/pokemon.model';
import { catchError, map, Observable, of, shareReplay, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
private api = 'https://pokeapi.co/api/v2/pokemon';
  private cachedPage?: PokemonListResponse;
  private lastKey = '';

  // ← NUEVO: PARA COMUNICAR LISTA → DETALLE
  private selectedPokemonSubject = new Subject<PokemonDetail>();
  selectedPokemon$ = this.selectedPokemonSubject.asObservable();

  constructor(private http: HttpClient) {}

  getPokemonPage(limit = 20, offset = 0): Observable<PokemonListResponse> {
    const key = `${limit}-${offset}`;
    if (this.cachedPage && key === this.lastKey) {
      return of(this.cachedPage);
    }
    return this.http.get<PokemonListResponse>(`${this.api}?limit=${limit}&offset=${offset}`).pipe(
      tap(data => {
        this.cachedPage = data;
        this.lastKey = key;
      })
    );
  }

  // ← NUEVO: SELECCIONAR POKÉMON
  selectPokemon(pokemon: PokemonDetail) {
    this.selectedPokemonSubject.next(pokemon);
  }

  getPokemonDetails(id: string | number): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`${this.api}/${id}`);
  }
  searchAllPokemon(term: string): Observable<any[]> {
  if (!term.trim()) return of([]);

  const url = `https://pokeapi.co/api/v2/pokemon?limit=1300`; // todos los Pokémon
  return this.http.get<any>(url).pipe(
    map(res => res.results),
    map(pokemons => 
      pokemons.filter((p:any) => 
        p.name.toLowerCase().includes(term.toLowerCase())
      )
    ),
    catchError(() => of([]))
  );
}

}
