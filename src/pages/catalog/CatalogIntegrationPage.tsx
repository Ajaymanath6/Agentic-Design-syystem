import { useCallback, useId, useMemo, useState } from 'react'
import { RiFileCopyLine } from '@remixicon/react'
import { Card } from '../../components/Card'
import {
  PLACEHOLDER_VERCEL_MCP_URL,
  formatHostedMcpConfigJson,
  formatMcpConfigJson,
  getHostedMcpConfig,
  getMcpConfigForAgenticWorkspace,
} from '../../lib/catalog-mcp-config'

export function CatalogIntegrationPage() {
  const statusId = useId()
  const [copied, setCopied] = useState<'local' | 'hosted' | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)

  const mcpJson = useMemo(
    () => formatMcpConfigJson(getMcpConfigForAgenticWorkspace()),
    [],
  )

  const remoteUrl =
    import.meta.env.VITE_MCP_REMOTE_URL?.trim() || PLACEHOLDER_VERCEL_MCP_URL

  const hostedJson = useMemo(
    () =>
      formatHostedMcpConfigJson(
        getHostedMcpConfig(remoteUrl, {
          includeAuthHeaderPlaceholder: true,
        }),
      ),
    [remoteUrl],
  )

  const copyLocal = useCallback(async () => {
    setCopyError(null)
    setCopied(null)
    try {
      await navigator.clipboard.writeText(mcpJson)
      setCopied('local')
    } catch {
      setCopyError(
        'Clipboard access failed. Select the JSON below and copy manually (Ctrl+C / Cmd+C).',
      )
    }
  }, [mcpJson])

  const copyHosted = useCallback(async () => {
    setCopyError(null)
    setCopied(null)
    try {
      await navigator.clipboard.writeText(hostedJson)
      setCopied('hosted')
    } catch {
      setCopyError(
        'Clipboard access failed. Select the JSON below and copy manually (Ctrl+C / Cmd+C).',
      )
    }
  }, [hostedJson])

  return (
    <div className="min-w-0 max-w-3xl overflow-x-hidden px-4 pb-10">
      <h1 className="font-sans text-3xl font-semibold tracking-tight text-brandcolor-textstrong c_md:text-4xl">
        Connect to Cursor
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-brandcolor-textweak">
        Choose <strong>local</strong> (this repo + Node on your machine) or{' '}
        <strong>hosted</strong> (your deployed Vercel URL). Paste into{' '}
        <code className="rounded bg-brandcolor-fill px-1 py-0.5 text-[13px] text-brandcolor-textstrong">
          .cursor/mcp.json
        </code>{' '}
        and reload Cursor. Field names for remote servers may vary slightly by Cursor version—see{' '}
        <a
          href="https://cursor.com/docs/context/mcp"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-brandcolor-textstrong underline decoration-brandcolor-strokeweak underline-offset-2"
        >
          Cursor MCP docs
        </a>
        .
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-brandcolor-textstrong px-4 py-2.5 text-sm font-medium text-brandcolor-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-textstrong focus-visible:ring-offset-2"
          onClick={copyLocal}
        >
          <RiFileCopyLine className="size-[18px] shrink-0" aria-hidden />
          Copy local configuration
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-4 py-2.5 text-sm font-medium text-brandcolor-textstrong transition-colors hover:bg-brandcolor-fill focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-textstrong focus-visible:ring-offset-2"
          onClick={copyHosted}
        >
          <RiFileCopyLine className="size-[18px] shrink-0" aria-hidden />
          Copy hosted (Vercel) configuration
        </button>
      </div>

      <p id={statusId} className="sr-only" aria-live="polite" aria-atomic="true">
        {copied === 'local'
          ? 'Local MCP configuration copied.'
          : copied === 'hosted'
            ? 'Hosted MCP configuration copied.'
            : ''}
      </p>
      {copied ? (
        <p className="mt-3 text-sm font-medium text-brandcolor-textstrong" aria-hidden>
          Copied.
        </p>
      ) : null}
      {copyError ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {copyError}
        </p>
      ) : null}

      <h2 className="mt-10 font-sans text-lg font-semibold text-brandcolor-textstrong">
        Local (stdio)
      </h2>
      <Card className="mt-3 overflow-hidden p-0">
        <pre
          className="max-h-[min(280px,40vh)] overflow-auto p-4 text-left text-[13px] leading-relaxed text-brandcolor-textstrong"
          tabIndex={0}
        >
          <code>{mcpJson}</code>
        </pre>
      </Card>
      <p className="mt-3 text-sm text-brandcolor-textweak">
        One-time:{' '}
        <code className="rounded bg-brandcolor-fill px-1 py-0.5 text-[13px] text-brandcolor-textstrong">
          cd mcp-server &amp;&amp; npm install &amp;&amp; npm run build
        </code>
        — then reload Cursor (<strong>Developer: Reload Window</strong>).
      </p>

      <h2 className="mt-10 font-sans text-lg font-semibold text-brandcolor-textstrong">
        Hosted (Vercel / Streamable HTTP)
      </h2>
      <p className="mt-2 text-sm text-brandcolor-textweak">
        Replace the URL with your deployment (and remove{' '}
        <code className="text-[13px]">headers</code> if you do not set{' '}
        <code className="text-[13px]">MCP_API_KEY</code> on Vercel). Set{' '}
        <code className="rounded bg-brandcolor-fill px-1 py-0.5 text-[13px]">
          VITE_MCP_REMOTE_URL
        </code>{' '}
        when building the catalog app to prefill the snippet.
      </p>
      <Card className="mt-3 overflow-hidden p-0">
        <pre
          className="max-h-[min(280px,40vh)] overflow-auto p-4 text-left text-[13px] leading-relaxed text-brandcolor-textstrong"
          tabIndex={0}
        >
          <code>{hostedJson}</code>
        </pre>
      </Card>
      <p className="mt-3 text-sm text-brandcolor-textweak">
        Deploy and env details:{' '}
        <code className="rounded bg-brandcolor-fill px-1 py-0.5 text-[13px]">
          mcp-server/README.md
        </code>{' '}
        (section <strong>Hosted MCP (Vercel)</strong>).
      </p>
    </div>
  )
}
