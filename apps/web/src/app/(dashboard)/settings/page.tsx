"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Company } from "@onboard/shared";

export default function SettingsPage() {
  const { data: session } = useSession();
  const api = useApi();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!session?.user?.accessToken) return;

    async function fetchCompany() {
      try {
        const res = await api.get<Company>("/companies");
        setCompanyName(res.name);
      } catch {
        // Company info may not be available
      } finally {
        setFetching(false);
      }
    }

    fetchCompany();
  }, [session?.user?.accessToken, api]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch("/companies", { name: companyName });
      toast.success("Company settings updated");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="animate-fade-in">
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization settings
        </p>
      </div>

      {/* Company Info */}
      <Card className="animate-fade-in-slow">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle className="font-display">Company Information</CardTitle>
            <CardDescription>
              Update your organization&apos;s details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company name"
                disabled={fetching}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading || fetching}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Separator className="bg-white/[0.06]" />

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="font-display text-red-400">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-red-500/15 bg-red-500/[0.03] p-4">
            <div>
              <p className="font-medium">Delete Organization</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your organization and all associated data.
              </p>
            </div>
            <Button variant="destructive" disabled>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
