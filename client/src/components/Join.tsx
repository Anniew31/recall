import { useState } from "react";
import socket from "../socket";
import Error from "./Error"

type JoinProps = {
    playerName: string
    setScreen: (screen: 'home' | 'join' | 'lobby') => void
}

export default function Join({playerName, setScreen}: JoinProps) {
    const [roomCode, setRoomCode] = useState('')
    const [error, setError] = useState('')

    const handleJoin = () => {
        if (!roomCode.trim()) return
        socket.emit('join_room', { playerName, roomCode: roomCode.toUpperCase() })
    }

    socket.on('error', (data) => {
        setError(data.message)
    })

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center gap-10 px-4">
              {error && <Error message={error} onClose={() => setError('')} />}
            <div className="text-center pt-4">
                <h1 className="logo-title">RECALL</h1>
                <p className="logo-subtitle">Study together. Compete together.</p>
            </div>

            <div className="card my-auto">
                <div className="text-center mb-2">
                    <p className="text-white font-bold text-lg">Join a Room</p>
                    <p className="text-[--color-muted] text-xs mt-1">Enter the code from your host</p>
                </div>

                <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => {
                        setRoomCode(e.target.value.toUpperCase())
                        setError('')
                    }}
                    placeholder="XXXXX"
                    maxLength={5}
                    className="game-input text-xl tracking-[6px] font-black"
                />

                <div className="flex flex-col gap-3">
                    <button onClick={handleJoin} className="btn-secondary">
                        🚀 Join Room
                    </button>

                    <button onClick={() => setScreen("home")} className="btn-ghost">
                        ← Go Back
                    </button>
                </div>
            </div>
        </main>
    )
}