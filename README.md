
# Prompt Runner VSCode Extension

## Overview

Prompt Runner is a Visual Studio Code extension that allows users to run [prompt files](doc/prompt-file.md) against various LLMs directly from the editor. It turns VSCode into a powerful prompt IDE. You no longer have to tolerate the tiny chat interface or copy pasting between apps for complex prompts.

[The prompt file format](doc/prompt-file.md) is designed to help users define structured prompts for interacting with large language models (LLMs). It supports a variety of tools such as **input variable, web browsing, image, promtp chaining, code execution, control loop, etc.** to help users develop and evaluate prompts more efficiently. In fact, you can create a complete AI Agent workflow with prompt files alone.

Check out the [this doc](doc/prompt-file.md) for a detailed documentation of what this extension supports. Checkout the `/examples` folder for many example workflows 

![demo](images/demo.gif)

## Installation 

Install on [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=JinShang.prompt-runner)


## Features

- **Run Prompt Files**: Run the content of the active editor as a prompt against the selected LLM provider and model. 
- **Extensive Tools**: [The prompt file format](doc/prompt-file.md) supports tools such as **input variable, web browsing, image, promtp chaining, code execution, control loop, etc.**. In fact you can build agents entirely with prompt files.
- **Multiple Providers**: Support for various providers including OpenAI, Anthropic, Gemini, Mistral, Groq and Ollama. More to be added in the future (Amazon Bedrock, Google Vertex AI, Cohere, Perplexity, Fireworks, Chrome AI, AnthropicVertex, FriendliAI, Portkey, Cloudflare Workers AI, LLamaCpp).
- **Observability** (TODO): Integrate with prompt management platforms such as Langfuse for observability, feedback and prompt management.

## Usage

### Sidebar
Use the "Prompt Runner" sidebar to trigger the commands:
- **Run Prompt**: Run the current document as a prompt using the default provider and model.
- **Run Prompt with Model**: Run the current document as a prompt after selecting a provider and model.
- **Preview Prompt**: Compile the current prompt file.
- **Select Default Model**: Set the default provider and model to use for future prompts.
- **Select Output Location**: Set the output location of the compiled prompts or running outputs. Choose `webview panel` for better readability, or `output channel` for easier copy.
- **Provider Settings**: Open the settings panel for the extension. Click "settings.json" to update the API Keys.

### Commands
Press `Ctrl+Shift+P` or `F1` to open the command palette, and type the following commands:
- **Compile Prompt File**: Compile the current prompt file.
  - Command: `Prompt Runner: Compile Prompt File`

- **Run Prompt File**: Run the current document as a prompt using the default provider and model.
  - Command: `Prompt Runner: Run Prompt File`
  
- **Run Prompt File with Selected Provider**: Run the current document as a prompt after selecting a provider and model.
  - Command: `Prompt Runner: Run Prompt File with Selected Provider`
  
- **Select Default Model**: Set the default provider and model to use for future prompts.
  - Command: `Prompt Runner: Select Default Model`

- **Select Output Location**: Set the output location of the compiled prompts or running outputs. Choose `webview panel` for better readability, or `output channel` for easier copy.
  - Command: `Prompt Runner: Select Output Location`

### Configuration

The extension allows users to configure providers and models in the VSCode settings. If no configuration is provided, the extension will initialize with default settings.

#### Default Providers

The default providers include:
- **OpenAI**: `gpt-3.5-turbo`, `gpt-4`, `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`
- **Anthropic**: `claude-3-5-sonnet-20240620`, `claude-3-opus-20240229`, `claude-3-sonnet-20240229`, `claude-3-haiku-20240307`
- **Gemini**: `gemini-1.5-flash`, `gemini-1.5-flash-8b`, `gemini-1.5-pro`
- **Mistral**: `mistral-large-latest`, `mistral-small-latest`, `pixtral-12b-2409`, `open-mistral-nemo`
- **Groq**: `gemma2-9b-it`, `gemma-7b-it`, `llama-3.1-70b-versatile`, `llama-3.1-8b-instant`, `llama-3.2-11b-vision-preview`, `mixtral-8x7b-32768`
- **Ollama**: A locally hosted LLM with support for custom models.

More models can be configured via settings.json

#### Provider Configuration Schema

The configuration for providers can be defined in the VSCode settings file. Currently supported provider types are `openai`, `anthropic`, `gemini`, `mistral`, `groq`, and `ollama`. Example config:

```json
{
    "prompt-runner.providers": [
        {
            "name": "openai",
            "type": "openai",
            "base_url": "https://api.openai.com/v1", // So that you can use OpenAI-compatible servers
            "api_key": "<your-api-key>",
            "models": [
                "gpt-3.5-turbo",
                "gpt-4",
                "gpt-4o",
                "gpt-4o-mini"
            ],
            "organization_id": "",
            "project_id": ""
        }
    ]
}
```

Important note: Anthropic `base_url` needs to end with `v1`: `https://api.anthropic.com/v1`. Ollama `base_url` needs to end with `api` instead of `v1`: `http://127.0.0.1:11434/api`

### Manual Compilation

1. Clone this repository or download the source code.
2. Install the necessary dependencies using `npm` or `yarn`:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```
3. Open the project in Visual Studio Code.
4. Press `F5` to launch the extension in a new VSCode window for testing and development.

## Debug

The logs of this extension are at the output channel. Select `Prompt Runner` in vscode output channel for debug logs.

## Development

TODO

## Contribution

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the MIT License.
