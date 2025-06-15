// uiManager.ts
import {type FavoriteEntry } from "./favorites"; // Import the FavoriteEntry interface

export class UIManager {
    public viewer: HTMLIFrameElement;
    public controls: HTMLDivElement;
    public playOverlay: HTMLDivElement;
    public playBtn: HTMLButtonElement;
    public aboutModal: HTMLDivElement;
    public closeAboutBtn: HTMLButtonElement;
    public animationFilenameEl: HTMLSpanElement;
    public musicCreditEl: HTMLDivElement;

    // New properties for the full favorites page
    public favoritesPage: HTMLDivElement;
    public backFromFavoritesBtn: HTMLButtonElement;
    public favoritesGrid: HTMLUListElement;

    public favoriteBtn: HTMLButtonElement;
    public prevBtn: HTMLButtonElement;
    public nextBtn: HTMLButtonElement;
    public randomBtn: HTMLButtonElement;
    public aboutBtn: HTMLButtonElement;
    public favoritesBtn: HTMLButtonElement;


    constructor(
        viewer: HTMLIFrameElement,
        controls: HTMLDivElement,
        playOverlay: HTMLDivElement,
        playBtn: HTMLButtonElement,
        aboutModal: HTMLDivElement,
        closeAboutBtn: HTMLButtonElement,
        animationFilenameEl: HTMLSpanElement,
        musicCreditEl: HTMLDivElement,
        favoriteBtn: HTMLButtonElement, // Favorite button is part of main controls
        // New parameters for the full favorites page elements
        favoritesPage: HTMLDivElement,
        backFromFavoritesBtn: HTMLButtonElement,
        favoritesGrid: HTMLUListElement,
    ) {
        this.viewer = viewer;
        this.controls = controls;
        this.playOverlay = playOverlay;
        this.playBtn = playBtn;
        this.aboutModal = aboutModal;
        this.closeAboutBtn = closeAboutBtn;
        this.animationFilenameEl = animationFilenameEl;
        this.musicCreditEl = musicCreditEl;
        this.favoriteBtn = favoriteBtn;

        // Initialize new favorites page elements
        this.favoritesPage = favoritesPage;
        this.backFromFavoritesBtn = backFromFavoritesBtn;
        this.favoritesGrid = favoritesGrid; // Assign to the new grid element

        // Initialize other control buttons by getting them from the DOM
        this.prevBtn = document.getElementById("prevBtn") as HTMLButtonElement;
        this.nextBtn = document.getElementById("nextBtn") as HTMLButtonElement;
        this.randomBtn = document.getElementById("randomBtn") as HTMLButtonElement;
        this.aboutBtn = document.getElementById("aboutBtn") as HTMLButtonElement;
        this.favoritesBtn = document.getElementById("favoritesBtn") as HTMLButtonElement; // The button that opens the favorites page
    }

    /**
     * Hides the initial play overlay.
     */
    public hidePlayOverlay(): void {
        this.playOverlay.classList.add('hidden');
    }

    /**
     * Shows the main control buttons.
     */
    public showControls(): void {
        this.controls.classList.remove('hidden');
    }

    /**
     * Shows the about modal with animation details.
     * @param filename The filename of the current animation.
     * @param creditText The formatted music credit text.
     * @param creditUrl Optional URL for the music credit.
     */
    public showAboutModal(filename: string, creditText: string, creditUrl: string | null): void {
        this.animationFilenameEl.textContent = `${filename}.html`;
        this.musicCreditEl.innerHTML = ''; // Clear previous content

        if (creditUrl) {
            const link = document.createElement('a');
            link.href = creditUrl;
            link.textContent = creditText;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            this.musicCreditEl.appendChild(link);
        } else {
            this.musicCreditEl.textContent = creditText;
        }
        this.aboutModal.classList.remove('hidden');
        // hide main controls and blur viewer when modal is open
        this.controls.classList.add('hidden');
        this.viewer.classList.add('blurred'); // Add a class for blurring via CSS
    }

