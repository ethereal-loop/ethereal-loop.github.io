import type { FavoriteEntry } from "./favorites";

export interface FavoritesPageOptions {
    onFavoriteClick: (animationName: string) => void;
    onFavoriteRemove: (animationName:string) => void;
    onFavoriteBack:VoidFunction

}

export class FavoritesPage {
    private container: HTMLElement;
    private grid: HTMLElement;
    private backBtn: HTMLButtonElement;

    constructor() {
        this.container = document.getElementById('favorites-page')!;
        this.grid = document.getElementById('favorites-grid')!;
        this.backBtn = document.getElementById('backFromFavoritesBtn') as HTMLButtonElement;

        // this.backBtn.addEventListener('click', () => this.hide());
    }

    show(favorites: FavoriteEntry[], opts: FavoritesPageOptions) {
        // clear old
        this.grid.innerHTML = '';
        this.backBtn.onclick = ()=>opts.onFavoriteBack()

        if (favorites.length === 0) {
            this.grid.style.display = 'block'; // Fallback to block display to center the text. TODO : make this in the HTML
            this.grid.innerHTML = `<p class="text-gray-400 text-center mt-8">No favorites here, add some!</p>`;
        } else {
            this.grid.style.display = 'grid'; // Revert to grid display if there are favorites
            favorites.forEach(entry => {
                const wrapper = document.createElement('li');
                wrapper.className = 'favorite-item';

                const imgContainer = document.createElement('div');
                imgContainer.className = 'favorite-preview-link';

                const img = document.createElement('img');
                img.src = entry.screenshot || "";
                img.alt = '';
                img.className = 'favorite-preview';

                // click to open
                wrapper.addEventListener('click', () => opts.onFavoriteClick(entry.animation));

                // remove button
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '×';
                removeBtn.title = 'Remove from favorites';
                removeBtn.className = `
                    absolute top-2 right-2
                    bg-black bg-opacity-50
                    text-white rounded-full
                    w-6 h-6 flex items-center justify-center
                    z-10
                `;
                removeBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    opts.onFavoriteRemove(entry.animation);
                });
                wrapper.appendChild(removeBtn);

                imgContainer.appendChild(img);
                wrapper.appendChild(imgContainer);
                this.grid.appendChild(wrapper);
            });
        }

        this.container.classList.remove('hidden');
    }

    hide() {
        this.container.classList.add('hidden');
    }
    isOpen() {
        return !this.container.classList.contains('hidden');
    }
}