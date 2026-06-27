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
    console.log('a user connected:', socket.id)

    socket.on('create_room', (data) => {
        const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase()
        rooms[roomCode] = { players: [] }
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
        console.log('emitting room_joined to socket:', socket.id)
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
})

httpServer.listen(3001, () => {
  console.log('server running on port 3001')
})