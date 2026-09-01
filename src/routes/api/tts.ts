import { createFileRoute } from "@tanstack/react-router";

type Body = { text?: unknown; voice?: unknown };

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const text = typeof body.text === "string" ? body.text.trim() : "";
        const voice = typeof body.voice === "string" ? body.voice : "alloy";
        if (!text) return new Response("Text is required", { status: 400 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("Voice output is not configured", { status: 500 });

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text.slice(0, 3500),
            voice,
            instructions:
              "Speak in a warm, calm, unhurried way, with clear pronunciation suited to a listener who prefers audio over reading.",
            stream_format: "sse",
            response_format: "pcm",
          }),
        });

        if (!res.ok || !res.body) {
          const detail = await res.text().catch(() => "");
          return new Response(detail || "Voice output failed", { status: res.status || 502 });
        }

        return new Response(res.body, {
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
