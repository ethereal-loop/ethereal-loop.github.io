// animationManager.ts
export class AnimationManager {
    private viewer: HTMLIFrameElement;

    constructor(viewer: HTMLIFrameElement) {
        this.viewer = viewer;
    }

    /**
     * Loads a specified animation into the iframe.
     * @param animationName The name of the animation (e.g., "animation1").
     */
    public loadAnimation(animationName: string): void {
        this.viewer.src = `data/${animationName}.html`;
    }

    /**
     * Attaches a keydown listener to the iframe's content window once it loads.
     * This is useful if the iframe content itself needs to respond to key presses.
     * @param handler The keydown event handler function.
     */
    public setupIframeKeydownListener(handler: (e: KeyboardEvent) => void): void {
        // Ensure the iframe content is fully loaded before trying to add a listener
        this.viewer.onload = () => {
            const iframeWindow = this.viewer.contentWindow;
            if (iframeWindow) {
                // Remove any existing listener to prevent duplicates
                iframeWindow.removeEventListener("keydown", handler);
                iframeWindow.addEventListener("keydown", handler);
            }
        };
    }
}
