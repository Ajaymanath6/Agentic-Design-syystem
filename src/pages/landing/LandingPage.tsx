import { Link } from 'react-router-dom'
import './landing-fonts.css'
import { RiArrowRightLine } from '@remixicon/react'
import { PlatformSectionSpiral, PlatformSectionSpiralMobile } from './PlatformSectionSpiral'
import {
  DifferentiatorsGlassSection,
  FeatureCardsSection,
} from './FeatureShowcaseCard'
import {
  CTA_GUIDE_YS_SECTION,
  CTA_SECTION_HIGHLIGHT_CELLS,
  CtaSectionGuideGrid,
} from './CtaGuideGrid'
import { CtaCardDefaultBg } from './CtaCardDefaultBg'
import { CtaHighlightOverlays } from './CtaHighlightOverlays'
import { CtaSectionGoldenArc } from './CtaSectionGoldenArc'
import {
  CTA_ARC_CENTROID_PERCENT,
  GoldenRatioCtaArtBase,
  GoldenRatioCtaArtGuides,
} from './GoldenRatioCtaArt'
import {
  BRAND_NAME,
  CTA_SECTION,
  FOOTER_COLUMNS,
  HERO,
  HERO_SCENE_SRC,
  LANDING_ACCENT,
  LANDING_EDGE_PAD_PX,
  LANDING_INK,
  LANDING_FEATURE_CARD_BG,
  LANDING_PAGE_BG,
  LANDING_PRODUCT_CARD_SRC,
  LANDING_PRODUCT_CARD_OVERLAP_Y_PERCENT,
  LANDING_STROKE,
  LANDING_TEXT_MUTED,
  LANDING_CTA_CARD_BG,
  LANDING_TEXT_SUB,
  NAV_LINKS,
  PLATFORM_INTRO,
} from './landing-content'

const landingCtaBase =
  'font-landing-body inline-flex items-center justify-center rounded-[4px] text-sm font-normal transition-[transform,box-shadow] duration-150 hover:-translate-y-px active:translate-y-0'

const landingCtaAccent = `${landingCtaBase} border border-[#0bc9bb] bg-[#11EFDF] text-[#1a1a1a] shadow-[0_6px_20px_rgba(17,239,223,0.42),inset_0_1px_0_rgba(255,255,255,0.45)] hover:shadow-[0_8px_24px_rgba(17,239,223,0.52),inset_0_1px_0_rgba(255,255,255,0.55)] active:shadow-[0_3px_8px_rgba(17,239,223,0.32),inset_0_2px_6px_rgba(0,0,0,0.08)]`

const landingCtaNeutral = `${landingCtaBase} border border-[#dcdcdc] bg-white text-[#3d3d3d] shadow-[0_4px_14px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.95)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,1)] active:shadow-[0_2px_6px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(0,0,0,0.05)]`

function LandingNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 sm:px-6">
      <div className="pointer-events-auto mx-auto max-w-6xl pt-4">
        <nav
          className="flex w-full items-center justify-between gap-3 rounded-[4px] border border-black/[0.06] bg-white/90 px-3 py-2 shadow-[0_6px_24px_rgba(0,0,0,0.07)] backdrop-blur-md sm:px-4"
          aria-label="Main"
        >
        <a href="#" className="flex shrink-0 items-center gap-2">
          <img
            src="/brand-logo.png"
            alt=""
            className="h-8 w-8 rounded-lg object-cover"
            width={32}
            height={32}
          />
          <span
            className="font-landing-heading hidden text-sm font-medium tracking-tight sm:inline"
            style={{ color: LANDING_INK }}
          >
            {BRAND_NAME}
          </span>
        </a>
        <ul className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="font-landing-body rounded px-2.5 py-1 text-sm text-[#575757] transition-colors hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          to="/catalog/home"
          className={`${landingCtaAccent} shrink-0 px-4 py-1.5 text-sm`}
        >
          Get started
        </Link>
        </nav>
      </div>
    </header>
  )
}

function HeroCtaButtons() {
  return (
    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
      <Link
        to="/catalog/home"
        className={`${landingCtaBase} min-w-[7.5rem] px-6 py-2.5 border border-[#dcdcdc] bg-white text-[#3d3d3d] shadow-[0_4px_14px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.95)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,1)] active:shadow-[0_2px_6px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(0,0,0,0.05)]`}
      >
        {HERO.ctaLogin}
      </Link>
      <Link
        to="/admin/canvas"
        className={`${landingCtaBase} min-w-[7.5rem] px-6 py-2.5 border border-[#1a1a1a] bg-[#2a2a2a] text-white shadow-[0_6px_20px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.16)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.2)] active:shadow-[0_3px_8px_rgba(0,0,0,0.22),inset_0_2px_6px_rgba(0,0,0,0.4)]`}
      >
        {HERO.ctaBuildUi}
      </Link>
    </div>
  )
}

