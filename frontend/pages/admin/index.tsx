import Layout from "@/components/Layout";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  memberApi,
  projectApi,
  eventApi,
  adminApi,
  skillApi,
  tagApi,
} from "@/lib/api";
import { Member, Project, Event, Skill } from "@/lib/types";
import {
  CheckCircle,
  XCircle,
  Users,
  FolderOpen,
  Calendar,
  Award,
  Tags,
  Shield,
  Clock,
} from "lucide-react";

// Import tab components
import MembersTab from "@/components/admin/MembersTab";
import ProjectsTab from "@/components/admin/ProjectsTab/ProjectsTab";
import EventsTab from "@/components/admin/EventsTab";
import SkillsTab from "@/components/admin/SkillsTab";
import TagsTab from "@/components/admin/TagsTab";

type TabType = "members" | "projects" | "events" | "skills" | "tags";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("members");

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

  const isAdmin = session && (session.user as any)?.role === "ADMIN";

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
      return;
    }

    if (status === "authenticated" && !isAdmin) {
      console.log(
        "Not admin, redirecting. Role:",
        (session?.user as any)?.role
      );
      return;
    }

    if (isAdmin) {
      loadData();
    }
  }, [session, status, isAdmin, router, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === "members") {
        const [pendingRes, usersRes] = await Promise.all([
          adminApi.getPendingMembers(),
          adminApi.getAllUsers(),
        ]);
        setPendingMembers(pendingRes.data);
        setAllUsers(usersRes.data);
      } else if (activeTab === "projects") {
        const [pendingRes, allRes] = await Promise.all([
          adminApi.getPendingProjects(),
          projectApi.getAll({ approvedOnly: false }),
        ]);
        setPendingProjects(pendingRes.data);
        setAllProjects(allRes.data);
      } else if (activeTab === "events") {
        const eventsRes = await eventApi.getAll();
        setEvents(eventsRes.data);
      } else if (activeTab === "skills") {
        const skillsRes = await skillApi.getAll();
        setSkills(skillsRes.data);
      } else if (activeTab === "tags") {
        const tagsRes = await tagApi.getAll({});
        setTags(tagsRes.data);
      }
    } catch (error: any) {
      console.error("Error loading admin data:", error);
      setError(error.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const onSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const onError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  if (status === "loading") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-slate-400">Loading session...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container-custom py-12 md:py-20 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">
            You need admin privileges to access this page.
          </p>
          <button onClick={() => signIn()} className="btn-primary px-6 py-2">
            Sign Out and Sign Back In
          </button>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-slate-400">Loading admin data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      label: "Pending Approvals",
      value: pendingMembers.length,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Total Members",
      value: allUsers.length,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Pending Projects",
      value: pendingProjects.length,
      icon: FolderOpen,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      label: "Upcoming Events",
      value: events.filter((e) => new Date(e.eventDate) > new Date()).length,
      icon: Calendar,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  const tabs = [
    { id: "members", icon: Users, label: "Members" },
    { id: "projects", icon: FolderOpen, label: "Projects" },
    { id: "events", icon: Calendar, label: "Events" },
    { id: "skills", icon: Award, label: "Skills" },
    { id: "tags", icon: Tags, label: "Tags" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="border-b border-slate-700/50 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <div className="container-custom py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Admin Dashboard
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Manage members, projects, events, skills, and tags
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Logged in as</p>
                  <p className="text-white font-medium">
                    {session?.user?.name}
                  </p>
                </div>
                <img
                  src={(session?.user as any)?.image || "/avatar.png"}
                  alt="Admin"
                  className="w-12 h-12 rounded-full border-2 border-primary"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <section className="container-custom py-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className={`rounded-xl p-4 ${bg} border border-slate-700 flex flex-col items-center justify-center text-center`}
            >
              <Icon className={`w-6 h-6 mb-2 ${color}`} />
              <span className="text-sm text-slate-400">{label}</span>
              <span className="text-xl font-semibold text-white">{value}</span>
            </div>
          ))}
        </section>

        {/* Alerts */}
        {success && (
          <div className="container-custom mb-4">
            <div className="bg-green-600/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2">
              <CheckCircle size={18} /> {success}
            </div>
          </div>
        )}
        {error && (
          <div className="container-custom mb-4">
            <div className="bg-red-600/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2">
              <XCircle size={18} /> {error}
            </div>
          </div>
        )}

        {/* Tabs */}
        <nav className="container-custom flex flex-wrap gap-2 mb-6 border-b border-slate-700/50">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
                activeTab === id
                  ? "bg-primary/20 text-white border-b-2 border-primary"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/30"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <section className="container-custom pb-12">
          {activeTab === "members" && (
            <MembersTab
              pendingMembers={pendingMembers}
              allUsers={allUsers}
              onSuccess={onSuccess}
              onError={onError}
              onDataChange={loadData}
              currentUserId={(session?.user as any).id} //Passing current admin's ID
            />
          )}
          {activeTab === "projects" && (
            <ProjectsTab
              pendingProjects={pendingProjects}
              allProjects={allProjects}
              onSuccess={onSuccess}
              onError={onError}
              onDataChange={loadData}
            />
          )}
          {activeTab === "events" && (
            <EventsTab
              events={events}
              onSuccess={onSuccess}
              onError={onError}
              onDataChange={loadData}
            />
          )}
          {activeTab === "skills" && (
            <SkillsTab
              skills={skills}
              onSuccess={onSuccess}
              onError={onError}
              onDataChange={loadData}
            />
          )}
          {activeTab === "tags" && (
            <TagsTab
              tags={tags}
              onSuccess={onSuccess}
              onError={onError}
              onDataChange={loadData}
            />
          )}
        </section>
      </div>
    </Layout>
  );
}
