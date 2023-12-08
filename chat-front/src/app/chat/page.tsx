'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import Messages from '@/components/chat/Messages';
import SendMessage from '@/components/chat/SendMessage';
import Username from '@/components/chat/Username';

const socket = io('http://localhost:3000', {
  autoConnect: false,
});

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [suggestions, setMessagesSuggestions] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      console.log('connected', socket.id);
    });

    socket.on('messages-old', (data) => {
      setMessages((msg) => [msg, ...data] as any);
    });

    socket.on('chat-message', (data) => {
      setMessages((msg) => [...msg, data] as any);
    });
    socket.on('suggest-message', (data) => {
      setMessagesSuggestions(JSON.parse(data).possibilities);
      setLoader(false);
    });
  }, []);

  const handleSuggestMessage = () => {
    setLoader(true);
    socket.emit('suggest-message', { username });
  };

  const handleSendSuggestMessage = (message: any) => {
    socket.emit('chat-message', {
      username,
      content: message,
      timeSent: new Date().toISOString(),
    });
    setMessagesSuggestions([]);
  };

  return (
    <div>
      {!username && (
        <div className="flex justify-center">
          <Username socket={socket} setUsername={setUsername} />
        </div>
      )}
      {username && (
        <div className="flex">
          <div className="flex w-1/5 flex-col items-center border-r border-gray-300 p-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Menu Utilisateur</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center">
                <span className="text-1xl font-bold">Nom de connexion :</span>
                <span className="ml-2">{username}</span>
              </div>
              <div className="flex justify-center">
                {username && (
                  <SendMessage socket={socket} username={username} />
                )}
              </div>
              {loader && (
                <span className="loading loading-spinner loading-md" />
              )}
              {suggestions.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-1xl font-bold">Suggestions : </h2>
                  <div className="flex flex-col gap-3">
                    {suggestions.map((message) => (
                      <button
                        key={message}
                        className="btn btn-primary text-xs"
                        onClick={() => handleSendSuggestMessage(message)}
                      >
                        {message}
                      </button>
                    ))}
                    <button
                      className="btn btn-error text-xs"
                      onClick={() => setMessagesSuggestions([])}
                    >
                      X
                    </button>
                  </div>
                </div>
              )}
              {suggestions.length === 0 && (
                <button className="btn btn-info" onClick={handleSuggestMessage}>
                  Suggérer une réponse
                </button>
              )}
            </div>
          </div>

          <div className="w-4/5 bg-gray-600 p-4">
            <Messages messages={messages} username={username} socket={socket} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
