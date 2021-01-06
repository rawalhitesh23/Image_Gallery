const express = require('express')
const app = express()
const cors = require('cors')
const router = require('./routes/web')
const port = process.env.PORT || 5000

// Database connection
require('./database/dbconn')

// Middlewares
app.use(express.json())
app.use(cors())

// Routes
app.use('/api', router)

// Listen to port
app.listen(port, () => {
    console.log(`server is running on port: ${port}`)
})
