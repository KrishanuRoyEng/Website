import { useState } from 'react';
import { CheckCircle, XCircle, Trash2, FolderOpen, Clock, Search } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Project } from '@/lib/types';

interface ProjectsTabProps {
  pendingProjects: Project[];
  allProjects: Project[];
  onDataChange: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export default function ProjectsTab({
  pendingProjects,
  allProjects,
  onDataChange,
  onError,
  onSuccess,
}: ProjectsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const approveProject = async (projectId: number) => {
    try {
      await adminApi.approveProject(projectId, { isApproved: true });
      onSuccess('Project approved');
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to approve project');
    }
  };

  const rejectProject = async (projectId: number) => {
    try {
      await adminApi.approveProject(projectId, { isApproved: false });
      onSuccess('Project rejected');
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to reject project');
    }
  };

  const deleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await adminApi.deleteProject(projectId);
      onSuccess('Project deleted');
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to delete project');
    }
  };

  const filteredProjects = allProjects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Pending Projects */}
      {pendingProjects.length > 0 && (
        <div className="card p-4 md:p-6 border-2 border-orange-500/30 bg-gradient-to-br from-orange-900/10 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 md:mb-6">
            <div className="p-2 bg-orange-500/20 rounded-lg w-fit">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-white">Pending Projects</h2>
              <p className="text-slate-400 text-xs md:text-sm">
                {pendingProjects.length} projects awaiting review
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {pendingProjects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-800/50 backdrop-blur-sm p-4 md:p-5 rounded-xl border border-slate-700/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-base md:text-lg mb-1 line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      by {project.member?.fullName || project.member?.user.username}
                    </p>
                  </div>
                  {project.category && (
                    <span className="px-2 md:px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/30 whitespace-nowrap flex-shrink-0">
                      {project.category}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-xs md:text-sm text-slate-400 mb-4 line-clamp-3">
                    {project.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => approveProject(project.id)}
                    className="flex-1 py-2 md:py-2.5 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 rounded-lg hover:from-green-500/30 hover:to-green-600/30 transition-all duration-300 text-xs md:text-sm font-medium border border-green-500/20"
                  >
                    <CheckCircle className="inline-block w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectProject(project.id)}
                    className="flex-1 py-2 md:py-2.5 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 rounded-lg hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300 text-xs md:text-sm font-medium border border-red-500/20"
                  >
                    <XCircle className="inline-block w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Projects */}
      <div className="card p-4 md:p-6 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FolderOpen className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">All Projects</h2>
              <p className="text-slate-400 text-xs md:text-sm">{allProjects.length} total projects</p>
            </div>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-800/50 backdrop-blur-sm p-4 md:p-5 rounded-xl border border-slate-700/50 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base md:text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    by {project.member?.fullName || project.member?.user.username}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.isApproved ? (
                      <span className="text-xs px-2 md:px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/30 text-green-400 border border-green-500/30 font-medium">
                        <CheckCircle className="inline-block w-3 h-3 mr-1" />
                        Approved
                      </span>
                    ) : (
                      <span className="text-xs px-2 md:px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/30 text-yellow-400 border border-yellow-500/30 font-medium">
                        <Clock className="inline-block w-3 h-3 mr-1" />
                        Pending
                      </span>
                    )}
                    {project.category && (
                      <span className="text-xs px-2 md:px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 font-medium">
                        {project.category}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-1.5 md:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 flex-shrink-0"
                >
                  <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>
              {project.description && (
                <p className="text-xs md:text-sm text-slate-400 line-clamp-2 mt-3">
                  {project.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}