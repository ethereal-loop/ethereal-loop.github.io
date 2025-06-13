import "./style.css";
import { md5 } from "hash-wasm";

interface CreditEntry {
  credit: string;
  tracks: string[];
}
interface DataFile {
  animations: Record<string, string>;
  credits: Record<string, CreditEntry[]>;
}

// --- DOM Elements ---
const viewer = document.getElementById("viewer") as HTMLIFrameElement;
const controls = document.getElementById("controls") as HTMLDivElement;

// Buttons
const prevBtn = document.getElementById("prevBtn") as HTMLButtonElement;
const nextBtn = document.getElementById("nextBtn") as HTMLButtonElement;
const randomBtn = document.getElementById("randomBtn") as HTMLButtonElement;
const aboutBtn = document.getElementById("aboutBtn") as HTMLButtonElement;

// Play Overlay
const playOverlay = document.getElementById("play-overlay") as HTMLDivElement;
const playBtn = document.getElementById("playBtn") as HTMLButtonElement;

// About Modal
const aboutModal = document.getElementById("about-modal") as HTMLDivElement;
const closeAboutBtn = document.getElementById("closeAboutBtn") as HTMLButtonElement;
const animationInfoEl = document.getElementById("animation-info") as HTMLParagraphElement;
const animationFilenameEl = document.getElementById("animation-filename") as HTMLSpanElement;
const musicCreditEl = document.getElementById("music-credit") as HTMLDivElement;


// --- State ---
let animations: string[] = [];
let animationMusicMap: Record<string, string> = {};
let creditsData: Record<string, CreditEntry[]> = {};
let index = 0;
let userInteracted = false;

// Audio element to play background music
const audio = new Audio();
audio.loop = true;

// --- Functions ---

/**
 * Fetch and process the data.json file
 */
async function loadAnimations(): Promise<void> {
  try {
    const response = await fetch("data.json");
    const data: DataFile = await response.json();

    animationMusicMap = data.animations;
    animations = Object.keys(animationMusicMap);
    creditsData = data.credits;

    // Initially blur the viewer
    viewer.style.filter = 'blur(8px)';

    // Load the first animation, but don't play music yet
    load();
  } catch (error) {
    console.error("Failed to load or parse data.json:", error);
    // Display an error to the user
    document.body.innerHTML = '<div style="color: red; text-align: center; padding-top: 50px;">Error loading animation data. Please check console.</div>';
  }
}

/**
 * Build the Appwrite storage URL for a given music filename (without extension)
 */
async function buildMusicUrl(musicName: string) {
  const fileId = (await md5(musicName)).slice(0, 20);
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
  const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID;
  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;


  return `https://${endpoint}/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}&mode=admin`;
}

/**
 * Load the current animation into the iframe and prepare its matching music
 */
async function load(): Promise<void> {
  if (animations.length === 0) return;
  const animation = animations[index];
  viewer.src = `data/${animation}.html`;

  const musicName = animationMusicMap[animation];
  if (musicName) {
    audio.src = await buildMusicUrl(musicName);
    if (userInteracted) {
      audio.play().catch(err => console.error("Error playing audio:", err));
    }
  } else {
    audio.pause();
    audio.src = ""; // Clear src if no music
  }
}


function getURL(musicName: string,source:string){
  // 10__fs -> 10 (OR alwase start with Number_ )
  // pix-song-10 -> 10 (OR alwase end with -Number)
  const match = musicName.match(/^(\d+)_|-(\d+)$/);
  const id =  match ? (match[1] || match[2]) : '';

  return `https://${source}/${id}`

}

function findCredit(musicName: string): { text: string; url: string | null } {
  if (!musicName) {
    return { text: "Music: None", url: null };
  }

  for (const source in creditsData) {
    for (const entry of creditsData[source]) {
      if (entry.tracks.includes(musicName)) {
        const text = `Music "${musicName}" created by ${entry.credit} from ${source}.`;
        const url = getURL(musicName,source)
        return { text, url };
      }
    }
  }
  return { text: `Music: "${musicName}" (error: credit not found).`, url: null };
}

function showAboutInfo(): void {
  const animationName = animations[index];
  animationFilenameEl.textContent = `${animationName}.html`;

  const musicName = animationMusicMap[animationName];
  const creditInfo = findCredit(musicName);

  musicCreditEl.innerHTML = ''; // Clear previous content
  if (creditInfo.url) {
    const link = document.createElement('a');
    link.href = creditInfo.url;
    link.textContent = creditInfo.text;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    musicCreditEl.appendChild(link);
  } else {
    musicCreditEl.textContent = creditInfo.text;
  }

  aboutModal.classList.remove('hidden');
}

// --- Navigation Functions ---
function next(): void {
  index = (index + 1) % animations.length;
  load();
}

function prev(): void {
  index = (index - 1 + animations.length) % animations.length;
  load();
}

function random(): void {
  const oldIndex = index;
  if (animations.length > 1) {
    do {
      index = Math.floor(Math.random() * animations.length);
    } while (index === oldIndex);
  }
  load();
}

// --- Event Listeners ---

playBtn.addEventListener('click', () => {
    userInteracted = true;
    playOverlay.classList.add('hidden');
    controls.classList.remove('hidden');
    viewer.style.filter = 'none'; // Remove blur

    if (audio.src) {
        audio.play().catch(err => console.error("Error playing audio on interaction:", err));
    }
});

// Main controls
prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);
randomBtn.addEventListener("click", random);

// About Modal
aboutBtn.addEventListener("click", showAboutInfo);
closeAboutBtn.addEventListener("click", () => aboutModal.classList.add('hidden'));
aboutModal.addEventListener('click', (e) => {
  if (e.target === aboutModal) {
    aboutModal.classList.add('hidden');
  }
});


// Hide modal on escape key press or click outside
// Keyboard and Swipe Navigation
window.addEventListener('keydown', (e) => {
  if (e.key === "Escape" && !aboutModal.classList.contains('hidden')) {
    aboutModal.classList.add('hidden');
    return;
  }
  if (aboutModal.classList.contains('hidden')) {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }
});

let touchStartX = 0, touchStartY = 0;
window.addEventListener('touchstart', e => {
  const firstTouch = e.touches[0];
  touchStartX = firstTouch.clientX;
  touchStartY = firstTouch.clientY;
}, { passive: true });

window.addEventListener('touchend', e => {
  if (!touchStartX || !touchStartY) return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  touchStartX = 0;
  touchStartY = 0;
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
    deltaX > 0 ? prev() : next();
  }
}, { passive: true });

// --- Initial Load ---
loadAnimations();