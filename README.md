# HireMeKnow Mobile App

A React Native mobile application for connecting job seekers with employers.

## Prerequisites

- Node.js v16.x or higher
- React Native development environment
- Xcode (for iOS development)
- Android Studio (for Android development)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd HireMeKnow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. iOS specific setup:
   ```bash
   cd ios && pod install && cd ..
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```
   Then edit .env with your configuration values.

5. Start the development server:
   ```bash
   npm start
   ```

6. Run the app:
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── services/       # API and other services
├── utils/          # Utility functions
├── assets/         # Images, fonts, etc.
├��─ hooks/          # Custom React hooks
├── store/          # State management
├── types/          # TypeScript type definitions
└── config/         # App configuration
```

## Development

- Run tests: `npm test`
- Lint code: `npm run lint`
- Type check: `npm run type-check`

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
