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
        console.log('Session:', session);
        console.log('Access token:', (session as any)?.accessToken);
        const res = await memberApi.getProfile();
        console.log('Member loaded:', res.data);
        setMember(res.data);
      } catch (error: any) {
        console.error('Error loading member:', error);
        setError(error.response?.data?.error || error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [ status]);

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
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar and Basic Info */}
            <div className="flex-shrink-0">
              <img
                src={member.user.avatarUrl || '/avatar.png'}
                alt={member.fullName}
                className="w-32 h-32 rounded-full border-4 border-primary/50 shadow-lg"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-4xl font-bold text-white">
                  {member.fullName || member.user.username}
                </h1>
                {isOwnProfile && (
                  <Link
                    href={`profile/edit`}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </Link>
                )}
              </div>

              {member.roleTitle && (
                <p className="text-lg text-primary mb-4">{member.roleTitle}</p>
              )}

              {member.user.isLead && (
                <span className="badge-accent mb-4">Community Lead</span>
              )}

              {member.bio && (
                <p className="text-slate-400 max-w-2xl mb-6">{member.bio}</p>
              )}

              {/* Dev Stack */}
              {member.devStack && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Dev Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.devStack.split(',').map((stack) => (
                      <span key={stack.trim()} className="badge-primary">
                        {stack.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {member.skills && member.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <span key={skill.id} className="badge-secondary">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="flex gap-4 pt-6 border-t border-slate-700">
                {member.user.githubUrl && (
                  <a
                    href={member.user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Github size={18} />
                    GitHub
                  </a>
                )}
                {member.linkedinUrl && (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Linkedin size={18} />
                    LinkedIn
                  </a>
                )}
                {member.portfolioUrl && (
                  <a
                    href={member.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-2"
                  >
                    <ExternalLink size={18} />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="container-custom py-20">
        <h2 className="section-title mb-2">Projects</h2>
        <p className="section-subtitle mb-8">
          Check out {member.fullName || member.user.username}&apos;s amazing work
        </p>

        {member.projects && member.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
