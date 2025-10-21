import Layout from '@/components/Layout';
import { memberApi, projectApi, skillApi } from '@/lib/api';
import { Member, Skill } from '@/lib/types';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Github, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [member, setMember] = useState<Member | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    if (!id || !session) return;

    const loadData = async () => {
      try {
        const memberRes = await memberApi.getByUserId(Number(id));
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
          selectedSkills: memberRes.data.skills?.map((s: any) => s.id) || [],
        });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, session]);

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

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        router.push(`/profile/${id}`);
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
      setSuccess('Project added successfully!');
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
      setSuccess('Project deleted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!member || (session && (session.user as any).id !== Number(id))) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-red-400">You are not authorized to edit this profile</p>
          <button
            onClick={() => router.push(`/profile/${id}`)}
            className="btn-primary mt-6"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="mb-8">
          <Link href={`/profile/${id}`} className="text-primary hover:text-primary/80">
            ← Back to Profile
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500 rounded text-green-300">
            {success}
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="bg-slate-800 rounded-lg p-8 mb-8 border border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-white">Edit Profile</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                  placeholder="Tell us about yourself"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role Title</label>
                <input
                  type="text"
                  name="roleTitle"
                  value={formData.roleTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Dev Stack</label>
                <input
                  type="text"
                  name="devStack"
                  value={formData.devStack}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. React, Node.js, PostgreSQL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Portfolio URL</label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Skills</label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-slate-900 rounded border border-slate-600">
                  {skills.map((skill) => (
                    <label key={skill.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedSkills.includes(skill.id)}
                        onChange={() => handleSkillToggle(skill.id)}
                        className="rounded border-slate-400 text-primary focus:ring-0"
                      />
                      <span className="ml-2 text-slate-300 text-sm">{skill.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 btn-primary flex items-center gap-2 w-full justify-center"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          {/* Projects Section */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Projects</h2>
              <button
                onClick={() => setShowProjectForm(!showProjectForm)}
                className="btn-primary"
              >
                {showProjectForm ? 'Cancel' : '+ Add Project'}
              </button>
            </div>

            {showProjectForm && (
              <form onSubmit={handleCreateProject} className="mb-6 p-4 bg-slate-900 rounded border border-slate-600">
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Project Title</label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-primary"
                      placeholder="Project name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-primary"
                      placeholder="What does this project do?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">GitHub Repository URL</label>
                    <input
                      type="url"
                      value={newProject.githubUrl}
                      onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-primary"
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Live Demo URL</label>
                    <input
                      type="url"
                      value={newProject.liveUrl}
                      onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-primary"
                      placeholder="https://yourproject.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-primary"
                    >
                      <option value="">Select a category</option>
                      <option value="WEB">Web</option>
                      <option value="AI">AI</option>
                      <option value="UIUX">UI/UX</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creatingProject}
                  className="btn-primary w-full"
                >
                  {creatingProject ? 'Creating...' : 'Add Project'}
                </button>
              </form>
            )}

            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 bg-slate-900 rounded border border-slate-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
                        {project.description && (
                          <p className="text-slate-400 text-sm mb-2">{project.description}</p>
                        )}
                        <div className="flex gap-2">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm"
                            >
                              <Github size={14} />
                              Repository
                            </a>
                          )}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 text-sm"
                            >
                              Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No projects yet. Add your first project!</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
