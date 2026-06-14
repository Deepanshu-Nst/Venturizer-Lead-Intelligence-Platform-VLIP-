import { evaluateLeadWithAI } from './src/features/scoring/engine/ai-analyst.js';
(async () => {
  console.log("Testing AI...");
  const res = await evaluateLeadWithAI("founder", { "idea": "we make an ai for space" });
  console.log(res);
})();
