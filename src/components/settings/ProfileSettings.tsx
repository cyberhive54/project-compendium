import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Save, Upload, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { z } from "zod";

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
  });

export function ProfileSettings() {
  const { user, profile, refreshProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

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

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File must be under 2MB");
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

  const handleChangePassword = async () => {
    const result = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      const firstError = result.error.issues[0]?.message;
      toast.error(firstError || "Invalid password");
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setChangingPassword(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    }
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
            <p className="text-xs text-muted-foreground mt-1">Max 2MB</p>
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

        <Separator />

        {/* Change Password */}
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Change Password</h3>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Must contain: 8+ characters, uppercase, lowercase, and a number.
            </p>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword || !newPassword || !confirmPassword}
              size="sm"
            >
              {changingPassword && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Update Password
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
