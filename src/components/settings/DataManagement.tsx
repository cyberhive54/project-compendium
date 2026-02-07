import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Download, Upload, Trash2, Shield } from "lucide-react";

export function DataManagement() {
  const { user } = useAuth();
  const [backupPass, setBackupPass] = useState("");
  const [restorePass, setRestorePass] = useState("");
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleBackup = async () => {
    if (!user) return;
    if (backupPass.length < 8) {
      toast.error("Passphrase must be at least 8 characters");
      return;
    }

    setBacking(true);
    try {
      // Fetch all user data
      const tables = [
        "tasks",
        "goals",
        "streams",
        "subjects",
        "chapters",
        "topics",
        "projects",
        "holidays",
        "timer_sessions",
        "user_task_types",
      ];

      const backup: Record<string, any[]> = {};
      for (const table of tables) {
        const { data } = await supabase
          .from(table)
          .select("*")
          .eq("user_id", user.id);
        backup[table] = data ?? [];
      }

      // Encrypt with Web Crypto API
      const encoder = new TextEncoder();
      const plaintext = JSON.stringify(backup);

      // Derive key from passphrase
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
        {
          name: "PBKDF2",
          salt,
          iterations: 100000,
          hash: "SHA-256",
        },
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

      // Bundle salt + iv + ciphertext
      const bundle = {
        version: 1,
        salt: Array.from(salt),
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted)),
      };

      // Download
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

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (restorePass.length < 8) {
      toast.error("Enter your backup passphrase (min 8 chars)");
      return;
    }

    setRestoring(true);
    try {
      const text = await file.text();
      const bundle = JSON.parse(text);

      if (bundle.version !== 1) throw new Error("Unsupported backup format");

      const salt = new Uint8Array(bundle.salt);
      const iv = new Uint8Array(bundle.iv);
      const ciphertext = new Uint8Array(bundle.data);

      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(restorePass),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      const backup = JSON.parse(decoder.decode(decrypted));

      // Merge data (upsert)
      const tables = Object.keys(backup);
      let totalRestored = 0;
      for (const table of tables) {
        if (!backup[table]?.length) continue;
        const { error } = await supabase.from(table).upsert(backup[table], {
          onConflict: getConflictKey(table),
        });
        if (error) {
          console.error(`Restore error for ${table}:`, error);
        } else {
          totalRestored += backup[table].length;
        }
      }

      toast.success(`Restored ${totalRestored} records`);
    } catch (err: any) {
      if (err.name === "OperationError") {
        toast.error("Wrong passphrase");
      } else {
        toast.error("Restore failed: " + (err.message || "Unknown error"));
      }
    }
    setRestoring(false);
    // Reset file input
    e.target.value = "";
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
              Your data is encrypted with AES-256. Remember this passphrase for restore.
            </p>
          </div>
          <Button onClick={handleBackup} disabled={backing || backupPass.length < 8}>
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
          <div className="space-y-1.5">
            <Label>Passphrase</Label>
            <Input
              type="password"
              value={restorePass}
              onChange={(e) => setRestorePass(e.target.value)}
              placeholder="Enter backup passphrase"
            />
          </div>
          <Label htmlFor="restore-file" className="cursor-pointer">
            <Button variant="outline" asChild disabled={restoring}>
              <span>
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                {restoring ? "Restoring..." : "Upload Backup File"}
              </span>
            </Button>
          </Label>
          <input
            id="restore-file"
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleRestore}
          />
          <p className="text-xs text-muted-foreground">
            Data is merged (not replaced). Existing records are updated.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function getConflictKey(table: string): string {
  const keys: Record<string, string> = {
    tasks: "task_id",
    goals: "goal_id",
    streams: "stream_id",
    subjects: "subject_id",
    chapters: "chapter_id",
    topics: "topic_id",
    projects: "project_id",
    holidays: "holiday_id",
    timer_sessions: "session_id",
    user_task_types: "task_type_id",
  };
  return keys[table] ?? "id";
}
