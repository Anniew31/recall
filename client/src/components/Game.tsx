import { useEffect, useState} from "react";
import socket from "../socket";
import Error from "./Error";

type GameProps = {
    roomCode: string
    playerName: string
    currentQuestion: { id: string, questionText: string }
    roundNumber: number
    totalRounds: number
}

export default function Game ({roomCode, playerName, currentQuestion, roundNumber, totalRounds }: GameProps) {
    const [timeLeft, setTimeLeft] = useState(60)
    const [answer, setAnswer] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const circumference = 188.5
    const strokeOffset = circumference * (1 - timeLeft / 60)
    const isUrgent = timeLeft <= 10

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            socket.emit('submit_answer', { roomCode, answer })
        } catch (err) {
            setError("Something went wrong submitting your answer. Please try again.")
        }
        setSubmitted(true)
    }

    return (
        <main className="min-h-screen w-full flex flex-col bg-[#0f172a]">
            {error && <Error message={error} onClose={() => setError('')} />}

            {/* top bar */}
            <div className="lobby-header">
                <div>
                    <p className="logo-title text-2xl">RECALL</p>
                    <p className="logo-subtitle">Study together. Compete together.</p>
                </div>
                <div className="text-right">
                    <p className="lobby-header-label">Room Code</p>
                    <p className="lobby-header-value">{roomCode}</p>
                </div>
            </div>

            {/* round and timer */}
            <div className="round-indicator">
                <div>
                    <p className="lobby-header-label">Round</p>
                    <p className="text-white text-3xl font-black">
                        {roundNumber} <span className="text-[--color-muted] text-lg font-semibold">of {totalRounds}</span>
                    </p>
                </div>

                <div className="timer-circle-wrapper">
                    <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="36" cy="36" r="30" fill="none" stroke="#1e293b" strokeWidth="6" />
                        <circle
                            cx="36" cy="36" r="30"
                            fill="none"
                            stroke={isUrgent ? '#f87171' : '#4c1d95'}
                            strokeWidth="6"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeOffset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear, stroke 150ms' }}
                        />
                    </svg>
                    <div className="timer-circle-text">
                        <p className={`font-black text-lg leading-none ${isUrgent ? 'text-red-400' : 'text-white'}`}>{timeLeft}</p>
                        <p className="text-[--color-muted] text-xs">sec</p>
                    </div>
                </div>
            </div>

            {/* question and answer section */}
            <div className="game-question-section">
                <div className="setup-card">
                    <p className="setup-label">Question</p>
                    <p className="text-white font-bold text-lg">{currentQuestion?.questionText}</p>
                </div>
            </div>

            {submitted ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-white font-bold text-xl">Answer submitted ✓</p>
                    <p className="lobby-status-text">Waiting for the round to end...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="game-answer-section">
                    <div className="setup-card">
                        <p className="setup-label">Your Answer</p>
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type everything you remember..."
                            rows={5}
                            className="game-input text-left resize-none"
                            autoFocus
                        />
                        <p className="word-count">{answer.split(' ').filter(Boolean).length} words</p>
                    </div>
                    <button type="submit" className="btn-secondary py-4">
                        Submit Answer
                    </button>
                </form>
            )}
        </main>
    )
}