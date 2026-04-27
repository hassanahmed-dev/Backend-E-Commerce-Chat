import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type GroqChoice = {
  message?: {
    content?: string;
  };
};

type GroqResponse = {
  choices?: GroqChoice[];
};

@Injectable()
export class ChatAiService {
  constructor(private readonly configService: ConfigService) {}

  async generateAdminReply(prompt: string, analyticsContext: string): Promise<string> {
    const smallTalkReply = this.getSmallTalkReply(prompt);
    if (smallTalkReply) {
      return smallTalkReply;
    }

    const apiKey = this.configService.get<string>("GROQ_API_KEY");
    const model = this.configService.get<string>("GROQ_MODEL") ?? "llama-3.1-8b-instant";

    if (!apiKey) {
      throw new ServiceUnavailableException("Groq API key is not configured");
    }

    const systemPrompt = [
      "You are an e-commerce admin assistant.",
      "Use the provided analytics/database context as the source of truth for business, app, and database questions.",
      "If the user message is just a greeting or casual small talk, reply naturally in 1 short sentence and do not output analytics stats.",
      "Do not mention Shopify, Amazon, Etsy, or external tools.",
      "If requested data is not in context, clearly say it is unavailable.",
      "When asked for counts (users/orders/chats/messages/products), answer with exact numbers from context.",
      "When asked for product names or all products, use all_product_names from context and return the full list clearly.",
      "Reply in concise plain text.",
      "",
      "ANALYTICS_CONTEXT",
      analyticsContext
    ].join("\n");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new ServiceUnavailableException(`Groq request failed: ${text || response.statusText}`);
    }

    const json = (await response.json()) as GroqResponse;
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new ServiceUnavailableException("Groq returned empty response");
    }

    return text;
  }

  private getSmallTalkReply(prompt: string): string | null {
    const normalized = prompt.trim().toLowerCase();
    if (!normalized) return null;

    const greetingOnlyPattern = /^(hi+|hello+|hey+|salam|assalam(?:\s*o\s*alaikum)?|aoa|yo+|sup+|what'?s up)[!.? ]*$/i;
    if (greetingOnlyPattern.test(normalized)) {
      return "Hello! How can I help you today?";
    }

    const thanksOnlyPattern = /^(thanks?|thank you|jazakallah|shukriya)[!.? ]*$/i;
    if (thanksOnlyPattern.test(normalized)) {
      return "You are welcome. Let me know what you need.";
    }

    return null;
  }
}
