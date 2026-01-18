import React, { useMemo } from 'react';
import '../../styles/timeline.css';
import { getTagInfo } from '../../lib/gedcom/schema.js';
import { Edit2, Trash2, MapPin, Info } from 'lucide-react';

const TimelineView = ({
    events,
    isEditable = false,
    onEdit,
    onDelete,
    activeEditIndex = null
}) => {
    const processedEvents = useMemo(() => {
        if (!events) return [];

        // Helper to extract year for sorting
        const getYear = (d) => {
            if (!d) return 9999; // Unknown dates at the end
            const match = d.match(/\d{4}/);
            return match ? parseInt(match[0]) : 9999;
        };

        // We want to keep track of the original index for editing
        return events
            .map((e, idx) => ({ ...e, originalIndex: idx }))
            .sort((a, b) => getYear(a.date) - getYear(b.date));
    }, [events]);

    if (processedEvents.length === 0) return (
        <div className="timeline-empty">No life events recorded.</div>
    );

    return (
        <div className={`timeline-container ${isEditable ? 'editable' : ''}`}>
            <div className="timeline-line"></div>
            {processedEvents.map((event) => (
                <div
                    key={event.originalIndex}
                    className={`timeline-item ${activeEditIndex === event.originalIndex ? 'is-editing' : ''}`}
                >
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                        <div className="timeline-header">
                            <span className="timeline-date">{event.date || 'Unknown Date'}</span>
                            {isEditable && (
                                <div className="timeline-actions">
                                    <button onClick={() => onEdit(event.originalIndex, event)} className="btn-tiny">
                                        <Edit2 size={12} />
                                    </button>
                                    <button onClick={() => onDelete(event.originalIndex)} className="btn-tiny danger">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <span className="timeline-tag" title={getTagInfo(event.tag).description}>
                            {getTagInfo(event.tag).label}
                        </span>
                        {event.place && (
                            <span className="timeline-place">
                                <MapPin size={10} /> {event.place.value || event.place}
                            </span>
                        )}
                        {event.note && (
                            <div className="timeline-note-inline" title={event.note}>
                                <Info size={10} /> Note included
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TimelineView;
