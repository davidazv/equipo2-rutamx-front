import { throwResponseError } from "./http-error";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface CsvImportResult {
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  errors: string[];
  tableName: string;
}

export interface TableEntry {
  rowCount: number;
  uploadedAt: string | null;
}

export type TableStatus = Record<string, TableEntry>;

export async function fetchTableStatus(): Promise<TableStatus> {
  const res = await fetch(`${API_BASE}/admin/upload/status`);
  if (!res.ok) {
    throw new Error("Error al obtener estado de tablas");
  }
  return res.json();
}

export async function uploadCsv(
  tableName: string,
  file: File
): Promise<CsvImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);

  const res = await fetch(`${API_BASE}/admin/upload/${tableName}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    await throwResponseError(res);
  }

  return res.json();
}
