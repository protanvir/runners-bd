
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Calendar, MessageSquare, Award, BookOpen, Map } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, signInWithGoogle, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Social Hub', path: '/social', icon: <User className="w-5 h-5" /> },
        { name: 'Events', path: '/events', icon: <Calendar className="w-5 h-5" /> },
        { name: 'Forums', path: '/forums', icon: <MessageSquare className="w-5 h-5" /> },
        { name: 'Training', path: '/training', icon: <BookOpen className="w-5 h-5" /> },
        { name: 'Leaderboard', path: '/leaderboard', icon: <Award className="w-5 h-5" /> },
        { name: 'Routes', path: '/routes', icon: <Map className="w-5 h-5" /> },
    ];

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0">
                            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                                RUNNERS BD
                            </span>
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive(link.path)
                                            ? 'bg-gray-800 text-orange-500'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            }`}
                                    >
                                        {link.icon}
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <img
                                            className="h-8 w-8 rounded-full border-2 border-orange-500"
                                            src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`}
                                            alt="User avatar"
                                        />
                                        <span className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email}</span>
                                    </div>
                                    <button
                                        onClick={() => signOut()}
                                        className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                                        title="Sign Out"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => signInWithGoogle()}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 ${isActive(link.path)
                                    ? 'bg-gray-800 text-orange-500'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
                        {user ? (
                            <button
                                onClick={() => {
                                    signOut();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    signInWithGoogle();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
