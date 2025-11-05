import { useState } from 'react';
import ParticipantChat from './ParticipantChat';
import GlobalSearchAI from './GlobalSearchAI';

const DualChat = () => {
  const [activeTab, setActiveTab] = useState('participants'); // 'participants' or 'global'

  return (
    <div className="flex flex-col h-full">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 py-4 px-4 font-semibold transition-all duration-300 relative ${
            activeTab === 'participants'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <span>Participants</span>
          </div>
          {activeTab === 'participants' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-full"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-4 px-4 font-semibold transition-all duration-300 relative ${
            activeTab === 'global'
              ? 'text-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>AI Search</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              NEW
            </span>
          </div>
          {activeTab === 'global' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'participants' ? (
          <ParticipantChat />
        ) : (
          <GlobalSearchAI />
        )}
      </div>
    </div>
  );
};

export default DualChat;
