const chatForm= document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');


//get username  , room from URL
const {username,room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true
});

//now we have the username and room detail
//console.log(username,room);


const socket=io();
// const socket=io("https://chat-cord-two.vercel.app/");


socket.emit('joinRoom',{username,room});

//get room and users
socket.on('roomUsers',({room,users})=> {
    outputRoomName(room);
    outputUsers(users);
});

//Message from server
socket.on('message',message=>
{
    console.log(message);
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
)

//Message submit
chatForm.addEventListener('submit',e=>
{
    e.preventDefault();
    
    //get msg text
    const msg=e.target.elements.msg.value;
    // console.log(msg);

    //Emit msg to server
     socket.emit('chatMessage',msg);

     //clear input in input box after dilevery
     e.target.elements.msg.value='';
     e.target.elements.msg.focus();
})

//Output message to DOM

function outputMessage(message)
{
    const div=document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    
    document.querySelector('.chat-messages').appendChild(div);

}

function outputRoomName(room)
{
    // roomName.innerText=room;
    roomName.innerText=room;
    
}

function outputUsers(users)
{
   
    userList.innerHTML=`
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;

}