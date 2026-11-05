import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Cpu,
  Copy,
  Check,
  Play,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Code2,
  Share2,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

interface McpManifestResponse {
  success: boolean;
  status: string;
  protocolVersion: string;
  server: {
    name: string;
    version: string;
    activeSessions: number;
    toolsCount: number;
  };
  tools: ToolSchema[];
  configs: {
    claudeDesktopConfig: string;
    cursorMcpConfig: string;
    sseEndpoint: string;
    httpEndpoint: string;
  };
}

export const McpServerStudio: React.FC = () => {
  const [manifest, setManifest] = useState<McpManifestResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'claude' | 'cursor' | 'curl'>('claude');
  const [selectedTool, setSelectedTool] = useState<ToolSchema | null>(null);
  const [toolArgsInput, setToolArgsInput] = useState<string>('{}');
  const [isExecutingTool, setIsExecutingTool] = useState<boolean>(false);
  const [toolExecutionResult, setToolExecutionResult] = useState<any>(null);
  const [executionLatencyMs, setExecutionLatencyMs] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchManifest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/mcp/manifest');
      if (res.ok) {
        const data = await res.json();
        setManifest(data);
        if (data.tools?.length > 0 && !selectedTool) {
          handleSelectTool(data.tools[0]);
        }
      }
    } catch {
      // Local fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManifest();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSelectTool = (tool: ToolSchema) => {
    setSelectedTool(tool);
    setToolExecutionResult(null);
    setExecutionLatencyMs(null);

    // Populate smart default arguments based on tool name
    let defaults: Record<string, any> = {};
    if (tool.name === 'sincly_list_scheduled_posts') {
      defaults = { platform: 'all', limit: 10 };
    } else if (tool.name === 'sincly_create_post') {
      defaults = {
        platform: 'LinkedIn',
        topic: 'Autonomous AI Marketing',
        content:
          'Proactive automation is the backbone of modern enterprise operations. Here is how Sincly orchestrates omnichannel growth.',
        hashtags: ['#AIMarketing', '#B2BGrowth'],
        requiresApproval: true
      };
    } else if (tool.name === 'sincly_repurpose_waterfall') {
      defaults = {
        topic: 'Enterprise IT Resilience & Security',
        sourceText:
          'A system is only as strong as its foundation. Eliminate unexpected downtime with proactive 24/7 monitoring, automated cloud backups, and certified engineering SLA.',
        autoQueue: false
      };
    } else if (tool.name === 'sincly_get_leads') {
      defaults = { status: 'all', minScore: 80, limit: 10 };
    } else if (tool.name === 'sincly_discover_leads') {
      defaults = {
        industry: 'Fintech & SaaS',
        targetRole: 'Head of IT / CTO',
        location: 'Commercial Hub'
      };
    } else if (tool.name === 'sincly_get_analytics') {
      defaults = { timeframe: '30d' };
    } else if (tool.name === 'sincly_audit_website_seo_geo') {
      defaults = { url: 'https://postiz.com' };
    } else if (tool.name === 'sincly_review_approval') {
      defaults = { approvalId: 'app-mcp-1', action: 'approve', note: 'Verified by Claude' };
    }

    setToolArgsInput(JSON.stringify(defaults, null, 2));
  };

  const handleExecuteTool = async () => {
    if (!selectedTool) return;
    setIsExecutingTool(true);
    setToolExecutionResult(null);
    setExecutionLatencyMs(null);

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(toolArgsInput);
    } catch {
      setToolExecutionResult({ error: 'Invalid JSON in tool arguments input.' });
      setIsExecutingTool(false);
      return;
    }

    const start = performance.now();
    try {
      const res = await fetch('/api/mcp/test-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedTool.name,
          arguments: parsedArgs
        })
      });
      const end = performance.now();
      setExecutionLatencyMs(Math.round(end - start));

      const data = await res.json();
      setToolExecutionResult(data);
    } catch (err: any) {
      setToolExecutionResult({
        error: `Tool execution failed: ${err?.message || 'Network error'}`
      });
    } finally {
      setIsExecutingTool(false);
    }
  };

  const tools = manifest?.tools || [];
  const configs = manifest?.configs;

  return (
    <div className="space-y-6">
      {/* Top Banner: Protocol Live Status */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-950 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
                Model Context Protocol (MCP) Server Active
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                v2024-11-05
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Connect Claude Desktop, Cursor & Windsurf to Sincly
            </h2>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              Exposes Sincly&apos;s full-funnel autonomous marketing stack as standard MCP tools.
              Your external AI coding agents can schedule social omniposts, trigger 1-click waterfall repurposing,
              discover B2B ICP leads, and crawl GEO/SEO scores natively.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchManifest}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-medium transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Live Endpoints Pill Bar */}
        <div className="mt-5 pt-4 border-t border-neutral-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500">HTTP Direct:</span>
            <span className="text-emerald-300 select-all">/api/mcp</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500">SSE Stream:</span>
            <span className="text-emerald-300 select-all">/api/mcp/sse</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500">Stdio Bridge:</span>
            <span className="text-neutral-300 select-all">./scripts/sincly-mcp.cjs</span>
          </div>
        </div>
      </div>

      {/* Configuration Guides for External Clients */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <span>Client Setup Configurations</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Select your AI assistant below and copy the snippet directly into your local configuration file.
            </p>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-neutral-950 border border-neutral-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('claude')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'claude'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Claude Desktop
            </button>
            <button
              onClick={() => setActiveTab('cursor')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'cursor'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Cursor / Windsurf
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'curl'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              cURL / JSON-RPC
            </button>
          </div>
        </div>

        {/* Tab 1: Claude Desktop */}
        {activeTab === 'claude' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>
                File location:{' '}
                <code className="text-neutral-300 font-mono bg-neutral-950 px-1.5 py-0.5 rounded">
                  %APPDATA%\Claude\claude_desktop_config.json
                </code>
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    configs?.claudeDesktopConfig ||
                      JSON.stringify(
                        {
                          mcpServers: {
                            sincly: {
                              command: 'node',
                              args: ['f:/Project/__Sincly/scripts/sincly-mcp.cjs'],
                              env: { SINCLY_API_URL: 'http://localhost:5000/api/mcp' }
                            }
                          }
                        },
                        null,
                        2
                      ),
                    'claude-cfg'
                  )
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono transition-all"
              >
                {copiedKey === 'claude-cfg' ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Config</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-300 overflow-x-auto">
              {configs?.claudeDesktopConfig ||
                `{
  "mcpServers": {
    "sincly": {
      "command": "node",
      "args": ["f:/Project/__Sincly/scripts/sincly-mcp.cjs"],
      "env": {
        "SINCLY_API_URL": "http://localhost:5000/api/mcp"
      }
    }
  }
}`}
            </pre>
          </div>
        )}

        {/* Tab 2: Cursor */}
        {activeTab === 'cursor' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>
                File location:{' '}
                <code className="text-neutral-300 font-mono bg-neutral-950 px-1.5 py-0.5 rounded">
                  .cursor/mcp.json or Windsurf Settings &gt; MCP
                </code>
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    configs?.cursorMcpConfig ||
                      JSON.stringify(
                        {
                          mcpServers: {
                            sincly: {
                              url: 'http://localhost:5000/api/mcp/sse',
                              transport: 'sse'
                            }
                          }
                        },
                        null,
                        2
                      ),
                    'cursor-cfg'
                  )
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono transition-all"
              >
                {copiedKey === 'cursor-cfg' ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Config</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-300 overflow-x-auto">
              {configs?.cursorMcpConfig ||
                `{
  "mcpServers": {
    "sincly": {
      "url": "http://localhost:5000/api/mcp/sse",
      "transport": "sse"
    }
  }
}`}
            </pre>
          </div>
        )}

        {/* Tab 3: cURL */}
        {activeTab === 'curl' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Direct JSON-RPC 2.0 Command:</span>
              <button
                onClick={() =>
                  handleCopy(
                    `curl -X POST http://localhost:5000/api/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"sincly_list_scheduled_posts","arguments":{"limit":5}}}'`,
                    'curl-cmd'
                  )
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono transition-all"
              >
                {copiedKey === 'curl-cmd' ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy cURL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-300 overflow-x-auto">
{`curl -X POST http://localhost:5000/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "sincly_list_scheduled_posts",
      "arguments": { "limit": 5 }
    }
  }'`}
            </pre>
          </div>
        )}
      </div>

      {/* Interactive MCP Tools Registry & Live Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Tool list (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between px-2 pt-1">
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>Registered Tools ({tools.length})</span>
            </h3>
            <span className="text-[11px] text-neutral-500 font-mono">Click to test</span>
          </div>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {tools.map(tool => {
              const isSelected = selectedTool?.name === tool.name;
              return (
                <button
                  key={tool.name}
                  onClick={() => handleSelectTool(tool)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-white">
                      {tool.name}
                    </span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                    {tool.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Interactive Tool Playground (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm space-y-4">
          {selectedTool ? (
            <>
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">
                      {selectedTool.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] font-mono text-neutral-300">
                      tool
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{selectedTool.description}</p>
                </div>

                <button
                  onClick={handleExecuteTool}
                  disabled={isExecutingTool}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-emerald-950 transition-all active:scale-95 shrink-0"
                >
                  {isExecutingTool ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Run Tool Call</span>
                    </>
                  )}
                </button>
              </div>

              {/* JSON Input Arguments */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-mono">Arguments (JSON):</span>
                  <span className="text-[11px] text-neutral-500">Edit values below to test</span>
                </div>
                <textarea
                  value={toolArgsInput}
                  onChange={e => setToolArgsInput(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500/60 resize-y"
                  placeholder="{}"
                />
              </div>

              {/* Live Result View */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-mono">Execution Response:</span>
                  {executionLatencyMs !== null && (
                    <span className="text-[11px] font-mono text-emerald-400">
                      ⚡ {executionLatencyMs}ms
                    </span>
                  )}
                </div>

                <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3 max-h-[300px] overflow-y-auto">
                  {toolExecutionResult ? (
                    <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap">
                      {JSON.stringify(toolExecutionResult, null, 2)}
                    </pre>
                  ) : (
                    <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                      Click &quot;Run Tool Call&quot; to execute this tool directly against Sincly state.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-neutral-500 text-xs">
              Select a tool on the left to inspect and test.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
