/**
 * TSX excerpts for admin canvas blocks (see BlockPreview in AdminCanvasPage.tsx).
 * Shown in the inspect modal Code tab alongside serialized HTML.
 */
const SNIPPETS: Record<string, string> = {
  'primary-button': `if (element.type === 'button') {
  return (
    <div ref={ref} data-component-name={element.componentId} className="flex h-full items-center justify-center">
      <button type="button" className={THEME_GUIDE_BUTTON_PRIMARY}>
        {element.label}
      </button>
    </div>
  )
} // THEME_GUIDE_BUTTON_PRIMARY ← theme-guide.json componentGuidelines.button.primary`,

  'primary-button-alt': `Same BlockPreview branch as primary-button — className={THEME_GUIDE_BUTTON_PRIMARY} (bg-brandcolor-primary, text-brandcolor-white).`,

  'sample-card': `// Default card branch → AdminCanvasCardPreview (theme-guide card surface + h3 + weak body)`,

  'theme-guide-card': `// Same as sample-card — type 'card' → AdminCanvasCardPreview with THEME_GUIDE_* constants`,

  'article-card': `<article> with h2 (THEME_ARTICLE_TITLE), subtitle (text-strong), paragraphs (text-weak). See AdminCanvasArticleCard in AdminCanvasPage.tsx.`,

  'bar-chart-stub': `Chart stub: flex column, title + bar divs with bg-brandcolor-secondary heights. See element.type === 'chart' in BlockPreview.`,

  'profile-card': `Profile card: AdminCanvasProfileCard — theme-guide profileCard (h2 name, header row with RiMore2Line + RiShareLine icon buttons, subtitle, two weak body paragraphs). See element.type === 'profile'.`,

  'case-card': `Case card: AdminCanvasCaseCard — case name (h2), RiShareLine + RiPriceTag3Line on header, subheading, description. See element.type === 'case'.`,

  'promo-card': `Promo card: AdminCanvasPromoCard — h1 (THEME_GUIDE_HEADING_H1), weak subtitle, h2 section, weak section subtitle, then two weak body paragraphs. See element.type === 'promo'.`,

  'plain-card-single': `Plain card: AdminCanvasPlainCard — theme surface + single THEME_GUIDE_TEXT_WEAK_BODY paragraph (no headings). See element.type === 'plain'.`,

  'plain-card-dual': `Same as plain-card-single with paragraph2 for a second paragraph.`,

  'demo-canvas-name': `Canvas name field: AdminCanvasNameField — label + text input (border strokemild, hover fill, focus/active strokestrong). See element.type === 'authNameField'.`,

  'demo-canvas-password': `Canvas password field: AdminCanvasPasswordField — masked input, digits-only. Same input chrome as demo-canvas-name. See element.type === 'authPasswordField'.`,
}

export function getBlockSourceSnippet(componentId: string): string | null {
  const s = SNIPPETS[componentId]
  return s ?? null
}
