export type DocumentFileType = 'pdf' | 'md' | 'txt';
export type DocumentStatus = 'processing' | 'ready' | 'failed';

export interface KnowledgeBaseDocument {
  id: string;
  companyId: string;
  title: string;
  fileName: string;
  fileType: DocumentFileType;
  fileSize: number;
  storagePath: string;
  status: DocumentStatus;
  metadata: Record<string, unknown>;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDocumentDto {
  title: string;
}
