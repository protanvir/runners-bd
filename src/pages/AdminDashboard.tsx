
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../lib/insforge';
import { Shield, Check, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    username: string;
    bio: string;
    role: 'user' | 'superadmin';
    can_create_event: boolean;
    can_create_review: boolean;
    can_create_post: boolean;
    created_at: string;
}

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.profile.role !== 'superadmin') {
                navigate('/');
                return;
            }
            fetchUsers();
        }
    }, [user, authLoading, navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await insforge.database
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setUsers(data as UserProfile[]);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = async (userId: string, field: keyof UserProfile, currentValue: boolean) => {
        try {
            // Optimistic update
            setUsers(users.map(u =>
                u.id === userId ? { ...u, [field]: !currentValue } : u
            ));

            const { error } = await insforge.database
                .from('profiles')
                .update({ [field]: !currentValue })
                .eq('id', userId);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error(`Error toggling ${field}:`, error);
            // Revert on error
            setUsers(users.map(u =>
                u.id === userId ? { ...u, [field]: currentValue } : u
            ));
            alert('Failed to update permission');
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || (loading && users.length === 0)) {
        return <div className="text-center py-20 text-gray-500">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-orange-500" />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400">Manage user permissions and roles</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-orange-500 w-full"
                    />
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800 text-gray-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4 text-center">Role</th>
                                <th className="px-6 py-4 text-center">Events</th>
                                <th className="px-6 py-4 text-center">Reviews</th>
                                <th className="px-6 py-4 text-center">Posts</th>
                                <th className="px-6 py-4 text-right">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredUsers.map(userItem => (
                                <tr key={userItem.id} className="hover:bg-gray-800/50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={userItem.avatar_url || `https://ui-avatars.com/api/?name=${userItem.full_name || 'User'}`}
                                                alt="Avatar"
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                                <div className="font-bold text-white">{userItem.full_name || 'Unknown User'}</div>
                                                <div className="text-sm text-gray-500">{userItem.username || 'No username'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${userItem.role === 'superadmin'
                                            ? 'bg-orange-500/20 text-orange-500'
                                            : 'bg-gray-700 text-gray-300'
                                            }`}>
                                            {userItem.role || 'user'}
                                        </span>
                                    </td>

                                    {/* Permission Toggles */}
                                    {(['can_create_event', 'can_create_review', 'can_create_post'] as const).map((field) => (
                                        <td key={field} className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => togglePermission(userItem.id, field, userItem[field])}
                                                className={`p-2 rounded-lg transition ${userItem[field]
                                                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                    : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                    }`}
                                                title={`Toggle ${field}`}
                                                disabled={userItem.role === 'superadmin'} // Prevent disabling superadmin
                                            >
                                                {userItem[field] ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                            </button>
                                        </td>
                                    ))}

                                    <td className="px-6 py-4 text-right text-gray-500">
                                        {new Date(userItem.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
