import React from 'react'
import { Box, Text } from 'ink'
import chalk from 'chalk'
import { formatDistanceToNow } from 'date-fns'
import { TimelinePost } from '../services/bluesky.js'

interface PostItemProps {
  post: TimelinePost
  isSelected: boolean
}

export const PostItem: React.FC<PostItemProps> = ({ post, isSelected }) => {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
  
  const formatText = (text: string): string => {
    // Simple formatting for mentions and links
    return text
      .replace(/@[\w.-]+/g, (match) => chalk.cyan(match))
      .replace(/https?:\/\/[^\s]+/g, (match) => chalk.blue.underline(match))
  }

  const borderColor = isSelected ? 'blue' : 'gray'

  return (
    <Box
      borderStyle="single"
      borderColor={borderColor}
      paddingX={1}
      marginY={0}
      flexDirection="column"
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

      <Box marginTop={0}>
        <Text wrap="wrap">{formatText(post.text)}</Text>
      </Box>

      <Box marginTop={0} gap={2}>
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
  )
}