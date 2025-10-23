import { useState } from "react";
import { CheckCircle, XCircle, Star, Users, Clock, Search } from "lucide-react";
import { adminApi } from "@/lib/api";

interface MembersTabProps {
  pendingMembers: any[];
  allUsers: any[];
  onDataChange: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  currentUserId: number;
}

export default function MembersTab({
  pendingMembers,
  allUsers,
  onDataChange,
  onError,
  onSuccess,
  currentUserId,
}: MembersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const approveMember = async (userId: number) => {
    try {
      await adminApi.approveMember(userId, { isActive: true, role: "MEMBER" });
      onSuccess("Member approved successfully");
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to approve member");
    }
  };

  const rejectMember = async (userId: number) => {
    try {
      await adminApi.approveMember(userId, {
        isActive: false,
        role: "PENDING",
      });
      onSuccess("Member rejected");
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to reject member");
    }
  };

  const updateUserRole = async (
    userId: number,
    role: string,
    isLead: boolean = false
  ) => {
    try {
      await adminApi.updateUserRole(userId, { role, isLead });
      onSuccess("User role updated");
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to update role");
    }
  };

  const filteredUsers = allUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Pending Members */}
      {pendingMembers.length > 0 && (
        <div className="card p-4 md:p-6 border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-900/10 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 md:mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-lg w-fit">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Pending Approvals
              </h2>
              <p className="text-slate-400 text-xs md:text-sm">
                {pendingMembers.length} members awaiting review
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {pendingMembers.map((user) => (
              <div
                key={user.id}
                className="bg-slate-800/50 backdrop-blur-sm p-4 md:p-5 rounded-xl border border-slate-700/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={user.avatarUrl || "/avatar.png"}
                    alt={user.username}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-600 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-base md:text-lg truncate">
                      {user.username}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveMember(user.id)}
                    className="flex-1 py-2 md:py-2.5 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 rounded-lg hover:from-green-500/30 hover:to-green-600/30 transition-all duration-300 text-xs md:text-sm font-medium border border-green-500/20"
                  >
                    <CheckCircle className="inline-block w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectMember(user.id)}
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

      {/* All Users */}
      <div className="card p-4 md:p-6 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                All Members
              </h2>
              <p className="text-slate-400 text-xs md:text-sm">
                {allUsers.length} total members
              </p>
            </div>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-slate-800/50 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-slate-700/50 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={user.avatarUrl || "/avatar.png"}
                    alt={user.username}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-600 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm md:text-base truncate">
                      {user.username}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 truncate">
                      {user.email}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span
                        className={`text-xs px-2 md:px-3 py-1 rounded-full font-medium ${
                          user.role === "ADMIN"
                            ? "bg-gradient-to-r from-accent/20 to-accent/30 text-accent border border-accent/30"
                            : user.role === "MEMBER"
                            ? "bg-gradient-to-r from-primary/20 to-primary/30 text-primary border border-primary/30"
                            : "bg-slate-700/50 text-slate-300 border border-slate-600"
                        }`}
                      >
                        {user.role}
                      </span>
                      {user.isLead && (
                        <span className="text-xs px-2 md:px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/30 text-yellow-400 border border-yellow-500/30 font-medium">
                          Lead
                        </span>
                      )}
                      {!user.isActive && (
                        <span className="text-xs px-2 md:px-3 py-1 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/30 text-red-400 border border-red-500/30 font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                  <select
                    onChange={(e) =>
                      updateUserRole(user.id, e.target.value, user.isLead)
                    }
                    value={user.role}
                    disabled={
                      user.id === currentUserId && user.role === "ADMIN"
                    } // <- prevents self-demotion
                    className={`flex-1 lg:flex-none px-3 py-2 text-sm rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary transition-colors ${
                      user.id === currentUserId && user.role === "ADMIN"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button
                    onClick={() =>
                      updateUserRole(user.id, user.role, !user.isLead)
                    }
                    className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-all duration-300 font-medium whitespace-nowrap ${
                      user.isLead
                        ? "bg-gradient-to-r from-accent/20 to-accent/30 text-accent border border-accent/30 hover:from-accent/30 hover:to-accent/40"
                        : "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
                    }`}
                  >
                    <Star
                      className={`inline-block w-3 h-3 md:w-4 md:h-4 mr-1 ${
                        user.isLead ? "fill-current" : ""
                      }`}
                    />
                    Lead
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
