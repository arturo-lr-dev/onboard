"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0e1528]/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-white/[0.08] group-[.toaster]:shadow-2xl group-[.toaster]:shadow-black/30 group-[.toaster]:rounded-xl group-[.toaster]:font-sans",
          title: "group-[.toast]:text-sm group-[.toast]:font-medium",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-teal group-[.toast]:text-midnight group-[.toast]:rounded-lg group-[.toast]:font-medium group-[.toast]:text-xs",
          cancelButton:
            "group-[.toast]:bg-white/[0.06] group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:border-white/[0.08] group-[.toast]:text-xs",
          success:
            "group-[.toaster]:!border-teal/20 group-[.toaster]:!text-teal-300 [&>svg]:!text-teal-400",
          error:
            "group-[.toaster]:!border-red-500/20 group-[.toaster]:!text-red-300 [&>svg]:!text-red-400",
          info:
            "group-[.toaster]:!border-blue-500/20 group-[.toaster]:!text-blue-300 [&>svg]:!text-blue-400",
          warning:
            "group-[.toaster]:!border-amber-500/20 group-[.toaster]:!text-amber-300 [&>svg]:!text-amber-400",
        },
      }}
    />
  );
}
