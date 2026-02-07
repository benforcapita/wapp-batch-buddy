import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface SupabaseMessage {
  id: string;
  created_at: string;
  phone_number: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  status: 'unread' | 'read';
}

export interface ConversationThread {
  phoneNumber: string;
  messages: SupabaseMessage[];
  lastMessageAt: string;
  unreadCount: number;
}

export function useSupabaseMessages() {
  const [messages, setMessages] = useState<SupabaseMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch all messages from Supabase
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setMessages(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(message);
      console.error('Error fetching messages from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    // Initial fetch
    fetchMessages();

    // Subscribe to INSERT events on the messages table
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as SupabaseMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const updated = payload.new as SupabaseMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchMessages]);

  // Group messages into conversation threads by phone number
  const conversations: ConversationThread[] = (() => {
    const grouped: Record<string, SupabaseMessage[]> = {};

    for (const msg of messages) {
      if (!grouped[msg.phone_number]) {
        grouped[msg.phone_number] = [];
      }
      grouped[msg.phone_number].push(msg);
    }

    return Object.entries(grouped)
      .map(([phoneNumber, msgs]) => ({
        phoneNumber,
        messages: msgs.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
        lastMessageAt: msgs.reduce(
          (latest, msg) =>
            new Date(msg.created_at) > new Date(latest) ? msg.created_at : latest,
          msgs[0].created_at
        ),
        unreadCount: msgs.filter((m) => m.status === 'unread' && m.direction === 'incoming').length,
      }))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  })();

  // Mark messages as read for a phone number
  const markAsRead = useCallback(async (phoneNumber: string) => {
    const { error: updateError } = await supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('phone_number', phoneNumber)
      .eq('status', 'unread');

    if (updateError) {
      console.error('Error marking messages as read:', updateError);
    } else {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) =>
          m.phone_number === phoneNumber && m.status === 'unread'
            ? { ...m, status: 'read' as const }
            : m
        )
      );
    }
  }, []);

  return {
    messages,
    conversations,
    isLoading,
    error,
    refetch: fetchMessages,
    markAsRead,
  };
}
