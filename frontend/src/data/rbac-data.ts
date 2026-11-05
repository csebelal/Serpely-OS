import { UserRole, AuthUser, RolePermissionConfig } from '../types';

export const ROLE_CONFIGS: Record<UserRole, RolePermissionConfig> = {
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
    label: 'Director (Active)',
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

export const DEMO_USERS: Record<UserRole, AuthUser> = {
  owner: {
    id: 'usr-owner-01',
    name: 'Alex Vance',
    email: 'owner@serpely.com',
    role: 'owner',
    title: 'Workspace Owner & Founder',
    initials: 'OW',
    permissions: {
      canManageSettings: true,
      canManageApiKeys: true,
      canApproveSpends: true,
      canCreateAssets: true,
      canPublishLive: true,
      isReadOnly: false
    }
  },
  director: {
    id: 'usr-director-02',
    name: 'Belal Hossain',
    email: 'director@serpely.com',
    role: 'director',
    title: 'Marketing Director',
    initials: 'MD',
    permissions: {
      canManageSettings: true,
      canManageApiKeys: true,
      canApproveSpends: true,
      canCreateAssets: true,
      canPublishLive: true,
      isReadOnly: false
    }
  },
  editor: {
    id: 'usr-editor-03',
    name: 'Sarah Jenkins',
    email: 'editor@serpely.com',
    role: 'editor',
    title: 'Growth & Content Editor',
    initials: 'ED',
    permissions: {
      canManageSettings: false,
      canManageApiKeys: false,
      canApproveSpends: false,
      canCreateAssets: true,
      canPublishLive: false,
      isReadOnly: false
    }
  },
  viewer: {
    id: 'usr-viewer-04',
    name: 'Marcus Chen',
    email: 'viewer@serpely.com',
    role: 'viewer',
    title: 'Analytics & Compliance Viewer',
    initials: 'VW',
    permissions: {
      canManageSettings: false,
      canManageApiKeys: false,
      canApproveSpends: false,
      canCreateAssets: false,
      canPublishLive: false,
      isReadOnly: true
    }
  }
};

export const getAuthUserByRole = (role: UserRole): AuthUser => {
  return DEMO_USERS[role] || DEMO_USERS.director;
};
