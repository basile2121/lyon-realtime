import { useState } from 'react';
import type { Socket } from 'socket.io-client';

interface Props {
  socket: Socket;
  setUsername: (username: string) => void;
}

const Username = ({ socket, setUsername }: Props) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsername(text);
    socket.emit('username-set', {
      username: text,
    });
  };

  return (
    <div className="flex h-full items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <h2 className="mb-3 text-xl">Entrer votre nom d&apos;utilisateur</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nom d'utilisateur"
            className="rounded-md border-2 border-gray-400 bg-yellow-200 px-4 py-2 text-black placeholder:text-gray-700 focus:border-purple-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-purple-500 px-4 py-2 text-white shadow-md transition duration-300 hover:shadow-xl"
          >
            Se connecter
          </button>
        </div>
      </form>
    </div>
  );
};

export default Username;
