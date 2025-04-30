import React from 'react';
import {
  PieChart,
  Wallet,
  Target,
  Plus,
  Moon,
  Sun,
  MessageSquare,
} from 'lucide-react';

const budgetData = {
  income: 2000,
  expenses: {
    rent: 800,
    groceries: 300,
    entertainment: 200,
    utilities: 150,
  },
  savings: 550,
};

export function Dashboard({ email }: { email: string }) {
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {email}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Budget Summary */}
          <div
            className={`${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } p-6 rounded-xl shadow-sm`}
          >
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="text-blue-500" />
              <h2 className="text-xl font-semibold">Budget Summary</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(budgetData.expenses).map(([category, amount]) => (
                <div
                  key={category}
                  className="flex justify-between items-center"
                >
                  <span className="capitalize">{category}</span>
                  <span className="font-medium">₹{amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className={`${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } p-6 rounded-xl shadow-sm`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="text-green-500" />
              <h2 className="text-xl font-semibold">Quick Actions</h2>
            </div>
            <button className="w-full bg-blue-600 text-white rounded-lg p-3 flex items-center justify-center gap-2 mb-3">
              <Plus size={20} />
              Add Expense
            </button>
            <button className="w-full bg-green-600 text-white rounded-lg p-3 flex items-center justify-center gap-2">
              <MessageSquare size={20} />
              Ask Fincy AI Assistant
            </button>
          </div>

          {/* Savings Goal */}
          <div
            className={`${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } p-6 rounded-xl shadow-sm`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-purple-500" />
              <h2 className="text-xl font-semibold">Savings Goal</h2>
            </div>
            <div className="mb-2">
              <span className="text-sm">Goal: ₹10,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-purple-600 h-2.5 rounded-full"
                style={{ width: '45%' }}
              ></div>
            </div>
            <p className="text-sm mt-2">₹4,500 saved of ₹10,000 goal</p>
          </div>
        </div>
      </main>
    </div>
  );
}
