# VibeShift Design System: Obsidian Kinetic
Retrieved from Stitch MCP Project `VibeShift` (`projects/3954042903872263911/screens/06fe38d8cc444097a87542ec2c371741`).

## 1. Brand & Aesthetic Core
- **Concept**: High-density AI-powered communication transformer with tactile glassmorphism, glowing micro-accents, and razor-sharp typographic hierarchy.
- **Theme**: Dark Mode SaaS Workbench (Obsidian Kinetic)
- **Base Canvas**: `#0B0F19` (Zero-glare deep obsidian background)
- **Primary Accent**: Indigo `#6366F1` (Glow: `0 0 20px -4px rgba(99, 102, 241, 0.35)`)
- **Interactive State**: `#4F46E5`

## 2. Color Palette & Elevation Tokens
| Token | Hex / Value | Usage |
|---|---|---|
| Canvas Background | `#0B0F19` | Main layout backdrop |
| Surface Layer 1 | `#111827` | Primary card panels, editor studio, persona output cards |
| Surface Layer 2 | `#1F2937` | Secondary containers, active chips, dropdowns, input frames |
| Surface Layer 3 | `#374151` | Subtle elevated pills, active borders, sliders track |
| Hairline Border | `#1F2937` / `#374151` | 1px clean crisp division |
| Text Primary | `#F3F4F6` | High-contrast readability for headers and body |
| Text Muted | `#9CA3AF` | Supporting labels, descriptions, placeholders |
| Live AI Status | `#10B981` | Emerald pulse indicator with ping animation |

## 3. Persona Jewel-Tone Badges & Accents
1. **Executive C-Level Summary**:
   - Badge Accent: Amber Gold (`#F59E0B`)
   - Container Tint: `rgba(245, 158, 11, 0.08)`
   - Border Highlight: `#F59E0B`
   - Persona Archetype: Decisive, metric-driven, bottom-line focused, strategic.

2. **Supportive Peer Feedback**:
   - Badge Accent: Emerald Green (`#10B981`)
   - Container Tint: `rgba(16, 185, 129, 0.08)`
   - Border Highlight: `#10B981`
   - Persona Archetype: Empathetic, psychologically safe, constructive, collaborative.

3. **Legal / Compliance Notice**:
   - Badge Accent: Cyan / Teal (`#06B6D4`)
   - Container Tint: `rgba(6, 182, 212, 0.08)`
   - Border Highlight: `#06B6D4`
   - Persona Archetype: Risk-mitigated, auditable, formally precise, objective.

4. **Gen-Z Hype / Viral**:
   - Badge Accent: Vivid Purple / Violet (`#8B5CF6`)
   - Container Tint: `rgba(139, 92, 246, 0.08)`
   - Border Highlight: `#8B5CF6`
   - Persona Archetype: Slang-fluent, high-energy, candid, internet native.

## 4. Word-Level Diff Highlighter Tokens
- **Word Additions**:
  - Color: `#34D399` / `#10B981`
  - Background: `rgba(16, 185, 129, 0.18)`
  - Styling: Inline rounded highlight badge (`px-1.5 py-0.5 rounded text-emerald-300 font-medium`)
- **Word Deletions**:
  - Color: `#F87171` / `#EF4444`
  - Background: `rgba(239, 68, 68, 0.18)`
  - Styling: Strikethrough inline badge (`px-1.5 py-0.5 rounded text-rose-300 line-through`)

## 5. Typography Architecture
- **Primary Interface**: `Inter, system-ui, sans-serif`
  - Display Headers: 20px–28px, Semibold/Bold (`tracking-tight`)
  - Section Labels: 12px–14px, Medium
  - Body Text: 14px–15px, Regular (`leading-relaxed`)
- **Code & Telemetry**: `JetBrains Mono, Menlo, monospace`
  - Word / Character Counters: 12px Mono
  - Delta Metrics (`-32% Word Count`, `+44% Lexical Density`): 12px–13px Mono
  - Tone Shift Percentages: 11px Mono Tabular Numerals

## 6. Layout Architecture (Desktop Workbench)
- **Top Sticky Navbar**:
  - VibeShift Logo with glowing spark/wave icon
  - Version pill `v2.4`
  - Emerald LED pulse badge `Live AI Ready`
  - Quick action stats & preset selectors
- **Split-Screen Studio**:
  - **Left Studio (38% Desktop Width)**:
    - Scenario Quick Chips (`Prod Server Crash`, `Scope Creep Pushback`, `Blunt Code Review`)
    - Multi-line Raw Draft Editor with real-time character/word counter & Vibe detector
    - Sliders: Formality, Warmth, Urgency (0–100% interactive)
    - Primary Indigo Action Button: `Transform Across All Personas ✨` (⌘+Enter hint)
  - **Right Persona Grid (62% Desktop Width)**:
    - 2x2 Grid of Persona Cards with individual Diff toggles, Copy buttons, LCS Word Diff view, Tone comparison bars, and Preserved Facts guarantees.
