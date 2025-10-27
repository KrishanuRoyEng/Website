import { useState, useEffect } from "react";
import { User, UserRole, CustomRole } from "@/lib/types";
import { adminApi } from "@/lib/api";
import { X, Save, Shield } from "lucide-react";

interface RoleAssignmentModalProps {
  user: User;
  onClose: () => void;
  onSave: (role: UserRole, customRoleId?: number | null) => void;
}

export default function RoleAssignmentModal({
  user,
  onClose,
  onSave,
}: RoleAssignmentModalProps) {
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    user.role === "PENDING" ? "MEMBER" : user.role
  );
  const [selectedCustomRole, setSelectedCustomRole] = useState<number | null>(
    user.customRoleId || null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomRoles();
  }, []);

  const loadCustomRoles = async () => {
    try {
      const res = await adminApi.getCustomRoles();
      setCustomRoles(res.data);
    } catch (error) {
      console.error("Failed to load custom roles:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(selectedRole, selectedCustomRole);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const isCustomRoleDisabled = selectedRole !== "MEMBER";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">
              Assign Role to {user.username}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Main Role */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Main Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            {user.role === "PENDING" && (
              <p className="text-xs text-green-400 mt-1">
                User will be approved and activated
              </p>
            )}
          </div>

          {/* Custom Role */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Custom Role
            </label>
            <select
              value={selectedCustomRole || ""}
              onChange={(e) => setSelectedCustomRole(e.target.value ? Number(e.target.value) : null)}
              disabled={isCustomRoleDisabled}
              className={`w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary ${
                isCustomRoleDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="">No Custom Role</option>
              {customRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {isCustomRoleDisabled && (
              <p className="text-xs text-slate-400 mt-1">
                Custom roles are only available for MEMBER role
              </p>
            )}
          </div>

          {/* Role Description */}
          {selectedCustomRole && (
            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <h4 className="text-sm font-medium text-slate-300 mb-1">
                Role Permissions
              </h4>
              <p className="text-xs text-slate-400">
                {customRoles.find(r => r.id === selectedCustomRole)?.permissions.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 text-slate-300 py-2 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}