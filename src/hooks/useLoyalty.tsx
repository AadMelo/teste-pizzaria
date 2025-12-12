import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface LoyaltyTransaction {
  id: string;
  points: number;
  type: string;
  description: string;
  created_at: string;
}

export function useLoyalty() {
  const { user, profile, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const addPoints = async (points: number, description: string, orderId?: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    // Use atomic database function to prevent race conditions
    const { error } = await supabase.rpc('add_loyalty_points', {
      p_user_id: user.id,
      p_points: points,
      p_description: description,
      p_order_id: orderId || null,
    });

    if (error) return { error };

    await refreshProfile();
    await fetchTransactions();
    return { error: null };
  };

  const redeemPoints = async (points: number, description: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    // Use atomic database function to prevent race conditions
    // The function handles insufficient points check atomically
    const { error } = await supabase.rpc('redeem_loyalty_points', {
      p_user_id: user.id,
      p_points: points,
      p_description: description,
    });

    if (error) {
      // Check if it's an insufficient points error
      if (error.message?.includes('Insufficient points')) {
        return { error: new Error('Insufficient points') };
      }
      return { error };
    }

    await refreshProfile();
    await fetchTransactions();
    return { error: null };
  };

  return {
    points: profile?.loyalty_points || 0,
    transactions,
    loading,
    addPoints,
    redeemPoints,
    refresh: fetchTransactions,
  };
}
