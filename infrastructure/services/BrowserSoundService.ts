import { ISoundService } from '../../domain/interfaces/ISoundService';

/**
 * Implementation of ISoundService using Web Audio API for browser environments
 */
export class BrowserSoundService implements ISoundService {
  private audioContext: AudioContext | null = null;
  private soundBuffers: Map<string, AudioBuffer> = new Map();
  private activeSounds: Map<string, AudioBufferSourceNode> = new Map();
  private soundEnabled: boolean = true;
  private masterVolume: number = 1.0;
  private masterGainNode: GainNode | null = null;
  private soundPaths: Map<string, string> = new Map();

  constructor() {
    // Initialize sound paths
    this.initializeSoundPaths();
    
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      const initAudio = () => {
        if (!this.audioContext) {
          try {
            // Use AudioContext or fallback to webkitAudioContext for older browsers
            // Using unknown type and type assertion for browser compatibility
            const AudioContextClass = window.AudioContext || 
              ((window as unknown) as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.audioContext = new AudioContextClass();
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.value = this.masterVolume;
            this.masterGainNode.connect(this.audioContext.destination);
            console.log('🔊 Audio context initialized');
            
            // Preload common sounds
            this.preloadCommonSounds();
          } catch (error) {
            console.error('Failed to initialize audio context:', error);
          }
        }
        
        // Remove event listeners after initialization
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
        document.removeEventListener('keydown', initAudio);
      };
      
      // Initialize audio context on user interaction
      document.addEventListener('click', initAudio);
      document.addEventListener('touchstart', initAudio);
      document.addEventListener('keydown', initAudio);
    }
  }

  /**
   * Initialize paths to sound files
   */
  private initializeSoundPaths(): void {
    // Battle sounds
    this.soundPaths.set('attack', '/sounds/attack.mp3');
    this.soundPaths.set('defend', '/sounds/defend.mp3');
    this.soundPaths.set('skill', '/sounds/skill.mp3');
    this.soundPaths.set('monster-attack', '/sounds/monster-attack.mp3');
    this.soundPaths.set('critical-hit', '/sounds/critical-hit.mp3');
    this.soundPaths.set('victory', '/sounds/victory.mp3');
    this.soundPaths.set('defeat', '/sounds/defeat.mp3');
    this.soundPaths.set('flee', '/sounds/flee.mp3');
    this.soundPaths.set('item-use', '/sounds/item-use.mp3');
    
    // UI sounds
    this.soundPaths.set('click', '/sounds/click.mp3');
    this.soundPaths.set('menu-open', '/sounds/menu-open.mp3');
    this.soundPaths.set('menu-close', '/sounds/menu-close.mp3');
    
    // Background music
    this.soundPaths.set('battle-music', '/sounds/battle-music.mp3');
    this.soundPaths.set('world-map-music', '/sounds/world-map-music.mp3');
  }

  /**
   * Preload commonly used sounds
   */
  private async preloadCommonSounds(): Promise<void> {
    try {
      await Promise.all([
        this.preloadSound('attack'),
        this.preloadSound('defend'),
        this.preloadSound('skill'),
        this.preloadSound('monster-attack'),
        this.preloadSound('victory'),
        this.preloadSound('defeat')
      ]);
      console.log('🎵 Common sounds preloaded');
    } catch (error) {
      console.error('Failed to preload common sounds:', error);
    }
  }

  /**
   * Get the path for a sound ID
   */
  private getSoundPath(soundId: string): string {
    const path = this.soundPaths.get(soundId);
    if (!path) {
      console.warn(`Sound path not found for: ${soundId}`);
      return '';
    }
    return path;
  }

  /**
   * Load an audio file and decode it
   */
  private async loadSound(soundId: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    const path = this.getSoundPath(soundId);
    if (!path) {
      throw new Error(`Sound path not found for: ${soundId}`);
    }

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load sound: ${path}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.soundBuffers.set(soundId, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Error loading sound ${soundId}:`, error);
      throw error;
    }
  }

  /**
   * Play a sound effect
   */
  public async playSound(soundId: string, volume: number = 1.0): Promise<void> {
    if (!this.soundEnabled || !this.audioContext) {
      return;
    }

    try {
      // Get or load the sound buffer
      let buffer = this.soundBuffers.get(soundId);
      if (!buffer) {
        buffer = await this.loadSound(soundId);
      }

      // Create source node
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      // Create gain node for this sound
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume * this.masterVolume;
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.masterGainNode!);
      
      // Store the source for potential stopping later
      this.activeSounds.set(soundId, source);
      
      // Play the sound
      source.start(0);
      
      // Remove from active sounds when finished
      source.onended = () => {
        this.activeSounds.delete(soundId);
      };
    } catch (error) {
      console.error(`Error playing sound ${soundId}:`, error);
    }
  }

  /**
   * Play background music
   */
  public async playMusic(musicId: string, loop: boolean = true, volume: number = 0.5): Promise<void> {
    if (!this.soundEnabled || !this.audioContext) {
      return;
    }

    try {
      // Stop any existing music with this ID
      this.stopSound(musicId);
      
      // Get or load the music buffer
      let buffer = this.soundBuffers.get(musicId);
      if (!buffer) {
        buffer = await this.loadSound(musicId);
      }

      // Create source node
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = loop;

      // Create gain node for this music
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume * this.masterVolume;
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.masterGainNode!);
      
      // Store the source for potential stopping later
      this.activeSounds.set(musicId, source);
      
      // Play the music
      source.start(0);
      
      // Remove from active sounds when finished (if not looping)
      if (!loop) {
        source.onended = () => {
          this.activeSounds.delete(musicId);
        };
      }
    } catch (error) {
      console.error(`Error playing music ${musicId}:`, error);
    }
  }

  /**
   * Stop a specific sound or music
   */
  public stopSound(soundId: string): void {
    const source = this.activeSounds.get(soundId);
    if (source) {
      try {
        source.stop();
      } catch {
        // Ignore errors when stopping already stopped sources
      }
      this.activeSounds.delete(soundId);
    }
  }

  /**
   * Stop all currently playing sounds and music
   */
  public stopAll(): void {
    this.activeSounds.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Ignore errors when stopping already stopped sources
      }
    });
    this.activeSounds.clear();
  }

  /**
   * Set the master volume for all sounds
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.masterVolume;
    }
  }

  /**
   * Check if sound is enabled
   */
  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Enable or disable all sounds
   */
  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  /**
   * Preload a sound to have it ready for immediate playback
   */
  public async preloadSound(soundId: string): Promise<void> {
    if (!this.audioContext) {
      return;
    }

    if (!this.soundBuffers.has(soundId)) {
      try {
        await this.loadSound(soundId);
      } catch (error) {
        console.error(`Error preloading sound ${soundId}:`, error);
      }
    }
  }
  
  /**
   * Enable sound
   */
  public enableSound(): void {
    this.setSoundEnabled(true);
  }
  
  /**
   * Disable sound
   */
  public disableSound(): void {
    this.setSoundEnabled(false);
  }
  
  /**
   * Get current volume level
   */
  public getVolume(): number {
    return this.masterVolume;
  }
  
  /**
   * Set volume level
   */
  public setVolume(volume: number): void {
    this.setMasterVolume(volume);
  }
}
