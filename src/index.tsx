#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import { App } from './components/App.js'

const app = render(<App />)

// Handle graceful shutdown
process.on('SIGINT', () => {
  app.unmount()
  process.exit(0)
})

process.on('SIGTERM', () => {
  app.unmount()
  process.exit(0)
})