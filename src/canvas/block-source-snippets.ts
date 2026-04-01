/**
 * TSX excerpts for admin canvas blocks (see BlockPreview in AdminCanvasPage.tsx).
 * Shown in the inspect modal Code tab alongside serialized HTML.
 */
const SNIPPETS: Record<string, string> = {
  'primary-button': `if (element.type === 'button') {
  return (
    <div ref={ref} data-component-name={element.componentId} className="flex h-full items-center justify-center">
      <button type="button" className="rounded-md bg-brandcolor-primary px-4 py-2 text-sm font-medium text-brandcolor-white hover:bg-brandcolor-primaryhover">
        {element.label}
      </button>
    </div>
  )
}`,

  'sample-card': `// Default card branch → AdminCanvasCardPreview (theme-guide card surface + h3 + weak body)`,

  'theme-guide-card': `// Same as sample-card — type 'card' → AdminCanvasCardPreview with THEME_GUIDE_* constants`,

  'article-card': `<article> with h2 (THEME_ARTICLE_TITLE), subtitle (text-strong), paragraphs (text-weak). See AdminCanvasArticleCard in AdminCanvasPage.tsx.`,

  'bar-chart-stub': `Chart stub: flex column, title + bar divs with bg-brandcolor-secondary heights. See element.type === 'chart' in BlockPreview.`,
}

export function getBlockSourceSnippet(componentId: string): string | null {
  const s = SNIPPETS[componentId]
  return s ?? null
}
