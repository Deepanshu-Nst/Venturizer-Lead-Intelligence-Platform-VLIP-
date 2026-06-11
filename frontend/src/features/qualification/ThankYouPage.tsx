import { useNavigate } from "react-router-dom";
import { CheckCircle2, BarChart3, ArrowRight } from "lucide-react";

export function ThankYouPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-[#f7f8fa]">
      <div className="w-full max-w-md animate-fade-up">
        {/* Card */}
        <div className="card-premium p-10 text-center">
          {/* Success icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden />
          </div>

          <h1 className="text-[26px] font-bold text-[#0d1428] tracking-tight">
            Submission Received
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Thank you for completing the qualification flow. Our team will review your submission and respond within 48 hours.
          </p>

          {/* Info row */}
          <div className="mt-8 rounded-xl border border-border bg-[#f7f8fa] px-5 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                <p className="font-semibold text-[#0d1428]">Under review</p>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Response in</p>
                <p className="font-semibold text-[#0d1428]">48 hours</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d1428] py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#1a2540] hover:shadow-lg active:scale-[0.98]"
            >
              <BarChart3 className="h-4 w-4" aria-hidden />
              View Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex w-full items-center justify-center rounded-xl border border-border py-3 text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Trust signal */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground/50">
          Venturizer · Venture-Grade Lead Intelligence
        </p>
      </div>
    </div>
  );
}
