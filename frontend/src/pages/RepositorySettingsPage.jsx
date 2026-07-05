import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import {
  createRule,
  deleteRule,
  listRules,
  updateRule,
} from '../api/branchProtectionApi.js';
import BranchProtectionRuleFields from '../components/repositories/BranchProtectionRuleFields.jsx';
import BranchProtectionRuleCard from '../components/repositories/BranchProtectionRuleCard.jsx';
import AuditLogTab from '../components/repository/AuditLogTab.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import PageShell from '../components/layout/PageShell.jsx';

const defaultRule = {
  branchPattern: '',
  requirePullRequest: true,
  requiredApprovalsCount: '1',
  requireStatusChecks: false,
};

export default function RepositorySettingsPage() {
  const { username, reponame } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isOwner = user?.username?.toLowerCase() === username?.toLowerCase();
  const [activeTab, setActiveTab] = useState('branch-protection');
  const [draft, setDraft] = useState(defaultRule);
  const [localError, setLocalError] = useState('');

  const rulesQuery = useQuery({
    queryKey: ['branch-protection-rules', username, reponame],
    queryFn: () => listRules({ username, reponame }),
    enabled: isOwner,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createRule({ username, reponame, data }),
    onSuccess: async () => {
      setDraft(defaultRule);
      setLocalError('');
      await queryClient.invalidateQueries({ queryKey: ['branch-protection-rules', username, reponame] });
    },
    onError: (error) => {
      setLocalError(error?.message || 'Unable to create rule.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ ruleId, data }) => updateRule({ username, reponame, ruleId, data }),
    onSuccess: async () => {
      setLocalError('');
      await queryClient.invalidateQueries({ queryKey: ['branch-protection-rules', username, reponame] });
    },
    onError: (error) => {
      setLocalError(error?.message || 'Unable to update rule.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ruleId) => deleteRule({ username, reponame, ruleId }),
    onSuccess: async () => {
      setLocalError('');
      await queryClient.invalidateQueries({ queryKey: ['branch-protection-rules', username, reponame] });
    },
    onError: (error) => {
      setLocalError(error?.message || 'Unable to delete rule.');
    },
  });

  const errorMessage = localError || rulesQuery.error?.message || '';
  const rules = rulesQuery.data ?? [];

  const handleAddRule = () => {
    setLocalError('');
    createMutation.mutate({
      branchPattern: draft.branchPattern.trim(),
      requirePullRequest: draft.requirePullRequest,
      requiredApprovalsCount: draft.requirePullRequest ? Number(draft.requiredApprovalsCount || 0) : 0,
      requireStatusChecks: draft.requireStatusChecks,
    });
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-white dark:bg-[#06070a] text-zinc-900 dark:text-white transition-colors">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Repository Settings</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">Branch Protection Rules</h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Manage protection rules for <span className="font-semibold text-zinc-800 dark:text-zinc-200">{username}/{reponame}</span>.
              </p>
            </div>
            <Link
              to={`/${username}/${reponame}/architecture`}
              className="inline-flex items-center rounded-full border border-zinc-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-emerald-400/30 hover:text-emerald-400 transition-colors"
            >
              View Architecture
            </Link>
          </div>

          <div className="mb-6 border-b border-zinc-200 dark:border-white/10">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveTab('branch-protection')}
                className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'branch-protection'
                    ? 'border-emerald-400 text-zinc-900 dark:text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                Branch Protection
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audit-log')}
                className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'audit-log'
                    ? 'border-emerald-400 text-zinc-900 dark:text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                Audit Log
              </button>
            </div>
          </div>

          {!isOwner ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-6 text-sm text-zinc-700 dark:text-zinc-300">
              You do not have permission to manage settings for this repository.
            </div>
          ) : (
            <>
              {activeTab === 'branch-protection' ? (
                <div className="grid gap-6">
                  {rulesQuery.isLoading ? (
                    <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-6 text-sm text-zinc-600 dark:text-zinc-300">
                      Loading rules...
                    </div>
                  ) : errorMessage ? (
                    <ErrorState message={errorMessage} />
                  ) : (
                    <>
                      <section className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6">
                        <div className="mb-4 flex items-center gap-2">
                          <Plus className="h-4 w-4 text-emerald-400" />
                          <h2 className="text-lg font-semibold">Add New Rule</h2>
                        </div>

                        <div className="grid gap-4">
                          <BranchProtectionRuleFields
                            branchPattern={draft.branchPattern}
                            requirePullRequest={draft.requirePullRequest}
                            requiredApprovalsCount={draft.requiredApprovalsCount}
                            requireStatusChecks={draft.requireStatusChecks}
                            onBranchPatternChange={(value) => setDraft((current) => ({ ...current, branchPattern: value }))}
                            onRequirePullRequestChange={(checked) => setDraft((current) => ({ ...current, requirePullRequest: checked }))}
                            onRequiredApprovalsCountChange={(value) => setDraft((current) => ({ ...current, requiredApprovalsCount: value }))}
                            onRequireStatusChecksChange={(checked) => setDraft((current) => ({ ...current, requireStatusChecks: checked }))}
                          />

                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={handleAddRule}
                              disabled={createMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Add Rule
                            </button>
                          </div>
                        </div>
                      </section>

                      <section className="grid gap-4">
                        <h2 className="text-lg font-semibold">Existing Rules</h2>
                        {rules.length === 0 ? (
                          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-6 text-sm text-zinc-500 dark:text-zinc-400">
                            No branch protection rules configured.
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            {rules.map((rule) => (
                              <BranchProtectionRuleCard
                                key={rule._id}
                                rule={rule}
                                saving={updateMutation.isPending || deleteMutation.isPending}
                                onSave={(data) => updateMutation.mutate({ ruleId: rule._id, data })}
                                onDelete={() => deleteMutation.mutate(rule._id)}
                              />
                            ))}
                          </div>
                        )}
                      </section>
                    </>
                  )}
                </div>
              ) : null}

              {activeTab === 'audit-log' ? (
                <AuditLogTab key={`${username}/${reponame}`} username={username} reponame={reponame} />
              ) : null}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
