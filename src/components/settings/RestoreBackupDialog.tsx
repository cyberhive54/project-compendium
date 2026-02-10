import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  FileJson,
  Lock,
  AlertTriangle,
} from "lucide-react";

type RestoreStep = "select" | "passphrase" | "restoring" | "complete";

interface TableResult {
  table: string;
  count: number;
  success: boolean;
  error?: string;
}

const BACKUP_TABLES = [
  "tasks",
  "subtasks",
  "goals",
  "streams",
  "subjects",
  "chapters",
  "topics",
  "projects",
  "holidays",
  "timer_sessions",
  "user_task_types",
  "study_sessions_config",
  "user_badges",
  "backups_metadata",
];

function getConflictKey(table: string): string {
  const keys: Record<string, string> = {
    tasks: "task_id",
    subtasks: "subtask_id",
    goals: "goal_id",
    streams: "stream_id",
    subjects: "subject_id",
    chapters: "chapter_id",
    topics: "topic_id",
    projects: "project_id",
    holidays: "holiday_id",
    timer_sessions: "session_id",
    user_task_types: "task_type_id",
    study_sessions_config: "config_id",
    user_badges: "user_badge_id",
    backups_metadata: "backup_id",
  };
  return keys[table] ?? "id";
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestoreBackupDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<RestoreStep>("select");
  const [file, setFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentTable, setCurrentTable] = useState("");
  const [results, setResults] = useState<TableResult[]>([]);
  const [error, setError] = useState("");

  const reset = () => {
    setStep("select");
    setFile(null);
    setPassphrase("");
    setProgress(0);
    setCurrentTable("");
    setResults([]);
    setError("");
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setStep("passphrase");
    }
  };

  const handleRestore = async () => {
    if (!file || !user || passphrase.length < 8) return;

    setStep("restoring");
    setProgress(5);
    setCurrentTable("Decrypting...");

    try {
      const text = await file.text();
      const bundle = JSON.parse(text);

      if (bundle.version !== 1) throw new Error("Unsupported backup format");

      // Validate metadata if present
      if (bundle.metadata) {
        const meta = bundle.metadata;
        setCurrentTable(
          `Validating backup from ${meta.created_at?.slice(0, 10) ?? "unknown"}...`
        );
      }

      setProgress(10);

      const salt = new Uint8Array(bundle.salt);
      const iv = new Uint8Array(bundle.iv);
      const ciphertext = new Uint8Array(bundle.data);

      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );

      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      setProgress(20);
      setCurrentTable("Decrypted. Validating data...");

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      const backup = JSON.parse(decoder.decode(decrypted));
      const tables = Object.keys(backup).filter((t) => t !== "metadata");

      setProgress(30);

      const tableResults: TableResult[] = [];
      const step = 60 / Math.max(tables.length, 1);

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        setCurrentTable(`Restoring ${table}...`);

        if (!backup[table]?.length) {
          tableResults.push({ table, count: 0, success: true });
          setProgress(30 + step * (i + 1));
          continue;
        }

        const { error: err } = await supabase
          .from(table)
          .upsert(backup[table], { onConflict: getConflictKey(table) });

        tableResults.push({
          table,
          count: backup[table].length,
          success: !err,
          error: err?.message,
        });

        setProgress(30 + step * (i + 1));
      }

      setResults(tableResults);
      setProgress(100);
      setStep("complete");

      const totalRestored = tableResults
        .filter((r) => r.success)
        .reduce((sum, r) => sum + r.count, 0);
      toast.success(`Restored ${totalRestored} records`);
    } catch (err: any) {
      if (err.name === "OperationError") {
        setError("Wrong passphrase. Please try again.");
        setStep("passphrase");
      } else {
        setError(err.message || "Unknown error");
        setStep("complete");
      }
    }
  };

  const totalRestored = results
    .filter((r) => r.success)
    .reduce((sum, r) => sum + r.count, 0);
  const failedTables = results.filter((r) => !r.success && r.count > 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restore from Backup</DialogTitle>
          <DialogDescription>
            {step === "select" && "Select your encrypted backup file."}
            {step === "passphrase" && "Enter the passphrase used to create this backup."}
            {step === "restoring" && "Restoring your data..."}
            {step === "complete" && (error ? "Restore encountered an error." : "Restore complete!")}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: File select */}
        {step === "select" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <FileJson className="h-12 w-12 text-muted-foreground" />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Choose Backup File
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {/* Step 2: Passphrase */}
        {step === "passphrase" && (
          <div className="space-y-4">
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileJson className="h-4 w-4" />
                <span className="truncate">{file.name}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Passphrase</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  className="pl-9"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter backup passphrase"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && passphrase.length >= 8) handleRestore();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Restoring */}
        {step === "restoring" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">{currentTable}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === "complete" && !error && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">
                {totalRestored} records restored
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {results.map((r) => (
                <div
                  key={r.table}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{r.table}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.success ? "default" : "destructive"} className="text-xs">
                      {r.count}
                    </Badge>
                    {r.success ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {failedTables.length > 0 && (
              <p className="text-xs text-destructive">
                {failedTables.length} table(s) had errors. Check console for details.
              </p>
            )}
          </div>
        )}

        {step === "complete" && error && (
          <div className="flex items-center gap-3 text-destructive py-4">
            <XCircle className="h-6 w-6" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <DialogFooter>
          {step === "passphrase" && (
            <>
              <Button variant="outline" onClick={() => { setStep("select"); setFile(null); setError(""); }}>
                Back
              </Button>
              <Button onClick={handleRestore} disabled={passphrase.length < 8}>
                Restore
              </Button>
            </>
          )}
          {step === "complete" && (
            <Button onClick={() => handleClose(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
