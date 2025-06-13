// uiManager.ts

export class UIManager {
    public viewer: HTMLIFrameElement;
    public controls: HTMLDivElement;
    public playOverlay: HTMLDivElement;
    public playBtn: HTMLButtonElement;
    public aboutModal: HTMLDivElement;
    public closeAboutBtn: HTMLButtonElement;
    public animationFilenameEl: HTMLSpanElement;
    public musicCreditEl: HTMLDivElement;
    public favoritesModal: HTMLDivElement;
    public closeFavoritesBtn: HTMLButtonElement;
    public favoritesList: HTMLUListElement;
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
        favoritesModal: HTMLDivElement,
        closeFavoritesBtn: HTMLButtonElement,
        favoritesList: HTMLUListElement,
        favoriteBtn: HTMLButtonElement, // Added to constructor
    ) {
        this.viewer = viewer;
        this.controls = controls;
        this.playOverlay = playOverlay;
        this.playBtn = playBtn;
        this.aboutModal = aboutModal;
        this.closeAboutBtn = closeAboutBtn;
        this.animationFilenameEl = animationFilenameEl;
        this.musicCreditEl = musicCreditEl;
        this.favoritesModal = favoritesModal;
        this.closeFavoritesBtn = closeFavoritesBtn;
        this.favoritesList = favoritesList;
        this.favoriteBtn = favoriteBtn; // Initialize favorite button

        // Initialize other buttons by getting them from the DOM
        this.prevBtn = document.getElementById("prevBtn") as HTMLButtonElement;
        this.nextBtn = document.getElementById("nextBtn") as HTMLButtonElement;
        this.randomBtn = document.getElementById("randomBtn") as HTMLButtonElement;
        this.aboutBtn = document.getElementById("aboutBtn") as HTMLButtonElement;
        this.favoritesBtn = document.getElementById("favoritesBtn") as HTMLButtonElement;
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
    }

    /**
     * Hides the about modal.
     */
    public hideAboutModal(): void {
        this.aboutModal.classList.add('hidden');
    }

    /**
     * Checks if the about modal is currently open.
     * @returns True if the about modal is open, false otherwise.
     */
    public isAboutModalOpen(): boolean {
        return !this.aboutModal.classList.contains('hidden');
    }

    /**
     * Populates and shows the favorites modal.
     * @param favorites An array of favorite animation names.
     * @param onFavoriteClick Callback function to handle clicking a favorite animation.
     */
    public showFavoritesModal(favorites: string[], onFavoriteClick: (animationName: string) => void): void {
        this.favoritesList.innerHTML = '';
        if (favorites.length === 0) {
            this.favoritesList.innerHTML = '<li class="text-gray-400">No favorites yet.</li>';
        } else {
            favorites.forEach((animation: string) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `?animation=${animation}`; // For accessibility/fallback
                a.textContent = animation;
                a.classList.add('block', 'py-2', 'px-3', 'rounded-md', 'hover:bg-gray-800', 'transition-colors', 'duration-200');
                a.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent default link navigation
                    onFavoriteClick(animation); // Use the callback
                });
                li.appendChild(a);
                this.favoritesList.appendChild(li);
            });
        }
        this.favoritesModal.classList.remove('hidden');
    }

    /**
     * Hides the favorites modal.
     */
    public hideFavoritesModal(): void {
        this.favoritesModal.classList.add('hidden');
    }

    /**
     * Checks if the favorites modal is currently open.
     * @returns True if the favorites modal is open, false otherwise.
     */
    public isFavoritesModalOpen(): boolean {
        return !this.favoritesModal.classList.contains('hidden');
    }

    /**
     * Updates the visual state of the favorite button.
     * @param isFavorite True if the current animation is a favorite, false otherwise.
     */
    public updateFavoriteButton(isFavorite: boolean): void {
        if (isFavorite) {
            this.favoriteBtn.classList.add('active');
            this.favoriteBtn.textContent = 'Unfavorite'; // Change text
        } else {
            this.favoriteBtn.classList.remove('active');
            this.favoriteBtn.textContent = 'Favorite'; // Change text
        }
    }
}
