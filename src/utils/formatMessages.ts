import { Message } from "./types";

export function formatMessage(message: Message): string {
  let formattedContent = '';

  if (typeof message.content === 'string') {
    // If content is a simple string
    formattedContent = message.content;
  } else if (Array.isArray(message.content)) {
    // If content is an array of Content objects
    formattedContent = message.content.map(contentItem => {
      if (contentItem.type === 'text' && contentItem.text) {
        return contentItem.text;
      } else if (contentItem.type === 'image_url' && contentItem.image_url) {
        return `![Image](${contentItem.image_url.url})`; // Markdown image format
      }
      return ''; // Handle any unexpected cases gracefully
    }).join('\n');
  }

  const roleFormatted = `\\\<${message.role}\\\>`;
  return `# ${roleFormatted} \n\n ${formattedContent}\n`;
}

export function formatMessageForLog(message: Message): string {
  let formattedContent = '';

  if (typeof message.content === 'string') {
    // If content is a simple string
    formattedContent = message.content;
  } else if (Array.isArray(message.content)) {
    // If content is an array of Content objects
    formattedContent = message.content.map(contentItem => {
      if (contentItem.type === 'text' && contentItem.text) {
        return contentItem.text;
      } else if (contentItem.type === 'image_url' && contentItem.image_url) {
        return `![Image](${contentItem.image_url.url})`; // Markdown image format
      }
      return ''; // Handle any unexpected cases gracefully
    }).join('\n');
  }

  const roleFormatted = `${message.role}`;
  return `${roleFormatted}: ${formattedContent}\n`;
}

export function formatMessages(messages: Message[]): string {
  return messages.map(formatMessage).join('\n');
}

export function formatMessagesForLog(messages: Message[]): string {
  return messages.map(formatMessageForLog).join('');
}
