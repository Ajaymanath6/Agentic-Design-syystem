import type { ReactNode } from 'react'
import {
  THEME_REFERENCE_READ_ONLY,
  type BrandColorKey,
} from '../../../config/brand-theme-colors'
import type { ShadowTokenKey } from '../../../config/theme-shadow-defaults'
import type { TypographyTokenKey } from '../../../config/theme-typography-defaults'

export type EditingTypoPair = {
  fsKey: TypographyTokenKey
  lhKey: TypographyTokenKey
  heading: string
}

/** Passed from ThemeConfigurationLayout to theme section panels via `<Outlet context />`. */
export type ThemeEditorOutletContext = {
  hexByKey: Record<BrandColorKey, string>
  setColor: (key: BrandColorKey, hex: string) => void
  resetColorKey: (key: BrandColorKey) => void
  shadowByKey: Record<ShadowTokenKey, string>
  setShadow: (key: ShadowTokenKey, value: string) => void
  resetShadowKey: (key: ShadowTokenKey) => void
  typoByKey: Record<TypographyTokenKey, string>
  setTypo: (key: TypographyTokenKey, value: string) => void
  resetTypoKey: (key: TypographyTokenKey) => void
  setEditingTypoPair: (v: EditingTypoPair | null) => void
  typoFwKeys: TypographyTokenKey[]
  readonly: typeof THEME_REFERENCE_READ_ONLY
  fontFamilyLines: ReactNode
  fontSizeLines: ReactNode
  lineHeightLines: ReactNode
  fontWeightLines: ReactNode
}
