import { sanitizeCanvasHtmlFragment } from '../../lib/sanitize-canvas-html'

type Props = {
  html: string
  className?: string
  /** For accessibility when the preview is the primary representation */
  label?: string
}

/**
 * Renders published catalog `sourceHtml` with the same sanitization as the canvas.
 */
export function CatalogSourceHtmlPreview({
  html,
  className = '',
  label,
}: Props) {
  const safe = sanitizeCanvasHtmlFragment(html)
  if (!safe.trim()) {
    return (
      <div
        className={`flex items-center justify-center text-xs text-brandcolor-textweak ${className}`}
      >
        No preview
      </div>
    )
  }
  return (
    <div
      className={`catalog-source-html-preview min-h-0 min-w-0 bg-brandcolor-white text-[13px] leading-normal text-brandcolor-textstrong [&_*]:max-w-full ${className}`}
      {...(label
        ? { role: 'img', 'aria-label': label }
        : { 'aria-hidden': true })}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
