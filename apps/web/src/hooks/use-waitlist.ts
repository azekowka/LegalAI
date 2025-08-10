import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useWaitlist() {
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState<number>(0);

  const addToWaitlist = async (email: string) => {
    setIsLoading(true);
    try {
      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', email)
        .single();

      if (existingEmail) {
        toast.error('This email is already on the waitlist');
        return false;
      }

      // Add new email
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email }]);

      if (error) {
        console.error('Error adding to waitlist:', error);
        toast.error('An error occurred while adding to the waitlist');
        return false;
      }

      toast.success('You have been successfully added to the waitlist!');
      await getWaitlistCount(); // Update counter
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while adding to the waitlist');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getWaitlistCount = async () => {
    try {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error getting count:', error);
        return;
      }

      setCount(count || 0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return {
    addToWaitlist,
    getWaitlistCount,
    isLoading,
    count
  };
}