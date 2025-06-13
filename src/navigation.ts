// navigation.ts
export class Navigation {
    private touchStartX: number = 0;
    private touchStartY: number = 0;

    constructor() {}

    /**
     * Adds event listeners for touch-based swipe navigation (up/down for next/prev).
     * @param onSwipeDown Callback to execute when a swipe down (or right for horizontal) is detected.
     * @param onSwipeUp Callback to execute when a swipe up (or left for horizontal) is detected.
     */
    public addSwipeListeners(onSwipeDown: () => void, onSwipeUp: () => void): void {
        window.addEventListener('touchstart', (e: TouchEvent) => {
            const firstTouch = e.touches[0];
            this.touchStartX = firstTouch.clientX;
            this.touchStartY = firstTouch.clientY;
        }, { passive: true }); // Use passive to improve scrolling performance

        window.addEventListener('touchend', (e: TouchEvent) => {
            if (!this.touchStartX || !this.touchStartY) return; // No touch started

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;

            // Reset touch coordinates
            this.touchStartX = 0;
            this.touchStartY = 0;

            const minSwipeDistance = 50; // Minimum distance for a swipe to be registered

            // Determine if it's a vertical or horizontal swipe, and which direction
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
                // Vertical swipe
                if (deltaY > 0) {
                    onSwipeDown(); // Swiped down
                } else {
                    onSwipeUp(); // Swiped up
                }
            }
            // You can add horizontal swipe logic here if needed for left/right
            // else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            //     if (deltaX > 0) {
            //         // Swiped right
            //     } else {
            //         // Swiped left
            //     }
            // }
        }, { passive: true });
    }
}
