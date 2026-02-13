
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../lib/insforge';
import { Star, Plus, X, Search } from 'lucide-react';

interface GearReview {
    id: number;
    gear_name: string;
    gear_type: string;
    rating: number;
    review_text: string;
    created_at: string;
    author?: {
        full_name: string;
        avatar_url: string;
    };
}

const GEAR_TYPES = ['Shoes', 'Watch', 'Apparel', 'Nutrition', 'Other'];

export default function GearReviews() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<GearReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newReview, setNewReview] = useState({
        gear_name: '',
        gear_type: 'Shoes',
        rating: 5,
        review_text: ''
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data, error } = await insforge.database
                .from('gear_reviews')
                .select('*, author:profiles!gear_reviews_author_id_fkey(full_name, avatar_url)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setReviews(data as any);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const { error } = await insforge.database.from('gear_reviews').insert({
                author_id: user.id,
                gear_name: newReview.gear_name,
                gear_type: newReview.gear_type,
                rating: newReview.rating,
                review_text: newReview.review_text
            });

            if (error) throw error;

            setShowCreateForm(false);
            setNewReview({ gear_name: '', gear_type: 'Shoes', rating: 5, review_text: '' });
            fetchReviews();
        } catch (error) {
            console.error('Error creating review:', error);
            alert('Failed to create review');
        }
    };

    const filteredReviews = reviews.filter(review =>
        review.gear_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.review_text?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gear Reviews</h1>
                    <p className="text-gray-400">Discover top-rated running gear</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search gear..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-orange-500 w-full"
                        />
                    </div>
                    {user && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2 shrink-0"
                        >
                            <Plus className="w-4 h-4" /> Write Review
                        </button>
                    )}
                </div>
            </div>

            {showCreateForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg relative">
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6">Write a Review</h2>
                        <form onSubmit={handleCreateReview} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Gear Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newReview.gear_name}
                                    onChange={e => setNewReview({ ...newReview, gear_name: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-orange-500 outline-none"
                                    placeholder="e.g. Nike Pegasus 40"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Type</label>
                                    <select
                                        value={newReview.gear_type}
                                        onChange={e => setNewReview({ ...newReview, gear_type: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-orange-500 outline-none"
                                    >
                                        {GEAR_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Rating</label>
                                    <div className="flex gap-2 items-center bg-gray-800 border border-gray-700 rounded-lg p-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                                className={`focus:outline-none ${star <= newReview.rating ? 'text-yellow-500' : 'text-gray-600'}`}
                                            >
                                                <Star className="w-6 h-6 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Review</label>
                                <textarea
                                    required
                                    value={newReview.review_text}
                                    onChange={e => setNewReview({ ...newReview, review_text: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-orange-500 outline-none h-32"
                                    placeholder="Share your experience..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition"
                            >
                                Submit Review
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full text-center text-gray-500 py-10">Loading reviews...</div>
                ) : filteredReviews.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-10">No reviews found. Be the first to write one!</div>
                ) : (
                    filteredReviews.map(review => (
                        <div key={review.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-orange-500/30 transition flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-orange-500 text-xs font-semibold tracking-wider uppercase bg-orange-500/10 px-2 py-1 rounded">{review.gear_type}</span>
                                    <h3 className="text-xl font-bold text-white mt-2 line-clamp-1" title={review.gear_name}>{review.gear_name}</h3>
                                </div>
                                <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-white font-bold">{review.rating}</span>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-4">{review.review_text}</p>

                            <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-800 mt-auto">
                                <img
                                    src={review.author?.avatar_url || `https://ui-avatars.com/api/?name=${review.author?.full_name || 'User'}`}
                                    className="w-6 h-6 rounded-full"
                                    alt="Author"
                                />
                                <span className="text-gray-400">{review.author?.full_name || 'Anonymous'}</span>
                                <span className="text-gray-600">•</span>
                                <span className="text-gray-600">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
