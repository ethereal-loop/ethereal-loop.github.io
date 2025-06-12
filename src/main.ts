import "./style.css"

const viewer = document.getElementById("viewer") as HTMLIFrameElement;
const prevBtn = document.getElementById("prevBtn") as HTMLButtonElement;
const nextBtn = document.getElementById("nextBtn") as HTMLButtonElement;
const randomBtn = document.getElementById("randomBtn") as HTMLButtonElement;

let animations: string[] = [];
let index = 0;

async function loadAnimations(): Promise<void> {
  const response = await fetch("animations.json");
  animations = await response.json();
  load();
}

function load(): void {
  viewer.src = "data/" + animations[index];
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

loadAnimations();
