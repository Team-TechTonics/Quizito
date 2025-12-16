// src/components/NotificationCenter.jsx
import React, { useState, useEffect } from 'react';
import { useQuiz } from './QuizContext';

const NotificationCenter = ({ isOpen, onClose }) => {
  const { socket } = useQuiz();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'Welcome to Quizito!',
      message: 'Start creating and joining quizzes now.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'success',
      title: 'Quiz Completed!',
      message: 'You scored 95% on "JavaScript Basics" quiz.',
      time: '1 day ago',
      read: true,
    },
    {
      id: 3,
      type: 'invite',
      title: 'Quiz Invitation',
      message: 'You have been invited to join "Science Challenge" quiz.',
      time: '2 days ago',
      read: false,
    },
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleQuizInvite = (data) => {
      const newNotification = {
        id: Date.now(),
        type: 'invite',
        title: 'Quiz Invitation',
        message: `You've been invited to join "${data.quizTitle}" quiz.`,
        time: 'Just now',
        read: false,
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    };

    const handleQuizUpdate = (data) => {
      const newNotification = {
        id: Date.now(),
        type: 'info',
        title: 'Quiz Updated',
        message: `"${data.quizTitle}" has been updated.`,
        time: 'Just now',
        read: false,
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    };

    socket.on('quizInvite', handleQuizInvite);
    socket.on('quizUpdate', handleQuizUpdate);

    return () => {
      socket.off('quizInvite', handleQuizInvite);
      socket.off('quizUpdate', handleQuizUpdate);
    };
  }, [socket]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'invite':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Notification Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm">
        <div className="relative flex w-full max-w-sm flex-1 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">
                  {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-gray-500 text-center">No notifications yet</p>
                <p className="text-sm text-gray-400 text-center mt-1">
                  Notifications about quizzes and updates will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {notification.time}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                        {notification.type === 'invite' && (
                          <div className="mt-3 flex space-x-2">
                            <button className="flex-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                              Join Quiz
                            </button>
                            <button className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                              Later
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-between text-sm">
              <button className="text-gray-600 hover:text-gray-900">
                Notification settings
              </button>
              <button
                onClick={() => setNotifications([])}
                className="text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;
