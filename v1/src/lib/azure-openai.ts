import { type ChatMessage } from '../types';
import { supabase } from './supabase';

const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT;
const AZURE_MODEL = import.meta.env.VITE_AZURE_MODEL;
const API_VERSION = import.meta.env.VITE_AZURE_API_VERSION;
const API_KEY = import.meta.env.VITE_AZURE_API_KEY;

if (!AZURE_ENDPOINT || !AZURE_MODEL || !API_VERSION || !API_KEY) {
  throw new Error('Missing Azure OpenAI environment variables');
}

async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return profile;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

export async function getAIResponse(messages: ChatMessage[]) {
  try {
    const profile = await getUserProfile();
    
    // Reduced system prompt length to minimize token usage
    let systemPrompt = "You are Fincy, a financial AI assistant. Give brief, focused advice. ";
    
    if (profile) {
      const monthlyIncome = formatCurrency(profile.monthly_income);
      const savingsGoal = formatCurrency(profile.savings_goal);
      
      systemPrompt += `Income: ${monthlyIncome}, Goal: ${savingsGoal}, Challenge: ${profile.financial_challenges}. Use ₹ for amounts.`;
    }

    const response = await fetch(
      `${AZURE_ENDPOINT}/openai/deployments/${AZURE_MODEL}/chat/completions?api-version=${API_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            // Only send the last 4 messages to reduce context size
            ...messages.slice(-4).map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content,
            })),
          ],
          temperature: 0.7,
          max_tokens: 300, // Reduced max tokens to limit response length
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}