import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sidebar } from './components/Sidebar';
import { ChatNavbar } from './components/ChatNavbar';
import { ChatUserMessage } from './components/ChatUserMessage';
import { ChatAssistantMessage } from './components/ChatAssistantMessage';
import { ChatEmptyState } from './components/ChatEmptyState';
import { ChatInput } from './components/ChatInput';
import { UserProfileModal } from './components/UserProfileModal';
import { ToneSlidersModal } from './components/ToneSlidersModal';
import { LoginModal } from './components/LoginModal';
import { PersonasView } from './components/PersonasView';
import { HistoryView } from './components/HistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { Toast } from './components/Toast';
import { INITIAL_CONVERSATIONS } from './data/mockChatData';
import { transformDraft } from './services/aiTransformer';
import { 
  getActiveUser, 
  loadUserConversations, 
  saveUserConversations, 
  deleteUserConversation,
  updateUserProfile
} from './services/databaseService';
import { loadPersonas } from './services/personaStorage';
import { loadHistory, addHistoryRecord } from './services/historyStorage';
import { 
  ChatConversation, 
  ChatMessage, 
  PresetScenario, 
  ActiveNavTab, 
  TransformationRecord, 
  PersonaDefinition, 
  UserProfile 
} from './types';
import { Bot } from 'lucide-react';

