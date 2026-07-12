import { useEffect, useState } from "react";
import socket from "../socket";
import Error from "./Error"
import { playSubmit } from "../sounds";
import TopBar from "./TopBar";

type QuestionSetupProps = {
    questionCount: number,
    topic: string, 
    notesText: string,
    playerName: string,
    roomCode: string
}

export default function QuestionSetup({questionCount, topic, notesText, playerName, roomCode} : QuestionSetupProps) {
    const [questionText, setQuestionText] = useState('')
    const [correctAnswer, setCorrectAnswer] = useState('')
    const [submittedCount, setSubmittedCount] = useState(0)
    const [finishedPlayers, setFinishedPlayers] = useState(0)
    const [totalPlayers, setTotalPlayers] = useState(0)
    const [error, setError] = useState('')

    useEffect(() => {
        socket.on('error', (data) => {
            setError(data.message)
        })

        socket.on('submission_progress_update', (data) => {
            setTotalPlayers(data.totalPlayers)
            setFinishedPlayers(data.finishedPlayers)
        })
        
        socket.on('question_submitted_success', (data) => {
            setSubmittedCount(data.submittedCount)
            setQuestionText('')
            setCorrectAnswer('')
        })

        return () => {
            socket.off('error')
            socket.off('submission_progress_update')
            socket.off('question_submitted_success')
        }
    }, [])

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!questionText.trim() || !correctAnswer) {
            setError("Please enter a question and the correct answering before submitting.")
            return
        }
        try {
            playSubmit()

            const questionId = Math.random().toString(36).substring(2, 9)
            const res = await fetch('http://localhost:8000/embed-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question_id: questionId,
                    question: questionText,
                    answer: correctAnswer
                })
            })

            if (!res.ok) {
                setError("Failed to store question embedding.")
                return
            }

            socket.emit('submit_question', {
                roomCode,
                notesText,
                playerName,
                questionText,
                correctAnswer,
                questionId
            })
        } catch (err) {
            setError("Something went wrong submitting your question. Please try again.")
        }
    }

    return (
        <main className="min-h-screen w-full flex flex-col bg-[#0f172a]">
            {error && <Error message={error} onClose={() => setError('')} />}
            
            {/* top bar */}
            <TopBar roomCode={roomCode}></TopBar>

            {submittedCount >= questionCount ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-white font-bold text-xl">You're done! 🎉</p>
                    <p className="lobby-status-text">Waiting for others to finish...</p>
                    <p className="lobby-status-text">{finishedPlayers} of {totalPlayers} players done</p>
                </div>
            ) : (
                <div className="setup-grid">
                    {/* Notes panel */}
                    <div className="setup-card overflow-y-auto max-h-[70vh]">
                        <p className="setup-label">Reference Notes</p>
                        <p className="text-[#94a3b8] text-xs leading-relaxed whitespace-pre-wrap">{notesText}</p>
                    </div>

                    {/* Form */}
                    <div className="flex flex-col gap-3">
                        <div className="setup-card">
                            <p className="setup-label">Topic: {topic}</p>
                            <p className="lobby-status-text text-xs">{submittedCount} of {questionCount} submitted</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <div className="setup-card">
                                <p className="setup-label">Your Question</p>
                                <input
                                    type="text"
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    placeholder="e.g. What is the role of mitochondria?"
                                    className="game-input text-left"
                                />
                            </div>

                            <div className="setup-card">
                                <p className="setup-label">Correct Answer</p>
                                <textarea
                                    value={correctAnswer}
                                    onChange={(e) => setCorrectAnswer(e.target.value)}
                                    placeholder="Write the correct answer here..."
                                    rows={4}
                                    className="game-input text-left resize-none"
                                />
                            </div>

                            <button type="submit" className="btn-primary py-4">
                                Submit Question ({submittedCount + 1} of {questionCount})
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}