// components/admin/RolesTab.tsx
import { useState, useEffect } from "react";
import { CustomRole, Permission } from "@/lib/types";
import { adminApi } from "@/lib/api";
import { Plus, Edit2, Trash2, Users, Save, X, Shield } from "lucide-react";

const PERMISSIONS = [
  { value: Permission.VIEW_DASHBOARD, label: "View Dashboard" },
  { value: Permission.MANAGE_MEMBERS, label: "Manage Members" },
  { value: Permission.MANAGE_PROJECTS, label: "Manage Projects" },
  { value: Permission.MANAGE_EVENTS, label: "Manage Events" },
  { value: Permission.MANAGE_SKILLS, label: "Manage Skills" },
  { value: Permission.MANAGE_TAGS, label: "Manage Tags" },
  { value: Permission.MANAGE_ROLES, label: "Manage Roles" },
];

interface RolesTabProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onDataChange: () => Promise<void>; // Add this line
}

export default function RolesTab({
  onSuccess,
  onError,
  onDataChange,
}: RolesTabProps) {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleUsers, setRoleUsers] = useState<{ [key: number]: any[] }>({});

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const res = await adminApi.getCustomRoles();
      setRoles(res.data);
    } catch (error) {
      onError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const loadRoleUsers = async (roleId: number) => {
    try {
      const res = await adminApi.getRoleUsers(roleId);
      const users = res.data;
      setRoleUsers((prev) => ({ ...prev, [roleId]: users }));
    } catch (error) {
      console.error("Failed to load role users:", error);
    }
  };

  const handleSaveRole = async (roleData: any) => {
    try {
      if (isCreating) {
        await adminApi.createCustomRole(roleData);
      } else {
        await adminApi.updateCustomRole(editingRole!.id, roleData);
      }

      await loadRoles();
      setEditingRole(null);
      setIsCreating(false);
      onSuccess(
        isCreating ? "Role created successfully" : "Role updated successfully"
      );
      await onDataChange();
    } catch (error: any) {
      onError(
        error.response?.data?.error ||
          `Failed to ${isCreating ? "create" : "update"} role`
      );
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const res = await adminApi.deleteCustomRole(roleId);
      await loadRoles();
      onSuccess("Role deleted successfully");
      await onDataChange(); // Call the data change callback
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to delete role");
    }
  };

  if (loading) return <div className="text-slate-400">Loading roles...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Custom Roles</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          New Role
        </button>
      </div>

      {(isCreating || editingRole) && (
        <RoleForm
          role={editingRole}
          onSave={handleSaveRole}
          onCancel={() => {
            setEditingRole(null);
            setIsCreating(false);
          }}
        />
      )}

      <div className="grid gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-slate-800 rounded-lg p-4 border border-slate-700"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {role.name}
                  </h3>
                  {role.description && (
                    <p className="text-slate-400 text-sm">{role.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingRole(role)}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-slate-700 rounded-lg"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => loadRoleUsers(role.id)}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg"
                >
                  <Users size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {role.permissions.map((permission) => (
                <span key={permission} className="badge-secondary text-xs">
                  {PERMISSIONS.find((p) => p.value === permission)?.label ||
                    permission}
                </span>
              ))}
            </div>

            {roleUsers[role.id] && (
              <div className="border-t border-slate-700 pt-3">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">
                  Assigned Users
                </h4>
                <div className="flex flex-wrap gap-2">
                  {roleUsers[role.id].map((user: any) => (
                    <span key={user.id} className="badge-primary text-xs">
                      {user.username}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleForm({
  role,
  onSave,
  onCancel,
}: {
  role: CustomRole | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: role?.name || "",
    description: role?.description || "",
    color: role?.color || "#6B7280",
    permissions: role?.permissions || [],
  });

  const togglePermission = (permission: Permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Role name is required");
      return;
    }
    if (formData.permissions.length === 0) {
      alert("At least one permission is required");
      return;
    }
    onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800 rounded-lg p-6 border border-slate-700"
    >
      <h3 className="text-lg font-semibold text-white mb-4">
        {role ? "Edit Role" : "Create New Role"}
      </h3>

      <div className="grid gap-4 mb-6">
        <input
          type="text"
          placeholder="Role Name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
          required
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={2}
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none"
        />

        <div className="flex items-center gap-3">
          <label className="text-slate-300">Color:</label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, color: e.target.value }))
            }
            className="w-12 h-12 rounded cursor-pointer"
          />
          <span className="text-slate-400 text-sm">{formData.color}</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-slate-300 font-semibold mb-3">Permissions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PERMISSIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 p-2 bg-slate-700 rounded-lg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.permissions.includes(value)}
                onChange={() => togglePermission(value)}
                className="rounded bg-slate-600 border-slate-500"
              />
              <span className="text-slate-300 text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save size={16} />
          {role ? "Update Role" : "Create Role"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex items-center gap-2"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </form>
  );
}
