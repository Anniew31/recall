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

    const handleCreateRoom = () => {
        if (!playerName.trim()) return;
        socket.emit('create_room', { playerName });
    };

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center gap-10 px-4">
            {/* Logo Section */}
            <div className="text-center pt-4">
                <h1 className="logo-title">RECALL</h1>
                <p className="logo-subtitle">Study together. Compete together. </p>
            </div>

            {/* Middle Card Box */}
            <div className="card my-auto">
                <div className="w-full">
                    <input
                        type="text"
                        value={playerName}
                        onChange={handleChange}
                        placeholder="Player Name"
                        className="game-input"
                    />
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <button onClick={handleCreateRoom} className="btn-primary">
                        ⚡ Create Room
                    </button>

                    <button onClick={() => setScreen("join")} className="btn-primary">
                        🔗 Join Room
                    </button>
                </div>
            </div>
        </main>
    )
}