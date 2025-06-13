// favorites.ts
export function getFavorites(): string[] {
  const favorites = localStorage.getItem('favorites');
  return favorites ? JSON.parse(favorites) : [];
}

export function addFavorite(animation: string): void {
  const favorites = getFavorites();
  if (!favorites.includes(animation)) {
    favorites.push(animation);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

export function removeFavorite(animation: string): void {
  const favorites = getFavorites();
  const index = favorites.indexOf(animation);
  if (index !== -1) {
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

export function isFavorite(animation: string): boolean {
  const favorites = getFavorites();
  return favorites.includes(animation);
}