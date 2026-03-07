"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { createApiClient } from "@/lib/api-client";

export function useApi() {
  const { data: session } = useSession();

  const api = useMemo(() => {
    return createApiClient({
      token: session?.user?.accessToken,
    });
  }, [session?.user?.accessToken]);

  return api;
}
