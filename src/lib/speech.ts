import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const AZURE_SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || "";
const AZURE_SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || "southeastasia";

export class SpeechService {
  private synthesizer: SpeechSDK.SpeechSynthesizer | null = null;
  private recognizer: SpeechSDK.SpeechRecognizer | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map(); // Cache audio URLs

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  /**
   * Stop any currently playing audio
   */
  stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Synthesize text to speech and return audio URL (for caching)
   */
  async synthesizeToAudio(text: string, language: "ne" | "en" = "ne"): Promise<string> {
    // Check cache first
    const cacheKey = `${language}-${text}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    return new Promise((resolve, reject) => {
      try {
        if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
          throw new Error("Azure Speech credentials are not configured");
        }

        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
          AZURE_SPEECH_KEY,
          AZURE_SPEECH_REGION
        );

        // Set voice based on language
        if (language === "ne") {
          speechConfig.speechSynthesisVoiceName = "ne-NP-HemkalaNeural";
        } else {
          speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
        }

        // Use null audio config to get audio data without playing
        const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);

        synthesizer.speakTextAsync(
          text,
          (result) => {
            if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
              // Convert audio data to blob URL
              const audioData = result.audioData;
              const blob = new Blob([audioData], { type: 'audio/wav' });
              const url = URL.createObjectURL(blob);
              
              // Cache the audio URL
              this.audioCache.set(cacheKey, url);
              
              synthesizer.close();
              resolve(url);
            } else {
              console.error("Speech synthesis failed:", result.errorDetails);
              synthesizer.close();
              reject(new Error(result.errorDetails));
            }
          },
          (error) => {
            console.error("Speech synthesis error:", error);
            synthesizer.close();
            reject(error);
          }
        );
      } catch (error) {
        console.error("Error initializing speech synthesis:", error);
        reject(error);
      }
    });
  }

  /**
   * Play audio from URL
   */
  async playAudio(audioUrl: string, autoPlay: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop any currently playing audio
        this.stopCurrentAudio();

        const audio = new Audio(audioUrl);
        this.currentAudio = audio;

        audio.onended = () => {
          this.currentAudio = null;
          resolve();
        };

        audio.onerror = (error) => {
          this.currentAudio = null;
          reject(error);
        };

        if (autoPlay) {
          audio.play().catch(reject);
        } else {
          resolve();
        }
      } catch (error) {
        console.error("Error playing audio:", error);
        reject(error);
      }
    });
  }

  /**
   * Synthesize text to speech using Azure TTS (legacy method for backward compatibility)
   */
  async speakText(text: string, language: "ne" | "en" = "ne"): Promise<void> {
    try {
      const audioUrl = await this.synthesizeToAudio(text, language);
      await this.playAudio(audioUrl, true);
    } catch (error) {
      console.error("Error in speakText:", error);
      throw error;
    }
  }

  /**
   * Stop current speech synthesis (legacy method)
   */
  stopSpeaking(): void {
    this.stopCurrentAudio();
    if (this.synthesizer) {
      this.synthesizer.close();
      this.synthesizer = null;
    }
  }

  /**
   * Clear audio cache (optional, for memory management)
   */
  clearCache(): void {
    this.audioCache.forEach(url => URL.revokeObjectURL(url));
    this.audioCache.clear();
  }

  /**
   * Recognize speech from microphone
   */
  async recognizeSpeech(language: "ne" | "en" = "ne"): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
          throw new Error("Azure Speech credentials are not configured");
        }

        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
          AZURE_SPEECH_KEY,
          AZURE_SPEECH_REGION
        );

        // Set language for recognition
        if (language === "ne") {
          speechConfig.speechRecognitionLanguage = "ne-NP";
        } else {
          speechConfig.speechRecognitionLanguage = "en-US";
        }

        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        this.recognizer = new SpeechSDK.SpeechRecognizer(
          speechConfig,
          audioConfig
        );

        this.recognizer.recognizeOnceAsync(
          (result) => {
            if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
              console.log("Recognized speech:", result.text);
              resolve(result.text);
            } else if (result.reason === SpeechSDK.ResultReason.NoMatch) {
              console.log("No speech recognized");
              reject(new Error("No speech recognized. Please try again."));
            } else {
              console.error("Speech recognition failed:", result.errorDetails);
              reject(new Error(result.errorDetails));
            }
            this.recognizer?.close();
            this.recognizer = null;
          },
          (error) => {
            console.error("Speech recognition error:", error);
            this.recognizer?.close();
            this.recognizer = null;
            reject(error);
          }
        );
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        reject(error);
      }
    });
  }

  /**
   * Stop current speech recognition
   */
  stopRecognizing(): void {
    if (this.recognizer) {
      this.recognizer.close();
      this.recognizer = null;
    }
  }
}

// Export a singleton instance
export const speechService = new SpeechService();
