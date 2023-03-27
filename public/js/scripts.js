
const socket = io('/');
const getElementById = (id) => document.getElementById(id) || null;

const helloStrangerElement = getElementById('hello_stragers');
const chattingBoxElement = getElementById('chatting_box');
const formElement = getElementById('chat_form');

function helloUser(){
    const username = prompt('What is your name?');
    socket.emit("new_user",username);
    console.log(username);
    socket.on("hello_user", (data) => {
        console.log(data); 
    })
}

function init() {
    helloUser();
}

init();