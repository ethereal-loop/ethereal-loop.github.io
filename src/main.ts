import "./style.css";
import { md5 } from "hash-wasm";

/**
 * data.json structure:
 * {
 *   "animations": {
 *     HtmlFileWithoutExt: "musicFileWithoutExt",
 *     ...
 *   },
 *   "credits": {
 *     "pixabay": [
 *       {
 *         credit: "name",
 *         tracks: ["musicFileWithoutExt", ...]
 *       },
 *       ...
 *     ],
 *     ...
 *   }
 * }
 */

interface CreditEntry {
  credit: string;
  tracks: string[];
}
interface DataFile {
  animations: Record<string, string>;
  credits: Record<string, CreditEntry[]>;
}

const viewer = document.getElementById("viewer") as HTMLIFrameElement;
const prevBtn = document.getElementById("prevBtn") as HTMLButtonElement;
const nextBtn = document.getElementById("nextBtn") as HTMLButtonElement;
const randomBtn = document.getElementById("randomBtn") as HTMLButtonElement;

let animations: string[] = [];
let animationMusicMap: Record<string, string> = {};
let index = 0;
let userInteracted = false; // chromuim will not autoplay music

// Audio element to play background music
const audio = new Audio();
audio.loop = true;

document.addEventListener('click', () => {
  if (!userInteracted) {
    userInteracted = true;
    if (audio.src) {
      audio.play().catch(err => console.error("Error playing audio:", err));
    }
  }
});

async function loadAnimations(): Promise<void> {
  const response = await fetch("data.json");
  const data: DataFile = await response.json();

  // Populate animations and track map
  animationMusicMap = data.animations;
  animations = Object.keys(animationMusicMap);

  // Optionally, you could process data.credits here if you need to display credits

  // Load the first animation + music
  load();
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
 * Load the current animation into the iframe and play its matching music
 */
async function load() {
  const animation = animations[index];
  // Set the iframe source (ensure your HTML files are in data/ folder)
  viewer.src = `data/${animation}.html`;

  // Lookup music file for this animation
  const musicName = animationMusicMap[animation];
  if (musicName) {
    audio.src = await buildMusicUrl(musicName);
    if (userInteracted) {
      audio.play().catch(err => console.error("Error playing audio:", err));
    }
    else {
      // TODO: hold that audio

    }
  } else {
    // Pause if no music mapping
    audio.pause();
  }
}

function next(): void {
  index = (index + 1) % animations.length;
  load();
}

function prev(): void {
  index = (index - 1 + animations.length) % animations.length;
  load();
}

function random(): void {
  index = Math.floor(Math.random() * animations.length);
  load();
}

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);
randomBtn.addEventListener("click", random);

// Start fetching and loading animations + music
loadAnimations();
