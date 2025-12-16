import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';

const Chat = ({ messages = [], onSendMessage, disabled = false, currentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && !disabled) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8 flex flex-col items-center">
            <MessageSquare size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.userId === (currentUser?.id || currentUser?._id);
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-1 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-xs font-bold text-gray-600">{msg.username}</span>
                  {msg.isHost && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">HOST</span>
                  )}
                  <span className="text-[10px] text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`px-3 py-2 rounded-xl max-w-[85%] break-words shadow-sm text-sm ${isMe
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : msg.isHost
                        ? 'bg-blue-50 border border-blue-200 text-gray-800 rounded-tl-none'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                >
                  {msg.message || msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={disabled ? "Chat disabled" : "Type a message..."}
            disabled={disabled}
            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
