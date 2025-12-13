'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect if the terminal server is available
 * Attempts a quick WebSocket connection test
 */
export function useTerminalAvailable() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let mounted = true
    let checkTimeout: NodeJS.Timeout

    const checkTerminalServer = async () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_TERMINAL_WS_URL ||
          (typeof window !== 'undefined' ? `ws://${window.location.hostname}:8080` : 'ws://localhost:8080')

        // Dynamic import of socket.io-client
        const { io } = await import('socket.io-client')

        // Attempt quick connection test
        const testSocket = io(wsUrl, {
          timeout: 2000,
          query: { sessionId: 'health-check', workingDir: '' }
        })

        // Set timeout for connection attempt
        const timeoutId = setTimeout(() => {
          testSocket.close()
          if (mounted) {
            setIsAvailable(false)
            setIsChecking(false)
          }
        }, 2000)

        testSocket.on('connect', () => {
          clearTimeout(timeoutId)
          testSocket.close()
          if (mounted) {
            setIsAvailable(true)
            setIsChecking(false)
          }
        })

        testSocket.on('connect_error', () => {
          clearTimeout(timeoutId)
          testSocket.close()
          if (mounted) {
            setIsAvailable(false)
            setIsChecking(false)
          }
        })
      } catch (error) {
        // Server not available
        if (mounted) {
          setIsAvailable(false)
          setIsChecking(false)
        }
      }
    }

    checkTerminalServer()

    // Recheck every 30 seconds in case server starts later
    checkTimeout = setInterval(checkTerminalServer, 30000)

    return () => {
      mounted = false
      clearInterval(checkTimeout)
    }
  }, [])

  return { isAvailable, isChecking }
}
