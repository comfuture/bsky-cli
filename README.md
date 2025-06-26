# Bluesky Terminal Client

A fancy terminal client for Bluesky built with TypeScript and Ink (React for CLI).

## Features

- 🚀 Interactive timeline browsing
- ✍️ Compose and post updates
- ❤️ Like and interact with posts  
- ⌨️ Keyboard navigation
- 🎨 Beautiful terminal UI with colors

## Installation

```bash
npm install
npm run build
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
BSKY_HANDLE=your.handle.bsky.social
BSKY_PASSWORD=your-app-password
BSKY_SERVICE=https://bsky.social
```

## Keyboard Shortcuts

### Timeline View
- `↑/↓` or `j/k` - Navigate posts
- `l` - Like/unlike selected post
- `c` - Compose new post
- `p` - View profile (coming soon)
- `n` - View notifications (coming soon)
- `r` - Refresh timeline
- `q` - Quit

### Compose View
- `Ctrl+D` - Send post
- `Esc` - Cancel composition

## Architecture

- **Framework**: Ink (React for CLI)
- **Language**: TypeScript  
- **Bluesky SDK**: @atproto/api
- **UI Components**: ink-text-input, ink-spinner, ink-select-input
- **Styling**: chalk for colors
- **Date formatting**: date-fns

## Project Structure

```
src/
├── components/     # React/Ink UI components
├── services/       # Bluesky API service layer
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
└── index.tsx       # Entry point
```

## Future Enhancements

- Thread viewing and replies
- User profiles and search
- Notifications with filtering  
- Custom feeds support
- Real-time updates via WebSocket
- Media preview (ASCII art)
- Configuration preferences