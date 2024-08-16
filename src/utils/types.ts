export interface Provider {
  name: string;
  type: "openai" | "anthropic" | "copilot" | "ollama";
  base_url?: string;
  api_key?: string;
  organization_id?: string;
  project_id?: string;
  models: string[];
  default_model?: string;
}

export interface Message {
  role: string;
  content: string;
}
