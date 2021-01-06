const mongoose = require('mongoose')
const config = require('config')

const db = config.get("mongoURL")

mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
.then(() => console.log('Database connected'))
.catch((err) => console.log("Database connection error: " + err))