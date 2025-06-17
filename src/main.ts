import "./style.css";

import { buildMusicUrl, getURL, extractDomain, shuffle } from "./utils";
import * as Favorites from "./favorites";

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
interface AppState {
    animations: string[];
    animationMusicMap: Record<string, string>;
    creditsData: Record<string, CreditEntry[]>;
    currentIndex: number;
    userInteracted: boolean;
    isFavoritesPageActive: boolean;
}

const appState: AppState = {
    animations: [],
    animationMusicMap: {},
    creditsData: {},
    currentIndex: 0,
    userInteracted: false,
    isFavoritesPageActive: false,
};

// --- Module Instances --
const uiManager = new UIManager();
const audioManager = new AudioManager(buildMusicUrl);
const animationManager = new AnimationManager(uiManager.viewer);
const navigation = new Navigation();

// --- Functions ---

function findCredit(musicName: string): { text: string; url: string | null } {
    if (!musicName) return { text: "Music: None", url: null };
    for (const source in appState.creditsData) {
        for (const entry of appState.creditsData[source]) {
            if (entry.tracks.includes(musicName)) {
                return {
                    text: `Music by ${entry.credit} from ${extractDomain(source)}.`,
                    url: getURL(musicName, source)
                };
            }
        }
    }
    return { text: `Music: "${musicName}" (credit not found).`, url: null };
}

async function takeScreenshot(): Promise<string | null> {
    try {
        const canvas = await html2canvas(uiManager.viewer.contentDocument!.body, {
            useCORS: true,
        });
        return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
        console.error("Failed to capture screenshot:", error);
        return null;
    }
}

async function loadCurrentAnimation(): Promise<void> {
    if (appState.animations.length === 0 || appState.isFavoritesPageActive) return;
    const animation = appState.animations[appState.currentIndex];
    animationManager.loadAnimation(animation);
    uiManager.updateFavoriteButton(Favorites.isFavorite(animation));
    const musicName = appState.animationMusicMap[animation];
    if (uiManager.isAboutModalOpen()) {
        showAboutModal()
    }
    if (musicName) {
        await audioManager.setMusic(musicName);
        if (appState.userInteracted) audioManager.playMusic();
    } else {
        audioManager.stopMusic();
    }
}

function goToNextAnimation(): void {
    appState.currentIndex = (appState.currentIndex + 1) % appState.animations.length;
    loadCurrentAnimation();
}

function goToPreviousAnimation(): void {
    appState.currentIndex = (appState.currentIndex - 1 + appState.animations.length) % appState.animations.length;
    loadCurrentAnimation();
}

