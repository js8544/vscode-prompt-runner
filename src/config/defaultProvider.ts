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
      "gpt-4o-mini"
    ],
    organization_id: "",
    project_id: ""
  },
  {
    name: "Anthropic",
    type: "anthropic",
    base_url: "https://api.anthropic.com",
    api_key: "",
    models: [
      "claude-3-5-sonnet-20240620",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307"
    ]
  },
  {
    name: "VSCode Copilot",
    type: "copilot",
    models: [
      "gpt-3.5-turbo",
      "gpt-4",
      "gpt-4o"
    ]
  },
  {
    name: "Ollama",
    type: "ollama",
    base_url: "http://127.0.0.1:11434/v1",
    api_key: "sk-ollama",
    models: []
  }
];
