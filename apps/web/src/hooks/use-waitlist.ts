import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useWaitlist() {
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState<number>(0);

  const addToWaitlist = async (email: string) => {
    setIsLoading(true);
    try {
      // Проверяем, есть ли уже такой email
      const { data: existingEmail } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', email)
        .single();

      if (existingEmail) {
        toast.error('Этот email уже добавлен в список ожидания');
        return false;
      }

      // Добавляем новый email
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email }]);

      if (error) {
        console.error('Ошибка при добавлении в waitlist:', error);
        toast.error('Произошла ошибка при добавлении в список ожидания');
        return false;
      }

      toast.success('Вы успешно добавлены в список ожидания!');
      await getWaitlistCount(); // Обновляем счетчик
      return true;
    } catch (error) {
      console.error('Ошибка:', error);
      toast.error('Произошла ошибка при добавлении в список ожидания');
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
        console.error('Ошибка при получении количества:', error);
        return;
      }

      setCount(count || 0);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return {
    addToWaitlist,
    getWaitlistCount,
    isLoading,
    count
  };
}