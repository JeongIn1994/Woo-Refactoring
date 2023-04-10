
const socket = io('/chattings');
const getElementById = (id) => document.getElementById(id) || null;

const helloStrangerElement = getElementById('hello_stragers');
const chattingBoxElement = getElementById('chatting_box');
const formElement = getElementById('chat_form');

socket.on('user_connected', (username) => {
    drawNewChat(`${username} connected`);
});

socket.on('new_chat',(data) => {
    const {chat, username} = data;
    drawNewChat(`${username} : ${chat}`)
})
socket.on('disconnetc_user', (username) => drawNewChat(`${username}: Bye...`));

const handleSubmit = (event) =>{
    event.preventDefault();

    const inputValue = event.target.elements[0].value;
    
    if (inputValue !== ""){
        socket.emit('submit_chat',inputValue);

        drawNewChat(`me : ${inputValue}`);
        event.target.elements[0].value = '';
    }
};

const drawHelloStranger = (username) => {
    helloStrangerElement.innerText = `Hello ${username} Stranger :)`
};

const drawNewChat = (massage) =>{
    const wrapperChatbox = document.createElement('div');
    const chatBox = `
        <div>
            ${massage}
        </div>
    `;
    wrapperChatbox.innerHTML = chatBox;
    chattingBoxElement.append(wrapperChatbox);
}

function helloUser(){
    const username = prompt('What is your name?');
    socket.emit("new_user",username,(data) =>{
        drawHelloStranger(data);
    });
    
}

function init() {
    helloUser();

    formElement.addEventListener('submit', handleSubmit);
}

init();