import { BlueskyService } from './bluesky.js'
import { CredentialStorage } from './credentials.js'
import * as dotenv from 'dotenv'

dotenv.config()

export class AuthService {
  private blueskyService: BlueskyService
  private credentialStorage: CredentialStorage
  private isAuthenticated: boolean = false
  private currentHandle: string | null = null

  constructor(blueskyService: BlueskyService) {
    this.blueskyService = blueskyService
    this.credentialStorage = new CredentialStorage()
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
      this.currentHandle = handle

      // Save credentials after successful login
      if (this.blueskyService.session) {
        await this.credentialStorage.save(handle, this.blueskyService.session)
      }

      return true
    } catch (error) {
      this.isAuthenticated = false
      return false
    }
  }

  async loginWithSavedCredentials(): Promise<boolean> {
    try {
      const stored = await this.credentialStorage.load()
      if (!stored) {
        return false
      }

      // Resume session with stored credentials
      await this.blueskyService.resumeSession(stored.session)
      this.isAuthenticated = true
      this.currentHandle = stored.handle
      return true
    } catch (error) {
      // If resume fails, clear invalid credentials
      await this.credentialStorage.clear()
      return false
    }
  }

  async logout(): Promise<void> {
    await this.credentialStorage.clear()
    this.isAuthenticated = false
    this.currentHandle = null
  }

  async hasSavedCredentials(): Promise<boolean> {
    return await this.credentialStorage.exists()
  }

  get authenticated(): boolean {
    return this.isAuthenticated && this.blueskyService.session !== null
  }

  get session() {
    return this.blueskyService.session
  }

  get handle(): string | null {
    return this.currentHandle
  }
}