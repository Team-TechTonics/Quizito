import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, Grid, 
  Button, Chip, Avatar, List, ListItem, 
  ListItemAvatar, ListItemText, IconButton,
  Card, CardContent, LinearProgress, Dialog,
  DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Snackbar, Tooltip
} from '@mui/material';
import {
  PlayArrow, Stop, Share, ContentCopy,
  People, EmojiEvents, Timer, Settings,
  Refresh, ExitToApp, QrCode, Chat,
  VolumeUp, VolumeOff, Visibility,
  CheckCircle, Cancel, MoreVert
} from '@mui/icons-material';
import io from 'socket.io-client';
import { QRCodeCanvas } from "qrcode.react";

const HostDashboard = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [session, setSession] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentState, setCurrentState] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shareDialog, setShareDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Connect to Socket.IO
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Connect to socket
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:10000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    // Join the room
    socketRef.current.emit('join-session', { 
      roomCode, 
      displayName: JSON.parse(localStorage.getItem('user'))?.username 
    });

    // Socket event handlers
    socketRef.current.on('connect', () => {
      console.log('Connected to socket');
    });

    socketRef.current.on('session-data', (data) => {
      setSession(data.session);
      setParticipants(data.session.participants || []);
      setCurrentState(data.session.currentState || {});
      setLoading(false);
    });

    socketRef.current.on('participant-joined', (data) => {
      setParticipants(prev => [...prev, data.participant]);
      setSuccess(`${data.participant.username} joined the session`);
    });

    socketRef.current.on('participant-left', (data) => {
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
    });

    socketRef.current.on('player-ready-update', (data) => {
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId ? { ...p, isReady: data.isReady } : p
      ));
    });

    socketRef.current.on('all-players-ready', () => {
      setSuccess('All players are ready! You can start the quiz.');
    });

    socketRef.current.on('leaderboard-update', (data) => {
      setLeaderboard(data.leaderboard);
    });

    socketRef.current.on('quiz-started', (data) => {
      setCurrentState({
        phase: 'question',
        questionIndex: data.questionIndex,
        timeRemaining: data.timeRemaining
      });
      setSuccess(`Question ${data.questionIndex + 1} started!`);
    });

    socketRef.current.on('question-completed', (data) => {
      setCurrentState(prev => ({ ...prev, phase: 'answer' }));
    });

    socketRef.current.on('next-question', (data) => {
      setCurrentState({
        phase: 'question',
        questionIndex: data.questionIndex,
        timeRemaining: data.timeRemaining
      });
    });

    socketRef.current.on('quiz-completed', (data) => {
      setCurrentState({ phase: 'finished' });
      setLeaderboard(data.finalResults.leaderboard);
      setSuccess('Quiz completed!');
    });

    socketRef.current.on('timer-update', (data) => {
      setCurrentState(prev => ({ ...prev, timeRemaining: data.timeRemaining }));
    });

    socketRef.current.on('chat-message', (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    socketRef.current.on('session-ended-by-host', () => {
      setError('Session ended by host');
      setTimeout(() => navigate('/'), 3000);
    });

    // Load initial data
    fetchSessionData();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomCode, navigate]);

  const fetchSessionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sessions/${roomCode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setSession(data.session);
        setParticipants(data.session.participants || []);
        setCurrentState(data.session.currentState || {});
        
        // Fetch quiz details
        if (data.session.quizId) {
          fetchQuizDetails(data.session.quizId._id);
        }
        
        // Check if session is active
        if (data.isActive) {
          fetchLeaderboard();
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizDetails = async (quizId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/quizzes/${quizId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setQuiz(data.quiz);
      }
    } catch (err) {
      console.error('Failed to fetch quiz:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sessions/${roomCode}/leaderboard`);
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  };

  const startQuiz = () => {
    if (socketRef.current) {
      socketRef.current.emit('start-quiz', { roomCode });
    }
  };

  const endQuiz = async () => {
    if (window.confirm('Are you sure you want to end the quiz?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sessions/${roomCode}/end`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setSuccess('Session ended successfully');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (err) {
        setError('Failed to end session');
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      socketRef.current.emit('chat-message', {
        roomCode,
        message: newMessage
      });
      setNewMessage('');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copied to clipboard!');
    });
  };

  const kickPlayer = (userId) => {
    if (window.confirm('Are you sure you want to remove this player?')) {
      if (socketRef.current) {
        socketRef.current.emit('kick-player', { roomCode, userId });
      }
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'lobby': return 'primary';
      case 'starting': return 'warning';
      case 'question': return 'success';
      case 'answer': return 'info';
      case 'leaderboard': return 'secondary';
      case 'finished': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading host dashboard...</Typography>
      </Container>
    );
  }

  if (error && !session) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/')}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 0 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <People /> Host Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Room: <Chip label={roomCode} color="primary" size="small" /> | 
              Status: <Chip 
                label={currentState.phase || 'lobby'} 
                color={getPhaseColor(currentState.phase)} 
                size="small" 
              />
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={startQuiz}
              disabled={currentState.phase !== 'lobby' || participants.length < 2}
              sx={{ mr: 1 }}
            >
              Start Quiz
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Stop />}
              onClick={endQuiz}
            >
              End Session
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Left Column - Participants & Controls */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <People sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Participants ({participants.length})
                </Typography>
                <List>
                  {participants.map((player, index) => (
                    <ListItem
                      key={player.userId || index}
                      secondaryAction={
                        player.role !== 'host' && (
                          <IconButton edge="end" onClick={() => kickPlayer(player.userId)}>
                            <Cancel />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Avatar src={player.avatar}>
                          {player.username?.[0]?.toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {player.username}
                            {player.role === 'host' && (
                              <Chip label="Host" size="small" color="primary" />
                            )}
                            {player.isReady && (
                              <CheckCircle fontSize="small" color="success" />
                            )}
                          </Box>
                        }
                        secondary={`Score: ${player.score || 0}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Settings sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Quick Actions
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={() => setShareDialog(true)}
                    >
                      Share
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<QrCode />}
                      onClick={() => setShareDialog(true)}
                    >
                      QR Code
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Settings />}
                      onClick={() => setSettingsDialog(true)}
                    >
                      Settings
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={fetchSessionData}
                    >
                      Refresh
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Quiz Info */}
            {quiz && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quiz Information
                  </Typography>
                  <Typography><strong>Title:</strong> {quiz.title}</Typography>
                  <Typography><strong>Category:</strong> {quiz.category}</Typography>
                  <Typography><strong>Difficulty:</strong> {quiz.difficulty}</Typography>
                  <Typography><strong>Questions:</strong> {quiz.questions?.length || 0}</Typography>
                  <Typography><strong>Estimated Time:</strong> {Math.round((quiz.questions?.length || 0) * 30 / 60)} minutes</Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Middle Column - Game State & Leaderboard */}
          <Grid item xs={12} md={4}>
            {/* Game State */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Game State
                </Typography>
                
                {currentState.phase === 'question' && (
                  <>
                    <Typography variant="h5" align="center" gutterBottom>
                      Question {currentState.questionIndex + 1}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Time Remaining
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Timer />
                      <LinearProgress 
                        variant="determinate" 
                        value={(currentState.timeRemaining / 30) * 100} 
                        sx={{ flexGrow: 1 }}
                      />
                      <Typography variant="h6">
                        {currentState.timeRemaining}s
                      </Typography>
                    </Box>
                  </>
                )}

                {currentState.phase === 'answer' && (
                  <Alert severity="info">
                    Showing answers and explanations...
                  </Alert>
                )}

                {currentState.phase === 'finished' && (
                  <Alert severity="success">
                    Quiz completed! Final results are available.
                  </Alert>
                )}

                {currentState.phase === 'lobby' && (
                  <Alert severity="info">
                    Waiting in lobby. Share the room code to invite players.
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <EmojiEvents sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Leaderboard
                </Typography>
                {leaderboard.length > 0 ? (
                  <List>
                    {leaderboard.slice(0, 5).map((player, index) => (
                      <ListItem key={player.userId || index}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#CD7F32' : 'primary.main' }}>
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={player.username}
                          secondary={`Score: ${player.score} | Accuracy: ${player.accuracy?.toFixed(1) || 0}%`}
                        />
                        <Chip label={`#${index + 1}`} size="small" />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" align="center">
                    Leaderboard will appear when game starts
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Chat & Stats */}
          <Grid item xs={12} md={4}>
            {/* Chat */}
            <Card sx={{ mb: 3, height: 300, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  <Chat sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Live Chat
                </Typography>
                <Box sx={{ height: 200, overflow: 'auto', mb: 2 }}>
                  {chatMessages.map((msg, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {msg.username}:
                      </Typography>
                      <Typography variant="body2">
                        {msg.message}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Grid container spacing={1}>
                  <Grid item xs={10}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Button fullWidth variant="contained" onClick={sendMessage}>
                      Send
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card>

            {/* Session Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Session Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {participants.length}
                      </Typography>
                      <Typography variant="caption">Players</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary">
                        {quiz?.questions?.length || 0}
                      </Typography>
                      <Typography variant="caption">Questions</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {Math.round(participants.filter(p => p.isReady).length / participants.length * 100) || 0}%
                      </Typography>
                      <Typography variant="caption">Ready</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {currentState.timeRemaining || 0}s
                      </Typography>
                      <Typography variant="caption">Time/Question</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onClose={() => setShareDialog(false)}>
        <DialogTitle>Share Room</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Share this room code with players:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              value={roomCode}
              InputProps={{ readOnly: true }}
            />
            <IconButton onClick={() => copyToClipboard(roomCode)}>
              <ContentCopy />
            </IconButton>
          </Box>
          <Typography gutterBottom>
            Or share this link:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              value={`${window.location.origin}/join/${roomCode}`}
              InputProps={{ readOnly: true }}
            />
            <IconButton onClick={() => copyToClipboard(`${window.location.origin}/join/${roomCode}`)}>
              <ContentCopy />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <QRCode value={`${window.location.origin}/join/${roomCode}`} size={150} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)}>
        <DialogTitle>Session Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Room Name"
                defaultValue={session?.name}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Players"
                defaultValue={session?.settings?.maxPlayers || 100}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Time per Question (seconds)"
                defaultValue={session?.settings?.questionTime || 30}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
          <Button variant="contained">Save Settings</Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HostDashboard;