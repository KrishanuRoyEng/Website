import { useState } from "react";
import { Star, Trash2, Plus, Calendar } from "lucide-react";
import { eventApi, adminApi } from "@/lib/api";
import { Event } from "@/lib/types";

interface EventsTabProps {
  events: Event[];
  onDataChange: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function EventsTab({
  events,
  onDataChange,
  onSuccess,
  onError,
}: EventsTabProps) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    registrationUrl: "",
    imageUrl: "",
  });

  const toggleEventFeatured = async (eventId: number, featured: boolean) => {
    try {
      await adminApi.setEventFeatured(eventId, { isFeatured: !featured });
      onSuccess("Event updated");
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to update event");
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventApi.create(newEvent);
      setNewEvent({
        title: "",
        description: "",
        eventDate: "",
        location: "",
        registrationUrl: "",
        imageUrl: "",
      });
      setShowEventForm(false);
      onSuccess("Event created");
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to create event");
    }
  };

  const deleteEvent = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await eventApi.delete(eventId);
      onSuccess("Event deleted");
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to delete event");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Create Event */}
      <div className="card p-4 md:p-6 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Event Management
              </h2>
              <p className="text-slate-400 text-xs md:text-sm">
                Create and manage community events
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEventForm(!showEventForm)}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-all duration-300 text-sm md:text-base w-full sm:w-auto justify-center ${
              showEventForm
                ? "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
                : "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 hover:shadow-primary/30"
            }`}
          >
            <Plus
              size={18}
              className={
                showEventForm
                  ? "rotate-45 transition-transform duration-300"
                  : ""
              }
            />
            {showEventForm ? "Cancel" : "New Event"}
          </button>
        </div>

        {showEventForm && (
          <form
            onSubmit={createEvent}
            className="space-y-4 animate-in slide-in-from-top-4 duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  required
                  placeholder="Enter event title"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Description
                </label>
                <input
                  type="text"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder="Add your cool event details!"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  placeholder="Enter where all the cool people will meet!"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.eventDate}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, eventDate: e.target.value })
                  }
                  placeholder="Enter the date and for this cool event!"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Registration URL
                </label>
                <input
                  type="url"
                  value={newEvent.registrationUrl}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      registrationUrl: e.target.value,
                    })
                  }
                  placeholder="Where to sign up for this cool event?"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newEvent.imageUrl}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              Create Event
            </button>
          </form>
        )}
      </div>

      {/* Events Grid */}
      <div className="card p-4 md:p-6 border border-slate-700/50">
        <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
          All Events ({events.length})
        </h3>
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 md:w-16 md:h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm md:text-base">
              No events yet. Create your first event!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-primary/30 transition-all duration-300 overflow-hidden group"
              >
                {event.imageUrl && (
                  <div className="h-32 md:h-40 overflow-hidden bg-slate-700">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <h3 className="font-semibold text-white text-base md:text-lg line-clamp-2 flex-1 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    {event.isFeatured && (
                      <Star className="w-4 h-4 md:w-5 md:h-5 text-accent fill-current flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400 mb-4">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span className="truncate">
                      {new Date(event.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        toggleEventFeatured(event.id, event.isFeatured)
                      }
                      className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                        event.isFeatured
                          ? "bg-gradient-to-r from-accent/20 to-accent/30 text-accent border border-accent/30 hover:from-accent/30 hover:to-accent/40"
                          : "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
                      }`}
                    >
                      <Star
                        size={14}
                        className={event.isFeatured ? "fill-current" : ""}
                      />
                      {event.isFeatured ? "Featured" : "Feature"}
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="px-3 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 rounded-lg hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300 border border-red-500/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
