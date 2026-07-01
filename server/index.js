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

io.on('connection', (socket) => {
    socket.on('create_room', (data) => {
        const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase()
        rooms[roomCode] = { 
            players: [],
            questions: [],
            submissionsCount: {}
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
            rooms[data.roomCode] = { players: [], questions: [], submissionsCount: {} }
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
            id: Math.random().toString(36).substring(2, 9),
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
            io.to(data.roomCode).emit('all_questions_ready', {
                questions: room.questions
            });
        }
    });
})

httpServer.listen(3001, () => {
  console.log('server running on port 3001')
})