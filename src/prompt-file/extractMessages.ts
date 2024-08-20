import { Message, Content } from "../utils/types";

type TokenType = 'RoleTagOpen' | 'RoleTagClose' | 'ContentTagOpen' | 'ContentTagClose' | 'Text' | 'SelfClosingTag' | 'EOF';

interface Token {
  type: TokenType;
  value: string;
}

interface MessageNode {
  type: "system" | "user" | "assistant";
  content: Array<ContentNode>;
}

interface ContentNode {
  type: "text" | "img";
  content: string;
}



class Tokenizer {
  private pos: number = 0;
  private input: string;

  constructor(input: string) {
    this.input = input;
  }

  nextToken(): Token {
    this.skipWhitespace(); // Skip any whitespace before looking for the next token

    if (this.pos >= this.input.length) {
      return { type: 'EOF', value: '' };
    }

    const remainder = this.input.slice(this.pos);

    if (/^<(system|user|assistant)>/.test(remainder)) {
      const match = remainder.match(/^<(\w+)>/);
      if (match) {
        this.pos += match[0].length;
        return { type: 'RoleTagOpen', value: match[1] };
      }
    }

    if (/^<(text)>/.test(remainder)) {
      const match = remainder.match(/^<(\w+)>/);
      if (match) {
        this.pos += match[0].length;
        return { type: 'ContentTagOpen', value: match[1] };
      }
    }

    if (/^<\/(system|user|assistant)>/.test(remainder)) {
      const match = remainder.match(/^<\/(\w+)>/);
      if (match) {
        this.pos += match[0].length;
        return { type: 'RoleTagClose', value: match[1] };
      }
    }

    if (/^<\/(text)>/.test(remainder)) {
      const match = remainder.match(/^<\/(\w+)>/);
      if (match) {
        this.pos += match[0].length;
        return { type: 'ContentTagClose', value: match[1] };
      }
    }

    if (/^<img/.test(remainder)) {
      const match = remainder.match(/^<img\s+src="([^"]+)"\s*\/>/);
      if (match) {
        this.pos += match[0].length;
        return { type: 'SelfClosingTag', value: match[1] };
      }
    }


    const textMatch = remainder.match(/^[^<]+/);
    if (textMatch) {
      this.pos += textMatch[0].length;
      return { type: 'Text', value: textMatch[0].trim() }; // Trim text here
    }

    throw new Error(`Unexpected character at position ${this.pos}`);
  }

  private skipWhitespace() {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }
}

class Parser {
  private tokenizer: Tokenizer;
  private lookahead: Token | null = null;

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
    this.lookahead = this.tokenizer.nextToken();
  }

  parse(): MessageNode[] {
    const nodes: MessageNode[] = [];
    while (this.lookahead && this.lookahead.type !== 'EOF') {
      nodes.push(this.parseMessageNode());
    }
    return nodes;
  }

  parseMessageNode(): MessageNode {
    if (this.lookahead?.type === 'RoleTagOpen') {
      const tagName = this.lookahead.value;
      this.consume('RoleTagOpen');
      const content = this.parseContentNode();
      this.consume('RoleTagClose', tagName);
      return { type: tagName as 'system' | 'user' | 'assistant', content };
    } else {
      const content = this.parseContentNode();
      return { type: 'user', content };
    }
  }

  parseContentNode(): ContentNode[] {
    const content: ContentNode[] = [];
    while (this.lookahead && this.lookahead.type !== 'EOF' && this.lookahead.type !== 'RoleTagClose' && this.lookahead.type !== 'RoleTagOpen') {
      if (this.lookahead.type === 'ContentTagOpen') {
        this.consume('ContentTagOpen');
        content.push({ type: 'text', content: this.lookahead.value });
        this.consume('Text');
        this.consume('ContentTagClose', this.lookahead.value);
      } else if (this.lookahead.type === 'Text') {
        content.push({ type: 'text', content: this.lookahead.value });
        this.consume('Text');
      } else if (this.lookahead.type === 'SelfClosingTag') {
        content.push({ type: 'img', content: this.lookahead.value });
        this.consume('SelfClosingTag');
      } else {
        throw new Error(`Unexpected token: ${this.lookahead.type}`);
      }
    }
    return content;
  }

  consume(expectedType: TokenType, expectedValue?: string) {
    if (this.lookahead?.type === expectedType && (!expectedValue || this.lookahead.value === expectedValue)) {
      this.lookahead = this.tokenizer.nextToken();
    } else {
      throw new Error(`Expected ${expectedType} but got ${this.lookahead?.type}`);
    }
  }
}

export function extractMessages(input: string): Message[] {
  const tokenizer_for_log = new Tokenizer(input);
  while (true) {
    const token = tokenizer_for_log.nextToken();
    console.log(token);
    if (token.type === 'EOF') {
      break;
    }
  }
  const tokenizer = new Tokenizer(input);
  const parser = new Parser(tokenizer);
  const nodes: MessageNode[] = parser.parse();

  // Transform parsed nodes into messages
  const messages: Message[] = nodes.map(node => {
    if (node.content.length === 1 && node.content[0].type === 'text') {
      return {
        role: node.type as "system" | "user" | "assistant",
        content: node.content[0].content
      };
    }

    return {
      role: node.type as "system" | "user" | "assistant",
      content: node.content.map(contentNode => {
        if (contentNode.type === 'text') {
          return { type: 'text', text: contentNode.content };
        } else {
          return { type: 'image_url', image_url: { url: contentNode.content } };
        }
      })
    };
  }
  );
  return messages;
}
