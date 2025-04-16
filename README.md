# Samsung Call Recorder App

A specialized Samsung-focused Android application for recording, organizing, and managing phone calls, with automatic organization by contact name or phone number.

## Features

- **Automatic Call Recording**: Built-in functionality to record incoming and outgoing calls
- **Smart Organization**: Recordings automatically sorted into folders by contact name
- **Fallback Organization**: Uses phone number when contact name is unavailable
- **Auto-Update Folders**: Folder names automatically sync with contact changes
- **Recent Recordings**: Quick access to your 3 most recent recordings
- **Timestamps**: Each recording displays date, time, and duration
- **Dark Theme**: Elegant dark green/black UI specifically designed for Samsung devices

## Project Info

**URL**: https://lovable.dev/projects/e71949e8-32f7-43dc-9ec5-7478e7c78406

## Running the Android App

To run this app on your Samsung device:

1. Clone this repository to your local machine
2. Install dependencies with `npm install`
3. Build the web assets: `npm run build`
4. Add Android platform: `npx cap add android`
5. Sync the web assets: `npx cap sync`
6. Open in Android Studio: `npx cap open android`
7. Run on a connected Samsung device or emulator

**Note:** Call recording functionality requires proper permissions and may be subject to legal restrictions in some jurisdictions. Always inform call participants about recording and obtain consent when required by law.

## Development

This project is built with:

- Vite
- TypeScript
- React
- Capacitor (for Android)
- shadcn-ui components
- Tailwind CSS

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Sync with Android
npx cap sync
```

## Samsung Device Compatibility

This app is specifically designed for Samsung devices and may use Samsung-specific APIs for call recording functionality. The app has been optimized for:

- Samsung Galaxy S series
- Samsung Galaxy Note series
- Samsung Galaxy A series
- Other Samsung devices running Android 10+

## UI Theme

The app features a custom dark theme with green accents, designed specifically for Samsung's AMOLED displays to maximize battery efficiency and visual comfort.
