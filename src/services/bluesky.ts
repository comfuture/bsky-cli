import { BskyAgent, AppBskyFeedDefs, AppBskyNotificationListNotifications } from '@atproto/api'

export interface TimelinePost {
  uri: string
  cid: string
  author: {
    did: string
    handle: string
    displayName?: string
    avatar?: string
  }
  text: string
  createdAt: string
  likeCount: number
  repostCount: number
  replyCount: number
  indexedAt: string
  viewer?: {
    like?: string
    repost?: string
  }
}

export class BlueskyService {
  private agent: BskyAgent

  constructor() {
    this.agent = new BskyAgent({
      service: process.env.BSKY_SERVICE || 'https://bsky.social'
    })
  }

  async login(identifier: string, password: string): Promise<void> {
    const response = await this.agent.login({ identifier, password })
    if (!response.success) {
      throw new Error('Login failed')
    }
  }

  async getTimeline(cursor?: string): Promise<{
    posts: TimelinePost[]
    cursor?: string
  }> {
    const response = await this.agent.getTimeline({ limit: 20, cursor })
    
    const posts: TimelinePost[] = response.data.feed.map((item) => {
      const post = item.post as AppBskyFeedDefs.PostView
      return {
        uri: post.uri,
        cid: post.cid,
        author: {
          did: post.author.did,
          handle: post.author.handle,
          displayName: post.author.displayName,
          avatar: post.author.avatar
        },
        text: (post.record as any).text || '',
        createdAt: (post.record as any).createdAt || '',
        likeCount: post.likeCount || 0,
        repostCount: post.repostCount || 0,
        replyCount: post.replyCount || 0,
        indexedAt: post.indexedAt,
        viewer: {
          like: post.viewer?.like,
          repost: post.viewer?.repost
        }
      }
    })

    return {
      posts,
      cursor: response.data.cursor
    }
  }

  async createPost(text: string): Promise<void> {
    await this.agent.post({
      text,
      createdAt: new Date().toISOString()
    })
  }

  async likePost(uri: string, cid: string): Promise<void> {
    await this.agent.like(uri, cid)
  }

  async unlikePost(uri: string): Promise<void> {
    await this.agent.deleteLike(uri)
  }

  async repost(uri: string, cid: string): Promise<void> {
    await this.agent.repost(uri, cid)
  }

  async deleteRepost(uri: string): Promise<void> {
    await this.agent.deleteRepost(uri)
  }

  async getProfile(handle: string) {
    const response = await this.agent.getProfile({ actor: handle })
    return response.data
  }

  async getNotifications(cursor?: string) {
    const response = await this.agent.listNotifications({ limit: 20, cursor })
    return {
      notifications: response.data.notifications,
      cursor: response.data.cursor
    }
  }

  get session() {
    return this.agent.session
  }
}