import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { InjectModel } from '@nestjs/mongoose';
import { Chatting } from './models/chattings.model';
import { Model } from 'mongoose';
import { Socket as SocketModel } from './models/sockets.model';

@WebSocketGateway({ namespace: 'chattings' })
export class ChatsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('chat');

  constructor(
    @InjectModel(Chatting.name) private readonly chattingModel : Model<Chatting>,
    @InjectModel(Socket.name) private readonly socketModel : Model<SocketModel>
  ) {
    this.logger.log('constructor');
  }
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    
    const user = await this.socketModel.findOne({id : socket.id});
    
    if(user){
      socket.broadcast.emit('disconnetc_user', user.username);
      await user.deleteOne({id : user.username});
    }

    this.logger.log(`disconnected : ${socket.id} ${socket.nsp.name}`)
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`connected : ${socket.id} ${socket.nsp.name}`)
  }

  afterInit() {
    this.logger.log('init');
  }


  @SubscribeMessage('new_user')
  async handleNewUser(
    @MessageBody() username: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const exist = this.socketModel.exists({ username });

    if (exist){
      username = `${username }_${Math.floor(Math.random() * 100)}`;
      await this.socketModel.create({
        id : socket.id,
        username,
      });
    }else{
      await this.socketModel.create({
        id : socket.id,
        username,
      })
    }

    socket.broadcast.emit('user_connected', username);
    return username;
  }

  @SubscribeMessage('submit_chat')
  async handleSubmitChat(
    @MessageBody() chat: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const socketObj = await this.socketModel.findOne({id : socket.id});

    await this.chattingModel.create({
      user : socketObj,
      chat : chat,
    })
    socket.broadcast.emit('new_chat', {
      chat,
      username : socketObj.username,
    });
  }
}