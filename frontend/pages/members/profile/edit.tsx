import Layout from "@/components/Layout";
import { memberApi, projectApi, skillApi } from "@/lib/api";
import { Member, Skill } from "@/lib/types";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { User, FolderOpen, Pencil, X, Save, CheckCircle } from "lucide-react";
import Link from "next/link";

import ProfileInfoForm from "../../../components/EditProfile/ProfileInfoForm";
import ProjectManager from "../../../components/EditProfile/ProjectManager";

// --- Shared State Interfaces ---
interface ProfileFormData {
  fullName: string;
  bio: string;
  roleTitle: string;
  devStack: string;
  linkedinUrl: string;
  portfolioUrl: string;
  selectedSkills: number[];
}
// -----------------------------

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const [member, setMember] = useState<Member | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"profile" | "projects">(
    "profile"
  );
  const [searchSkill, setSearchSkill] = useState("");

  const [projects, setProjects] = useState<any[]>([]);

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    bio: "",
    roleTitle: "",
    devStack: "",
    linkedinUrl: "",
    portfolioUrl: "",
    selectedSkills: [],
  });

  const clearAlerts = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // --- Data Loading Effect ---
  useEffect(() => {
    if (!currentUserId || !session) return;

    const loadData = async () => {
      try {
        const memberRes = await memberApi.getProfile();
        const skillsRes = await skillApi.getAll();

        setMember(memberRes.data);
        setAllSkills(skillsRes.data);
        setProjects(memberRes.data.projects || []);

        setFormData({
          fullName: memberRes.data.fullName || "",
          bio: memberRes.data.bio || "",
          roleTitle: memberRes.data.roleTitle || "",
          devStack: memberRes.data.devStack || "",
          linkedinUrl: memberRes.data.linkedinUrl || "",
          portfolioUrl: memberRes.data.portfolioUrl || "",
          selectedSkills:
            memberRes.data.skills?.map((ms: any) => ms.skill.id) || [],
        });
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --- Profile Save Handler ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    clearAlerts();

    try {
      await memberApi.updateProfile({
        fullName: formData.fullName,
        bio: formData.bio,
        roleTitle: formData.roleTitle,
        devStack: formData.devStack,
        linkedinUrl: formData.linkedinUrl,
        portfolioUrl: formData.portfolioUrl,
      });

      // Update skills
      await memberApi.addSkills({
        skillIds: formData.selectedSkills,
      });

      setSuccess("✨ Profile updated successfully!");
      setTimeout(() => {
        router.push(`/members/profile`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };
  // ---------------------------------------------

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-700 rounded mx-auto mb-4"></div>
            <div className="h-4 w-32 bg-slate-800 rounded mx-auto"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!member) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-red-400 mb-4">
            ⚠️ You are not authorized to edit this profile
          </p>
          <button
            onClick={() => router.push(`/members/profile`)}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container-custom relative">
          <Link
            href="/members/profile"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Profile
          </Link>

          <div className="flex items-start gap-6">
            <div className="relative group">
              {/* NOTE: Avatar logic should be moved to a separate AvatarEditor component if file uploads are needed */}
              <img
                src={member.user.avatarUrl || "/avatar.png"}
                alt={member.fullName}
                className="w-24 h-24 rounded-2xl border-4 border-primary/30 shadow-xl transition-transform group-hover:scale-105"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                Edit Your Profile
                <Pencil className="text-accent" size={28} />
              </h1>
              <p className="text-slate-400 text-lg">
                Customize how you should be defined!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <div className="container-custom mt-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border-l-4 border-red-500 rounded-r text-red-300 animate-slide-down flex items-start gap-3">
            <X className="flex-shrink-0 mt-0.5" size={20} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border-l-4 border-green-500 rounded-r text-green-300 animate-slide-down flex items-start gap-3">
            <CheckCircle className="flex-shrink-0 mt-0.5" size={20} />
            <p>{success}</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="container-custom mt-8">
        <div className="flex gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700 backdrop-blur-sm inline-flex">
          <button
            onClick={() => {
              setActiveSection("profile");
              clearAlerts();
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeSection === "profile"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <User size={18} />
            Profile Info
          </button>
          <button
            onClick={() => {
              setActiveSection("projects");
              clearAlerts();
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeSection === "projects"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <FolderOpen size={18} />
            Projects ({projects.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <section className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          {activeSection === "profile" && (
            <ProfileInfoForm
              formData={formData}
              setFormData={setFormData}
              allSkills={allSkills}
              handleSaveProfile={handleSaveProfile}
              saving={saving}
              searchSkill={searchSkill}
              setSearchSkill={setSearchSkill}
            />
          )}

          {activeSection === "projects" && (
            <ProjectManager
              projects={projects}
              setProjects={setProjects}
              setError={setError}
              setSuccess={setSuccess}
              clearAlerts={clearAlerts}
            />
          )}
        </div>
      </section>
    </Layout>
  );
}
