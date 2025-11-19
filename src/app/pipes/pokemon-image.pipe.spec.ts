import { PokemonImagePipe } from './pokemon-image.pipe';

describe('PokemonImagePipe', () => {
  it('create an instance', () => {
    const pipe = new PokemonImagePipe();
    expect(pipe).toBeTruthy();
  });
});
