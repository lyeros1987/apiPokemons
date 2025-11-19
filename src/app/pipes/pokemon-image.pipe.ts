import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pokemonImage'
})
export class PokemonImagePipe implements PipeTransform {

  transform(url: string): string {
    if (!url) return 'assets/no-image.png';

    // Extrae el ID del URL: https://pokeapi.co/api/v2/pokemon/25/ → 25
    const id = url.split('/').filter(Boolean).pop();
    
    // Devuelve la imagen oficial
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }
}
