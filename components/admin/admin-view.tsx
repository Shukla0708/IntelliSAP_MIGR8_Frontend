"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import apiClient, { getApiErrorMessage } from "@/lib/axios";

type Tab = "users" | "learned" | "spend" | "jobs" | "sap";

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
};

type LearnedPayload = {
  rules: Array<{
    id: string;
    canonicalKey: string;
    aliases: string;
    dataType: string | null;
    maxLength: number | null;
    active: boolean;
    useCount: number;
  }>;
  mappings: Array<{
    id: string;
    sourceCanonical: string;
    sapTable: string;
    sapField: string;
    active: boolean;
    useCount: number;
  }>;
};

export function AdminView() {
  const [tab, setTab] = useState<Tab>("users");
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteOnly, setInviteOnly] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [learned, setLearned] = useState<LearnedPayload | null>(null);
  const [spend, setSpend] = useState<{
    totalEstimatedUsd: number;
    cacheHitRate: number;
    days: Array<{ day: string | null; estimatedUsd: number; calls: number }>;
    byUser: Array<{ email: string; estimatedUsd: number }>;
  } | null>(null);
  const [jobs, setJobs] = useState<{
    validations: Array<{ id: string; name: string; status: string; errorMessage?: string | null }>;
    mappings: Array<{ id: string; name: string; status: string }>;
    comparisons: Array<{ id: string; name: string; status: string }>;
  } | null>(null);
  const [sap, setSap] = useState<Record<string, unknown> | null>(null);

  async function load() {
    setError(null);
    try {
      const [settingsRes, usersRes] = await Promise.all([
        apiClient.get("/api/admin/settings"),
        apiClient.get<AdminUser[]>("/api/admin/users"),
      ]);
      setInviteOnly(Boolean(settingsRes.data.inviteOnly));
      setUsers(usersRes.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load admin data"));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    async function loadTab() {
      try {
        if (tab === "learned") {
          const { data } = await apiClient.get<LearnedPayload>("/api/admin/learned-rules");
          setLearned(data);
        } else if (tab === "spend") {
          const { data } = await apiClient.get("/api/admin/llm-spend");
          setSpend(data);
        } else if (tab === "jobs") {
          const { data } = await apiClient.get("/api/admin/jobs");
          setJobs(data);
        } else if (tab === "sap") {
          const { data } = await apiClient.get("/api/admin/health");
          setSap(data);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load this admin tab"));
      }
    }
    void loadTab();
  }, [tab]);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "users", label: "Users" },
    { id: "learned", label: "Learned rules" },
    { id: "spend", label: "LLM spend" },
    { id: "jobs", label: "Jobs" },
    { id: "sap", label: "Health / SAP" },
  ];

  return (
    <AppShell topbarTitle="Admin">
      <div className="mx-auto w-full max-w-[1100px]">
        <h2 className="mb-2 text-3xl font-bold text-on-surface">Admin</h2>
        <p className="mb-6 text-sm text-on-surface-variant">
          Invite-only signup, org-wide learned rules, token spend, and stuck jobs.
        </p>
        {error ? <p className="mb-4 text-sm text-error">{error}</p> : null}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={
                tab === item.id
                  ? "rounded bg-primary-container px-3 py-1.5 text-xs font-semibold uppercase text-on-primary"
                  : "rounded border border-outline-variant px-3 py-1.5 text-xs font-semibold uppercase text-primary"
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "users" ? (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={inviteOnly}
                onChange={async (event) => {
                  const value = event.target.checked;
                  await apiClient.post("/api/admin/settings/invite-only", { inviteOnly: value });
                  setInviteOnly(value);
                }}
              />
              Invite-only signup
            </label>
            <form
              className="flex gap-2"
              onSubmit={async (event) => {
                event.preventDefault();
                await apiClient.post("/api/admin/users/invite", { email: inviteEmail });
                setInviteEmail("");
                await load();
              }}
            >
              <input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="invite@company.com"
                className="flex-1 rounded border border-outline-variant px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded bg-primary px-4 py-2 text-sm font-semibold text-on-primary">
                Invite
              </button>
            </form>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-xs uppercase text-on-surface-variant">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-outline-variant/40">
                    <td className="py-2">{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={async (event) => {
                          await apiClient.post(`/api/admin/users/${user.id}/role`, { role: event.target.value });
                          await load();
                        }}
                        className="rounded border border-outline-variant bg-surface px-2 py-1"
                      >
                        <option value="member">member</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={async () => {
                          await apiClient.post(`/api/admin/users/${user.id}/active`, { isActive: !user.isActive });
                          await load();
                        }}
                        className="text-xs font-semibold text-primary"
                      >
                        {user.isActive ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "learned" && learned ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Field rules</h3>
              {learned.rules.map((rule) => (
                <div key={rule.id} className="mb-2 rounded border border-outline-variant p-3 text-sm">
                  <p className="font-mono font-semibold">{rule.canonicalKey}</p>
                  <p className="text-xs text-on-surface-variant">
                    {rule.dataType} {rule.maxLength ?? ""} · used {rule.useCount}
                  </p>
                  <button
                    type="button"
                    className="mt-1 text-xs text-primary"
                    onClick={async () => {
                      await apiClient.patch(`/api/admin/learned-rules/${rule.id}`, { active: !rule.active });
                      const { data } = await apiClient.get<LearnedPayload>("/api/admin/learned-rules");
                      setLearned(data);
                    }}
                  >
                    {rule.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Field mappings</h3>
              {learned.mappings.map((mapping) => (
                <div key={mapping.id} className="mb-2 rounded border border-outline-variant p-3 text-sm">
                  <p className="font-semibold">{mapping.sourceCanonical} → {mapping.sapTable}.{mapping.sapField}</p>
                  <button
                    type="button"
                    className="mt-1 text-xs text-primary"
                    onClick={async () => {
                      await apiClient.post(`/api/admin/learned-mappings/${mapping.id}/active`, { isActive: !mapping.active });
                      const { data } = await apiClient.get<LearnedPayload>("/api/admin/learned-rules");
                      setLearned(data);
                    }}
                  >
                    {mapping.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "spend" && spend ? (
          <div className="space-y-3 text-sm">
            <p>Estimated 30-day spend: <strong>${spend.totalEstimatedUsd.toFixed(4)}</strong></p>
            <p>Cache hit rate: {spend.cacheHitRate}%</p>
            {spend.byUser.map((row) => (
              <p key={row.email}>{row.email}: ${row.estimatedUsd.toFixed(4)}</p>
            ))}
          </div>
        ) : null}

        {tab === "jobs" && jobs ? (
          <div className="space-y-4 text-sm">
            {jobs.validations.map((job) => (
              <div key={job.id} className="rounded border border-outline-variant p-3">
                <p className="font-semibold">{job.name} · {job.status}</p>
                {job.errorMessage ? <p className="text-xs text-error">{job.errorMessage}</p> : null}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="text-xs text-primary"
                    onClick={async () => {
                      await apiClient.post(`/api/admin/jobs/validation/${job.id}/fail`);
                      const { data } = await apiClient.get("/api/admin/jobs");
                      setJobs(data);
                    }}
                  >
                    Mark failed
                  </button>
                  <button
                    type="button"
                    className="text-xs text-primary"
                    onClick={async () => {
                      await apiClient.post(`/api/admin/jobs/validation/${job.id}/retry`);
                    }}
                  >
                    Retry
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "sap" && sap ? (
          <pre className="overflow-auto rounded border border-outline-variant bg-surface-container-low p-4 text-xs">
            {JSON.stringify(sap, null, 2)}
          </pre>
        ) : null}
      </div>
    </AppShell>
  );
}
