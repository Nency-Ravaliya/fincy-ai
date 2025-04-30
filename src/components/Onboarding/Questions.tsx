import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Question {
  id: number;
  title: string;
  component: React.ReactNode;
}

export function Questions({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState({
    monthly_income: 0,
    income_sources: [] as string[],
    expenses: {} as Record<string, number>,
    savings_goal: 0,
    savings_purpose: '',
    has_budget: false,
    tracks_expenses: false,
    financial_challenges: '',
    has_loans: false,
    loan_details: {},
    advice_frequency: 'weekly',
    advice_preferences: [] as string[],
  });

  const questions: Question[] = [
    {
      id: 1,
      title: "Let's start with your income",
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What is your total monthly income?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input
                type="number"
                value={formData.monthly_income || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  monthly_income: parseInt(e.target.value) || 0
                })}
                className="w-full bg-gray-800/50 text-white rounded-lg p-4 pl-8 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select your income sources
            </label>
            {['Scholarship', 'Part-time job', 'Family support', 'Freelance work'].map((source) => (
              <label key={source} className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  checked={formData.income_sources.includes(source)}
                  onChange={(e) => {
                    const newSources = e.target.checked
                      ? [...formData.income_sources, source]
                      : formData.income_sources.filter(s => s !== source);
                    setFormData({ ...formData, income_sources: newSources });
                  }}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-700 bg-gray-800/50"
                />
                <span className="text-gray-300">{source}</span>
              </label>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Now, let's look at your expenses",
      component: (
        <div className="space-y-6">
          {['Rent', 'Food', 'Transportation', 'Entertainment', 'Utilities'].map((category) => (
            <div key={category}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Monthly {category} expenses
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input
                  type="number"
                  value={formData.expenses[category] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    expenses: {
                      ...formData.expenses,
                      [category]: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full bg-gray-800/50 text-white rounded-lg p-4 pl-8 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 3,
      title: "Let's set your savings goals",
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              How much would you like to save monthly?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input
                type="number"
                value={formData.savings_goal || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  savings_goal: parseInt(e.target.value) || 0
                })}
                className="w-full bg-gray-800/50 text-white rounded-lg p-4 pl-8 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What are you saving for?
            </label>
            <select
              value={formData.savings_purpose}
              onChange={(e) => setFormData({
                ...formData,
                savings_purpose: e.target.value
              })}
              className="w-full bg-gray-800/50 text-white rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select a purpose</option>
              <option value="emergency">Emergency Fund</option>
              <option value="education">Education</option>
              <option value="gadgets">Gadgets</option>
              <option value="travel">Travel</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Let's understand your financial habits",
      component: (
        <div className="space-y-6">
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.has_budget}
                onChange={(e) => setFormData({
                  ...formData,
                  has_budget: e.target.checked
                })}
                className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-700 bg-gray-800/50"
              />
              <span className="text-gray-300">I currently follow a budget</span>
            </label>
          </div>
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.tracks_expenses}
                onChange={(e) => setFormData({
                  ...formData,
                  tracks_expenses: e.target.checked
                })}
                className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-700 bg-gray-800/50"
              />
              <span className="text-gray-300">I track my expenses regularly</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What's your biggest financial challenge?
            </label>
            <select
              value={formData.financial_challenges}
              onChange={(e) => setFormData({
                ...formData,
                financial_challenges: e.target.value
              })}
              className="w-full bg-gray-800/50 text-white rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select a challenge</option>
              <option value="budgeting">Sticking to a budget</option>
              <option value="saving">Saving money</option>
              <option value="unexpected">Managing unexpected expenses</option>
              <option value="debt">Avoiding debt</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Finally, let's personalize your experience",
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              How often would you like financial tips?
            </label>
            <select
              value={formData.advice_frequency}
              onChange={(e) => setFormData({
                ...formData,
                advice_frequency: e.target.value
              })}
              className="w-full bg-gray-800/50 text-white rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What kind of financial advice interests you?
            </label>
            {[
              'Budgeting tips',
              'Saving strategies',
              'Investment basics',
              'Debt management',
              'Student-specific advice'
            ].map((pref) => (
              <label key={pref} className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  checked={formData.advice_preferences.includes(pref)}
                  onChange={(e) => {
                    const newPrefs = e.target.checked
                      ? [...formData.advice_preferences, pref]
                      : formData.advice_preferences.filter(p => p !== pref);
                    setFormData({ ...formData, advice_preferences: newPrefs });
                  }}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-700 bg-gray-800/50"
                />
                <span className="text-gray-300">{pref}</span>
              </label>
            ))}
          </div>
        </div>
      ),
    }
  ];

  const handleNext = async () => {
    if (currentQuestion === questions.length - 1) {
      try {
        // First check if a profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        const profileData = {
          user_id: userId,
          ...formData,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        };

        let error;
        
        if (existingProfile) {
          // Update existing profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('user_id', userId);
          error = updateError;
        } else {
          // Insert new profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData);
          error = insertError;
        }

        if (error) {
          console.error('Error saving profile:', error);
          return;
        }

        onComplete();
      } catch (error) {
        console.error('Error in handleNext:', error);
      }
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-gray-700"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                {questions[currentQuestion].title}
              </h2>
              <span className="text-gray-400">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>

            {questions[currentQuestion].component}

            <div className="flex justify-between mt-8">
              {currentQuestion > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 transition-colors"
              >
                {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}