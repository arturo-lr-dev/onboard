"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Agent, AgentRole, ApiResponse } from "@onboard/shared";
import {
  AGENT_ROLES,
  AGENT_PERMISSIONS,
  PERMISSION_LABELS,
} from "@onboard/shared";

const STEPS = ["Basic Info", "Permissions", "System Prompt", "Review"];

export default function NewAgentPage() {
  const router = useRouter();
  const api = useApi();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState<AgentRole>("customer_support");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");

  function togglePermission(perm: string) {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  function canProceed() {
    if (step === 0) return name.trim().length > 0;
    return true;
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<Agent>>("/agents", {
        name,
        role,
        description: description || undefined,
        permissions,
        systemPrompt: systemPrompt || undefined,
      });
      toast.success("Agent created successfully!");
      router.push(`/agents/${res.data.id}`);
    } catch {
      toast.error("Failed to create agent");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i < step
                  ? "bg-cyan text-midnight"
                  : i === step
                  ? "bg-cyan/20 text-cyan border-2 border-cyan"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                i === step
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-8 ${
                  i < step ? "bg-cyan" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        {/* Step 1: Basic Info */}
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Give your agent a name and select its role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Support Bot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as AgentRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(AGENT_ROLES) as [
                        AgentRole,
                        { label: string; description: string }
                      ][]
                    ).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {val.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {AGENT_ROLES[role]?.description}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this agent does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </>
        )}

        {/* Step 2: Permissions */}
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Select the permissions this agent should have.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {AGENT_PERMISSIONS.map((perm) => (
                  <label
                    key={perm}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      className="h-4 w-4 rounded border-gray-300 text-cyan focus:ring-cyan"
                    />
                    <span className="text-sm font-medium">
                      {PERMISSION_LABELS[perm]}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </>
        )}

        {/* Step 3: System Prompt */}
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
              <CardDescription>
                Define the system prompt that guides this agent&apos;s behavior.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="You are a helpful AI assistant that..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </>
        )}

        {/* Step 4: Review */}
        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Review Agent</CardTitle>
              <CardDescription>
                Review the agent configuration before creating.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p className="text-lg font-semibold">{name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Role
                </p>
                <p>{AGENT_ROLES[role]?.label}</p>
              </div>
              {description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p>{description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Permissions
                </p>
                {permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No permissions selected
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((perm) => (
                      <Badge key={perm} variant="secondary">
                        {PERMISSION_LABELS[perm as keyof typeof PERMISSION_LABELS] || perm}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {systemPrompt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    System Prompt
                  </p>
                  <pre className="rounded-md bg-muted p-3 text-sm font-mono whitespace-pre-wrap">
                    {systemPrompt}
                  </pre>
                </div>
              )}
            </CardContent>
          </>
        )}

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => (step === 0 ? router.back() : setStep(step - 1))}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Agent"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
