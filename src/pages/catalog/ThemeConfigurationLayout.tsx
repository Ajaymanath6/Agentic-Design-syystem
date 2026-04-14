import {
  RiDownloadLine,
  RiHardDrive2Line,
  RiRestartLine,
  RiSave3Line,
} from '@remixicon/react'
import { useCallback, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CatalogMainHeader } from '../../components/CatalogMainHeader'
import { ThemeConfigSidebar } from '../../components/ThemeConfigSidebar'
import { TypographySettingModal } from '../../components/TypographySettingModal'
import {
  BRAND_COLOR_DEFAULTS,
  BRAND_COLOR_KEYS,
  type BrandColorKey,
  THEME_REFERENCE_READ_ONLY,
} from '../../config/brand-theme-colors'
import {
  SHADOW_DEFAULTS,
  SHADOW_KEYS,
  type ShadowTokenKey,
} from '../../config/theme-shadow-defaults'
import {
  TYPOGRAPHY_DEFAULTS,
  TYPOGRAPHY_KEYS,
  type TypographyTokenKey,
} from '../../config/theme-typography-defaults'
import {
  applyBrandColorsFromHexMap,
  clearThemeColorOverrides,
  loadThemeColorOverridesHex,
  saveThemeColorOverridesDiffFromDefaults,
} from '../../lib/theme-color-overrides'
import {
  applyShadowValuesToDocument,
  applyTypographyValuesToDocument,
  clearThemeShadowOverrides,
  clearThemeTypographyOverrides,
  loadThemeShadowOverrides,
  loadThemeTypographyOverrides,
  saveThemeShadowOverridesDiffFromDefaults,
  saveThemeTypographyOverridesDiffFromDefaults,
} from '../../lib/theme-token-overrides'
import { validateShadowValue, validateTypographyValue } from '../../lib/theme-token-validation'
import { postThemeSyncToProject } from '../../services/publish-workflow'
import type { EditingTypoPair, ThemeEditorOutletContext } from './theme/types'
import { ThemeTypographyFsLhEditor } from './theme/ThemeTypographyWidgets'

function buildInitialHexMap(): Record<BrandColorKey, string> {
  const next: Record<BrandColorKey, string> = { ...BRAND_COLOR_DEFAULTS }
  const over = loadThemeColorOverridesHex()
  for (const k of BRAND_COLOR_KEYS) {
    if (over[k]) next[k] = over[k]!
  }
  return next
}

function buildInitialShadowMap(): Record<ShadowTokenKey, string> {
  const next: Record<ShadowTokenKey, string> = { ...SHADOW_DEFAULTS }
  const over = loadThemeShadowOverrides()
  for (const k of SHADOW_KEYS) {
    if (over[k]) next[k] = over[k]!
  }
  return next
}

function buildInitialTypographyMap(): Record<TypographyTokenKey, string> {
  const next: Record<TypographyTokenKey, string> = { ...TYPOGRAPHY_DEFAULTS }
  const over = loadThemeTypographyOverrides()
  for (const k of TYPOGRAPHY_KEYS) {
    if (over[k]) next[k] = over[k]!
  }
  return next
}

function mergeValidHexMap(
  source: Record<BrandColorKey, string>,
): Record<BrandColorKey, string> {
  const merged: Record<BrandColorKey, string> = { ...BRAND_COLOR_DEFAULTS }
  for (const k of BRAND_COLOR_KEYS) {
    const raw = source[k]?.trim() ?? ''
    const withHash = raw.startsWith('#') ? raw : `#${raw}`
    if (/^#[0-9A-Fa-f]{6}$/.test(withHash)) {
      merged[k] = withHash.toUpperCase()
    }
  }
  return merged
}

function mergeValidShadowMap(
  source: Record<ShadowTokenKey, string>,
): Record<ShadowTokenKey, string> {
  const merged: Record<ShadowTokenKey, string> = { ...SHADOW_DEFAULTS }
  for (const k of SHADOW_KEYS) {
    const ok = validateShadowValue(source[k] ?? SHADOW_DEFAULTS[k])
    if (ok) merged[k] = ok
  }
  return merged
}

