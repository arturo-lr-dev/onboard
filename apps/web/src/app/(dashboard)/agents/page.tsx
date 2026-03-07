"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, MoreHorizontal, Bot } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { Agent, ApiResponse } from "@onboard/shared";
import { AGENT_ROLES, AGENT_STATUS_LABELS } from "@onboard/shared";

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

export default function AgentsPage() {
  const { data: session } = useSession();
  const api = useApi();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.accessToken) return;

    async function fetchAgents() {
      try {
        const res = await api.get<ApiResponse<Agent[]>>("/agents");
        setAgents(res.data);
      } catch {
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();
  }, [session?.user?.accessToken, api]);

  async function handleStatusChange(agent: Agent, newStatus: "active" | "paused") {
    try {
      await api.patch<ApiResponse<Agent>>(`/agents/${agent.id}/status`, {
        status: newStatus,
      });
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, status: newStatus } : a))
      );
      toast.success(`Agent ${newStatus === "active" ? "activated" : "paused"}`);
    } catch {
      toast.error("Failed to update agent status");
    }
  }

  async function handleDelete(agent: Agent) {
    if (!confirm(`Are you sure you want to delete "${agent.name}"?`)) return;

    try {
      await api.del(`/agents/${agent.id}`);
      setAgents((prev) => prev.filter((a) => a.id !== agent.id));
      toast.success("Agent deleted");
    } catch {
      toast.error("Failed to delete agent");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s AI agents
          </p>
        </div>
        <Button asChild>
          <Link href="/agents/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Link>
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Bot className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No agents yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first AI agent to get started.
          </p>
          <Button asChild>
            <Link href="/agents/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <Link
                      href={`/agents/${agent.id}`}
                      className="font-medium hover:text-cyan transition-colors"
                    >
                      {agent.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {AGENT_ROLES[agent.role]?.label || agent.role}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(agent.status)}>
                      {AGENT_STATUS_LABELS[agent.status] || agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/agents/${agent.id}`)}
                        >
                          Edit
                        </DropdownMenuItem>
                        {agent.status === "active" ? (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(agent, "paused")}
                          >
                            Pause
                          </DropdownMenuItem>
                        ) : agent.status !== "archived" ? (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(agent, "active")}
                          >
                            Activate
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                          onClick={() => handleDelete(agent)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
