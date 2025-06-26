import React, { useEffect, useState } from 'react'
import { Box, Text, useApp } from 'ink'
import Spinner from 'ink-spinner'
import chalk from 'chalk'
import { BlueskyService, TimelinePost } from '../services/bluesky.js'
import { PostItem } from './PostItem.js'
import { useStableInput } from '../hooks/useStableInput.js'

interface TimelineProps {
  blueskyService: BlueskyService
  onNavigate: (view: string) => void
  isActive?: boolean
  onLogout?: () => void
}

export const Timeline: React.FC<TimelineProps> = ({ blueskyService, onNavigate, isActive = true, onLogout }) => {
  const { exit } = useApp()
  const [posts, setPosts] = useState<TimelinePost[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>()
  const [scrollOffset, setScrollOffset] = useState(0)
  const [windowHeight, setWindowHeight] = useState(process.stdout.rows || 24)

  useEffect(() => {
    loadTimeline()
  }, [])

  useEffect(() => {
    // Update window height on resize
    const handleResize = () => {
      setWindowHeight(process.stdout.rows || 24)
    }
    
    process.stdout.on('resize', handleResize)
    return () => {
      process.stdout.off('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    // Calculate visible area with proper reserved space
    const reservedRows = 8 // 3 header + 3 footer + 2 padding
    const availableHeight = Math.max(1, windowHeight - reservedRows)
    const itemHeight = 6 // Each post item height
    const maxVisibleItems = Math.floor(availableHeight / itemHeight)
    
    // Adjust scroll offset to keep selected item visible
    if (selectedIndex < scrollOffset) {
      setScrollOffset(selectedIndex)
    } else if (selectedIndex >= scrollOffset + maxVisibleItems) {
      setScrollOffset(selectedIndex - maxVisibleItems + 1)
    }
  }, [selectedIndex, windowHeight])

  const loadTimeline = async (preserveSelection = false) => {
    const currentPostUri = preserveSelection && posts[selectedIndex]?.uri
    
    setIsLoading(true)
    setError(null)
    try {
      const response = await blueskyService.getTimeline()
      setPosts(response.posts)
      setCursor(response.cursor)
      
      // Try to restore selection if requested
      if (currentPostUri) {
        const newIndex = response.posts.findIndex(p => p.uri === currentPostUri)
        if (newIndex !== -1) {
          setSelectedIndex(newIndex)
        } else {
          setSelectedIndex(0)
        }
      } else if (!preserveSelection) {
        setSelectedIndex(0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMorePosts = async () => {
    if (!cursor || isLoading) return
    
    setIsLoading(true)
    try {
      const previousLength = posts.length
      const response = await blueskyService.getTimeline(cursor)
      setPosts([...posts, ...response.posts])
      setCursor(response.cursor)
      
      // Set selection to the first new post
      if (response.posts.length > 0) {
        setSelectedIndex(previousLength)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more posts')
    } finally {
      setIsLoading(false)
    }
  }

  useStableInput((input, key) => {
    if ((key.upArrow || input === 'k') && posts.length > 0) {
      setSelectedIndex(Math.max(0, selectedIndex - 1))
    } else if ((key.downArrow || input === 'j') && posts.length > 0) {
      const newIndex = selectedIndex + 1
      if (newIndex < posts.length) {
        setSelectedIndex(newIndex)
        // Auto-load more when reaching the last 3 posts
        if (newIndex >= posts.length - 3 && cursor && !isLoading) {
          loadMorePosts()
        }
      }
    } else if (key.pageUp && posts.length > 0) {
      // Page up - move up by visible items count
      const pageSize = Math.floor((windowHeight - 8) / 6)
      setSelectedIndex(Math.max(0, selectedIndex - pageSize))
    } else if (key.pageDown && posts.length > 0) {
      // Page down - move down by visible items count
      const pageSize = Math.floor((windowHeight - 8) / 6)
      const newIndex = Math.min(posts.length - 1, selectedIndex + pageSize)
      setSelectedIndex(newIndex)
      // Auto-load more if needed
      if (newIndex >= posts.length - 3 && cursor && !isLoading) {
        loadMorePosts()
      }
    } else if (input === 'g' && posts.length > 0) {
      // Go to top
      setSelectedIndex(0)
      setScrollOffset(0)
    } else if (input === 'G' && posts.length > 0) {
      // Go to bottom
      setSelectedIndex(posts.length - 1)
    } else if (input === 'c') {
      onNavigate('compose')
    } else if (input === 'p') {
      onNavigate('profile')
    } else if (input === 'n') {
      onNavigate('notifications')
    } else if (input === 'r') {
      loadTimeline(true) // Preserve selection on refresh
    } else if (input === 'l' && posts[selectedIndex]) {
      handleLike(posts[selectedIndex])
    } else if (input === 'L' && onLogout) {
      onLogout()
    } else if (input === 'q') {
      exit()
    }
  }, { isActive })

  const handleLike = async (post: TimelinePost) => {
    try {
      const postIndex = posts.findIndex(p => p.uri === post.uri)
      if (postIndex === -1) return

      // Optimistically update the UI
      const updatedPosts = [...posts]
      const updatedPost = { ...updatedPosts[postIndex] }
      
      if (post.viewer?.like) {
        await blueskyService.unlikePost(post.viewer.like)
        updatedPost.viewer = { ...updatedPost.viewer, like: undefined }
        updatedPost.likeCount = Math.max(0, updatedPost.likeCount - 1)
      } else {
        await blueskyService.likePost(post.uri, post.cid)
        updatedPost.viewer = { ...updatedPost.viewer, like: 'temp-like-uri' }
        updatedPost.likeCount = updatedPost.likeCount + 1
      }
      
      updatedPosts[postIndex] = updatedPost
      setPosts(updatedPosts)
    } catch (err) {
      setError('Failed to like/unlike post')
      // Optionally reload on error to sync state
      // await loadTimeline()
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

  // Calculate visible posts
  // Reserve space: 3 for header, 3 for footer, 2 for padding
  const reservedRows = 8
  const availableHeight = Math.max(1, windowHeight - reservedRows)
  const itemHeight = 6 // Each post takes about 6 rows (including border and spacing)
  const maxVisibleItems = Math.floor(availableHeight / itemHeight)
  const visiblePosts = posts.slice(scrollOffset, scrollOffset + maxVisibleItems)
  
  // Calculate scroll indicator
  const showScrollIndicator = posts.length > maxVisibleItems
  const scrollPercentage = posts.length > 0 
    ? Math.round((scrollOffset + maxVisibleItems / 2) / posts.length * 100)
    : 0

  return (
    <Box flexDirection="column" height={windowHeight - 1}>
      <Box borderStyle="single" borderColor="blue" paddingX={1} justifyContent="space-between" flexShrink={0}>
        <Text bold>{chalk.blueBright('🦋 Bluesky Terminal')} - Timeline</Text>
        {showScrollIndicator && (
          <Text dimColor>
            {selectedIndex + 1}/{posts.length} ({scrollPercentage}%)
          </Text>
        )}
      </Box>

      <Box flexDirection="column" flexGrow={1} overflow="hidden" height={availableHeight}>
        {visiblePosts.map((post, visibleIndex) => {
          const actualIndex = scrollOffset + visibleIndex
          return (
            <PostItem
              key={`${post.uri}-${actualIndex}`}
              post={post}
              isSelected={actualIndex === selectedIndex}
            />
          )
        })}
        {isLoading && posts.length > 0 && (
          <Box padding={1} justifyContent="center">
            <Text color="green">
              <Spinner type="dots" />
            </Text>
            <Text> Loading more posts...</Text>
          </Box>
        )}
        {posts.length === 0 && !isLoading && (
          <Box padding={1}>
            <Text dimColor>No posts to display</Text>
          </Box>
        )}
      </Box>

      <Box borderStyle="single" borderColor="gray" paddingX={1} flexShrink={0}>
        <Text dimColor wrap="truncate">
          [↑↓/jk] Nav  [PgUp/Dn] Page  [g/G] Top/End  [l] Like  [c] Compose  [r] Refresh  [L] Logout  [q] Quit
        </Text>
      </Box>
    </Box>
  )
}