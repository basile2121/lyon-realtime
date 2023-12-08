'use client';

import { useState } from 'react';
import type { Socket } from 'socket.io-client';

interface Props {
  socket: Socket;
  username: string;
}

const SendMessage = ({ socket, username }: Props) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit('chat-message', {
      username,
      content: text,
      timeSent: new Date().toISOString(),
    });

    setText('');
  };
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ecrivez votre message..."
        className="w-64 rounded-md border-2 border-gray-400 bg-yellow-200 px-4 py-3 text-black placeholder:text-gray-700 focus:border-purple-500 focus:outline-none"
      />
      <button
        type="submit"
        className="flex items-center rounded-md bg-purple-500 px-4 py-3 text-white shadow-md transition duration-300 hover:shadow-xl"
      >
        Envoyer{' '}
        <span role="img" aria-label="Send">
          📩
        </span>
      </button>
    </form>
  );
};

export default SendMessage;
