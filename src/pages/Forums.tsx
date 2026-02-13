
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../lib/insforge';
import { MessageSquare, ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
}

interface Post {
    id: number;
    title: string;
    content: string;
    author?: {
        full_name: string;
        avatar_url: string;
    };
    created_at: string;
}

export default function Forums() {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchPosts(selectedCategory.id);
        }
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await insforge.database.from('forum_categories').select('*');
            if (error) throw error;
            if (data) setCategories(data as Category[]);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async (categoryId: number) => {
        try {
            setLoading(true);
            const { data, error } = await insforge.database
                .from('forum_posts')
                .select('*, author:profiles!forum_posts_author_id_fkey(full_name, avatar_url)')
                .eq('category_id', categoryId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setPosts(data as any);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedCategory) return;

        try {
            const { error } = await insforge.database.from('forum_posts').insert({
                author_id: user.id,
                category_id: selectedCategory.id,
                title: newPost.title,
                content: newPost.content
            });

            if (error) throw error;

            setShowCreatePost(false);
            setNewPost({ title: '', content: '' });
            fetchPosts(selectedCategory.id);
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Discussion Forums</h1>
                <p className="text-gray-400">Share knowledge and get advice from the community</p>
            </div>

            {selectedCategory ? (
                // Posts View
                <div className="space-y-6">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Categories
                    </button>

                    <div className="flex justify-between items-center bg-gray-900 p-6 rounded-xl border border-gray-800">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{selectedCategory.name}</h2>
                            <p className="text-gray-400">{selectedCategory.description}</p>
                        </div>
                        {user && user.profile?.can_create_post !== false && (
                            <button
                                onClick={() => setShowCreatePost(true)}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> New Post
                            </button>
                        )}
                    </div>

                    {showCreatePost && (
                        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 relative">
                            <button
                                onClick={() => setShowCreatePost(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-lg font-bold text-white mb-4">Create New Post</h3>
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <input
                                    required
                                    type="text"
                                    placeholder="Post Title"
                                    value={newPost.title}
                                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                                />
                                <textarea
                                    required
                                    placeholder="What's on your mind?"
                                    value={newPost.content}
                                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none h-32"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
                                    >
                                        Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center text-gray-500 py-10">Loading posts...</div>
                        ) : posts.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">No posts yet. Be the first to start a discussion!</div>
                        ) : (
                            posts.map(post => (
                                <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-orange-500/30 transition">
                                    <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                                    <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <img
                                            src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${post.author?.full_name || 'User'}`}
                                            className="w-6 h-6 rounded-full"
                                            alt="Author"
                                        />
                                        <span className="text-gray-400">{post.author?.full_name || 'Anonymous'}</span>
                                        <span>•</span>
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                // Categories List View
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center text-gray-500 py-10">Loading categories...</div>
                    ) : (
                        categories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat)}
                                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-orange-500/30 transition group cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-gray-800 rounded-lg text-orange-500 group-hover:text-orange-400 group-hover:bg-gray-800/80 transition">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-orange-500 transition">{cat.name}</h3>
                                            <p className="text-gray-400 mt-1">{cat.description}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
