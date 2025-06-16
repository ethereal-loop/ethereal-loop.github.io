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

    public addEventListener(key: string, handler: (e: any) => void, options?: AddEventListenerOptions,usWindow:Window|Document|null=null) {
        this.viewer.addEventListener('load', () => {
            const iframeWindow = usWindow||this.viewer.contentDocument
            if (iframeWindow) {
                // Remove any existing listener to prevent duplicates
                iframeWindow.removeEventListener(key, handler, options);
                iframeWindow.addEventListener(key, handler, options);
            }
        });

    }


    public setupIframeKeydownListener(handler: (e: KeyboardEvent) => void): void {
        // Ensure the iframe content is fully loaded before trying to add a listener
        this.addEventListener("keydown", handler,undefined,this.viewer.contentWindow)
        return

    }

    public getFullDoc() {
        return this.viewer.contentDocument

    }
}
