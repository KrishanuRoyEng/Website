import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import { memberApi, projectApi } from '@/lib/api';
import { Member, Project } from '@/lib/types';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Github, Linkedin, ExternalLink, Edit2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = (session?.user as any)?.id;

  const isOwnProfile = status === 'authenticated'; 
  const isMember = session && (session.user as any).role !== 'PENDING';

  useEffect(() => {
    if (status !== 'authenticated' || !currentUserId) {
      if (status !== 'loading') {
        setLoading(false);
      }
      return; 
    }

    const loadMember = async () => {
      try {
        const res = await memberApi.getProfile();
        setMember(res.data);
      } catch (error: any) {
        console.error('Error loading member:', error);
        setError(error.response?.data?.error || error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [status]);

  if (loading || status === 'loading') {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error || (!member && status === 'authenticated')) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-slate-400">Profile not found</p>
          {error && (
            <p className="text-red-400 text-sm mt-2">Error: {error}</p>
          )}
          <p className="text-slate-500 text-xs mt-2">Session ID: {(session?.user as any)?.id}</p>
          <button
            onClick={() => router.push('/members')}
            className="btn-primary mt-6"
          >
            View All Members
          </button>
        </div>
      </Layout>
    );
  }

  if (!member) return null;

  return (
    <Layout>
      {/* Profile Header */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-8 md:py-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 w-full md:w-auto">
              <div className="flex-shrink-0">
                <img
                  src={member.user.avatarUrl || '/avatar.png'}
                  alt={member.fullName}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary/50 shadow-lg"
                />
              </div>
              
              {/* Mobile Edit Button */}
              {isOwnProfile && (
                <div className="md:hidden w-full">
                  <Link
                    href={`profile/edit`}
                    className="btn-secondary flex items-center justify-center gap-2 w-full"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </Link>
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center md:text-left">
                    {member.fullName || member.user.username}
                  </h1>
                  
                  {member.roleTitle && (
                    <p className="text-base md:text-lg text-primary mt-1 text-center md:text-left">
                      {member.roleTitle}
                    </p>
                  )}
                </div>

                {/* Desktop Edit Button */}
                {isOwnProfile && (
                  <div className="hidden md:block">
                    <Link
                      href={`profile/edit`}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Edit2 size={18} />
                      Edit Profile
                    </Link>
                  </div>
                )}
              </div>

              {member.user.isLead && (
                <div className="flex justify-center md:justify-start mb-4">
                  <span className="badge-accent">Community Lead</span>
                </div>
              )}

              {member.bio && (
                <p className="text-slate-400 text-sm md:text-base max-w-2xl mb-6 text-center md:text-left">
                  {member.bio}
                </p>
              )}

              {/* Dev Stack */}
              {member.devStack && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2 text-center md:text-left">
                    Dev Stack
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {member.devStack.split(',').map((stack) => (
                      <span key={stack.trim()} className="badge-primary text-xs">
                        {stack.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {member.skills && member.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2 text-center md:text-left">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {member.skills.map((memberSkill) => (
                      <span key={memberSkill.skill.id} className="badge-secondary text-xs">
                        {memberSkill.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-6 border-t border-slate-700">
                {member.user.githubUrl && (
                  <a
                    href={member.user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center gap-2 text-sm px-3 py-2"
                  >
                    <Github size={16} />
                    GitHub
                  </a>
                )}
                {member.linkedinUrl && (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center gap-2 text-sm px-3 py-2"
                  >
                    <Linkedin size={16} />
                    LinkedIn
                  </a>
                )}
                {member.portfolioUrl && (
                  <a
                    href={member.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-2 text-sm px-3 py-2"
                  >
                    <ExternalLink size={16} />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="container-custom py-12 md:py-20">
        <h2 className="section-title mb-2 text-center md:text-left">Projects</h2>
        <p className="section-subtitle mb-8 text-center md:text-left">
          Check out {member.fullName || member.user.username}&apos;s amazing work
        </p>

        {member.projects && member.projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {member.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">No projects yet</p>
          </div>
        )}
      </section>
    </Layout>
  );
}