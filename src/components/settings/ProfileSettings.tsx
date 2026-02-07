import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Save, Upload } from "lucide-react";

export function ProfileSettings() {
  const { user, profile, refreshProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSaveUsername = async () => {
    if (!user || !username.trim()) return;
    if (username.length > 20) {
      toast.error("Username must be 20 characters or less");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("user_profiles")
      .update({ username: username.trim() })
      .eq("user_id", user.id);

    if (error) {
      if (error.code === "23505") {
        toast.error("Username already taken");
      } else {
        toast.error("Failed to update username");
      }
    } else {
      toast.success("Username updated");
      await refreshProfile();
    }
    setSaving(false);
  };

  const handleUploadPicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload picture");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ profile_picture_url: urlData.publicUrl + "?t=" + Date.now() })
      .eq("user_id", user.id);

    if (updateError) {
      toast.error("Failed to update profile picture");
    } else {
      toast.success("Profile picture updated");
      await refreshProfile();
    }
    setUploading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.profile_picture_url ?? undefined} />
            <AvatarFallback className="text-lg">
              {profile?.username?.charAt(0)?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild disabled={uploading}>
                <span>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  {uploading ? "Uploading..." : "Change Photo"}
                </span>
              </Button>
            </Label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadPicture}
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2 max-w-sm">
          <Label>Username</Label>
          <div className="flex gap-2">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              placeholder="Your username"
            />
            <Button onClick={handleSaveUsername} disabled={saving} size="sm">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{username.length}/20 characters</p>
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2 max-w-sm">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled className="bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
