import React, { useState } from 'react';
import {
  X,
  ShieldPlus,
  Check,
  User,
  Mail,
  Lock,
  Sparkles,
  Crown,
  ShieldCheck,
  FileEdit,
  Eye,
  KeyRound
} from 'lucide-react';
import { RolePermissionConfig, AuthUser } from '../../types';
import { saveCustomRole, saveCustomUser } from '../../data/rbac-data';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleCreated?: (role: RolePermissionConfig, user?: AuthUser) => void;
}

const BADGE_COLORS = [
  { label: 'Emerald (Operations)', value: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { label: 'Amber (Executive)', value: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { label: 'Sky (Creative)', value: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  { label: 'Purple (Analytics)', value: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  { label: 'Rose (Security)', value: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  { label: 'Indigo (Growth)', value: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' }
];

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onRoleCreated
}) => {
  const [roleLabel, setRoleLabel] = useState('');
  const [roleKey, setRoleKey] = useState('');
  const [tagline, setTagline] = useState('');
  const [badgeColor, setBadgeColor] = useState(BADGE_COLORS[0].value);

  // Permissions
  const [canManageSettings, setCanManageSettings] = useState(false);
  const [canManageApiKeys, setCanManageApiKeys] = useState(false);
  const [canApproveSpend, setCanApproveSpend] = useState(false);
  const [canCreateAndDraft, setCanCreateAndDraft] = useState(true);
  const [canPublishLive, setCanPublishLive] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Optional User Assignment
  const [createUser, setCreateUser] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLabelChange = (val: string) => {
    setRoleLabel(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    setRoleKey(slug);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanLabel = roleLabel.trim();
    const cleanKey = (roleKey || cleanLabel.toLowerCase().replace(/\s+/g, '_')).trim();

    if (!cleanLabel) {
      setError('Please provide a role name (e.g., Marketing Strategist).');
      return;
    }
    if (!cleanKey) {
      setError('Please provide a unique role key identifier.');
      return;
    }

    const newRoleConfig: RolePermissionConfig = {
      role: cleanKey,
      label: cleanLabel,
      tagline: tagline.trim() || `Workspace authority for ${cleanLabel}`,
      badgeColor,
      canApproveSpend: isReadOnly ? false : canApproveSpend,
      canManageSettings: isReadOnly ? false : canManageSettings,
      canManageApiKeys: isReadOnly ? false : canManageApiKeys,
      canCreateAndDraft: isReadOnly ? false : canCreateAndDraft,
      canPublishLive: isReadOnly ? false : canPublishLive,
      isReadOnly
    };

    saveCustomRole(newRoleConfig);

    let createdUserObj: AuthUser | undefined;
    if (createUser && userEmail.trim()) {
      const initials = (userName.trim() || cleanLabel)
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'UR';

      createdUserObj = {
        id: `usr-${cleanKey}-${Date.now()}`,
        name: userName.trim() || `${cleanLabel} Lead`,
        email: userEmail.trim().toLowerCase(),
        role: cleanKey,
        title: cleanLabel,
        initials,
        permissions: {
          canManageSettings: newRoleConfig.canManageSettings,
          canManageApiKeys: newRoleConfig.canManageApiKeys,
          canApproveSpends: newRoleConfig.canApproveSpend,
          canCreateAssets: newRoleConfig.canCreateAndDraft,
          canPublishLive: newRoleConfig.canPublishLive,
          isReadOnly: newRoleConfig.isReadOnly
        }
      };

      saveCustomUser({
        ...createdUserObj,
        password: userPassword.trim() || '123454321',
        isCustom: true
      });
    }

    if (onRoleCreated) {
      onRoleCreated(newRoleConfig, createdUserObj);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-7 text-neutral-100 my-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Create Workspace Role & Authority
              </h2>
              <p className="text-xs text-neutral-400">
                Define fine-grained permission boundaries and assign team credentials.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Role Metadata */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
              1. Role Definition
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Role Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Growth Specialist"
                  value={roleLabel}
                  onChange={e => handleLabelChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Role Identifier (Key) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="growth_specialist"
                  value={roleKey}
                  onChange={e => setRoleKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Tagline / Scope
              </label>
              <input
                type="text"
                placeholder="e.g. Manages inbound ad pipelines & content drafting"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Badge Color Theme
              </label>
              <select
                value={badgeColor}
                onChange={e => setBadgeColor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                {BADGE_COLORS.map(c => (
                  <option key={c.label} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Permission Gates */}
          <div className="space-y-2.5 pt-2 border-t border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
              2. Permission Boundaries
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 cursor-pointer hover:border-neutral-700">
                <input
                  type="checkbox"
                  checked={canManageSettings}
                  onChange={e => setCanManageSettings(e.target.checked)}
                  className="rounded bg-neutral-900 border-neutral-700 text-emerald-500 focus:ring-0"
                />
                <span className="text-neutral-200">Manage Workspace Settings</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 cursor-pointer hover:border-neutral-700">
                <input
                  type="checkbox"
                  checked={canManageApiKeys}
                  onChange={e => setCanManageApiKeys(e.target.checked)}
                  className="rounded bg-neutral-900 border-neutral-700 text-emerald-500 focus:ring-0"
                />
                <span className="text-neutral-200">Manage API Keys & Vault</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 cursor-pointer hover:border-neutral-700">
                <input
                  type="checkbox"
                  checked={canApproveSpend}
                  onChange={e => setCanApproveSpend(e.target.checked)}
                  className="rounded bg-neutral-900 border-neutral-700 text-emerald-500 focus:ring-0"
                />
                <span className="text-neutral-200">Approve Ad Spend & Budgets</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 cursor-pointer hover:border-neutral-700">
                <input
                  type="checkbox"
                  checked={canCreateAndDraft}
                  onChange={e => setCanCreateAndDraft(e.target.checked)}
                  className="rounded bg-neutral-900 border-neutral-700 text-emerald-500 focus:ring-0"
                />
                <span className="text-neutral-200">Draft & Schedule Assets</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 cursor-pointer hover:border-neutral-700">
                <input
                  type="checkbox"
                  checked={canPublishLive}
                  onChange={e => setCanPublishLive(e.target.checked)}
                  className="rounded bg-neutral-900 border-neutral-700 text-emerald-500 focus:ring-0"
                />
                <span className="text-neutral-200">Publish Live Directly</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 cursor-pointer hover:border-neutral-700">
                <input
                  type="checkbox"
                  checked={isReadOnly}
                  onChange={e => setIsReadOnly(e.target.checked)}
                  className="rounded bg-neutral-900 border-neutral-700 text-purple-500 focus:ring-0"
                />
                <span className="text-neutral-200 font-semibold">Strict Read-Only Mode</span>
              </label>
            </div>
          </div>

          {/* Section 3: User Assignment (Optional) */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                3. Team Member Assignment (Optional)
              </h3>
              <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createUser}
                  onChange={e => setCreateUser(e.target.checked)}
                  className="rounded bg-neutral-900 border-neutral-700 text-emerald-500 focus:ring-0"
                />
                <span>Create User Now</span>
              </label>
            </div>

            {createUser && (
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Connor"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="user@serpely.com"
                      value={userEmail}
                      onChange={e => setUserEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Default: 123454321"
                      value={userPassword}
                      onChange={e => setUserPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>Save & Register Role</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
