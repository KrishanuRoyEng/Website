import Layout from '@/components/Layout';
import MemberCard from '@/components/MemberCard';
import { memberApi, skillApi } from '@/lib/api';
import { Member, Skill } from '@/lib/types';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [membersRes, skillsRes] = await Promise.all([
          memberApi.getAll({ approvedOnly: true }),
          skillApi.getAll(),
        ]);
        
        setMembers(membersRes.data);
        setSkills(skillsRes.data);
      } catch (error) {
        console.error('Error loading members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredMembers = selectedSkills.length === 0
    ? members
    : members.filter((member) =>
        selectedSkills.every((skillId) =>
          member.skills.some((s) => s.id === skillId)
        )
      );

  const toggleSkillFilter = (skillId: number) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  return (
    <Layout>
      {/* Header */}
      <section className="container-custom py-16 text-center">
        <h1 className="section-title mb-4">Our Members</h1>
        <p className="section-subtitle max-w-2xl mx-auto">
          Meet the talented developers building amazing projects in our community
        </p>
      </section>

      {/* Filters and Grid */}
      <section className="container-custom py-12">
        {/* Skills Filter Dropdown */}
        <div className="mb-8 flex justify-between items-center">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="btn-secondary flex items-center gap-2"
            >
              <span>
                Filter by Skills
                {selectedSkills.length > 0 && (
                  <span className="ml-2 text-primary font-bold">
                    ({selectedSkills.length})
                  </span>
                )}
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto min-w-48">
                {skills.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-700 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill.id)}
                      onChange={() => toggleSkillFilter(skill.id)}
                      className="w-4 h-4 rounded bg-slate-700 border-slate-600 cursor-pointer"
                    />
                    <span className="text-slate-300">{skill.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {selectedSkills.length > 0 && (
            <button
              onClick={() => setSelectedSkills([])}
              className="btn-outline text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-slate-400">
            Showing {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Members Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No members found with selected skills</p>
            <button
              onClick={() => setSelectedSkills([])}
              className="btn-primary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </Layout>
  );
}
