# Palika Agent API Integration

## Overview
The Palika Agent integrates with the Amigaa municipal services API and Azure Speech Services to provide a complete AI-powered municipal assistant experience.

## API Endpoints

### Bot API
**Endpoint:** `https://palika.amigaa.com/api/v1/palika/bot/`
**Method:** POST
**Content-Type:** application/json

#### Request Payload
```json
{
  "query": "string" // User's message/question
}
```

#### Response
```json
{
  "success": boolean,
  "answer": "string" // AI generated response
}
```

#### Example
```typescript
const response = await axios.post('https://palika.amigaa.com/api/v1/palika/bot/', {
  query: "नगरपालिका सेवाहरू के के छन्?"
});

console.log(response.data.answer);
// Output: AI response about municipal services
```

## Azure Speech Services

### Text-to-Speech (TTS)
The application uses Azure Cognitive Services Speech SDK for converting text responses to speech.

**Voice Used:** `ne-NP-HemkalaNeural` (Nepali female voice)
**Region:** Southeast Asia

#### Configuration
```typescript
const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
  AZURE_SPEECH_KEY,
  AZURE_SPEECH_REGION
);
speechConfig.speechSynthesisVoiceName = "ne-NP-HemkalaNeural";
```

#### Supported Voices
- **Nepali:** `ne-NP-HemkalaNeural` (Female), `ne-NP-SagarNeural` (Male)
- **English:** `en-US-JennyNeural` (Female), `en-US-GuyNeural` (Male)

### Speech-to-Text (STT)
Converts user's voice input to text for processing.

**Languages Supported:**
- Nepali: `ne-NP`
- English: `en-US`

#### Configuration
```typescript
const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
  AZURE_SPEECH_KEY,
  AZURE_SPEECH_REGION
);
speechConfig.speechRecognitionLanguage = "ne-NP";
```

## Implementation Details

### API Service (`src/lib/api.ts`)
Handles all HTTP communications with the bot API.

**Features:**
- Axios-based HTTP client
- 30-second timeout
- Comprehensive error handling
- TypeScript type safety

### Speech Service (`src/lib/speech.ts`)
Manages all speech-related functionality.

**Features:**
- Text-to-Speech synthesis
- Speech-to-Text recognition
- Singleton pattern for resource management
- Automatic cleanup
- Language-specific configuration

### Key Functions

#### Send Message
```typescript
import { sendMessageToBot } from "@/lib/api";

const answer = await sendMessageToBot("नगरपालिकाको फोन नम्बर");
```

#### Speak Text
```typescript
import { speechService } from "@/lib/speech";

await speechService.speakText("नमस्ते", "ne");
```

#### Recognize Speech
```typescript
import { speechService } from "@/lib/speech";

const text = await speechService.recognizeSpeech("ne");
```

## Error Handling

### API Errors
- Network errors (no connection)
- Server errors (5xx)
- Client errors (4xx)
- Timeout errors

### Speech Errors
- Microphone access denied
- No speech recognized
- Synthesis failed
- Recognition failed

All errors are gracefully handled with user-friendly toast notifications in both English and Nepali.

## Security Considerations

1. **Environment Variables**: All sensitive keys are stored in `.env.local`
2. **HTTPS**: All API calls use secure HTTPS protocol
3. **Client-side Keys**: Azure Speech keys are exposed client-side (acceptable for speech services)
4. **No Sensitive Data**: User conversations are not stored server-side

## Rate Limiting & Quotas

### Azure Speech Services
- Free Tier: 5 audio hours/month for STT
- Free Tier: 0.5 million characters/month for TTS
- Monitor usage in Azure Portal

### Bot API
- Check with Amigaa for rate limits
- Implement retry logic if needed

## Testing

### Local Testing
```bash
# Run development server
pnpm dev

# Test voice input (requires microphone)
# Test text-to-speech (requires speakers/headphones)
```

### Production Testing
Ensure all environment variables are set correctly in production environment.

## Troubleshooting

### "Microphone access denied"
- Check browser permissions
- Ensure HTTPS (required for microphone access)
- Check system microphone settings

### "API error: 500"
- Check API endpoint availability
- Verify network connection
- Check API logs for server-side issues

### "Speech synthesis failed"
- Verify Azure Speech key and region
- Check Azure service status
- Ensure text is not empty

## Resources

- [Azure Speech SDK Documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
