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
  ApiResponse,
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
      const res = await api.get<ApiResponse<Agent>>(`/agents/${agentId}`);
      setAgent(res.data);
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
      api
        .get<ApiResponse<AgentConfig>>(`/agents/${agentId}/config`)
        .then((res) => setConfig(res.data))
        .catch(() => setConfig(null));
    }

    if (activeTab === "knowledge-base") {
      api
        .get<ApiResponse<KnowledgeBaseDocument[]>>(
          `/agents/${agentId}/documents`
        )
        .then((res) => setDocuments(res.data))
        .catch(() => setDocuments([]));
    }
  }, [activeTab, agent, agentId, api, session?.user?.accessToken]);

  async function handleStatusChange(newStatus: "active" | "paused") {
    try {
      await api.patch(`/agents/${agentId}/status`, { status: newStatus });
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
      const res = await api.post<ApiResponse<AgentConfig>>(
        `/agents/${agentId}/config`
      );
      setConfig(res.data);
      toast.success("Configuration generated");
    } catch {
      toast.error("Failed to generate config");
    }
  }

  async function handleRegenerateApiKey() {
    if (!confirm("Regenerate API key? The old key will stop working.")) return;
    try {
      const res = await api.post<ApiResponse<{ apiKey: string }>>(
        `/agents/${agentId}/api-key`
      );
      setAgent((prev) =>
        prev ? { ...prev, apiKey: res.data.apiKey } : prev
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/agents")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
            <Badge variant={statusBadgeVariant(agent.status)}>
              {AGENT_STATUS_LABELS[agent.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Key</CardTitle>
          <CardDescription>
            Use this key to authenticate API requests for this agent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md bg-muted p-3 text-sm font-mono">
              {showApiKey && agent.apiKey ? agent.apiKey : maskedKey}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowApiKey(!showApiKey)}
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
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["overview", "configuration", "knowledge-base"] as Tab[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-cyan text-cyan"
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
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p>{AGENT_ROLES[agent.role]?.label}</p>
            </div>
            {agent.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p>{agent.description}</p>
              </div>
            )}
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Permissions
              </p>
              {agent.permissions.length === 0 ? (
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
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    System Prompt
                  </p>
                  <pre className="rounded-md bg-muted p-4 text-sm font-mono whitespace-pre-wrap">
                    {agent.systemPrompt}
                  </pre>
                </div>
              </>
            )}
            {Object.keys(agent.constraints).length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Constraints
                  </p>
                  <pre className="rounded-md bg-muted p-4 text-sm font-mono whitespace-pre-wrap">
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
            <CardTitle className="text-lg">Agent Configuration</CardTitle>
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
                  className="absolute top-2 right-2"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(config, null, 2))
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="rounded-md bg-midnight text-cyan-100 p-4 text-sm font-mono overflow-auto max-h-[600px] whitespace-pre-wrap">
                  <code>{JSON.stringify(config, null, 2)}</code>
                </pre>
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
              <CardTitle className="text-lg">Linked Documents</CardTitle>
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
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No documents linked to this agent yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">
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
