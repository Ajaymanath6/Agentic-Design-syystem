export const LANDING_ACCENT = '#11EFDF'
export const LANDING_INK = '#2D2D2D'

/** Landing page canvas background (matches hero sketch-paper tone). */
export const LANDING_PAGE_BG = '#ebeae6'

export const BRAND_NAME = 'Promptject'

export const LANDING_STROKE = '#e0dfda'
/** Dotted guides in CTA section padding — slightly darker than LANDING_STROKE. */
export const LANDING_SECTION_GUIDE = '#d4d1c9'
/** Golden-ratio arcs on CTA section — lighter than dotted guides. */
export const LANDING_CTA_SECTION_ARC = '#ebeae6'
export const LANDING_TEXT_MUTED = '#a3a39a'
export const LANDING_TEXT_SUB = '#575757'
/** CTA card fill — sky gradient wash. */
export const LANDING_CTA_CARD_BG = '#eef3f9'
/** CTA card mesh + arcs — light blue on sky card. */
export const LANDING_CTA_CARD_GRID = '#d2e6f4'

/** Golden-ratio spiral artwork (section decorations). */
export const LANDING_GOLDEN_SPIRAL_SRC =
  '/landing/differentiator-bg/section-spiral-left.png'

/** Complementary corner accents (pairs with LANDING_CARD_HOVER_TEXTURES / section squares). */
export const TEXTURE_COMPLEMENT_COLORS = [
  '#e09a68',
  '#5eb5d6',
  '#c97ab8',
  '#9fc455',
  '#f09442',
] as const

export function textureComplementColor(textureIndex: number): string {
  const i = textureIndex % TEXTURE_COMPLEMENT_COLORS.length
  return TEXTURE_COMPLEMENT_COLORS[i] ?? TEXTURE_COMPLEMENT_COLORS[0]
}

/** Platform feature art by capability index (0 = gradient-only hero). */
export const CAPABILITY_PLATFORM_ICONS = [
  null,
  '/landing/platform-icons/03-atom-blocks.png', // Design system enforcement
  '/landing/platform-icons/04-catalog-library.png', // Component library publishing
  '/landing/platform-icons/02-platform-launch.png', // Code catalog & registry
  '/landing/platform-icons/01-injection.png', // Inline code injection
  '/landing/platform-icons/07-shapes-grid.png', // VS Code workflow automation
  '/landing/platform-icons/06-tokens.png', // Token-aware generation
  '/landing/platform-icons/05-prompt-production.png', // Prompt-to-production
] as const

/** Muted stroke tones — readable on each card’s texture (same contrast family as subtext). */
export const CAPABILITY_ICON_TINTS = [
  '#575757',
  '#5f6b63',
  '#5c6468',
  '#626058',
  '#585f65',
  '#5a6358',
  '#63605c',
  '#5c5e62',
] as const

export const CTA_SECTION = {
  eyebrow: 'Get started',
  title: 'Ready to build with context?',
  description:
    'Open the catalog, publish from the canvas, and inject components where your team already codes.',
  primaryLabel: 'Open catalog',
  secondaryLabel: 'Log in',
} as const

export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Platform', href: '#platform' },
      { label: 'Capabilities', href: '#capabilities' },
      { label: 'Differentiators', href: '#differentiators' },
    ],
  },
  {
    title: 'Build',
    links: [
      { label: 'Catalog', href: '/catalog/home' },
      { label: 'Canvas', href: '/admin/canvas' },
      { label: 'Sign up', href: '/catalog/home' },
    ],
  },
] as const

/** Pale gray surface for feature showcase cards. */
export const LANDING_FEATURE_CARD_BG = '#f2f1ed'

/** Circuit-style hero mark (white on black). */
export const HERO_MARK_SRC = '/hero-mark.png'

/** Hero background — neutral line-art landscape. */
export const HERO_SCENE_SRC = '/hero-scene.png'

/** Colorful landscape — first feature card on hover. */
export const HERO_SCENE_COLOR_SRC = '/hero-scene-color.png'

/** Product UI preview inside the hero overlap card. */
export const LANDING_PRODUCT_CARD_SRC = '/landing-product-card.png'

/** Overlap card width as a fraction of the hero image width. */
export const LANDING_PRODUCT_CARD_WIDTH_PERCENT = 60

/**
 * How far the overlap card sits below the hero bottom edge (lower % = more card on the image).
 */
