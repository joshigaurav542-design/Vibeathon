import { ChatConversation, UserProfile } from '../types';
import { SAMPLE_SCENARIOS } from './sampleScenarios';

export const CURRENT_USER: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex.rivera@vibe.ai',
  avatarUrl: '',
  role: 'Staff Product Engineer',
  plan: 'Pro',
  totalShifts: 142,
  joinedDate: 'Oct 2024',
  status: 'online',
};

export const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    title: 'Prod Server Crash Incident',
    createdAt: Date.now() - 1000 * 60 * 18,
    updatedAt: Date.now() - 1000 * 60 * 18,
    category: 'Today',
    scenarioId: 'prod-crash',
    activePersonaTab: 'all',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        timestamp: Date.now() - 1000 * 60 * 18,
        content: SAMPLE_SCENARIOS[0].draftText,
        sliders: SAMPLE_SCENARIOS[0].defaultSliders,
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Scope Creep Sprint Pushback',
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
    category: 'Today',
    scenarioId: 'scope-creep',
    activePersonaTab: 'all',
    messages: [
      {
        id: 'msg-2',
        role: 'user',
        timestamp: Date.now() - 1000 * 60 * 60 * 3,
        content: SAMPLE_SCENARIOS[1].draftText,
        sliders: SAMPLE_SCENARIOS[1].defaultSliders,
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'Blunt Code Review & Refactor',
    createdAt: Date.now() - 1000 * 60 * 60 * 25,
    updatedAt: Date.now() - 1000 * 60 * 60 * 25,
    category: 'Yesterday',
    scenarioId: 'code-review',
    activePersonaTab: 'all',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        timestamp: Date.now() - 1000 * 60 * 60 * 25,
        content: SAMPLE_SCENARIOS[2].draftText,
        sliders: SAMPLE_SCENARIOS[2].defaultSliders,
      },
    ],
  },
  {
    id: 'conv-4',
    title: 'Delayed Q3 Roadmap Deliverables',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
    category: 'Previous 7 Days',
    activePersonaTab: 'all',
    messages: [
      {
        id: 'msg-4',
        role: 'user',
        timestamp: Date.now() - 1000 * 60 * 60 * 72,
        content: 'We need to push back the Q3 design system launch by 3 weeks to complete the accessibility audit and responsive testing across mobile devices.',
        sliders: { formality: 60, warmth: 40, urgency: 50 },
      },
    ],
  },
  {
    id: 'conv-5',
    title: 'Vendor Contract Cancellation',
    createdAt: Date.now() - 1000 * 60 * 60 * 120,
    updatedAt: Date.now() - 1000 * 60 * 60 * 120,
    category: 'Previous 7 Days',
    activePersonaTab: 'all',
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        timestamp: Date.now() - 1000 * 60 * 60 * 120,
        content: 'Per section 4.2 of the master services agreement, we are providing 30 days formal written notice to terminate the analytics subscription effective end of month.',
        sliders: { formality: 90, warmth: 10, urgency: 40 },
      },
    ],
  },
];
