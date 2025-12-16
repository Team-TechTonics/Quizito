// src/services/socketService.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:10000';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    /**
     * Connect to socket server
     */
    connect(token) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected');
            this.connected = true;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.socket;
    }

    /**
     * Disconnect from socket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    /**
     * Check if socket is connected
     */
    isConnected() {
        return this.connected && this.socket?.connected;
    }

    // ============ Friend Events ============

    onFriendRequest(callback) {
        this.socket?.on('friend:request', callback);
    }

    onFriendAccepted(callback) {
        this.socket?.on('friend:accepted', callback);
    }

    onFriendDeclined(callback) {
        this.socket?.on('friend:declined', callback);
    }

    onFriendRemoved(callback) {
        this.socket?.on('friend:removed', callback);
    }

    // ============ Challenge Events ============

    onChallengeReceived(callback) {
        this.socket?.on('challenge:received', callback);
    }

    onChallengeAccepted(callback) {
        this.socket?.on('challenge:accepted', callback);
    }

    onChallengeDeclined(callback) {
        this.socket?.on('challenge:declined', callback);
    }

    onChallengeCompleted(callback) {
        this.socket?.on('challenge:completed', callback);
    }

    // ============ Activity Events ============

    onNewActivity(callback) {
        this.socket?.on('activity:new', callback);
    }

    onActivityLiked(callback) {
        this.socket?.on('activity:liked', callback);
    }

    onActivityCommented(callback) {
        this.socket?.on('activity:commented', callback);
    }

    // ============ Online Status ============

    emitOnlineStatus() {
        this.socket?.emit('status:online');
    }

    emitOfflineStatus() {
        this.socket?.emit('status:offline');
    }

    onFriendStatusChange(callback) {
        this.socket?.on('friend:status', callback);
    }

    // ============ Quiz Events ============

    joinQuizRoom(quizId) {
        this.socket?.emit('quiz:join', { quizId });
    }

    leaveQuizRoom(quizId) {
        this.socket?.emit('quiz:leave', { quizId });
    }

    onQuizUpdate(callback) {
        this.socket?.on('quiz:update', callback);
    }

    // ============ Host Session Methods ============

    joinSession(roomCode, displayName) {
        this.socket?.emit('join-session', { roomCode, displayName });
    }

    startQuiz(roomCode) {
        this.socket?.emit('start-quiz', { roomCode });
    }

    nextQuestionForce(roomCode) {
        this.socket?.emit('next-question-force', { roomCode });
    }

    endSession(roomCode) {
        this.socket?.emit('end-session', { roomCode });
    }

    submitAnswer(data) {
        this.socket?.emit('submit-answer', data);
    }

    kickPlayer(roomCode, userId) {
        this.socket?.emit('kick-player', { roomCode, userId });
    }

    // ============ Host Session Events ============

    onParticipantJoined(callback) {
        this.socket?.on('participant-joined', callback);
    }

    onParticipantDisconnected(callback) {
        this.socket?.on('participant-disconnected', callback);
    }

    onPlayerReadyUpdate(callback) {
        this.socket?.on('player-ready-update', callback);
    }

    onAllPlayersReady(callback) {
        this.socket?.on('all-players-ready', callback);
    }

    onCountdown(callback) {
        this.socket?.on('countdown', callback);
    }

    onQuizStarted(callback) {
        this.socket?.on('quiz-started', callback);
    }

    onTimerUpdate(callback) {
        this.socket?.on('timer-update', callback);
    }

    onNextQuestion(callback) {
        this.socket?.on('next-question', callback);
    }

    onQuestionCompleted(callback) {
        this.socket?.on('question-completed', callback);
    }

    onQuestionTimeUp(callback) {
        this.socket?.on('question-time-up', callback);
    }

    onQuizCompleted(callback) {
        this.socket?.on('quiz-completed', callback);
    }

    onLeaderboardUpdate(callback) {
        this.socket?.on('leaderboard-update', callback);
    }

    onSessionEndedByHost(callback) {
        this.socket?.on('session-ended-by-host', callback);
    }

    toggleChat(roomCode, enabled) {
        this.socket?.emit('toggle-chat', { roomCode, enabled });
    }

    onChatToggled(callback) {
        this.socket?.on('chat-toggled', callback);
    }

    // ============ Cleanup ============

    removeAllListeners() {
        this.socket?.removeAllListeners();
    }

    off(event, callback) {
        this.socket?.off(event, callback);
    }

    // ============ Chat Events ============

    onChatMessage(callback) {
        this.socket?.on('chat-message', callback);
    }

    sendChatMessage(data) {
        this.socket?.emit('send-message', data);
    }

}

export default new SocketService();
