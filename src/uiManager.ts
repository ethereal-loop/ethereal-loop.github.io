// uiManager.ts
import {type FavoriteEntry } from "./favorites";
import { FavoritesPage } from "./favoritesPage";

export class UIManager {
    public viewer: HTMLIFrameElement;
    public viewerContainer: HTMLDivElement;
    public playOverlay: HTMLDivElement;
    public playBtn: HTMLButtonElement;
    public aboutModal: HTMLDivElement;
    public closeAboutBtn: HTMLButtonElement;
    public animationFilenameEl: HTMLSpanElement;
    public musicCreditEl: HTMLDivElement;

    public favoritesPage: FavoritesPage;

    public favoriteBtn: HTMLButtonElement;
    public prevBtn: HTMLButtonElement;
    public nextBtn: HTMLButtonElement;
    public randomBtn: HTMLButtonElement;
    public aboutBtn: HTMLButtonElement;
    public favoritesBtn: HTMLButtonElement;


    constructor() {
        // Main elements
        this.viewerContainer = document.getElementById("viewer-container") as HTMLDivElement;
        this.viewer = document.getElementById("viewer") as HTMLIFrameElement;
        this.playOverlay = document.getElementById("play-overlay") as HTMLDivElement;
        this.playBtn = document.getElementById("playBtn") as HTMLButtonElement;

        // About Modal
        this.aboutModal = document.getElementById("about-modal") as HTMLDivElement;
        this.closeAboutBtn = document.getElementById("closeAboutBtn") as HTMLButtonElement;
        this.animationFilenameEl = document.getElementById("animation-filename") as HTMLSpanElement;
        this.musicCreditEl = document.getElementById("music-credit") as HTMLDivElement;

        // Favorites Page
        this.favoritesPage = new FavoritesPage()

        // Control buttons
        this.prevBtn = document.getElementById("prevBtn") as HTMLButtonElement;
        this.nextBtn = document.getElementById("nextBtn") as HTMLButtonElement;
        this.randomBtn = document.getElementById("randomBtn") as HTMLButtonElement;
        this.aboutBtn = document.getElementById("aboutBtn") as HTMLButtonElement;
        this.favoriteBtn = document.getElementById("favoriteBtn") as HTMLButtonElement;
        this.favoritesBtn = document.getElementById("favoritesBtn") as HTMLButtonElement;
    }

    public hidePlayOverlay(): void {
        this.playOverlay.classList.add('hidden');
    }

    public showAboutModal(filename: string, creditText: string, creditUrl: string | null): void {
        this.animationFilenameEl.textContent = `${filename}.html`;
        this.musicCreditEl.innerHTML = ''; // Clear previous content

        if (creditUrl) {
            const link = document.createElement('a');
            link.href = creditUrl;
            link.textContent = creditText;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.classList.add('text-blue-300', 'hover:underline');
            this.musicCreditEl.appendChild(link);
        } else {
            this.musicCreditEl.textContent = creditText;
        }
        this.aboutModal.classList.remove('hidden');
        // this.setUIActive(false); // Hide main controls when modal is open
    }

    public hideAboutModal(): void {
        this.aboutModal.classList.add('hidden');
    }

    public isAboutModalOpen(): boolean {
        return !this.aboutModal.classList.contains('hidden');
    }

    public setUIActive(isActive: boolean): void {
        if (isActive) {
            this.viewerContainer.classList.add('ui-active');
        } else {
            this.viewerContainer.classList.remove('ui-active');
        }
    }

    public showFavoritesPage(
        favorites: FavoriteEntry[],
        onFavoriteClick: (animationName: string) => void,
        onFavoriteRemove: (animationName: string) => void
    ): void {
        this.favoritesPage.show(favorites,{onFavoriteClick,onFavoriteRemove})
    }


    public hideFavoritesPage(): void {
        this.favoritesPage.hide()
        this.viewerContainer.classList.remove('hidden');
    }

    public isFavoritesPageOpen(): boolean {
        return this.favoritesPage.isOpen()
    }

    public updateFavoriteButton(isFavorite: boolean): void {
        if (isFavorite) {
            this.favoriteBtn.classList.add('active');
            this.favoriteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>`;
        } else {
            this.favoriteBtn.classList.remove('active');
            this.favoriteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" fill="currentColor">
                    <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
                </svg>`;
        }
    }
}