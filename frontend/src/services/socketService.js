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

    joinSession(roomCode, displayName, callback) {
        this.socket?.emit('join-session', { roomCode, displayName }, callback);
    }

    startQuiz(roomCode, callback) {
        this.socket?.emit('start-quiz', { roomCode }, callback);
    }

    nextQuestionForce(roomCode) {
        this.socket?.emit('next-question-force', { roomCode });
    }

    endSession(roomCode) {
        this.socket?.emit('end-session', { roomCode });
    }

    submitAnswer(data, callback) {
        this.socket?.emit('submit-answer', data, callback);
    }

    kickPlayer(roomCode, userId, callback) {
        this.socket?.emit('kick-player', { roomCode, userId }, callback);
    }

    // ============ NEW: Enhanced Quiz Controls ============

    pauseQuiz(roomCode, callback) {
        this.socket?.emit('pause-quiz', { roomCode }, callback);
    }

    resumeQuiz(roomCode, callback) {
        this.socket?.emit('resume-quiz', { roomCode }, callback);
    }

    lockRoom(roomCode, callback) {
        this.socket?.emit('lock-room', { roomCode }, callback);
    }

    unlockRoom(roomCode, callback) {
        this.socket?.emit('unlock-room', { roomCode }, callback);
    }

    extendTimer(roomCode, seconds, callback) {
        this.socket?.emit('extend-timer', { roomCode, seconds }, callback);
    }

    skipQuestion(roomCode, callback) {
        this.socket?.emit('skip-question', { roomCode }, callback);
    }

    showAnswerNow(roomCode, callback) {
        this.socket?.emit('show-answer-now', { roomCode }, callback);
    }

    banPlayer(roomCode, userId, callback) {
        this.socket?.emit('ban-player', { roomCode, userId }, callback);
    }

    mutePlayerChat(roomCode, userId, callback) {
        this.socket?.emit('mute-player-chat', { roomCode, userId }, callback);
    }

    unmutePlayerChat(roomCode, userId, callback) {
        this.socket?.emit('unmute-player-chat', { roomCode, userId }, callback);
    }

    sendAnnouncement(roomCode, message, callback) {
        this.socket?.emit('send-announcement', { roomCode, message }, callback);
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

    // ============ NEW: Enhanced Quiz Control Events ============

    onQuizPaused(callback) {
        this.socket?.on('quiz-paused', callback);
    }

    onQuizResumed(callback) {
        this.socket?.on('quiz-resumed', callback);
    }

    onRoomLocked(callback) {
        this.socket?.on('room-locked', callback);
    }

    onRoomUnlocked(callback) {
        this.socket?.on('room-unlocked', callback);
    }

    onTimerExtended(callback) {
        this.socket?.on('timer-extended', callback);
    }

    onAnswerRevealed(callback) {
        this.socket?.on('answer-revealed', callback);
    }

    onPlayerBanned(callback) {
        this.socket?.on('player-banned', callback);
    }

    onChatMuted(callback) {
        this.socket?.on('chat-muted', callback);
    }

    onChatUnmuted(callback) {
        this.socket?.on('chat-unmuted', callback);
    }

    onAnnouncement(callback) {
        this.socket?.on('announcement', callback);
    }

    // ============ Cleanup ============

    removeAllListeners() {
        this.socket?.removeAllListeners();
    }

    on(event, callback) {
        this.socket?.on(event, callback);
    }

    off(event, callback) {
        this.socket?.off(event, callback);
    }

    // ============ Chat Events ============

    onChatMessage(callback) {
        this.socket?.on('chat-message', callback);
    }

    sendChatMessage(data) {
        this.socket?.emit('chat-message', data);
    }

}

export default new SocketService();
