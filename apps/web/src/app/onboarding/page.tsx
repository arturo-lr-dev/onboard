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
import type { AgentRole, Agent, ApiResponse } from "@onboard/shared";
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

  // Step 1: Company
  const [companyName, setCompanyName] = useState("");

  // Step 2: Agent
  const [agentName, setAgentName] = useState("");
  const [agentRole, setAgentRole] = useState<AgentRole>("customer_support");

  // Step 3: Document
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
      await api.patch("/company", { name: companyName });
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
      await api.post<ApiResponse<Agent>>("/agents", {
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
      // Allow skipping
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
      const res = await fetch(`${API_URL}/api/v1/documents`, {
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-midnight to-slate-850">
      {/* Progress Bar */}
      <div className="h-1 w-full bg-white/10">
        <div
          className="h-full bg-cyan transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-4">
        {/* Steps indicator */}
        <div className="mb-8 flex items-center gap-4">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  i < step
                    ? "bg-cyan text-midnight"
                    : i === step
                    ? "bg-cyan/20 text-cyan border-2 border-cyan"
                    : "bg-white/10 text-white/40"
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
                    ? "font-medium text-white"
                    : i < step
                    ? "text-cyan"
                    : "text-white/40"
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-8 ${
                    i < step ? "bg-cyan" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="w-full max-w-lg">
          {/* Step 1: Company */}
          {step === 0 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  Welcome to Onboard!
                </CardTitle>
                <CardDescription>
                  Let&apos;s start by confirming your company name.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
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
                <CardTitle className="text-2xl">
                  Create Your First Agent
                </CardTitle>
                <CardDescription>
                  Set up an AI agent to get started with onboarding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agentName">Agent Name</Label>
                  <Input
                    id="agentName"
                    placeholder="e.g., Support Bot"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
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
                <CardTitle className="text-2xl">
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
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-cyan bg-cyan/5"
                      : "border-gray-300 hover:border-cyan/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  {docFile ? (
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-cyan" />
                      <div className="text-left">
                        <p className="font-medium">{docFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(docFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
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
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
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
                    <Label htmlFor="docTitle">Document Title</Label>
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
                    onClick={() => setStep(3)}
                  >
                    Skip
                  </Button>
                  <Button
                    className="flex-1"
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
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan/10">
                  <PartyPopper className="h-8 w-8 text-cyan" />
                </div>
                <CardTitle className="text-2xl">
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
