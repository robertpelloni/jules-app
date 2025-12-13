'use client'

import { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { io, Socket } from 'socket.io-client'
import '@xterm/xterm/css/xterm.css'

interface IntegratedTerminalProps {
  sessionId: string
  workingDir?: string
  className?: string
}

export function IntegratedTerminal({
  sessionId,
  workingDir = '',
  className = ''
}: IntegratedTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!terminalRef.current) return

    // Initialize xterm.js
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selection: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5'
      },
      scrollback: 1000,
      allowProposedApi: true
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(terminalRef.current)
    fitAddon.fit()

    xtermRef.current = terminal
    fitAddonRef.current = fitAddon

    // Connect to terminal server
    const wsUrl = process.env.NEXT_PUBLIC_TERMINAL_WS_URL || 'ws://localhost:8080'
    const socket = io(wsUrl, {
      query: { sessionId, workingDir }
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to terminal server')
      setIsConnected(true)
      terminal.write('\r\n\x1b[32m*** Connected to terminal ***\x1b[0m\r\n\r\n')
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from terminal server')
      setIsConnected(false)
      terminal.write('\r\n\x1b[31m*** Disconnected from terminal ***\x1b[0m\r\n')
    })

    socket.on('terminal.output', (data: string) => {
      terminal.write(data)
    })

    socket.on('terminal.exit', ({ exitCode }: { exitCode: number }) => {
      terminal.write(`\r\n\x1b[33m*** Process exited with code ${exitCode} ***\x1b[0m\r\n`)
    })

    terminal.onData((data) => {
      socket.emit('terminal.input', data)
    })

    // Handle terminal resize
    const handleResize = () => {
      fitAddon.fit()
      socket.emit('terminal.resize', {
        cols: terminal.cols,
        rows: terminal.rows
      })
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      socket.disconnect()
      terminal.dispose()
    }
  }, [sessionId, workingDir])

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-2 right-2 z-10">
        <div
          className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          title={isConnected ? 'Connected' : 'Disconnected'}
        />
      </div>
      <div ref={terminalRef} className="h-full w-full p-2" />
    </div>
  )
}
