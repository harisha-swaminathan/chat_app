const express= require('express')
const http=require('http')
const path=require('path')
const socketIo=require('socket.io')
const Filter=require('bad-words')
const {generateMsg,generateLocationMsg}=require('./utils/message')
const {addUser, removeUser, getUser, getUsersInRoom}=require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketIo(server)

const port=process.env.PORT||3000

const public_path=path.join(__dirname,'../public')

app.use(express.static(public_path))


io.on('connection',(socket)=>{

    socket.on('joinChat',(options, callback)=>{


        const {error, user}=addUser({id:socket.id,...options})

        if(error){
            
            return callback(error)
        }
       
        socket.join(user.room)
        socket.emit('message',generateMsg('Welcome!'))

        socket.broadcast.to(user.room).emit('message',generateMsg('Admin',`${user.name} has joined the chat`))
        io.to(user.room).emit('UsersInRoom',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('new message',(new_msg, callback)=>{
        const user=getUser(socket.id)
        const filter=new Filter()

        if(filter.isProfane(new_msg))
        return callback('Profanity not allowed')

      io.to(user.room).emit('message',generateMsg(user.name,new_msg))
      callback('')
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMsg('Admin',`${user.name} has left the chat`))
            io.to(user.room).emit('UsersInRoom',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
            
    })

    socket.on('SendLocation',(coords,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('LocationMessage',generateLocationMsg('Admin',user.name,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback('Location shared')
    })
})

server.listen(port,()=>{
    console.log('Server is up')
})