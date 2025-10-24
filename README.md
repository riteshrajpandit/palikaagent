# Palika Agent 🏛️

**Your AI-powered municipal assistant for Nepal**

A modern, sleek chat interface built with Next.js 16, React 19, and shadcn/ui components. Palika Agent helps users interact with municipal services through an intuitive AI chatbot with support for both text and voice input.

## ✨ Features

- 🎨 **Modern UI**: Sleek design inspired by top AI assistants with gradient accents
- 📱 **Responsive Layout**: Full sidebar on desktop, collapsible drawer on mobile
- 🌓 **Theme Support**: Light, Dark, and System theme modes
- 🌍 **Bilingual**: English and Nepali (नेपाली) language support
- 💬 **Chat Interface**: Real-time chat with AI assistant via API
- 🎤 **Voice Input**: Speech-to-text using Azure Speech Service
- 🔊 **Text-to-Speech**: AI responses with Nepali voice (ne-NP-HemkalaNeural)
- 🎴 **Suggestion Cards**: Interactive cards for common queries
- 📚 **Chat History**: Sidebar with recent conversations
- ⚡ **Fast**: Built with Next.js 16 and Turbopack

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm (or npm/yarn)
- Azure Speech Service subscription (for voice features)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://palika.amigaa.com/api/v1/palika/bot/
NEXT_PUBLIC_AZURE_SPEECH_KEY=your_azure_speech_key
NEXT_PUBLIC_AZURE_SPEECH_REGION=southeastasia
```

### Running the Application

```bash
# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.0
- **React**: 19.2.0
- **TypeScript**: Full type safety
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York variant)
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono
- **API Client**: Axios
- **Speech SDK**: Azure Cognitive Services Speech SDK
- **Notifications**: Sonner

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles & themes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ChatInterface.tsx  # Main chat component
│   ├── ChatMessage.tsx    # Message bubble component
│   ├── ChatInput.tsx      # Input field with voice button
│   └── Header.tsx         # App header with controls
├── contexts/              # React contexts
│   ├── LanguageContext.tsx # Language switching
│   └── ThemeContext.tsx    # Theme management
└── lib/
    └── utils.ts           # Utility functions
```

## 🎨 Features in Detail

### Theme Switching
- **Light Mode**: Clean and bright interface
- **Dark Mode**: Easy on the eyes
- **System Mode**: Follows OS preferences

### Language Support
- **English**: Full English interface
- **नेपाली (Nepali)**: Complete Nepali translation

### Chat Interface
- Real-time message display with smooth animations
- User and AI message differentiation with avatars
- Timestamps for each message
- Typing indicators with animated dots
- Empty state with personalized greeting and suggestion cards
- Responsive design for all screen sizes

### Sidebar Navigation
- **Desktop**: Persistent sidebar with search and navigation
- **Mobile**: Sheet drawer accessible via hamburger menu
- Recent chat history with preview
- Quick access to Explore, Library, Files, and History
- New chat creation button

## 🔜 Coming Soon

- 📊 Analytics and usage tracking
- 🗂️ Chat history persistence
- 📤 Export chat conversations
- 📱 Progressive Web App (PWA) support
- 🔐 User authentication

## 🎯 Customization

### Adding New Languages

Edit `src/contexts/LanguageContext.tsx` to add more languages:

```typescript
const translations: Record<Language, Translations> = {
  en: { /* English translations */ },
  ne: { /* Nepali translations */ },
  // Add your language here
};
```

### Customizing Theme Colors

Edit `src/app/globals.css` to customize theme colors using CSS variables.

## 📝 Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

**Ritesh Raj Pandit**

---

Built with ❤️ for better municipal services in Nepal
