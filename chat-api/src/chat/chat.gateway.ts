import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import OpenAI from 'openai';

interface IMessage {
  username: string;
  content: string;
  timeSent: string;
}
const apiKey = 'api_key';
const openai = new OpenAI({
  apiKey: apiKey,
});

async function TranslateMessage(language: string, message: IMessage) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Please translate the following message into ${language}. Restrict your translation to ${language} language only.`,
      },
      { role: 'user', content: `message to translate: ${message.content}` },
    ],
    model: 'gpt-3.5-turbo',
  });
  message.content = chatCompletion.choices[0].message.content;
  return message;
}

async function VerifyInformation(message: IMessage) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You possess vast knowledge and expertise. I'll provide you with some information.
          Please verify if it's accurate. Reply 'true' if it's true, provide the correct information if it's false,
          or respond with "This information can't be verified" if it can't be confirmed."`,
      },
      { role: 'user', content: `Following information: ${message.content}` },
    ],
    model: 'gpt-3.5-turbo',
  });
  return chatCompletion.choices[0].message.content;
}

async function SuggestResponse(chat: IMessage[]) {
  const messagesArray = chat.map((message) => {
    return message.content;
  });
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `I will give you a conversation which is in an array of messages.
          the messages are classified in order, Can you provide at list 3 possible responses?
          Please respond with only the possibilities and structure them in JSON format under the attribute "possibilities".`,
      },
      { role: 'user', content: `Array of messages: ${messagesArray}` },
    ],
    model: 'gpt-3.5-turbo',
  });
  return chatCompletion.choices[0].message.content;
}

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Socket;

  clients: { client: Socket; username?: string }[] = [];
  chatMessages: IMessage[] = [];

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any) {
    this.server.emit('message', payload);
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(client: any, payload: IMessage): void {
    const c = this.clients.find((c) => c.client.id === client.id);
    if (c.username) {
      this.server.emit('chat-message', {
        ...payload,
        username: c.username,
      });
      this.chatMessages.push({
        ...payload,
        username: c.username,
      });
    }
  }

  @SubscribeMessage('username-set')
  handleUsernameSet(client: any, payload: any): void {
    const c = this.clients.find((c) => c.client.id === client.id);
    if (c) {
      c.username = payload.username;
    }
  }

  @SubscribeMessage('translate-message')
  async handleTranslate(client: any, message: any) {
    const currentMessage = this.chatMessages.find(
      ({ timeSent }) => timeSent === message.msg.timeSent,
    );
    // console.log(message)
    const currentMessageIndex = this.chatMessages.findIndex(
      (msg: any) => msg === currentMessage,
    );
    //  console.log(currentMessageIndex)
    if (currentMessageIndex != -1) {
      const messageTranslated = await TranslateMessage(
        message.language,
        currentMessage,
      );
      // console.log(messageTranslated)
      this.chatMessages.splice(currentMessageIndex, 1, messageTranslated);
      this.server.emit('messages-old', this.chatMessages);
    }
  }

  @SubscribeMessage('verify-information')
  async handleVerifyInformation(client: any, payload: any) {
    console.log(client);
    const response = await VerifyInformation(payload.message);
    this.server.emit('verify-data', { response, message: payload.message });
  }

  @SubscribeMessage('suggest-message')
  async handleSuggestResponse(client: any) {
    const response = await SuggestResponse(this.chatMessages);
    client.emit('suggest-message', response);
  }

  handleConnection(client: Socket) {
    console.log('client connected ', client.id);
    this.clients.push({
      client,
    });
    client.emit('messages-old', this.chatMessages);
  }

  handleDisconnect(client: any) {
    console.log('client disconnected ', client.id);
    this.clients = this.clients.filter((c) => c.client.id !== client.id);
  }
}
