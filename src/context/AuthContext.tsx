import { createContext, useContext, useEffect, useState } from 'react';
import { insforge } from '../lib/insforge';

// Define types based on InsForge SDK Docs
export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    profile: {
        name?: string;
        avatar_url?: string;
        bio?: string;
        [key: string]: any;
    };
    user_metadata?: any; // Fallback
}

export interface Session {
    accessToken: string;
    user: User;
    expiresAt?: Date;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signInWithGithub: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signInWithGithub: async () => { },
    signInWithGoogle: async () => { },
    signOut: async () => { },
    refreshSession: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSession = async () => {
        try {
            const { data } = await insforge.auth.getCurrentSession();
            console.log('InsForge Session Data:', data);
            if (data?.session) {
                // Map SDK response to our Type if needed, or cast it
                setSession(data.session as unknown as Session);
                setUser(data.session.user as unknown as User);
            } else {
                setSession(null);
                setUser(null);
            }
        } catch (err) {
            console.error('Failed to get session', err);
            setSession(null);
            setUser(null);
        } finally {
            console.log('Session refresh completed', { sessionExists: !!session, userExists: !!user });
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSession();
    }, []);

    const signInWithGithub = async () => {
        await insforge.auth.signInWithOAuth({
            provider: 'github',
            redirectTo: window.location.origin,
        });
    };

    const signInWithGoogle = async () => {
        await insforge.auth.signInWithOAuth({
            provider: 'google',
            redirectTo: window.location.origin,
        });
    };

    const signOut = async () => {
        await insforge.auth.signOut();
        setSession(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signInWithGithub, signInWithGoogle, signOut, refreshSession }}>
            {!loading ? children : <div className="h-screen w-screen flex items-center justify-center bg-gray-950 text-white">Loading...</div>}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
