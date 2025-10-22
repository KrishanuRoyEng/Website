import Layout from '@/components/Layout';
import { memberApi, projectApi, skillApi } from '@/lib/api';
import { Member, Skill } from '@/lib/types';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Github, Save, X, Plus, Trash2, ExternalLink, User, Briefcase, Code, Link as LinkIcon, Award, FolderOpen, Camera, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const [member, setMember] = useState<Member | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'projects'>('profile');

  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    roleTitle: '',
    devStack: '',
    linkedinUrl: '',
    portfolioUrl: '',
    selectedSkills: [] as number[],
  });

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    githubUrl: '',
    liveUrl: '',
    category: '',
  });

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [creatingProject, setCreatingProject] = useState(false);
  const [searchSkill, setSearchSkill] = useState('');

  useEffect(() => {
    if (!currentUserId || !session) return;

    const loadData = async () => {
      try {
        const memberRes = await memberApi.getProfile();
        const skillsRes = await skillApi.getAll();

        setMember(memberRes.data);
        setSkills(skillsRes.data);
        setProjects(memberRes.data.projects || []);

        setFormData({
          fullName: memberRes.data.fullName || '',
          bio: memberRes.data.bio || '',
          roleTitle: memberRes.data.roleTitle || '',
          devStack: memberRes.data.devStack || '',
          linkedinUrl: memberRes.data.linkedinUrl || '',
          portfolioUrl: memberRes.data.portfolioUrl || '',
          selectedSkills: memberRes.data.skills?.map((ms: any) => ms.skill.id) || [],
        });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUserId, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillToggle = (skillId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skillId)
        ? prev.selectedSkills.filter((id) => id !== skillId)
        : [...prev.selectedSkills, skillId],
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await memberApi.updateProfile({
        fullName: formData.fullName,
        bio: formData.bio,
        roleTitle: formData.roleTitle,
        devStack: formData.devStack,
        linkedinUrl: formData.linkedinUrl,
        portfolioUrl: formData.portfolioUrl,
      });

      if (formData.selectedSkills.length > 0) {
        await memberApi.addSkills({
          skillIds: formData.selectedSkills,
        });
      }

      setSuccess('✨ Profile updated successfully!');
      setTimeout(() => {
        router.push(`/profile`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProject(true);
    setError(null);

    try {
      const res = await projectApi.create({
        title: newProject.title,
        description: newProject.description,
        githubUrl: newProject.githubUrl || undefined,
        liveUrl: newProject.liveUrl || undefined,
        category: newProject.category || undefined,
      });

      setProjects([res.data, ...projects]);
      setNewProject({
        title: '',
        description: '',
        githubUrl: '',
        liveUrl: '',
        category: '',
      });
      setShowProjectForm(false);
      setSuccess('🎉 Project added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectApi.delete(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      setSuccess('🗑️ Project deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete project');
    }
  };

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchSkill.toLowerCase())
  );

  const selectedSkillsData = skills.filter(skill => 
    formData.selectedSkills.includes(skill.id)
  );

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
          <p className="text-red-400 mb-4">⚠️ You are not authorized to edit this profile</p>
          <button
            onClick={() => router.push(`/profile`)}
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
          <Link href="/members/profile" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Profile
          </Link>
          
          <div className="flex items-start gap-6">
            <div className="relative group">
              <img
                src={member.user.avatarUrl || '/avatar.png'}
                alt={member.fullName}
                className="w-24 h-24 rounded-2xl border-4 border-primary/30 shadow-xl transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                Edit Your Profile
                <Sparkles className="text-accent" size={28} />
              </h1>
              <p className="text-slate-400 text-lg">Customize your developer identity</p>
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
            <Sparkles className="flex-shrink-0 mt-0.5" size={20} />
            <p>{success}</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="container-custom mt-8">
        <div className="flex gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700 backdrop-blur-sm inline-flex">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeSection === 'profile'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <User size={18} />
            Profile Info
          </button>
          <button
            onClick={() => setActiveSection('projects')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeSection === 'projects'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
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
          {activeSection === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Basic Info Card */}
              <div className="card p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="text-primary" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      placeholder="Tell us about yourself, your passions, and what drives you..."
                    />
                    <p className="text-xs text-slate-500 mt-2">{formData.bio.length} characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Role Title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="text"
                        name="roleTitle"
                        value={formData.roleTitle}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Frontend Developer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Dev Stack</label>
                    <div className="relative">
                      <Code className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="text"
                        name="devStack"
                        value={formData.devStack}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="React, Node.js, PostgreSQL"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links Card */}
              <div className="card p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <LinkIcon className="text-accent" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Social Links</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">LinkedIn Profile</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Portfolio Website</label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="url"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Card */}
              <div className="card p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Award className="text-secondary" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Skills & Expertise</h2>
                </div>

                {/* Selected Skills Display */}
                {selectedSkillsData.length > 0 && (
                  <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-sm font-semibold text-slate-400 mb-3">Selected Skills ({selectedSkillsData.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkillsData.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => handleSkillToggle(skill.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium hover:bg-primary/30 transition-all group"
                        >
                          {skill.name}
                          <X size={14} className="group-hover:scale-110 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Skills */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchSkill}
                    onChange={(e) => setSearchSkill(e.target.value)}
                    placeholder="🔍 Search skills..."
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2 bg-slate-900/30 rounded-lg border border-slate-700/50">
                  {filteredSkills.map((skill) => (
                    <label
                      key={skill.id}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                        formData.selectedSkills.includes(skill.id)
                          ? 'bg-primary/10 border-2 border-primary/50 shadow-lg shadow-primary/10'
                          : 'bg-slate-800/50 border-2 border-transparent hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedSkills.includes(skill.id)}
                        onChange={() => handleSkillToggle(skill.id)}
                        className="rounded border-slate-500 text-primary focus:ring-primary focus:ring-offset-0 transition-all"
                      />
                      <span className={`text-sm font-medium ${
                        formData.selectedSkills.includes(skill.id) ? 'text-primary' : 'text-slate-300'
                      }`}>
                        {skill.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="sticky bottom-6 z-10">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save All Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeSection === 'projects' && (
            <div className="space-y-6">
              {/* Add Project Card */}
              <div className="card p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <FolderOpen className="text-accent" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Your Projects</h2>
                  </div>
                  <button
                    onClick={() => setShowProjectForm(!showProjectForm)}
                    className={`btn-${showProjectForm ? 'secondary' : 'primary'} flex items-center gap-2 transition-all`}
                  >
                    {showProjectForm ? <X size={18} /> : <Plus size={18} />}
                    {showProjectForm ? 'Cancel' : 'Add Project'}
                  </button>
                </div>

                {showProjectForm && (
                  <form onSubmit={handleCreateProject} className="p-6 bg-slate-900/30 rounded-xl border border-slate-700 space-y-4 animate-slide-down">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Project Title *</label>
                      <input
                        type="text"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="My Awesome Project"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                      <textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        placeholder="Describe what makes this project special..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">GitHub URL</label>
                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                          <input
                            type="url"
                            value={newProject.githubUrl}
                            onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="https://github.com/..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Live Demo URL</label>
                        <div className="relative">
                          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                          <input
                            type="url"
                            value={newProject.liveUrl}
                            onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="https://demo.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
                      <select
                        value={newProject.category}
                        onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Select a category</option>
                        <option value="WEB">🌐 Web Development</option>
                        <option value="AI">🤖 AI & Machine Learning</option>
                        <option value="UIUX">🎨 UI/UX Design</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={creatingProject}
                      className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {creatingProject ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Add Project
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Projects List */}
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="card p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          {project.category && (
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                              {project.category}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {project.description && (
                        <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                          {project.description}
                        </p>
                      )}

                      <div className="flex gap-3">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-all"
                          >
                            <Github size={16} />
                            Code
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-all"
                          >
                            <ExternalLink size={16} />
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="text-slate-600" size={32} />
                  </div>
                  <p className="text-slate-400 text-lg mb-2">No projects yet</p>
                  <p className="text-slate-500 text-sm mb-6">Start building your portfolio by adding your first project!</p>
                  <button
                    onClick={() => setShowProjectForm(true)}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Your First Project
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }

        /* Smooth transitions for all interactive elements */
        input, textarea, select, button {
          transition: all 0.2s ease;
        }

        /* Focus ring enhancement */
        input:focus, textarea:focus, select:focus {
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }

        /* Checkbox custom styling */
        input[type="checkbox"]:checked {
          background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
        }
      `}</style>
    </Layout>
  );
}