import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { CheckCircle } from "lucide-react";

export function ThankYouPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center animate-fade-up">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle className="h-8 w-8 text-accent" aria-hidden />
        </div>

        <h1 className="text-2xl font-bold text-foreground">Thank You</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Your submission has been received. Our team will review your
          qualification and get back to you within 48 hours.
        </p>

        <div className="mt-8 space-y-3">
          <Button
            className="w-full h-11"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
          <Button
            variant="outline"
            className="w-full h-11"
            onClick={() => navigate("/qualify")}
          >
            Submit Another
          </Button>
        </div>
      </div>
    </div>
  );
}
