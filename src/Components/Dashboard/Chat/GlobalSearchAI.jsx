import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GlobalSearchAI = () => {
  // Your working Gemini API key from chartbot
  const GEMINI_API_KEY = "AIzaSyDdoCQrg78Le-hDJtqKAjJ0tGYYf7tbY6g";
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: "👋 Hello! I'm your AI-powered global search assistant. I can help you find information about anything in the world. Try asking me:\n\n• \"What's the weather in New York?\"\n• \"Tell me about quantum computing\"\n• \"Latest news on AI technology\"\n• \"How to learn React?\"\n\nWhat would you like to know?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchGlobally = async (query) => {
    setIsLoading(true);
    
    try {
      console.log('[Global Search] Sending query directly to Gemini:', query);
      
      // Direct Gemini API call (same as chartbot)
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        method: 'post',
        data: {
          contents: [
            {
              parts: [
                {
                  text: query
                }
              ]
            }
          ]
        }
      });

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      console.log('[Global Search] Response received successfully');
      
      return aiResponse;
      
    } catch (error) {
      console.error('[Global Search] Error:', error);
      
      if (error.response?.status === 429 || error.message.includes('RESOURCE_EXHAUSTED')) {
        return `⏱️ **API Rate Limit Reached**\n\nThe free tier allows 15 requests per minute.\n\nPlease wait 10-15 seconds and try again.`;
      }
      
      if (error.response?.status === 403 || error.response?.status === 401) {
        return `🔑 **Invalid API Key**\n\nThe API key may have expired.\n\nPlease:\n1. Visit https://aistudio.google.com/app/apikey\n2. Create a NEW key\n3. Update the key in GlobalSearchAI.jsx`;
      }
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        return `🌐 **Network Error**\n\nCannot connect to Gemini API.\n\nCheck your internet connection and try again.`;
      }
      
      return `❌ **Search Error**\n\n${error.message}\n\nTry again in a moment.`;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputMessage;
    setInputMessage('');

    // Show typing indicator
    const typingMessage = {
      id: Date.now() + 1,
      type: 'ai',
      message: 'Searching globally...',
      isTyping: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, typingMessage]);

    // Get AI response
    const aiResponse = await searchGlobally(query);

    // Remove typing indicator and add real response
    setMessages(prev => {
      const filtered = prev.filter(msg => !msg.isTyping);
      return [...filtered, {
        id: Date.now() + 2,
        type: 'ai',
        message: aiResponse,
        timestamp: new Date().toISOString()
      }];
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const quickSearches = [
    "What's trending today?",
    "Latest tech news",
    "Weather forecast",
    "How to improve productivity?"
  ];

  const handleQuickSearch = (query) => {
    setInputMessage(query);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          Global AI Search
        </h2>
        <p className="text-sm text-gray-600 mt-1">Search anything worldwide with AI</p>
      </div>

      {/* Quick Search Buttons */}
      {messages.length === 1 && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 mb-2 font-medium">Quick searches:</p>
          <div className="flex flex-wrap gap-2">
            {quickSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleQuickSearch(search)}
                className="px-3 py-1.5 text-xs rounded-full bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 transition-all duration-300 font-medium"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
              }`}
            >
              {msg.type === 'ai' && !msg.isTyping && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-purple-600">AI Assistant</span>
                </div>
              )}
              
              {msg.isTyping ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                  <span className="text-sm text-gray-600">Searching...</span>
                </div>
              ) : (
                <>
                  <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-xs mt-2 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-7 py-4.5 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          💡 Tip: Ask about current events, facts, how-to guides, or any topic!
        </p>
      </form>
    </div>
  );
};

export default GlobalSearchAI;
