// components/admin/MembersTab/MemberCard.tsx
import { useState } from "react";
import { User, UserRole } from "@/lib/types";
import { adminApi } from "@/lib/api";
import RoleAssignmentModal from "./RoleAssignmentModal";
import SuspensionModal from "./SuspensionModal";
import MemberModal from "./MemberModal";
import { Crown } from "lucide-react";

interface MemberCardProps {
  user: User;
  onDataChange: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  currentUserId: number;
  onViewMember?: (member: User) => void;
}

export default function MemberCard({
  user,
  onDataChange,
  onError,
  onSuccess,
  currentUserId,
  onViewMember,
}: MemberCardProps) {
  if (!user) {
    return null;
  }

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const handleRoleUpdate = async (
    role: UserRole,
    customRoleId?: number | null,
    reason?: string
  ) => {
    try {
      await adminApi.updateUserRole(user.id, {
        role,
        customRoleId,
        reason,
      });
      onSuccess(`User role updated to ${role}`);
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to update role");
    }
  };

  // Properly check if current user can modify this user
  const canModify = user.id !== currentUserId && user.role !== "ADMIN";

  // Safe member access
  const memberFullName = user.member?.fullName;

  const handleUserInfoClick = () => {
    if (onViewMember) {
      onViewMember(user);
    } else {
      setShowMemberModal(true);
    }
  };

  const handleSetLeadStatus = async (isLead: boolean) => {
    try {
      await adminApi.setUserLeadStatus(user.id, isLead);
      onSuccess(
        isLead
          ? "User set as community lead"
          : "User removed from community leads"
      );
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to update lead status");
    }
  };

  return (
    <>
      <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50 hover:border-primary/30 transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* User Info */}
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={handleUserInfoClick}
          >
            <img
              src={user.avatarUrl || "/avatar.png"}
              alt={user.username || "User"}
              className="w-12 h-12 rounded-full border-2 border-slate-600 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-base truncate">
                {user.username || "Unknown User"}
              </h3>
              <p className="text-sm text-slate-400 truncate">
                {user.email || "No email provided"}
              </p>
              {/* Safe access to member properties */}
              {memberFullName && (
                <p className="text-xs text-slate-500 truncate">
                  {memberFullName}
                </p>
              )}

              {/* Simplified Status Badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                {/* Main Role Badge */}
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user.role === "ADMIN"
                      ? "bg-gradient-to-r from-accent/20 to-accent/30 text-accent border border-accent/30"
                      : user.role === "MEMBER"
                      ? "bg-gradient-to-r from-primary/20 to-primary/30 text-primary border border-primary/30"
                      : user.role === "SUSPENDED"
                      ? "bg-gradient-to-r from-red-500/20 to-red-600/30 text-red-400 border border-red-500/30"
                      : "bg-gradient-to-r from-yellow-500/20 to-yellow-600/30 text-yellow-400 border border-yellow-500/30"
                  }`}
                >
                  {user.role === "PENDING"
                    ? "Pending Approval"
                    : user.role || "UNKNOWN"}
                </span>

                {/* Custom Role Badge */}
                {user.customRole && (
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium border"
                    style={{
                      backgroundColor: `${user.customRole.color}20`,
                      color: user.customRole.color,
                      borderColor: `${user.customRole.color}30`,
                    }}
                  >
                    {user.customRole.name}
                  </span>
                )}

                {/* Inactive Badge - Only show for non-suspended, non-pending inactive users */}
                {!user.isActive &&
                  user.role !== "SUSPENDED" &&
                  user.role !== "PENDING" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/30 text-orange-400 border border-orange-500/30 font-medium">
                      Inactive
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full lg:w-auto">
            {/* Role Assignment Button */}
            <button
              onClick={() => setShowRoleModal(true)}
              disabled={!canModify}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                canModify
                  ? "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 hover:border-slate-500"
                  : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
              }`}
            >
              Assign Role
            </button>

            {/* Lead Status Button */}
            {user.role === "MEMBER" && user.isActive && (
              <button
                onClick={() => handleSetLeadStatus(!user.isLead)}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-300 font-medium flex items-center gap-2 ${
                  user.isLead
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
                    : "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 hover:border-slate-500"
                }`}
              >
                <Crown size={16} />
                {user.isLead ? "Remove Lead" : "Make Lead"}
              </button>
            )}

            {/* Suspend/Activate Button */}
            {user.role !== "SUSPENDED" ? (
              <button
                onClick={() => setShowSuspensionModal(true)}
                disabled={!canModify}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                  canModify
                    ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                }`}
              >
                Suspend
              </button>
            ) : (
              <button
                onClick={() => handleRoleUpdate("MEMBER")}
                disabled={!canModify}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                  canModify
                    ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                }`}
              >
                Activate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRoleModal && (
        <RoleAssignmentModal
          user={user}
          onClose={() => setShowRoleModal(false)}
          onSave={handleRoleUpdate}
        />
      )}

      {showSuspensionModal && (
        <SuspensionModal
          user={user}
          onClose={() => setShowSuspensionModal(false)}
          onConfirm={(reason) =>
            handleRoleUpdate("SUSPENDED", undefined, reason)
          }
        />
      )}

      {showMemberModal && (
        <MemberModal
          user={user}
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          onApprove={(customRoleId) => handleRoleUpdate("MEMBER", customRoleId)}
          onReject={(reason) =>
            handleRoleUpdate("SUSPENDED", undefined, reason)
          }
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
