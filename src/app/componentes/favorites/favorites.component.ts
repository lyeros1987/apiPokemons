import { Component } from '@angular/core';
import { PokemonDetail } from 'src/app/model/pokemon.model';
import { PokemonService } from 'src/app/services/pokemon.service';


@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.sass']
})
export class FavoritesComponent {

 favorites: any[] = [];
constructor(private pokemonService: PokemonService) {}
  ngOnInit(): void {
    this.loadFavorites();
    window.addEventListener('favorites-changed', () => this.loadFavorites());
    window.addEventListener('storage', () => this.loadFavorites());
  }

  loadFavorites() {
    const data = localStorage.getItem('pokemon-favorites');
    this.favorites = data ? JSON.parse(data) : [];
  }

  removeFavorite(poke: any, event: Event) {
    event.stopPropagation();
    let favs = this.favorites.filter(f => f.name !== poke.name);
    localStorage.setItem('pokemon-favorites', JSON.stringify(favs));
    this.loadFavorites();
  }
  onFavoriteClick(pokemon: any) {
  // Si ya tiene los detalles completos → lo enviamos directo
  if (pokemon.height) {
    this.pokemonService.selectPokemon(pokemon);
  } else {
    // Si solo tiene name/url → traemos los detalles y luego enviamos
    this.pokemonService.getPokemonDetails(pokemon.name).subscribe(detail => {
      this.pokemonService.selectPokemon(detail);
    });
  }
}
}
