#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import { App } from './components/App.js'

// Check if we're in a TTY environment
if (!process.stdin.isTTY) {
  console.error('This app must be run in a terminal (TTY environment)')
  process.exit(1)
}

const app = render(<App />, {
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr
})

// Handle graceful shutdown
process.on('SIGINT', () => {
  app.unmount()
  process.exit(0)
})

process.on('SIGTERM', () => {
  app.unmount()
  process.exit(0)
})