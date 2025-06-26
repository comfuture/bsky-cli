import React, { useMemo } from 'react'
import { Box, Text } from 'ink'
import chalk from 'chalk'
import { formatDistanceToNow } from 'date-fns'
import { TimelinePost } from '../services/bluesky.js'

interface PostItemProps {
  post: TimelinePost
  isSelected: boolean
}

export const PostItem: React.FC<PostItemProps> = React.memo(({ post, isSelected }) => {
  const timeAgo = useMemo(() => 
    formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }),
    [post.createdAt]
  )
  
  const formatText = (text: string): string => {
    // Simple formatting for mentions and links
    return text
      .replace(/@[\w.-]+/g, (match) => chalk.cyan(match))
      .replace(/https?:\/\/[^\s]+/g, (match) => chalk.blue.underline(match))
  }

  const borderColor = isSelected ? 'blue' : 'gray'

  return (
    <Box gap={1}>
      <Box width={2}>
        <Text color="blue" bold>{isSelected ? '▶' : '  '}</Text>
      </Box>
      <Box
        borderStyle="single"
        borderColor={borderColor}
        paddingLeft={1}
        paddingRight={1}
        paddingTop={0}
        paddingBottom={0}
        marginBottom={1}
        flexDirection="column"
        flexGrow={1}
      >
      <Box justifyContent="space-between">
        <Text>
          <Text bold color="green">@{post.author.handle}</Text>
          {post.author.displayName && (
            <Text dimColor> · {post.author.displayName}</Text>
          )}
        </Text>
        <Text dimColor>{timeAgo}</Text>
      </Box>

      <Box>
        <Text wrap="wrap">{formatText(post.text)}</Text>
      </Box>

      <Box gap={2}>
        <Text dimColor>
          {post.viewer?.like ? chalk.red('♥') : '♥'} {post.likeCount}
        </Text>
        <Text dimColor>
          {post.viewer?.repost ? chalk.green('🔁') : '🔁'} {post.repostCount}
        </Text>
        <Text dimColor>
          💬 {post.replyCount}
        </Text>
      </Box>
      </Box>
    </Box>
  )
})