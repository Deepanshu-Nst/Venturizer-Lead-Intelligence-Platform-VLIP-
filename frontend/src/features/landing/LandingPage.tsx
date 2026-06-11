import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { ArrowRight, MessageSquare, Zap, Briefcase, TrendingUp, CheckCircle2, Shield, BarChart3 } from "lucide-react";
import { useChatbot } from "@/features/chatbot/ChatbotContext";

export function LandingPage() {
  const navigate = useNavigate();
  const chatbot = useChatbot();

  return (
    <div className="animate-fade-in">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-transparent pointer-events-none" />

        <div className="container relative pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="mx-auto max-w-2xl text-center">
            {/* Category label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-[12px] font-medium text-muted-foreground mb-8 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              Venture-grade lead intelligence
            </div>

            {/* Headline */}
            <h1 className="text-[42px] md:text-[56px] font-bold tracking-tight text-[#0d1428] leading-[1.08] text-balance">
              Qualify leads with
              <br />
              <span className="text-[#dc2626]">conviction.</span>
            </h1>

            <p className="mt-6 text-[17px] text-muted-foreground max-w-lg mx-auto leading-relaxed text-balance">
              Venturizer's qualification assistant guides founders and investors through a
              conversational flow — scoring fit, capturing data, and surfacing matches that matter.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                id="hero-open-chatbot"
                type="button"
                onClick={chatbot.open}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-[#0d1428] px-6 py-3.5 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#1a2540] hover:shadow-lg hover:shadow-[#0d1428]/20 active:scale-[0.98] w-full sm:w-auto justify-center"
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
                Chat with Venturizer
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </button>
              <Button
                variant="outline"
                size="lg"
                className="h-[50px] px-6 text-[15px] font-medium w-full sm:w-auto"
                onClick={() => navigate("/dashboard")}
              >
                View Dashboard
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground/50">
              5 minutes · No account required · Data secured
            </p>
          </div>
        </div>
      </section>

      {/* ── CHATBOT PREVIEW ── */}
      <section className="border-t border-border bg-[#f7f8fa]">
        <div className="container py-20 md:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              {/* Copy */}
              <div>
                <p className="section-label mb-3">How it works</p>
                <h2 className="text-[30px] font-bold text-[#0d1428] leading-tight tracking-tight">
                  A conversation,
                  <br />not a form.
                </h2>
                <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed">
                  Our assistant asks smart, contextual questions — one at a time. Answers are
                  validated in real time and scored automatically against a 0–100 qualification model.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    { icon: MessageSquare, label: 'Conversational questions', desc: 'One question at a time, naturally paced' },
                    { icon: Shield, label: 'Real-time validation', desc: 'Inline feedback, no surprise errors' },
                    { icon: BarChart3, label: '0–100 qualification score', desc: 'Powered by a multi-dimension scoring model' },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white border border-border shadow-sm">
                        <Icon className="h-4 w-4 text-[#0d1428]" aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={chatbot.open}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#dc2626] hover:text-[#b91c1c] transition-colors group"
                >
                  Try the chatbot
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </button>
              </div>

              {/* Chatbot preview card */}
              <div
                className="cursor-pointer group"
                onClick={chatbot.open}
                role="button"
                tabIndex={0}
                aria-label="Open Venturizer chatbot"
                onKeyDown={(e) => e.key === 'Enter' && chatbot.open()}
              >
                <div className="rounded-2xl bg-[#0d1428] overflow-hidden shadow-2xl shadow-[#0d1428]/30 transition-transform duration-300 group-hover:-translate-y-1">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                        <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                          <path d="M8 8L14.5 22L16 18.5L11.5 8H8Z" fill="#dc2626"/>
                          <path d="M24 8L17.5 22L16 18.5L20.5 8H24Z" fill="white" fillOpacity="0.9"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white">Venturizer</p>
                        <p className="text-[10px] text-white/40">Qualification Assistant</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] text-white/40">Online</span>
                    </div>
                  </div>

                  {/* Transcript */}
                  <div className="px-5 py-5 space-y-4">
                    <BotBubble text="Hi there 👋 I'm the Venturizer Qualification Assistant. Are you a **Founder** or an **Investor**?" />
                    <UserBubble text="Founder" />
                    <BotBubble text="Great! Let's get started. What is your **startup called**?" />
                    <div className="flex items-end gap-2 opacity-60">
                      <AvatarV />
                      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/[0.06] px-4 py-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-typing-dot" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-typing-dot" style={{ animationDelay: '180ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-typing-dot" style={{ animationDelay: '360ms' }} />
                      </div>
                    </div>
                  </div>

                  {/* Input area preview */}
                  <div className="border-t border-white/[0.06] px-5 py-4">
                    <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-2.5 group-hover:border-white/20 transition-colors">
                      <span className="text-[13px] text-white/25 flex-1">Type your answer…</span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 flex-none">
                        <ArrowRight className="h-3.5 w-3.5 text-white/60" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PATHS ── */}
      <section className="border-t border-border bg-white">
        <div className="container py-20 md:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <p className="section-label mb-3">Two paths, one platform</p>
              <h2 className="text-[28px] font-bold text-[#0d1428] tracking-tight">
                Built for both sides of the table
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Founders card */}
              <PathCard
                icon={<Briefcase className="h-5 w-5" />}
                label="For Founders"
                count="18 questions"
                description="Share your vision, upload your pitch deck, and get matched with the right investors based on stage, sector, and traction."
                cta="Start as a founder"
                onClick={chatbot.open}
              />

              {/* Investors card */}
              <PathCard
                icon={<TrendingUp className="h-5 w-5" />}
                label="For Investors"
                count="17 questions"
                description="Define your thesis, set your parameters, and discover high-quality deal flow that matches your investment criteria."
                cta="Start as an investor"
                onClick={chatbot.open}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="border-t border-border bg-[#f7f8fa]">
        <div className="container py-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-[26px] font-bold text-[#0d1428] tracking-tight">
                From chat to qualified lead
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">In under 5 minutes</p>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { n: '01', label: 'Open chatbot', icon: <MessageSquare className="h-4 w-4" /> },
                { n: '02', label: 'Choose path', icon: <Zap className="h-4 w-4" /> },
                { n: '03', label: 'Answer questions', icon: <CheckCircle2 className="h-4 w-4" /> },
                { n: '04', label: 'Get scored', icon: <BarChart3 className="h-4 w-4" /> },
              ].map(({ n, label, icon }) => (
                <div key={n} className="text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-border shadow-sm text-[#0d1428]">
                    {icon}
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest mb-1">{n}</p>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button
                id="cta-open-chatbot"
                type="button"
                onClick={chatbot.open}
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#0d1428] px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-[#1a2540] hover:shadow-lg active:scale-[0.98]"
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
                Get Started — It's Free
              </button>
              <p className="mt-3 text-xs text-muted-foreground/40">No account · No setup · Just a conversation</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PathCard({
  icon, label, count, description, cta, onClick
}: {
  icon: React.ReactNode;
  label: string;
  count: string;
  description: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left rounded-2xl border border-border bg-white p-7 transition-all duration-200 hover:border-[#0d1428]/30 hover:shadow-lg hover:shadow-black/5 active:scale-[0.99] w-full"
    >
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f8fa] border border-border text-[#0d1428]">
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-[16px] font-bold text-[#0d1428]">{label}</h3>
        <span className="rounded-md bg-secondary border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{count}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-[#dc2626] group-hover:gap-2 transition-all">
        {cta}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </div>
    </button>
  );
}

function AvatarV() {
  return (
    <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/10">
      <svg width="10" height="10" viewBox="0 0 32 32" fill="none">
        <path d="M8 8L14.5 22L16 18.5L11.5 8H8Z" fill="#dc2626"/>
        <path d="M24 8L17.5 22L16 18.5L20.5 8H24Z" fill="white" fillOpacity="0.9"/>
      </svg>
    </div>
  );
}

function BotBubble({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <div className="flex items-end gap-2.5">
      <AvatarV />
      <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-white/[0.07] px-4 py-3">
        <p className="text-[12px] text-white/80 leading-relaxed">
          {parts.map((p, i) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
              : <span key={i}>{p}</span>
          )}
        </p>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end justify-end">
      <div className="max-w-[70%] rounded-2xl rounded-br-sm bg-white px-4 py-2.5">
        <p className="text-[12px] text-[#0d1428] font-semibold">{text}</p>
      </div>
    </div>
  );
}
