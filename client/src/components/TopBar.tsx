type topBarProps = {
    roomCode: string
}

export default function topBar({ roomCode} : topBarProps ){
    return (
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
    )
}