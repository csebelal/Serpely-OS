import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Users,
  CheckCircle2,
  Sparkles,
  Save,
  RotateCcw,
  KeyRound,
  Trash2,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Share2,
  AlertCircle,
  Crown,
  FileEdit,
  BarChart3,
  LogIn,
  Database,
  Sun,
  Moon,
  Palette,
  PlusCircle
} from 'lucide-react';
import { mockAgents } from '../../data/mock-data';
import { BrandProfile, UserRole, RolePermissionConfig } from '../../types';
import { getStoredRoles, deleteCustomRole, BASE_ROLE_CONFIGS } from '../../data/rbac-data';
import { CreateRoleModal } from '../auth/CreateRoleModal';
import { apiClient } from '../../services/apiClient';

const DEFAULT_BLANK_BRAND: BrandProfile = {
  name: 'My Workspace',
  website: '',
  industry: 'Technology',
  description: '',
  voiceTone: 'Professional, Authoritative & Engaging',
  targetAudience: 'Global Audience',
  tagline: 'Autonomous AI Growth & Marketing Engine',
  mission: 'Scale revenue and brand authority through autonomous AI marketing orchestration.',
  keyThemes: [],
  brandColors: ['#10b981', '#064e3b', '#0f172a']
};

interface SettingsViewProps {
  brandProfile?: BrandProfile;
  onUpdateBrandProfile?: (profile: BrandProfile) => void;
  onResetWorkspace?: () => void;
  currentRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  onOpenLogin?: () => void;
  appTheme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  brandProfile = DEFAULT_BLANK_BRAND,
  onUpdateBrandProfile,
  onResetWorkspace,
  currentRole = 'director',
  onSwitchRole,
  onOpenLogin,
  appTheme = 'dark',
  onToggleTheme
}) => {
  const [defaultProvider, setDefaultProvider] = useState<
    'gemini' | 'openai' | 'nvidia' | 'anthropic' | 'ollama'
  >('gemini');
  const [brandName, setBrandName] = useState(brandProfile.name);
  const [brandWebsite, setBrandWebsite] = useState(
    brandProfile.website || 'https://serpely.com'
  );
  const [brandTagline, setBrandTagline] = useState(brandProfile.tagline);
  const [brandVoice, setBrandVoice] = useState(brandProfile.voiceTone);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [rolesMap, setRolesMap] = useState<Record<string, RolePermissionConfig>>(() => getStoredRoles());

  useEffect(() => {
    const handleRolesUpdate = () => setRolesMap(getStoredRoles());
    window.addEventListener('serpely_roles_updated', handleRolesUpdate);
    return () => window.removeEventListener('serpely_roles_updated', handleRolesUpdate);
  }, []);

  // Live API Keys & Integrations Vault (Auto-Syncs to .env)
  const [credGeminiKey, setCredGeminiKey] = useState('');
  const [credGeminiImageKey, setCredGeminiImageKey] = useState('');
  const [credFbId, setCredFbId] = useState('');
  const [credFbSecret, setCredFbSecret] = useState('');
  const [credLiId, setCredLiId] = useState('');
  const [credLiSecret, setCredLiSecret] = useState('');
  const [credGoogleId, setCredGoogleId] = useState('');
  const [credGoogleSecret, setCredGoogleSecret] = useState('');
  const [showSecretMap, setShowSecretMap] = useState<Record<string, boolean>>({});
  const [vaultNotice, setVaultNotice] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isSavingVault, setIsSavingVault] = useState(false);

  const fetchCredentialsVault = async () => {
    try {
      const res = await apiClient.get('/api/settings/credentials');
      if (res.success && res.data) {
        const data = res.data;
        if (data.geminiApiKey) setCredGeminiKey(data.geminiApiKey);
        if (data.geminiImageApiKey) setCredGeminiImageKey(data.geminiImageApiKey);
        if (data.facebookClientId) setCredFbId(data.facebookClientId);
        if (data.facebookClientSecret) setCredFbSecret(data.facebookClientSecret);
        if (data.linkedinClientId) setCredLiId(data.linkedinClientId);
        if (data.linkedinClientSecret) setCredLiSecret(data.linkedinClientSecret);
        if (data.googleClientId) setCredGoogleId(data.googleClientId);
        if (data.googleClientSecret) setCredGoogleSecret(data.googleClientSecret);
      }
    } catch {}
  };

  const [dbInfo, setDbInfo] = useState<{
    engine: string;
    connected: boolean;
    hasConfiguredUrl: boolean;
    host: string;
    databaseUrlMasked: string;
  } | null>(null);
  const [databaseUrlInput, setDatabaseUrlInput] = useState('');
  const [isConnectingDb, setIsConnectingDb] = useState(false);
  const [dbNotice, setDbNotice] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const fetchDatabaseInfo = async () => {
    try {
      const res = await apiClient.get('/api/settings/database');
      if (res.success && res.data) {
        setDbInfo(res.data);
      }
    } catch {}
  };

  const handleConnectDatabase = async () => {
    if (!databaseUrlInput.trim()) {
      setDbNotice({ msg: 'Please enter a valid PostgreSQL URL (e.g. postgresql://user:pass@host:5432/dbname)', type: 'error' });
      return;
    }
    setIsConnectingDb(true);
    setDbNotice(null);
    try {
      const res = await apiClient.post('/api/settings/database', { databaseUrl: databaseUrlInput });
      const data = res.data;
      if (res.success && data?.success) {
        setDbNotice({ msg: data.message, type: 'success' });
        setDatabaseUrlInput('');
        await fetchDatabaseInfo();
      } else {
        setDbNotice({ msg: data?.message || res.error || 'Connection failed', type: 'error' });
      }
    } catch (err: any) {
      setDbNotice({ msg: `Connection error: ${err?.message || 'Network error'}`, type: 'error' });
    } finally {
      setIsConnectingDb(false);
      setTimeout(() => setDbNotice(null), 6000);
    }
  };

  const handleDisconnectDatabase = async () => {
    if (!window.confirm('Disconnect external database and clear URL from .env?')) return;
    setIsConnectingDb(true);
    try {
      const res = await apiClient.post('/api/settings/database', { databaseUrl: '' });
      const data = res.data;
      setDbNotice({ msg: data?.message || 'Database disconnected', type: 'success' });
      await fetchDatabaseInfo();
    } catch (err: any) {
      setDbNotice({ msg: `Error disconnecting: ${err?.message}`, type: 'error' });
    } finally {
      setIsConnectingDb(false);
      setTimeout(() => setDbNotice(null), 5000);
    }
  };

  useEffect(() => {
    fetchCredentialsVault();
    fetchDatabaseInfo();
  }, []);

  const toggleShowSecret = (key: string) => {
    setShowSecretMap(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveVaultItem = async (provider: string) => {
    setIsSavingVault(true);
    setVaultNotice(null);
    let payload: Record<string, string> = {};
    if (provider === 'gemini') payload = { geminiApiKey: credGeminiKey };
    if (provider === 'gemini_image') payload = { geminiImageApiKey: credGeminiImageKey };
    if (provider === 'facebook') payload = { facebookClientId: credFbId, facebookClientSecret: credFbSecret };
    if (provider === 'linkedin') payload = { linkedinClientId: credLiId, linkedinClientSecret: credLiSecret };
    if (provider === 'google') payload = { googleClientId: credGoogleId, googleClientSecret: credGoogleSecret };

    try {
      const res = await apiClient.post('/api/settings/credentials', payload);
      const data = res.data;
      setVaultNotice({ msg: data?.message || `${provider.toUpperCase()} saved & synced to .env!`, type: 'success' });
      await fetchCredentialsVault();
    } catch (err: any) {
      setVaultNotice({ msg: `Failed saving to .env: ${err?.message}`, type: 'error' });
    } finally {
      setIsSavingVault(false);
      setTimeout(() => setVaultNotice(null), 4000);
    }
  };

  const handleRemoveVaultItem = async (provider: string) => {
    if (!window.confirm(`Are you sure you want to remove ${provider.toUpperCase()} credentials from .env and disconnect?`)) return;
    setIsSavingVault(true);
    setVaultNotice(null);
    try {
      const res = await apiClient.post('/api/integrations/credentials/remove', { provider });
      const data = res.data;
      if (provider === 'gemini') setCredGeminiKey('');
      if (provider === 'gemini_image') setCredGeminiImageKey('');
      if (provider === 'facebook') { setCredFbId(''); setCredFbSecret(''); }
      if (provider === 'linkedin') { setCredLiId(''); setCredLiSecret(''); }
      if (provider === 'google') { setCredGoogleId(''); setCredGoogleSecret(''); }
      setVaultNotice({ msg: data?.message || `${provider.toUpperCase()} credentials removed from .env!`, type: 'success' });
    } catch (err: any) {
      setVaultNotice({ msg: `Failed removing: ${err?.message}`, type: 'error' });
    } finally {
      setIsSavingVault(false);
      setTimeout(() => setVaultNotice(null), 4000);
    }
  };

  useEffect(() => {
    setBrandName(brandProfile.name);
    setBrandWebsite(brandProfile.website || 'https://serpely.com');
    setBrandTagline(brandProfile.tagline);
    setBrandVoice(brandProfile.voiceTone);
  }, [brandProfile]);

  const [agentModels, setAgentModels] = useState<Record<string, string>>({
    orchestrator: 'gemini-3.8-flash (Default)',
    research: 'gemini-3.8-flash (Default)',
    strategy: 'gemini-3.8-flash (Default)',
    content: 'gemini-3.8-flash (Default)',
    social: 'gemini-3.8-flash (Default)',
    community: 'gemini-3.8-flash (Default)',
    leads: 'gemini-3.8-flash (Default)',
    ads: 'gemini-3.8-flash (Default)',
    seo: 'gemini-3.8-flash (Default)',
    email: 'gemini-3.8-flash (Default)',
    analytics: 'gemini-3.8-flash (Default)',
    memory: 'gemini-3.8-flash (Default)'
  });

  const availableModels = [
    'gemini-3.8-flash (Default)',
    'gemini-4-argon (Paid reasoning)',
    'gpt-4o (OpenAI)',
    'gpt-4o-mini (Fast inference)',
    'nvidia/llama-3.1-nemotron-70b (NVIDIA NIM)',
    'claude-3-5-sonnet (Anthropic)',
    'llama-3.2:3b (Ollama local)'
  ];

  const handleSave = () => {
    if (onUpdateBrandProfile) {
      onUpdateBrandProfile({
        ...brandProfile,
        name: brandName.trim() || 'Serpely AI',
        website: brandWebsite.trim() || 'https://serpely.com',
        tagline: brandTagline.trim(),
        voiceTone: brandVoice.trim()
      });
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>

        <div className="flex items-center gap-2">
          {onResetWorkspace && (
            <button
              onClick={onResetWorkspace}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold transition-all shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Demo</span>
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shrink-0"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Settings saved.</span>
        </div>
      )}

      {/* 1. Appearance & Workspace Theme (Light / Dark Mode) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Palette className="h-4 w-4 text-emerald-400" />
            <span>Appearance & Workspace Theme</span>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            Active Theme: <strong className="text-emerald-400 uppercase">{appTheme || 'dark'} Mode</strong>
          </span>
        </div>
        <p className="text-xs text-neutral-400">
          Switch the visual presentation of Sincly. Changes apply instantly across all dashboards, charts, and telemetry views.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Dark Mode Card */}
          <div
            onClick={() => {
              if (appTheme !== 'dark' && onToggleTheme) onToggleTheme();
            }}
            className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
              appTheme === 'dark'
                ? 'bg-neutral-950 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Obsidian Dark Mode</span>
                  {appTheme === 'dark' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400">Signature dark glass & neon emerald</div>
              </div>
            </div>
            {appTheme === 'dark' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <span className="text-xs text-neutral-500 font-medium">Select</span>
            )}
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => {
              if (appTheme !== 'light' && onToggleTheme) onToggleTheme();
            }}
            className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
              appTheme === 'light'
                ? 'bg-neutral-950 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Clean Light Mode</span>
                  {appTheme === 'light' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400">High-contrast daytime clarity</div>
              </div>
            </div>
            {appTheme === 'light' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <span className="text-xs text-neutral-500 font-medium">Select</span>
            )}
          </div>
        </div>
      </div>

      {/* Top Row: Default AI Provider & Brand Grounding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Default AI Provider */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span>Default AI Provider</span>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'gemini',
                label: 'Google Gemini (@google/genai)',
                desc: 'gemini-3.8-flash server-side'
              },
              {
                id: 'openai',
                label: 'OpenAI (GPT-4o / Mini)',
                desc: 'Chat Completions API'
              },
              {
                id: 'nvidia',
                label: 'NVIDIA NIM (Nemotron 70B)',
                desc: 'Open-weights inference'
              },
              {
                id: 'anthropic',
                label: 'Anthropic (Claude 3.5 Sonnet)',
                desc: 'Editorial reasoning'
              },
              {
                id: 'ollama',
                label: 'Ollama (Localhost:11434)',
                desc: 'Local private runtime'
              }
            ].map(prov => (
              <label
                key={prov.id}
                onClick={() => setDefaultProvider(prov.id as any)}
                className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                  defaultProvider === prov.id
                    ? 'bg-neutral-900 border-emerald-500/40 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="provider"
                    checked={defaultProvider === prov.id}
                    onChange={() => setDefaultProvider(prov.id as any)}
                    className="accent-emerald-500"
                  />
                  <span className="font-bold">{prov.label}</span>
                </div>
                <span className="text-neutral-500 text-[11px]">{prov.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Card 2: Brand Profile Overrides */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Brand & Domain Grounding</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-neutral-400 block mb-1 font-medium">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-medium">
                  Website URL
                </label>
                <input
                  type="text"
                  value={brandWebsite}
                  onChange={e => setBrandWebsite(e.target.value)}
                  placeholder="https://your-company.com"
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 block mb-1 font-medium">
                Tagline
              </label>
              <input
                type="text"
                value={brandTagline}
                onChange={e => setBrandTagline(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1 font-medium">
                Voice & Tone
              </label>
              <textarea
                value={brandVoice}
                onChange={e => setBrandVoice(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* LIVE API KEYS & INTEGRATIONS VAULT (AUTO-SYNCS TO .ENV FILE)          */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>API Keys & Credentials Vault</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Auto-Syncs to .env
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Keys and credentials entered here automatically update your <code className="text-neutral-200 bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800 font-mono">.env</code> file and active database in real-time. No manual file editing required!
              </p>
            </div>
          </div>
        </div>

        {vaultNotice && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              vaultNotice.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {vaultNotice.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            )}
            <span>{vaultNotice.msg}</span>
          </div>
        )}

        {/* Database Notice */}
        {dbNotice && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              dbNotice.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {dbNotice.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            )}
            <span>{dbNotice.msg}</span>
          </div>
        )}

        {/* External PostgreSQL Database Card (Full Width) */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/30 space-y-3 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-bold text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              <span>External PostgreSQL Database (Cloud SQL / Supabase / Neon)</span>
            </div>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5 ${
                dbInfo?.connected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dbInfo?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{dbInfo?.connected ? `Connected (${dbInfo.host || 'PostgreSQL'})` : 'Awaiting Connection'}</span>
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Connect an external PostgreSQL database (Supabase, Neon, AWS RDS, Render, or Railway) to safely persist all campaigns, leads, posts, approvals, and AI brand data in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={databaseUrlInput}
              onChange={e => setDatabaseUrlInput(e.target.value)}
              placeholder={dbInfo?.hasConfiguredUrl ? `${dbInfo.databaseUrlMasked} (Configured in .env)` : 'postgresql://postgres:password@db.xxx.supabase.co:5432/postgres'}
              className="flex-1 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleConnectDatabase}
                disabled={isConnectingDb || !databaseUrlInput.trim()}
                className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-colors shadow-md"
              >
                {isConnectingDb ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Database className="h-3.5 w-3.5" />
                    <span>Connect & Sync</span>
                  </>
                )}
              </button>

              {dbInfo?.hasConfiguredUrl && (
                <button
                  type="button"
                  onClick={handleDisconnectDatabase}
                  disabled={isConnectingDb}
                  className="px-3 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          <div className="text-[10px] text-neutral-500 flex flex-wrap items-center gap-3 pt-0.5">
            <span>✓ 14 Relational Tables Verified</span>
            <span>·</span>
            <span>✓ SSL Encrypted Connections Supported</span>
            <span>·</span>
            <span>✓ Auto-Schema Provisioning</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Item 1: Google Gemini API Key */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Google Gemini API Key (Text & Agents)</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                  credGeminiKey
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {credGeminiKey ? 'Configured in .env' : 'Not Set'}
              </span>
            </div>
            <div className="relative">
              <input
                type={showSecretMap['gemini'] ? 'text' : 'password'}
                value={credGeminiKey}
                onChange={e => setCredGeminiKey(e.target.value)}
                placeholder="Enter AI Studio Gemini API Key"
                className="w-full p-2.5 pr-10 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => toggleShowSecret('gemini')}
                className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-white"
              >
                {showSecretMap['gemini'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleRemoveVaultItem('gemini')}
                disabled={isSavingVault || !credGeminiKey}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold flex items-center gap-1 disabled:opacity-40 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveVaultItem('gemini')}
                disabled={isSavingVault}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <Save className="h-3 w-3" />
                <span>Save to .env</span>
              </button>
            </div>
          </div>

          {/* Item 1B: Google Gemini Dedicated Image API Key */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-purple-500/30 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-purple-500/20 text-purple-300 font-mono text-[9px] rounded-bl-lg font-bold uppercase tracking-wider">
              Visual AI Studio Key
            </div>
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Gemini Dedicated Image API Key</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                  credGeminiImageKey
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {credGeminiImageKey ? 'Configured in .env' : 'Not Set'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Dedicated API Key strictly for AI Image Generation Studio. Prevents image generation from exhausting your primary agent text quota.
            </p>
            <div className="relative">
              <input
                type={showSecretMap['gemini_image'] ? 'text' : 'password'}
                value={credGeminiImageKey}
                onChange={e => setCredGeminiImageKey(e.target.value)}
                placeholder="Enter Gemini Image API Key (e.g. AI Studio / Vertex Image Key)"
                className="w-full p-2.5 pr-10 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => toggleShowSecret('gemini_image')}
                className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-white"
              >
                {showSecretMap['gemini_image'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleRemoveVaultItem('gemini_image')}
                disabled={isSavingVault || !credGeminiImageKey}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold flex items-center gap-1 disabled:opacity-40 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveVaultItem('gemini_image')}
                disabled={isSavingVault}
                className="px-3.5 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-md shadow-purple-500/20"
              >
                <Save className="h-3 w-3" />
                <span>Save to .env</span>
              </button>
            </div>
          </div>

          {/* Item 2: Meta / Facebook Developer App */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-blue-500" />
                <span>Meta / Facebook App Credentials</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                  credFbId && credFbSecret
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {credFbId ? 'Configured in .env' : 'Not Set'}
              </span>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={credFbId}
                onChange={e => setCredFbId(e.target.value)}
                placeholder="Meta App ID (e.g. 1825152858908680)"
                className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs"
              />
              <div className="relative">
                <input
                  type={showSecretMap['fbSecret'] ? 'text' : 'password'}
                  value={credFbSecret}
                  onChange={e => setCredFbSecret(e.target.value)}
                  placeholder="Meta App Secret"
                  className="w-full p-2.5 pr-10 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => toggleShowSecret('fbSecret')}
                  className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-white"
                >
                  {showSecretMap['fbSecret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleRemoveVaultItem('facebook')}
                disabled={isSavingVault || (!credFbId && !credFbSecret)}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold flex items-center gap-1 disabled:opacity-40 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveVaultItem('facebook')}
                disabled={isSavingVault}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <Save className="h-3 w-3" />
                <span>Save to .env</span>
              </button>
            </div>
          </div>

          {/* Item 3: LinkedIn Developer Platform */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-sky-400" />
                <span>LinkedIn Marketing Developer App</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                  credLiId && credLiSecret
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {credLiId ? 'Configured in .env' : 'Not Set'}
              </span>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={credLiId}
                onChange={e => setCredLiId(e.target.value)}
                placeholder="LinkedIn Client ID (e.g. 865hqzj3bhxzz3)"
                className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs"
              />
              <div className="relative">
                <input
                  type={showSecretMap['liSecret'] ? 'text' : 'password'}
                  value={credLiSecret}
                  onChange={e => setCredLiSecret(e.target.value)}
                  placeholder="LinkedIn Client Secret"
                  className="w-full p-2.5 pr-10 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => toggleShowSecret('liSecret')}
                  className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-white"
                >
                  {showSecretMap['liSecret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleRemoveVaultItem('linkedin')}
                disabled={isSavingVault || (!credLiId && !credLiSecret)}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold flex items-center gap-1 disabled:opacity-40 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveVaultItem('linkedin')}
                disabled={isSavingVault}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <Save className="h-3 w-3" />
                <span>Save to .env</span>
              </button>
            </div>
          </div>

          {/* Item 4: Google Cloud OAuth & YouTube */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-red-400" />
                <span>Google Cloud OAuth (YouTube & Ads)</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                  credGoogleId
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {credGoogleId ? 'Configured in .env' : 'Not Set'}
              </span>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={credGoogleId}
                onChange={e => setCredGoogleId(e.target.value)}
                placeholder="Google OAuth Client ID"
                className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs"
              />
              <div className="relative">
                <input
                  type={showSecretMap['googleSecret'] ? 'text' : 'password'}
                  value={credGoogleSecret}
                  onChange={e => setCredGoogleSecret(e.target.value)}
                  placeholder="Google OAuth Client Secret"
                  className="w-full p-2.5 pr-10 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => toggleShowSecret('googleSecret')}
                  className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-white"
                >
                  {showSecretMap['googleSecret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleRemoveVaultItem('google')}
                disabled={isSavingVault || (!credGoogleId && !credGoogleSecret)}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold flex items-center gap-1 disabled:opacity-40 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveVaultItem('google')}
                disabled={isSavingVault}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <Save className="h-3 w-3" />
                <span>Save to .env</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Agent Model Assignment Matrix */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span>Per-Agent Model Routing</span>
          </div>
          <span className="text-xs text-neutral-400">12 Specialized Agents</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {mockAgents.map(agent => (
            <div
              key={agent.id}
              className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{agent.name}</span>
                <span className="text-[10px] uppercase text-emerald-400 font-semibold">
                  {agent.riskLevel} risk
                </span>
              </div>

              <select
                value={agentModels[agent.id] || availableModels[0]}
                onChange={e =>
                  setAgentModels(prev => ({
                    ...prev,
                    [agent.id]: e.target.value
                  }))
                }
                className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs focus:border-emerald-500 focus:outline-none"
              >
                {availableModels.map((m, i) => (
                  <option key={i} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* RBAC Team Roles */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Users className="h-4 w-4 text-emerald-400" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-neutral-400 font-mono">
              Current Active Authority: <strong className="text-emerald-400 uppercase">{currentRole}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsCreateRoleOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create Role</span>
            </button>
            {onOpenLogin && (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-neutral-200 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5 text-emerald-400" />
                <span>Login Portal / Switch User</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Interactive Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {Object.values(rolesMap).map(roleCfg => {
            const isActive = currentRole === roleCfg.role;
            const isBase = Boolean(BASE_ROLE_CONFIGS[roleCfg.role]);

            const getRoleIcon = () => {
              if (roleCfg.role === 'owner') return <Crown className="h-3.5 w-3.5 text-amber-400" />;
              if (roleCfg.role === 'director') return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />;
              if (roleCfg.role === 'editor') return <FileEdit className="h-3.5 w-3.5 text-sky-400" />;
              if (roleCfg.role === 'viewer') return <BarChart3 className="h-3.5 w-3.5 text-purple-400" />;
              return <KeyRound className="h-3.5 w-3.5 text-indigo-400" />;
            };

            return (
              <div
                key={roleCfg.role}
                onClick={() => onSwitchRole?.(roleCfg.role)}
                className={`p-3.5 rounded-xl transition-all cursor-pointer border flex flex-col justify-between ${
                  isActive
                    ? 'bg-neutral-950 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      {getRoleIcon()}
                      <span>{roleCfg.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!isBase && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete custom role "${roleCfg.label}"?`)) {
                              deleteCustomRole(roleCfg.role);
                            }
                          }}
                          className="p-1 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                          title="Delete custom role"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                      {isActive ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-500 font-medium">Switch</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-300/90">
                    {roleCfg.tagline}
                  </p>
                  <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                    {roleCfg.isReadOnly
                      ? 'Read-only analytics and reporting rights.'
                      : roleCfg.canApproveSpend
                      ? 'Executive authority with ad budget and publishing gates.'
                      : 'Creative execution with asset drafting and staging rights.'}
                  </p>
                </div>
                <div className="pt-2.5 mt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
                  <span>{isBase ? 'System Role' : 'Custom Role'}</span>
                  <span className="text-emerald-400 font-mono">
                    {roleCfg.isReadOnly ? 'Read-Only' : 'Active'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RBAC Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-800/80 mt-3">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 text-[11px] uppercase border-b border-neutral-800/80 font-mono">
              <tr>
                <th className="p-3">Workspace Capability</th>
                <th className="p-3 text-amber-400">Owner</th>
                <th className="p-3 text-emerald-400">Director</th>
                <th className="p-3 text-sky-400">Editor</th>
                <th className="p-3 text-purple-400">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50 text-[11px]">
              <tr className="hover:bg-neutral-900/40">
                <td className="p-3 font-medium text-white">Full Workspace Control & Team Access</td>
                <td className="p-3 text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-neutral-500">—</td>
                <td className="p-3 text-neutral-500">—</td>
                <td className="p-3 text-neutral-500">—</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="p-3 font-medium text-white">Live API Keys & Vault Management (.env Sync)</td>
                <td className="p-3 text-emerald-400 font-bold">✓ Yes</td>
                <td className="p-3 text-emerald-400 font-bold">✓ Yes</td>
                <td className="p-3 text-neutral-500">—</td>
                <td className="p-3 text-neutral-500">—</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="p-3 font-medium text-white">Approvals & Ad Spend Sign-Off (Human-in-the-Loop)</td>
                <td className="p-3 text-emerald-400 font-bold">✓ Yes</td>
                <td className="p-3 text-emerald-400 font-bold">✓ Yes</td>
                <td className="p-3 text-neutral-500">—</td>
                <td className="p-3 text-neutral-500">—</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="p-3 font-medium text-white">Draft & Schedule Assets (Campaigns, Posts, Emails)</td>
                <td className="p-3 text-emerald-400 font-bold">✓ Yes</td>
                <td className="p-3 text-emerald-400 font-bold">✓ Yes</td>
                <td className="p-3 text-sky-400 font-bold">✓ Yes</td>
                <td className="p-3 text-neutral-500">—</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="p-3 font-medium text-white">Read-Only Analytics, Dashboards & Export Reports</td>
                <td className="p-3 text-emerald-400 font-bold">✓ Yes</td>
                <td className="p-3 text-emerald-400 font-bold">✓ Yes</td>
                <td className="p-3 text-emerald-400 font-bold">✓ Yes</td>
                <td className="p-3 text-purple-400 font-bold">✓ Read-Only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <CreateRoleModal
        isOpen={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        onRoleCreated={() => setRolesMap(getStoredRoles())}
      />
    </div>
  );
};
