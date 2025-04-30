import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Lock, DollarSign, Target, PieChart } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Profile({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [accountForm, setAccountForm] = useState({
    email: '',
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [financialForm, setFinancialForm] = useState({
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
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setAccountForm(prev => ({
          ...prev,
          email: user.email || '',
          name: user.user_metadata?.name || '',
        }));

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
          setFinancialForm({
            monthly_income: data.monthly_income || 0,
            income_sources: data.income_sources || [],
            expenses: data.expenses || {},
            savings_goal: data.savings_goal || 0,
            savings_purpose: data.savings_purpose || '',
            has_budget: data.has_budget || false,
            tracks_expenses: data.tracks_expenses || false,
            financial_challenges: data.financial_challenges || '',
            has_loans: data.has_loans || false,
            loan_details: data.loan_details || {},
            advice_frequency: data.advice_frequency || 'weekly',
            advice_preferences: data.advice_preferences || [],
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFinancial = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...financialForm,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;
      setUpdateMessage('Financial profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      setUpdateMessage('Error updating financial profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMessage('');

    if (accountForm.newPassword) {
      if (accountForm.newPassword !== accountForm.confirmPassword) {
        setUpdateMessage('New passwords do not match');
        return;
      }
      if (!accountForm.currentPassword) {
        setUpdateMessage('Current password is required');
        return;
      }
    }

    setSaving(true);
    try {
      if (accountForm.email !== user.email) {
        const { error } = await supabase.auth.updateUser({
          email: accountForm.email,
        });
        if (error) throw error;
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: { name: accountForm.name }
      });
      if (metadataError) throw metadataError;

      if (accountForm.newPassword && accountForm.currentPassword) {
        const { error } = await supabase.auth.updateUser({
          password: accountForm.newPassword
        });
        if (error) throw error;
      }

      setUpdateMessage('Account updated successfully');
      setAccountForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      setUpdateMessage(error.message || 'Error updating account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const incomeSourceOptions = ['Scholarship', 'Part-time job', 'Family support', 'Freelance work'];
  const expenseCategories = ['Rent', 'Food', 'Transportation', 'Entertainment', 'Utilities'];
  const advicePreferenceOptions = [
    'Budgeting tips',
    'Saving strategies',
    'Investment basics',
    'Debt management',
    'Student-specific advice'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        <div className="space-y-8">
          {/* Account Settings */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
            <form onSubmit={handleUpdateAccount} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    className="w-full bg-gray-800/50 text-white rounded-lg p-4 pl-10 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    className="w-full bg-gray-800/50 text-white rounded-lg p-4 pl-10 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                    <div className="relative">
                      <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={accountForm.currentPassword}
                        onChange={(e) => setAccountForm({ ...accountForm, currentPassword: e.target.value })}
                        className="w-full bg-gray-800/50 text-white rounded-lg p-4 pl-10 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                    <div className="relative">
                      <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={accountForm.newPassword}
                        onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                        className="w-full bg-gray-800/50 text-white rounded-lg p-4 pl-10 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={accountForm.confirmPassword}
                        onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                        className="w-full bg-gray-800/50 text-white rounded-lg p-4 pl-10 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Account'}
              </button>
            </form>
          </div>

          {/* Financial Profile */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Financial Profile</h2>
              <button
                onClick={handleSaveFinancial}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="space-y-8">
              {/* Income Section */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="text-green-500" />
                  Income Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Monthly Income
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                      <input
                        type="number"
                        value={financialForm.monthly_income}
                        onChange={(e) => setFinancialForm({
                          ...financialForm,
                          monthly_income: parseInt(e.target.value) || 0
                        })}
                        className="w-full bg-gray-800/50 text-white rounded-lg p-4 pl-8 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Income Sources
                    </label>
                    <div className="space-y-2">
                      {incomeSourceOptions.map((source) => (
                        <label key={source} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={financialForm.income_sources.includes(source)}
                            onChange={(e) => {
                              const newSources = e.target.checked
                                ? [...financialForm.income_sources, source]
                                : financialForm.income_sources.filter(s => s !== source);
                              setFinancialForm({ ...financialForm, income_sources: newSources });
                            }}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-700 bg-gray-800/50"
                          />
                          <span className="text-gray-300">{source}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Expenses Section */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <PieChart className="text-red-500" />
                  Monthly Expenses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expenseCategories.map((category) => (
                    <div key={category}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {category}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                        <input
                          type="number"
                          value={financialForm.expenses[category] || ''}
                          onChange={(e) => setFinancialForm({
                            ...financialForm,
                            expenses: {
                              ...financialForm.expenses,
                              [category]: parseInt(e.target.value) || 0
                            }
                          })}
                          className="w-full bg-gray-800/50 text-white rounded-lg p-4 pl-8 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Savings Section */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="text-purple-500" />
                  Savings Goals
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Monthly Savings Goal
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                      <input
                        type="number"
                        value={financialForm.savings_goal}
                        onChange={(e) => setFinancialForm({
                          ...financialForm,
                          savings_goal: parseInt(e.target.value) || 0
                        })}
                        className="w-full bg-gray-800/50 text-white rounded-lg p-4 pl-8 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Savings Purpose
                    </label>
                    <select
                      value={financialForm.savings_purpose}
                      onChange={(e) => setFinancialForm({
                        ...financialForm,
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
              </section>

              {/* Financial Habits Section */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">Financial Habits</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={financialForm.has_budget}
                      onChange={(e) => setFinancialForm({
                        ...financialForm,
                        has_budget: e.target.checked
                      })}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-700 bg-gray-800/50"
                    />
                    <span className="text-gray-300">I currently follow a budget</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={financialForm.tracks_expenses}
                      onChange={(e) => setFinancialForm({
                        ...financialForm,
                        tracks_expenses: e.target.checked
                      })}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-700 bg-gray-800/50"
                    />
                    <span className="text-gray-300">I track my expenses regularly</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Biggest Financial Challenge
                    </label>
                    <select
                      value={financialForm.financial_challenges}
                      onChange={(e) => setFinancialForm({
                        ...financialForm,
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
              </section>

              {/* Preferences Section */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Financial Advice Frequency
                    </label>
                    <select
                      value={financialForm.advice_frequency}
                      onChange={(e) => setFinancialForm({
                        ...financialForm,
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
                      Types of Financial Advice
                    </label>
                    <div className="space-y-2">
                      {advicePreferenceOptions.map((pref) => (
                        <label key={pref} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={financialForm.advice_preferences.includes(pref)}
                            onChange={(e) => {
                              const newPrefs = e.target.checked
                                ? [...financialForm.advice_preferences, pref]
                                : financialForm.advice_preferences.filter(p => p !== pref);
                              setFinancialForm({
                                ...financialForm,
                                advice_preferences: newPrefs
                              });
                            }}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-700 bg-gray-800/50"
                          />
                          <span className="text-gray-300">{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {updateMessage && (
            <div className={`p-4 rounded-lg ${
              updateMessage.includes('Error') 
                ? 'bg-red-500/10 text-red-500' 
                : 'bg-green-500/10 text-green-500'
            }`}>
              {updateMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}