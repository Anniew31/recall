import { io } from 'socket.io-client'

const socket = io('https://server-production-8748.up.railway.app', {
    transports: ['websocket', 'polling'],
    withCredentials: false
})

export default socket