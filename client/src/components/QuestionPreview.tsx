import { useEffect, useState } from "react"
import TopBar from "./TopBar"
import Error from "./Error"

type QuestionPreviewProps = {
    roundNumber: number
    totalRounds: number
    currentQuestion: { id: string, questionText: string }
    roomCode: string
    playerName: string
    score: number
    setScreen: (screen: 'home' | 'join' | 'lobby' | 'setup' | 'question_setup' | 'question_preview' | 'game') => void
}

export default function QuestionPreview({ roundNumber, currentQuestion, roomCode, playerName, score, setScreen, totalRounds}: QuestionPreviewProps) {
    const [timeLeft, setTimeLeft] = useState(10)
    const [error, setError] = useState('')

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (timeLeft <= 0) {
            setScreen('game')
        }
    }, [timeLeft])

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
                            <p className="text-gray-900 text-3xl font-black leading-none">{score}</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* question and timer */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
                <p className="logo-subtitle">Get ready...</p>
                <p className="text-white font-extrabold text-3xl text-center leading-snug max-w-2xl">
                    {currentQuestion.questionText}
                </p>
                <div className="w-16 h-16 rounded-full bg-[#4c1d95] flex items-center justify-center mt-2">
                    <p className="text-white font-black text-3xl">{timeLeft}</p>
                </div>
            </div>
        </main>
    )
}