import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PokemonDetail, PokemonListResponse } from '../model/pokemon.model';
import { catchError, map, Observable, of, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
 private api = 'https://pokeapi.co/api/v2/pokemon';
  private cache = new Map<string, any>(); // ← MEJORA: Cache más flexible
  private selectedPokemonSubject = new Subject<PokemonDetail>();
  selectedPokemon$ = this.selectedPokemonSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ MEJORA: Cache más inteligente
  getPokemonPage(limit = 20, offset = 0): Observable<PokemonListResponse> {
    const key = `page-${limit}-${offset}`;
    
    // Si ya está en cache, devuelvo directamente
    if (this.cache.has(key)) {
      return of(this.cache.get(key));
    }

    // Si no está, hago la petición y guardo en cache
    return this.http.get<PokemonListResponse>(`${this.api}?limit=${limit}&offset=${offset}`).pipe(
      tap(data => this.cache.set(key, data))
    );
  }

  // ✅ MEJORA: Reutilizo el cache para búsquedas
  searchAllPokemon(term: string): Observable<any[]> {
    if (!term.trim()) return of([]);

    const cacheKey = 'all-pokemon';
    term = term.toLowerCase();

    // Si ya tengo todos los Pokémon en cache, los uso
    if (this.cache.has(cacheKey)) {
      const allPokemon = this.cache.get(cacheKey);
      const filtered = allPokemon.filter((p: any) => 
        p.name.toLowerCase().includes(term)
      );
      return of(filtered);
    }

    // Si no los tengo, los pido y guardo en cache
    return this.http.get<any>(`${this.api}?limit=1300`).pipe(
      map(res => res.results),
      tap(pokemons => this.cache.set(cacheKey, pokemons)),
      map(pokemons => 
        pokemons.filter((p: any) => p.name.toLowerCase().includes(term))
      ),
      catchError(() => of([]))
    );
  }

  // ✅ MEJORA: Cache para detalles individuales
  getPokemonDetails(id: string | number): Observable<PokemonDetail> {
    const key = `detail-${id}`;
    
    if (this.cache.has(key)) {
      return of(this.cache.get(key));
    }

    return this.http.get<PokemonDetail>(`${this.api}/${id}`).pipe(
      tap(data => this.cache.set(key, data))
    );
  }

  selectPokemon(pokemon: PokemonDetail) {
    this.selectedPokemonSubject.next(pokemon);
  }

}
