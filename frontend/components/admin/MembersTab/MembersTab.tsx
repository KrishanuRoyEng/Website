import { useState } from "react";
import { Users, Clock } from "lucide-react";
import MembersList from "./MemberList";
import PendingMembersSection from "./PendingMembersSection";

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
  const [activeView, setActiveView] = useState<"all" | "pending">("all");

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2 p-1 bg-slate-800 rounded-lg w-fit">
        <button
          onClick={() => setActiveView("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeView === "all"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="inline-block w-4 h-4 mr-2" />
          All Members ({allUsers.length})
        </button>
        {pendingMembers.length > 0 && (
          <button
            onClick={() => setActiveView("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === "pending"
                ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="inline-block w-4 h-4 mr-2" />
            Pending ({pendingMembers.length})
          </button>
        )}
      </div>

      {/* Content */}
      {activeView === "pending" ? (
        <PendingMembersSection
          pendingMembers={pendingMembers}
          onDataChange={onDataChange}
          onError={onError}
          onSuccess={onSuccess}
          currentUserId={currentUserId}
        />
      ) : (
        <MembersList
          users={allUsers}
          onDataChange={onDataChange}
          onError={onError}
          onSuccess={onSuccess}
          currentUserId={currentUserId}
          showFilters={true}
        />
      )}
    </div>
  );
}