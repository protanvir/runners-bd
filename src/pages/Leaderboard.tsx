
import { useEffect, useState } from 'react';
import { insforge } from '../lib/insforge';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardEntry {
    user_id: string;
    full_name: string;
    avatar_url: string;
    total_distance: number;
    activity_count: number;
}

export default function Leaderboard() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            // In a real app, this aggregation might be a database view or RPC
            // For now, we'll fetch activities and aggregate client-side (not scalable but works for MVP)
            const { data: activities, error } = await insforge.database
                .from('activities')
                .select(`
          distance_km,
          user_id,
          user:profiles(full_name, avatar_url)
        `);

            if (error) throw error;

            if (activities) {
                const stats: Record<string, LeaderboardEntry> = {};

                activities.forEach((act: any) => {
                    const uid = act.user_id;
                    if (!stats[uid]) {
                        stats[uid] = {
                            user_id: uid,
                            full_name: act.user?.full_name || 'Anonymous',
                            avatar_url: act.user?.avatar_url || '',
                            total_distance: 0,
                            activity_count: 0
                        };
                    }
                    stats[uid].total_distance += Number(act.distance_km || 0);
                    stats[uid].activity_count += 1;
                });

                const sorted = Object.values(stats).sort((a, b) => b.total_distance - a.total_distance);
                setLeaders(sorted);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
                    <Trophy className="w-10 h-10 text-yellow-500" />
                    Community Leaderboard
                </h1>
                <p className="text-gray-400">Top runners by distance this month</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800/50 text-sm font-medium text-gray-400 border-b border-gray-800">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-6 md:col-span-7">Runner</div>
                    <div className="col-span-3 md:col-span-2 text-right">Distance</div>
                    <div className="col-span-2 text-right">Runs</div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading rankings...</div>
                ) : leaders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No activities logged yet. Go for a run!</div>
                ) : (
                    leaders.map((leader, index) => (
                        <div
                            key={leader.user_id}
                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-800/30 transition border-b border-gray-800/50 last:border-0"
                        >
                            <div className="col-span-1 flex justify-center">
                                {index === 0 && <Medal className="w-6 h-6 text-yellow-500" />}
                                {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                                {index === 2 && <Medal className="w-6 h-6 text-orange-600" />}
                                {index > 2 && <span className="font-bold text-gray-600">#{index + 1}</span>}
                            </div>
                            <div className="col-span-6 md:col-span-7 flex items-center gap-3">
                                <img
                                    src={leader.avatar_url || `https://ui-avatars.com/api/?name=${leader.full_name}`}
                                    className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700"
                                    alt={leader.full_name}
                                />
                                <span className="font-semibold text-white truncate">{leader.full_name}</span>
                            </div>
                            <div className="col-span-3 md:col-span-2 text-right">
                                <span className="font-bold text-orange-500">{leader.total_distance.toFixed(1)}</span>
                                <span className="text-xs text-gray-500 ml-1">km</span>
                            </div>
                            <div className="col-span-2 text-right text-gray-400">
                                {leader.activity_count}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
