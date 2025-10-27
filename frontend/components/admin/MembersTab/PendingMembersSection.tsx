import { useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { adminApi } from "../../../lib/api";
import MembersList from "./MemberList";
import MemberModal from "./MemberModal";
import { User } from "../../../lib/types";

interface PendingMembersSectionProps {
  pendingMembers: User[];
  onDataChange: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  currentUserId: number;
}

export default function PendingMembersSection({
  pendingMembers,
  onDataChange,
  onError,
  onSuccess,
  currentUserId,
}: PendingMembersSectionProps) {
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApprove = async (userId: number, customRoleId?: number) => {
    try {
      await adminApi.updateUserRole(userId, {
        role: "MEMBER",
        customRoleId: customRoleId || null,
      });
      onSuccess("Member approved successfully");
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to approve member");
    }
  };

  const handleReject = async (userId: number, reason: string) => {
    try {
      await adminApi.updateUserRole(userId, {
        role: "SUSPENDED",
        reason,
      });
      onSuccess("Member application rejected");
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to reject member");
    }
  };

  const openMemberModal = (member: User) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeMemberModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  return (
    <>
      <div className="card p-6 border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-900/10 to-transparent">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
            <p className="text-slate-400 text-sm">
              {pendingMembers.length} members awaiting review and approval
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 rounded-full">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">
              Action Required
            </span>
          </div>
        </div>

        <MembersList
          users={pendingMembers}
          onDataChange={onDataChange}
          onError={onError}
          onSuccess={onSuccess}
          currentUserId={currentUserId}
          showFilters={false}
          onViewMember={openMemberModal}
        />
      </div>

      {/* Only render MemberModal when selectedMember is not null */}
      {selectedMember && (
        <MemberModal
          user={selectedMember}
          isOpen={isModalOpen}
          onClose={closeMemberModal}
          onApprove={(customRoleId) => handleApprove(selectedMember.id, customRoleId)}
          onReject={(reason) => handleReject(selectedMember.id, reason)}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}