import { useInput } from 'ink'
import { useRef, useCallback } from 'react'

export const useStableInput = (
  handler: (input: string, key: any) => void,
  options?: { isActive?: boolean }
) => {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  const stableHandler = useCallback((input: string, key: any) => {
    handlerRef.current(input, key)
  }, [])

  // Check if stdin supports raw mode
  const isSupported = process.stdin.isTTY && process.stdin.setRawMode

  if (isSupported) {
    useInput(stableHandler, options)
  }
}