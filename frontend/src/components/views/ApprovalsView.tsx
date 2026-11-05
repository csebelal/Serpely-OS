import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { ApprovalItem } from '../../types';
import { ApprovalGateEmptyState, FilterResultsEmptyState } from '../common/EmptyState';

interface ApprovalsViewProps {
  approvals: ApprovalItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  onApprove,
  onReject
}) => {
  const [filter, setFilter] = useState<string>('pending');
  const [selectedId, setSelectedId] = useState<string>(approvals[0]?.id || '');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredApprovals = approvals.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'high') return item.riskLevel === 'high' && item.status === 'pending';
    return item.status === filter;
  });

  const selectedItem =
    approvals.find(a => a.id === selectedId) ||
    filteredApprovals[0] ||
    approvals[0] ||
    null;

  const handleApproveAction = (item: ApprovalItem) => {
    onApprove(item.id);
    setActionSuccess(`Approved "${item.title}" for live execution.`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleRejectAction = (item: ApprovalItem) => {
    onReject(item.id);
    setActionSuccess(`Rejected "${item.title}". Sent back to ${item.agent} agent.`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Approval Gate
          </h2>
          <span className="text-xs font-semibold text-amber-400 tabular-nums">
            {pendingCount} Pending Sign-Off
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl shrink-0">
          {[
            { id: 'pending', label: 'Pending' },
            { id: 'high', label: 'High Risk' },
            { id: 'approved', label: 'Approved' },
            { id: 'all', label: 'All' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === f.id
                  ? 'bg-neutral-800 text-emerald-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 2-Column Layout: Queue List + Detailed Review Drawer */}
      {filteredApprovals.length === 0 ? (
        filter === 'high' || filter === 'approved' ? (
          <FilterResultsEmptyState query={`${filter} items`} onReset={() => setFilter('all')} />
        ) : (
          <ApprovalGateEmptyState variant="default" />
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Clean 3-Point Queue Cards */}
          <div className="space-y-2.5">
            {filteredApprovals.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2 ${
                  selectedItem?.id === item.id
                    ? 'bg-neutral-900 border-emerald-500/40'
                    : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-neutral-400">
                    <strong className="text-emerald-400 capitalize">{item.agent}</strong> · {item.platform || 'General'}
                  </span>
                  <span
                    className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-bold shrink-0 ${
                      item.riskLevel === 'high'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {item.riskLevel} risk
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                  <span>{item.submittedAt}</span>
                  <span
                    className={`uppercase font-bold ${
                      item.status === 'approved'
                        ? 'text-emerald-400'
                        : item.status === 'rejected'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right 2-Columns: Detailed Review Drawer */}
          {selectedItem && (
          <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
                <div className="space-y-1">
                  <div className="text-xs text-neutral-400">
                    <strong className="text-emerald-400 capitalize">{selectedItem.agent} Agent</strong> · {selectedItem.platform || 'General'} · {selectedItem.submittedAt}
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedItem.title}</h3>
                </div>

                <span
                  className={`text-[10px] uppercase px-2.5 py-1 rounded-md font-bold ${
                    selectedItem.riskLevel === 'high'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {selectedItem.riskLevel} risk
                </span>
              </div>

              {/* Concise Risk Reason Box */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs">
                <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-neutral-200">{selectedItem.riskReason}</p>
                  {selectedItem.budgetImpact && (
                    <div className="text-amber-300 font-semibold">
                      Impact: {selectedItem.budgetImpact}
                    </div>
                  )}
                </div>
              </div>

              {/* Generated Visual Image Preview */}
              {selectedItem.visualUrl && (
                <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                  <img
                    src={selectedItem.visualUrl}
                    alt={selectedItem.title}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-64 object-cover block"
                  />
                </div>
              )}

              {/* Content Preview / Diff */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase">
                  Payload Preview
                </span>

                {selectedItem.diff ? (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400">
                      {selectedItem.diff.before}
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                      {selectedItem.diff.after}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 leading-relaxed whitespace-pre-line">
                    {selectedItem.preview}
                  </div>
                )}
              </div>
            </div>

            {/* Decision Gate Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <div className="text-xs text-neutral-400">
                Status: <strong className="uppercase text-white">{selectedItem.status}</strong>
              </div>

              {selectedItem.status === 'pending' ? (
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleRejectAction(selectedItem)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="h-4 w-4 text-rose-400" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApproveAction(selectedItem)}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve & Execute</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Resolved</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
