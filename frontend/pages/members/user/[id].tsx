import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import ProjectModal from "@/components/ProjectModal";
import Pagination from "@/components/ui/Pagination";
import { memberApi } from "@/lib/api";
import { Member, Project } from "@/lib/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Github, Linkedin, ExternalLink, Mail, Search, Filter, X } from "lucide-react";

const PROJECTS_PER_PAGE = 3;

const categories = [
  { value: "", label: "All Categories" },
  { value: "WEB", label: "Web Development" },
  { value: "AI", label: "AI & Machine Learning" },
  { value: "UIUX", label: "UI/UX Design" },
];

export default function MemberProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  useEffect(() => {
    if (!id) return;

    const loadMember = async () => {
      try {
        const res = await memberApi.getByUserId(Number(id));
        setMember(res.data);
      } catch (error) {
        console.error("Error loading member:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [id]);

  // Filter approved projects based on search and category
  const approvedProjects = member?.projects?.filter(project => project.isApproved) || [];
  
  const filteredProjects = approvedProjects.filter((project) => {
    const matchesSearch = 
      !searchTerm ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags?.some(tag => 
        tag.tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = 
      !categoryFilter || 
      project.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || categoryFilter;

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
                src={member.user.avatarUrl || "/avatar.png"}
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
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">
                    Dev Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {member.devStack.split(",").map((stack) => (
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
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((memberSkill) => (
                      <span
                        key={memberSkill.skillId}
                        className="badge-secondary"
                      >
                        {memberSkill.skill.name}
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
      <section className="container-custom py-12">
        <div className="text-center mb-8">
          <h2 className="section-title mb-2">Projects</h2>
          <p className="section-subtitle">
            Check out {member.fullName || member.user.username}&apos;s amazing projects
          </p>
        </div>

        {/* Search and Filters */}
        {approvedProjects.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 sm:max-w-md">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="relative sm:w-48">
                  <Filter
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-slate-800">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-outline text-sm w-full sm:w-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="text-slate-400">
                  Showing {paginatedProjects.length} of {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                  {hasActiveFilters && ' (filtered)'}
                </p>
                {searchTerm && (
                  <p className="text-sm text-slate-500 mt-1">
                    Search results for: "{searchTerm}"
                  </p>
                )}
              </div>
              {totalPages > 1 && (
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {approvedProjects.length > 0 ? (
          paginatedProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-400" size={24} />
              </div>
              <p className="text-slate-400 text-lg mb-2">No projects found</p>
              <p className="text-slate-500 text-sm mb-4">
                Try adjusting your search or filters
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={24} />
            </div>
            <p className="text-slate-400 text-lg mb-2">No projects yet</p>
            <p className="text-slate-500 text-sm">
              {member.fullName || member.user.username} hasn't added any projects yet
            </p>
          </div>
        )}
      </section>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Layout>
  );
}