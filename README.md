# Bluesky Terminal Client

A fancy terminal client for Bluesky built with TypeScript and Ink (React for CLI).

## Features

- 🚀 Interactive timeline browsing with smooth scrolling
- ✍️ Compose and post updates
- ❤️ Like and interact with posts  
- ⌨️ Advanced keyboard navigation (vim-style + page navigation)
- 📜 Scrollable timeline that adapts to terminal size
- 🎨 Beautiful terminal UI with colors
- 🔐 Secure credential storage (auto-login on next run)
- 🌐 Cross-platform support (Windows, macOS, Linux)

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
- `↑/↓` or `j/k` - Navigate posts one by one
- `PageUp/PageDown` - Navigate by page
- `g` - Jump to top (first post)
- `G` - Jump to bottom (last post)
- `l` - Like/unlike selected post
- `c` - Compose new post
- `p` - View profile (coming soon)
- `n` - View notifications (coming soon)
- `r` - Refresh timeline
- `L` - Logout (clears saved credentials)
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

## Credential Storage

The client securely saves your authentication tokens after the first successful login:

- **Windows**: `%LOCALAPPDATA%\bsky-cli\credentials.json`
- **macOS**: `~/Library/Application Support/bsky-cli/credentials.json`
- **Linux**: `~/.config/bsky-cli/credentials.json`

Credentials are stored with restricted permissions (owner read/write only) and will be automatically used on subsequent launches. Use the `L` key to logout and clear saved credentials.

## Future Enhancements

- Thread viewing and replies
- User profiles and search
- Notifications with filtering  
- Custom feeds support
- Real-time updates via WebSocket
- Media preview (ASCII art)
- Configuration preferences