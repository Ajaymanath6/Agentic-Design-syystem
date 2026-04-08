/** Default cap so Prettier does not freeze the UI on enormous strings. */
export const FORMAT_HTML_DEFAULT_MAX_CHARS = 400_000

export type FormatHtmlFailureReason = 'too_large' | 'parse_error' | 'cancelled'

export type FormatHtmlResult =
  | { ok: true; formatted: string }
  | {
      ok: false
      fallback: string
      reason: FormatHtmlFailureReason
    }

function isAborted(signal: AbortSignal | undefined): boolean {
  return signal?.aborted === true
}

/**
 * Pretty-print HTML for read-only display (browser). Uses Prettier via dynamic import.
 * Never throws; oversized or invalid input returns raw fallback.
 */
export async function formatHtmlForDisplay(
  raw: string,
  options?: { maxChars?: number; signal?: AbortSignal },
): Promise<FormatHtmlResult> {
  const maxChars = options?.maxChars ?? FORMAT_HTML_DEFAULT_MAX_CHARS
  const signal = options?.signal

  if (isAborted(signal)) {
    return { ok: false, fallback: raw, reason: 'cancelled' }
  }

  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return { ok: true, formatted: '' }
  }

  if (raw.length > maxChars) {
    return { ok: false, fallback: raw, reason: 'too_large' }
  }

  try {
    const [{ format }, htmlPlugin] = await Promise.all([
      import('prettier/standalone'),
      import('prettier/plugins/html'),
    ])

    if (isAborted(signal)) {
      return { ok: false, fallback: raw, reason: 'cancelled' }
    }

    const formatted = await format(raw, {
      parser: 'html',
      plugins: [htmlPlugin],
      printWidth: 100,
      htmlWhitespaceSensitivity: 'css',
    })

    if (isAborted(signal)) {
      return { ok: false, fallback: raw, reason: 'cancelled' }
    }

    return { ok: true, formatted }
  } catch {
    return { ok: false, fallback: raw, reason: 'parse_error' }
  }
}

export function formatHtmlFailureMessage(
  reason: FormatHtmlFailureReason,
): string {
  switch (reason) {
    case 'too_large':
      return 'Markup is too large to format; showing raw HTML.'
    case 'parse_error':
      return 'Could not format; showing raw HTML.'
    case 'cancelled':
      return ''
    default: {
      const _exhaustive: never = reason
      return _exhaustive
    }
  }
}
