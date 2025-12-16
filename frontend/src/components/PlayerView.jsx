import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, Grid, 
  Button, Card, CardContent, LinearProgress,
  Radio, RadioGroup, FormControlLabel, FormControl,
  Alert, Snackbar, Avatar, Chip, List, ListItem,
  ListItemAvatar, ListItemText, IconButton
} from '@mui/material';
import {
  CheckCircle, Timer, EmojiEvents, People,
  Send, VolumeUp, VolumeOff
} from '@mui/icons-material';
import io from 'socket.io-client';

const PlayerView = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [player, setPlayer] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [gamePhase, setGamePhase] = useState('lobby');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:10000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    // Join session
    socketRef.current.emit('join-session', { 
      roomCode, 
      displayName: JSON.parse(localStorage.getItem('user'))?.username 
    });

    // Socket event handlers
    socketRef.current.on('session-data', (data) => {
      setSession(data.session);
      setPlayer(data.participant);
      setGamePhase(data.session.currentState?.phase || 'lobby');
      setLoading(false);
    });

    socketRef.current.on('quiz-started', (data) => {
      setCurrentQuestion(data.question);
      setTimeRemaining(data.timeRemaining);
      setGamePhase('question');
      setSelectedAnswer('');
    });

    socketRef.current.on('next-question', (data) => {
      setCurrentQuestion(data.question);
      setTimeRemaining(data.timeRemaining);
      setGamePhase('question');
      setSelectedAnswer('');
    });

    socketRef.current.on('timer-update', (data) => {
      setTimeRemaining(data.timeRemaining);
    });

    socketRef.current.on('question-completed', (data) => {
      setGamePhase('answer');
      setSuccess(`Correct answer: ${data.correctAnswer}`);
    });

    socketRef.current.on('answer-feedback', (data) => {
      if (data.isCorrect) {
        setSuccess(`Correct! +${data.points} points`);
      } else {
        setError(`Incorrect. Correct answer was: ${data.correctAnswer}`);
      }
    });

    socketRef.current.on('leaderboard-update', (data) => {
      setLeaderboard(data.leaderboard);
    });

    socketRef.current.on('quiz-completed', (data) => {
      setGamePhase('finished');
      setLeaderboard(data.finalResults.leaderboard);
      setSuccess('Quiz completed! Check your ranking.');
    });

    socketRef.current.on('session-ended-by-host', () => {
      setError('Session ended by host');
      setTimeout(() => navigate('/'), 3000);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomCode, navigate]);

  const submitAnswer = () => {
    if (!selectedAnswer || !socketRef.current) return;

    const timeTaken = 30 - timeRemaining;
    socketRef.current.emit('submit-answer', {
      roomCode,
      questionIndex: currentQuestion?.index || 0,
      answer: selectedAnswer,
      timeTaken
    });
  };

  const readyPlayer = () => {
    if (socketRef.current) {
      socketRef.current.emit('player-ready', {
        roomCode,
        isReady: !player?.isReady
      });
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Connecting to game...</Typography>
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
      <Container maxWidth="md">
        {/* Header */}
        <Paper sx={{ p: 2, mb: 3, mt: 2 }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h5">{session?.name || 'Quiz Session'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Room: {roomCode} | {session?.participants?.length || 0} players online
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  icon={<Timer />}
                  label={`${timeRemaining}s`}
                  color={timeRemaining < 10 ? 'error' : 'primary'}
                />
                <Chip 
                  icon={<People />}
                  label={`${player?.score || 0} points`}
                  color="success"
                />
                <Button
                  variant={player?.isReady ? "contained" : "outlined"}
                  color="success"
                  onClick={readyPlayer}
                  disabled={gamePhase !== 'lobby'}
                >
                  {player?.isReady ? 'Ready!' : 'Ready Up'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Game Content */}
        {gamePhase === 'lobby' && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Waiting in Lobby
              </Typography>
              <Typography color="text.secondary" paragraph>
                The host will start the quiz soon. Make sure you're ready!
              </Typography>
              <List>
                {session?.participants?.map((p, idx) => (
                  <ListItem key={idx}>
                    <ListItemAvatar>
                      <Avatar src={p.avatar}>
                        {p.username?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={p.username}
                      secondary={p.isReady ? 'Ready' : 'Not ready'}
                    />
                    {p.isReady && <CheckCircle color="success" />}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {gamePhase === 'question' && currentQuestion && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Question {currentQuestion.index + 1} of {currentQuestion.totalQuestions}
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={(timeRemaining / currentQuestion.timeLimit) * 100} 
                sx={{ mb: 3, height: 8 }}
              />
              
              <Typography variant="h6" paragraph>
                {currentQuestion.text}
              </Typography>

              {currentQuestion.imageUrl && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Question" 
                    style={{ maxWidth: '100%', maxHeight: 300 }}
                  />
                </Box>
              )}

              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                >
                  {currentQuestion.options?.map((option, idx) => (
                    <Paper key={idx} sx={{ mb: 1, p: 2 }}>
                      <FormControlLabel
                        value={option.text}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {option.imageUrl && (
                              <img src={option.imageUrl} alt="Option" style={{ height: 40 }} />
                            )}
                            <Typography>{option.text}</Typography>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={submitAnswer}
                disabled={!selectedAnswer}
                sx={{ mt: 3 }}
              >
                Submit Answer
              </Button>
            </CardContent>
          </Card>
        )}

        {gamePhase === 'answer' && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Answer Review
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Waiting for other players to finish...
              </Alert>
              <Typography>
                The next question will start shortly.
              </Typography>
            </CardContent>
          </Card>
        )}

        {gamePhase === 'finished' && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEvents /> Quiz Completed!
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Final Results
              </Typography>
              
              <List>
                {leaderboard.slice(0, 5).map((player, idx) => (
                  <ListItem key={idx}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: idx === 0 ? 'gold' : 
                                 idx === 1 ? 'silver' : 
                                 idx === 2 ? '#CD7F32' : 'primary.main' 
                      }}>
                        {idx + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={player.username}
                      secondary={`Score: ${player.score} | Accuracy: ${player.accuracy?.toFixed(1)}%`}
                    />
                    <Chip 
                      label={`#${idx + 1}`} 
                      color={idx < 3 ? 'primary' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  Your Rank: #{leaderboard.find(p => p.isCurrentUser)?.rank || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Score: {player?.score || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Sidebar */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEvents /> Live Leaderboard
            </Typography>
            {leaderboard.length > 0 ? (
              <List>
                {leaderboard.map((p, idx) => (
                  <ListItem 
                    key={idx}
                    sx={{ 
                      bgcolor: p.isCurrentUser ? 'action.selected' : 'transparent',
                      borderRadius: 1
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: idx < 3 ? 'primary.main' : 'grey.500' }}>
                        {idx + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={p.username}
                      secondary={`${p.score} points`}
                    />
                    <Chip 
                      label={`${p.accuracy?.toFixed(1) || 0}%`} 
                      size="small"
                      color="secondary"
                    />
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
      </Container>

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

export default PlayerView;