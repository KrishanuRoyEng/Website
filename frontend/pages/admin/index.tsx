import Layout from '@/components/Layout';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { memberApi, projectApi, eventApi, adminApi } from '@/lib/api';
import { Member, Project, Event } from '@/lib/types';
import { CheckCircle, XCircle, Star } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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

    const loadData = async () => {
      try {
        const [membersRes, projectsRes, eventsRes] = await Promise.all([
          memberApi.getAll({ approvedOnly: false }),
          projectApi.getAll({ approvedOnly: false }),
          eventApi.getAll(),
        ]);

        setPendingMembers(membersRes.data.filter((m: Member) => !m.user.isActive));
        setPendingProjects(projectsRes.data.filter((p: Project) => !p.isApproved));
        setEvents(eventsRes.data);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session, status, isAdmin, router]);

  const approveMember = async (memberId: number) => {
    try {
      await adminApi.approveMember(memberId, { isActive: true, role: 'MEMBER' });
      setPendingMembers(pendingMembers.filter((m) => m.id !== memberId));
    } catch (error) {
      console.error('Error approving member:', error);
    }
  };

  const rejectMember = async (memberId: number) => {
    try {
      await adminApi.approveMember(memberId, { isActive: false, role: 'PENDING' });
      setPendingMembers(pendingMembers.filter((m) => m.id !== memberId));
    } catch (error) {
      console.error('Error rejecting member:', error);
    }
  };

  const approveProject = async (projectId: number) => {
    try {
      await adminApi.approveProject(projectId, { isApproved: true });
      setPendingProjects(pendingProjects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error('Error approving project:', error);
    }
  };

  const rejectProject = async (projectId: number) => {
    try {
      await adminApi.approveProject(projectId, { isApproved: false });
      setPendingProjects(pendingProjects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error('Error rejecting project:', error);
    }
  };

  const toggleEventFeatured = async (eventId: number, featured: boolean) => {
    try {
      await adminApi.featuredEvent(eventId, { isFeatured: !featured });
      setEvents(
        events.map((e) =>
          e.id === eventId ? { ...e, isFeatured: !featured } : e
        )
      );
    } catch (error) {
      console.error('Error toggling event featured:', error);
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
        <p className="section-subtitle">Manage members, projects, and events</p>
      </section>

      {/* Main Content */}
      <section className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Members */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Pending Members ({pendingMembers.length})
            </h2>
            {pendingMembers.length === 0 ? (
              <p className="text-slate-400">No pending members</p>
            ) : (
              <div className="space-y-4">
                {pendingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-slate-700/50 p-4 rounded-lg flex items-start justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={member.user.avatarUrl || '/avatar.png'}
                        alt={member.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-white">
                          {member.fullName || member.user.username}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveMember(member.id)}
                        className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => rejectMember(member.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                  <div
                    key={project.id}
                    className="bg-slate-700/50 p-4 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white">
                          {project.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                          by {project.member.fullName || project.member.user.username}
                        </p>
                      </div>
                      <span className="badge-secondary text-xs">
                        {project.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveProject(project.id)}
                        className="flex-1 p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-xs font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectProject(project.id)}
                        className="flex-1 p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-xs font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Events */}
          <div className="card p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">
              Manage Events
            </h2>
            {events.length === 0 ? (
              <p className="text-slate-400">No events</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-slate-700/50 p-4 rounded-lg"
                  >
                    <h3 className="font-semibold text-white mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() =>
                        toggleEventFeatured(event.id, event.isFeatured)
                      }
                      className={`w-full py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
                        event.isFeatured
                          ? 'bg-accent/20 text-accent hover:bg-accent/30'
                          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <Star size={14} />
                      {event.isFeatured
                        ? 'Featured'
                        : 'Mark Featured'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
