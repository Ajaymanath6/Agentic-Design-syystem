import {
  RiArrowDownSLine,
  RiArrowUpDownLine,
  RiArrowUpSLine,
  RiFileTextLine,
  RiFolderLine,
  RiHistoryLine,
  RiHomeLine,
  RiKeyLine,
  RiTaskLine,
} from '@remixicon/react'
import type { ComponentType, SVGProps } from 'react'

import type {
  ProductSidebarHeaderIconKey,
  ProductSidebarNavIconKey,
} from '../../types/canvas-plan'

type IconProps = SVGProps<SVGSVGElement>

const navMap: Record<
  Exclude<ProductSidebarNavIconKey, 'none'>,
  ComponentType<IconProps>
> = {
  home: RiHomeLine,
  folder: RiFolderLine,
  task: RiTaskLine,
  fileText: RiFileTextLine,
  key: RiKeyLine,
  history: RiHistoryLine,
}

const headerMap: Record<
  Exclude<ProductSidebarHeaderIconKey, 'none'>,
  ComponentType<IconProps>
> = {
  chevronUpDown: RiArrowUpDownLine,
  chevronUp: RiArrowUpSLine,
  chevronDown: RiArrowDownSLine,
}

export function ProductSidebarNavIconGlyph({
  iconKey,
  className,
}: {
  iconKey: ProductSidebarNavIconKey
  className?: string
}) {
  if (iconKey === 'none') return null
  const Cmp = navMap[iconKey]
  return <Cmp className={className} aria-hidden />
}

export function ProductSidebarHeaderIconGlyph({
  iconKey,
  className,
}: {
  iconKey: ProductSidebarHeaderIconKey
  className?: string
}) {
  if (iconKey === 'none') return null
  const Cmp = headerMap[iconKey]
  return <Cmp className={className} aria-hidden />
}
