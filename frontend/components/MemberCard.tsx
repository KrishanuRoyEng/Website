import Link from 'next/link';
import { Member } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface MemberCardProps {
  member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
  return (
    <Link href={`/members/user/${member.id}`}>
      <div className="card-hover cursor-pointer group overflow-hidden">
        <div className="p-6">
          {/* Header with Avatar */}
          <div className="flex items-start gap-4 mb-4">
            <img
              src={member.user.avatarUrl || '/avatar.png'}
              alt={member.fullName}
              className="w-16 h-16 rounded-full border-2 border-primary/50 group-hover:border-primary transition-colors"
            />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                {member.fullName || member.user.username}
              </h3>
              {member.roleTitle && (
                <p className="text-sm text-slate-400">{member.roleTitle}</p>
              )}
              {member.user.isLead && (
                <span className="badge-accent mt-1">Lead</span>
              )}
            </div>
          </div>

          {/* Dev Stack */}
          {member.devStack && (
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-2">Dev Stack</p>
              <div className="flex flex-wrap gap-2">
                {member.devStack.split(',').map((stack) => (
                  <span
                    key={stack.trim()}
                    className="badge-primary text-xs"
                  >
                    {stack.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {member.skills && member.skills.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-2">Skills ({member.skills.length})</p>
              <div className="flex flex-wrap gap-2">
                {member.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill.id}
                    className="badge-secondary text-xs"
                  >
                    {skill.name}
                  </span>
                ))}
                {member.skills.length > 4 && (
                  <span className="badge text-xs bg-slate-700 text-slate-300">
                    +{member.skills.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Bio Preview */}
          {member.bio && (
            <p className="text-sm text-slate-400 line-clamp-2 mb-4">
              {member.bio}
            </p>
          )}

          {/* View Profile Link */}
          <div className="flex items-center text-primary group-hover:text-secondary transition-colors text-sm font-medium">
            View Profile
            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