export const LANDING_PRODUCT_CARD_OVERLAP_Y_PERCENT = 36

export const FEATURE_CARDS_SECTION = {
  eyebrow: 'The platform',
  heading: 'Anchor your product',
} as const

export const DIFFERENTIATORS_SECTION = {
  eyebrow: 'Why it’s different',
  title: 'Developer-native by design',
  description:
    'Injecting components directly into any line of code via extension — not another detached builder.',
} as const

/** Hero / nav inset from viewport edges. */
export const LANDING_EDGE_PAD_PX = 16

export const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Differentiators', href: '#differentiators' },
] as const

export const HERO = {
  label: 'Introducing the AI UI Operating System',
  heading: 'Prompt .Publish.Inject',
  subtitle:
    'Generate token-aware components, publish to a reusable catalog, and inject production-ready UI directly into any line of code — inside VS Code.',
  ctaLogin: 'Log in',
  ctaBuildUi: 'Build UI',
} as const

/** Pale tints for mock panel accents on hover (one per capability). */
export const CAPABILITY_CARD_HOVER_TINTS = [
  '#fef4dc',
  '#dff5f0',
  '#e4f8e8',
  '#ebe4fc',
  '#ffe8dc',
  '#dce8fc',
  '#fce4f2',
  '#eef6dc',
] as const

/** Full-bleed texture backgrounds on card hover (8 unique mappings). */
export const LANDING_CARD_HOVER_TEXTURES = [
  '/landing/cta-hover/gray.png',
  '/landing/cta-hover/peach.png',
  '/landing/cta-hover/green.png',
  '/landing/cta-hover/purple.png',
  '/landing/cta-hover/blue.png',
  '/landing/cta-hover/sketch.png',
  '/landing/cta-hover/blue.png',
  '/landing/cta-hover/purple.png',
] as const

/** Golden-spiral backgrounds for “Why it’s different” glass cards. */
export const DIFFERENTIATOR_CARD_BACKGROUNDS = [
  '/landing/differentiator-bg/spiral-green.png',
  '/landing/differentiator-bg/spiral-orange.png',
  '/landing/differentiator-bg/spiral-gray.png',
  '/landing/cta-hover/card-spiral-rose.png', // Developer-native UI generation
] as const

export const PLATFORM_INTRO = {
  eyebrow: 'How it works',
  title: 'Prompt, publish, and inject UI where your team already codes.',
  titleAccentWords: ['Prompt', 'publish', 'inject'] as const,
  flowchartSrc: '/platform-flowchart.png',
  /** Matches landing page background so the flowchart blends in. */
  sectionBg: LANDING_PAGE_BG,
} as const

export const CAPABILITIES = [
  {
    title: 'AI UI generation',
    description:
      'Turn prompts into production components aligned with your tokens, themes, and patterns.',
  },
  {
    title: 'Design system enforcement',
    description:
      'Every output respects your primitives — color, type, spacing, and shadows stay on-brand.',
  },
  {
    title: 'Component library publishing',
    description:
      'Ship curated libraries from the canvas to a living catalog your team can browse and reuse.',
  },
  {
    title: 'Code catalog & registry',
    description:
      'A searchable registry of reusable blocks — versioned, documented, and ready to drop in.',
  },
  {
    title: 'Inline code injection',
    description:
      'Insert components at the exact cursor position in real repos — not isolated sandboxes.',
  },
  {
    title: 'VS Code workflow automation',
    description:
      'Developer-native generation and insertion without leaving your editor or git workflow.',
  },
  {
    title: 'Token-aware generation',
    description:
      'Theme and token semantics flow through every synthesis pass for consistent UI output.',
  },
  {
    title: 'Prompt-to-production',
    description:
      'From natural language to shippable components — orchestrated end to end.',
  },
] as const

export const DIFFERENTIATORS = [
  {
    title: 'Context-aware code injection',
    description:
      'Understands surrounding imports, layout, and file structure before inserting UI at your cursor.',
  },
  {
    title: 'Inline AI component insertion',
    description:
      'No copy-paste from a separate builder — components land in the line you are editing.',
  },
  {
    title: 'Live component synthesis',
    description:
      'Generate, preview, and refine components in flow — then publish to the registry instantly.',
  },
  {
    title: 'Developer-native UI generation',
    description:
      'Built for engineers first: extensions, catalogs, and codegen that fit existing workflows.',
  },
] as const
