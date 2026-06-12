export function SettingsPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0d1428] tracking-tight">Settings</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Platform configuration and team management.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Scoring Model</h3>
          <p className="text-sm text-muted-foreground mt-1">Configure weights for the automated qualification engine.</p>
        </div>
        <div className="p-6 bg-secondary/20 flex items-center justify-center h-32">
          <p className="text-sm text-muted-foreground italic">Configuration options coming soon.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Team Members</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage operator access to the dashboard.</p>
        </div>
        <div className="p-6 bg-secondary/20 flex items-center justify-center h-32">
          <p className="text-sm text-muted-foreground italic">Team management coming soon.</p>
        </div>
      </div>
    </div>
  );
}
