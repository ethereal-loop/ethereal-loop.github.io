// favorites.ts

// Define the structure for a favorite entry, including the screenshot data
export interface FavoriteEntry {
    animation: string;
    screenshot: string | null; // Stores the base64 data URL of the screenshot
}

/**
 * Retrieves the list of favorite animations from local storage.
 * @returns An array of FavoriteEntry objects.
 */
export function getFavorites(): FavoriteEntry[] {
    const favorites = localStorage.getItem('favorites');
    // Parse the JSON string from local storage, or return an empty array if not found
    return favorites ? JSON.parse(favorites) : [];
}

/**
 * Adds an animation to the favorites list, along with its screenshot.
 * If the animation is already favorited, it does nothing.
 * @param animation The name of the animation to add.
 * @param screenshot The base64 data URL of the screenshot for the animation.
 */
export function addFavorite(animation: string, screenshot: string | null): void {
    const favorites = getFavorites();
    // Check if an entry with this animation name already exists to prevent duplicates
    if (!favorites.some(entry => entry.animation === animation)) {
        favorites.push({ animation, screenshot }); // Add the new favorite entry
        localStorage.setItem('favorites', JSON.stringify(favorites)); // Save updated list
    }
}

/**
 * Removes an animation from the favorites list.
 * @param animation The name of the animation to remove.
 */
export function removeFavorite(animation: string): void {
    const favorites = getFavorites();
    // Filter out the animation to be removed
    const updatedFavorites = favorites.filter(entry => entry.animation !== animation);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Save updated list
}

/**
 * Checks if an animation is currently in the favorites list.
 * @param animation The name of the animation to check.
 * @returns True if the animation is a favorite, false otherwise.
 */
export function isFavorite(animation: string): boolean {
    const favorites = getFavorites();
    // Check if any entry matches the animation name
    return favorites.some(entry => entry.animation === animation);
}
