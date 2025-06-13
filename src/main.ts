import "./style.css";
import { buildMusicUrl, getURL } from "./utils";
import * as Favorites from "./favorites";

import { UIManager } from "./uiManager";
import { AnimationManager } from "./animationManager";
import { Navigation } from "./navigation";
import { AudioManager } from "./audioManager";

// --- Interfaces ---
interface CreditEntry {
    credit: string;
    tracks: string[];
}

interface DataFile {
    animations: Record<string, string>;
    credits: Record<string, CreditEntry[]>;
}

// --- State Management ---
// Centralized state object
interface AppState {
    animations: string[];
    animationMusicMap: Record<string, string>;
    creditsData: Record<string, CreditEntry[]>;
    currentIndex: number;
    userInteracted: boolean;
}

const appState: AppState = {
    animations: [],
    animationMusicMap: {},
    creditsData: {},
    currentIndex: 0,
    userInteracted: false,
};

// --- Module Instances ---
// UIManager handles all DOM interactions and modal displays.
const uiManager = new UIManager(
    document.getElementById("viewer") as HTMLIFrameElement,
    document.getElementById("controls") as HTMLDivElement,
    document.getElementById("play-overlay") as HTMLDivElement,
    document.getElementById("playBtn") as HTMLButtonElement,
    document.getElementById("about-modal") as HTMLDivElement,
    document.getElementById("closeAboutBtn") as HTMLButtonElement,
    document.getElementById("animation-filename") as HTMLSpanElement,
    document.getElementById("music-credit") as HTMLDivElement,
    document.getElementById("favorites-modal") as HTMLDivElement,
    document.getElementById("closeFavoritesBtn") as HTMLButtonElement,
    document.getElementById("favorites-list") as HTMLUListElement,
    document.getElementById("favoriteBtn") as HTMLButtonElement,
);

// AudioManager manages the audio element and playback.
const audioManager = new AudioManager(buildMusicUrl);

// AnimationManager handles loading animations into the iframe.
const animationManager = new AnimationManager(uiManager.viewer);

// Navigation handles moving between animations.
const navigation = new Navigation();

// --- Functions to interact with state and modules ---

/**
 * Finds and formats credit information for a given music name.
 * @param musicName The name of the music file.
 * @returns An object containing the credit text and a URL, or null if no URL.
 */
function findCredit(musicName: string): { text: string; url: string | null } {
    if (!musicName) {
        return { text: "Music: None", url: null };
    }

    for (const source in appState.creditsData) {
        for (const entry of appState.creditsData[source]) {
            if (entry.tracks.includes(musicName)) {
                const text = `Music "${musicName}" created by ${entry.credit} from ${source}.`;
                const url = getURL(musicName, source);
                return { text, url };
            }
        }
    }
    return { text: `Music: "${musicName}" (error: credit not found).`, url: null };
}

/**
 * Loads the current animation and its associated music.
 * Updates the favorite button state.
 */
async function loadCurrentAnimation(): Promise<void> {
    if (appState.animations.length === 0) return;

    const animation = appState.animations[appState.currentIndex];
    animationManager.loadAnimation(animation);

    // Update favorite button based on current animation
    uiManager.updateFavoriteButton(Favorites.isFavorite(animation));

    const musicName = appState.animationMusicMap[animation];
    if (musicName) {
        await audioManager.setMusic(musicName);
        if (appState.userInteracted) {
            audioManager.playMusic();
        }
    } else {
        audioManager.stopMusic();
    }
}

/**
 * Handles navigation to the next animation.
 */
function goToNextAnimation(): void {
    appState.currentIndex = (appState.currentIndex + 1) % appState.animations.length;
    loadCurrentAnimation();
}

/**
 * Handles navigation to the previous animation.
 */
function goToPreviousAnimation(): void {
    appState.currentIndex = (appState.currentIndex - 1 + appState.animations.length) % appState.animations.length;
    loadCurrentAnimation();
}

/**
 * Handles navigation to a random animation.
 */
function goToRandomAnimation(): void {
    const oldIndex = appState.currentIndex;
    if (appState.animations.length > 1) {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * appState.animations.length);
        } while (newIndex === oldIndex);
        appState.currentIndex = newIndex;
    }
    loadCurrentAnimation();
}

/**
 * Shows the about modal with details of the current animation.
 */
function showAboutModal(): void {
    const animationName = appState.animations[appState.currentIndex];
    const musicName = appState.animationMusicMap[animationName];
    const creditInfo = findCredit(musicName);
    uiManager.showAboutModal(animationName, creditInfo.text, creditInfo.url);
}