/** Floating product preview — half on hero, half below (Cofounder-style panel). */
function HeroProductCard() {
  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.14),0_8px_24px_rgba(15,23,42,0.08)] sm:p-4"
      role="region"
      aria-label="Product preview"
    >
      <img
        src={LANDING_PRODUCT_CARD_SRC}
        alt={`${BRAND_NAME} — catalog, canvas, and component workflow preview`}
        className="block w-full rounded-xl object-cover object-top"
        width={1024}
        height={574}
        loading="lazy"
      />
    </div>
  )
}

function HeroSection() {
  return (
    <section
      className="relative w-full pb-[clamp(10rem,18vw,16rem)]"
      style={{
        paddingLeft: LANDING_EDGE_PAD_PX,
        paddingRight: LANDING_EDGE_PAD_PX,
      }}
    >
      <div
        className="relative flex h-[80vh] w-full flex-col items-center justify-center overflow-hidden rounded-[4px] text-center"
        style={{
          backgroundImage: `url(${HERO_SCENE_SRC})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/55 via-white/25 to-white/10"
          aria-hidden
        />
        <div className="relative z-10 flex max-w-3xl flex-col items-center px-4 pb-24 sm:pb-32">
          <h1
            className="font-landing-heading text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl md:text-6xl"
            style={{ color: LANDING_INK }}
          >
            {HERO.heading}
          </h1>
          <p className="font-landing-body mt-5 max-w-2xl text-base font-normal leading-relaxed text-[#3d3d3d] sm:text-lg">
            {HERO.subtitle}
          </p>
          <HeroCtaButtons />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-6"
        style={{
          transform: `translateY(${LANDING_PRODUCT_CARD_OVERLAP_Y_PERCENT}%)`,
        }}
      >
        <div className="mx-auto w-full max-w-6xl">
          <HeroProductCard />
        </div>
      </div>
    </section>
  )
}

function PlatformIntroHeadline() {
  const pattern = new RegExp(
    `(${PLATFORM_INTRO.titleAccentWords.join('|')})`,
    'g',
  )
  const parts = PLATFORM_INTRO.title.split(pattern)

  return (
    <>
      {parts.map((part, index) =>
        (PLATFORM_INTRO.titleAccentWords as readonly string[]).includes(
          part,
        ) ? (
          <span key={`${part}-${index}`} style={{ color: LANDING_ACCENT }}>
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  )
}

function PlatformSection() {
  return (
    <section
      id="platform"
      className="relative scroll-mt-28 overflow-hidden pb-[100px] pl-0 pr-4 pt-[400px] sm:pr-6"
      style={{ backgroundColor: PLATFORM_INTRO.sectionBg }}
    >
      <PlatformSectionSpiral />
      <div className="relative z-10 mx-auto max-w-6xl pl-4 sm:pl-6">
        <div className="relative flex min-h-[22rem] flex-col items-center justify-center lg:min-h-[38rem]">
          <PlatformSectionSpiralMobile />
          <div className="relative z-10 w-full text-center lg:ml-auto lg:max-w-2xl xl:max-w-3xl">
            <p className="font-landing-body text-xs font-normal uppercase tracking-[0.18em] text-[#a3a39a]">
              {PLATFORM_INTRO.eyebrow}
            </p>
            <h2
              className="font-landing-heading mx-auto mt-4 max-w-xl text-[2.5rem] font-medium leading-[1.15] tracking-tight"
              style={{ color: LANDING_INK }}
            >
              <PlatformIntroHeadline />
            </h2>
          </div>
        </div>
      </div>
    </section>
  )
}

function LandingCtaSection() {
  return (
    <section
      className="group/cta-section relative overflow-hidden px-4 py-20 sm:py-28"
      style={{
        backgroundColor: LANDING_FEATURE_CARD_BG,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-28 sm:h-36"
        style={{
          background: `linear-gradient(to bottom, ${LANDING_PAGE_BG} 0%, ${LANDING_PAGE_BG}cc 28%, ${LANDING_FEATURE_CARD_BG}88 62%, transparent 100%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-32 sm:h-40"
        style={{
          background: `linear-gradient(to top, ${LANDING_PAGE_BG} 0%, ${LANDING_PAGE_BG}cc 32%, ${LANDING_FEATURE_CARD_BG}66 68%, transparent 100%)`,
        }}
        aria-hidden
      />
      <CtaSectionGuideGrid className="pointer-events-none absolute inset-0 h-full w-full" />
      <CtaSectionGoldenArc className="pointer-events-none absolute inset-0 h-full w-full" />
      <CtaHighlightOverlays
        className="z-[1]"
        guideYs={CTA_GUIDE_YS_SECTION}
        highlightCells={CTA_SECTION_HIGHLIGHT_CELLS}
      />
      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <div
          className="group/cta-card relative aspect-square w-full overflow-hidden rounded-2xl"
          style={{
            backgroundColor: LANDING_CTA_CARD_BG,
          }}
        >
          <GoldenRatioCtaArtBase />
          <CtaCardDefaultBg />
          <GoldenRatioCtaArtGuides />
          <div
            className="pointer-events-none absolute z-30 flex w-full max-w-[92%] -translate-x-1/2 -translate-y-1/2 flex-col items-center px-6 text-center sm:px-10"
            style={{
              left: `${CTA_ARC_CENTROID_PERCENT.left}%`,
              top: `${CTA_ARC_CENTROID_PERCENT.top}%`,
            }}
          >
            <p
              className="font-landing-body text-[0.65rem] font-normal uppercase tracking-[0.18em] sm:text-xs"
              style={{ color: LANDING_TEXT_MUTED }}
            >
              {CTA_SECTION.eyebrow}
            </p>
            <h2
              className="font-landing-heading mx-auto mt-2 max-w-md text-lg font-medium leading-tight tracking-tight sm:text-2xl"
              style={{ color: LANDING_INK }}
            >
              {CTA_SECTION.title}
            </h2>
            <p
              className="font-landing-body mx-auto mt-2 max-w-md text-sm font-normal leading-snug sm:text-[0.9375rem]"
              style={{ color: LANDING_TEXT_SUB }}
            >
              {CTA_SECTION.description}
            </p>
            <div className="pointer-events-auto mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
              <Link
                to="/catalog/home"
                className={`${landingCtaAccent} gap-1.5 px-5 py-2.5 text-sm font-medium`}
              >
                {CTA_SECTION.primaryLabel}
                <RiArrowRightLine className="size-4" aria-hidden />
              </Link>
              <Link
                to="/catalog/home"
                className={`${landingCtaNeutral} min-w-[6rem] px-5 py-2.5 text-sm font-medium`}
              >
                {CTA_SECTION.secondaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer
      className="px-4 pt-14 pb-8"
      style={{
        backgroundColor: LANDING_PAGE_BG,
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img
                src="/brand-logo.png"
                alt=""
                className="h-9 w-9 rounded-xl object-cover"
                width={36}
                height={36}
              />
              <span
                className="font-landing-heading text-lg font-medium tracking-tight"
                style={{ color: LANDING_INK }}
              >
                {BRAND_NAME}
              </span>
            </Link>
            <p
              className="font-landing-body mt-4 max-w-sm text-sm font-normal leading-relaxed"
              style={{ color: LANDING_TEXT_SUB }}
            >
              AI component infrastructure — generate, publish, and inject UI in
              the flow of real development.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p
                className="font-landing-heading text-sm font-medium"
                style={{ color: LANDING_INK }}
              >
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="font-landing-body text-sm font-normal transition-colors hover:text-[#1a1a1a]"
                        style={{ color: LANDING_TEXT_SUB }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="font-landing-body text-sm font-normal transition-colors hover:text-[#1a1a1a]"
                        style={{ color: LANDING_TEXT_SUB }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
          style={{ borderColor: LANDING_STROKE }}
        >
          <p
            className="font-landing-body text-sm font-normal"
            style={{ color: LANDING_TEXT_MUTED }}
          >
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <p
            className="font-landing-body text-sm font-normal"
            style={{ color: LANDING_TEXT_MUTED }}
          >
            Built for teams shipping with design systems.
          </p>
        </div>
      </div>
    </footer>
  )
}

export function LandingPage() {
  return (
    <div
      className="min-h-screen font-landing-body text-[#1a1a1a] antialiased"
      style={{ backgroundColor: LANDING_PAGE_BG }}
    >
      <LandingNav />
      <main>
        <HeroSection />

        <PlatformSection />

        <FeatureCardsSection />

        <DifferentiatorsGlassSection />

        <LandingCtaSection />
      </main>

      <LandingFooter />
    </div>
  )
}
