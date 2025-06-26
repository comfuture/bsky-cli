import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { AtpSessionData } from '@atproto/api'

interface StoredCredentials {
  handle: string
  session: AtpSessionData
  savedAt: string
}

export class CredentialStorage {
  private credentialsDir: string
  private credentialsFile: string

  constructor() {
    // Get platform-specific config directory
    const homeDir = os.homedir()
    
    if (process.platform === 'win32') {
      // Windows: Use AppData/Local
      this.credentialsDir = path.join(process.env.LOCALAPPDATA || path.join(homeDir, 'AppData', 'Local'), 'bsky-cli')
    } else if (process.platform === 'darwin') {
      // macOS: Use ~/Library/Application Support
      this.credentialsDir = path.join(homeDir, 'Library', 'Application Support', 'bsky-cli')
    } else {
      // Linux and others: Use ~/.config
      this.credentialsDir = path.join(process.env.XDG_CONFIG_HOME || path.join(homeDir, '.config'), 'bsky-cli')
    }
    
    this.credentialsFile = path.join(this.credentialsDir, 'credentials.json')
  }

  async save(handle: string, session: AtpSessionData): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(this.credentialsDir, { recursive: true })
      
      const credentials: StoredCredentials = {
        handle,
        session,
        savedAt: new Date().toISOString()
      }
      
      // Save with restricted permissions (owner read/write only)
      await fs.writeFile(
        this.credentialsFile,
        JSON.stringify(credentials, null, 2),
        { mode: 0o600 }
      )
    } catch (error) {
      console.error('Failed to save credentials:', error)
      throw error
    }
  }

  async load(): Promise<StoredCredentials | null> {
    try {
      const data = await fs.readFile(this.credentialsFile, 'utf-8')
      return JSON.parse(data) as StoredCredentials
    } catch (error) {
      // File doesn't exist or is corrupted
      return null
    }
  }

  async clear(): Promise<void> {
    try {
      await fs.unlink(this.credentialsFile)
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as any).code !== 'ENOENT') {
        throw error
      }
    }
  }

  async exists(): Promise<boolean> {
    try {
      await fs.access(this.credentialsFile)
      return true
    } catch {
      return false
    }
  }
}