async function shareAnimation() {
    const animationName = appState.animations[appState.currentIndex];
    const share_url = `${window.location.origin}${window.location.pathname}?animation=${animationName}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Animation Viewer',
                url: share_url,
            });
            console.log('Animation shared successfully');
        } catch (error) {
            console.error('Error sharing animation:', error);
        }
    } else {
        // Fallback
        uiManager.showShareModal(share_url);
    }
}

function showAboutModal(): void {
    const animationName = appState.animations[appState.currentIndex];
    const musicName = appState.animationMusicMap[animationName];
    const creditInfo = findCredit(musicName);
    uiManager.showAboutModal(animationName, creditInfo.text, creditInfo.url);
}

async function toggleFavorite(): Promise<void> {
    const animation = appState.animations[appState.currentIndex];
    if (Favorites.isFavorite(animation)) {
        Favorites.removeFavorite(animation);
    } else {
        const screenshot = await takeScreenshot();
        Favorites.addFavorite(animation, screenshot);
    }
    uiManager.updateFavoriteButton(Favorites.isFavorite(animation));
}

function showFavoritesList(): void {
    const favorites = Favorites.getFavorites();
    uiManager.showFavoritesPage(favorites,
        // Click handler
        (animationName: string) => {
            const foundIndex = appState.animations.indexOf(animationName);
            if (foundIndex !== -1) {
                appState.currentIndex = foundIndex;
                hideFavoritesPage();
                loadCurrentAnimation();
            }
        },
        // Remove handler
        (animationName: string) => {
            Favorites.removeFavorite(animationName);
            // Re-render the favorites list to show the change
            showFavoritesList();
        }
    );
}


function hideFavoritesPage(): void {
    uiManager.hideFavoritesPage();
    appState.isFavoritesPageActive = false;
    // loadCurrentAnimation();
}

/**
 * Shows the UI and sets a timer to hide it again.
 */
function showUI(): void {
    uiManager.setUIActive(true);

}

async function initializeApp(): Promise<void> {
    try {
        const response = await fetch("data.json");
        const data: DataFile = await response.json();
        appState.animationMusicMap = data.animations;
        appState.animations =  shuffle(Object.keys(appState.animationMusicMap));
        appState.creditsData = data.credits;

        const urlParams = new URLSearchParams(window.location.search);
        const animationParam = urlParams.get('animation');
        if (animationParam) {
            const foundIndex = appState.animations.indexOf(animationParam);
            if (foundIndex !== -1) appState.currentIndex = foundIndex;
        }

        uiManager.viewer.style.filter = 'blur(8px)';
        loadCurrentAnimation();
    } catch (error) {
        console.error("Failed to load or parse data.json:", error);
    }
}

// --- Event Listener Setup ---

// Play Overlay
uiManager.playBtn.addEventListener('click', () => {
    appState.userInteracted = true;
    uiManager.hidePlayOverlay();
    uiManager.viewer.style.filter = 'none';
    showUI();
    if (audioManager.isMusicSet()) {
        audioManager.playMusic();
    }
});

// Main controls
uiManager.prevBtn.addEventListener("click", goToPreviousAnimation);
uiManager.nextBtn.addEventListener("click", goToNextAnimation);
uiManager.shareBtn.addEventListener("click", shareAnimation);

// About Modal
uiManager.aboutBtn.addEventListener("click", showAboutModal);
uiManager.closeAboutBtn.addEventListener("click", () => uiManager.hideAboutModal());
// Share Modal
uiManager.closeShareBtn.addEventListener("click", () => uiManager.hideShareModal());
uiManager.copyShareUrlBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(uiManager.shareUrlInput.value);
        const originalText = uiManager.copyShareUrlBtn.textContent;
        uiManager.copyShareUrlBtn.textContent = "Copied!";
        uiManager.copyShareUrlBtn.disabled = true;

        setTimeout(() => {
            uiManager.copyShareUrlBtn.textContent = originalText;
            uiManager.copyShareUrlBtn.disabled = false;
        }, 2000);

    } catch (err) {
        console.error("Failed to copy: ", err);
    }

});
// Favorites
uiManager.favoriteBtn.addEventListener("click", toggleFavorite);
uiManager.favoritesBtn.addEventListener("click", showFavoritesList);


// Keyboard Navigation
function onkeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
        if (uiManager.isAboutModalOpen()) return uiManager.hideAboutModal();
        if (uiManager.isFavoritesPageOpen()) return hideFavoritesPage();
    }
    const isOverlayOpen = uiManager.isAboutModalOpen() || uiManager.isFavoritesPageOpen();
    if (!isOverlayOpen) {
        if (e.key === "ArrowUp") goToPreviousAnimation();
        if (e.key === "ArrowDown") goToNextAnimation();
        if (e.key === "f") toggleFavorite();
    }
}
window.addEventListener('keydown', onkeyDown);
animationManager.setupIframeKeydownListener(onkeyDown);

// Swipe Navigation
navigation.addSwipeListeners(
    [document, animationManager],

    () => { if (!appState.isFavoritesPageActive && !uiManager.isAboutModalOpen()) goToNextAnimation(); },
    () => { if (!appState.isFavoritesPageActive && !uiManager.isAboutModalOpen()) goToPreviousAnimation(); }
);

// Initial application load
initializeApp();