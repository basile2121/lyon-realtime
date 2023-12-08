import type { Socket } from 'dgram';
import { useEffect, useState } from 'react';

export interface IMessage {
  username: string;
  content: string;
  timeSent: string;
}

interface Props {
  message: IMessage;
  isMe: boolean;
  socket: Socket;
}

const Message = ({ message, isMe, socket }: Props) => {
  const [verificationData, setVerificationData] = useState('');
  const [infoStatus, setInfoStatus] = useState<
    'true' | 'false' | 'unverifiable'
  >();
  const langages = [
    'French',
    'English',
    'German',
    'Chinese',
    'Japanese',
    'Arabic',
    'Norvegian',
    'Spanish',
    'Italian',
    'Russian',
  ];

  const handleTranslate = (msg: any, language: any) => {
    socket.emit('translate-message', { msg, language });
  };

  const handleVerify = () => {
    socket.emit('verify-information', { message });
  };

  const formattedTime = (timeStamp: string) => {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    const date = new Date(timeStamp);
    return date.toLocaleString('fr-FR', options);
  };

  useEffect(() => {
    socket.on('verify-data', (data) => {
      if (data.message.timeSent === message.timeSent) {
        setVerificationData(data.response);
        if (data.response.includes("This information can't be verified")) {
          setInfoStatus('unverifiable');
        }
        if (data.response.includes('True')) {
          setInfoStatus('true');
        }
        if (data.response.includes('False')) {
          setInfoStatus('false');
        }
      }
    });
  }, []);

  return (
    <div className="mx-5 flex flex-col gap-4">
      <div className="flex items-center">
        <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-500">
          <strong>
            {message.username && message.username.substring(0, 2)}
          </strong>
        </div>
        <div className="flex w-full flex-col">
          <div className="mb-1 rounded-lg bg-gray-700 px-4 py-2">
            <span className="text-sm text-white">{message.username}</span>
            <span className="mx-1" />
            <span className="text-xs text-gray-400">
              {formattedTime(message.timeSent)}
            </span>
          </div>
          <div className="flex justify-between overflow-x-auto rounded-lg bg-gray-900 px-4 py-2">
            <span className="max-w-full text-white">{message.content}</span>
            <div className="flex">
              <select
                className="select select-bordered mr-3 text-black"
                onChange={(e) => handleTranslate(message, e.target.value)}
              >
                <option disabled selected>
                  Traduire
                </option>
                {langages.map((option) => (
                  <option key={option} className="text-black" value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                className="rounded border border-pink-500 bg-pink-500 px-2 py-1 text-white transition duration-300 ease-in-out hover:bg-pink-600"
                onClick={handleVerify}
              >
                Vérifier
              </button>
            </div>
          </div>
        </div>
      </div>
      {infoStatus && (
        <div className="flex items-center">
          <div
            className={`mr-3 rounded-lg ${
              // eslint-disable-next-line no-nested-ternary
              infoStatus === 'true'
                ? 'bg-green-500'
                : infoStatus === 'false'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
            } px-4 py-2 text-white`}
          >
            {/* eslint-disable-next-line no-nested-ternary */}
            {infoStatus === 'true'
              ? 'Verified Information'
              : infoStatus === 'false'
                ? 'Unverified Information'
                : 'Information Cannot Be Verified'}
          </div>
        </div>
      )}
      {verificationData && (
        <div
          className={`flex items-center ${
            isMe ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`mr-3 rounded-lg ${
              isMe ? 'bg-blue-500' : 'bg-gray-700'
            } px-4 py-2 text-white`}
          >
            {verificationData}
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
