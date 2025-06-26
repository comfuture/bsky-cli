import React, { useState } from 'react'
import { Box, Text, useInput, useApp } from 'ink'
import { BlueskyService } from '../services/bluesky.js'
import { AuthService } from '../services/auth.js'
import { Login } from './Login.js'
import { Timeline } from './Timeline.js'
import { PostComposer } from './PostComposer.js'

export const App: React.FC = () => {
  const { exit } = useApp()
  const [blueskyService] = useState(() => new BlueskyService())
  const [authService] = useState(() => new AuthService(blueskyService))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState<'timeline' | 'compose' | 'profile' | 'notifications'>('timeline')

  useInput((input) => {
    if (input === 'q' && currentView !== 'compose') {
      exit()
    }
  }, { isActive: isAuthenticated })

  const handleLogin = async (identifier: string, password: string) => {
    const success = await authService.login(identifier, password)
    if (success) {
      setIsAuthenticated(true)
    } else {
      throw new Error('Invalid credentials')
    }
  }

  const handleNavigate = (view: string) => {
    switch (view) {
      case 'compose':
        setCurrentView('compose')
        break
      case 'profile':
        setCurrentView('profile')
        break
      case 'notifications':
        setCurrentView('notifications')
        break
      default:
        setCurrentView('timeline')
    }
  }

  const handlePostComplete = () => {
    setCurrentView('timeline')
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Box flexDirection="column" height="100%">
      {currentView === 'timeline' && (
        <Timeline blueskyService={blueskyService} onNavigate={handleNavigate} />
      )}
      
      {currentView === 'compose' && (
        <Box flexDirection="column" height="100%">
          <Timeline blueskyService={blueskyService} onNavigate={handleNavigate} />
          <Box position="absolute" marginTop={5} marginLeft={10} width="80%">
            <PostComposer 
              blueskyService={blueskyService}
              onClose={() => setCurrentView('timeline')}
              onPost={handlePostComplete}
            />
          </Box>
        </Box>
      )}

      {currentView === 'profile' && (
        <Box padding={1}>
          <Text>Profile view coming soon...</Text>
          <Text dimColor>Press any key to go back</Text>
        </Box>
      )}

      {currentView === 'notifications' && (
        <Box padding={1}>
          <Text>Notifications view coming soon...</Text>
          <Text dimColor>Press any key to go back</Text>
        </Box>
      )}
    </Box>
  )
}