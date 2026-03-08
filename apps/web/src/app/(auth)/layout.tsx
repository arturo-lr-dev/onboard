export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Animated mesh background */}
      <div className="absolute inset-0 bg-midnight" />
      <div className="absolute inset-0 bg-mesh-auth animate-mesh-drift" />
      <div className="absolute inset-0 grid-pattern opacity-40" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-teal/[0.04] blur-3xl animate-float" />
      <div className="absolute bottom-1/3 right-1/4 h-48 w-48 rounded-full bg-blue-500/[0.03] blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="relative z-10 w-full px-4">
        {children}
      </div>
    </div>
  );
}
