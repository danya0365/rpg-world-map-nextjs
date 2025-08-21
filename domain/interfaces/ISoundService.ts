/**
 * Interface for sound service that handles game audio
 */
export interface ISoundService {
  /**
   * Play a sound effect
   * @param soundId Identifier for the sound to play
   * @param volume Optional volume level (0.0 to 1.0)
   * @returns Promise that resolves when the sound starts playing
   */
  playSound(soundId: string, volume?: number): Promise<void>;
  
  /**
   * Play background music
   * @param musicId Identifier for the music track
   * @param loop Whether to loop the music (default: true)
   * @param volume Optional volume level (0.0 to 1.0)
   * @returns Promise that resolves when the music starts playing
   */
  playMusic(musicId: string, loop?: boolean, volume?: number): Promise<void>;
  
  /**
   * Stop a specific sound or music
   * @param soundId Identifier for the sound to stop
   */
  stopSound(soundId: string): void;
  
  /**
   * Stop all currently playing sounds and music
   */
  stopAll(): void;
  
  /**
   * Set the master volume for all sounds
   * @param volume Volume level (0.0 to 1.0)
   */
  setMasterVolume(volume: number): void;
  
  /**
   * Check if sound is enabled
   * @returns True if sound is enabled
   */
  isSoundEnabled(): boolean;
  
  /**
   * Enable or disable all sounds
   * @param enabled Whether sound should be enabled
   */
  setSoundEnabled(enabled: boolean): void;
  
  /**
   * Preload a sound to have it ready for immediate playback
   * @param soundId Identifier for the sound to preload
   * @returns Promise that resolves when the sound is loaded
   */
  preloadSound(soundId: string): Promise<void>;
  
  /**
   * Enable sound
   */
  enableSound(): void;
  
  /**
   * Disable sound
   */
  disableSound(): void;
  
  /**
   * Get current volume level
   * @returns Current volume level (0.0 to 1.0)
   */
  getVolume(): number;
  
  /**
   * Set volume level
   * @param volume Volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void;
}
