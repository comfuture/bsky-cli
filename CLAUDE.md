# Bluesky Terminal Client - Development Guide

## Project Overview

This is a terminal-based client for Bluesky (AT Protocol) built with TypeScript and Ink (React for CLI). The application provides a rich, interactive terminal interface for browsing and posting to Bluesky.

## Technology Stack

- **Framework**: Ink v6 (React for CLI)
- **Language**: TypeScript
- **Bluesky SDK**: @atproto/api
- **UI Components**: 
  - ink-text-input (text inputs)
  - ink-spinner (loading indicators)
  - chalk (text styling)
- **Date handling**: date-fns
- **Environment**: Node.js with ESM modules

## Architecture

### Component Structure

```
src/
├── components/
│   ├── App.tsx          # Main app container, handles view routing
│   ├── Login.tsx        # Login screen with credential input
│   ├── Timeline.tsx     # Main timeline view with scrolling
│   ├── PostItem.tsx     # Individual post display (memoized)
│   └── PostComposer.tsx # Post creation interface
├── services/
│   ├── bluesky.ts       # Bluesky API wrapper
│   ├── auth.ts          # Authentication management
│   └── credentials.ts   # Secure credential storage
├── hooks/
│   └── useStableInput.ts # Custom hook for stable input handling
├── utils/
│   └── format.ts        # Text formatting utilities
└── index.tsx            # Entry point with TTY checks
```

### Key Design Decisions

1. **State Preservation**: Timeline component stays mounted but hidden when switching views to preserve scroll position and selection state.

2. **Virtual Scrolling**: Only renders visible posts based on terminal height to handle large timelines efficiently.

3. **Input Handling**: Consolidated input handling in Timeline component to avoid conflicts. Custom `useStableInput` hook prevents re-render issues.

4. **Credential Storage**: Platform-specific secure storage:
   - Windows: `%LOCALAPPDATA%\bsky-cli\`
   - macOS: `~/Library/Application Support/bsky-cli/`
   - Linux: `~/.config/bsky-cli/`

## Known Issues & Solutions

### 1. Screen Flickering
**Problem**: Multiple `useInput` hooks or frequent re-renders cause flickering.
**Solution**: 
- Use `React.memo` for PostItem components
- Consolidate input handling to one component
- Memoize expensive calculations (timeAgo)

### 2. Terminal Height Overflow
**Problem**: Content exceeds terminal height causing scrollbars.
**Solution**:
- Explicitly set container heights based on `process.stdout.rows`
- Reserve 8 rows for UI chrome (header + footer)
- Use virtual scrolling to render only visible posts

### 3. Raw Mode Errors
**Problem**: "Raw mode is not supported" in some environments.
**Solution**:
- Check for TTY environment on startup
- Conditionally use input hooks based on TTY support
- Provide clear error message for non-TTY environments

## Development Commands

```bash
# Install dependencies
npm install

# Development (no auto-restart)
npm run dev

# Development with file watching
npm run watch

# Build TypeScript
npm run build

# Run built version
npm start

# Type checking
npm run typecheck
```

## Testing

Run the app in a proper terminal (not IDE integrated terminal):
- macOS: Terminal.app or iTerm2
- Windows: Windows Terminal
- Linux: GNOME Terminal, Konsole, etc.

## API Integration

### Authentication Flow
1. User provides handle and app password
2. Create session via `com.atproto.server.createSession`
3. Store session tokens securely
4. Resume session on next launch

### Key API Endpoints Used
- `app.bsky.feed.getTimeline` - Home timeline
- `app.bsky.feed.post` - Create posts
- `app.bsky.feed.like` - Like posts
- `app.bsky.notification.listNotifications` - Notifications

## Future Enhancements

### High Priority
1. **Thread View**: Display full conversation threads
2. **Reply Functionality**: Reply to posts with context
3. **Profile View**: Display user profiles and their posts
4. **Notifications**: Full notification support with filtering

### Medium Priority
1. **Image Support**: ASCII art preview for images
2. **Custom Feeds**: Support for algorithm feeds
3. **Search**: Search posts and users
4. **Lists**: Create and manage user lists

### Nice to Have
1. **Real-time Updates**: WebSocket for live timeline
2. **Multiple Accounts**: Switch between accounts
3. **Drafts**: Save post drafts locally
4. **Themes**: Customizable color schemes

## Code Style Guidelines

1. **No Comments**: Avoid adding comments unless absolutely necessary
2. **TypeScript**: Use strict typing, avoid `any`
3. **React Patterns**: Use hooks, functional components only
4. **Error Handling**: Always handle async errors gracefully
5. **Performance**: Memoize expensive operations and components

## Debugging Tips

1. **Check Terminal Size**: `echo $LINES $COLUMNS`
2. **Verify TTY**: `test -t 0 && echo "TTY" || echo "Not TTY"`
3. **Debug Renders**: Add `console.log` in component bodies
4. **Monitor State**: Use React DevTools (if possible) or add debug output

## Security Considerations

1. **Credentials**: Never log or expose passwords/tokens
2. **File Permissions**: Credential files use 0600 permissions
3. **Input Validation**: Sanitize all user inputs
4. **API Keys**: Use environment variables for sensitive data

## Troubleshooting

### "Raw mode not supported"
- Run in a real terminal, not IDE terminal
- Check if stdin is a TTY: `node -e "console.log(process.stdin.isTTY)"`

### Posts not scrolling
- Check terminal height calculation
- Verify scroll offset updates
- Ensure proper height constraints on containers

### Login fails
- Verify app password (not account password)
- Check network connectivity
- Ensure handle format is correct

## Contributing

When adding new features:
1. Maintain the existing component structure
2. Follow the established patterns for state management
3. Ensure TTY compatibility
4. Test in multiple terminal emulators
5. Update this documentation

## Performance Optimization

1. **Virtual Scrolling**: Only render visible posts
2. **Memoization**: Use React.memo for list items
3. **Batch Updates**: Update multiple posts at once
4. **Lazy Loading**: Load more posts as needed
5. **Debouncing**: Debounce rapid keyboard inputs

Remember: This is a terminal app - keep it fast, responsive, and keyboard-friendly!