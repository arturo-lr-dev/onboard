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
import type { Agent } from "@onboard/shared";
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
        const agents = await api.get<Agent[]>("/agents");
        setAgents(agents);
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
      await api.post(`/agents/${agent.id}/${newStatus === "active" ? "activate" : "pause"}`);
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
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-muted-foreground mt-1">
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
        <div className="space-y-3 animate-fade-in">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-16 text-center animate-fade-in-slow">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] mb-5">
            <Bot className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold">No agents yet</h3>
          <p className="text-muted-foreground mt-1 mb-5 max-w-sm">
            Create your first AI agent to get started with onboarding and management.
          </p>
          <Button asChild>
            <Link href="/agents/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] overflow-hidden animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Name</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Role</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Created</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id} className="border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <TableCell>
                    <Link
                      href={`/agents/${agent.id}`}
                      className="font-medium text-foreground/90 hover:text-teal-300 transition-colors"
                    >
                      {agent.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {AGENT_ROLES[agent.role]?.label || agent.role}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(agent.status)}>
                      {AGENT_STATUS_LABELS[agent.status] || agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
                          className="text-red-400 focus:text-red-400"
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
