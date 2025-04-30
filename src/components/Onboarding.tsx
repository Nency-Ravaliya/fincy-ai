import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export function Onboarding({ onComplete }: { onComplete: (email: string) => void }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onComplete(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          What is your email address?
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full bg-gray-800/50 text-white rounded-lg p-4 mb-4 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 flex items-center justify-center gap-2 transition-colors"
          >
            Continue
            <ArrowRight size={20} />
          </button>
          <p className="text-gray-400 text-center mt-4 text-sm">
            Press Enter ⏎ to continue
          </p>
        </form>
      </div>
    </div>
  );
}