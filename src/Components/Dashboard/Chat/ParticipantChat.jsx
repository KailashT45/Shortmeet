import { useState, useEffect, useRef, useContext } from 'react';
import { DashboardStateContext } from '../../../Utils/DashboardStateProvider';
import { getSocket } from '../../../Utils/socket';

const ParticipantChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { roomId, userId, userName } = useContext(DashboardStateContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    const socket = getSocket();
    
    const handleMessage = (data) => {
      console.log('💬 Received chat message:', data);
      // Only add if it's from someone else
      if (data.userId !== userId) {
        console.log('💬 Adding message from other user:', data.userName);
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(), // Unique ID
          userId: data.userId,
          userName: data.userName || `User-${data.userId.slice(-6)}`,
          message: data.message,
          timestamp: data.timestamp,
          isOwn: false
        }]);
      } else {
        console.log('💬 Ignoring message from self');
      }
    };
    
    socket.on('receive-message', handleMessage);

    return () => {
      socket.off('receive-message', handleMessage);
    };
  }, [userId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const socket = getSocket();
    const messageData = {
      roomId,
      userId,
      userName: userName || `User-${userId.slice(-6)}`,
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    console.log('💬 Sending chat message:', messageData);

    // Add message locally first (optimistic update)
    setMessages(prev => [...prev, {
      id: Date.now(),
      userId: userId,
      userName: userName || `User-${userId.slice(-6)}`,
      message: inputMessage,
      timestamp: messageData.timestamp,
      isOwn: true
    }]);

    // Send to server (will broadcast to others only)
    socket.emit('send-message', messageData);
    console.log('💬 Message sent to server');
    setInputMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          Participant Chat
        </h2>
        <p className="text-sm text-gray-400 mt-1">Chat with meeting participants</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-center">No messages yet</p>
            <p className="text-sm text-center mt-2">Start a conversation with participants</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                style={msg.isOwn ? {background: 'linear-gradient(to right, #39603D, #9DC88D)'} : {}}
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.isOwn
                    ? 'text-white'
                    : 'glass-effect text-gray-100'
                }`}
              >
                {!msg.isOwn && (
                  <p className="text-xs font-semibold text-blue-400 mb-1">
                    {msg.userName}
                  </p>
                )}
                <p className="text-sm break-words">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-7 py-4.5 rounded-xl glass-effect text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            style={{background: 'linear-gradient(to right, #39603D, #9DC88D)'}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParticipantChat;
