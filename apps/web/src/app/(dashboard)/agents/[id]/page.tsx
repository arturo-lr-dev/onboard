"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Play,
  Pause,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  FileText,
  ArrowLeft,
  Settings2,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  Agent,
  AgentConfig,
  KnowledgeBaseDocument,
} from "@onboard/shared";
import {
  AGENT_ROLES,
  AGENT_STATUS_LABELS,
  PERMISSION_LABELS,
} from "@onboard/shared";

type Tab = "overview" | "configuration" | "knowledge-base";

function statusBadgeVariant(status: Agent["status"]) {
  switch (status) {
    case "active":
      return "default" as const;
    case "paused":
      return "secondary" as const;
    case "archived":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const api = useApi();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [documents, setDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showApiKey, setShowApiKey] = useState(false);

  const fetchAgent = useCallback(async () => {
    try {
      const agent = await api.get<Agent>(`/agents/${agentId}`);
      setAgent(agent);
    } catch {
      toast.error("Failed to load agent");
      router.push("/agents");
    } finally {
      setLoading(false);
    }
  }, [agentId, api, router]);

  useEffect(() => {
    if (!session?.user?.accessToken) return;
    fetchAgent();
  }, [session?.user?.accessToken, fetchAgent]);

  useEffect(() => {
    if (!session?.user?.accessToken || !agent) return;

    if (activeTab === "configuration" && agent.config) {
      setConfig(agent.config as unknown as AgentConfig);
    }

    if (activeTab === "knowledge-base") {
      api
        .get<KnowledgeBaseDocument[]>(`/knowledge-base`)
        .then((docs) => setDocuments(docs))
        .catch(() => setDocuments([]));
    }
  }, [activeTab, agent, agentId, api, session?.user?.accessToken]);

  async function handleStatusChange(newStatus: "active" | "paused") {
    try {
      await api.post(`/agents/${agentId}/${newStatus === "active" ? "activate" : "pause"}`);
      setAgent((prev) => (prev ? { ...prev, status: newStatus } : prev));
      toast.success(
        `Agent ${newStatus === "active" ? "activated" : "paused"}`
      );
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleGenerateConfig() {
    try {
      const config = await api.post<AgentConfig>(
        `/agents/${agentId}/generate-config`
      );
      setConfig(config);
      toast.success("Configuration generated");
    } catch {
      toast.error("Failed to generate config");
    }
  }

  async function handleRegenerateApiKey() {
    if (!confirm("Regenerate API key? The old key will stop working.")) return;
    try {
      const result = await api.post<{ apiKey: string }>(
        `/agents/${agentId}/regenerate-api-key`
      );
      setAgent((prev) =>
        prev ? { ...prev, apiKey: result.apiKey } : prev
      );
      toast.success("API key regenerated");
    } catch {
      toast.error("Failed to regenerate API key");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!agent) return null;

  const maskedKey = agent.apiKey
    ? `${agent.apiKey.slice(0, 8)}${"*".repeat(24)}${agent.apiKey.slice(-4)}`
    : "No API key generated";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in">
        <Button variant="ghost" size="icon" onClick={() => router.push("/agents")} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">{agent.name}</h1>
            <Badge variant={statusBadgeVariant(agent.status)}>
              {AGENT_STATUS_LABELS[agent.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5">
            {AGENT_ROLES[agent.role]?.label} agent
          </p>
        </div>
        <div className="flex gap-2">
          {agent.status === "active" ? (
            <Button
              variant="outline"
              onClick={() => handleStatusChange("paused")}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          ) : agent.status !== "archived" ? (
            <Button
              variant="outline"
              onClick={() => handleStatusChange("active")}
            >
              <Play className="mr-2 h-4 w-4" />
              Activate
            </Button>
          ) : null}
          <Button variant="outline" onClick={handleGenerateConfig}>
            <Settings2 className="mr-2 h-4 w-4" />
            Generate Config
          </Button>
          <Button variant="outline" onClick={handleRegenerateApiKey}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate API Key
          </Button>
        </div>
      </div>

      {/* API Key Section */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="font-display text-lg">API Key</CardTitle>
          <CardDescription>
            Use this key to authenticate API requests for this agent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 text-sm font-mono text-foreground/70">
              {showApiKey && agent.apiKey ? agent.apiKey : maskedKey}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowApiKey(!showApiKey)}
              className="h-9 w-9"
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            {agent.apiKey && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(agent.apiKey!)}
                className="h-9 w-9"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {(["overview", "configuration", "knowledge-base"] as Tab[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-teal-400 text-teal-300"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "knowledge-base"
                ? "Knowledge Base"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</p>
              <p className="mt-1">{AGENT_ROLES[agent.role]?.label}</p>
            </div>
            {agent.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </p>
                <p className="mt-1">{agent.description}</p>
              </div>
            )}
            <Separator className="bg-white/[0.06]" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Permissions
              </p>
              {(!agent.permissions || agent.permissions.length === 0) ? (
                <p className="text-sm text-muted-foreground">
                  No permissions assigned
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {agent.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary">
                      {PERMISSION_LABELS[
                        perm as keyof typeof PERMISSION_LABELS
                      ] || perm}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {agent.systemPrompt && (
              <>
                <Separator className="bg-white/[0.06]" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    System Prompt
                  </p>
                  <pre className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4 text-sm font-mono whitespace-pre-wrap text-foreground/80">
                    {agent.systemPrompt}
                  </pre>
                </div>
              </>
            )}
            {agent.constraints && Object.keys(agent.constraints).length > 0 && (
              <>
                <Separator className="bg-white/[0.06]" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Constraints
                  </p>
                  <pre className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4 text-sm font-mono whitespace-pre-wrap text-foreground/80">
                    {JSON.stringify(agent.constraints, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "configuration" && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Agent Configuration</CardTitle>
            <CardDescription>
              Generated JSON configuration for this agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {config ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(config, null, 2))
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="rounded-lg bg-midnight border border-white/[0.06] p-4 text-sm font-mono overflow-auto max-h-[600px] whitespace-pre-wrap text-teal-200/80">
                  <code>{JSON.stringify(config, null, 2)}</code>
                </pre>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-white/[0.04] mb-4">
                  <Settings2 className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  No configuration generated yet.
                </p>
                <Button onClick={handleGenerateConfig}>
                  Generate Configuration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "knowledge-base" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">Linked Documents</CardTitle>
              <CardDescription>
                Documents attached to this agent&apos;s knowledge base.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/knowledge-base")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Attach Document
            </Button>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-white/[0.04] mb-4">
                  <FileText className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No documents linked to this agent yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] p-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.fileType.toUpperCase()} &middot;{" "}
                          {(doc.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        doc.status === "ready" ? "default" : "secondary"
                      }
                    >
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
