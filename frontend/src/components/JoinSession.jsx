import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid,
  Button, TextField, Card, CardContent,
  Avatar, Chip, Alert, LinearProgress,
  Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, List,
  ListItem, ListItemAvatar, ListItemText,
  Divider, Snackbar
} from '@mui/material';
import {
  ContentCopy, PlayArrow, People, Timer,
  EmojiEvents, LockOpen, Lock, QrCode,
  ArrowBack, ArrowForward, Refresh,
  CheckCircle, Cancel, VolumeUp,
  VolumeOff, Visibility, VisibilityOff
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from "qrcode.react";

const JoinSession = () => {
  const { roomCode: paramRoomCode } = useParams();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState(paramRoomCode || '');
  const [displayName, setDisplayName] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [autoJoin, setAutoJoin] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setDisplayName(parsedUser.displayName || parsedUser.username || '');
    }
  }, []);

  // Auto-check room if code is provided in URL
  useEffect(() => {
    if (paramRoomCode) {
      checkRoom(paramRoomCode);
      setAutoJoin(true);
    }
  }, [paramRoomCode]);

  const checkRoom = async (code) => {
    if (!code || code.trim().length < 4) {
      setError('Please enter a valid room code (4-6 characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:10000'}/api/sessions/${code.toUpperCase()}`
      );

      if (response.data.success) {
        setSession(response.data.session);

        // Check if password is required
        if (response.data.session.settings?.privateMode &&
          response.data.session.password) {
          setRequiresPassword(true);
        }

        // If auto-join is enabled and no password required, join immediately
        if (autoJoin && !requiresPassword && user) {
          handleJoin();
        }
      } else {
        setError(response.data.message || 'Room not found');
        setSession(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check room. Please try again.');
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!session) {
      setError('Please check room first');
      return;
    }

    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }

    if (requiresPassword && !password) {
      setError('Password is required for this room');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('quizito_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Create guest user ID if no token
      const guestId = !token ? `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null;

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:10000'}/api/sessions/${session.roomCode}/join`,
        {
          displayName,
          password,
          isGuest: !token,
          guestId: guestId
        },
        { headers }
      );

      if (response.data.success) {
        setSuccess('Successfully joined the session!');

        // Store participant info
        localStorage.setItem('currentSession', JSON.stringify({
          roomCode: session.roomCode,
          participant: response.data.participant,
          sessionId: response.data.session._id
        }));

        // Redirect to player view
        setTimeout(() => {
          navigate(`/play/${session.roomCode}`);
        }, 1500);
      }
    } catch (err) {
      console.error('[JoinSession] Join error:', err);
      console.error('[JoinSession] Error response:', err.response?.data);
      const errorMsg = err.response?.data?.message || 'Failed to join session';
      setError(errorMsg);

      if (errorMsg.includes('password') || errorMsg.includes('Password')) {
        setRequiresPassword(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copied to clipboard!');
    });
  };

  const handleQuickJoin = () => {
    if (roomCode.trim().length >= 4) {
      checkRoom(roomCode.trim());
    } else {
      setError('Please enter a valid room code');
    }
  };

  const renderSessionStatus = () => {
    if (!session) return null;

    const statusColors = {
      waiting: 'success',
      starting: 'warning',
      active: 'info',
      finished: 'error',
      cancelled: 'default'
    };

    return (
      <Chip
        label={session.status?.toUpperCase()}
        color={statusColors[session.status] || 'default'}
        size="small"
        sx={{ ml: 1 }}
      />
    );
  };

  const renderRoomInfo = () => {
    if (!session) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              {session.name || `Room ${session.roomCode}`}
              {renderSessionStatus()}
            </Typography>
            <IconButton onClick={() => setShowQR(true)}>
              <QrCode />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {session.participantCount || 0} / {session.maxPlayers || 100} players
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Timer sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {session.settings?.questionTime || 30}s per question
                </Typography>
              </Box>

              {session.host && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    src={session.host.avatar}
                    sx={{ width: 24, height: 24, mr: 1 }}
                  >
                    {session.host.username?.[0]}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    Hosted by {session.host.username}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {session.quiz && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Quiz: {session.quiz.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={session.quiz.category}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={session.quiz.difficulty}
                      size="small"
                      variant="outlined"
                      color={
                        session.quiz.difficulty === 'easy' ? 'success' :
                          session.quiz.difficulty === 'medium' ? 'warning' :
                            session.quiz.difficulty === 'hard' ? 'error' : 'default'
                      }
                    />
                    <Chip
                      label={`${session.quiz.totalQuestions || 0} questions`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </>
              )}
            </Grid>
          </Grid>

          {/* Current Participants */}
          {session.participants && session.participants.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Players
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {session.participants.slice(0, 8).map((p, idx) => (
                  <Chip
                    key={idx}
                    avatar={<Avatar src={p.avatar}>{p.username?.[0]}</Avatar>}
                    label={p.username}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {session.participants.length > 8 && (
                  <Chip
                    label={`+${session.participants.length - 8} more`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Room Settings */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Room Settings
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Late Join: {session.settings?.allowLateJoin ? 'Allowed' : 'Not Allowed'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Privacy: {session.settings?.privateMode ? 'Private' : 'Public'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Leaderboard: {session.settings?.showLeaderboard ? 'On' : 'Off'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Power-ups: {session.settings?.powerupsEnabled ? 'Enabled' : 'Disabled'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderJoinForm = () => {
    if (!session) return null;

    const canJoin = session.status === 'waiting' ||
      (session.status === 'active' && session.settings?.allowLateJoin);

    if (!canJoin) {
      return (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This session {session.status === 'finished' ? 'has ended' : 'is in progress'}.
          {session.status === 'active' && !session.settings?.allowLateJoin && ' Late joining is disabled.'}
        </Alert>
      );
    }

    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Join Session
        </Typography>

        {!user && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You're joining as a guest. Some features may be limited.
          </Alert>
        )}

        <TextField
          fullWidth
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          margin="normal"
          disabled={loading}
          helperText="This is how other players will see you"
        />

        {requiresPassword && (
          <TextField
            fullWidth
            label="Room Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            disabled={loading}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
            helperText="This room is password protected"
          />
        )}

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleJoin}
          disabled={loading || !displayName.trim() || (requiresPassword && !password)}
          startIcon={<PlayArrow />}
          sx={{ mt: 2 }}
        >
          {loading ? 'Joining...' : 'Join Session'}
        </Button>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => {
              setSession(null);
              setRoomCode('');
              setError('');
            }}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>

          <Button
            variant="outlined"
            onClick={() => window.open(`/spectate/${session.roomCode}`, '_blank')}
            startIcon={<Visibility />}
          >
            Spectate
          </Button>
        </Box>
      </Paper>
    );
  };

  const renderQuickJoin = () => {
    return (
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom color="primary">
            Join Quiz Session
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter a room code to join an existing quiz session
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Room Code
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Enter 4-6 digit room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickJoin()}
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '0.5em'
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleQuickJoin}
              disabled={loading || roomCode.length < 4}
              sx={{ minWidth: 100 }}
            >
              {loading ? 'Checking...' : 'Join'}
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Example: A1B2C3 or 123ABC
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">OR</Typography>
        </Divider>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
              onClick={() => navigate('/')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <ArrowBack sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6">Browse Quizzes</Typography>
                <Typography variant="body2" color="text.secondary">
                  Explore and join public quizzes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
              onClick={() => navigate('/create')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <PlayArrow sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6">Create Quiz</Typography>
                <Typography variant="body2" color="text.secondary">
                  Make your own quiz and host a session
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Popular/Active Sessions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <People sx={{ mr: 1 }} /> Active Sessions
          </Typography>
          <Alert severity="info">
            Feature coming soon! Browse active public sessions here.
          </Alert>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mb: 2, color: 'white' }}
        >
          Back to Home
        </Button>

        {/* Main Content */}
        {session ? (
          <>
            {renderRoomInfo()}
            {renderJoinForm()}
          </>
        ) : (
          renderQuickJoin()
        )}

        {/* Error/Success Messages */}
        {error && (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            action={
              <IconButton size="small" onClick={() => setError('')}>
                <Cancel fontSize="small" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress />
            <Typography align="center" sx={{ mt: 1 }} color="text.secondary">
              Connecting to server...
            </Typography>
          </Box>
        )}

        {/* QR Code Dialog */}
        <Dialog open={showQR} onClose={() => setShowQR(false)}>
          <DialogTitle>Scan to Join</DialogTitle>
          <DialogContent sx={{ textAlign: 'center', p: 4 }}>
            <QRCodeCanvas
              value={`${window.location.origin}/join/${session?.roomCode || roomCode}`}
              size={200}
            />
            <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
              Scan this QR code with your phone camera to join instantly
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => copyToClipboard(`${window.location.origin}/join/${session?.roomCode || roomCode}`)}>
              Copy Link
            </Button>
            <Button onClick={() => setShowQR(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Snackbar>

        {/* Features Footer */}
        {!session && (
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom color="white">
              Why Join Quiz Sessions?
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ color: 'white', p: 2 }}>
                  <EmojiEvents sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1">Compete & Win</Typography>
                  <Typography variant="body2">
                    Compete with others in real-time and climb the leaderboard
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ color: 'white', p: 2 }}>
                  <People sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1">Social Learning</Typography>
                  <Typography variant="body2">
                    Learn together with friends, classmates, or colleagues
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ color: 'white', p: 2 }}>
                  <Timer sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1">Instant Feedback</Typography>
                  <Typography variant="body2">
                    Get immediate results and explanations for each question
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default JoinSession;