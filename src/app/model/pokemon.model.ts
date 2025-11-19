// POKÉMON BÁSICO EN LISTADO
export interface Pokemon {
  name: string;
  url: string;
}

// RESPUESTA DE LISTADO PAGINADO
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];  // ← AQUÍ USA Pokemon
}

// TIPO DE POKÉMON
export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

// DETALLE COMPLETO
export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  types: PokemonType[];
}