/** 40px — space above library section headings (Tailwind mt-10). */
export const HOME_SECTION_TOP = 'mt-10'

/** 20px — space below section heading divider before cards (Tailwind pt-5 / gap-5). */
export const HOME_SECTION_BODY_GAP = 'pt-5'

/** 20px — space around horizontal dividers (Tailwind mt-5 / gap-5). */
export const HOME_DIVIDER_GAP = 'mt-5'

/** See more control — matches library toolbar buttons (14px, white). */
export const HOME_SEE_MORE_BUTTON =
  'inline-flex items-center gap-1.5 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-4 py-2 font-geist text-[14px] font-normal text-brandcolor-textstrong [font-family:var(--font-geist-stack)] transition-colors hover:bg-brandcolor-fill focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2'

/** 16px horizontal gap between library cards. */
export const HOME_CARD_GRID_GAP = 'gap-x-[16px] gap-y-4'

/** Import / Integrations — shared catalog page toolbar control. */
export const CATALOG_PAGE_TOOLBAR_BUTTON =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-4 py-2 font-geist text-[14px] font-normal text-brandcolor-textstrong [font-family:var(--font-geist-stack)] transition-colors hover:bg-brandcolor-fill focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2'

/** Theme editor — Reset all, Export JSON, Save to project files (shared on every theme tab). */
export const THEME_EDITOR_TOOLBAR_BUTTON =
  'inline-flex items-center gap-1.5 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-3 py-1.5 text-theme-body-small-regular font-theme-medium text-brandcolor-textstrong transition-colors hover:bg-brandcolor-fill focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-textstrong focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

/** Save actions — textstrong fill (not brand orange). */
export const APP_SAVE_BUTTON =
  'inline-flex items-center gap-1.5 rounded-md border border-brandcolor-textstrong bg-brandcolor-textstrong px-3 py-1.5 text-theme-body-small-regular font-theme-semibold text-brandcolor-white transition-colors hover:bg-brandcolor-secondaryhover focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-textstrong focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

export const APP_SAVE_BUTTON_COMPACT =
  'inline-flex shrink-0 items-center justify-center rounded-md border border-brandcolor-textstrong bg-brandcolor-textstrong px-4 py-2 font-geist text-[14px] font-medium text-brandcolor-white transition-colors hover:bg-brandcolor-secondaryhover focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-textstrong focus-visible:ring-offset-2 [font-family:var(--font-geist-stack)]'

/** Canvas / layout prompt send control (arrow-up). */
export const APP_PROMPT_SEND_BUTTON =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brandcolor-textstrong text-brandcolor-white shadow-sm transition-colors hover:bg-brandcolor-secondaryhover disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-textstrong focus-visible:ring-offset-2'

/** Active/focus ring on prompt composer shell. */
export const APP_COMPOSER_SHELL_FOCUS =
  'focus-within:border-brandcolor-textstrong'

/** Geist library / theme page shell — centered width with horizontal margin. */
export const HOME_PAGE_SHELL =
  'font-geist mx-auto my-3 mt-0 min-h-[calc(100vh-366px)] w-[var(--geist-page-width-with-margin)] max-w-full px-3 py-0 md-page:min-h-[calc(100vh-273px)]'

/** Collapsed sidebar — keep 290px inset on each side. */
export const HOME_PAGE_SHELL_COLLAPSED =
  'font-geist mx-[290px] mt-0 min-h-[calc(100vh-366px)] max-w-[calc(100%-580px)] w-full py-0 md-page:min-h-[calc(100vh-273px)]'
