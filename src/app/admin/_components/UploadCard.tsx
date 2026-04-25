"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { uploadCsv, type CsvImportResult } from "@/lib/api/upload";

interface UploadCardProps {
  tableName: string;
  displayName: string;
  description: string;
  accept?: string;
}

export default function UploadCard({
  tableName,
  displayName,
  description,
  accept = ".csv,.txt",
}: UploadCardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await uploadCsv(tableName, file);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {displayName}
          {result && result.errors.length === 0 && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {(error || (result && result.errors.length > 0)) && (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="flex-1 text-sm file:mr-2 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
          <Button
            onClick={handleUpload}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {loading ? "Cargando..." : "Subir"}
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