/**
 * Toggles the favorite status of the current animation.
 */
function toggleFavorite(): void {
    const animation = appState.animations[appState.currentIndex];
    if (Favorites.isFavorite(animation)) {
        Favorites.removeFavorite(animation);
    } else {
        Favorites.addFavorite(animation);
    }
    uiManager.updateFavoriteButton(Favorites.isFavorite(animation));
}

/**
 * Displays the list of favorite animations in the modal.
 */
function showFavoritesList(): void {
    const favorites = Favorites.getFavorites();
    uiManager.showFavoritesModal(favorites, (animationName: string) => {
        // Callback for clicking a favorite animation
        const foundIndex = appState.animations.indexOf(animationName);
        if (foundIndex !== -1) {
            appState.currentIndex = foundIndex;
            loadCurrentAnimation();
            uiManager.hideFavoritesModal(); // Close modal after selection
        }
    });
}

/**
 * Initializes the application by fetching data and setting up initial state.
 */
async function initializeApp(): Promise<void> {
    try {
        const response = await fetch("data.json");
        const data: DataFile = await response.json();

        appState.animationMusicMap = data.animations;
        appState.animations = Object.keys(appState.animationMusicMap);
        appState.creditsData = data.credits;

        const urlParams = new URLSearchParams(window.location.search);
        const animationParam = urlParams.get('animation');
        if (animationParam) {
            const foundIndex = appState.animations.indexOf(animationParam);
            if (foundIndex !== -1) {
                appState.currentIndex = foundIndex;
            }
        }

        uiManager.viewer.style.filter = 'blur(8px)'; // Initially blur the viewer
        loadCurrentAnimation(); // Load initial animation without playing music yet
    } catch (error) {
        console.error("Failed to load or parse data.json:", error);
        document.body.innerHTML = '<div style="color: red; text-align: center; padding-top: 50px;">Error loading animation data. Please check console.</div>';
    }
}

// --- Event Listener Setup ---

// Play Overlay
uiManager.playBtn.addEventListener('click', () => {
    appState.userInteracted = true;
    uiManager.hidePlayOverlay();
    uiManager.showControls();
    uiManager.viewer.style.filter = 'none'; // Remove blur

    if (audioManager.isMusicSet()) {
        audioManager.playMusic();
    }
});

// Main controls
uiManager.prevBtn.addEventListener("click", goToPreviousAnimation);
uiManager.nextBtn.addEventListener("click", goToNextAnimation);
uiManager.randomBtn.addEventListener("click", goToRandomAnimation);

// About Modal
uiManager.aboutBtn.addEventListener("click", showAboutModal);
uiManager.closeAboutBtn.addEventListener("click", () => uiManager.hideAboutModal());
uiManager.aboutModal.addEventListener('click', (e) => {
    if (e.target === uiManager.aboutModal) {
        uiManager.hideAboutModal();
    }
});

// Favorites
uiManager.favoriteBtn.addEventListener("click", toggleFavorite);
uiManager.favoritesBtn.addEventListener("click", showFavoritesList);
uiManager.closeFavoritesBtn.addEventListener("click", () => uiManager.hideFavoritesModal());
uiManager.favoritesModal.addEventListener('click', (e) => {
    if (e.target === uiManager.favoritesModal) {
        uiManager.hideFavoritesModal();
    }
});

function onkeyDown(e: KeyboardEvent) {
        // Check if any modal is open
        const isModalOpen = uiManager.isAboutModalOpen() || uiManager.isFavoritesModalOpen();

        if (e.key === "Escape" && isModalOpen) {
            if (uiManager.isAboutModalOpen()) uiManager.hideAboutModal();
            if (uiManager.isFavoritesModalOpen()) uiManager.hideFavoritesModal();
            return;
        }

        // Only allow navigation if no modals are open
        if (!isModalOpen) {
            if (e.key === "ArrowUp") goToPreviousAnimation();
            if (e.key === "ArrowDown") goToNextAnimation();
        }
    }

// Global keyboard and touch navigation
window.addEventListener('keydown', onkeyDown);
animationManager.setupIframeKeydownListener(onkeyDown)

// Add swipe listeners
navigation.addSwipeListeners(
    () => goToNextAnimation(), // Swipe down
    () => goToPreviousAnimation() // Swipe up
);


// Initial application load
initializeApp();
