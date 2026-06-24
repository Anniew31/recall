type Player = {
    id: string
    name: string
    isHost: boolean
}

type LobbyProps = {
    players: Array<Player>
    roomCode: string
}

export default function Lobby({players, roomCode}: LobbyProps) {
    return (
        <main>
            <p>Room Code: {roomCode}</p>
            <p>List of players:</p>
            {players.map((player) => (
                <div key={player.id}>
                    {player.name} {player.isHost ? '👑' : ''}
                </div>
            ))}
            <p>Waiting for host to start...</p>

        </main>
    );
}