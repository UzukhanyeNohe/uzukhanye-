// POST /api/mark  — proxies the marking request to the Anthropic API.
// The API key stays server-side (set ANTHROPIC_API_KEY in Vercel env vars).

const MARK_SYS = `You are a strict but fair and encouraging IEB Grade 10 English Home Language examiner. You are marking a closed-book cycle test on "The Curious Incident of the Dog in the Night-Time" by Mark Haddon, written by a Grade 10 learner. Mark each answer the way a standard IEB memo would: award marks for valid, developed points supported by reference to the novel; award partial marks generously where a point is valid but undeveloped; award zero where an answer is factually wrong, blank, off-topic, or merely restates the question. For "critically discuss" and "compare" questions, reward balance and nuance. Be specific in comments: say exactly what earned marks and exactly what was missing. Keep each comment to 2-3 sentences and each modelAnswer to 2-3 sentences of what a full-mark answer would include. Respond with ONLY a JSON object, no markdown fences, no preamble, in this exact shape: {"questions":[{"id":"1.1","awarded":0,"outOf":3,"comment":"...","modelAnswer":"..."}],"total":0,"outOf":30,"overall":"3-4 sentence overall feedback with the learner's strongest skill and the single biggest thing to fix before the real test"}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set in Vercel environment variables" });
  }
  const content = req.body?.content;
  if (typeof content !== "string" || content.length < 20 || content.length > 60000) {
    return res.status(400).json({ error: "Invalid test payload" });
  }
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        system: MARK_SYS,
        messages: [{ role: "user", content }],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(502).json({ error: data?.error?.message || "Anthropic API error" });
    }
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
