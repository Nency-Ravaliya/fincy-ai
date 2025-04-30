import React, { useState, useEffect, useRef } from 'react';
import { CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    paypal?: any;
  }
}

export function SubscriptionButton() {
  const [messageCount, setMessageCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const paypalScriptLoaded = useRef(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (showModal && !paypalScriptLoaded.current) {
      loadPayPalScript();
    }
  }, [showModal]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('message_count, is_subscribed')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setMessageCount(profile.message_count || 0);
          setIsSubscribed(profile.is_subscribed || false);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayPalScript = () => {
    if (paypalScriptLoaded.current) return;
    
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=AW4hjZ9SPFptqFyxee1G2s3LtLwwYamPi_j0jZ2Un5LdgT_dt1xMl6blOIdax8jJoMZ1pGMDEa9Pq24o&vault=true`;
    script.async = true;
    
    script.onload = () => {
      paypalScriptLoaded.current = true;
      if (window.paypal && paypalContainerRef.current) {
        window.paypal.Buttons({
          createSubscription: async (data: any, actions: any) => {
            return actions.subscription.create({
              'plan_id': 'P-XXXXXXXXXX' // Replace with your PayPal plan ID
            });
          },
          onApprove: async (data: any) => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase
                  .from('profiles')
                  .update({
                    is_subscribed: true,
                    subscription_id: data.subscriptionID,
                    updated_at: new Date().toISOString()
                  })
                  .eq('user_id', user.id);
                
                setIsSubscribed(true);
                setShowModal(false);
                alert('Subscription successful!');
              }
            } catch (error) {
              console.error('Error updating subscription:', error);
              alert('Error processing subscription');
            }
          }
        }).render(paypalContainerRef.current);
      }
    };

    document.body.appendChild(script);
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
        <CreditCard size={20} />
        <span>Premium Member</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-300 px-3 py-2 bg-gray-700 rounded-lg">
        {10 - messageCount} free messages left
      </div>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <CreditCard size={20} />
        <span>Subscribe Now</span>
      </button>

      {/* Subscription Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Upgrade to Premium</h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-gray-300">
                <span>✓</span>
                <span>Unlimited AI chat messages</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span>✓</span>
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span>✓</span>
                <span>Advanced financial insights</span>
              </div>
            </div>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-white">₹10/month</div>
              <div className="text-gray-400">Cancel anytime</div>
            </div>
            <div ref={paypalContainerRef} className="min-h-[150px]"></div>
          </div>
        </div>
      )}
    </div>
  );
}