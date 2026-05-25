"use client";

import { useState, useRef } from "react";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadCsv, type CsvImportResult } from "@/lib/api/upload";

interface UploadCardProps {
  tableName: string;
  displayName: string;
  rowCount: number;
  uploadedAt: string | null;
  onUploaded: (tableName: string, rowCount: number) => void;
  accept?: string;
  sourceUrl?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UploadCard({
  tableName,
  displayName,
  rowCount,
  uploadedAt,
  onUploaded,
  accept = ".csv,.txt",
  sourceUrl,
}: UploadCardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileSelected, setFileSelected] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasData = rowCount > 0;

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await uploadCsv(tableName, file);
      setResult(res);
      onUploaded(tableName, res.importedRows);
      setFileSelected(false);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {displayName}
            {result && result.errors.length === 0 && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {(error || (result && result.errors.length > 0)) && (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {uploadedAt && (
              <span className="text-xs text-muted-foreground">
                {formatDate(uploadedAt)}
              </span>
            )}
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary-light transition-colors"
                title="Abrir fuente de datos"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasData && !result && (
          <p className="text-sm text-muted-foreground italic">
            Sin datos — selecciona un archivo para cargar.
          </p>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            onChange={() =>
              setFileSelected(!!fileRef.current?.files?.length)
            }
            className="flex-1 text-sm file:mr-2 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
          <Button
            onClick={handleUpload}
            disabled={loading || !fileSelected}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasData ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {loading ? "Cargando..." : hasData ? "Actualizar" : "Subir"}
          </Button>
        </div>

        {result && (
          <div className="rounded-md bg-muted p-3 text-sm space-y-1">
            <div className="flex gap-4">
              <span>Total: <strong>{result.totalRows}</strong></span>
              <span>Importadas: <strong>{result.importedRows}</strong></span>
              {result.skippedRows > 0 && (
                <span>Omitidas: <strong>{result.skippedRows}</strong></span>
              )}
            </div>
            {result.errors.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="font-medium text-yellow-600">
                  Errores ({result.errors.length}):
                </p>
                <ul className="list-disc pl-4 text-xs text-muted-foreground max-h-32 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
