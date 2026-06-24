import socket from "../socket";

type HomeProps = {
    playerName: string
    setPlayerName: (name: string) => void
    setScreen: (screen: 'home' | 'join' | 'lobby') => void
}

export default function Home({playerName, setPlayerName, setScreen}: HomeProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlayerName(event.target.value);
    };

    return (
        <main>
            <input
                id="text-box"
                type="text"
                value={playerName}
                onChange={handleChange}
                placeholder="Name"
            />
            <button onClick={() => socket.emit('create_room', { playerName })}>Create Room</button>
            <button onClick={() => setScreen("join")}>Join Room</button>
        </main>
    );
}
