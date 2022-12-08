const express = require("express");
const http = require('http');
const { Server } = require("socket.io");
let ejs = require('ejs');
const app = express();
const server = http.createServer(app);

require("./models");
const Msg = require("./models/msg")

const io = new Server(server);

const PORT = 8081;

//render engine 
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');





const createMsg = async (name, message) => await new Msg({
    name,
    message
}).save()


//routes

app.get('/', async (req, res) => {
    const msgs = await Msg.find({})
    res.render('index',{msgs})
})

app.post('/', async (req, res) => {
    await createMsg(req.body.name, req.body.message)
    io.emit("chat msg",{name:req.body.name, message:req.body.message})
    const msgs = await Msg.find({})
    res.render('index', {msgs})
})

//socket

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('chat msg', (msg) => {
        io.emit('chat msg', msg);
        });
     
  });
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})
