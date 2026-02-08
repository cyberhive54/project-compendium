import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen, Loader2, Camera, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
});

type UsernameFormValues = z.infer<typeof usernameSchema>;

export default function ProfileSetupPage() {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const form = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: "" },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Profile picture must be under 2MB",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file",
      });
      return;
    }

    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    setUploadingAvatar(true);
    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, { upsert: true });

    setUploadingAvatar(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (values: UsernameFormValues) => {
    if (!user) return;

    setIsSubmitting(true);

    // Check username uniqueness
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("username", values.username)
      .neq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      form.setError("username", { message: "This username is already taken" });
      setIsSubmitting(false);
      return;
    }

    // Upload avatar if selected
    let profilePictureUrl: string | null = null;
    if (avatarFile) {
      profilePictureUrl = await uploadAvatar();
    }

    // Update profile
    const updateData: Record<string, unknown> = {
      username: values.username,
    };
    if (profilePictureUrl) {
      updateData.profile_picture_url = profilePictureUrl;
    }

    const { error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("user_id", user.id);

    setIsSubmitting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
      return;
    }

    await refreshProfile();
    toast({ title: "Profile set up!", description: "Welcome to StudyTracker 🎉" });
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Set up your profile</CardTitle>
          <CardDescription>
            Choose a username to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback className="bg-muted">
                  <User className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-xs text-muted-foreground">
              Optional · Max 2MB
            </p>
          </div>

          {/* Username Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your_username"
                        maxLength={20}
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      3–20 characters, letters, numbers, and underscores only
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || uploadingAvatar}
              >
                {(isSubmitting || uploadingAvatar) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Continue
              </Button>
            </form>
          </Form>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => navigate("/dashboard")}
          >
            Skip for now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
