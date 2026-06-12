import { ArrowRight, MessageSquare, Zap, Briefcase, TrendingUp, Shield, BarChart3, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useChatbot } from "@/features/chatbot/ChatbotContext";

export function LandingPage() {
  const chatbot = useChatbot();

  return (
    <div className="animate-fade-in">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-transparent pointer-events-none" />

        <div className="container relative pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="mx-auto max-w-4xl text-center">
            {/* Headline */}
            <h1 className="text-[48px] md:text-[68px] font-extrabold tracking-tight text-[#0d1428] leading-[1.02] text-balance">
              Qualify startups.<br />
              Discover opportunities.<br />
              <span className="text-[#dc2626]">Move faster.</span>
            </h1>

            <p className="mt-8 text-[18px] text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
              Venturizer helps founders surface investor-ready signals and helps investors review opportunities with greater confidence.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                id="hero-open-chatbot"
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={chatbot.open}
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#0d1428] px-8 py-4 text-[16px] font-semibold text-white transition-shadow hover:bg-[#1a2540] hover:shadow-xl hover:shadow-[#0d1428]/20"
              >
                Start Qualification
                <ChevronRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" aria-hidden />
              </motion.button>
              
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-white border border-border px-8 py-4 text-[16px] font-semibold text-[#0d1428] transition-colors hover:bg-secondary"
              >
                See How It Works
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHATBOT PREVIEW ── */}
      <section id="how-it-works" className="border-t border-border bg-[#f7f8fa]">
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
                  scored automatically against a 0–100 qualification model in real time.
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
                    <BotBubble text="Great! Let's qualify your startup. I'll ask ~18 focused questions — takes about 5 minutes 🚀" />
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

      {/* ── FOR FOUNDERS ── */}
      <section id="for-founders" className="border-t border-border bg-white overflow-hidden">
        <div className="container py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-square max-w-md mx-auto lg:mx-0 rounded-2xl bg-secondary/50 border border-border p-8 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <div className="space-y-6">
                  <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-border flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-[#0d1428]" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-[#0d1428] mb-2">Upload your deck. Get reviewed.</h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      Share your vision, traction, and market size. Our qualification engine scores your startup against our active investment thesis in real time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="section-label mb-3">For Founders</p>
              <h2 className="text-[36px] font-bold text-[#0d1428] tracking-tight leading-tight mb-6">
                Skip the cold outreach.<br />Get straight to the point.
              </h2>
              <p className="text-[16px] text-muted-foreground leading-relaxed mb-8">
                Venturizer provides a direct line to our investment team. By answering a few key questions, you ensure your startup gets evaluated on the metrics that actually matter.
              </p>
              <button
                type="button"
                onClick={() => chatbot.openWithPersona('founder')}
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#0d1428] px-6 py-3.5 text-[14px] font-bold text-white transition-all hover:bg-[#1a2540] active:scale-[0.98]"
              >
                Start Founder Qualification <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR INVESTORS ── */}
      <section id="for-investors" className="border-t border-border bg-[#f7f8fa] overflow-hidden">
        <div className="container py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="section-label mb-3">For Investors</p>
              <h2 className="text-[36px] font-bold text-[#0d1428] tracking-tight leading-tight mb-6">
                Curated deal flow.<br />Matched to your thesis.
              </h2>
              <p className="text-[16px] text-muted-foreground leading-relaxed mb-8">
                Stop sifting through irrelevant pitches. Tell us your focus areas, stage preferences, and check size, and we'll route high-quality, pre-qualified startups directly to you.
              </p>
              <button
                type="button"
                onClick={() => chatbot.openWithPersona('investor')}
                className="inline-flex items-center gap-2.5 rounded-xl bg-white border border-border px-6 py-3.5 text-[14px] font-bold text-[#0d1428] shadow-sm transition-all hover:bg-secondary active:scale-[0.98]"
              >
                Create Investor Profile <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto lg:mx-0 lg:ml-auto rounded-2xl bg-white border border-border p-8 flex flex-col justify-center relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0d1428] to-slate-600" />
                <div className="space-y-6">
                  <div className="h-12 w-12 rounded-xl bg-[#f7f8fa] border border-border flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-[#0d1428]" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-[#0d1428] mb-2">Define your parameters.</h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      Upload your investment thesis. Our matching engine pairs you with startups that align perfectly with your deployment strategy.
                    </p>
                  </div>
                </div>
              </div>
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
                { n: '02', label: 'Choose your path', icon: <Zap className="h-4 w-4" /> },
                { n: '03', label: 'Answer questions', icon: <CheckCircle2 className="h-4 w-4" /> },
                { n: '04', label: 'Get qualified', icon: <BarChart3 className="h-4 w-4" /> },
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
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#0d1428] px-8 py-4 text-[15px] font-semibold text-white transition-all hover:bg-[#1a2540] hover:shadow-lg active:scale-[0.98]"
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
