// src/components/OfflineIndicator.jsx
import React, { useState, useEffect } from 'react';
import { useQuiz } from './QuizContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi as FiWifi, WifiOff as FiWifiOff, RefreshCw as FiRefreshCw, AlertTriangle as FiAlertTriangle,
  CloudOff as FiCloudOff, Download as FiDownload, Upload as FiUpload, WifiOff as MdSignalWifiOff, Wifi as MdSignalWifi4Bar
} from 'lucide-react';

const OfflineIndicator = () => {
  const { socket, isConnected, api } = useQuiz();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [networkInfo, setNetworkInfo] = useState({
    type: 'unknown',
    downlink: 0,
    rtt: 0,
    effectiveType: 'unknown'
  });
  const [offlineActions, setOfflineActions] = useState([]);
  const [lastSync, setLastSync] = useState(new Date());
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);

      // Attempt to reconnect socket
      if (socket && !socket.connected) {
        socket.connect();
      }

      // Sync offline actions
      syncOfflineActions();

      // Hide indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      toast.error('You are offline. Some features may be limited.');
    };

    // Network information
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const conn = (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
        if (conn) {
          setNetworkInfo({
            type: conn.type || 'unknown',
            downlink: conn.downlink || 0,
            rtt: conn.rtt || 0,
            effectiveType: conn.effectiveType || 'unknown'
          });

          // Determine connection quality
          if (conn.effectiveType === '4g' && conn.rtt < 100) {
            setConnectionQuality('excellent');
          } else if (conn.effectiveType === '4g' || conn.effectiveType === '3g') {
            setConnectionQuality('good');
          } else {
            setConnectionQuality('poor');
          }
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('connection' in navigator) {
      const conn = (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
      if (conn) {
        conn.addEventListener('change', updateNetworkInfo);
        updateNetworkInfo();
      }
    }

    // Check connection periodically
    const interval = setInterval(() => {
      if (navigator.onLine) {
        // Test connection quality
        testConnectionQuality();
      }
    }, 30000);

    // Store actions when offline
    const handleSocketDisconnect = () => {
      if (!navigator.onLine) {
        // Store pending actions
        const pendingAction = {
          type: 'socket_reconnect',
          timestamp: new Date().toISOString(),
          data: { reason: 'network_loss' }
        };
        setOfflineActions(prev => [...prev, pendingAction]);
      }
    };

    if (socket) {
      socket.on('disconnect', handleSocketDisconnect);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if ('connection' in navigator) {
        const conn = (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
        if (conn) {
          conn.removeEventListener('change', updateNetworkInfo);
        }
      }

      clearInterval(interval);

      if (socket) {
        socket.off('disconnect', handleSocketDisconnect);
      }
    };
  }, [socket]);

  const testConnectionQuality = async () => {
    try {
      const startTime = Date.now();
      await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        mode: 'no-cors'
      });
      const latency = Date.now() - startTime;

      if (latency > 1000) {
        setConnectionQuality('poor');
      } else if (latency > 500) {
        setConnectionQuality('fair');
      } else {
        setConnectionQuality('good');
      }
    } catch (error) {
      setConnectionQuality('poor');
    }
  };

  const syncOfflineActions = async () => {
    if (offlineActions.length === 0 || !navigator.onLine) return;

    setIsSyncing(true);
    let syncedCount = 0;
    const totalActions = offlineActions.length;

    for (const action of offlineActions) {
      try {
        // Simulate syncing each action
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update progress
        syncedCount++;
        setSyncProgress(Math.round((syncedCount / totalActions) * 100));

        // Here you would actually sync the action with your backend
        console.log('Syncing action:', action);

      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }

    // Clear synced actions
    setOfflineActions([]);
    setLastSync(new Date());
    setIsSyncing(false);
    setSyncProgress(0);

    toast.success('Offline actions synced successfully!');
  };

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-green-400';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getConnectionQualityText = () => {
    switch (connectionQuality) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Poor';
      default: return 'Unknown';
    }
  };

  const formatLatency = (ms) => {
    if (ms < 100) return `${ms}ms`;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const handleManualReconnect = () => {
    if (socket) {
      socket.connect();
      toast.success('Attempting to reconnect...');
    }
  };

  const handleRetryConnection = () => {
    window.location.reload();
  };

  if (!showIndicator && isOnline && isConnected) {
    return null;
  }

  return (
    <AnimatePresence>
      {(showIndicator || !isOnline || !isConnected) && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className={`px-4 py-3 shadow-lg ${!isOnline
              ? 'bg-gradient-to-r from-red-600 to-orange-600'
              : !isConnected
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                : 'bg-gradient-to-r from-green-600 to-emerald-600'
            }`}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {!isOnline ? (
                      <FiWifiOff className="h-6 w-6 text-white" />
                    ) : !isConnected ? (
                      <MdSignalWifiOff className="h-6 w-6 text-white" />
                    ) : (
                      <MdSignalWifi4Bar className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {!isOnline
                        ? 'You are currently offline'
                        : !isConnected
                          ? 'Connection unstable'
                          : 'Back online!'}
                    </p>
                    <p className="text-sm text-white/90 mt-0.5">
                      {!isOnline
                        ? 'Some features may not work properly. Check your internet connection.'
                        : !isConnected
                          ? 'Trying to reconnect to the server...'
                          : 'Connection restored. Syncing data...'}
                    </p>

                    {/* Connection Details */}
                    {(isOnline || isConnected) && (
                      <div className="mt-2 flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <FiDownload className="w-3 h-3" />
                          <span>{networkInfo.downlink} Mbps</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                          <span>{formatLatency(networkInfo.rtt)}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${getConnectionQualityColor()}`}>
                          <FiWifi className="w-3 h-3" />
                          <span>{getConnectionQualityText()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Sync Progress */}
                  {isSyncing && (
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-white"
                          initial={{ width: '0%' }}
                          animate={{ width: `${syncProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-xs text-white">{syncProgress}%</span>
                    </div>
                  )}

                  {/* Offline Actions Count */}
                  {offlineActions.length > 0 && (
                    <div className="px-2 py-1 bg-white/20 rounded-full">
                      <span className="text-xs font-medium text-white">
                        {offlineActions.length} pending
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {!isOnline ? (
                      <button
                        onClick={handleRetryConnection}
                        className="px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium flex items-center space-x-1"
                      >
                        <FiRefreshCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    ) : !isConnected ? (
                      <button
                        onClick={handleManualReconnect}
                        className="px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium flex items-center space-x-1"
                      >
                        <FiRefreshCw className="w-3 h-3" />
                        <span>Reconnect</span>
                      </button>
                    ) : offlineActions.length > 0 ? (
                      <button
                        onClick={syncOfflineActions}
                        disabled={isSyncing}
                        className="px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 disabled:opacity-50 transition-colors text-sm font-medium flex items-center space-x-1"
                      >
                        <FiUpload className="w-3 h-3" />
                        <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => setShowIndicator(false)}
                      className="px-3 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced Network Info */}
              {(process.env.NODE_ENV === 'development' || !isOnline) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 pt-3 border-t border-white/20 overflow-hidden"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-2 bg-white/10 rounded">
                      <p className="text-white/70">Network Type</p>
                      <p className="text-white font-medium">{networkInfo.type}</p>
                    </div>
                    <div className="p-2 bg-white/10 rounded">
                      <p className="text-white/70">Effective Type</p>
                      <p className="text-white font-medium">{networkInfo.effectiveType}</p>
                    </div>
                    <div className="p-2 bg-white/10 rounded">
                      <p className="text-white/70">Download Speed</p>
                      <p className="text-white font-medium">{networkInfo.downlink} Mbps</p>
                    </div>
                    <div className="p-2 bg-white/10 rounded">
                      <p className="text-white/70">Round Trip Time</p>
                      <p className="text-white font-medium">{formatLatency(networkInfo.rtt)}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Connection Status Bar */}
          <div className="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent">
            {isOnline && isConnected && (
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 100%'
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
