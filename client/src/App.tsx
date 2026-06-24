import { useEffect, useState } from "react"
import socket from "./socket"
import Home from "./components/Home"
import Join from "./components/Join"
import Lobby from "./components/Lobby"

function App() {
    const [screen, setScreen] = useState<'home' | 'join' | 'lobby'>('home')
    const [playerName, setPlayerName] = useState('')
    const [roomCode, setRoomCode] = useState('')
    const [players, setPlayers] = useState([])

    useEffect(() => {
        socket.on('room_created', (data) => {
            setRoomCode(data.roomCode)
            setScreen('lobby')
        })

        socket.on('player_list_updated', (players) => {
            setPlayers(players)
        })

        return () => {
            socket.off('room_created')
            socket.off('player_list_updated')
        }
    }, [])

    if (screen === 'home') return (
        <Home playerName={playerName} setPlayerName={setPlayerName} setScreen={setScreen} />
    )
    if (screen === 'join') return (
        <Join playerName={playerName} setScreen={setScreen}></Join>
    )
    return (<Lobby players={players} roomCode={roomCode}></Lobby>)
}

export default App