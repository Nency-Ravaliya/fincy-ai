import { type ChatMessage } from '../types';
import html2pdf from 'html2pdf.js';

export function exportToMarkdown(messages: ChatMessage[]): void {
  const markdown = messages.map(msg => {
    const role = msg.type === 'user' ? '**You**' : '**Assistant**';
    return `${role}:\n${msg.content}\n`;
  }).join('\n');

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-export-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(messages: ChatMessage[]): void {
  const text = messages.map(msg => {
    const role = msg.type === 'user' ? 'You' : 'Assistant';
    return `${role}: ${msg.content}`;
  }).join('\n\n');

  navigator.clipboard.writeText(text).then(() => {
    // You could add a toast notification here
    console.log('Text copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy text:', err);
  });
}

export function exportToPDF(element: HTMLElement | null): void {
  if (!element) return;

  const opt = {
    margin: 1,
    filename: `chat-export-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}