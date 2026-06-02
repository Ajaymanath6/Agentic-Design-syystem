import type { ReactNode } from 'react'
import {
  RiBookOpenLine,
  RiCodeBoxLine,
  RiDatabase2Line,
  RiFlashlightLine,
  RiLayoutGridLine,
  RiPaletteLine,
  RiPlugLine,
  RiRocketLine,
  RiTerminalBoxLine,
} from '@remixicon/react'
import { CardHoverTextureBg } from './CardHoverTextureBg'
import { CardImageBg } from './CardImageBg'
import {
  CAPABILITIES,
  CAPABILITY_CARD_HOVER_TINTS,
  CAPABILITY_PLATFORM_ICONS,
  DIFFERENTIATOR_CARD_BACKGROUNDS,
  DIFFERENTIATORS,
  DIFFERENTIATORS_SECTION,
  FEATURE_CARDS_SECTION,
  HERO_SCENE_COLOR_SRC,
  LANDING_FEATURE_CARD_BG,
  LANDING_INK,
  LANDING_PAGE_BG,
  textureComplementColor,
} from './landing-content'
import { PlatformCardIcon } from './PlatformCardIcon'
import { TextureCornerChip } from './TextureCornerChip'

function HeroSceneCardVisual() {
  return (
    <div className="relative h-full min-h-[12rem] w-full overflow-hidden sm:min-h-[14rem]">
      <CardImageBg src={HERO_SCENE_COLOR_SRC} />
    </div>
  )
}

function DifferentiatorCardVisual({ index }: { index: number }) {
  const bg =
    DIFFERENTIATOR_CARD_BACKGROUNDS[index] ??
    DIFFERENTIATOR_CARD_BACKGROUNDS[0]

  return (
    <div className="relative h-full min-h-[12rem] w-full overflow-hidden transition-transform duration-500 ease-out group-hover:scale-[1.01] sm:min-h-[14rem]">
      <CardImageBg src={bg} />
    </div>
  )
}

function MockPanel({
  children,
  accent,
  textureIndex,
}: {
  children: ReactNode
  accent: string
  textureIndex: number
}) {
  return (
    <div className="relative z-[2] mx-auto w-[88%] max-w-[240px] overflow-hidden rounded-xl bg-white/90 p-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-shadow duration-500 group-hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-25"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <TextureCornerChip
        size="panel"
        complementColor={textureComplementColor(textureIndex)}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}

function CapabilityCardVisual({
  index,
  hoverTint,
  hideBottomFade = false,
  usePlatformIcons = false,
}: {
  index: number
  hoverTint: string
  hideBottomFade?: boolean
  usePlatformIcons?: boolean
}) {
  if (index === 0) {
    return <HeroSceneCardVisual />
  }

  const platformIcon = usePlatformIcons
    ? CAPABILITY_PLATFORM_ICONS[index]
    : null

  if (platformIcon) {
    return (
      <div className="relative flex h-full min-h-[12rem] items-stretch justify-center transition-transform duration-500 ease-out group-hover:scale-[1.02] sm:min-h-[14rem]">
        <CardHoverTextureBg
          textureIndex={index}
          fadeInto={LANDING_FEATURE_CARD_BG}
          hideBottomFade={hideBottomFade || usePlatformIcons}
        />
        <PlatformCardIcon src={platformIcon} />
      </div>
    )
  }

  const icons = [
    RiFlashlightLine,
    RiPaletteLine,
    RiBookOpenLine,
    RiDatabase2Line,
    RiPlugLine,
    RiTerminalBoxLine,
    RiLayoutGridLine,
    RiCodeBoxLine,
  ] as const
  const Icon = icons[index] ?? RiRocketLine

  const barColors = [
    ['#f5d76e', '#7dd3c0', '#b8e986'],
    ['#c4b5fd', '#93c5fd', '#fda4af'],
    ['#86efac', '#67e8f9', '#fcd34d'],
    ['#fdba74', '#a5b4fc', '#5eead4'],
    ['#f9a8d4', '#6ee7b7', '#7dd3fc'],
    ['#bef264', '#f0abfc', '#67e8f9'],
    ['#fde047', '#c4b5fd', '#86efac'],
    ['#38bdf8', '#fb923c', '#a78bfa'],
  ][index] ?? ['#d4d4d4', '#d4d4d4', '#d4d4d4']

  return (
    <div className="relative flex h-full min-h-[12rem] items-center justify-center px-4 transition-transform duration-500 ease-out group-hover:scale-[1.02] sm:min-h-[14rem]">
      <CardHoverTextureBg
        textureIndex={index}
        fadeInto={LANDING_FEATURE_CARD_BG}
        hideBottomFade={hideBottomFade}
      />
      <MockPanel accent={hoverTint} textureIndex={index}>
        <div className="flex items-center gap-2 border-b border-[#e8e7e2] pb-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f5f3] transition-colors duration-500 group-hover:bg-white/80">
            <Icon className="size-4 text-[#6b6b66]" aria-hidden />
          </span>
          <div className="h-2 flex-1 rounded bg-[#ececea] transition-colors duration-500 group-hover:bg-white/70" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-2 w-full rounded bg-[#ececea] transition-colors duration-500 group-hover:bg-white/65" />
          <div className="h-2 w-[85%] rounded bg-[#ececea] transition-colors duration-500 group-hover:bg-white/60" />
          <div className="h-2 w-[70%] rounded bg-[#e4e4e0] transition-colors duration-500 group-hover:bg-white/55" />
        </div>
        <div className="mt-4 flex gap-1.5">
          {barColors.map((color) => (
            <div
              key={color}
              className="relative h-6 flex-1 overflow-hidden rounded-md bg-[#e8e8e4]"
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ backgroundColor: color }}
                aria-hidden
              />
            </div>
          ))}
        </div>
      </MockPanel>
    </div>
  )
}

