import { useEffect, useRef, useState } from "react"
import socket from "./socket"
import Home from "./components/Home"
import Join from "./components/Join"
import Lobby from "./components/Lobby"
import Setup from "./components/Setup"
import QuestionSetup from "./components/Question-Setup"
import Game from './components/Game'
import QuestionPreview from "./components/QuestionPreview"
import Results from "./components/Results"
import Leaderboard from "./components/Leaderboard"
import GameOver from "./components/GameOver"

type Player = {
    id: string
    name: string
    isHost: boolean
}

type FinalLeaderboardEntry = {
    name: string
    score: number
    rank: number
}

function App() {
    const [screen, setScreen] = useState<'home' | 'join' | 'lobby' | 'setup' | 'question_setup' | 'question_preview' | 'game' | 'results' | 'leaderboard' | 'game_over'>('home')
    
    const [playerName, setPlayerName] = useState('')
    const playerNameRef = useRef('')

    const [roomCode, setRoomCode] = useState('')
    const [players, setPlayers] = useState<Player[]>([])
    const [isHost, setIsHost] = useState(false)
    const [score, setScore] = useState(0)
    
    const [topic, setTopic] = useState('')
    const [questionCount, setQuestionCount] = useState<number>(0)
    const [notesText, setNotesText] = useState('')
    
    const [currentQuestion, setCurrentQuestion] = useState<{ id: string, questionText: string }>({ id: '', questionText: '' })
    const [roundNumber, setRoundNumber] = useState(0)
    const [totalRounds, setTotalRounds] = useState(0)

    const [roundResults, setRoundResults] = useState<{
        scores: Record<string, number>,
        question: { id: string, questionText: string, correctAnswer: string },
        playerResults: Record<string, { answer: string, score: number }>,
        leaderboard: any
    } | null>(null)

    const [finalLeaderboard, setFinalLeaderboard] = useState<FinalLeaderboardEntry[]>([])

    useEffect(() => {
        playerNameRef.current = playerName
    }, [playerName])

    useEffect(() => {
        socket.on('room_created', (data) => {
            setRoomCode(data.roomCode)
            setScreen('lobby')
            setIsHost(true)
        })

        socket.on('player_list_updated', (players) => {
            setPlayers(players)
        })

        socket.on('room_joined', (data) => {
            setRoomCode(data.roomCode)
            setScreen('lobby')
        })

        socket.on('game_setup_started', () => {
            setScreen('setup')
        })

        socket.on('setup_completed', (data) => {
            if (!data) {
                console.error("Received an undefined setup_completed payload from server");
                return;
            }

            setTopic(data.topic || '')
            setQuestionCount(data.questionCount ? Number(data.questionCount) : 2) 
            setNotesText(data.notesText || '')
            setScreen('question_setup')
        })

        socket.on('round_started', (data) => {
            setCurrentQuestion(data.question)
            setRoundNumber(data.roundNumber)
            setTotalRounds(data.totalRounds)
            setScreen('question_preview')
        })

        socket.on('round_results', (data) => {
            setRoundResults(data)
            setScore(prev => prev + (data.playerResults?.[playerNameRef.current]?.score || 0))
            setScreen('results')
        })

        socket.on('game_over', (data) => {
            setFinalLeaderboard(data.finalLeaderboard)
            setScreen('game_over')
        })

        return () => {
            socket.off('room_created')
            socket.off('player_list_updated')
            socket.off('room_joined')
            socket.off('game_setup_started')
            socket.off('setup_completed')
            socket.off('game')
            socket.off('round_started')
            socket.off('round_results')
            socket.off('game_over')
        }
    }, [])

    useEffect(() => {
        const saved = localStorage.getItem('recall_session')
        if (!saved) return

        const { playerName, roomCode, screen, isHost, savedTopic, savedCount, savedNotes } = JSON.parse(saved)
        setPlayerName(playerName)
        setRoomCode(roomCode)
        setScreen(screen)
        setIsHost(isHost)
        if (savedTopic) setTopic(savedTopic)
        if (savedCount) setQuestionCount(savedCount)
        if (savedNotes) setNotesText(savedNotes)

        if (screen !== 'home') {
            socket.on('connect', () => {
                socket.emit('rejoin_room', { playerName, roomCode, isHost })
            })
        }
    }, [])

    useEffect(() => {
        if (screen !== 'home') {
            localStorage.setItem('recall_session', JSON.stringify({
                playerName,
                roomCode,
                screen,
                isHost,
                savedTopic: topic,      
                savedCount: questionCount,
                savedNotes: notesText
            }))
        } else {
            localStorage.removeItem('recall_session')
        }
    }, [screen, playerName, roomCode, isHost, topic, questionCount, notesText])

    const handleJoinRoom = (roomCodeInput: string) => {
        socket.emit('join_room', { playerName, roomCode: roomCodeInput.toUpperCase() })
    }

    const handleStartGame = (roomCodeInput: string) => {
        socket.emit('game_setup_started', {roomCode: roomCodeInput.toUpperCase() })
    }

    if (screen === 'home') return (
        <Home playerName={playerName} setPlayerName={setPlayerName} setScreen={setScreen} />
    )
    if (screen === 'join') return (
        <Join playerName={playerName} setScreen={setScreen} onJoin={handleJoinRoom}></Join>
    )
    if (screen === 'lobby') return (
        <Lobby players={players} roomCode={roomCode} isHost={isHost} onStart={handleStartGame}></Lobby>
    )
    if (screen === 'setup') return (
        <Setup 
            isHost={isHost} 
            roomCode={roomCode}
            topic={topic}
            setTopic={setTopic}
            questionCount={questionCount}
            setQuestionCount={setQuestionCount}
        />
    )
    if (screen === 'question_setup') return (
        <QuestionSetup
            questionCount={questionCount}
            topic={topic}
            notesText={notesText}
            playerName={playerName}
            roomCode={roomCode}
        />
    )
    if (screen === 'game') return (
        <Game
            roomCode={roomCode}
            playerName={playerName}
            currentQuestion={currentQuestion}
            roundNumber={roundNumber}
            totalRounds={totalRounds}
        />
    )

    if (screen === 'question_preview') return (
        <QuestionPreview
            roundNumber={roundNumber}
            totalRounds={totalRounds}
            currentQuestion={currentQuestion}
            roomCode={roomCode}
            playerName={playerName}
            score={score}
            setScreen={setScreen}
        />
    )

    if (!roundResults || !roundResults.question) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <p className="text-white">Loading results...</p>
        </div>
    )

    if (screen === 'results' && roundResults) return (
        <Results
            question={roundResults?.question}
            playerAnswer={roundResults?.playerResults?.[playerName]?.answer ?? ''}
            correctAnswer={roundResults?.question?.correctAnswer ?? ''}
            roundScore={roundResults?.playerResults?.[playerName]?.score ?? 0}
            totalScore={score}
            playerName={playerName}
            roomCode={roomCode}
            roundNumber={roundNumber}
            totalRounds={totalRounds}
            setScreen={setScreen}
        />
    )

    if (screen === 'leaderboard') return (
        <Leaderboard
            leaderboard={roundResults?.leaderboard}
            playerName={playerName}
            roundNumber={roundNumber}
            totalRounds={totalRounds}
            roomCode={roomCode}
            setScreen={setScreen}
        />
    )

    if (screen === 'game_over') return (
        <GameOver
            finalLeaderboard={finalLeaderboard}
            playerName={playerName}
            roomCode={roomCode}
        />
    )

    return null
}

export default App