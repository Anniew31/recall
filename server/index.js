const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = {}

async function endRound(roomCode, questionId) {
    for (const [socketId, answerText] of Object.entries(rooms[roomCode].answers)) {
        try {
            const res = await fetch(`http://localhost:8000/score-answer`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question_id: questionId, player_answer: answerText })
            })

            if (!res.ok) {
                console.error("Failed to score answer")
                rooms[roomCode].scores[socketId] = (rooms[roomCode].scores[socketId] || 0) + 0
                continue
            }
            
            const data = await res.json()
            rooms[roomCode].scores[socketId] = (rooms[roomCode].scores[socketId] || 0) + data.score
        } catch (err) {
            console.log("Something went wrong grading.")
        }
    }

    const namedScores = {}
    for (const [socketId, score] of Object.entries(rooms[roomCode].scores)) {
        const player = rooms[roomCode].players.find(p => p.id === socketId)
        if (player) namedScores[player.name] = score
    }

    const playerResults = {}
    rooms[roomCode].players.forEach(player => {
        const answerText = rooms[roomCode].answers[player.id];
        playerResults[player.name] = {
            answer: answerText || 'No answer submitted',
            score: rooms[roomCode].scores[player.id] || 0
        }
    })

    io.to(roomCode).emit('round_results', {
        scores: namedScores,
        question: rooms[roomCode].questions[rooms[roomCode].currentRound],
        playerResults
    })

    rooms[roomCode].currentRound++

    if (rooms[roomCode].currentRound >= rooms[roomCode].totalRounds) {
        io.to(roomCode).emit('game_over', {
            finalScores: rooms[roomCode].scores
        })
    } else {
        setTimeout(() => startRound(roomCode), 3000)
    }
}

function startRound(roomCode) {
    const room = rooms[roomCode]
    const question = room.questions[room.currentRound]
    room.answers = {}
    let timeLeft = 60;

    io.to(roomCode).emit('round_started', {
        question: question,
        roundNumber: room.currentRound + 1,
        totalRounds: room.totalRounds,
        timeLeft: timeLeft
    });

    setTimeout(() => {
        room.roundTimer = setInterval(() => {
            timeLeft--
            io.to(roomCode).emit('timer_tick', { timeLeft })
            if (timeLeft <= 0) {
                clearInterval(room.roundTimer)
                endRound(roomCode, question.id)
            }
        }, 1000)
    }, 11000)
}

io.on('connection', (socket) => {
    socket.on('create_room', (data) => {
        const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase()
        rooms[roomCode] = { 
            players: [],
            questions: [],
            submissionsCount: {},
            currentRound: 0,
            totalRounds: 0,
            answers: {}, // {socketId: answerText }       
            scores: {}, // { playerName: totalScore }
            roundTimer: null
        }
        rooms[roomCode].players.push({ id: socket.id, name: data.playerName, isHost: true })
        socket.join(roomCode)
        socket.emit('room_created', { roomCode })
        io.to(roomCode).emit('player_list_updated', rooms[roomCode].players)
    })

    socket.on('join_room', (data) => {
        if (!(data.roomCode in rooms)) {
            socket.emit('error', { message: 'Room not found' })
            return
        }
        socket.join(data.roomCode)
        rooms[data.roomCode].players.push({ id: socket.id, name: data.playerName, isHost: false })
        io.to(data.roomCode).emit('player_list_updated', rooms[data.roomCode].players)
        socket.emit('room_joined', { roomCode: data.roomCode })
    })

    socket.on('disconnect', () => {
        for (const roomCode in rooms) {
            const updatedPlayers = rooms[roomCode].players.filter(p => p.id !== socket.id)
            if (updatedPlayers.length !== rooms[roomCode].players.length) {
                rooms[roomCode].players = updatedPlayers
                io.to(roomCode).emit('player_list_updated', rooms[roomCode].players)
            }
        }
    })

    socket.on('rejoin_room', (data) => {
        if (!(data.roomCode in rooms)) return
        const existingPlayer = rooms[data.roomCode].players.find(p => p.name === data.playerName)
        if (existingPlayer) {
            existingPlayer.id = socket.id
        } else {
            rooms[data.roomCode].players.push({ id: socket.id, name: data.playerName, isHost: data.isHost })
        }
        socket.join(data.roomCode)
        io.to(data.roomCode).emit('player_list_updated', rooms[data.roomCode].players)
    })

    socket.on('game_setup_started', (data) => {
        io.to(data.roomCode).emit('game_setup_started')
    })

    socket.on('game_configured', (data) => {
        if (!rooms[data.roomCode]) {
            rooms[data.roomCode] = { 
                players: [], questions: [], submissionsCount: {},
                currentRound: 0, totalRounds: 0,
                answers: {}, scores: {}, roundTimer: null
            }
        }

        rooms[data.roomCode].topic = data.topic || "Untitled Topic" 
        rooms[data.roomCode].questionCount = data.questionCount || 2
        rooms[data.roomCode].notesText = data.notesText || ""

        io.to(data.roomCode).emit('setup_completed', {
            topic: rooms[data.roomCode].topic,
            questionCount: rooms[data.roomCode].questionCount,
            notesText: rooms[data.roomCode].notesText
        })
    })

    socket.on('submit_question', (data) => {
        const room = rooms[data.roomCode];
        if (!room) return;

        const newQuestion = {
            id: data.questionId,
            player: data.playerName,
            playerId: socket.id,
            questionText: data.questionText,
            correctAnswer: data.correctAnswer
        };
        room.questions.push(newQuestion);

        if (!room.submissionsCount[socket.id]) {
            room.submissionsCount[socket.id] = 0;
        }
        room.submissionsCount[socket.id] += 1;

        socket.emit('question_submitted_success', { 
            submittedCount: room.submissionsCount[socket.id] 
        });

        const totalPlayers = room.players.length;
        const requiredPerPlayer = room.questionCount || 2;
        
        const finishedPlayersCount = room.players.filter(p => {
            return (room.submissionsCount[p.id] || 0) >= requiredPerPlayer;
        }).length;

        io.to(data.roomCode).emit('submission_progress_update', {
            finishedCount: finishedPlayersCount,
            totalPlayers: totalPlayers
        });

        if (finishedPlayersCount === totalPlayers) {
            room.totalRounds = room.questions.length
            io.to(data.roomCode).emit('all_questions_ready')
            setTimeout(() => startRound(data.roomCode), 3000)
        }
    })

    socket.on('submit_answer', (data) => {
        const room = rooms[data.roomCode]
        if (!room) return
        room.answers[socket.id] = data.answer
    })
})

httpServer.listen(3001, () => {
  console.log('server running on port 3001')
})