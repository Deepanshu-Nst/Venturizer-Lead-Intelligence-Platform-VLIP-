import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { ArrowRight, Zap, Briefcase, TrendingUp } from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
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
            Venturizer helps founders and investors connect through a
            streamlined, data-driven qualification process. Get matched on fit,
            not just hype.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="w-full sm:w-auto min-w-[200px] h-12 text-base gap-2"
              onClick={() => navigate("/qualify")}
            >
              Start Qualification
            <ArrowRight className="h-4 w-4" aria-hidden />
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
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container py-16 md:py-24">
          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            <div className="group relative overflow-hidden rounded-xl border border-border bg-background p-8 transition-all hover:border-foreground/20">
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
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-border bg-background p-8 transition-all hover:border-foreground/20">
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
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/50">
        <div className="container py-16 md:py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl text-balance">
            Ready to qualify your next lead?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto text-balance">
            Get started in under 5 minutes. No account required.
          </p>
          <Button
            size="lg"
            className="mt-8 h-12 px-8 text-base gap-2"
            onClick={() => navigate("/qualify")}
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
