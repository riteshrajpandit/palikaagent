/// <reference types="node" />

declare module "microsoft-cognitiveservices-speech-sdk" {
  export class SpeechConfig {
    static fromSubscription(
      subscriptionKey: string,
      region: string
    ): SpeechConfig;
    speechSynthesisVoiceName: string;
    speechRecognitionLanguage: string;
  }

  export class AudioConfig {
    static fromDefaultSpeakerOutput(): AudioConfig;
    static fromDefaultMicrophoneInput(): AudioConfig;
  }

  export class SpeechSynthesizer {
    constructor(speechConfig: SpeechConfig, audioConfig?: AudioConfig | null);
    speakTextAsync(
      text: string,
      callback: (result: SpeechSynthesisResult) => void,
      errorCallback: (error: string) => void
    ): void;
    close(): void;
  }

  export class SpeechRecognizer {
    constructor(speechConfig: SpeechConfig, audioConfig: AudioConfig);
    recognizeOnceAsync(
      callback: (result: SpeechRecognitionResult) => void,
      errorCallback: (error: string) => void
    ): void;
    stopContinuousRecognitionAsync(callback?: () => void): void;
    close(): void;
  }

  export interface SpeechSynthesisResult {
    reason: ResultReason;
    errorDetails: string;
    audioData: ArrayBuffer;
  }

  export interface SpeechRecognitionResult {
    reason: ResultReason;
    text: string;
    errorDetails: string;
  }

  export enum ResultReason {
    SynthesizingAudioCompleted = 3,
    RecognizedSpeech = 1,
    NoMatch = 0,
    Canceled = 2,
  }
}
