"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  Check,
  ChevronRight,
  Building2,
  Bot,
  FileText,
  PartyPopper,
  Upload,
  X,
} from "lucide-react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AgentRole, Agent } from "@onboard/shared";
import { AGENT_ROLES } from "@onboard/shared";

const STEPS = [
  { label: "Company", icon: Building2 },
  { label: "First Agent", icon: Bot },
  { label: "First Document", icon: FileText },
  { label: "Done", icon: PartyPopper },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const api = useApi();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentRole, setAgentRole] = useState<AgentRole>("customer_support");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setDocFile(file);
      setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/markdown": [".md"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  async function handleCompanyStep() {
    if (!companyName.trim()) {
      toast.error("Please enter a company name");
      return;
    }
    setLoading(true);
    try {
      await api.patch("/companies", { name: companyName });
      setStep(1);
    } catch {
      toast.error("Failed to update company name");
    } finally {
      setLoading(false);
    }
  }

  async function handleAgentStep() {
    if (!agentName.trim()) {
      toast.error("Please enter an agent name");
      return;
    }
    setLoading(true);
    try {
      await api.post<Agent>("/agents", {
        name: agentName,
        role: agentRole,
      });
      setStep(2);
    } catch {
      toast.error("Failed to create agent");
    } finally {
      setLoading(false);
    }
  }

  async function handleDocumentStep() {
    if (!docFile) {
      setStep(3);
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", docFile);
      formData.append("title", docTitle || docFile.name);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/v1/knowledge-base/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      setStep(3);
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setLoading(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-midnight" />
      <div className="absolute inset-0 bg-mesh-auth animate-mesh-drift" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Progress Bar */}
      <div className="relative h-1 w-full bg-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center p-4">
        {/* Steps indicator */}
        <div className="mb-8 flex items-center gap-4 animate-fade-in">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  i < step
                    ? "bg-gradient-to-br from-teal-400 to-teal-500 text-midnight"
                    : i === step
                    ? "bg-teal/[0.1] text-teal-300 border border-teal/30"
                    : "bg-white/[0.04] text-white/30 border border-white/[0.06]"
                }`}
              >
                {i < step ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <s.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`text-sm hidden md:inline ${
                  i === step
                    ? "font-medium text-foreground"
                    : i < step
                    ? "text-teal-300"
                    : "text-white/30"
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-8 transition-colors ${
                    i < step ? "bg-teal-400/50" : "bg-white/[0.06]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="w-full max-w-lg border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl animate-fade-in-slow">
          {/* Step 1: Company */}
          {step === 0 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl">
                  Welcome to <span className="text-gradient">Onboard</span>!
                </CardTitle>
                <CardDescription>
                  Let&apos;s start by confirming your company name.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCompanyStep}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Continue"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}

          {/* Step 2: Create First Agent */}
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl">
                  Create Your First Agent
                </CardTitle>
                <CardDescription>
                  Set up an AI agent to get started with onboarding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agentName" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent Name</Label>
                  <Input
                    id="agentName"
                    placeholder="e.g., Support Bot"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</Label>
                  <Select
                    value={agentRole}
                    onValueChange={(v) => setAgentRole(v as AgentRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAgentStep}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Agent"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}

          {/* Step 3: Upload First Document */}
          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl">
                  Upload Your First Document
                </CardTitle>
                <CardDescription>
                  Add a document to your knowledge base. You can skip this
                  step.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? "border-teal-400/50 bg-teal/[0.05]"
                      : "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]"
                  }`}
                >
                  <input {...getInputProps()} />
                  {docFile ? (
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-teal-400" />
                      <div className="text-left">
                        <p className="font-medium">{docFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(docFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] mb-3">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">
                        Drag & drop a file here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, MD, or TXT (max 10MB)
                      </p>
                    </>
                  )}
                </div>
                {docFile && (
                  <div className="space-y-2">
                    <Label htmlFor="docTitle" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Document Title</Label>
                    <Input
                      id="docTitle"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="Document title"
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={() => setStep(3)}
                  >
                    Skip
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleDocumentStep}
                    disabled={loading || !docFile}
                  >
                    {loading ? "Uploading..." : "Upload & Continue"}
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Done */}
          {step === 3 && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal/10">
                  <PartyPopper className="h-8 w-8 text-teal-400" />
                </div>
                <CardTitle className="font-display text-2xl">
                  You&apos;re All Set!
                </CardTitle>
                <CardDescription>
                  Your workspace is ready. Head to the dashboard to manage
                  your AI agents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
