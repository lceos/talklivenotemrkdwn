const express = require('express')

const app = express()

const server = require('http').createServer(app)

const io = require('socket.io')(server)

const path = require('path')

// const session = require('express-session')

const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'

// use pug views rendering
app.set('view engine', 'pug')
app.set('views', './views')
app.locals.pretty = true

// use public dir path for static content
app.use('/js', express.static(path.join(__dirname, '/public/js')))
app.use('/css', express.static(path.join(__dirname, '/public/css')))
app.use(
  '/codemirror',
  express.static(path.join(__dirname, '/public/codemirror'))
)

// session
// app.set('trust proxy', 1) // trust first proxy
// app.use(session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: (app.get('env') === 'production') ? true : false }
// }))

// routes
app.get('/', (req, res) => {
  res.render('index')
})

// speech page
app.get('/speech', (req, res) => {
  if (req.query.userId) {
    res.redirect(`/speech/${req.query.userId}`)
  } else {
    res.render('speechLogin')
  }
})
app.get('/speech/:userId', (req, res) => {
  res.render('speech', { userId: req.params.userId })
})

// visualize page
app.get('/visualize', (req, res) => {
  if (req.query.userId) {
    res.redirect(`/visualize/${req.query.userId}`)
  } else {
    res.render('visualizeLogin')
  }
})
app.get('/visualize/:userId', (req, res) => {
  res.render('visualize', {
    userId: req.params.userId
  })
})

// editor
app.get('/editor', (req, res) => {
  if (req.query.userId) {
    res.redirect(`/editor/${req.query.userId}`)
  } else {
    res.render('editorLogin')
  }
})
app.get('/editor/:userId', (req, res) => {
  res.render('editor', { userId: req.params.userId })
})

// server
server.listen(port, host, () => {
  console.log(`listening on ${host}:${port}`)

  io.on('connection', socket => {
    // a client connected
    // not for production use, todo sessions
    socket.on('validatedSentence', msg => {
      socket.in(msg.userId).emit('writeToOutput', msg)
    })
    socket.on('room', room => {
      socket.join(room)
    })
  })

  io.on('disconnect', () => {
    // a client disconnected
  })
})
