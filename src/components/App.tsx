import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import Spinner from 'ink-spinner'
import { BlueskyService } from '../services/bluesky.js'
import { AuthService } from '../services/auth.js'
import { Login } from './Login.js'
import { Timeline } from './Timeline.js'
import { PostComposer } from './PostComposer.js'

export const App: React.FC = () => {
  const [blueskyService] = useState(() => new BlueskyService())
  const [authService] = useState(() => new AuthService(blueskyService))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [currentView, setCurrentView] = useState<'timeline' | 'compose' | 'profile' | 'notifications'>('timeline')

  useEffect(() => {
    checkSavedCredentials()
  }, [])

  const checkSavedCredentials = async () => {
    try {
      const hasSaved = await authService.hasSavedCredentials()
      if (hasSaved) {
        const success = await authService.loginWithSavedCredentials()
        if (success) {
          setIsAuthenticated(true)
        }
      }
    } catch (error) {
      // Ignore errors and show login screen
    } finally {
      setIsCheckingAuth(false)
    }
  }

  // Remove global input handler - let Timeline handle all inputs when active

  const handleLogin = async (identifier: string, password: string) => {
    const success = await authService.login(identifier, password)
    if (success) {
      setIsAuthenticated(true)
    } else {
      throw new Error('Invalid credentials')
    }
  }

  const handleLogout = async () => {
    await authService.logout()
    setIsAuthenticated(false)
    setCurrentView('timeline')
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

  if (isCheckingAuth) {
    return (
      <Box padding={1}>
        <Text color="green">
          <Spinner type="dots" />
        </Text>
        <Text> Checking saved credentials...</Text>
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Box flexDirection="column" height="100%">
      <Box display={currentView === 'timeline' ? 'flex' : 'none'} height="100%">
        <Timeline 
          blueskyService={blueskyService} 
          onNavigate={handleNavigate} 
          isActive={currentView === 'timeline'}
          onLogout={handleLogout}
        />
      </Box>
      
      {currentView === 'compose' && (
        <PostComposer 
          blueskyService={blueskyService}
          onClose={() => setCurrentView('timeline')}
          onPost={handlePostComplete}
        />
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