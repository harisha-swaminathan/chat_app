const server=io()

const $form=document.querySelector("#chatform")
const $message=$form.querySelector('input')
const $sendButton=$form.querySelector('button')
const $location=document.querySelector("#location")
const $displayMessage=document.querySelector("#displayMessage")
const $displayUsers=document.querySelector("#sidebar")

const templateMessage=document.querySelector("#templateMessage").innerHTML

const templateLocation=document.querySelector("#templateLocation").innerHTML

const templateSideBar=document.querySelector("#templateSideBar").innerHTML

const {name,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})


const scroll=()=>{
    //get the last message
    const $newMessage=$displayMessage.lastElementChild

    // get the  css styles
    const messageStyle=getComputedStyle($newMessage)

    //get the margin from the above const and change it to a number

    const messageStyleMargin=parseInt(messageStyle.marginBottom)

    
    const newMsgHeight=$newMessage.offsetHeight +messageStyleMargin // this doesnt take margins into account

    const visibleHeight=$displayMessage.offsetHeight // just the visible height. (without scrolling)

    const containerHeight=$displayMessage.scrollHeight// entire height with scroll


    //scrolloffset: how far you've scrolled from the top
    const scrolloffset=$displayMessage.scrollTop + visibleHeight // scroll top gives the amount of distance that you scrolled form the top

    if(containerHeight-newMsgHeight<=scrolloffset){
        $displayMessage.scrollTop=$displayMessage.scrollHeight
    }
}

server.on('message',(message)=>{
    
    const html=Mustache.render(templateMessage,{
        name:message.name,
        message:message.text,
        createdAt:moment(message.createdAt).format('hh:mm a')
    })
    $displayMessage.insertAdjacentHTML('beforeend',html)
    scroll()
})
server.on('LocationMessage',(message)=>{
    
    const html=Mustache.render(templateLocation,{
        name:message.name,
        message:message.url,
        createdAt:moment(message.createdAt).format('hh:mm a')
    })
    $displayMessage.insertAdjacentHTML('beforeend',html)
    scroll()
    
})

server.on('UsersInRoom',({room,users})=>{
    const html=Mustache.render(templateSideBar,{
        room,
        users
    })
    $displayUsers.innerHTML=html
})

$form.addEventListener('submit',(e)=>{
    e.preventDefault()

    $sendButton.setAttribute('disabled','disabled')

    const new_msg=e.target.elements.message.value

    server.emit('new message',new_msg,(error)=>{
        $sendButton.removeAttribute('disabled')
        $message.value=''
        $message.focus()
        if(error)
            console.log(error)
        else
        console.log('Message delivered!')
        
    })
})

$location.addEventListener('click',()=>{
    $location.setAttribute('disabled','disabled')
    if(!navigator.geolocation)
        return alert('Geolocation not supported by your browser')

    navigator.geolocation.getCurrentPosition((position)=>{
       
        server.emit('SendLocation',{latitude:position.coords.latitude,longitude:position.coords.longitude},(ack)=>{
            $location.removeAttribute('disabled')
            console.log(ack)

        })
       
    })
})

server.emit('joinChat',{name,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
   
})