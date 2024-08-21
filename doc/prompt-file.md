# The Prompt File Format
The Prompt file format is designed to help users define structured prompts for interacting with large language models (LLMs). It's inspired from [Continue's](https://docs.continue.dev/features/prompt-files) and [HumanLoops](https://docs.humanloop.com/docs/prompt-file-format) prompt file.  

The prompt file supports a variety of tools such as **input variable, web browsing, image, prompt chaining, code execution, control loop, etc.** to help users develop and evaluate prompts more efficiently. In fact, you can create a complete AI Agent workflow with prompt files alone.

The prompt files end with a `.prompt` extension. Checkout the `/examples` folder for the different workflows it supports.

## File Structure
The format consists of two main sections: a YAML configuration section and a [Handlebars](https://handlebarsjs.com/) template section. Below is a detailed explanation of the format with examples.

Each .prompt file is divided into two sections:

1.	**YAML Configuration Section**: This section (optional) contains key-value pairs that configure the behavior of the prompt, such as model selection, token limits, and provider configuration.
2.	**Handlebars Template Section**: This section contains the template for the prompt itself, which may include placeholders for dynamic content and custom helpers.

## Examples

### Basic Prompt
For the most basic usage. It is the same as a plain text file:
```
You are a software expert. You help me write some test code for the `prompt-runner` vscode plugin.

{{! This is the commenting syntax. This line will not show up in the output}}
```
### Configure the LLM parameters
You can configure the model to use and parameters like temperature, top_p, max_tokens etc.
```yaml
---
provider: openai
model: gpt-4o
temperature: 0.5
max_tokens: 4096
---
You are a software expert. You help me write some test code for the `prompt-runner` vscode plugin.
```

### User input
The template syntax is based on [Handlebars](https://handlebarsjs.com/). Use `{{variable}}` to denote variables. User will be prompted to enter the value of each variable when this prompt is run.
```yaml
---
provider: openai
model: gpt-4o
temperature: 0.5
max_tokens: 4096
---
You are a software expert. You help me write some test code for the `{{extension_name}}` vscode plugin.
```


### Include files in the prompt
Local files can be included in the prompt using `include` helper.

```yaml
---
provider: openai
model: gpt-4o
temperature: 0.5
max_tokens: 4096
---
You are a software expert. You help me write some test code for the `prompt-runner` vscode plugin. Please refer to the extension.ts file below.

{{include "src/extension.ts"}}
```

The content of `src/extension.ts` will be included in the prompt once you compile it. The relative path is the directory of the current prompt file.

### Web browsing
You can include web contents in your prompt using the `browse` helper. By default we use the [JINA Reader API](https://jina.ai/reader/) for better formatting. But you can also pass the `raw` option to get the raw content.
```yaml
---
provider: openai
model: gpt-4o
temperature: 0.5
max_tokens: 4096
---
You are a software expert. You help me write some test code for the `prompt-runner` vscode plugin. Please refer to the github repo below.

{{browse "https://github.com/js8544/vscode-prompt-runner/"}}

or the raw content

{{browse "https://github.com/js8544/vscode-prompt-runner/" "raw"}}
```

### Role messages
You include system and other role message using the multi-role format:
```html
---
provider: openai
model: gpt-4o
temperature: 0.5
max_tokens: 4096
description: A prompt with multiple roles
---
<system>
  System-level instructions.
</system>

<user>
  This is a user message
</user>

<assistant>
  This is a user message
</assistant>

Messages without surrounding role tags are also user messages.
```

This compiles to:
```json
[
  {"role": "system", "content": "System-level instructions."},
  {"role": "user", "content": "This is a user message"},
  {"role": "assistant", "content": "This is a user message"},
  {"role": "user", "content": "Messages without surrounding role tags are also user messages."},
]
```

### Image
You can include image in your prompt with the `image` helper. You can include both local images and web urls. Local images are encoded to base64 data for compatibility with [OpenAI's vision api](https://platform.openai.com/docs/guides/vision/uploading-base-64-encoded-images) and [Ollama's vision api](https://ollama.com/blog/vision-models).

```yaml
provider: openai
model: gpt-4o-mini
---
What are these images?

{{image "https://en.wikipedia.org/wiki/File:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg"}}

{{image "monalisa.jpg"}}

```

### Search
We again leverage [JINA's reader api](https://jina.ai/reader/) for searching. Use the `search` helper to get the search result. Here's is an AI search engine implement in one prompt file.
```yaml
---
# Adapted from https://github.com/ItzCrazyKns/Perplexica/blob/9c1936ec2cb0a18389c6037895c30aab416243b9/src/agents/webSearchAgent.ts#L26
model: gpt-4o
provider: OpenAI
max_tokens: 1024
---
You are an AI model who is expert at searching the web and answering user's queries. You are also an expert at summarizing web pages or documents and searching for content in them.

Generate a response that is informative and relevant to the user's query based on provided context (the context consists of search results containing a brief description of the content of that page).
You must use this context to answer the user's query in the best way possible. Use an unbiased and journalistic tone in your response. Do not repeat the text.
You must not tell the user to open any link or visit any website to get the answer. You must provide the answer in the response itself. If the user asks for links you can provide them.
If the query contains some links and the user asks to answer from those links you will be provided the entire content of the page inside the \`context\` block. You can then use this content to answer the user's query.
If the user asks to summarize content from some links, you will be provided the entire content of the page inside the \`context\` block. You can then use this content to summarize the text. The content provided inside the \`context\` block will be already summarized by another model so you just need to use that content to answer the user's query.
Your responses should be medium to long in length be informative and relevant to the user's query. You can use markdowns to format your response. You should use bullet points to list the information. Make sure the answer is not short and is informative.
You have to cite the answer using [number] notation. You must cite the sentences with their relevant context number. You must cite each and every part of the answer so the user can know where the information is coming from.
Place these citations at the end of that particular sentence. You can cite the same sentence multiple times if it is relevant to the user's query like [number1][number2].
However you do not need to cite it using the same number. You can use different numbers to cite the same sentence multiple times. The number refers to the number of the search result (passed in the context) used to generate that part of the answer.
You should list all the citations, their title and url at the end of your response.

Anything inside the following \`context\` block provided below is for your knowledge returned by the search engine and is not shared by the user. You have to answer question on the basis of it and cite the relevant information from it but you do not have to
talk about the context in your response.

<context>
{{search keyword}}
</context>

If you think there's nothing relevant in the search results, you can say that 'Hmm, sorry I could not find any relevant information on this topic. Would you like me to search again or ask something else?'. You do not need to do this for summarization tasks.
Anything between the \`context\` is retrieved from a search engine and is not a part of the conversation with the user. Today's date is ${new Date().toISOString()}
```

### Prompt Chaining and Multi-shot Reasoning
This is where the magic of AI agent workflows comes in. You can include the result of running a prompt in another prompt using the `eval` helper. This can be used to implement prompt chaining and multi-shot reasoning.
```yaml
---
provider: openai
model: gpt-4o-mini
temperature: 0.5
max_tokens: 4096
---
<system>
  You are an AI assistant.
</system>

<user>
  {{question1}}
</user>


{{! Assuming `answer_with_gpt4o.prompt` take a single input var "question"}}
<assistant>
  {{eval "answer_with_gpt4o.prompt" question=question1 }}
</assistant>

<user>
  {{question2}}
</user>

<assistant>
  {{eval "answer_with_gpt4o.prompt" question=question2 }}
</assistant>

<user>
  {{question}}
</user>
```
When this prompt is run, it will ask for two questions and run them with `answer_with_gpt4o.prompt`. Then the answer of gpt4o will be included in this prompt to achieve multi-shot reasoning for gpt4o-mini.

### Custom Code Execution (TODO)
You can run custom code with `shell`, `python` and `js`. This feature will be designed later.

### If and For Loop (TODO)
This feature will be designed later.

### Testing and Evaluation (TODO)
You can append a test section at the end of the prompt, like Rust `$[cfg(test)]` unit tests. This feature will be designed later.
