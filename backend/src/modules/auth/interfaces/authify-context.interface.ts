export interface AuthifyContextMetadata {
  type?: string;
  createdAt?: Date | string;
  [key: string]: unknown;
}

export interface AuthifyRegisterContextPayload {
  name: string;
  metadata?: AuthifyContextMetadata;
}
