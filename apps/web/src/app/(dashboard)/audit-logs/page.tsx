"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditLog, AuditAction, PaginatedResponse } from "@onboard/shared";

const AUDIT_ACTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Actions" },
  { value: "agent.created", label: "Agent Created" },
  { value: "agent.updated", label: "Agent Updated" },
  { value: "agent.deleted", label: "Agent Deleted" },
  { value: "agent.activated", label: "Agent Activated" },
  { value: "agent.paused", label: "Agent Paused" },
  { value: "agent.config_generated", label: "Config Generated" },
  { value: "agent.api_key_regenerated", label: "API Key Regenerated" },
  { value: "document.uploaded", label: "Document Uploaded" },
  { value: "document.deleted", label: "Document Deleted" },
  { value: "document.attached", label: "Document Attached" },
  { value: "document.detached", label: "Document Detached" },
  { value: "company.updated", label: "Company Updated" },
  { value: "user.login", label: "User Login" },
  { value: "user.registered", label: "User Registered" },
];

export default function AuditLogsPage() {
  const { data: session } = useSession();
  const api = useApi();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await api.get<PaginatedResponse<AuditLog>>(
        `/audit-logs?${params.toString()}`
      );
      setLogs(res.data);
      setTotalPages(res.totalPages);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [api, page, actionFilter, startDate, endDate]);

  useEffect(() => {
    if (!session?.user?.accessToken) return;
    fetchLogs();
  }, [session?.user?.accessToken, fetchLogs]);

  function handleExportCSV() {
    if (logs.length === 0) {
      toast.error("No logs to export");
      return;
    }

    const headers = ["Timestamp", "Action", "Resource Type", "Resource ID", "Details"];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toISOString(),
      log.action,
      log.resourceType,
      log.resourceId || "",
      JSON.stringify(log.details),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all actions performed in your organization
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Action Type</Label>
          <Select
            value={actionFilter}
            onValueChange={(v) => {
              setActionFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUDIT_ACTIONS.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-[180px]"
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-[180px]"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No audit logs found.
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.resourceType}</TableCell>
                    <TableCell>{log.userId || "-"}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {Object.keys(log.details).length > 0
                        ? JSON.stringify(log.details)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
