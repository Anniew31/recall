import { useEffect, useState } from "react";
import socket from "../socket";
import Error from "./Error"

type SetupProps = {
    isHost: boolean
    roomCode: string
}

export default function Setup({isHost, roomCode}: SetupProps) {
    const [error, setError] = useState('')
    const [topic, setTopic] = useState('')
    const [questionCount, setQuestionCount] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [file, setFile] = useState<File | undefined>(undefined)
    
    useEffect(() => {
        socket.on('error', (data) => {
            setError(data.message)
        })
        return () => {
            socket.off('error')
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setIsProcessing(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch(`http://localhost:8000/extract-text`, {
                method: "POST",
                body: formData,
            })

            if (!res.ok) {
                throw new Error("Failed to extract text from PDF")
            }

            const data = await res.json()

            socket.emit('setup_completed', {
                roomCode,
                topic,
                questionCount,
                notesText: data.text
            })
        } catch (err) {
            setError("Something went wrong processing your notes. Please try again.")
            setIsProcessing(false)
        }
    }

    if (isHost) {
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

                {isProcessing ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <div className="lobby-status-dot"></div>
                        <p className="text-white font-bold">Processing your notes...</p>
                        <p className="lobby-status-text">Extracting text from PDF. Please wait.</p>
                    </div>
                ) : (
                    <div>
                        <div className="game-setup">
                            <p className="text-white font-extrabold text-lg">Game Setup</p>
                            <p className="lobby-status-text mt-1">Configure your study session</p>
                        </div>

                        <form onSubmit={handleSubmit} className="setup-grid">
                            {/* upload pdf box */}
                            <div className="setup-card">
                                <p className="setup-label">Upload Notes</p>
                                <div
                                    className={`upload-zone ${file ? 'upload-zone-active' : ''}`}
                                    onClick={() => document.getElementById('file-input')?.click()}
                                >
                                    <p className="text-3xl">📄</p>
                                    <p className="text-white font-bold text-sm">
                                        {file ? file.name : 'Drop your PDF here'}
                                    </p>
                                    <p className="lobby-status-text text-xs">
                                        {file ? 'Click to change file' : 'or click to browse'}
                                    </p>
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) setFile(e.target.files[0])
                                        }}
                                    />
                                </div>
                            </div>
                            
                            {/* topic box */}
                            <div className="flex flex-col gap-3">
                                <div className="setup-card">
                                    <p className="setup-label">Main Topic</p>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Cell Biology Chapter 3"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="game-input text-left"
                                    />
                                    <p className="lobby-status-text text-xs">This helps players focus their questions</p>
                                </div>

                                {/* number questions box */}
                                <div className="setup-card">
                                    <p className="setup-label">Questions Per Player</p>
                                    <div className="pill-selector">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setQuestionCount(String(n))}
                                                className={`pill ${questionCount === String(n) ? 'pill-active' : ''}`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="lobby-status-text text-xs">Each player submits this many questions</p>
                                </div>

                                <button type="submit" className="btn-secondary py-4 text-sm font-extrabold mt-auto">
                                    🚀 Confirm & Start Creation Phase
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        )
    }

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white">
            <div>
                <h2>Setting up the game...</h2>
                <p>The host is choosing a topic and uploading the reference PDF. Get ready!</p>
            </div>
        </main>
    )
}