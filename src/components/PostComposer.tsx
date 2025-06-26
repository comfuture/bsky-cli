import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import chalk from 'chalk'
import { BlueskyService } from '../services/bluesky.js'

interface PostComposerProps {
  blueskyService: BlueskyService
  onClose: () => void
  onPost: () => void
}

export const PostComposer: React.FC<PostComposerProps> = ({ 
  blueskyService, 
  onClose, 
  onPost 
}) => {
  const [text, setText] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const characterCount = text.length
  const maxCharacters = 300
  const remaining = maxCharacters - characterCount

  useInput((input, key) => {
    if (key.escape) {
      onClose()
    } else if (key.ctrl && input === 'd') {
      handlePost()
    }
  })

  const handlePost = async () => {
    if (text.trim() && characterCount <= maxCharacters) {
      setIsPosting(true)
      setError(null)
      try {
        await blueskyService.createPost(text)
        setText('')
        onPost()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to post')
        setIsPosting(false)
      }
    }
  }

  const handleSubmit = () => {
    handlePost()
  }

  return (
    <Box flexDirection="column" height="100%">
      <Box flexDirection="column" borderStyle="double" borderColor="blue" padding={1} marginTop={2}>
        <Box justifyContent="space-between" marginBottom={1}>
          <Text bold>{chalk.blueBright('📝 Compose Post')}</Text>
          <Text color={remaining < 0 ? 'red' : remaining < 50 ? 'yellow' : 'green'}>
            {remaining} characters
          </Text>
        </Box>

        <Box flexDirection="column" minHeight={3}>
          <TextInput
            value={text}
            onChange={setText}
            onSubmit={handleSubmit}
            placeholder="What's happening?"
            showCursor={!isPosting}
            focus={true}
          />
        </Box>

        {error && (
          <Box marginTop={1}>
            <Text color="red">Error: {error}</Text>
          </Box>
        )}

        <Box marginTop={1} gap={2}>
          <Text dimColor>
            {isPosting ? 'Posting...' : '[Ctrl+D] Post  [Enter] Send'}
          </Text>
          <Text dimColor>[Esc] Cancel</Text>
        </Box>
      </Box>
    </Box>
  )
}