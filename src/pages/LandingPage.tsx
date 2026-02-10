
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Users, Calendar } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="space-y-16">
            <section className="text-center py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                    <span className="block text-white">Join the Movement</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                        Runners BD
                    </span>
                </h1>
                <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10">
                    Connect with runners across Bangladesh. Find running buddies, join local events, track your progress, and share your journey.
                </p>
                <div className="flex justify-center gap-4">
                    <Link
                        to="/social"
                        className="px-8 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition flex items-center gap-2"
                    >
                        Get Started <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        to="/events"
                        className="px-8 py-3 rounded-lg bg-gray-800 text-gray-200 font-semibold hover:bg-gray-700 transition"
                    >
                        Find Events
                    </Link>
                </div>
            </section>

            <section className="grid md:grid-cols-3 gap-8">
                <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-orange-500/50 transition duration-300">
                    <Users className="w-12 h-12 text-orange-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Community Hub</h3>
                    <p className="text-gray-400">
                        Connect with like-minded runners, join groups, and find training partners near you.
                    </p>
                </div>
                <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-orange-500/50 transition duration-300">
                    <Calendar className="w-12 h-12 text-blue-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Event Calendar</h3>
                    <p className="text-gray-400">
                        Discover local races, marathons, and weekly group runs. RSVP and track your schedule.
                    </p>
                </div>
                <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-orange-500/50 transition duration-300">
                    <Trophy className="w-12 h-12 text-yellow-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Track & Compete</h3>
                    <p className="text-gray-400">
                        Gamify your running with leaderboards, badges, and personal goal tracking.
                    </p>
                </div>
            </section>
        </div>
    );
}
