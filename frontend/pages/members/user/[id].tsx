import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import { memberApi } from '@/lib/api';
import { Member } from '@/lib/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Github, Linkedin, ExternalLink, Mail } from 'lucide-react';

export default function MemberProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadMember = async () => {
      try {
        const res = await memberApi.getById(Number(id));
        setMember(res.data);
      } catch (error) {
        console.error('Error loading member:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!member) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-slate-400">Member not found</p>
        </div>
      </Layout>
    );
  }

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
              <h1 className="text-4xl font-bold text-white mb-2">
                {member.fullName || member.user.username}
              </h1>
              
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
          Check out {member.fullName || member.user.username}&apos;s amazing projects
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
