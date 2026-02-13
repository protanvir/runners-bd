
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../lib/insforge';
import { Calendar, MapPin, Clock, Plus, X } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    description: string | null;
    event_date: string;
    location: string;
    organizer?: {
        full_name: string;
        avatar_url: string;
    };
    event_type?: string;
}

export default function Events() {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        event_date: '',
        location: '',
        description: '',
        event_type: 'group_run'
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data, error } = await insforge.database
                .from('events')
                .select('*, organizer:profiles!events_organizer_id_fkey(full_name, avatar_url)')
                .order('event_date', { ascending: true });

            if (error) throw error;
            if (data) setEvents(data as any);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const { error } = await insforge.database.from('events').insert({
                organizer_id: user.id,
                title: newEvent.title,
                event_date: new Date(newEvent.event_date).toISOString(),
                location: newEvent.location,
                description: newEvent.description,
                event_type: newEvent.event_type
            });

            if (error) throw error;

            setShowCreateForm(false);
            setNewEvent({ title: '', event_date: '', location: '', description: '', event_type: 'group_run' });
            fetchEvents();
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event');
        }
    };

    const handleRSVP = async (eventId: number) => {
        if (!user) {
            alert("Please login to RSVP");
            return;
        }
        try {
            const { error } = await insforge.database.from('event_attendees').insert({
                event_id: eventId,
                user_id: user.id,
                status: 'going'
            });
            if (error) {
                if (error.code === '23505') { // Unique violation
                    alert('You have already RSVP/d to this event!');
                } else {
                    throw error;
                }
            } else {
                alert('RSVP Successful!');
            }
        } catch (err) {
            console.error("Error RSVPing", err);
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Events</h1>
                    <p className="text-gray-400">Join local runs and races</p>
                </div>
                {user && user.profile?.can_create_event !== false && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Create Event
                    </button>
                )}
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
                        <h2 className="text-xl font-bold text-white mb-6">Create New Event</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Event Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-orange-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Date & Time</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={newEvent.event_date}
                                        onChange={e => setNewEvent({ ...newEvent, event_date: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Type</label>
                                    <select
                                        value={newEvent.event_type}
                                        onChange={e => setNewEvent({ ...newEvent, event_type: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-orange-500 outline-none"
                                    >
                                        <option value="group_run">Group Run</option>
                                        <option value="race">Race</option>
                                        <option value="virtual">Virtual Run</option>
                                        <option value="training">Training Session</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Location</label>
                                <input
                                    required
                                    type="text"
                                    value={newEvent.location}
                                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-orange-500 outline-none h-24"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition"
                            >
                                Create Event
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid gap-6">
                {loading ? (
                    <div className="text-center text-gray-500 py-10">Loading events...</div>
                ) : events.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">No upcoming events found. Be the first to create one!</div>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-orange-500/30 transition">
                            <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-48 h-48 bg-gray-800 flex items-center justify-center text-gray-600 shrink-0">
                                    <Calendar className="w-12 h-12" />
                                </div>
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-orange-500 text-sm font-semibold tracking-wider uppercase">{event.event_type?.replace('_', ' ')}</span>
                                            <h3 className="text-2xl font-bold text-white mt-1">{event.title}</h3>
                                        </div>
                                        <div className="text-center bg-gray-800 px-4 py-2 rounded-lg shrink-0 ml-4">
                                            <span className="block text-2xl font-bold text-white">{new Date(event.event_date).getDate()}</span>
                                            <span className="text-xs text-gray-400 uppercase">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-4 text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-gray-400 text-sm line-clamp-2">{event.description}</p>

                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="text-gray-400">Organizer:</span>
                                            <span className="text-white">{event.organizer?.full_name || 'Unknown'}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRSVP(event.id)}
                                            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
                                        >
                                            RSVP
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
