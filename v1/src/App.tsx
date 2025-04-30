import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Questions } from './components/Onboarding/Questions';
import { Chat } from './components/Chat';
import { Profile } from './components/Profile';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState<any>(null);
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
        checkOnboardingStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single();

    setOnboardingCompleted(data?.onboarding_completed || false);
  };

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