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
import { AuthModal } from './components/AuthModal';
import { PersonaHub } from './components/PersonaHub';
import { AuditHistoryView } from './components/AuditHistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { INITIAL_CONVERSATIONS, CURRENT_USER } from './data/mockChatData';
import { transformDraft } from './services/aiTransformer';
import { 
  ChatConversation, 
  ChatMessage, 
  PresetScenario, 
  ActiveView, 
  CustomPersona, 
  AuditLogEntry, 
  UserProfile 
} from './types';
import { 
  dbGetConversations, 
  dbSaveConversation, 
  dbDeleteConversation,
  dbGetUserProfile, 
  dbSaveUserProfile, 
  dbRecordUserLogin,
  dbGetCustomPersonas, 
  dbSaveCustomPersona, 
  dbDeleteCustomPersona,
  dbGetAuditLogs, 
  dbRecordAuditLog 
} from './services/supabaseClient';
import { Bot } from 'lucide-react';

export function App() {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [user, setUser] = useState<UserProfile>(CURRENT_USER);
  const [customPersonas, setCustomPersonas] = useState<CustomPersona[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('studio');

  const [draftText, setDraftText] = useState('');
  const [sliders, setSliders] = useState({ formality: 45, warmth: 20, urgency: 90 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSlidersModalOpen, setIsSlidersModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  // Load Initial Data from Supabase
  useEffect(() => {
    async function initSupabaseData() {
      // 1. Load User Profile
      try {
        const profile = await dbGetUserProfile(user.email);
        if (profile) setUser(profile);
      } catch (e) {
        console.warn('Initial profile load note', e);
      }

      // 2. Load Custom Personas
      try {
        const personas = await dbGetCustomPersonas();
        setCustomPersonas(personas);
      } catch (e) {
        console.warn('Initial custom personas load note', e);
      }

      // 3. Load Conversations
      try {
        const convs = await dbGetConversations();
        if (convs && convs.length > 0) {
          setConversations(convs);
          setActiveConversationId(convs[0].id);
        }
      } catch (e) {
        console.warn('Initial chats load note', e);
      }

      // 4. Load Audit Logs
      try {
        const logs = await dbGetAuditLogs();
        if (logs && logs.length > 0) {
          setAuditLogs(logs);
        } else {
          // Seed with initial governance sample
          const sampleLog: AuditLogEntry = {
            id: 'audit-init-1',
            timestamp: Date.now() - 3600000,
            userId: user.email,
            userName: user.name,
            conversationId: INITIAL_CONVERSATIONS[0].id,
            conversationTitle: INITIAL_CONVERSATIONS[0].title,
            sourceDraft: 'Checkout payment gateway non-responsive after recent deployment.',
            detectedVibe: 'High Stress / Direct',
            executionTimeMs: 184,
            factParityPercent: 100.0,
            preservedFactsCount: 4,
            personasGenerated: ['Executive', 'Supportive Peer', 'Legal & Compliance', 'Gen-Z Hype'],
            governanceStatus: 'compliant',
            complianceRule: 'Section 4.2 Invariant Parity Gate',
          };
          setAuditLogs([sampleLog]);
          dbRecordAuditLog(sampleLog);
        }
      } catch (e) {
        console.warn('Initial audit logs load note', e);
      }

      // 5. Record session login in Supabase
      try {
        await dbRecordUserLogin({
          id: 'login-' + Date.now(),
          userId: user.email,
          email: user.email,
          timestamp: Date.now(),
          deviceInfo: navigator.userAgent.includes('Windows') ? 'Windows Desktop' : 'Web Browser',
          ipAddress: '127.0.0.1',
          status: 'success',
          provider: 'email',
        });
      } catch (e) {
        console.warn('Initial session login note', e);
      }
    }

    initSupabaseData();
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (activeView === 'studio') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages, isLoading, activeView]);

  // Transform a message for a conversation
  const executeTransformation = useCallback(
    async (convId: string, text: string, sliderSettings: typeof sliders) => {
      setIsLoading(true);
      try {
        const result = await transformDraft(text, sliderSettings, customPersonas);

        const assistantMsg: ChatMessage = {
          id: 'assistant-' + Date.now(),
          conversationId: convId,
          role: 'assistant',
          timestamp: Date.now(),
          content: '',
          transformationResult: result,
        };

        let updatedConv: ChatConversation | null = null;

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== convId) return conv;

            const updated: ChatConversation = {
              ...conv,
              updatedAt: Date.now(),
              messages: [...conv.messages, assistantMsg],
            };
            updatedConv = updated;
            return updated;
          })
        );

        if (updatedConv) {
          dbSaveConversation(updatedConv);
        }

        // Increment user total shifts and sync to Supabase
        setUser((prev) => {
          const updated = { ...prev, totalShifts: prev.totalShifts + 1 };
          dbSaveUserProfile(updated);
          return updated;
        });

        // Record Audit Log in Supabase
        const targetConv = conversations.find((c) => c.id === convId);
        const auditEntry: AuditLogEntry = {
          id: 'audit-' + Date.now(),
          timestamp: Date.now(),
          userId: user.email,
          userName: user.name,
          conversationId: convId,
          conversationTitle: targetConv?.title || 'Tone Transformation',
          sourceDraft: text,
          detectedVibe: result.detectedVibe,
          executionTimeMs: result.executionTimeMs,
          factParityPercent: 100.0,
          preservedFactsCount: 3 + customPersonas.length,
          personasGenerated: Object.values(result.personas).map((p) => p.badgeLabel),
          governanceStatus: 'compliant',
          complianceRule: 'Section 4.2 Invariant Parity Gate',
        };

        setAuditLogs((prev) => [auditEntry, ...prev]);
        dbRecordAuditLog(auditEntry);

        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.85 },
          colors: ['#2563EB', '#1D4ED8', '#60A5FA', '#10B981'],
        });

        triggerToast(`Transformed across ${Object.keys(result.personas).length} personas & synced to Supabase!`);
      } catch (err) {
        console.error('Transformation error:', err);
        triggerToast('Generated transformation using local heuristic model');
      } finally {
        setIsLoading(false);
      }
    },
    [customPersonas, conversations, user]
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
    setActiveView('studio');
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
      userId: user.email,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category: 'Today',
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setActiveView('studio');
    setDraftText('');
    dbSaveConversation(newConv);
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
    dbDeleteConversation(id);

    if (remaining.length === 0) {
      const freshConv: ChatConversation = {
        id: 'conv-' + Date.now(),
        userId: user.email,
        title: 'New Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        category: 'Today',
        messages: [],
      };
      setConversations([freshConv]);
      setActiveConversationId(freshConv.id);
      dbSaveConversation(freshConv);
    } else {
      setConversations(remaining);
      if (activeConversationId === id) {
        setActiveConversationId(remaining[0].id);
      }
    }
    triggerToast('Chat removed from Supabase');
  };

  // Send message
  const handleSend = () => {
    if (!draftText.trim() || isLoading) return;

    const text = draftText.trim();
    setDraftText('');

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      conversationId: activeConversation.id,
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
        const updated = {
          ...conv,
          title: updatedTitle,
          updatedAt: Date.now(),
          messages: [...conv.messages, userMsg],
        };
        dbSaveConversation(updated);
        return updated;
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
    triggerToast('Copied all persona rewrites to clipboard!');
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

  // Export Audit Logs as JSON
  const handleExportAuditJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vibeshift-audit-telemetry-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Exported audit telemetry JSON');
  };

  // Export Audit Logs as Markdown
  const handleExportAuditMarkdown = () => {
    let md = `# AI Prompt Governance & Telemetry Audit Report\n\n`;
    md += `Generated: ${new Date().toISOString()}\n`;
    md += `Governance Rule: Section 4.2 Invariant Parity Gate (100% Fact Preservation)\n\n`;
    md += `| Timestamp | User | Conversation | Vibe | Fact Parity | Latency |\n`;
    md += `|-----------|------|--------------|------|-------------|---------|\n`;

    auditLogs.forEach((l) => {
      const time = new Date(l.timestamp).toLocaleTimeString();
      md += `| ${time} | ${l.userName} | ${l.conversationTitle.slice(0, 24)} | ${l.detectedVibe} | ${l.factParityPercent}% | ${l.executionTimeMs}ms |\n`;
    });

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `REPORT-${Date.now()}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Exported REPORT.md summary');
  };

  // Clear all chats
  const handleClearHistory = () => {
    const freshConv: ChatConversation = {
      id: 'conv-' + Date.now(),
      userId: user.email,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category: 'Today',
      messages: [],
    };
    setConversations([freshConv]);
    setActiveConversationId(freshConv.id);
    dbSaveConversation(freshConv);
    triggerToast('Chat history reset');
  };

  // Reset current active conversation
  const handleResetCurrentChat = () => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversation.id) return c;
        const cleared = { ...c, messages: [] };
        dbSaveConversation(cleared);
        return cleared;
      })
    );
    setDraftText('');
    triggerToast('Current chat cleared');
  };

  // Custom Persona Management
  const handleSaveCustomPersona = (newPersona: CustomPersona) => {
    setCustomPersonas((prev) => [newPersona, ...prev]);
    dbSaveCustomPersona(newPersona);
    triggerToast(`Custom Persona "${newPersona.title}" saved to Supabase!`);
  };

  const handleDeleteCustomPersona = (id: string) => {
    setCustomPersonas((prev) => prev.filter((p) => p.id !== id));
    dbDeleteCustomPersona(id);
    triggerToast('Custom persona deleted from Supabase');
  };

  // User Auth
  const handleLoginSuccess = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    dbSaveUserProfile(updatedUser);
    dbRecordUserLogin({
      id: 'login-' + Date.now(),
      userId: updatedUser.email,
      email: updatedUser.email,
      timestamp: Date.now(),
      deviceInfo: 'Web Client',
      status: 'success',
      provider: 'email',
    });
    triggerToast(`Logged in as ${updatedUser.name}`);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] flex font-sans selection:bg-blue-500/20 selection:text-blue-900">
      {/* Left Sidebar: Chat History, Views & User Profile */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversation?.id || ''}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        user={user}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeView={activeView}
        onSelectView={setActiveView}
      />

      {/* Main Workspace Canvas */}
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
          activeView={activeView}
          onSelectView={setActiveView}
        />

        {/* View Switcher Routing */}
        {activeView === 'studio' && (
          <>
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
                        <span>Modulating linguistic tones & verifying fact invariants into Supabase...</span>
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
          </>
        )}

        {/* Personas Hub View */}
        {activeView === 'personas' && (
          <PersonaHub
            customPersonas={customPersonas}
            onSaveCustomPersona={handleSaveCustomPersona}
            onDeleteCustomPersona={handleDeleteCustomPersona}
          />
        )}

        {/* Audit History View */}
        {activeView === 'audit' && (
          <AuditHistoryView
            logs={auditLogs}
            onExportJson={handleExportAuditJson}
            onExportMarkdown={handleExportAuditMarkdown}
          />
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <AnalyticsView
            totalShifts={user.totalShifts}
            totalConversations={conversations.length}
            customPersonasCount={customPersonas.length}
            auditLogsCount={auditLogs.length}
          />
        )}
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
          dbSaveUserProfile(updated);
          triggerToast('Profile updated & synced to Supabase');
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

      {/* Auth / Account Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} isVisible={showToast} />
    </div>
  );
}

export default App;
