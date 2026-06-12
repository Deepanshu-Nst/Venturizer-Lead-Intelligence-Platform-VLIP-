import { useNavigate } from "react-router-dom";
import { CheckCircle2, Home, RotateCcw } from "lucide-react";
import { useChatbot } from "@/features/chatbot/ChatbotContext";

export function ThankYouPage() {
  const navigate = useNavigate();
  const chatbot = useChatbot();

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
            Thank you for completing the qualification. Our team will review your submission and reach out if there is a fit.
          </p>

          {/* Status card */}
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

          {/* What happens next */}
          <div className="mt-6 rounded-xl border border-border bg-white px-5 py-4 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">What happens next?</p>
            <ul className="space-y-2">
              {[
                'A Venturizer team member will review your qualification.',
                'If there is a potential fit, you will receive an outreach email.',
                'Strong profiles are prioritized for direct introductions.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                  <span className="flex h-4 w-4 flex-none items-center justify-center rounded-full bg-[#0d1428]/5 text-[10px] font-bold text-[#0d1428] mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions — no dashboard link */}
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d1428] py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#1a2540] hover:shadow-lg active:scale-[0.98]"
            >
              <Home className="h-4 w-4" aria-hidden />
              Return to Home
            </button>
            <button
              type="button"
              onClick={() => { chatbot.open(); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Start Another Qualification
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
