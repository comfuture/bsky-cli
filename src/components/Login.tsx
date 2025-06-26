import React, { useState } from 'react'
import { Box, Text, useApp, useInput } from 'ink'
import TextInput from 'ink-text-input'
import Spinner from 'ink-spinner'
import chalk from 'chalk'

interface LoginProps {
  onLogin: (identifier: string, password: string) => Promise<void>
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { exit } = useApp()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'identifier' | 'password'>('identifier')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleIdentifierSubmit = () => {
    if (identifier.trim()) {
      setStep('password')
    }
  }

  const handlePasswordSubmit = async () => {
    if (password.trim()) {
      setIsLoading(true)
      setError(null)
      try {
        await onLogin(identifier, password)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed')
        setIsLoading(false)
      }
    }
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>
        {chalk.blueBright('🦋 Welcome to Bluesky Terminal')}
      </Text>
      <Text> </Text>
      
      {isLoading ? (
        <Box>
          <Text color="green">
            <Spinner type="dots" />
          </Text>
          <Text> Logging in...</Text>
        </Box>
      ) : (
        <>
          <Box>
            <Text>Handle: </Text>
            {step === 'identifier' ? (
              <TextInput
                value={identifier}
                onChange={setIdentifier}
                onSubmit={handleIdentifierSubmit}
                placeholder="alice.bsky.social"
              />
            ) : (
              <Text color="green">{identifier}</Text>
            )}
          </Box>

          {step === 'password' && (
            <Box>
              <Text>Password: </Text>
              <TextInput
                value={password}
                onChange={setPassword}
                onSubmit={handlePasswordSubmit}
                mask="*"
                placeholder="Enter your app password"
              />
            </Box>
          )}

          {error && (
            <Box marginTop={1}>
              <Text color="red">Error: {error}</Text>
            </Box>
          )}

          <Box marginTop={1}>
            <Text dimColor>
              {step === 'identifier' 
                ? 'Enter your Bluesky handle and press Enter'
                : 'Enter your app password and press Enter'}
            </Text>
          </Box>

          <Box marginTop={1}>
            <Text dimColor>Press Ctrl+C to exit</Text>
          </Box>
        </>
      )}
    </Box>
  )
}