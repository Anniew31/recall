import { useState } from "react";
import socket from "../socket";

type JoinProps = {
    playerName: string
    setScreen: (screen: 'home' | 'join' | 'lobby') => void
}

export default function Join({playerName, setScreen}: JoinProps) {
    const [roomCode, setRoomCode] = useState('')

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRoomCode(event.target.value);
    };

    return (
        <main>
            <input
                id="text-box"
                type="text"
                value={roomCode}
                onChange={handleChange}
                placeholder="Room Code"
            />
            <button onClick={() => socket.emit('join_room', { playerName, roomCode })}>Join Room</button>
            <button onClick={() => setScreen("home")}>Go Back</button>
        </main>
    );
}