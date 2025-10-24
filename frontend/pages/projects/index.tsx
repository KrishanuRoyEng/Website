import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import { projectApi, tagApi } from '@/lib/api';
import { Project, ProjectCategory, Tag } from '@/lib/types';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const categories: { value: ProjectCategory; label: string }[] = [
  { value: 'WEB', label: 'Web Development' },
  { value: 'AI', label: 'AI & Machine Learning' },
  { value: 'UIUX', label: 'UI/UX Design' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, tagsRes] = await Promise.all([
          projectApi.getAll({ approvedOnly: true }),
          tagApi.getAll(),
        ]);
        
        setProjects(projectsRes.data);
        setTags(tagsRes.data);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = !selectedCategory || project.category === selectedCategory;
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tagId) => project.tags.some((t) => t.tagId === tagId));
    
    return matchesCategory && matchesTags;
  });

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTags([]);
  };

  return (
    <Layout>
      {/* Header */}
      <section className="container-custom py-16 text-center">
        <h1 className="section-title mb-4">Projects</h1>
        <p className="section-subtitle max-w-2xl mx-auto">
          Explore the incredible projects built by our community members
        </p>
      </section>

      {/* Filters and Grid */}
      <section className="container-custom py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="btn-secondary flex items-center gap-2 w-full sm:w-auto"
              >
                <span>
                  {selectedCategory
                    ? categories.find((c) => c.value === selectedCategory)?.label
                    : 'All Categories'}
                </span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    isCategoryDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-48">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700 transition-colors border-b border-slate-700 text-slate-300"
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setSelectedCategory(cat.value);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-700 transition-colors border-b border-slate-700 text-slate-300 last:border-b-0"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Filter */}
            <div className="relative">
              <button
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className="btn-secondary flex items-center gap-2 w-full sm:w-auto"
              >
                <span>
                  Filter Tags
                  {selectedTags.length > 0 && (
                    <span className="ml-2 text-primary font-bold">
                      ({selectedTags.length})
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    isTagDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isTagDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto min-w-48">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-700 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-600 cursor-pointer"
                      />
                      <span className="text-slate-300">{tag.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(selectedCategory || selectedTags.length > 0) && (
            <button
              onClick={clearFilters}
              className="btn-outline text-sm w-full sm:w-auto"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-slate-400">
            Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No projects found</p>
            <button
              onClick={clearFilters}
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
