import chalk from 'chalk'

export const formatMention = (text: string): string => {
  return chalk.cyan(`@${text}`)
}

export const formatLink = (url: string): string => {
  return chalk.blue.underline(url)
}

export const formatHashtag = (tag: string): string => {
  return chalk.magenta(`#${tag}`)
}

export const formatRichText = (text: string): string => {
  return text
    .replace(/@([\w.-]+)/g, (_, handle) => formatMention(handle))
    .replace(/https?:\/\/[^\s]+/g, (url) => formatLink(url))
    .replace(/#(\w+)/g, (_, tag) => formatHashtag(tag))
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}