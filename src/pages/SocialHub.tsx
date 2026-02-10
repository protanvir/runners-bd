
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../lib/insforge';
import { Search, X } from 'lucide-react';

interface Profile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    running_level: string | null;
}

export default function SocialHub() {
    const { user, refreshSession } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: '',
        bio: '',
        location: '',
        running_level: 'beginner'
    });

    useEffect(() => {
        fetchProfiles();
    }, [user]);

    const fetchProfiles = async () => {
        try {
            const { data, error } = await insforge.database
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setProfiles(data as Profile[]);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const openEditProfile = () => {
        if (user?.profile) {
            setEditForm({
                full_name: user.profile.full_name || user.profile.name || '',
                bio: user.profile.bio || '',
                location: user.profile.location || '',
                running_level: user.profile.running_level || 'beginner'
            });
        }
        setShowEditProfile(true);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const { error } = await insforge.database
                .from('profiles')
                .update({
                    full_name: editForm.full_name,
                    bio: editForm.bio,
                    location: editForm.location,
                    running_level: editForm.running_level
                })
                .eq('id', user.id);

            if (error) throw error;

            await refreshSession();
            setShowEditProfile(false);
            fetchProfiles();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const filteredProfiles = profiles.filter(profile => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (profile.username?.toLowerCase() || '').includes(searchLower) ||
            (profile.full_name?.toLowerCase() || '').includes(searchLower) ||
            (profile.location?.toLowerCase() || '').includes(searchLower)
        );
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Social Hub</h1>
                    <p className="text-gray-400">Connect with runners in your community</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search runners..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-orange-500 w-full md:w-64"
                    />
                </div>
            </div>

            {showEditProfile && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg relative">
                        <button
                            onClick={() => setShowEditProfile(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Location</label>
                                <input
                                    type="text"
                                    value={editForm.location}
                                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Running Level</label>
                                <select
                                    value={editForm.running_level}
                                    onChange={e => setEditForm({ ...editForm, running_level: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-orange-500 outline-none"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="elite">Elite</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Bio</label>
                                <textarea
                                    value={editForm.bio}
                                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-orange-500 outline-none h-24"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user && (
                    <div className="bg-gray-800/50 border border-orange-500/30 rounded-xl p-6 flex flex-col items-center text-center hover:bg-gray-800 transition">
                        <img
                            src={user.profile?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`}
                            className="w-24 h-24 rounded-full border-4 border-orange-500 mb-4"
                            alt="My Profile"
                        />
                        <h3 className="text-xl font-bold text-white">{user.profile?.name || user.profile?.full_name || 'My Profile'}</h3>
                        <p className="text-gray-400 text-sm mb-4">{user.email}</p>
                        <div className="flex gap-2 mb-4">
                            {user.profile?.running_level && <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">{user.profile.running_level}</span>}
                        </div>
                        <button
                            onClick={openEditProfile}
                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition w-full"
                        >
                            Edit Profile
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="col-span-full text-center text-gray-500 py-10">Loading runners...</div>
                ) : filteredProfiles.length > 0 ? (
                    filteredProfiles
                        .filter(p => p.id !== user?.id)
                        .map(profile => (
                            <div key={profile.id} className="bg-gray-900 rounded-xl p-6 flex flex-col items-center text-center border border-gray-800 hover:border-orange-500/50 transition">
                                <img
                                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name || 'Runner'}`}
                                    className="w-20 h-20 rounded-full bg-gray-800 mb-4"
                                    alt={profile.full_name || 'User'}
                                />
                                <h3 className="text-lg font-bold text-white">{profile.full_name || profile.username || 'Runner'}</h3>
                                <p className="text-gray-400 text-sm mb-2">{profile.location || 'Unknown Location'}</p>
                                {profile.running_level && (
                                    <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded mb-4">{profile.running_level}</span>
                                )}
                                <button className="mt-auto px-4 py-2 text-sm text-orange-400 hover:text-orange-300 transition">
                                    View Profile
                                </button>
                            </div>
                        ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-10">No runners found matching your search.</div>
                )}
            </div>
        </div>
    );
}
