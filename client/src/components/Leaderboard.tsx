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
        <div>
            <p>IN HERE</p>
        </div>
    )

}