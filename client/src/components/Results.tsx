import { useEffect, useState } from "react";

type ReactProps = {
    question: { id: string, questionText: string }
    playerAnswer: string 
    correctAnswer: string
    totalScore: number
    roundScore: number
    playerName: string
    roomCode: string
    roundNumber: number
    totalRounds: number
}

export default function Results({ question, playerAnswer, correctAnswer, totalScore, roundScore, playerName, roomCode, roundNumber, totalRounds } : ReactProps) {
    const percentage = Math.round((roundScore / 10) * 100)
    const circumference = 213.6
    const strokeOffset = circumference * (1 - percentage / 100)
    const isGood = roundScore >= 7
    const [timeLeft, setTimeLeft] = useState(15)

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <main className="min-h-screen w-full flex flex-col bg-[#0f172a]">

            {/* top bar with round, player, score */}
            <div className="lobby-header">
                <div className="flex items-center justify-between w-full gap-8">
                    
                    {/* round number */}
                    <div className="text-center">
                        <p className="lobby-header-label">Round</p>
                        <p className="text-white text-2xl font-black leading-none">
                            {roundNumber} <span className="text-white/50 text-sm font-semibold">of {totalRounds}</span>
                        </p>
                    </div>

                    {/* player name and score */}
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="lobby-header-label">Player</p>
                            <p className="text-white text-lg font-black leading-none">{playerName}</p>
                        </div>
                        
                        <div className="bg-white rounded-xl px-6 py-4 text-center shadow-lg min-w-[100px]">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Score</p>
                            <p className="text-gray-900 text-3xl font-black leading-none">{totalScore * 100}</p>
                        </div>
                    </div>

                </div>
            </div>

            <div className="results-container">
                <div className="setup-card">
                    <p className="setup-label">Question</p>
                    <p className="text-white font-bold text-base">{question.questionText}</p>
                </div>

                <div className="setup-card">
                    <p className="setup-label">Your Answer</p>
                    <p className="text-[--color-muted] text-sm leading-relaxed">
                        {playerAnswer || 'No answer submitted'}
                    </p>
                </div>

                <div className="setup-card card-correct">
                    <p className="setup-label">Correct Answer</p>
                    <p className="text-[--color-muted] text-sm leading-relaxed">{correctAnswer}</p>
                </div>

                <div className="setup-card flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <p className="setup-label">Your Score This Round</p>
                        <div className="flex items-center gap-4">
                            <div className={isGood ? "score-pill score-pill-good" : "score-pill score-pill-bad"}>
                                <p className="leading-none">{roundScore.toFixed(1)} / 10</p>
                            </div>
                            <p className={isGood ? "pts-text-good" : "pts-text-bad"}>
                                +{Math.round(roundScore * 100)} pts
                            </p>
                        </div>
                    </div>

                    <div className="progress-ring-container">
                        <svg width="80" height="80" className="progress-ring-svg">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="#1e293b" strokeWidth="7" />
                            <circle
                                cx="40" cy="40" r="34"
                                fill="none"
                                stroke={isGood ? '#10b981' : '#ef4444'}
                                strokeWidth="7"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeOffset}
                                strokeLinecap="round"
                                className="progress-ring-circle"
                            />
                        </svg>
                        <div className="timer-circle-text">
                            <p style={{ color: isGood ? '#10b981' : '#ef4444' }} className="text-sm font-black leading-none">
                                {percentage}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lobby-bottom-bar">
                <p className="lobby-status-text flex-1 text-center">
                    Next up in {timeLeft}s...
                </p>
            </div>
        </main>
    );
}