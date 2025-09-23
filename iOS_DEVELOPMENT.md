# iOS Development Guide for Usul AI

## Running on iPhone 15 Simulator

### Prerequisites
- macOS with Xcode installed
- iOS Simulator (comes with Xcode)
- Node.js and npm

### Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev:ios
   ```

3. For direct iOS simulator launch:
   ```bash
   npm run ios:sim
   ```

### iPhone 15 Specific Configuration
The app is pre-configured for iPhone 15 development:
- **Bundle ID**: `com.usul.ai`
- **Deployment Target**: iOS 15.1+
- **Optimized for**: iPhone 15 Pro (iOS 17.0)
- **Interface**: Portrait only
- **Theme**: Light mode optimized

### Development Scripts
- `npm run ios:sim` - Launch in iOS Simulator
- `npm run ios:device` - Deploy to physical device
- `npm run dev:ios` - Start with development client
- `npm run prebuild` - Generate native iOS project
- `npm run prebuild:clean` - Clean rebuild

### Xcode Integration
The app uses Expo CLI with native iOS support:
1. Run `npx expo prebuild` to generate the iOS project
2. Open `ios/UsulApp.xcworkspace` in Xcode
3. Build and run from Xcode for advanced debugging

### Simulator Features
- **Fast Refresh**: Code changes appear instantly
- **Console Logging**: Use Chrome DevTools or Xcode console
- **Hardware Simulation**: Home button, device rotation, etc.
- **Network Debugging**: Built-in network inspector

### Troubleshooting
- **Port conflicts**: The app uses port 5000 by default
- **Metro bundler**: Restart with `npm start -- --reset-cache`
- **iOS build issues**: Run `npm run prebuild:clean`
- **Simulator not starting**: Restart Xcode and Simulator

### Mobile-First Design
The app is optimized for mobile-first development:
- Clean header with menu and options
- ChatGPT-style suggestion cards
- Smooth message bubbles
- Optimized for iPhone screen sizes
- Proper safe area handling

### API Configuration
Ensure your `.env` file contains:
```
OPENAI_API_KEY=your_api_key_here
```

The app will automatically use this for ChatGPT-level AI responses.