    /**
     * Hides the about modal.
     */
    public hideAboutModal(): void {
        this.aboutModal.classList.add('hidden');
        // Show main controls and unblur viewer when modal is closed
        this.controls.classList.remove('hidden');
        this.viewer.classList.remove('blurred');
    }

    /**
     * Checks if the about modal is currently open.
     * @returns True if the about modal is open, false otherwise.
     */
    public isAboutModalOpen(): boolean {
        return !this.aboutModal.classList.contains('hidden');
    }

    /**
     * Populates and shows the full favorites page.
     * @param favorites An array of favorite animation entries including screenshots.
     * @param onFavoriteClick Callback function to handle clicking a favorite animation.
     */
    public showFavoritesPage(favorites: FavoriteEntry[], onFavoriteClick: (animationName: string) => void): void {
        this.favoritesGrid.innerHTML = ''; // Clear previous content

        // Hide main app content
        this.controls.classList.add('hidden');
        this.viewer.classList.add('hidden'); // Fully hide the iframe

        if (favorites.length === 0) {
            const messageLi = document.createElement('li');
            messageLi.classList.add('col-span-full', 'text-center', 'py-4', 'text-gray-400', 'text-lg');
            messageLi.textContent = 'No favorites yet. Click the heart icon to add your first favorite!';
            this.favoritesGrid.appendChild(messageLi);
        } else {
            favorites.forEach((fav: FavoriteEntry) => {
                const li = document.createElement('li');
                li.classList.add('favorite-item', 'bg-[#2c2c2c]', 'rounded-lg', 'overflow-hidden', 'cursor-pointer', 'transition-all', 'duration-200', 'hover:scale-105', 'hover:shadow-xl', 'flex', 'flex-col');

                const img = document.createElement('img');
                // Use the stored screenshot or a placeholder SVG if no screenshot is available
                img.src = fav.screenshot || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 120\'%3E%3Crect width=\'200\' height=\'120\' fill=\'%23333\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-family=\'Inter, sans-serif\' font-size=\'16\' fill=\'%23aaa\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3ENo Preview%3C/text%3E%3C/svg%3E';
                img.alt = `Preview of ${fav.animation}`;
                img.classList.add('favorite-preview', 'w-full', 'h-32', 'object-cover', 'block', 'border-b', 'border-gray-700', 'mb-2');

                const span = document.createElement('span');
                span.textContent = fav.animation;
                span.classList.add('favorite-name', 'text-sm', 'text-gray-300', 'px-3', 'py-1', 'truncate'); // Added truncate

                li.appendChild(img);
                li.appendChild(span);

                li.addEventListener('click', () => {
                    onFavoriteClick(fav.animation); // Pass only the animation name to the callback
                });
                this.favoritesGrid.appendChild(li);
            });
        }
        this.favoritesPage.classList.remove('hidden'); // Show the favorites page
    }

    /**
     * Hides the favorites page and returns to the main viewer.
     */
    public hideFavoritesPage(): void {
        this.favoritesPage.classList.add('hidden'); // Hide the favorites page
        // Show main app content again
        this.controls.classList.remove('hidden');
        this.viewer.classList.remove('hidden'); // Unhide the iframe
        this.viewer.classList.remove('blurred'); // Ensure no blur remains
    }

    /**
     * Checks if the favorites page is currently open.
     * @returns True if the favorites page is open, false otherwise.
     */
    public isFavoritesPageOpen(): boolean {
        return !this.favoritesPage.classList.contains('hidden');
    }

    /**
     * Updates the visual state of the favorite button.
     * @param isFavorite True if the current animation is a favorite, false otherwise.
     */
    public updateFavoriteButton(isFavorite: boolean): void {
        if (isFavorite) {
            this.favoriteBtn.classList.add('active');
            this.favoriteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            `; // TODO Heart icon filled
        } else {
            this.favoriteBtn.classList.remove('active');
            this.favoriteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            `; // TODO Heart icon outline
        }
    }
}
