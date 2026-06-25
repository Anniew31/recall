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
        <main className="min-h-screen w-full flex flex-col items-center justify-between py-30 px-4">
            {/* Logo Section */}
            <div className="text-center pt-4">
                <h1 className="text-5xl font-black text-white tracking-[6px] mb-2">
                    RECALL
                </h1>
                <p className="text-[#6c5dde] text-xs font-bold tracking-[2px] uppercase">
                    Study together. Compete together.
                </p>
            </div>

            {/* Middle Card Box */}
            <div className="bg-[#1e293b] rounded-2xl p-8 flex flex-col gap-5 w-full max-w-[360px] shadow-[0_12px_40px_rgba(0,0,0,0.3)] border border-white/10 my-auto">
                <div className="w-full">
                    <input
                        type="text"
                        value={playerName}
                        onChange={handleChange}
                        placeholder="Player Name"
                        className="bg-[#f4f2f7] text-[#110a24] placeholder-[#888596] rounded-xl px-4 py-4 w-full outline-none border-2 border-transparent focus:border-[#7c3aed] transition-all duration-150 text-center text-base font-bold shadow-inner"
                    />
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={handleCreateRoom}
                        className="bg-[#4c1d95] hover:bg-[#431984] active:scale-[0.98] text-white font-extrabold py-4 rounded-xl transition-all duration-150 text-sm tracking-wide shadow-md shadow-[#4c1d95]/20"
                    >
                        ⚡ Create Room
                    </button>

                    <button
                        onClick={() => setScreen("join")}
                        className="bg-[#10b981] hover:bg-[#059669] active:scale-[0.98] text-white font-extrabold py-4 rounded-xl transition-all duration-150 text-sm tracking-wide shadow-md shadow-[#10b981]/20"
                    >
                        🔗 Join Room
                    </button>
                </div>
            </div>
        </main>
    )
}