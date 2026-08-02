import { useState, useEffect } from "react"
import Error from "./Error"
import { startBackgroundMusic } from '../sounds'
import socket from '../socket'

type Player = {
    id: string
    name: string
    isHost: boolean
}

type LobbyProps = {
    players: Player[]
    roomCode: string
    isHost: boolean
    onStart: (roomCode: string) => void
    setPlayerName: (name: string) => void
}

const AVATAR_COLORS = ['#4c1d95', '#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']

export default function Lobby({players, roomCode, isHost, onStart, setPlayerName }: LobbyProps) {
    const [copied, setCopied] = useState(false)
    const [editingName, setEditingName] = useState(false)
    const [nameInput, setNameInput] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        startBackgroundMusic()
    }, [])

    const handleCopy = () => {
        navigator.clipboard.writeText(roomCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleStartGame = () => {
        if (!roomCode.trim()) return
        onStart(roomCode);
    }

    const handleChangeName = () => {
        if (!nameInput.trim()) return
        setPlayerName(nameInput)
        socket.emit('change_name', { roomCode, newName: nameInput })
    }

    return (
        <main className="min-h-screen w-full flex flex-col bg-[#0f172a]">
            {error && <Error message={error} onClose={() => setError('')} />}

            {/* Header */}
            <div className="lobby-header">
                <div>
                    <p className="logo-title text-2xl">RECALL</p>
                    <p className="logo-subtitle">Study together. Compete together.</p>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="lobby-header-label">Room Code</p>
                        <div className="flex items-center gap-3">
                            <p className="lobby-header-value">{roomCode}</p>
                            <button onClick={handleCopy} className="copy-btn">
                                {copied ? '✓ Copied!' : '⎘ Copy'}
                            </button>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="lobby-header-label">Players</p>
                        <p className="lobby-header-value">{players.length}</p>
                    </div>
                </div>
            </div>
            
            {/* Status */}
            <div className="lobby-status">
                <div className="lobby-status-dot"></div>
                <p className="lobby-status-text">Waiting for players to join...</p>
            </div>

            {/* Players */}
            <div className="player-grid-wrapper">
                <div className="player-grid">
                    {players.map((player, index) => (
                        <div
                            key={player.id}
                            className={`player-card ${player.isHost ? 'player-card-host' : ''}`}
                        >
                            <div
                                className="player-avatar"
                                style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                            >
                                {player.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="player-name">{player.name}</p>
                            {player.isHost && <div className="host-badge">HOST</div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="lobby-bottom-bar">
                {isHost && (
                    <button className="btn-start" onClick={() => handleStartGame()}>🚀 Start Game</button>
                )}
                {!isHost && (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="lobby-status-text">Waiting for host to start...</p>
                    </div>
                )}
                {!editingName ? (
                    <button onClick={() => setEditingName(true)} className="btn-icon">
                        ✏️ Edit Name
                    </button>
                ) : (
                    <div className="flex gap-2 flex-1 items-center">
                        <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="New name..."
                            className="name-edit-input"
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                if (!nameInput.trim()) return
                                handleChangeName()
                                setEditingName(false)
                                setNameInput('')
                            }}
                            className="btn-save"
                        >
                            Save
                        </button>
                        <button onClick={() => setEditingName(false)} className="btn-icon">✕</button>
                    </div>
                )}
            </div>
        </main>
    );
}