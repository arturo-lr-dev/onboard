"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bot, FileText, Activity, Plus, Upload } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CompanyStats, AuditLog, ApiResponse } from "@onboard/shared";

export default function DashboardPage() {
  const { data: session } = useSession();
  const api = useApi();
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.accessToken) return;

    async function fetchData() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get<ApiResponse<CompanyStats>>("/company/stats"),
          api.get<ApiResponse<AuditLog[]>>("/audit-logs?limit=5"),
        ]);
        setStats(statsRes.data);
        setRecentActivity(logsRes.data);
      } catch {
        // Stats may not be available yet, use defaults
        setStats({ agentCount: 0, documentCount: 0, activeAgents: 0 });
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session?.user?.accessToken, api]);

  const statCards = [
    {
      title: "Total Agents",
      value: stats?.agentCount ?? 0,
      icon: Bot,
      color: "text-cyan",
    },
    {
      title: "Active Agents",
      value: stats?.activeAgents ?? 0,
      icon: Activity,
      color: "text-green-500",
    },
    {
      title: "Documents",
      value: stats?.documentCount ?? 0,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      title: "Audit Events",
      value: recentActivity.length,
      icon: Activity,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your AI agent operations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Get started with common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild>
              <Link href="/agents/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Agent
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/knowledge-base">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest audit log entries</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
