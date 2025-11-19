import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PokemonDetail } from 'src/app/model/pokemon.model';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.sass']
})
export class PokemonDetailComponent {
 pokemon?: PokemonDetail;
  typesString = '';  // ← NUEVO: cadena lista para mostrar
  private destroy$ = new Subject<void>();

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.pokemonService.selectedPokemon$
      .pipe(takeUntil(this.destroy$))
      .subscribe(poke => {
        this.pokemon = poke;
        // ← AQUÍ CALCULAMOS LOS TIPOS
        if (poke?.types) {
          this.typesString = poke.types
            .map(t => t.type.name)
            .join(', ');
        } else {
          this.typesString = '';
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
