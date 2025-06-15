import "./style.css";

import { buildMusicUrl, getURL } from "./utils";
import * as Favorites from "./favorites"; // Ensure FavoriteEntry is imported or re-declared here

import { UIManager } from "./uiManager";
import { AnimationManager } from "./animationManager";
import { Navigation } from "./navigation";
import { AudioManager } from "./audioManager";
import html2canvas from "html2canvas";

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
    isFavoritesPageActive: boolean; // New state to manage favorites page visibility
}

const appState: AppState = {
    animations: [],
    animationMusicMap: {},
    creditsData: {},
    currentIndex: 0,
    userInteracted: false,
    isFavoritesPageActive: false, // Initialize as false
};

// --- Module Instances --
// UIManager handles all DOM interactions and modal/page displays.
const uiManager = new UIManager(
    document.getElementById("viewer") as HTMLIFrameElement,
    document.getElementById("controls") as HTMLDivElement,
    document.getElementById("play-overlay") as HTMLDivElement,
    document.getElementById("playBtn") as HTMLButtonElement,
    document.getElementById("about-modal") as HTMLDivElement,
    document.getElementById("closeAboutBtn") as HTMLButtonElement,
    document.getElementById("animation-filename") as HTMLSpanElement,
    document.getElementById("music-credit") as HTMLDivElement,
    document.getElementById("favoriteBtn") as HTMLButtonElement,
    // New elements for the full favorites page
    document.getElementById("favorites-page") as HTMLDivElement,
    document.getElementById("backFromFavoritesBtn") as HTMLButtonElement,
    document.getElementById("favorites-grid") as HTMLUListElement, // Updated ID
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
            // For a robust credit system, you might need more complex matching logic
        }
    }
    return { text: `Music: "${musicName}" (error: credit not found).`, url: null };
}

/**
 * Captures a screenshot of the current iframe content.
 * This function handles cross-origin limitations by attempting to draw to canvas.
 * For truly cross-origin iframes without specific server-side proxies or
 * iframe sandboxing with `allow-same-origin` (and the iframe content explicitly allowing it),
 * screenshotting might not be possible.
 *
 * @returns A Promise resolving to a base64 data URL of the screenshot, or null on failure.
 */
async function takeScreenshot(): Promise<string | null> {
    const viewerIframe = uiManager.viewer;
    // Due to cross-origin security restrictions, direct screenshot of iframe content
    // is only possible if the iframe content is from the same origin.
    // Assuming the animations are served from the same domain as the main application.
    try {
        const canvas = await html2canvas(viewerIframe.contentDocument!.body);
        return canvas.toDataURL();
    } catch (error) {
        console.error("Failed to capture screenshot:", error);
        return null;
    }
}

/**
 * Loads the current animation and its associated music.
 * Updates the favorite button state.
 */
async function loadCurrentAnimation(): Promise<void> {
    // Only load if the favorites page is NOT active
    if (appState.animations.length === 0 || appState.isFavoritesPageActive) return;

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
 * Toggles the favorite status of the current animation, including capturing a screenshot.
 */
async function toggleFavorite(): Promise<void> {
    const animation = appState.animations[appState.currentIndex];
    if (Favorites.isFavorite(animation)) {
        Favorites.removeFavorite(animation);
    } else {
        // Capture screenshot ONLY when adding to favorites
        const screenshot = await takeScreenshot();
        Favorites.addFavorite(animation, screenshot);
    }
    uiManager.updateFavoriteButton(Favorites.isFavorite(animation));
}

/**
 * Displays the list of favorite animations on a full page.
 */
function showFavoritesList(): void {
    const favorites = Favorites.getFavorites();
    appState.isFavoritesPageActive = true; // Set state that favorites page is active
    uiManager.showFavoritesPage(favorites, (animationName: string) => {
        // Callback for clicking a favorite animation from the list
        const foundIndex = appState.animations.indexOf(animationName);
        if (foundIndex !== -1) {
            appState.currentIndex = foundIndex;
            hideFavoritesPage(); // Close favorites page after selection
        }
    });
}

/**
 * Hides the favorites page and returns to the main viewer.
 */
function hideFavoritesPage(): void {
    uiManager.hideFavoritesPage(); // Delegates UI hiding
    appState.isFavoritesPageActive = false; // Update app state
    loadCurrentAnimation(); // Re-load current animation after returning
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
// Close about modal by clicking outside
uiManager.aboutModal.addEventListener('click', (e) => {
    if (e.target === uiManager.aboutModal) {
        uiManager.hideAboutModal();
    }
});

// Favorites
uiManager.favoriteBtn.addEventListener("click", toggleFavorite);
uiManager.favoritesBtn.addEventListener("click", showFavoritesList);
uiManager.backFromFavoritesBtn.addEventListener("click", hideFavoritesPage); // New event listener for back button

function onkeyDown(e: KeyboardEvent) {
        // Check if any modal or the favorites page is open
        const isOverlayOpen = uiManager.isAboutModalOpen() || uiManager.isFavoritesPageOpen();

        if (e.key === "Escape") {
            if (uiManager.isAboutModalOpen()) {
                uiManager.hideAboutModal();
                return;
            }
            if (uiManager.isFavoritesPageOpen()) { // Handle escape on favorites page
                hideFavoritesPage();
                return;
            }
        }

        // Only allow navigation if no modals or favorites page are open
        if (!isOverlayOpen) {
            if (e.key === "ArrowUp") goToPreviousAnimation();
            if (e.key === "ArrowDown") goToNextAnimation();
        }
    }

// Global keyboard and touch navigation
window.addEventListener('keydown', onkeyDown);
animationManager.setupIframeKeydownListener(onkeyDown)

// Add swipe listeners (only if not on a special page)
navigation.addSwipeListeners(
    () => { if (!appState.isFavoritesPageActive && !uiManager.isAboutModalOpen()) goToNextAnimation(); }, // Swipe down
    () => { if (!appState.isFavoritesPageActive && !uiManager.isAboutModalOpen()) goToPreviousAnimation(); } // Swipe up
);


// Initial application load
initializeApp();
