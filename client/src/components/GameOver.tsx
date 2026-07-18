type FinalLeaderboardEntry = {
    name: string
    score: number
    rank: number
}

type GameOverProps = {
    finalLeaderboard: FinalLeaderboardEntry[]
    playerName: string
    roomCode: string
}

export default function GameOver({ finalLeaderboard, playerName, roomCode }: GameOverProps) {
    
    const firstPlace = finalLeaderboard.find(p => p.rank === 1);
    const secondPlace = finalLeaderboard.find(p => p.rank === 2);
    const thirdPlace = finalLeaderboard.find(p => p.rank === 3);
    const runnerUps = finalLeaderboard.filter(p => p.rank > 3);

    return (
        <main className="min-h-screen w-full flex flex-col bg-[#0f172a] relative overflow-hidden">
            
            {/* Header */}
            <div className="lobby-header">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <p className="logo-title text-2xl tracking-wider">RECALL</p>
                        <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-0.5">Game Over</p>
                    </div>

                    <button className="play-again-btn" onClick={() => window.location.reload()}>
                        🔄 Play Again
                    </button>
                </div>
            </div>

            {/* Title Section*/}
            <div className="text-center game-over-title-section px-4">
                <h1 className="text-white text-4xl md:text-5xl font-black flex items-center justify-center gap-3 tracking-wide">
                    🏆 Final Results
                </h1>
                <p className="game-over-subtitle">
                    Study Together. Compete Together.
                </p>
            </div>

            {/* Podium */}
            <div className="podium-container px-4">
                
                {/* 2nd Place */}
                {secondPlace && (
                    <div className="podium-column second-place">
                        <div className="podium-avatar bg-slate-400">
                            {secondPlace.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-white font-black text-base truncate max-w-full">{secondPlace.name}</p>
                        <p className="text-slate-400 text-xs font-bold mb-3">{secondPlace.score} pts</p>
                        <div className="pedestal">2</div>
                    </div>
                )}

                {/* 1st Place */}
                {firstPlace && (
                    <div className="podium-column first-place">
                        <span className="text-2xl mb-1">👑</span>
                        <div className="podium-avatar bg-yellow-400 style={{ boxShadow: '0 0 20px rgba(234, 179, 8, 0.6)' }}">
                            {firstPlace.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-white font-black text-lg truncate max-w-full">{firstPlace.name}</p>
                        <p className="text-yellow-400 text-sm font-bold mb-3">{firstPlace.score} pts</p>
                        <div className="pedestal">1</div>
                    </div>
                )}

                {/* 3rd Place */}
                {thirdPlace && (
                    <div className="podium-column third-place">
                        <div className="podium-avatar bg-amber-700">
                            {thirdPlace.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-white font-black text-base truncate max-w-full">{thirdPlace.name}</p>
                        <p className="text-amber-600 text-xs font-bold mb-3">{thirdPlace.score} pts</p>
                        <div className="pedestal">3</div>
                    </div>
                )}
            </div>

            {/* Runner Ups */}
            <div className="runner-ups-list pb-8">
                {runnerUps.map((player) => (
                    <div key={player.name} className="leaderboard-row">
                        <div className="player-info-container">
                            <span className="row-rank">{player.rank}</span>
                            <div className="player-avatar font-black bg-purple-700">
                                {player.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-white font-black text-lg ml-2">{player.name}</p>
                        </div>
                        <p className="text-slate-300 font-extrabold text-base">
                            {player.score} pts
                        </p>
                    </div>
                ))}
            </div>

        </main>
    )
}