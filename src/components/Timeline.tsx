import React, { useEffect, useState } from 'react'
import { Box, Text, useInput } from 'ink'
import Spinner from 'ink-spinner'
import chalk from 'chalk'
import { BlueskyService, TimelinePost } from '../services/bluesky.js'
import { PostItem } from './PostItem.js'

interface TimelineProps {
  blueskyService: BlueskyService
  onNavigate: (view: string) => void
  isActive?: boolean
}

export const Timeline: React.FC<TimelineProps> = ({ blueskyService, onNavigate, isActive = true }) => {
  const [posts, setPosts] = useState<TimelinePost[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>()

  useEffect(() => {
    loadTimeline()
  }, [])

  const loadTimeline = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await blueskyService.getTimeline(cursor)
      setPosts(cursor ? [...posts, ...response.posts] : response.posts)
      setCursor(response.cursor)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline')
    } finally {
      setIsLoading(false)
    }
  }

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setSelectedIndex(Math.max(0, selectedIndex - 1))
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex(Math.min(posts.length - 1, selectedIndex + 1))
    } else if (input === 'c') {
      onNavigate('compose')
    } else if (input === 'p') {
      onNavigate('profile')
    } else if (input === 'n') {
      onNavigate('notifications')
    } else if (input === 'r') {
      loadTimeline()
    } else if (input === 'l' && posts[selectedIndex]) {
      handleLike(posts[selectedIndex])
    }
  }, { isActive })

  const handleLike = async (post: TimelinePost) => {
    try {
      if (post.viewer?.like) {
        await blueskyService.unlikePost(post.viewer.like)
      } else {
        await blueskyService.likePost(post.uri, post.cid)
      }
      await loadTimeline()
    } catch (err) {
      setError('Failed to like/unlike post')
    }
  }

  if (isLoading && posts.length === 0) {
    return (
      <Box padding={1}>
        <Text color="green">
          <Spinner type="dots" />
        </Text>
        <Text> Loading timeline...</Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Box padding={1}>
        <Text color="red">Error: {error}</Text>
        <Text dimColor> Press 'r' to retry</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" height="100%">
      <Box borderStyle="single" borderColor="blue" paddingX={1}>
        <Text bold>{chalk.blueBright('🦋 Bluesky Terminal')} - Timeline</Text>
      </Box>

      <Box flexDirection="column" flexGrow={1}>
        {posts.map((post, index) => (
          <PostItem
            key={post.uri}
            post={post}
            isSelected={index === selectedIndex}
          />
        ))}
      </Box>

      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>
          [↑↓/jk] Navigate  [l] Like  [c] Compose  [p] Profile  [n] Notifications  [r] Refresh  [L] Logout  [q] Quit
        </Text>
      </Box>
    </Box>
  )
}