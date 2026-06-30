import { useEffect, useState } from "react"
import socket from "./socket"
import Home from "./components/Home"
import Join from "./components/Join"
import Lobby from "./components/Lobby"
import Setup from "./components/Setup"

type Player = {
    id: string
    name: string
    isHost: boolean
}

function App() {
    const [screen, setScreen] = useState<'home' | 'join' | 'lobby' | 'setup' | 'question_setup'>('home')
    const [playerName, setPlayerName] = useState('')
    const [roomCode, setRoomCode] = useState('')
    const [players, setPlayers] = useState<Player[]>([])
    const [isHost, setIsHost] = useState(false)

    useEffect(() => {
        socket.on('room_created', (data) => {
            setRoomCode(data.roomCode)
            setScreen('lobby')
            setIsHost(true)
        })

        socket.on('player_list_updated', (players) => {
            setPlayers(players)
        })

        socket.on('room_joined', (data) => {
            setRoomCode(data.roomCode)
            setScreen('lobby')
        })

        socket.on('game_setup_started', () => {
            setScreen('setup')
        })

        socket.on('setup_completed', () => {
            setScreen('question_setup')
        })

        return () => {
            socket.off('room_created')
            socket.off('player_list_updated')
            socket.off('room_joined')
            socket.off('game_setup_started')
            socket.off('setup_completed')
        }
    }, [])

    useEffect(() => {
        const saved = localStorage.getItem('recall_session')
        if (!saved) return

        const { playerName, roomCode, screen, isHost } = JSON.parse(saved)
        setPlayerName(playerName)
        setRoomCode(roomCode)
        setScreen(screen)
        setIsHost(isHost)

        if (screen !== 'home') {
            socket.on('connect', () => {
                socket.emit('rejoin_room', { playerName, roomCode, isHost })
            })
        }
    }, [])

    useEffect(() => {
        if (screen !== 'home') {
            localStorage.setItem('recall_session', JSON.stringify({
                playerName,
                roomCode,
                screen,
                isHost
            }))
        } else {
            localStorage.removeItem('recall_session')
        }
    }, [screen, playerName, roomCode, isHost])

    const handleJoinRoom = (roomCodeInput: string) => {
        socket.emit('join_room', { playerName, roomCode: roomCodeInput.toUpperCase() })
    }

    const handleStartGame = (roomCodeInput: string) => {
        socket.emit('game_setup_started', {roomCode: roomCodeInput.toUpperCase() })
    }

    if (screen === 'home') return (
        <Home playerName={playerName} setPlayerName={setPlayerName} setScreen={setScreen} />
    )
    if (screen === 'join') return (
        <Join playerName={playerName} setScreen={setScreen} onJoin={handleJoinRoom}></Join>
    )
    if (screen === 'lobby') return (
        <Lobby players={players} roomCode={roomCode} isHost={isHost} onStart={handleStartGame}></Lobby>
    )
    if (screen === 'setup') return (
        <Setup isHost={isHost} roomCode={roomCode}></Setup>
    )
    if (screen === 'question_setup') return <div>question setup</div>
    return null
}

export default App