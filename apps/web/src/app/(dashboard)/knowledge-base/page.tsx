"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Trash2,
  File,
  FileType,
  X,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { KnowledgeBaseDocument, ApiResponse } from "@onboard/shared";
import { DOCUMENT_STATUS_LABELS } from "@onboard/shared";

const ACCEPTED_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "text/markdown": [".md"],
  "text/plain": [".txt"],
};
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function fileTypeIcon(fileType: string) {
  switch (fileType) {
    case "pdf":
      return <FileType className="h-8 w-8 text-red-500" />;
    case "md":
      return <FileText className="h-8 w-8 text-blue-500" />;
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
}

function statusBadgeVariant(status: KnowledgeBaseDocument["status"]) {
  switch (status) {
    case "ready":
      return "default" as const;
    case "processing":
      return "secondary" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export default function KnowledgeBasePage() {
  const { data: session } = useSession();
  const api = useApi();
  const [documents, setDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<KnowledgeBaseDocument[]>>(
        "/documents"
      );
      setDocuments(res.data);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!session?.user?.accessToken) return;
    fetchDocuments();
  }, [session?.user?.accessToken, fetchDocuments]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];
      if (error?.code === "file-too-large") {
        toast.error("File is too large. Maximum size is 10MB.");
      } else if (error?.code === "file-invalid-type") {
        toast.error("Invalid file type. Accepted: .pdf, .md, .txt");
      } else {
        toast.error("File rejected");
      }
    },
  });

  async function handleUpload() {
    if (!uploadFile || !uploadTitle) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadTitle);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/v1/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Upload failed");
      }

      toast.success("Document uploaded successfully!");
      setUploadOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      fetchDocuments();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload document"
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(doc: KnowledgeBaseDocument) {
    if (!confirm(`Delete "${doc.title}"? This action cannot be undone.`))
      return;

    try {
      await api.del(`/documents/${doc.id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete document");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage documents for your AI agents
          </p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a document to your knowledge base. Supported formats:
                PDF, Markdown, and plain text.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-cyan bg-cyan/5"
                    : "border-gray-300 hover:border-cyan/50"
                }`}
              >
                <input {...getInputProps()} />
                {uploadFile ? (
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-cyan" />
                    <div className="text-left">
                      <p className="font-medium">{uploadFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFile(null);
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
              {uploadFile && (
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadOpen(false);
                  setUploadFile(null);
                  setUploadTitle("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || !uploadTitle || uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No documents yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first document to build your knowledge base.
          </p>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                {fileTypeIcon(doc.fileType)}
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-base">{doc.title}</CardTitle>
                  <CardDescription>{doc.fileName}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant={statusBadgeVariant(doc.status)}>
                    {DOCUMENT_STATUS_LABELS[doc.status]}
                  </Badge>
                  <span>&middot;</span>
                  <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
              <div className="p-6 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(doc)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
