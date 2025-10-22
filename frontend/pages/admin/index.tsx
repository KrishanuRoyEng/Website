import Layout from '@/components/Layout';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { memberApi, projectApi, eventApi, adminApi, skillApi, tagApi } from '@/lib/api';
import { Member, Project, Event, Skill } from '@/lib/types';
import { CheckCircle, XCircle, Star, Trash2, Plus, Edit2, Users, FolderOpen, Calendar, Award, Tags } from 'lucide-react';

type TabType = 'members' | 'projects' | 'events' | 'skills' | 'tags';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('members');
  
  // Data states
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: '' });
  const [newTag, setNewTag] = useState({ name: '' });
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    registrationUrl: '',
    imageUrl: '',
  });

  const isAdmin = session && (session.user as any)?.role === 'ADMIN';

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    if (!isAdmin) {
      router.push('/');
      return;
    }

    loadData();
  }, [session, status, isAdmin, router, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'members') {
        const [pendingRes, usersRes] = await Promise.all([
          adminApi.getPendingMembers(),
          adminApi.getAllUsers(),
        ]);
        setPendingMembers(pendingRes.data);
        setAllUsers(usersRes.data);
      } else if (activeTab === 'projects') {
        const [pendingRes, allRes] = await Promise.all([
          adminApi.getPendingProjects(),
          projectApi.getAll({ approvedOnly: false }),
        ]);
        setPendingProjects(pendingRes.data);
        setAllProjects(allRes.data);
      } else if (activeTab === 'events') {
        const eventsRes = await eventApi.getAll();
        setEvents(eventsRes.data);
      } else if (activeTab === 'skills') {
        const skillsRes = await skillApi.getAll();
        setSkills(skillsRes.data);
      } else if (activeTab === 'tags') {
        const tagsRes = await tagApi.getAll();
        setTags(tagsRes.data);
      }
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Member management
  const approveMember = async (userId: number) => {
    try {
      await adminApi.approveMember(userId, { isActive: true, role: 'MEMBER' });
      setPendingMembers(pendingMembers.filter((m) => m.id !== userId));
      showSuccess('Member approved successfully');
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to approve member');
    }
  };

  const rejectMember = async (userId: number) => {
    try {
      await adminApi.approveMember(userId, { isActive: false, role: 'PENDING' });
      setPendingMembers(pendingMembers.filter((m) => m.id !== userId));
      showSuccess('Member rejected');
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to reject member');
    }
  };

  const updateUserRole = async (userId: number, role: string, isLead: boolean = false) => {
    try {
      await adminApi.updateUserRole(userId, { role, isLead });
      showSuccess('User role updated');
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update role');
    }
  };

  // Project management
  const approveProject = async (projectId: number) => {
    try {
      await adminApi.approveProject(projectId, { isApproved: true });
      setPendingProjects(pendingProjects.filter((p) => p.id !== projectId));
      showSuccess('Project approved');
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to approve project');
    }
  };

  const rejectProject = async (projectId: number) => {
    try {
      await adminApi.approveProject(projectId, { isApproved: false });
      setPendingProjects(pendingProjects.filter((p) => p.id !== projectId));
      showSuccess('Project rejected');
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to reject project');
    }
  };

  const deleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await adminApi.deleteProject(projectId);
      setAllProjects(allProjects.filter((p) => p.id !== projectId));
      showSuccess('Project deleted');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete project');
    }
  };

  // Event management
  const toggleEventFeatured = async (eventId: number, featured: boolean) => {
    try {
      await adminApi.setEventFeatured(eventId, { isFeatured: !featured });
      setEvents(events.map((e) => (e.id === eventId ? { ...e, isFeatured: !featured } : e)));
      showSuccess('Event updated');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update event');
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventApi.create(newEvent);
      setNewEvent({ title: '', description: '', eventDate: '', location: '', registrationUrl: '', imageUrl: '' });
      setShowEventForm(false);
      showSuccess('Event created');
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create event');
    }
  };

  const deleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventApi.delete(eventId);
      setEvents(events.filter((e) => e.id !== eventId));
      showSuccess('Event deleted');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete event');
    }
  };

  // Skill management
  const createSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await skillApi.create(newSkill);
      setNewSkill({ name: '', category: '' });
      setShowSkillForm(false);
      showSuccess('Skill created');
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create skill');
    }
  };

  const deleteSkill = async (skillId: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await skillApi.delete(skillId);
      setSkills(skills.filter((s) => s.id !== skillId));
      showSuccess('Skill deleted');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete skill');
    }
  };

  // Tag management
  const createTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tagApi.create(newTag);
      setNewTag({ name: '' });
      setShowTagForm(false);
      showSuccess('Tag created');
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create tag');
    }
  };

  const deleteTag = async (tagId: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    try {
      await tagApi.delete(tagId);
      setTags(tags.filter((t) => t.id !== tagId));
      showSuccess('Tag deleted');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete tag');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-slate-400">Access denied. Admin access required.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="container-custom py-16 text-center">
        <h1 className="section-title mb-4">Admin Dashboard</h1>
        <p className="section-subtitle">Manage all aspects of the community</p>
      </section>

      {/* Alerts */}
      {error && (
        <div className="container-custom mb-6">
          <div className="p-4 bg-red-900/30 border border-red-500 rounded text-red-300">
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="container-custom mb-6">
          <div className="p-4 bg-green-900/30 border border-green-500 rounded text-green-300">
            {success}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="container-custom mb-8">
        <div className="flex flex-wrap gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              activeTab === 'members' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={18} />
            Members
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              activeTab === 'projects' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderOpen size={18} />
            Projects
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              activeTab === 'events' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar size={18} />
            Events
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              activeTab === 'skills' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award size={18} />
            Skills
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              activeTab === 'tags' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tags size={18} />
            Tags
          </button>
        </div>
      </div>

      {/* Content */}
      <section className="container-custom pb-12">
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Members */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Pending Approvals ({pendingMembers.length})
              </h2>
              {pendingMembers.length === 0 ? (
                <p className="text-slate-400">No pending members</p>
              ) : (
                <div className="space-y-4">
                  {pendingMembers.map((user) => (
                    <div key={user.id} className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatarUrl || '/avatar.png'}
                            alt={user.username}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h3 className="font-semibold text-white">{user.username}</h3>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveMember(user.id)}
                          className="flex-1 p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectMember(user.id)}
                          className="flex-1 p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Users */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                All Users ({allUsers.length})
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {allUsers.map((user) => (
                  <div key={user.id} className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl || '/avatar.png'}
                          alt={user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-white">{user.username}</h3>
                          <p className="text-xs text-slate-400">{user.email}</p>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              user.role === 'ADMIN' ? 'bg-accent/20 text-accent' :
                              user.role === 'MEMBER' ? 'bg-primary/20 text-primary' :
                              'bg-slate-600 text-slate-300'
                            }`}>
                              {user.role}
                            </span>
                            {user.isLead && (
                              <span className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent">
                                Lead
                              </span>
                            )}
                            {!user.isActive && (
                              <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        onChange={(e) => updateUserRole(user.id, e.target.value, user.isLead)}
                        value={user.role}
                        className="flex-1 px-2 py-1 text-sm rounded bg-slate-800 border border-slate-600 text-white"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button
                        onClick={() => updateUserRole(user.id, user.role, !user.isLead)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          user.isLead
                            ? 'bg-accent/20 text-accent hover:bg-accent/30'
                            : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                        }`}
                      >
                        {user.isLead ? 'Remove Lead' : 'Make Lead'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Projects */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Pending Projects ({pendingProjects.length})
              </h2>
              {pendingProjects.length === 0 ? (
                <p className="text-slate-400">No pending projects</p>
              ) : (
                <div className="space-y-4">
                  {pendingProjects.map((project) => (
                    <div key={project.id} className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white">{project.title}</h3>
                          <p className="text-xs text-slate-400 mt-1">
                            by {project.member?.fullName || project.member?.user.username}
                          </p>
                        </div>
                        {project.category && (
                          <span className="badge-secondary text-xs">{project.category}</span>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{project.description}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveProject(project.id)}
                          className="flex-1 p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectProject(project.id)}
                          className="flex-1 p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Projects */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                All Projects ({allProjects.length})
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {allProjects.map((project) => (
                  <div key={project.id} className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{project.title}</h3>
                        <p className="text-xs text-slate-400">
                          by {project.member?.fullName || project.member?.user.username}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {project.isApproved ? (
                            <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                              Approved
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                              Pending
                            </span>
                          )}
                          {project.category && (
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                              {project.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-8">
            {/* Create Event */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Event</h2>
                <button
                  onClick={() => setShowEventForm(!showEventForm)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  {showEventForm ? 'Cancel' : 'New Event'}
                </button>
              </div>

              {showEventForm && (
                <form onSubmit={createEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Event Date</label>
                      <input
                        type="datetime-local"
                        value={newEvent.eventDate}
                        onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                        required
                        className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                      <input
                        type="text"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Registration URL</label>
                      <input
                        type="url"
                        value={newEvent.registrationUrl}
                        onChange={(e) => setNewEvent({ ...newEvent, registrationUrl: e.target.value })}
                        className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Image URL</label>
                      <input
                        type="url"
                        value={newEvent.imageUrl}
                        onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
                        className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Create Event
                  </button>
                </form>
              )}
            </div>

            {/* Manage Events */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                All Events ({events.length})
              </h2>
              {events.length === 0 ? (
                <p className="text-slate-400">No events</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event) => (
                    <div key={event.id} className="bg-slate-700/50 p-4 rounded-lg">
                      <h3 className="font-semibold text-white mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-xs text-slate-400 mb-3">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleEventFeatured(event.id, event.isFeatured)}
                          className={`flex-1 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
                            event.isFeatured
                              ? 'bg-accent/20 text-accent hover:bg-accent/30'
                              : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                          }`}
                        >
                          <Star size={14} />
                          {event.isFeatured ? 'Featured' : 'Feature'}
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-8">
            {/* Create Skill */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Skill</h2>
                <button
                  onClick={() => setShowSkillForm(!showSkillForm)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  {showSkillForm ? 'Cancel' : 'New Skill'}
                </button>
              </div>

              {showSkillForm && (
                <form onSubmit={createSkill} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Skill Name</label>
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                      placeholder="e.g. React, Python, UI/UX Design"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category (Optional)</label>
                    <input
                      type="text"
                      value={newSkill.category}
                      onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                      className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                      placeholder="e.g. Frontend, Backend, Design"
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Create Skill
                  </button>
                </form>
              )}
            </div>

            {/* Manage Skills */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                All Skills ({skills.length})
              </h2>
              {skills.length === 0 ? (
                <p className="text-slate-400">No skills</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-white text-sm">{skill.name}</p>
                        {skill.category && (
                          <p className="text-xs text-slate-400">{skill.category}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteSkill(skill.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-8">
            {/* Create Tag */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Tag</h2>
                <button
                  onClick={() => setShowTagForm(!showTagForm)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  {showTagForm ? 'Cancel' : 'New Tag'}
                </button>
              </div>

              {showTagForm && (
                <form onSubmit={createTag} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tag Name</label>
                    <input
                      type="text"
                      value={newTag.name}
                      onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                      placeholder="e.g. Machine Learning, Open Source"
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Create Tag
                  </button>
                </form>
              )}
            </div>

            {/* Manage Tags */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                All Tags ({tags.length})
              </h2>
              {tags.length === 0 ? (
                <p className="text-slate-400">No tags</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between"
                    >
                      <p className="font-medium text-white text-sm">{tag.name}</p>
                      <button
                        onClick={() => deleteTag(tag.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}