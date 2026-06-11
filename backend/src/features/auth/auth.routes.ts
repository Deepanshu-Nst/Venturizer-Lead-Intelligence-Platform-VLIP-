import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/middleware/validate.js";

const router = Router();

const loginSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

router.post("/login", validate(loginSchema), (req, res) => {
  const { apiKey } = req.body as z.infer<typeof loginSchema>;

  if (apiKey !== process.env.API_KEY) {
    res.status(401).json({
      data: null,
      error: { code: "INVALID_KEY", message: "Invalid API key" },
    });
    return;
  }

  res.json({
    data: {
      token: "authenticated",
      expires_in: "24h",
    },
    error: null,
  });
});

export default router;
