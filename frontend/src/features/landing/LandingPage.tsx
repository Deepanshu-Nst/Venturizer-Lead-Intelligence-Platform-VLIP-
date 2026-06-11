import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { ArrowRight, MessageSquare, Zap, Briefcase, TrendingUp, CheckCircle2 } from "lucide-react";
import { useChatbot } from "@/features/chatbot/ChatbotContext";

export function LandingPage() {
  const navigate = useNavigate();
  const chatbot = useChatbot();

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="container pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground mb-8">
            <Zap className="h-3 w-3 text-accent" aria-hidden />
            Intelligent lead qualification for venture capital
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance leading-[1.1]">
            Qualify leads with
            <br />
            <span className="text-accent">venture-grade</span> precision
          </h1>

          <p className="mt-6 text-base text-muted-foreground md:text-lg max-w-2xl mx-auto text-balance leading-relaxed">
            Venturizer's AI qualification assistant guides founders and investors through a
            conversational flow — scoring fit, storing data, and surfacing the best matches.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              id="hero-open-chatbot"
              size="lg"
              className="w-full sm:w-auto min-w-[220px] h-12 text-base gap-2"
              onClick={chatbot.open}
            >
              <MessageSquare className="h-4 w-4" aria-hidden />
              Chat with Venturizer
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-[200px] h-12 text-base"
              onClick={() => navigate("/dashboard")}
            >
              View Dashboard
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground/60">
            Takes ~5 minutes · No account required · Data secured
          </p>
        </div>
      </section>

      {/* ── Chatbot Preview ── */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                A conversation, not a form
              </h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
                Our chatbot asks smart questions, validates your answers in real time, and
                generates a 0–100 qualification score automatically.
              </p>
            </div>

            {/* Chatbot mockup */}
            <div
              className="mx-auto max-w-sm rounded-2xl border border-border bg-[#0c0c0c] overflow-hidden shadow-2xl cursor-pointer group transition-transform hover:-translate-y-1 duration-300"
              onClick={chatbot.open}
              role="button"
              tabIndex={0}
              aria-label="Open Venturizer chatbot"
              onKeyDown={(e) => e.key === "Enter" && chatbot.open()}
            >
              {/* Mock header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                    <Zap className="h-3 w-3 text-white" aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Venturizer</p>
                    <p className="text-[10px] text-white/40">Qualification Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-white/40">Online</span>
                </div>
              </div>

              {/* Mock transcript */}
              <div className="px-4 py-4 space-y-3">
                {/* Bot intro */}
                <div className="flex items-end gap-2">
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/10">
                    <span className="text-[9px] font-bold text-white/70">V</span>
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white/[0.06] px-3 py-2">
                    <p className="text-[11px] text-white/80">Hi there 👋 Are you a <strong className="text-white">Founder</strong> or <strong className="text-white">Investor</strong>?</p>
                  </div>
                </div>

                {/* User reply */}
                <div className="flex items-end justify-end">
                  <div className="max-w-[70%] rounded-2xl rounded-br-sm bg-white px-3 py-2">
                    <p className="text-[11px] text-[#0c0c0c] font-medium">Founder</p>
                  </div>
                </div>

                {/* Bot Q2 */}
                <div className="flex items-end gap-2">
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/10">
                    <span className="text-[9px] font-bold text-white/70">V</span>
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white/[0.06] px-3 py-2">
                    <p className="text-[11px] text-white/80">What is your <strong className="text-white">startup called</strong>?</p>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex items-end gap-2 opacity-70">
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/10">
                    <span className="text-[9px] font-bold text-white/70">V</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/[0.06] px-3 py-2.5">
                    <span className="h-1 w-1 rounded-full bg-white/40 animate-typing-dot" style={{ animationDelay: "0ms" }} />
                    <span className="h-1 w-1 rounded-full bg-white/40 animate-typing-dot" style={{ animationDelay: "160ms" }} />
                    <span className="h-1 w-1 rounded-full bg-white/40 animate-typing-dot" style={{ animationDelay: "320ms" }} />
                  </div>
                </div>
              </div>

              {/* CTA overlay */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 text-xs font-medium text-white/50 group-hover:text-white group-hover:border-white/20 transition-colors">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                  Click to open the full chatbot
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Flow Cards ── */}
      <section className="border-t border-border">
        <div className="container py-16 md:py-24">
          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            <div
              className="group relative overflow-hidden rounded-xl border border-border bg-background p-8 transition-all hover:border-foreground/20 cursor-pointer"
              onClick={chatbot.open}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && chatbot.open()}
              aria-label="Start founder qualification chatbot"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Briefcase className="h-5 w-5 text-foreground" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                For Founders
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                18-question qualification flow. Share your vision, upload your
                pitch deck, and get matched with the right investors
                based on stage, sector, and fit.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-foreground/40 group-hover:text-foreground/70 transition-colors">
                Start the conversation <ArrowRight className="h-3 w-3 ml-0.5" aria-hidden />
              </div>
            </div>

            <div
              className="group relative overflow-hidden rounded-xl border border-border bg-background p-8 transition-all hover:border-foreground/20 cursor-pointer"
              onClick={chatbot.open}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && chatbot.open()}
              aria-label="Start investor qualification chatbot"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <TrendingUp className="h-5 w-5 text-foreground" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                For Investors
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                17-question qualification flow. Define your thesis, set your
                parameters, and discover high-quality deal flow
                that matches your criteria.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-foreground/40 group-hover:text-foreground/70 transition-colors">
                Start the conversation <ArrowRight className="h-3 w-3 ml-0.5" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-t border-border bg-secondary/50">
        <div className="container py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl text-balance">
              From chat to qualified lead in minutes
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 max-w-3xl mx-auto">
            {[
              { step: "01", label: "Open chatbot", icon: <MessageSquare className="h-4 w-4" /> },
              { step: "02", label: "Choose your path", icon: <Zap className="h-4 w-4" /> },
              { step: "03", label: "Answer questions", icon: <CheckCircle2 className="h-4 w-4" /> },
              { step: "04", label: "Get scored", icon: <TrendingUp className="h-4 w-4" /> },
            ].map(({ step, label, icon }) => (
              <div key={step} className="text-center space-y-3">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-foreground">
                  {icon}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest">{step}</p>
                <p className="text-sm font-medium text-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              id="cta-open-chatbot"
              size="lg"
              className="h-12 px-8 text-base gap-2"
              onClick={chatbot.open}
            >
              <MessageSquare className="h-4 w-4" aria-hidden />
              Get Started — It's Free
            </Button>
            <p className="mt-3 text-xs text-muted-foreground/50">No account · No setup · Just a conversation</p>
          </div>
        </div>
      </section>
    </div>
  );
}
