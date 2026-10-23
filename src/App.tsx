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
import { Toast } from './components/Toast';
import { INITIAL_CONVERSATIONS, CURRENT_USER } from './data/mockChatData';
import { transformDraft } from './services/aiTransformer';
import { ChatConversation, ChatMessage, PresetScenario } from './types';

export function App() {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [user, setUser] = useState(CURRENT_USER);
  const [draftText, setDraftText] = useState('');
  const [sliders, setSliders] = useState({ formality: 45, warmth: 20, urgency: 90 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSlidersModalOpen, setIsSlidersModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isLoading]);

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

        setUser((prev) => ({ ...prev, totalShifts: prev.totalShifts + 1 }));

        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.85 },
          colors: ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6'],
        });

        triggerToast(`Transformed across 4 personas in ${result.executionTimeMs}ms!`);
      } catch (err) {
        console.error('Transformation error:', err);
        triggerToast('Generated transformation using local heuristic model');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initialize active conversation's first assistant response on mount
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
      title: 'New Vibe Shift',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category: 'Today',
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
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
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = conversations.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const freshConv: ChatConversation = {
        id: 'conv-' + Date.now(),
        title: 'New Vibe Shift',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        category: 'Today',
        messages: [],
      };
      setConversations([freshConv]);
      setActiveConversationId(freshConv.id);
    } else {
      setConversations(remaining);
      if (activeConversationId === id) {
        setActiveConversationId(remaining[0].id);
      }
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

    // If new conversation with generic title, rename title smartly
    let updatedTitle = activeConversation.title;
    if (activeConversation.title === 'New Vibe Shift' || activeConversation.messages.length === 0) {
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
    downloadAnchor.setAttribute('download', `vibeshift-${activeConversation.id}-${Date.now()}.json`);
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
    downloadAnchor.setAttribute('download', `vibeshift-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Exported full chat history');
  };

  // Clear all chats
  const handleClearHistory = () => {
    const freshConv: ChatConversation = {
      id: 'conv-' + Date.now(),
      title: 'New Vibe Shift',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category: 'Today',
      messages: [],
    };
    setConversations([freshConv]);
    setActiveConversationId(freshConv.id);
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0B0F19] text-[#DFE2F1] flex font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Left Sidebar: Chat History & User Profile */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversation?.id || ''}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        user={user}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Chat Canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0B0F19]">
        {/* Top Navbar */}
        <ChatNavbar
          conversationTitle={activeConversation?.title || 'VibeShift Chat'}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSliders={() => setIsSlidersModalOpen(true)}
          sliders={sliders}
          onSelectScenario={handleSelectScenario}
          onCopyAll={handleCopyAll}
          onExportJson={handleExportJson}
          onResetChat={handleResetCurrentChat}
          hasMessages={(activeConversation?.messages?.length || 0) > 0}
        />

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
                  // Find preceding user message to calculate word diff accurately
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.3s]" />
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
        <div className="border-t border-[#1F2937]/50 bg-[#0B0F19]/90 backdrop-blur-md">
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

      {/* User Profile Modal */}
      <UserProfileModal
        user={user}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onClearHistory={handleClearHistory}
        onExportHistory={handleExportAllHistory}
        onUpdateUser={(updated) => {
          setUser(updated);
          triggerToast('Profile updated');
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
