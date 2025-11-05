import Controls from "./controls/Controls";
import { useState, useRef, useContext, useEffect } from "react";
import Webcam from "react-webcam";
import { DashboardStateContext } from "../../Utils/DashboardStateProvider";
import Chat from './Chat/Chat';
import DualChat from './Chat/DualChat';
import Participants from "./Participants/Participants";
import InviteParticipant from "./Settings/InviteParticipant";
import { useMeetingRoom } from "../../hooks/useMeetingRoom";
import { useMediaControls } from "../../hooks/useMediaControls";
import MeetingLinkBanner from "./MeetingLinkBanner";
import ErrorModal from "../ErrorModal/ErrorModal";
import NamePromptModal from "../NamePromptModal/NamePromptModal";
import { API_ENDPOINTS } from "../../Utils/apiConfig";
import "./Dashboard.css";

const Dashboard = () => {
  console.log('🎬 Dashboard component rendering...');

  // Helper function to determine grid layout class based on participant count
  const getGridClass = (totalParticipants) => {
    if (totalParticipants <= 1) return 'single-participant';
    if (totalParticipants === 2) return 'two-participants';
    if (totalParticipants === 3) return 'three-participants';
    if (totalParticipants === 4) return 'four-participants';
    return 'many-participants';
  };

  const { isCameraActive, setCameraActive } = useContext(DashboardStateContext);
  const { isChatBoxActive, setChatBoxActive } = useContext(DashboardStateContext);
  const { isParticipantsActive, setParticipantsActive } = useContext(DashboardStateContext);
  const { isInviteParticipant, setInviteParticipant } = useContext(DashboardStateContext);
  const { addParticipant, localStream, remoteStreams, participantMediaStates, connectionStatuses, roomId, userName, participantsList, setUserName } = useContext(DashboardStateContext);
  
  const { initializeMeeting, getMeetingLink, copyMeetingLink } = useMeetingRoom();
  
  // Initialize media controls
  useMediaControls();
  
  const webcamRef = useRef(null);
  const localVideoRef = useRef(null);
  let [isOpen, setIsOpen] = useState(true);
  const [meetingInitialized, setMeetingInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isJoiningViaLink, setIsJoiningViaLink] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [browserError, setBrowserError] = useState('');

  // Detect mobile devices and check browser support
  useEffect(() => {
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);

    // Comprehensive browser support check with debugging
    const hasWebRTC = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
    const hasGetUserMedia = !!(navigator.mediaDevices?.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    
    // Check if accessing from secure context or local network
    const isLocalNetworkIP = () => {
      const hostname = window.location.hostname;
      // Check for local IP ranges
      const localIPRegex = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
      const isLocal = localIPRegex.test(hostname);
      console.log('🔍 Local Network IP Check:');
      console.log('- Hostname:', hostname);
      console.log('- Regex test result:', isLocal);
      console.log('- Regex pattern:', localIPRegex.toString());
      return isLocal;
    };
    
    const isSecure = window.location.protocol === 'https:' ||
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname.includes('ngrok') ||
                    window.location.hostname.includes('localhost') ||
                    isLocalNetworkIP();

    console.log('🔍 Dashboard Browser Check:');
    console.log('- Protocol:', window.location.protocol);
    console.log('- Hostname:', window.location.hostname);
    console.log('- WebRTC Support:', hasWebRTC);
    console.log('- getUserMedia Support:', hasGetUserMedia);
    console.log('- Secure Context:', isSecure);

    if (!hasWebRTC) {
      setBrowserSupported(false);
      setBrowserError('WebRTC is not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.');
    } else if (!hasGetUserMedia) {
      setBrowserSupported(false);
      setBrowserError('Camera and microphone access is not available in this browser.');
    } else if (!isSecure) {
      setBrowserSupported(false);
      setBrowserError('HTTPS is required for camera/microphone access. Please use HTTPS or localhost.');
    } else {
      // All checks passed
      setBrowserSupported(true);
      console.log('✅ Browser compatibility check passed');
    }
  }, []);

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const webcamStyle = {
    width: '100%',
    height: '100%',
  };

  // Auto-generate user name if none exists
  useEffect(() => {
    if (!userName && !showNamePrompt) {
      const userName = `User-${Math.random().toString(36).substr(2, 6)}`;
      setUserName(userName);
      console.log(`👤 Auto-generated username: ${userName}`);
    }
  }, [userName, showNamePrompt]);

  // Check if joining via link (URL has room ID)
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/room\/([^\/]+)/);
    const urlRoomId = match ? match[1] : null;
    
    console.log('🔍 Dashboard useEffect - URL Room ID:', urlRoomId);
    console.log('🔍 Current userName:', userName);
    console.log('🔍 Meeting initialized:', meetingInitialized);
    
    if (urlRoomId && !userName && !isJoiningViaLink) {
      console.log('🚪 Showing name prompt for better UX');
      setIsJoiningViaLink(true);
      setShowNamePrompt(true);
    } else if (!meetingInitialized && userName) {
      console.log('🚀 Initializing meeting with name:', userName);
      initializeMeeting().catch(error => {
        console.error('Failed to initialize meeting:', error);
        setError(error);
        setShowErrorModal(true);
      });
      setMeetingInitialized(true);
    }
  }, [meetingInitialized, initializeMeeting, userName, isJoiningViaLink]);

  // Separate cleanup effect that runs only on unmount
  useEffect(() => {
    return () => {
      console.log('🚪 Dashboard unmounting, cleaning up...');
      
      // Get room and user data from location state or context
      const locationState = window.history.state?.usr;
      const currentRoomId = roomId || locationState?.roomId;
      const currentUserId = locationState?.userId;
      
      if (currentRoomId && currentUserId) {
        // Notify server that user is leaving
        fetch(API_ENDPOINTS.ROOM_LEAVE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: currentRoomId,
            userId: currentUserId
          }),
          keepalive: true // Ensure request completes even if page is closing
        }).catch(error => {
          console.error('Failed to notify server of room leave:', error);
        });
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Handle name submission from prompt
  const handleNameSubmit = (name) => {
    setUserName(name);
    setShowNamePrompt(false);
    initializeMeeting(name).catch(error => {
      console.error('Failed to initialize meeting:', error);
      setError(error);
      setShowErrorModal(true);
    });
  };

  // Update local video element when stream is available
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream])
  return (
    <>
      <NamePromptModal 
        isOpen={showNamePrompt} 
        onSubmit={handleNameSubmit}
        roomId={roomId}
      />
      <ErrorModal 
        isOpen={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
        error={error} 
      />

      {/* Browser Compatibility Warning */}
      {!browserSupported && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Browser Not Supported</h2>
            <p className="text-gray-600 mb-4">{browserError}</p>
            <div className="text-sm text-gray-500 mb-4">
              <p className="font-medium mb-2">Recommended browsers:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Chrome (Desktop/Mobile)</div>
                <div>Firefox (Desktop/Mobile)</div>
                <div>Safari (iOS/Mac)</div>
                <div>Edge (Desktop)</div>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Meeting Link Banner */}
        <MeetingLinkBanner 
          roomCode={roomId}
          meetingId={window.history.state?.usr?.meetingId}
          roomName={window.history.state?.usr?.roomName || `${userName}'s Meeting`}
          hostName={window.history.state?.usr?.hostName || userName}
          meetingLink={roomId ? `${window.location.origin}/room/${roomId}` : `${window.location.origin}/room/default`}
        />
        
        <div className="relative z-10 flex h-screen">
          {/* Sidebar */}
          {(isChatBoxActive || isParticipantsActive) && (
            <div className="w-80 bg-white/10 backdrop-blur-lg border-r border-white/20 shadow-2xl">
              <div className="h-full flex flex-col">
                {isChatBoxActive && <DualChat />}
                {isParticipantsActive && <Participants />}
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div className={`flex-1 flex flex-col ${isParticipantsActive || isChatBoxActive ? "" : ""}`}>
            {/* Video Grid */}
            <div className="flex-1 overflow-hidden">
              <div className={`video-grid ${getGridClass(participantsList.length + 1)}`}>
                {/* Local Video - You */}
                <div className="video-container">
                  <div className="h-full w-full">
                    {localStream && isCameraActive ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={webcamStyle}
                        className="w-full h-full object-cover mirror-video"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        {isMobile && !localStream ? (
                          <div className="space-y-6">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
                              </svg>
                            </div>
                            <div>
                              <h3 className='text-white text-xl font-semibold mb-2'>Camera Access Needed</h3>
                              <p className='text-gray-300 text-sm mb-6'>Tap "Allow" when prompted for camera and microphone access</p>
                              <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg"
                              >
                                Request Permissions
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
                              </svg>
                            </div>
                            <div>
                              <h3 className='text-white text-lg font-medium'>Camera is off</h3>
                              <p className='text-gray-400 text-sm mt-2'>Click the camera icon below to turn it on</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* User Info Overlay */}
                  <div className="participant-label">
                    <span className="status-indicator"></span>
                    <span>{userName || 'User'}</span>
                    <span className="text-gray-300 ml-1">(Host)</span>
                  </div>
                </div>

                    {/* Remote Videos - Other Participants */}
                    {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
                      <RemoteVideo
                        key={userId}
                        userId={userId}
                        stream={stream}
                        participantsList={useContext(DashboardStateContext).participantsList}
                        mediaState={participantMediaStates.get(userId)}
                        connectionStatus={connectionStatuses.get(userId)}
                      />
                    ))}

                    {/* Debug Info */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
                        <div className="font-bold mb-2">🔧 Debug Info</div>
                        <div>Remote Streams: {remoteStreams.size}</div>
                        <div>Participants: {participantsList.length}</div>
                        <div>Room ID: {roomId}</div>
                        <div>User Name: {userName}</div>
                        <div className="mt-2">
                          <div className="font-semibold">Connection States:</div>
                          {Array.from(connectionStatuses.entries()).map(([id, status]) => (
                            <div key={id} className="ml-2 text-xs">
                              {id.slice(-8)}: {status.connected ? '✅ connected' : '❌ disconnected'} 
                              {status.error && <span className="text-red-400"> ({status.error.slice(0, 20)}...)</span>}
                              {status.quality && <span className="text-blue-400"> ({status.quality})</span>}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <div className="font-semibold">Participants List:</div>
                          {participantsList.map((p, i) => (
                            <div key={i} className="ml-2 text-xs">
                              {p.name} {p.host ? '(Host)' : ''} ({p.userId?.slice(-8) || 'no-id'})
                            </div>
                          ))}
                        </div>
                        {remoteStreams.size === 0 && participantsList.length > 1 && (
                          <div className="mt-2 text-yellow-400 text-xs">
                            ⚠️ No remote streams despite {participantsList.length} participants
                          </div>
                        )}
                      </div>
                    )}
                
                {/* Placeholder if no remote participants */}
                {remoteStreams.size === 0 && (
                  <div className="video-container">
                    <div className="h-full w-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm">
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className='text-white text-xl font-semibold mb-2'>Waiting for participants</h3>
                        <p className='text-gray-300 text-sm'>Share the meeting link to invite others</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Controls */}
            <div className="controls-container flex-shrink-0 p-6">
              <Controls />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Remote Video Component
const RemoteVideo = ({ userId, stream, participantsList, mediaState, connectionStatus }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Find participant name
  const participant = participantsList?.find(p => p.userId === userId);
  const participantName = participant?.name || `User-${userId.slice(-6)}`;
  const isCameraOn = mediaState?.cameraOn !== false;
  const isMicOn = mediaState?.micOn !== false;
  const connectionQuality = connectionStatus?.quality || 'unknown';
  const isConnected = connectionStatus?.connected || false;

  return (
    <div className="video-container">
      <div className="h-full w-full">
        {isCameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%' }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 bg-gradient-to-br from-blue-500 to-purple-600">
              {participantName.charAt(0).toUpperCase()}
            </div>
            <h3 className='text-white text-lg font-medium mb-2'>{participantName}</h3>
            <p className='text-gray-400 text-sm'>Camera is off</p>
          </div>
        )}
      </div>
      
      {/* User Info Overlay */}
      <div className="participant-label">
        {/* Connection status indicator */}
        <span className={`status-indicator ${
          isConnected 
            ? (connectionQuality === 'good' ? 'bg-green-500' : 'bg-yellow-500') 
            : 'bg-red-500'
        }`} title={`Connection: ${connectionQuality}`}></span>
        <span>{participantName}</span>
        {!isMicOn && (
          <svg className="w-4 h-4 text-red-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default Dashboard;