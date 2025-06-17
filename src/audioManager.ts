// audioManager.ts
export class AudioManager {
    private audio: HTMLAudioElement;
    private buildMusicUrl: (musicName: string) => Promise<string>;
    private musicSet: boolean = false; // To track if a music source has been set

    constructor(buildMusicUrlFn: (musicName: string) => Promise<string>) {
        this.audio = new Audio();
        this.audio.loop = true;
        this.buildMusicUrl = buildMusicUrlFn;
    }

    /**
     * Sets the music source and prepares it for playback.
     * @param musicName The name of the music file.
     */
    public async setMusic(musicName: string): Promise<void> {
        try {
            this.audio.src = await this.buildMusicUrl(musicName);
            this.musicSet = true;
        } catch (error) {
            console.error("Error building music URL:", error);
            this.stopMusic(); // Ensure music stops if URL fails
            this.musicSet = false;
        }
    }

    /**
     * Plays the currently set music. Catches and logs any play errors.
     */
    public playMusic(): void {
        if (this.musicSet && this.audio.src) {
            this.audio.play().catch(err => console.error("Error playing audio:", err));
        }
    }

    public pauseMusic(): void {
        if (!this.audio.paused) {
            this.audio.pause();
        }
    }

    /**
     * Resumes the music if it was paused.
     */
    public resumeMusic(): void {
        if (this.musicSet && this.audio.paused) {
            this.audio.play().catch(err => console.error("Error resuming audio:", err));
        }
    }

    /**
     * Pauses the current music and clears its source.
     */
    public stopMusic(): void {
        this.audio.pause();
        this.audio.src = ""; // Clear src if no music or error
        this.musicSet = false;
    }

    /**
     * Checks if a music source has been successfully set.
     * @returns True if music is set, false otherwise.
     */
    public isMusicSet(): boolean {
        return this.musicSet;
    }
}
