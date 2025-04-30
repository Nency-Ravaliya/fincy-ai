import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Questions } from './components/Onboarding/Questions';
import { Chat } from './components/Chat';
import { Profile } from './components/Profile';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkOnboardingStatus(session.user.id)
      } else {
        setOnboardingCompleted(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      // First try to get existing profile
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      // If profile exists, use it
      if (profiles && profiles.length > 0) {
        setOnboardingCompleted(profiles[0].onboarding_completed || false);
        return;
      }

      // If no profile exists, create one
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          onboarding_completed: false,
          message_count: 0,
          is_subscribed: false
        });

      if (insertError) {
        throw insertError;
      }

      setOnboardingCompleted(false);
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error);
      setOnboardingCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (!onboardingCompleted) {
    return (
      <Questions
        userId={session.user.id}
        onComplete={() => setOnboardingCompleted(true)}
      />
    );
  }

  if (showProfile) {
    return <Profile onBack={() => setShowProfile(false)} />;
  }

  return <Chat onProfileClick={() => setShowProfile(true)} />;
}

export default App;