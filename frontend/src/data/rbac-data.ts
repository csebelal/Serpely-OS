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

export interface RegisteredUserRecord extends AuthUser {
  password?: string;
  isCustom?: boolean;
}

export const getStoredRoles = (): Record<string, RolePermissionConfig> => {
  try {
    const raw = localStorage.getItem('serpely_custom_roles');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...BASE_ROLE_CONFIGS, ...parsed };
    }
  } catch {}
  return { ...BASE_ROLE_CONFIGS };
};

export const getStoredUsers = (): RegisteredUserRecord[] => {
  try {
    const raw = localStorage.getItem('serpely_registered_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasAdmin = parsed.some(
          u => u.email && u.email.toLowerCase() === DEFAULT_ADMIN_USER.email.toLowerCase()
        );
        if (!hasAdmin) {
          return [{ ...DEFAULT_ADMIN_USER, password: DEFAULT_ADMIN_PASSWORD }, ...parsed];
        }
        return parsed;
      }
    }
  } catch {}
  return [{ ...DEFAULT_ADMIN_USER, password: DEFAULT_ADMIN_PASSWORD }];
};

export const saveCustomRole = (config: RolePermissionConfig) => {
  try {
    const current = getStoredRoles();
    current[config.role] = config;
    localStorage.setItem('serpely_custom_roles', JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('serpely_roles_updated', { detail: current }));
  } catch {}
};

export const deleteCustomRole = (roleKey: string) => {
  try {
    const current = getStoredRoles();
    if (BASE_ROLE_CONFIGS[roleKey]) {
      // Cannot delete base roles
      return;
    }
    delete current[roleKey];
    localStorage.setItem('serpely_custom_roles', JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('serpely_roles_updated', { detail: current }));
  } catch {}
};

export const saveCustomUser = (user: RegisteredUserRecord) => {
  try {
    const current = getStoredUsers();
    const existingIdx = current.findIndex(
      u => u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (existingIdx >= 0) {
      current[existingIdx] = user;
    } else {
      current.push(user);
    }
    localStorage.setItem('serpely_registered_users', JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('serpely_users_updated', { detail: current }));
  } catch {}
};

export const authenticateCredentials = (
  email: string,
  pass: string
): { success: boolean; user?: AuthUser; error?: string } => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (pass || '').trim();

  if (!cleanEmail) {
    return { success: false, error: 'Email address is required.' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Password is required.' };
  }

  // Check default admin
  if (
    cleanEmail === DEFAULT_ADMIN_USER.email.toLowerCase() &&
    cleanPass === DEFAULT_ADMIN_PASSWORD
  ) {
    return { success: true, user: DEFAULT_ADMIN_USER };
  }

  // Check custom registered users
  const users = getStoredUsers();
  const matched = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (matched) {
    if (!matched.password || matched.password === cleanPass) {
      const { password, ...safeUser } = matched;
      return { success: true, user: safeUser };
    }
    return { success: false, error: 'Invalid password. Please check your credentials.' };
  }

  return {
    success: false,
    error: 'No account found with this email. Please click "Sign up now" below to create a new account.'
  };
};

export const getAuthUserByRole = (role: UserRole): AuthUser => {
  if (role === 'owner') return DEFAULT_ADMIN_USER;

  const users = getStoredUsers();
  const matched = users.find(u => u.role === role);
  if (matched) {
    const { password, ...safeUser } = matched;
    return safeUser;
  }

  const roles = getStoredRoles();
  const roleCfg = roles[role] || BASE_ROLE_CONFIGS.owner;
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

// Maintained for backward compatibility
export const DEMO_USERS: Record<string, AuthUser> = {
  owner: DEFAULT_ADMIN_USER
};

export const ROLE_CONFIGS: Record<string, RolePermissionConfig> = BASE_ROLE_CONFIGS;