function mergeValidTypographyMap(
  source: Record<TypographyTokenKey, string>,
): Record<TypographyTokenKey, string> {
  const merged: Record<TypographyTokenKey, string> = { ...TYPOGRAPHY_DEFAULTS }
  for (const k of TYPOGRAPHY_KEYS) {
    const ok = validateTypographyValue(k, source[k] ?? TYPOGRAPHY_DEFAULTS[k])
    if (ok) merged[k] = ok
  }
  return merged
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Theme editor shell: left `ThemeConfigSidebar`, right main with header, toolbar, and
 * nested routes (`colors` | `typography` | `shadows`).
 */
export function ThemeConfigurationLayout() {
  const [hexByKey, setHexByKey] = useState<Record<BrandColorKey, string>>(
    buildInitialHexMap,
  )
  const [shadowByKey, setShadowByKey] = useState<Record<ShadowTokenKey, string>>(
    buildInitialShadowMap,
  )
  const [typoByKey, setTypoByKey] = useState<Record<TypographyTokenKey, string>>(
    buildInitialTypographyMap,
  )
  const [editingTypoPair, setEditingTypoPair] = useState<EditingTypoPair | null>(
    null,
  )
  const [saveHint, setSaveHint] = useState<string | null>(null)
  const [diskHint, setDiskHint] = useState<string | null>(null)
  const [diskError, setDiskError] = useState<string | null>(null)
  const [diskBusy, setDiskBusy] = useState(false)

  const readonly = THEME_REFERENCE_READ_ONLY

  const fontFamilyLines = useMemo(
    () =>
      Object.entries(readonly.fontFamily).map(([k, v]) => (
        <li key={k}>
          <span className="font-mono text-brandcolor-textstrong">{k}</span>:{' '}
          {Array.isArray(v) ? v.join(', ') : String(v)}
        </li>
      )),
    [readonly.fontFamily],
  )

  const fontSizeLines = useMemo(
    () =>
      Object.entries(readonly.fontSize ?? {}).map(([k, v]) => (
        <li key={k}>
          <span className="font-mono text-brandcolor-textstrong">{k}</span>: {String(v)}
        </li>
      )),
    [readonly.fontSize],
  )

  const lineHeightLines = useMemo(
    () =>
      Object.entries(readonly.lineHeight ?? {}).map(([k, v]) => (
        <li key={k}>
          <span className="font-mono text-brandcolor-textstrong">{k}</span>: {String(v)}
        </li>
      )),
    [readonly.lineHeight],
  )

  const fontWeightLines = useMemo(
    () =>
      Object.entries(readonly.fontWeight ?? {}).map(([k, v]) => (
        <li key={k}>
          <span className="font-mono text-brandcolor-textstrong">{k}</span>: {String(v)}
        </li>
      )),
    [readonly.fontWeight],
  )

  const bumpDirty = useCallback(() => {
    setSaveHint(null)
    setDiskHint(null)
    setDiskError(null)
  }, [])

  const setColor = useCallback(
    (key: BrandColorKey, hex: string) => {
      setHexByKey((prev) => ({ ...prev, [key]: hex }))
      bumpDirty()
    },
    [bumpDirty],
  )

  const resetColorKey = useCallback(
    (key: BrandColorKey) => {
      setHexByKey((prev) => ({ ...prev, [key]: BRAND_COLOR_DEFAULTS[key] }))
      bumpDirty()
    },
    [bumpDirty],
  )

  const setShadow = useCallback(
    (key: ShadowTokenKey, value: string) => {
      setShadowByKey((prev) => ({ ...prev, [key]: value }))
      bumpDirty()
    },
    [bumpDirty],
  )

  const resetShadowKey = useCallback(
    (key: ShadowTokenKey) => {
      setShadowByKey((prev) => ({ ...prev, [key]: SHADOW_DEFAULTS[key] }))
      bumpDirty()
    },
    [bumpDirty],
  )

  const setTypo = useCallback(
    (key: TypographyTokenKey, value: string) => {
      setTypoByKey((prev) => ({ ...prev, [key]: value }))
      bumpDirty()
    },
    [bumpDirty],
  )

  const resetTypoKey = useCallback(
    (key: TypographyTokenKey) => {
      setTypoByKey((prev) => ({ ...prev, [key]: TYPOGRAPHY_DEFAULTS[key] }))
      bumpDirty()
    },
    [bumpDirty],
  )

  const resetAll = useCallback(() => {
    clearThemeColorOverrides()
    clearThemeShadowOverrides()
    clearThemeTypographyOverrides()
    const colors: Record<BrandColorKey, string> = { ...BRAND_COLOR_DEFAULTS }
    const shadows: Record<ShadowTokenKey, string> = { ...SHADOW_DEFAULTS }
    const typo: Record<TypographyTokenKey, string> = { ...TYPOGRAPHY_DEFAULTS }
    setHexByKey(colors)
    setShadowByKey(shadows)
    setTypoByKey(typo)
    applyBrandColorsFromHexMap(colors)
    applyShadowValuesToDocument({})
    applyTypographyValuesToDocument({})
    setSaveHint('Reset to defaults (all browser overrides cleared).')
    setDiskHint(null)
    setDiskError(null)
  }, [])

  const save = useCallback(() => {
    const mergedColors = mergeValidHexMap(hexByKey)
    const mergedShadows = mergeValidShadowMap(shadowByKey)
    const mergedTypo = mergeValidTypographyMap(typoByKey)
    setHexByKey(mergedColors)
    setShadowByKey(mergedShadows)
    setTypoByKey(mergedTypo)
    saveThemeColorOverridesDiffFromDefaults(mergedColors)
    saveThemeShadowOverridesDiffFromDefaults(mergedShadows)
    saveThemeTypographyOverridesDiffFromDefaults(mergedTypo)
    applyBrandColorsFromHexMap(mergedColors)
    applyShadowValuesToDocument(mergedShadows)
    applyTypographyValuesToDocument(mergedTypo)
    setSaveHint(
      'Saved for this browser (colors, shadows, typography). Use Save to project files to write repo markers.',
    )
  }, [hexByKey, shadowByKey, typoByKey])

  const saveToProject = useCallback(async () => {
    setDiskBusy(true)
    setDiskError(null)
    setDiskHint(null)
    try {
      const mergedColors = mergeValidHexMap(hexByKey)
      const mergedShadows = mergeValidShadowMap(shadowByKey)
      const mergedTypo = mergeValidTypographyMap(typoByKey)
      setHexByKey(mergedColors)
      setShadowByKey(mergedShadows)
      setTypoByKey(mergedTypo)
      const colors: Record<string, string> = {}
      for (const k of BRAND_COLOR_KEYS) colors[k] = mergedColors[k]
      const shadows: Record<string, string> = {}
      for (const k of SHADOW_KEYS) shadows[k] = mergedShadows[k]
      const typography: Record<string, string> = {}
      for (const k of TYPOGRAPHY_KEYS) typography[k] = mergedTypo[k]
      const res = await postThemeSyncToProject({ colors, shadows, typography })
      setDiskHint(
        `Wrote ${res.written.join(', ')}. Reload if hot module update did not pick up changes.`,
      )
    } catch (e) {
      setDiskError(e instanceof Error ? e.message : String(e))
    } finally {
      setDiskBusy(false)
    }
  }, [hexByKey, shadowByKey, typoByKey])

  const exportJson = useCallback(() => {
    const colors: Record<string, string> = {}
    for (const k of BRAND_COLOR_KEYS) colors[k] = hexByKey[k]
    const shadows: Record<string, string> = {}
    for (const k of SHADOW_KEYS) shadows[k] = shadowByKey[k]
    const typography: Record<string, string> = {}
    for (const k of TYPOGRAPHY_KEYS) typography[k] = typoByKey[k]
    downloadJson('theme-config.json', { colors, shadows, typography })
  }, [hexByKey, shadowByKey, typoByKey])

  const typoFwKeys = useMemo(
    () => TYPOGRAPHY_KEYS.filter((k) => k.startsWith('fw-theme-')),
    [],
  )

  const outletContext = useMemo<ThemeEditorOutletContext>(
    () => ({
      hexByKey,
      setColor,
      resetColorKey,
      shadowByKey,
      setShadow,
      resetShadowKey,
      typoByKey,
      setTypo,
      resetTypoKey,
      setEditingTypoPair,
      typoFwKeys,
      readonly,
      fontFamilyLines,
      fontSizeLines,
      lineHeightLines,
      fontWeightLines,
    }),
    [
      hexByKey,
      setColor,
      resetColorKey,
      shadowByKey,
      setShadow,
      resetShadowKey,
      typoByKey,
      setTypo,
      resetTypoKey,
      typoFwKeys,
      readonly,
      fontFamilyLines,
      fontSizeLines,
      lineHeightLines,
      fontWeightLines,
      setEditingTypoPair,
    ],
  )

  return (
    <>
      <ThemeConfigSidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-brandcolor-results-bg font-sans text-theme-body-medium-regular leading-theme-body-medium-regular">
        <CatalogMainHeader />
        <div className="min-h-0 min-w-0 w-full flex-1 overflow-y-auto overflow-x-hidden py-8">
          <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-2 sm:px-6">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-3 py-1.5 text-theme-body-small-regular font-theme-medium text-brandcolor-textstrong hover:bg-brandcolor-fill"
              >
                <RiRestartLine className="size-4 shrink-0" aria-hidden />
                Reset all
              </button>
              <button
                type="button"
                onClick={exportJson}
                className="inline-flex items-center gap-1.5 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-3 py-1.5 text-theme-body-small-regular font-theme-medium text-brandcolor-textstrong hover:bg-brandcolor-fill"
              >
                <RiDownloadLine className="size-4 shrink-0" aria-hidden />
                Export JSON
              </button>
              <button
                type="button"
                onClick={save}
                className="inline-flex items-center gap-1.5 rounded-md border border-brandcolor-primary bg-brandcolor-primary px-3 py-1.5 text-theme-body-small-regular font-theme-semibold text-brandcolor-white hover:bg-brandcolor-primaryhover"
              >
                <RiSave3Line className="size-4 shrink-0" aria-hidden />
                Save
              </button>
              <button
                type="button"
                onClick={() => void saveToProject()}
                disabled={diskBusy}
                className="inline-flex items-center gap-1.5 rounded-md border border-brandcolor-strokestrong bg-brandcolor-white px-3 py-1.5 text-theme-body-small-regular font-theme-semibold text-brandcolor-textstrong hover:bg-brandcolor-fill disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RiHardDrive2Line className="size-4 shrink-0" aria-hidden />
                {diskBusy ? 'Writing…' : 'Save to project files'}
              </button>
            </div>

            {saveHint ? (
              <p
                className="mt-3 text-theme-body-small-regular text-brandcolor-badge-success-text"
                role="status"
              >
                {saveHint}
              </p>
            ) : null}
            {diskHint ? (
              <p
                className="mt-2 text-theme-body-small-regular text-brandcolor-badge-success-text"
                role="status"
              >
                {diskHint}
              </p>
            ) : null}
            {diskError ? (
              <p
                className="mt-2 whitespace-pre-wrap text-theme-body-small-regular text-brandcolor-destructive"
                role="alert"
              >
                {diskError}
              </p>
            ) : null}

            <div className="mt-6">
              <Outlet context={outletContext} />
            </div>
          </div>
        </div>
      </main>

      <TypographySettingModal
        open={editingTypoPair !== null}
        onClose={() => setEditingTypoPair(null)}
        title={editingTypoPair?.heading ?? 'Typography'}
        subtitle={
          editingTypoPair
            ? `${editingTypoPair.fsKey} · ${editingTypoPair.lhKey}`
            : null
        }
      >
        {editingTypoPair ? (
          <ThemeTypographyFsLhEditor
            fsKey={editingTypoPair.fsKey}
            lhKey={editingTypoPair.lhKey}
            fsValue={typoByKey[editingTypoPair.fsKey]}
            lhValue={typoByKey[editingTypoPair.lhKey]}
            onFsChange={(v) => setTypo(editingTypoPair.fsKey, v)}
            onLhChange={(v) => setTypo(editingTypoPair.lhKey, v)}
            onResetPair={() => {
              resetTypoKey(editingTypoPair.fsKey)
              resetTypoKey(editingTypoPair.lhKey)
            }}
          />
        ) : null}
      </TypographySettingModal>
    </>
  )
}
