import { useEffect, useState } from "react"
import socket from "../socket"

type LeaderboardEntry = {
    name: string
    score: number
    rank: number
    movement: number
    roundScore: number
}

type LeaderboardProps = {
    leaderboard: LeaderboardEntry[]
    playerName: string
    roundNumber: number
    totalRounds: number
    roomCode: string
    setScreen: (screen: 'home' | 'join' | 'lobby' | 'setup' | 'question_setup' | 'question_preview' | 'game' | 'results' | 'leaderboard') => void
}

export default function Leaderboard ( {leaderboard, playerName, roundNumber, totalRounds, roomCode, setScreen} : LeaderboardProps) {
    const [timeLeft, setTimeLeft] = useState(10)
    const [error, setError] = useState('')

    useEffect(() => {
        socket.on('error', (data) => {
            setError(data.message)
        })

        socket.on('timer_tick', (data) => {
            setTimeLeft(data.timeLeft)
        })

        return () => {
            socket.off('error')
            socket.off('timer_tick')
        }
    }, [])

    useEffect(() => {
        if (timeLeft <= 0) {
            setScreen('question_preview')
        }
    }, [timeLeft])


    return (
        <main className="min-h-screen w-full flex flex-col bg-[#0f172a]">

            {/* header */}
            <div className="lobby-header">
                <div>
                    <p className="logo-title text-2xl">RECALL</p>
                    <p className="lobby-status-text">Round {roundNumber} of {totalRounds} — Leaderboard</p>
                </div>
                <div className="leaderboard-countdown">
                    <p className="lobby-header-label">Next round in</p>
                    <p className="text-white text-2xl font-black">{timeLeft}s</p>
                </div>
            </div>

            {/* rankings list */}
            <div className="leaderboard-list">
                {leaderboard.slice(0, 5).map((entry) => (
                    <div key={entry.name} className={`leaderboard-entry ${entry.rank === 1 ? 'leaderboard-gold' : entry.rank === 2 ? 'leaderboard-silver' : entry.rank === 3 ? 'leaderboard-bronze' : 'leaderboard-default'}`}>
                        <p className={`leaderboard-rank ${entry.rank === 1 ? 'text-[#fbbf24] text-3xl' : entry.rank === 2 ? 'text-[#94a3b8] text-2xl' : entry.rank === 3 ? 'text-[#b45309] text-2xl' : 'text-[--color-muted] text-xl'}`}>
                            {entry.rank}
                        </p>
                        <div className="leaderboard-avatar" style={{ backgroundColor: entry.rank === 1 ? '#fbbf24' : entry.rank === 2 ? '#94a3b8' : entry.rank === 3 ? '#b45309' : '#4c1d95' }}>
                            {entry.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-bold text-sm">{entry.name} {entry.name === playerName ? '(you)' : ''}</p>
                            <p className="lobby-status-text text-xs">+{Math.round(entry.roundScore * 100)} pts this round</p>
                        </div>
                        <div className="text-right">
                            <p className={`font-black text-lg ${entry.rank === 1 ? 'text-[#fbbf24]' : entry.rank === 2 ? 'text-[#94a3b8]' : entry.rank === 3 ? 'text-[#b45309]' : 'text-white'}`}>
                                {Math.round(entry.score * 100)}
                            </p>
                            <p className={`text-xs font-bold ${entry.movement > 0 ? 'text-[#10b981]' : entry.movement < 0 ? 'text-[#ef4444]' : 'text-[--color-muted]'}`}>
                                {entry.movement > 0 ? `▲ ${entry.movement}` : entry.movement < 0 ? `▼ ${Math.abs(entry.movement)}` : '— 0'}
                            </p>
                        </div>
                    </div>
                ))}

                {/* current player if outside top 5 */}
                {leaderboard.findIndex(e => e.name === playerName) >= 5 && (() => {
                    const myEntry = leaderboard.find(e => e.name === playerName)
                    if (!myEntry) return null
                    return (
                        <>
                            <div className="leaderboard-divider">
                                <div className="flex-1 h-px bg-white/8" />
                                <p className="text-white/30 text-xs tracking-widest">YOUR POSITION</p>
                                <div className="flex-1 h-px bg-white/8" />
                            </div>
                            <div className="leaderboard-entry leaderboard-me">
                                <p className="leaderboard-rank text-[#a78bfa]">{myEntry.rank}</p>
                                <div className="leaderboard-avatar" style={{ backgroundColor: '#4c1d95' }}>
                                    {myEntry.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-sm">{myEntry.name} (you)</p>
                                    <p className="lobby-status-text text-xs">+{Math.round(myEntry.roundScore * 100)} pts this round</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#a78bfa] font-black text-lg">{Math.round(myEntry.score * 100)}</p>
                                    <p className={`text-xs font-bold ${myEntry.movement > 0 ? 'text-[#10b981]' : myEntry.movement < 0 ? 'text-[#ef4444]' : 'text-[--color-muted]'}`}>
                                        {myEntry.movement > 0 ? `▲ ${myEntry.movement}` : myEntry.movement < 0 ? `▼ ${Math.abs(myEntry.movement)}` : '— 0'}
                                    </p>
                                </div>
                            </div>
                        </>
                    )
                })()}
            </div>
        </main>
    )

}