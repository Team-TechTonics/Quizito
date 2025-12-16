// src/pages/Friends.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    UserPlus,
    Search,
    MessageCircle,
    Swords,
    Check,
    X,
    Clock,
    Flame,
    Award,
    Loader
} from 'lucide-react';
import { socialService } from '../services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Friends = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('friends'); // friends, requests, find
    const [searchQuery, setSearchQuery] = useState('');

    // Data states
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
    const [suggestedFriends, setSuggestedFriends] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);

    // Initial data fetch
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [friendsData, requestsData, suggestionsData] = await Promise.all([
                socialService.getFriends(),
                socialService.getFriendRequests(),
                socialService.getSuggestedFriends()
            ]);

            setFriends(friendsData || []);
            setRequests({
                incoming: requestsData?.incoming || [],
                outgoing: requestsData?.outgoing || []
            });
            setSuggestedFriends(suggestionsData || []);
        } catch (error) {
            console.error('Failed to fetch friends data:', error);
            toast.error('Could not load social data');
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearchLoading(true);
        try {
            const results = await socialService.searchUsers(searchQuery);
            // Filter out self and existing friends from search results if needed
            // For now, assuming API returns all matches
            setSearchResults(results || []);
        } catch (error) {
            console.error('Search failed:', error);
            toast.error('Search failed');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            await socialService.sendFriendRequest(userId);
            toast.success('Friend request sent!');
            // Refresh outgoing requests
            const newRequests = await socialService.getFriendRequests();
            setRequests(prev => ({ ...prev, outgoing: newRequests.outgoing }));
            // Remove from suggested/search if present
            setSuggestedFriends(prev => prev.filter(u => u.id !== userId));
            setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, requestSent: true } : u));
        } catch (error) {
            console.error('Failed to send request:', error);
            toast.error(error.message || 'Failed to send request');
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await socialService.acceptFriendRequest(requestId);
            toast.success('Friend request accepted!');
            fetchInitialData(); // Refresh all lists
        } catch (error) {
            console.error('Failed to accept request:', error);
            toast.error('Failed to accept request');
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            await socialService.declineFriendRequest(requestId);
            toast.success('Friend request declined');
            setRequests(prev => ({
                ...prev,
                incoming: prev.incoming.filter(r => r.id !== requestId)
            }));
        } catch (error) {
            console.error('Failed to decline request:', error);
            toast.error('Failed to decline request');
        }
    };

    const handleCancelRequest = async (requestId) => {
        // Assuming there's a cancel endpoint or we use decline/remove
        // socialService.cancelFriendRequest(requestId) // If specific endpoint exists
        // For now, handling as TODO or assuming standard decline works on unused invites if API supports it
        // Or using removeFriend if appropriate
        toast('Functionality coming soon');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'away': return 'bg-yellow-500';
            default: return 'bg-gray-400';
        }
    };

    const getStatusText = (status, lastSeen) => {
        if (status === 'online') return 'Online';
        if (status === 'away') return 'Away';
        if (!lastSeen) return 'Offline';
        const date = new Date(lastSeen);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <Loader className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
            <div className="container mx-auto max-w-6xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                        <Users className="mr-3 text-indigo-600" size={40} />
                        Friends
                    </h1>
                    <p className="text-gray-600">Connect with other learners and compete together</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex space-x-2 mb-8">
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'friends'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        My Friends ({friends.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all relative ${activeTab === 'requests'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Requests
                        {requests.incoming.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                {requests.incoming.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('find')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'find'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Find Friends
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'friends' && (
                    <div>
                        {/* Friends List */}
                        {friends.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-lg">
                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-bold mb-2">No friends yet</h3>
                                <p>Go to "Find Friends" to connect with people!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {friends.map((friend, index) => (
                                    <motion.div
                                        key={friend.userId || friend.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <img
                                                        src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                                                        alt={friend.username}
                                                        className="w-16 h-16 rounded-full border-4 border-gray-100"
                                                    />
                                                    <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(friend.status)} rounded-full border-2 border-white`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">{friend.username}</h3>
                                                    <p className="text-sm text-gray-600">Level {friend.level || 1}</p>
                                                    <p className="text-xs text-gray-500">{getStatusText(friend.status, friend.lastSeen)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors">
                                                <Swords size={16} />
                                                <span>Challenge</span>
                                            </button>
                                            <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                                                <MessageCircle size={16} />
                                                <span>Message</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="space-y-6">
                        {/* Incoming Requests */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Incoming Requests ({requests.incoming.length})</h2>
                            <div className="space-y-4">
                                {requests.incoming.map((request, index) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-2xl shadow-lg p-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={request.from?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.from?.username}`}
                                                    alt={request.from?.username}
                                                    className="w-14 h-14 rounded-full border-2 border-gray-200"
                                                />
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{request.from?.username}</h3>
                                                    <p className="text-sm text-gray-600">Level {request.from?.level || 1}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleAcceptRequest(request.id)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                                                >
                                                    <Check size={16} />
                                                    <span>Accept</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeclineRequest(request.id)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                                >
                                                    <X size={16} />
                                                    <span>Decline</span>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {requests.incoming.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm">
                                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No pending friend requests</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Outgoing Requests */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sent Requests ({requests.outgoing.length})</h2>
                            <div className="space-y-4">
                                {requests.outgoing.map((request, index) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-2xl shadow-lg p-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={request.to?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.to?.username}`}
                                                    alt={request.to?.username}
                                                    className="w-14 h-14 rounded-full border-2 border-gray-200"
                                                />
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{request.to?.username}</h3>
                                                    <p className="text-sm text-gray-600">Level {request.to?.level || 1}</p>
                                                    <p className="text-xs text-gray-400 mt-1 flex items-center">
                                                        <Clock size={12} className="mr-1" />
                                                        Sent {new Date(request.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCancelRequest(request.id)}
                                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel Request
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'find' && (
                    <div>
                        {/* Search */}
                        <div className="mb-6">
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by username (e.g. 'john_doe')"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-32 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="submit"
                                    disabled={searchLoading}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
                                >
                                    {searchLoading ? 'Searching...' : 'Search'}
                                </button>
                            </form>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Search Results</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {searchResults.map((user) => (
                                        <div key={user.id || user._id} className="bg-white rounded-2xl shadow-lg p-6 text-center">
                                            <img
                                                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                                alt={user.username}
                                                className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gray-100"
                                            />
                                            <h3 className="font-bold text-gray-800 mb-1">{user.username}</h3>
                                            <p className="text-sm text-gray-600 mb-4">Level {user.level || 1}</p>

                                            {friends.some(f => f.userId === user.id) ? (
                                                <button disabled className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-xl cursor-default">
                                                    Already Friends
                                                </button>
                                            ) : user.requestSent ? (
                                                <button disabled className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-xl cursor-default">
                                                    Request Sent
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleSendRequest(user.id || user._id)}
                                                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                                                >
                                                    <UserPlus size={16} />
                                                    <span>Add Friend</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggested Friends */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Suggested Friends</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {suggestedFriends.map((user, i) => (
                                <div key={user.id || `suggested-${i}`} className="bg-white rounded-2xl shadow-lg p-6 text-center">
                                    <img
                                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                        alt={user.username}
                                        className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gray-100"
                                    />
                                    <h3 className="font-bold text-gray-800 mb-1">{user.username}</h3>
                                    <p className="text-sm text-gray-600 mb-4">Level {user.level || 1}</p>
                                    <button
                                        onClick={() => handleSendRequest(user.id)}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                                    >
                                        <UserPlus size={16} />
                                        <span>Add Friend</span>
                                    </button>
                                </div>
                            ))}
                            {suggestedFriends.length === 0 && (
                                <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-xl">
                                    <p>No suggestions available at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friends;
