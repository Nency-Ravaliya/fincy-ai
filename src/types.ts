export interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
}