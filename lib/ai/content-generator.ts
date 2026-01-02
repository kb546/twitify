import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ContentGenerationOptions {
  trendingTopics?: string[];
  categories?: string[];
  goals?: string[];
  tone?: "professional" | "casual" | "humorous" | "inspirational";
  maxLength?: number;
}

export async function generateTweetContent(
  options: ContentGenerationOptions = {}
): Promise<{
  content: string;
  hashtags: string[];
  model: string;
}> {
  const {
    trendingTopics = [],
    categories = [],
    goals = [],
    tone = "professional",
    maxLength = 280,
  } = options;

  const prompt = `Generate a Twitter tweet that:
- Is engaging and relevant
- Tone: ${tone}
- Maximum ${maxLength} characters
- Includes 2-3 relevant hashtags
- ${trendingTopics.length > 0 ? `References trending topics: ${trendingTopics.slice(0, 3).join(", ")}` : ""}
- ${categories.length > 0 ? `Relates to: ${categories.join(", ")}` : ""}
- ${goals.length > 0 ? `Helps achieve: ${goals.join(", ")}` : ""}

Return a JSON object with:
{
  "content": "the tweet text",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}`;

  try {
    // Try OpenAI first
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a social media content creator. Generate engaging Twitter content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      content: result.content || "",
      hashtags: result.hashtags || [],
      model: "gpt-4-turbo-preview",
    };
  } catch (openaiError) {
    console.warn("OpenAI request failed, trying Anthropic:", openaiError);
    
    // Fallback to Anthropic
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        const result = JSON.parse(content.text);
        return {
          content: result.content || "",
          hashtags: result.hashtags || [],
          model: "claude-3-opus",
        };
      }
    } catch (anthropicError) {
      console.error("Both AI services failed:", anthropicError);
      throw new Error("Failed to generate content");
    }
  }

  throw new Error("Failed to generate content");
}

export async function generateMultipleSuggestions(
  count: number = 5,
  options: ContentGenerationOptions = {}
): Promise<Array<{ content: string; hashtags: string[]; model: string }>> {
  const suggestions = [];
  for (let i = 0; i < count; i++) {
    try {
      const suggestion = await generateTweetContent(options);
      suggestions.push(suggestion);
    } catch (error) {
      console.error(`Error generating suggestion ${i + 1}:`, error);
    }
  }
  return suggestions;
}

