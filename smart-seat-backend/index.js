const express = require('express')
const cors = require('cors')
const http = require('http')
const initWebSocketServer = require('./controllers/wsServer')
require('dotenv').config()

const app = express()
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));
app.use(express.json())

app.get('/', (req, res) => res.send('Smart Seat Backend is running!'))

const authRoutes = require('./routes/authRoutes')
const usersRoutes = require('./routes/usersRoutes')
const bookingsRoutes = require('./routes/bookings')
const classroomsRoutes = require('./routes/classrooms')
const recommendRoutes = require('./routes/recommendRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/classrooms', classroomsRoutes)
app.use('/api/recommend', recommendRoutes)

const server = http.createServer(app)
initWebSocketServer(server)

const PORT = 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
