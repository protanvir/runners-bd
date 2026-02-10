
import { BookOpen, Video, FileText, ExternalLink } from 'lucide-react';

export default function Training() {
    const resources = [
        {
            title: "Couch to 5K Plan",
            description: "A 9-week program to get you off the couch and running 5km.",
            type: "plan",
            level: "Beginner",
            link: "#"
        },
        {
            title: "Marathon Nutrition Guide",
            description: "Complete guide on what to eat before, during, and after your long runs.",
            type: "guide",
            level: "Intermediate",
            link: "#"
        },
        {
            title: "Proper Running Form",
            description: "Video analysis of correct posture and foot strike.",
            type: "video",
            level: "All Levels",
            link: "#"
        },
        {
            title: "Interval Training 101",
            description: "How to incorporate speed work into your weekly routine.",
            type: "guide",
            level: "Advanced",
            link: "#"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Training & Resources</h1>
                <p className="text-gray-400">Expert advice to help you reach your goals</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {resources.map((resource, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-orange-500/30 transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${resource.type === 'plan' ? 'bg-blue-500/10 text-blue-500' :
                                    resource.type === 'video' ? 'bg-red-500/10 text-red-500' :
                                        'bg-green-500/10 text-green-500'
                                }`}>
                                {resource.type === 'plan' && <FileText className="w-6 h-6" />}
                                {resource.type === 'video' && <Video className="w-6 h-6" />}
                                {resource.type === 'guide' && <BookOpen className="w-6 h-6" />}
                            </div>
                            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded">
                                {resource.level}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-500 transition">
                            {resource.title}
                        </h3>
                        <p className="text-gray-400 mb-4 h-12">
                            {resource.description}
                        </p>

                        <a href={resource.link} className="inline-flex items-center text-orange-500 hover:text-orange-400 text-sm font-medium">
                            Read More <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 rounded-xl p-8 border border-orange-500/20 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Need a personalized coach?</h2>
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                    Our certified coaches can create a custom training plan tailored to your specific goals and schedule.
                </p>
                <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                    Find a Coach
                </button>
            </div>
        </div>
    );
}
