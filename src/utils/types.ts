export interface Provider {
  name: string;
  type: "openai" | "anthropic" | "gemini" | "mistral" | "groq" | "ollama";
  base_url?: string;
  api_key?: string;
  organization_id?: string;
  project_id?: string;
  models: string[];
  default_model?: string;
}

export interface ImageContent {
  url: string
}
export interface Content {
  type: "text" | "image_url";
  text?: string;
  image_url?: ImageContent;
}
export interface Message {
  role: "system" | "user" | "assistant";
  content: string | Content[];
}

export interface PromptConfig {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  provider?: string;
}
