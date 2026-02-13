
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../lib/insforge';
import { Activity, MapPin, Clock, Calendar, ExternalLink } from 'lucide-react';

interface StravaActivity {
    id: number;
    name: string;
    distance: number;
    moving_time: number;
    type: string;
    start_date: string;
    map?: {
        summary_polyline: string;
    };
}

export default function Profile() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [stravaConnected, setStravaConnected] = useState(false);
    const [activities, setActivities] = useState<StravaActivity[]>([]);

    useEffect(() => {
        if (user) {
            checkStravaConnection();
        }

        // Handle OAuth Callback
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
            handleStravaCallback(code);
        }
    }, [user]);

    const checkStravaConnection = async () => {
        if (!user) return;

        const { data, error } = await insforge.database
            .from('profiles')
            .select('strava_access_token, strava_expires_at')
            .eq('id', user.id)
            .single();

        if (data?.strava_access_token) {
            setStravaConnected(true);
            fetchStravaActivities(data.strava_access_token);
        }
        if (error) {
            console.error('Error checking Strava connection:', error);
        }
    };

    const handleStravaCallback = async (code: string) => {
        setLoading(true);
        try {
            // Remove code from URL
            window.history.replaceState({}, document.title, "/profile");

            // Exchange token via Edge Function
            const { data, error } = await insforge.functions.invoke('strava-auth', {
                body: { code }
            });

            if (error) throw error;

            if (data?.access_token) {
                // Save tokens to database
                await insforge.database
                    .from('profiles')
                    .update({
                        strava_access_token: data.access_token,
                        strava_refresh_token: data.refresh_token,
                        strava_expires_at: data.expires_at,
                        strava_athlete_id: data.athlete?.id
                    })
                    .eq('id', user?.id as string);

                setStravaConnected(true);
                fetchStravaActivities(data.access_token);
                alert('Successfully connected to Strava!');
            }
        } catch (error) {
            console.error('Error connecting Strava:', error);
            alert('Failed to connect Strava account.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStravaActivities = async (accessToken: string) => {
        try {
            const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=3', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    const handleConnectStrava = () => {
        // Redirect to Edge Function to get the Authorization URL
        // OR construct it here if we have the Client ID publicly (usually safe for Auth URL)
        // Ideally, we get the URL from the backend to keep Client ID in one place if possible, 
        // but standard OAuth usually exposes Client ID in the URL.
        // For now, we will assume we need the Client ID. 
        // We can get it from an env var or the edge function.
        // Let's call the edge function to get the auth url just to be clean.

        const clientId = '38116';
        const redirectUri = `${window.location.origin}/profile`;
        const scope = 'read,activity:read_all';

        window.location.href = `http://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;
    };

    if (authLoading) return <div className="text-center py-20">Loading profile...</div>;
    if (!user) return <div className="text-center py-20">Please log in to view your profile.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* User Info Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 flex flex-col md:flex-row items-center gap-6">
                <img
                    src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-orange-500"
                />
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-white">{user.user_metadata?.full_name || 'User'}</h1>
                    <p className="text-gray-400">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-gray-800 rounded-full text-xs font-bold uppercase text-orange-500">
                        {user.profile?.role || 'Runner'}
                    </span>
                </div>
            </div>

            {/* Strava Integration Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-orange-500" />
                        Strava Activities
                    </h2>
                    {!stravaConnected && (
                        <button
                            onClick={handleConnectStrava}
                            disabled={loading}
                            className="bg-[#FC4C02] hover:bg-[#E34402] text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
                        >
                            {loading ? 'Connecting...' : 'Connect with Strava'}
                        </button>
                    )}
                    {stravaConnected && (
                        <span className="text-green-500 font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Connected
                        </span>
                    )}
                </div>

                {stravaConnected && activities.length > 0 ? (
                    <div className="grid gap-4">
                        {activities.map(activity => (
                            <div key={activity.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center hover:bg-gray-750 transition">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{activity.name}</h3>
                                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {(activity.distance / 1000).toFixed(2)} km
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {Math.floor(activity.moving_time / 60)}m {activity.moving_time % 60}s
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(activity.start_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <a
                                    href={`https://www.strava.com/activities/${activity.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-orange-500"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        ))}
                    </div>
                ) : stravaConnected ? (
                    <div className="text-center text-gray-500 py-8">
                        No recent activities found.
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        Connect Strava to verify your runs and show off your progress!
                    </div>
                )}
            </div>
        </div>
    );
}
