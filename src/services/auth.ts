import { BlueskyService } from './bluesky.js'
import * as dotenv from 'dotenv'

dotenv.config()

export class AuthService {
  private blueskyService: BlueskyService
  private isAuthenticated: boolean = false

  constructor(blueskyService: BlueskyService) {
    this.blueskyService = blueskyService
  }

  async login(identifier?: string, password?: string): Promise<boolean> {
    try {
      const handle = identifier || process.env.BSKY_HANDLE
      const pass = password || process.env.BSKY_PASSWORD

      if (!handle || !pass) {
        return false
      }

      await this.blueskyService.login(handle, pass)
      this.isAuthenticated = true
      return true
    } catch (error) {
      this.isAuthenticated = false
      return false
    }
  }

  get authenticated(): boolean {
    return this.isAuthenticated && this.blueskyService.session !== null
  }

  get session() {
    return this.blueskyService.session
  }
}