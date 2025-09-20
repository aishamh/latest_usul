# Overview

Usul is a mobile AI chat application built with React Native and Expo. The app provides a conversational interface for users to interact with AI through chat conversations. It features user authentication, persistent conversation history, and integration with OpenAI's GPT-4 model for intelligent responses. The application supports multiple platforms (iOS, Android, Web) and includes features like conversation management, message persistence, and markdown rendering for rich text display.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Updates

## September 20, 2025
- **Usul.ai Aesthetic Implementation**: Updated login interface to match usul.ai's sophisticated dark theme color palette and scholarly design aesthetic
- **Enhanced Authentication UI**: Applied professional Islamic research platform branding with proper typography and visual hierarchy  
- **Color Palette Standardization**: Implemented usul.ai-inspired colors throughout the application for consistency
- **Design System**: Established cohesive design language matching the academic and professional feel of usul.ai
- **EXCLUSIVE usul.ai Color Compliance**: Successfully replaced ALL hardcoded colors with EXCLUSIVELY colors from actual usul.ai website - no approximations or other colors remain anywhere in codebase

# System Architecture

## Frontend Architecture
- **Framework**: React Native with Expo SDK v53 for cross-platform mobile development
- **Navigation**: Expo Router with file-based routing system for screen navigation
- **UI Components**: Custom components with a dark theme design system using a consistent color palette
- **State Management**: Zustand for global state management with two main stores:
  - Authentication store for user session management
  - Conversation store for chat history and message management
- **Animations**: Moti and React Native Reanimated for smooth UI transitions
- **UI Enhancements**: Bottom sheets (@gorhom/bottom-sheet), blur effects (expo-blur), and gesture handling

## Authentication System
- **Multi-provider Support**: Designed to support Apple, Google, and email authentication
- **Current Implementation**: Demo mode with placeholder authentication flows
- **Session Persistence**: Uses AsyncStorage for user session storage
- **Security**: Expo SecureStore integration prepared for sensitive data storage

## Chat System Architecture
- **Message Structure**: Typed message system supporting text, code, and image message types
- **Conversation Management**: File-based routing with dynamic conversation IDs
- **Message Rendering**: React Native Markdown Display for rich text formatting
- **Code Highlighting**: React Native Syntax Highlighter for code block rendering
- **Real-time Updates**: Automatic scroll-to-bottom for new messages

## Data Persistence
- **Local Storage**: AsyncStorage for conversation history and user preferences
- **Message Threading**: Conversation-based message organization with timestamps
- **State Synchronization**: Automatic persistence of conversation updates

## External Service Integration
- **AI Model**: OpenAI GPT-4 integration with streaming capabilities
- **Error Handling**: Comprehensive error management for API failures
- **Request Management**: Abort controller support for request cancellation

# External Dependencies

## Core Mobile Framework
- **Expo SDK**: Complete development platform for React Native apps
- **React Native**: Cross-platform mobile app development framework

## UI and Animation Libraries
- **@gorhom/bottom-sheet**: Modal bottom sheet components
- **moti**: Declarative animations for React Native
- **react-native-reanimated**: High-performance animations
- **react-native-gesture-handler**: Advanced gesture recognition

## State Management and Storage
- **zustand**: Lightweight state management solution
- **@react-native-async-storage/async-storage**: Persistent local storage
- **expo-secure-store**: Encrypted storage for sensitive data

## AI and API Integration
- **openai**: Official OpenAI API client for GPT-4 integration
- **Environment Variables**: OpenAI API key configuration through environment variables

## Authentication Services
- **expo-apple-authentication**: Apple Sign-In integration
- **expo-auth-session**: OAuth authentication flows
- **openid-client**: OpenID Connect client implementation
- **expo-web-browser**: In-app browser for OAuth flows

## Content and Media
- **react-native-markdown-display**: Markdown rendering for chat messages
- **react-native-syntax-highlighter**: Code syntax highlighting
- **expo-clipboard**: Clipboard access for copy functionality
- **@shopify/flash-list**: Performance-optimized list component

## Utility Libraries
- **expo-haptics**: Tactile feedback
- **expo-crypto**: Cryptographic functions
- **memoizee**: Function memoization for performance optimization
- **ajv**: JSON schema validation