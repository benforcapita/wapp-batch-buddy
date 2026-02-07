import { useState, useEffect, useRef } from 'react';
import { MessageCircle, RefreshCw, ArrowLeft, User, Clock, Check, CheckCheck } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import { useSupabaseMessages, type ConversationThread } from '@/hooks/useSupabaseMessages';

export default function Conversations() {
  const { t } = useLanguage();
  const contacts = useAppStore((state) => state.contacts);
  const { conversations, isLoading, error, refetch, markAsRead } = useSupabaseMessages();
  const [selectedConversation, setSelectedConversation] = useState<ConversationThread | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find contact name by phone number
  const getContactName = (phoneNumber: string): string => {
    const contact = contacts.find(c =>
      c.phone.replace(/[^0-9]/g, '').includes(phoneNumber.replace(/[^0-9]/g, '')) ||
      phoneNumber.replace(/[^0-9]/g, '').includes(c.phone.replace(/[^0-9]/g, ''))
    );
    return contact?.name || phoneNumber;
  };

  // Keep selectedConversation in sync with live data
  useEffect(() => {
    if (selectedConversation) {
      const updated = conversations.find(c => c.phoneNumber === selectedConversation.phoneNumber);
      if (updated) {
        setSelectedConversation(updated);
      }
    }
  }, [conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages.length]);

  // Mark messages as read when a conversation is opened
  const handleSelectConversation = (conv: ConversationThread) => {
    setSelectedConversation(conv);
    if (conv.unreadCount > 0) {
      markAsRead(conv.phoneNumber);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('today') || 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('yesterday') || 'Yesterday';
    }
    return date.toLocaleDateString();
  };

  const getLastMessage = (conversation: ConversationThread): string => {
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    if (!lastMsg) return '';
    return lastMsg.content || '';
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = getContactName(conv.phoneNumber).toLowerCase();
    const phone = conv.phoneNumber.toLowerCase();
    const lastMsg = getLastMessage(conv).toLowerCase();
    return name.includes(query) || phone.includes(query) || lastMsg.includes(query);
  });

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 animate-fade-in">
          <div className="flex items-center gap-3">
            {selectedConversation && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedConversation(null)}
                className="md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {t('conversations') || 'Conversations'}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('conversationsDescription') || 'View incoming message replies'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            {t('refresh') || 'Refresh'}
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex gap-4 min-h-0 animate-slide-up">
          {/* Conversations list */}
          <div className={cn(
            "w-full md:w-80 flex-shrink-0 rounded-xl border border-border bg-card overflow-hidden flex flex-col",
            selectedConversation && "hidden md:flex"
          )}>
            <div className="p-3 border-b border-border">
              <Input
                placeholder={t('searchConversations') || 'Search conversations...'}
                className="h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {error ? (
                <div className="p-4 text-center">
                  <p className="text-destructive text-sm">{error}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Check your Supabase configuration in .env
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={refetch}
                  >
                    Try Again
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="mx-auto h-8 w-8 text-muted-foreground animate-spin" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Loading conversations...
                  </p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {searchQuery
                      ? 'No conversations match your search'
                      : (t('noConversations') || 'No conversations yet')}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {!searchQuery && (t('conversationsWillAppear') || 'Messages will appear here in real-time')}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.phoneNumber}
                    onClick={() => handleSelectConversation(conv)}
                    className={cn(
                      "flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0",
                      selectedConversation?.phoneNumber === conv.phoneNumber && "bg-muted"
                    )}
                  >
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent shrink-0">
                      <User className="h-5 w-5 text-accent-foreground" />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-[10px] font-bold text-white">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          "text-sm truncate",
                          conv.unreadCount > 0 ? "font-bold" : "font-medium"
                        )}>
                          {getContactName(conv.phoneNumber)}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5" dir="ltr">
                        {conv.phoneNumber}
                      </p>
                      <p className={cn(
                        "text-xs truncate mt-1",
                        conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {getLastMessage(conv)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat view */}
          <div className={cn(
            "flex-1 rounded-xl border border-border bg-card overflow-hidden flex flex-col",
            !selectedConversation && "hidden md:flex"
          )}>
            {selectedConversation ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden shrink-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent shrink-0">
                    <User className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {getContactName(selectedConversation.phoneNumber)}
                    </p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {selectedConversation.phoneNumber}
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {selectedConversation.messages.length} messages
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {selectedConversation.messages.map((message, index) => {
                    const prevMessage = selectedConversation.messages[index - 1];
                    const showDate = !prevMessage ||
                      formatDate(message.created_at) !== formatDate(prevMessage.created_at);

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        )}
                        <div
                          className={cn(
                            "flex",
                            message.direction === 'outgoing' ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm",
                              message.direction === 'outgoing'
                                ? "bg-[#25D366] text-white rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <div className={cn(
                              "flex items-center gap-1 mt-1",
                              message.direction === 'outgoing' ? "justify-end" : "justify-start"
                            )}>
                              <Clock className="h-3 w-3 opacity-60" />
                              <span className="text-[10px] opacity-60">
                                {formatTime(message.created_at)}
                              </span>
                              {message.direction === 'outgoing' && (
                                message.status === 'read' ? (
                                  <CheckCheck className="h-3 w-3 opacity-60 text-blue-200" />
                                ) : (
                                  <Check className="h-3 w-3 opacity-60" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Info footer */}
                <div className="p-3 border-t border-border bg-muted/30">
                  <p className="text-xs text-center text-muted-foreground">
                    {t('replyFromMeta') || 'Reply to messages from Meta Business Suite or WhatsApp Business app'}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    {t('selectConversation') || 'Select a conversation to view messages'}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Messages update in real-time via Supabase
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
