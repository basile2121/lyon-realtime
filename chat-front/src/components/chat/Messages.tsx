import { useEffect, useRef } from 'react';

import type { IMessage } from './Message';
import Message from './Message';

interface Props {
  messages: IMessage[];
  username: string;
  socket: any;
}
const Messages = ({ messages, username, socket }: Props) => {
  const messagesContainerRef: any = useRef(null);
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-1000px w-7/8 overflow-auto rounded-lg bg-gray-900 p-3 shadow-md">
      {messages.map((msg) => (
        <div
          key={msg.timeSent}
          className={`mb-4 rounded-lg p-4 ${
            msg.username === username
              ? 'self-end bg-blue-500 text-white'
              : 'bg-green-400 text-black'
          }`}
        >
          <Message
            message={msg}
            isMe={msg.username === username}
            socket={socket}
          />
        </div>
      ))}
    </div>
  );
};

export default Messages;
