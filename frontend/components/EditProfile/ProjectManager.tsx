import React, { useState, useEffect, useRef } from "react";
import { projectApi, tagApi } from "@/lib/api";
import { Project } from "@/lib/types";
import {
  FolderOpen,
  Plus,
  X,
  Github,
  ExternalLink,
  Trash2,
  Pencil,
  Save,
} from "lucide-react";

interface ProjectFormData {
  title: string;
  description: string;
  githubUrl: string;
  liveUrl: string;
  category: string;
  tags: string; // Stored as a comma-separated string in the state for the input field
}

interface ProjectManagerProps {
  projects: any[];
  setProjects: React.Dispatch<React.SetStateAction<any[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
  clearAlerts: () => void;
}

const initialProjectFormData: ProjectFormData = {
  title: "",
  description: "",
  githubUrl: "",
  liveUrl: "",
  category: "",
  tags: "",
};

const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  setProjects,
  setError,
  setSuccess,
  clearAlerts,
}) => {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>(
    initialProjectFormData
  );

  // --- New States for Tag Management ---
  const [allUniqueTags, setAllUniqueTags] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  // --- New State for Delete Confirmation ---
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Effect to calculate all unique tags from database
  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const res = await tagApi.getAll();
        const tagNames = res.data.map((tag: any) => tag.name);
        setAllUniqueTags(tagNames.sort((a: string, b: string) => a.localeCompare(b)));
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };

    fetchAllTags();
  }, []);

  // Helper to convert form string to clean array
  const getTagArrayFromFormData = (tagString: string): string[] => {
    return tagString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  const handleProjectFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "tags") {
      handleTagInputChange(value);
    } else {
      setProjectFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Custom handler for tags input
  const handleTagInputChange = (value: string) => {
    setProjectFormData((prev) => ({
      ...prev,
      tags: value,
    }));
    const currentInput = value.split(",").pop()?.trim().toLowerCase() || "";

    const currentTagsInForm = getTagArrayFromFormData(value).map((t) =>
      t.toLowerCase()
    );

    if (currentInput.length > 0) {
      const suggestions = allUniqueTags.filter((tag) => {
        return (
          tag.toLowerCase().includes(currentInput) &&
          !currentTagsInForm.includes(tag.toLowerCase())
        );
      });
      setFilteredSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      const suggestions = allUniqueTags.filter(
        (tag) => !currentTagsInForm.includes(tag.toLowerCase())
      );
      setFilteredSuggestions(suggestions);
      setShowSuggestions(true);
    }
  };

  const handleAddTagFromSuggestion = (tag: string) => {
    const currentTags = getTagArrayFromFormData(projectFormData.tags);

    // Check if the tag already exists (case-insensitive)
    if (currentTags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())) {
      setShowSuggestions(false);
      return;
    }
    const newTags = [...currentTags, tag];
    setProjectFormData((prev) => ({
      ...prev,
      tags: newTags.join(", "),
    }));

    setFilteredSuggestions([]);
    setShowSuggestions(false);
    tagInputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = getTagArrayFromFormData(projectFormData.tags);
    const newTags = currentTags.filter((tag) => tag !== tagToRemove);
    setProjectFormData((prev) => ({
      ...prev,
      tags: newTags.join(", "),
    }));
    tagInputRef.current?.focus();
  };

  const handleEditProject = (project: any) => {
    clearAlerts();
    setEditingProject(project);
    setConfirmDeleteId(null);
    
    // Extract tag names from the nested structure for display in form
    const tagNames = project.tags && Array.isArray(project.tags) 
      ? project.tags.map((projectTag: any) => projectTag.tag?.name).filter(Boolean)
      : [];

    setProjectFormData({
      title: project.title,
      description: project.description || "",
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      category: project.category || "",
      tags: tagNames.join(", "),
    });
    setShowProjectForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelProjectEdit = () => {
    setEditingProject(null);
    setProjectFormData(initialProjectFormData);
    setShowProjectForm(false);
    setShowSuggestions(false);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProject(true);
    clearAlerts();
    setShowSuggestions(false);

    const processedTags = getTagArrayFromFormData(projectFormData.tags);

    // Validate tags - only allow tags that exist in the database
    const invalidTags = processedTags.filter(tag => 
      !allUniqueTags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
    );

    if (invalidTags.length > 0) {
      setError(`Invalid tags: ${invalidTags.join(', ')}. Please use existing tags from the suggestions.`);
      setSavingProject(false);
      return;
    }

    const data = {
      title: projectFormData.title,
      description: projectFormData.description || undefined,
      githubUrl: projectFormData.githubUrl || undefined,
      liveUrl: projectFormData.liveUrl || undefined,
      category: projectFormData.category || undefined,
      tags: processedTags.length > 0 ? processedTags : [],
    };

    try {
      let res: { data: Project };
      if (editingProject) {
        // UPDATE LOGIC
        res = (await projectApi.update(editingProject.id, data)) as {
          data: Project;
        };
        setProjects(
          projects.map((p) => (p.id === editingProject.id ? res.data : p))
        );
        setSuccess("✅ Project updated successfully! (Sent for re-approval)");
      } else {
        // CREATE LOGIC
        res = (await projectApi.create(data)) as { data: Project };
        setProjects([res.data, ...projects]);
        setSuccess("🎉 Project added successfully!");
      }

      handleCancelProjectEdit();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Save project error:", err);
      setError(err.response?.data?.error || "Failed to save project");
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (confirmDeleteId === projectId) {
      setConfirmDeleteId(null);
      clearAlerts();

      try {
        await projectApi.delete(projectId);
        setProjects(projects.filter((p) => p.id !== projectId));
        setSuccess("🗑️ Project deleted successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to delete project");
      }
    } else {
      clearAlerts();
      setConfirmDeleteId(projectId);
    }
  };

  const currentTagsInForm = showProjectForm
    ? getTagArrayFromFormData(projectFormData.tags)
    : [];

  return (
    <div className="space-y-6">
      {/* Add/Edit Project Card - Dark Theme Wrapper */}
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-700 hover:border-violet-500/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-600/20 rounded-lg">
              <FolderOpen className="text-violet-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">Your Projects</h2>
          </div>
          <button
            onClick={() => {
              if (showProjectForm) {
                handleCancelProjectEdit();
              } else {
                handleCancelProjectEdit();
                setShowProjectForm(true);
              }
            }}
            className={`font-semibold py-2 px-4 rounded-lg transition-all shadow-md 
                                     ${
                                       showProjectForm
                                         ? "bg-red-700 text-white hover:bg-red-600" // Cancel Button
                                         : "bg-violet-600 text-white hover:bg-violet-500"
                                     } // Add Button
                                     flex items-center gap-2`}
          >
            {showProjectForm ? <X size={18} /> : <Plus size={18} />}
            {showProjectForm ? "Close Form" : "Add New Project"}
          </button>
        </div>

        {showProjectForm && (
          <form
            onSubmit={handleSaveProject}
            className="p-5 bg-gray-900/50 rounded-xl border border-gray-700 space-y-5 animate-slide-down shadow-inner"
          >
            <h3 className="text-xl font-bold text-violet-400 mb-4">
              {editingProject
                ? `Edit Project: ${editingProject.title}`
                : "Create New Project"}
            </h3>

            {/* Form Fields */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                value={projectFormData.title}
                onChange={handleProjectFormChange}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                placeholder="My Awesome Project"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={projectFormData.description}
                onChange={handleProjectFormChange}
                rows={3}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-violet-500 focus:border-violet-500 resize-none"
                placeholder="Describe what makes this project special..."
              />
            </div>

            {/* Tags Input Field with Chips and Suggestions */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tags (Technologies & Keywords)
              </label>

              {/* Visual Chips for Tags Already Entered */}
              {currentTagsInForm.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-800 rounded-lg border border-gray-700">
                  {currentTagsInForm.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-violet-600/30 text-violet-300 shadow-inner cursor-pointer hover:bg-violet-600/50 transition-colors"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X size={12} className="ml-1 text-violet-400/80" />
                    </span>
                  ))}
                </div>
              )}

              <input
                ref={tagInputRef}
                type="text"
                name="tags"
                value={projectFormData.tags}
                onChange={(e) => handleProjectFormChange(e)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay hide to allow click on suggestion
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                placeholder="Type tags separated by commas (e.g., React, Node, SQL)"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg shadow-xl">
                  <p className="text-xs text-gray-400 px-3 py-1 sticky top-0 bg-gray-700 border-b border-gray-600">
                    Available Tags:
                  </p>
                  {filteredSuggestions.slice(0, 10).map((tag, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 text-sm text-gray-200 hover:bg-violet-600 hover:text-white cursor-pointer transition-colors"
                      onMouseDown={(e) => {
                        // Use onMouseDown to prevent onBlur from firing first
                        e.preventDefault();
                        handleAddTagFromSuggestion(tag);
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Separate tags with a comma. Click suggested tags below or start
                typing to filter existing ones. Only existing tags from the database are allowed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  GitHub URL
                </label>
                <div className="relative">
                  <Github
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="url"
                    name="githubUrl"
                    value={projectFormData.githubUrl}
                    onChange={handleProjectFormChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-violet-500 focus:border-violet-500 transition-colors pl-10"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Live Demo URL
                </label>
                <div className="relative">
                  <ExternalLink
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="url"
                    name="liveUrl"
                    value={projectFormData.liveUrl}
                    onChange={handleProjectFormChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-violet-500 focus:border-violet-500 transition-colors pl-10"
                    placeholder="https://demo.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={projectFormData.category}
                onChange={handleProjectFormChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-violet-500 focus:border-violet-500 transition-colors"
              >
                <option value="" className="bg-gray-800 text-gray-400">
                  Select a category
                </option>
                <option value="WEB" className="bg-gray-800 text-white">
                  🌐 Web Development
                </option>
                <option value="AI" className="bg-gray-800 text-white">
                  🤖 AI & Machine Learning
                </option>
                <option value="UIUX" className="bg-gray-800 text-white">
                  🎨 UI/UX Design
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingProject}
              className="w-full bg-violet-600 text-white font-bold py-3 rounded-lg shadow-xl hover:bg-violet-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingProject ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {editingProject ? "Saving Changes..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {editingProject ? "Save Project Changes" : "Add Project"}
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Projects List - This part should now show tags correctly */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-violet-500/50 hover:scale-[1.01] transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
                    {project.title}
                    <span
                      className={`ml-2 inline-block px-2 py-0.5 text-xs rounded-full font-semibold ${
                        // Status Badges
                        project.isApproved
                          ? "bg-green-600/20 text-green-400"
                          : "bg-yellow-600/20 text-yellow-400"
                      }`}
                    >
                      {project.isApproved ? "Approved" : "Pending"}
                    </span>
                  </h3>
                  {project.category && (
                    // Category Chip
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-violet-600/20 text-violet-400 border border-violet-600/30">
                      {project.category}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {/* Action Buttons - Dark/Sleek Hover */}
                  <button
                    onClick={() => handleEditProject(project)}
                    className="p-2 text-gray-400 hover:text-violet-400 hover:bg-gray-700 rounded-lg transition-all"
                    title="Edit Project"
                  >
                    <Pencil size={18} />
                  </button>

                  {/* Delete Button with Inline Confirmation */}
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className={`p-2 rounded-lg transition-all ${
                      confirmDeleteId === project.id
                        ? "bg-red-700 text-white hover:bg-red-600"
                        : "text-gray-400 hover:text-red-400 hover:bg-gray-700"
                    }`}
                    title={
                      confirmDeleteId === project.id
                        ? "Click again to CONFIRM deletion"
                        : "Delete Project"
                    }
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {confirmDeleteId === project.id && (
                <p className="text-red-400 text-sm mb-2 p-2 bg-red-700/10 border border-red-700/30 rounded-lg">
                  Click the trash icon again to permanently delete this project.
                </p>
              )}

              {/* START: Tags Display - This should now work correctly */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {project.tags.map((projectTag: any, index: number) => {
                    const tag = projectTag.tag;
                    const tagId = tag?.id || index;
                    const tagName = tag?.name;
                    
                    if (!tagName) return null;
                    
                    return (
                      <span
                        key={tagId}
                        className="px-3 py-1 text-xs bg-gray-700 rounded-full text-gray-300"
                      >
                        {tagName}
                      </span>
                    );
                  })}
                </div>
              )}
              {/* END: Tags Display */}

              {project.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>
              )}

              <div className="flex gap-3 mt-4">
                {/* Link Buttons  */}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-all"
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
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600/30 hover:bg-violet-600/50 text-violet-400 rounded-lg text-sm font-medium transition-all"
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
        <div className="bg-gray-800 rounded-xl shadow-lg p-10 text-center border border-gray-700">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="text-gray-500" size={32} />
          </div>
          <p className="text-gray-300 text-lg mb-2 font-semibold">
            No projects yet
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Start building your portfolio by adding your first project!
          </p>
          <button
            onClick={() => setShowProjectForm(true)}
            className="bg-violet-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-violet-500 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Add Your First Project
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;