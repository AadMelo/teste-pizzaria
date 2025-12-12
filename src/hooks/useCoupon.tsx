import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface CouponResult {
  valid: boolean;
  message: string;
  discount_amount: number;
  coupon_id: string | null;
}

interface AppliedCoupon {
  code: string;
  couponId: string;
  discountAmount: number;
  description: string;
}

export function useCoupon() {
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const { user } = useAuth();

  const validateCoupon = useCallback(async (code: string, orderTotal: number): Promise<CouponResult | null> => {
    if (!code.trim()) {
      toast.error('Digite um código de cupom');
      return null;
    }

    setIsValidating(true);

    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        p_code: code.trim().toUpperCase(),
        p_user_id: user?.id || null,
        p_order_total: orderTotal
      });

      if (error) {
        console.error('Error validating coupon:', error);
        toast.error('Erro ao validar cupom');
        return null;
      }

      const result = data?.[0] as CouponResult | undefined;

      if (!result) {
        toast.error('Erro ao validar cupom');
        return null;
      }

      if (result.valid) {
        const applied: AppliedCoupon = {
          code: code.trim().toUpperCase(),
          couponId: result.coupon_id!,
          discountAmount: result.discount_amount,
          description: result.message
        };
        setAppliedCoupon(applied);
        toast.success(`Cupom aplicado! ${result.message}`);
      } else {
        toast.error(result.message);
      }

      return result;
    } catch (err) {
      console.error('Error validating coupon:', err);
      toast.error('Erro ao validar cupom');
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [user?.id]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    toast.info('Cupom removido');
  }, []);

  const recordCouponUsage = useCallback(async (orderId: string) => {
    if (!appliedCoupon || !user?.id) return;

    try {
      // Use the secure function to record coupon usage and increment count
      const { error } = await supabase.rpc('use_coupon', {
        p_coupon_id: appliedCoupon.couponId,
        p_user_id: user.id,
        p_order_id: orderId
      });

      if (error) {
        console.error('Error recording coupon usage:', error);
      }
    } catch (err) {
      console.error('Error recording coupon usage:', err);
    }
  }, [appliedCoupon, user?.id]);

  return {
    isValidating,
    appliedCoupon,
    validateCoupon,
    removeCoupon,
    recordCouponUsage
  };
}
