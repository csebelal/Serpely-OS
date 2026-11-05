import { UserRole, AuthUser, RolePermissionConfig } from '../types';

export const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'usr-admin-01',
  name: 'Serpely Support',
  email: 'support@serpely.com',
  role: 'owner',
  title: 'Full Access Administrator',
  initials: 'SS',
  permissions: {
    canManageSettings: true,
    canManageApiKeys: true,
    canApproveSpends: true,
    canCreateAssets: true,
    canPublishLive: true,
    isReadOnly: false
  }
};

export const DEFAULT_ADMIN_PASSWORD = '123454321';

export const BASE_ROLE_CONFIGS: Record<string, RolePermissionConfig> = {
  owner: {
    role: 'owner',
    label: 'Owner',
    tagline: 'Full workspace control',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    canApproveSpend: true,
    canManageSettings: true,
    canManageApiKeys: true,
    canCreateAndDraft: true,
    canPublishLive: true,
    isReadOnly: false
  },
  director: {
    role: 'director',
    label: 'Director',
    tagline: 'Approvals & ad spend sign-off',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    canApproveSpend: true,
    canManageSettings: true,
    canManageApiKeys: true,
    canCreateAndDraft: true,
    canPublishLive: true,
    isReadOnly: false
  },
  editor: {
    role: 'editor',
    label: 'Editor',
    tagline: 'Draft & schedule assets',
    badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    canApproveSpend: false,
    canManageSettings: false,
    canManageApiKeys: false,
    canCreateAndDraft: true,
    canPublishLive: false,
    isReadOnly: false
  },
  viewer: {
    role: 'viewer',
    label: 'Viewer',
    tagline: 'Read-only analytics',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    canApproveSpend: false,
    canManageSettings: false,
    canManageApiKeys: false,
    canCreateAndDraft: false,
    canPublishLive: false,
    isReadOnly: true
  }
};

export const getAuthUserByRole = (role: UserRole): AuthUser => {
  if (role === 'owner') return DEFAULT_ADMIN_USER;
  const roleCfg = BASE_ROLE_CONFIGS[role] || BASE_ROLE_CONFIGS.owner;
  return {
    id: `usr-${role}-default`,
    name: `${roleCfg.label} Admin`,
    email: `${role}@serpely.com`,
    role,
    title: roleCfg.label,
    initials: role.substring(0, 2).toUpperCase(),
    permissions: {
      canManageSettings: roleCfg.canManageSettings,
      canManageApiKeys: roleCfg.canManageApiKeys,
      canApproveSpends: roleCfg.canApproveSpend,
      canCreateAssets: roleCfg.canCreateAndDraft,
      canPublishLive: roleCfg.canPublishLive,
      isReadOnly: roleCfg.isReadOnly
    }
  };
};

export const DEMO_USERS: Record<string, AuthUser> = {
  owner: DEFAULT_ADMIN_USER
};

export const ROLE_CONFIGS: Record<string, RolePermissionConfig> = BASE_ROLE_CONFIGS;
