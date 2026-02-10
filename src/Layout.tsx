
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

export default function Layout() {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </main>
            </div>
        </AuthProvider>
    );
}
