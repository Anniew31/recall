import { useEffect, useState } from "react"
import socket from "./socket"
import Home from "./components/Home"
import Join from "./components/Join"
import Lobby from "./components/Lobby"

type Player = {
    id: string
    name: string
    isHost: boolean
}

function App() {
    const [screen, setScreen] = useState<'home' | 'join' | 'lobby'>('home')
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

        return () => {
            socket.off('room_created')
            socket.off('player_list_updated')
            socket.off('room_joined')
        }
    }, [])

    const handleJoinRoom = (roomCodeInput: string) => {
        socket.emit('join_room', { playerName, roomCode: roomCodeInput.toUpperCase() })
    }

    if (screen === 'home') return (
        <Home playerName={playerName} setPlayerName={setPlayerName} setScreen={setScreen} />
    )
    if (screen === 'join') return (
        <Join playerName={playerName} setScreen={setScreen} onJoin={handleJoinRoom}></Join>
    )
    return (<Lobby players={players} roomCode={roomCode} isHost={isHost}></Lobby>)
}

export default App