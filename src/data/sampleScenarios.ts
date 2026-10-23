import { PresetScenario } from '../types';

export const SAMPLE_SCENARIOS: PresetScenario[] = [
  {
    id: 'prod-crash',
    label: 'Prod Server Crash',
    vibe: 'High Stress / Direct',
    description: 'High-stakes infrastructure outage requiring urgent stakeholder de-escalation',
    defaultSliders: {
      formality: 45,
      warmth: 20,
      urgency: 90,
    },
    draftText: `Hey team, the primary prod cluster just blew up because someone pushed an unindexed migration directly to master at 3 AM. Customers are getting 502 errors on checkout. We rolled back the commit 10 mins ago, but caching is still desynced and replication lag is 45 mins behind. Don't touch anything in us-east-1 until SRE finishes flushing the queue. I need an RCA by noon.`,
  },
  {
    id: 'scope-creep',
    label: 'Scope Creep Pushback',
    vibe: 'Frustrated / Defensive',
    description: 'Protecting team capacity against unapproved sprint feature requests',
    defaultSliders: {
      formality: 65,
      warmth: 35,
      urgency: 75,
    },
    draftText: `Hey team / client, there is absolutely zero chance we can add OAuth2 social logins, custom user avatars, and the new Stripe recurring tier before Friday's demo. The sprint scope was locked 10 days ago, and our team is already working overtime on the core transaction engine. If these 3 new requests are mandatory for the launch, please specify which agreed milestone gets dropped, or approve extending the delivery deadline by 2 weeks.`,
  },
  {
    id: 'code-review',
    label: 'Blunt Code Review',
    vibe: 'Critical / Technical',
    description: 'Code review feedback addressing performance anti-patterns and missing tests',
    defaultSliders: {
      formality: 40,
      warmth: 25,
      urgency: 80,
    },
    draftText: `This PR is 1,400 lines without a single test and it introduces a catastrophic N+1 database query in the main search loop. You're also mutating component props directly and swallowing errors in an empty catch block, which will silently hide payment gateway dropouts. We cannot merge this in this state. Please refactor the query with eager loading, write integration tests, and split this monster diff into three reviewable branches.`,
  },
];
