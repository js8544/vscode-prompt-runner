import { Provider } from '../utils/types';

export const defaultProviders: Provider[] = [
  {
    name: "OpenAI",
    type: "openai",
    base_url: "https://api.openai.com/v1",
    api_key: "",
    models: [
      "gpt-3.5-turbo",
      "gpt-4",
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4-turbo"
    ],
    organization_id: "",
    project_id: ""
  },
  {
    name: "Anthropic",
    type: "anthropic",
    base_url: "https://api.anthropic.com/v1",
    api_key: "",
    models: [
      "claude-3-5-sonnet-20240620",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307"
    ]
  },
  {
    name: "Gemini",
    type: "gemini",
    base_url: "https://generativelanguage.googleapis.com/v1beta",
    api_key: "",
    models: [
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro",
    ]
  },
  {
    name: "Mistral",
    type: "mistral",
    base_url: "https://api.mistral.ai/v1",
    api_key: "",
    models: [
      "mistral-large-latest",
      "mistral-small-latest",
      "pixtral-12b-2409",
      "open-mistral-nemo",
    ]
  },
  {
    name: "Groq",
    type: "groq",
    base_url: "https://api.groq.com/openai/v1",
    api_key: "",
    models: [
      "gemma2-9b-it",
      "gemma-7b-it",
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
      "llama-3.2-11b-vision-preview",
      "mixtral-8x7b-32768",
    ]
  },
  {
    name: "Ollama",
    type: "ollama",
    base_url: "http://127.0.0.1:11434/api",
    api_key: "sk-ollama",
    models: []
  }
];