export function App() {
  // Guaranteed active user profile (defaults to Gaurav Joshi, persistent in database)
  const [user, setUser] = useState<UserProfile>(() => getActiveUser());
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [activeNavTab, setActiveNavTab] = useState<ActiveNavTab>('chat');

  // Input & Tone Slider State
  const [draftText, setDraftText] = useState('');
  const [sliders, setSliders] = useState({ formality: 45, warmth: 20, urgency: 90 });
  const [isLoading, setIsLoading] = useState(false);

  // App UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSlidersModalOpen, setIsSlidersModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Personas and History data
  const [personas, setPersonas] = useState<PersonaDefinition[]>(() => loadPersonas());
  const [historyRecords, setHistoryRecords] = useState<TransformationRecord[]>(() => loadHistory());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef(false);

  const refreshPersonas = () => setPersonas(loadPersonas());
  const refreshHistory = () => setHistoryRecords(loadHistory());

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  // Load conversations from database when user profile changes
  useEffect(() => {
    let isCancelled = false;
    loadUserConversations(user.email).then((loaded) => {
      if (!isCancelled && loaded && loaded.length > 0) {
        setConversations(loaded);
        setActiveConversationId(loaded[0].id);
        isLoadedRef.current = true;
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [user.email]);

  // Persist conversations to database on updates
  useEffect(() => {
    if (isLoadedRef.current && conversations.length > 0) {
      saveUserConversations(user.email, conversations);
    }
  }, [conversations, user.email]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (activeNavTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages, isLoading, activeNavTab]);

  // Transform a message for a conversation
  const executeTransformation = useCallback(
    async (convId: string, text: string, sliderSettings: typeof sliders) => {
      setIsLoading(true);
      try {
        const result = await transformDraft(text, sliderSettings);

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== convId) return conv;

            const assistantMsg: ChatMessage = {
              id: 'assistant-' + Date.now(),
              role: 'assistant',
              timestamp: Date.now(),
              content: '',
              transformationResult: result,
            };

            return {
              ...conv,
              updatedAt: Date.now(),
              messages: [...conv.messages, assistantMsg],
            };
          })
        );

        // Record transformation into audit history
        addHistoryRecord({
          requestTimestamp: new Date(Date.now() - result.executionTimeMs).toISOString(),
          completionTimestamp: new Date().toISOString(),
          durationMs: result.executionTimeMs,
          originalDraft: text,
          detectedVibe: result.detectedVibe,
          sliderWeights: { ...sliderSettings },
          selectedPersonaIds: Object.keys(result.personas),
          outputs: result.personas,
          status: 'completed',
        });
        refreshHistory();

        // Increment user's total shifts
        const updatedUser: UserProfile = { ...user, totalShifts: (user.totalShifts || 0) + 1 };
        setUser(updatedUser);
        updateUserProfile(updatedUser);

        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.85 },
          colors: ['#2563EB', '#1D4ED8', '#60A5FA', '#10B981'],
        });

        triggerToast(`Transformed across 4 personas in ${result.executionTimeMs}ms!`);
      } catch (err) {
        console.error('Transformation error:', err);
        triggerToast('Generated transformation using local heuristic model');
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Initialize active conversation's first assistant response on mount if needed
  useEffect(() => {
    if (activeConversation && activeConversation.messages.length === 1) {
      const userMsg = activeConversation.messages[0];
      if (userMsg && !activeConversation.messages.some((m) => m.role === 'assistant')) {
        executeTransformation(activeConversation.id, userMsg.content, sliders);
      }
    }
  }, []);

  // Handle switching conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setActiveNavTab('chat');
    const target = conversations.find((c) => c.id === id);
    if (target && target.messages.length === 1 && !target.messages.some((m) => m.role === 'assistant')) {
      const userMsg = target.messages[0];
      executeTransformation(target.id, userMsg.content, userMsg.sliders || sliders);
    }
  };

  // Handle New Chat
  const handleNewChat = () => {
    const newId = 'conv-' + Date.now();
    const newConv: ChatConversation = {
      id: newId,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category: 'Today',
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setActiveNavTab('chat');
    setDraftText('');
  };

  // Global keyboard shortcuts (Cmd/Ctrl + N or K for new chat)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'n' || e.key === 'k')) {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Delete Conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = conversations.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const freshConv: ChatConversation = {
        id: 'conv-' + Date.now(),
        title: 'New Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        category: 'Today',
        messages: [],
      };
      setConversations([freshConv]);
      setActiveConversationId(freshConv.id);
      await deleteUserConversation(user.email, id, [freshConv]);
    } else {
      setConversations(remaining);
      if (activeConversationId === id) {
        setActiveConversationId(remaining[0].id);
      }
      await deleteUserConversation(user.email, id, remaining);
    }
    triggerToast('Chat removed from history');
  };

  // Send message
  const handleSend = () => {
    if (!draftText.trim() || isLoading) return;

    const text = draftText.trim();
    setDraftText('');

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      timestamp: Date.now(),
      content: text,
      sliders: { ...sliders },
    };

    let updatedTitle = activeConversation.title;
    if (activeConversation.title === 'New Chat' || activeConversation.messages.length === 0) {
      updatedTitle = text.slice(0, 32).trim() + (text.length > 32 ? '...' : '');
    }

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== activeConversation.id) return conv;
        return {
          ...conv,
          title: updatedTitle,
          updatedAt: Date.now(),
          messages: [...conv.messages, userMsg],
        };
      })
    );

    executeTransformation(activeConversation.id, text, sliders);
  };

  // Load a sample scenario
  const handleSelectScenario = (scenario: PresetScenario) => {
    setSliders(scenario.defaultSliders);
    setDraftText(scenario.draftText);
    setActiveNavTab('chat');
    triggerToast(`Loaded scenario: "${scenario.label}"`);
  };

  // Copy single persona rewrite
  const handleCopySingle = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${title} to clipboard!`);
  };

  // Copy all personas from the latest assistant response
  const handleCopyAll = () => {
    const lastAssistantMsg = [...(activeConversation?.messages || [])]
      .reverse()
      .find((m) => m.role === 'assistant' && m.transformationResult);

    if (!lastAssistantMsg || !lastAssistantMsg.transformationResult) {
      triggerToast('No transformation results available to copy');
      return;
    }

    const res = lastAssistantMsg.transformationResult;
    const allFormatted = Object.values(res.personas)
      .map((p) => `--- [${p.title.toUpperCase()}] ---\n${p.rewrittenText}\n`)
      .join('\n');

    navigator.clipboard.writeText(allFormatted);
    triggerToast('Copied all 4 persona rewrites to clipboard!');
  };

  // Export JSON
  const handleExportJson = () => {
    const lastAssistantMsg = [...(activeConversation?.messages || [])]
      .reverse()
      .find((m) => m.role === 'assistant' && m.transformationResult);

    if (!lastAssistantMsg || !lastAssistantMsg.transformationResult) {
      triggerToast('No transformation results to export');
      return;
    }

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(lastAssistantMsg.transformationResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tone-studio-${activeConversation.id}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Exported transformation JSON');
  };

  // Export all chat history JSON
  const handleExportAllHistory = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tone-studio-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Exported full chat history');
  };

  // Clear all chats
  const handleClearHistory = () => {
    const freshConv: ChatConversation = {
      id: 'conv-' + Date.now(),
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category: 'Today',
      messages: [],
    };
    setConversations([freshConv]);
    setActiveConversationId(freshConv.id);
    saveUserConversations(user.email, [freshConv]);
    triggerToast('Chat history cleared');
  };

  // Reset current active conversation
  const handleResetCurrentChat = () => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversation.id) return c;
        return {
          ...c,
          messages: [],
        };
      })
    );
    setDraftText('');
    triggerToast('Current chat cleared');
  };

  // Restore record from HistoryView into Studio
  const handleRestoreToStudio = (record: TransformationRecord) => {
    setDraftText(record.originalDraft);
    setSliders(record.sliderWeights);
    setActiveNavTab('chat');
    triggerToast('Restored draft from history to Studio!');
  };

  // User Profile switch handler
  const handleUserChange = async (newUser: UserProfile) => {
    setUser(newUser);
    const loaded = await loadUserConversations(newUser.email);
    setConversations(loaded);
    if (loaded.length > 0) {
      setActiveConversationId(loaded[0].id);
    }
    triggerToast(`Active account: ${newUser.name}`);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] flex font-sans selection:bg-blue-500/20 selection:text-blue-900">
      {/* Left Sidebar: Chat History & User Profile */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversation?.id || ''}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        user={user}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#F8FAFC]">
        {/* Top Navbar */}
        <ChatNavbar
          conversationTitle={activeConversation?.title || 'Tone Studio Chat'}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSliders={() => setIsSlidersModalOpen(true)}
          sliders={sliders}
          onSelectScenario={handleSelectScenario}
          onCopyAll={handleCopyAll}
          onExportJson={handleExportJson}
          onResetChat={handleResetCurrentChat}
          hasMessages={(activeConversation?.messages?.length || 0) > 0}
          activeTab={activeNavTab}
          onTabChange={setActiveNavTab}
          user={user}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        {/* Tab 1: Studio Chat View */}
        {activeNavTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
            {/* Scrollable Message Feed */}
            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
              {(!activeConversation || activeConversation.messages.length === 0) ? (
                <ChatEmptyState onSelectScenario={handleSelectScenario} />
              ) : (
                <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col gap-8 pb-4">
                  {activeConversation.messages.map((message) => {
                    if (message.role === 'user') {
                      return (
                        <ChatUserMessage key={message.id} message={message} user={user} />
                      );
                    }

                    if (message.role === 'assistant' && message.transformationResult) {
                      const msgIndex = activeConversation.messages.findIndex((m) => m.id === message.id);
                      const precedingUserMsg = activeConversation.messages
                        .slice(0, msgIndex)
                        .reverse()
                        .find((m) => m.role === 'user');

                      const sourceDraft =
                        precedingUserMsg?.content || message.transformationResult.sourceDraft;

                      return (
                        <ChatAssistantMessage
                          key={message.id}
                          result={message.transformationResult}
                          originalDraft={sourceDraft}
                          onCopySingle={handleCopySingle}
                        />
                      );
                    }

                    return null;
                  })}

                  {/* Generating Pulse Indicator */}
                  {isLoading && (
                    <div className="flex gap-4 max-w-4xl w-full animate-fade-in">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs flex-shrink-0 animate-pulse">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3 text-xs text-slate-600">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.15s]" />
                          <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.3s]" />
                        </div>
                        <span>Modulating linguistic tones & preserving 100% facts across 4 personas...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Bottom Prompter Dock */}
            <div className="border-t border-slate-200 bg-[#F8FAFC]/95 backdrop-blur-md">
              <ChatInput
                draftText={draftText}
                setDraftText={setDraftText}
                onSend={handleSend}
                isLoading={isLoading}
                onOpenSliders={() => setIsSlidersModalOpen(true)}
                sliders={sliders}
                onSelectScenario={handleSelectScenario}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Personas View */}
        {activeNavTab === 'personas' && (
          <div className="flex-1 overflow-y-auto bg-[#0B0F19] text-white">
            <PersonasView
              personas={personas}
              onPersonasChange={refreshPersonas}
              onNavigateToStudio={() => setActiveNavTab('chat')}
              triggerToast={triggerToast}
            />
          </div>
        )}

        {/* Tab 3: History View */}
        {activeNavTab === 'history' && (
          <div className="flex-1 overflow-y-auto bg-[#0B0F19] text-white">
            <HistoryView
              historyRecords={historyRecords}
              onHistoryChange={refreshHistory}
              onRestoreToStudio={handleRestoreToStudio}
              triggerToast={triggerToast}
            />
          </div>
        )}

        {/* Tab 4: Analytics View */}
        {activeNavTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto bg-[#0B0F19] text-white">
            <AnalyticsView
              historyRecords={historyRecords}
              onNavigateToStudio={() => setActiveNavTab('chat')}
            />
          </div>
        )}
      </div>

      {/* Account Login / User Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={user}
        onUserChange={handleUserChange}
        triggerToast={triggerToast}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        user={user}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onClearHistory={handleClearHistory}
        onExportHistory={handleExportAllHistory}
        onUpdateUser={async (updated) => {
          const res = await updateUserProfile(updated);
          setUser(res);
          triggerToast('Profile updated & saved to database');
        }}
      />

      {/* Tone Sliders Modal */}
      <ToneSlidersModal
        isOpen={isSlidersModalOpen}
        onClose={() => setIsSlidersModalOpen(false)}
        sliders={sliders}
        setSliders={setSliders}
        onApply={() => triggerToast('Tone weights updated')}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} isVisible={showToast} />
    </div>
  );
}

export default App;