function GlassCardFooter({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 rounded-b-[1.25rem] border-t border-white/55 bg-white/45 px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/30">
      <h3
        className="font-landing-heading text-lg font-medium leading-snug tracking-tight sm:text-xl"
        style={{ color: LANDING_INK }}
      >
        {title}
      </h3>
      <p className="font-landing-body mt-2 text-sm font-normal leading-relaxed text-[#4a4a44] sm:text-[0.9375rem]">
        {description}
      </p>
    </div>
  )
}

export function DifferentiatorGlassCard({
  title,
  description,
  index,
}: {
  title: string
  description: string
  index: number
}) {
  return (
    <article
      className="group relative min-h-[22rem] overflow-hidden rounded-[1.25rem] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:min-h-[26rem]"
      style={{ backgroundColor: LANDING_FEATURE_CARD_BG }}
    >
      <div className="absolute inset-0 pb-[7.5rem] sm:pb-[8rem]">
        <DifferentiatorCardVisual index={index} />
      </div>
      <GlassCardFooter title={title} description={description} />
    </article>
  )
}

export function FeatureShowcaseCard({
  title,
  description,
  index,
}: {
  title: string
  description: string
  index: number
}) {
  const hoverTint =
    CAPABILITY_CARD_HOVER_TINTS[index] ?? CAPABILITY_CARD_HOVER_TINTS[0]

  return (
    <article
      className="group flex min-h-[22rem] flex-col overflow-hidden rounded-[1.25rem] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:min-h-[24rem]"
      style={{ backgroundColor: LANDING_FEATURE_CARD_BG }}
    >
      <div className="relative min-h-[58%] flex-1 overflow-hidden">
        <CapabilityCardVisual
          index={index}
          hoverTint={hoverTint}
          usePlatformIcons
          hideBottomFade
        />
      </div>
      <div className="relative z-20 bg-[#f2f1ed] px-6 pb-8 pt-3">
        <h3
          className="font-landing-heading text-lg font-medium leading-snug tracking-tight sm:text-xl"
          style={{ color: LANDING_INK }}
        >
          {title}
        </h3>
        <p className="font-landing-body mt-3 text-sm font-normal leading-relaxed text-[#5c5c56] sm:text-[0.9375rem]">
          {description}
        </p>
      </div>
    </article>
  )
}

export function FeatureCardsSection() {
  return (
    <section id="capabilities" className="scroll-mt-28 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-4xl text-center sm:mb-14">
          <p className="font-landing-body text-xs font-normal uppercase tracking-[0.18em] text-[#a3a39a]">
            {FEATURE_CARDS_SECTION.eyebrow}
          </p>
          <h2
            className="font-landing-heading mt-3 text-[clamp(1.75rem,4.5vw,3.25rem)] font-medium leading-[1.12] tracking-tight"
            style={{ color: LANDING_INK }}
          >
            {FEATURE_CARDS_SECTION.heading}
          </h2>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item, index) => (
            <li key={item.title}>
              <FeatureShowcaseCard
                index={index}
                title={item.title}
                description={item.description}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function DifferentiatorsGlassSection() {
  return (
    <section
      id="differentiators"
      className="scroll-mt-28 px-4 py-20 sm:py-24"
      style={{ backgroundColor: LANDING_PAGE_BG }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          <p className="font-landing-body text-xs font-normal uppercase tracking-[0.18em] text-[#a3a39a]">
            {DIFFERENTIATORS_SECTION.eyebrow}
          </p>
          <h2
            className="font-landing-heading mt-3 text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ color: LANDING_INK }}
          >
            {DIFFERENTIATORS_SECTION.title}
          </h2>
          <p className="font-landing-body mt-4 text-base font-normal leading-relaxed text-[#575757]">
            {DIFFERENTIATORS_SECTION.description}
          </p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2">
          {DIFFERENTIATORS.map((item, index) => (
            <li key={item.title}>
              <DifferentiatorGlassCard
                index={index}
                title={item.title}
                description={item.description}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
