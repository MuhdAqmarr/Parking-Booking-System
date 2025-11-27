import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';

interface Announcement {
    id: number;
    message: string;
    type: 'info' | 'warning';
}

const AnnouncementBar: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        axios.get('/api/public/announcements')
            .then(res => setAnnouncements(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (announcements.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % announcements.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [announcements]);

    if (announcements.length === 0) return null;

    const current = announcements[currentIndex];

    return (
        <div className={`w-full py-2 px-4 flex items-center justify-center text-sm font-medium ${current.type === 'warning' ? 'bg-amber-50 text-amber-800 border-b border-amber-100' : 'bg-cyan-50 text-cyan-800 border-b border-cyan-100'}`}>
            <Bell className="w-4 h-4 mr-2" />
            <span>{current.message}</span>
        </div>
    );
};

export default AnnouncementBar;
