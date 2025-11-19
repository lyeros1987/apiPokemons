
export function calculateSummary(pokemons: any[]): { [letter: string]: number } {
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