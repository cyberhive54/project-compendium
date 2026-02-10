import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Download, Upload, Shield } from "lucide-react";
import { RestoreBackupDialog } from "./RestoreBackupDialog";

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

export function DataManagement() {
  const { user } = useAuth();
  const [backupPass, setBackupPass] = useState("");
  const [backing, setBacking] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const handleBackup = async () => {
    if (!user) return;
    if (backupPass.length < 8) {
      toast.error("Passphrase must be at least 8 characters");
      return;
    }

    setBacking(true);
    try {
      const backup: Record<string, any[]> = {};
      for (const table of BACKUP_TABLES) {
        const { data } = await supabase
          .from(table)
          .select("*")
          .eq("user_id", user.id);
        backup[table] = data ?? [];
      }

      // Encrypt with Web Crypto API
      const encoder = new TextEncoder();
      const plaintext = JSON.stringify(backup);

      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(backupPass),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );

      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );

      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(plaintext)
      );

      // Build bundle with metadata
      const tableCounts: Record<string, number> = {};
      for (const t of BACKUP_TABLES) {
        tableCounts[t] = backup[t]?.length ?? 0;
      }

      const bundle = {
        version: 1,
        metadata: {
          created_at: new Date().toISOString(),
          tables: tableCounts,
          total_records: Object.values(tableCounts).reduce((a, b) => a + b, 0),
        },
        salt: Array.from(salt),
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted)),
      };

      const blob = new Blob([JSON.stringify(bundle)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `studytracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Backup downloaded");
    } catch (err) {
      toast.error("Backup failed");
      console.error(err);
    }
    setBacking(false);
  };

  return (
    <div className="space-y-4">
      {/* Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Encrypted Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label>Backup Passphrase</Label>
            <Input
              type="password"
              value={backupPass}
              onChange={(e) => setBackupPass(e.target.value)}
              placeholder="Min 8 characters"
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Your data is encrypted with AES-256. Remember this passphrase for
              restore.
            </p>
          </div>
          <Button
            onClick={handleBackup}
            disabled={backing || backupPass.length < 8}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {backing ? "Creating Backup..." : "Download Backup"}
          </Button>
        </CardContent>
      </Card>

      {/* Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Restore from Backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-sm">
          <p className="text-sm text-muted-foreground">
            Upload a previously exported backup file. Data is merged — existing
            records are updated, new ones are added.
          </p>
          <Button variant="outline" onClick={() => setRestoreOpen(true)}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Restore Backup
          </Button>
        </CardContent>
      </Card>

      <RestoreBackupDialog open={restoreOpen} onOpenChange={setRestoreOpen} />
    </div>
  );
}
