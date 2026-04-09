/**
 * @type {import('tailwindcss').Config}
 *
 * Icons (not Tailwind classes — documented here as a design-system rule):
 * Use **Remix Icon for React** for all UI icons: `npm i @remixicon/react`
 * Import named exports, e.g. `import { RiHomeLine } from '@remixicon/react'`.
 * Browse glyphs: https://remixicon.com — match sizing/colors with Tailwind (`size-4`, `text-brandcolor-textstrong`, …).
 */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,json}',
    './public/blueprints/**/*.json',
    './blueprints/**/*.json',
  ],
  theme: {
    extend: {
      screens: {
        c_md: '768px',
        c_xl: '1280px',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        lora: ['Lora', 'serif'],
      },
      colors: {
        'brandcolor-primary': '#F84416',
        'brandcolor-primaryhover': '#EA4C00',
        'brandcolor-secondary': '#0A0A0A',
        'brandcolor-secondaryhover': '#292929',
        'brandcolor-secondaryfill': '#EAEFFF',
        'brandcolor-neutralhover': '#EFEFEF',
        'brandcolor-textstrong': '#1A1A1A',
        'brandcolor-textweak': '#575757',
        'brandcolor-strokestrong': '#575757',
        'brandcolor-strokeweak': '#E5E5E5',
        'brandcolor-strokemild': '#767676',
        'brandcolor-strokelight': '#F5F5F5',
        'brandcolor-fill': '#F5F5F5',
        'brandcolor-white': '#FFFFFF',
        'brandcolor-sidebarhover': '#2E3C48',
        'brandcolor-divider': '#404B53',
        'brandcolor-banner-info-bg': '#D5DFFF',
        'brandcolor-banner-warning-bg': '#FFEBE1',
        'brandcolor-banner-warning-button': '#F26333',
        'brandcolor-results-bg': '#F8F9FB',
        'brandcolor-archived-bg': '#FBF8E7',
        'brandcolor-archived-border': '#A5A5A5',
        'brandcolor-archived-badge': '#E8E8E8',
        'brandcolor-destructive': '#C20205',
        'brandcolor-table-header': '#DDDDDD',
        'brandcolor-badge-success-bg': '#E2F3E0',
        'brandcolor-badge-success-text': '#028831',
        'brandcolor-badge-attorney-bg': '#F2EBFF',
        'brandcolor-badge-attorney-text': '#6238AA',
        'brandcolor-badge-amber-bg': '#FFF7DB',
        'brandcolor-badge-amber-text': '#A47800',
      },
      boxShadow: {
        'button-press':
          'inset 3px 3px 10px 0px rgba(26, 26, 26, 0.33)',
        'border-inset-strokelight': 'inset 0 0 0 1.5px #F5F5F5',
        'border-inset-secondary': 'inset 0 0 0 1.5px #0A0A0A',
        'border-inset-secondary-press':
          'inset 0 0 0 1.5px #0A0A0A, inset 3px 3px 10px 0px rgba(26, 26, 26, 0.33)',
        header: '0px 4px 4px 0px rgba(87, 87, 87, 0.05)',
        'tab-option': '0 1px 5px 0 rgba(0, 0, 0, 0.2)',
        card: '0 0 5px 0 rgba(102, 118, 131, 0.2)',
        'sidebar-toggle': '0 1px 4px 0 rgba(0, 0, 0, 0.08)',
        /** :user-valid confirm password: tight ring + soft outward blur (primary #F84416). */
        'confirm-password-valid':
          '0 0 0 2px rgba(248, 68, 22, 0.28), 0 0 14px 6px rgba(248, 68, 22, 0.18), 0 8px 28px rgba(248, 68, 22, 0.22)',
        /** Primary-tinted button / CTA glow — oklch(0.5243 0.1143 214.28) ≈ brandcolor-primary #F84416. */
        'button-brand-glow':
          '0 10px 36px -6px oklch(0.5243 0.1143 214.28 / 0.5), 0 6px 24px -4px oklch(0.5243 0.1143 214.28 / 0.38), 0 3px 14px -2px oklch(0.5243 0.1143 214.28 / 0.28)',
      },
      borderWidth: {
        1.5: '1.5px',
      },
      borderRadius: {
        button: '6px',
        large: '12px',
      },
    },
  },
  plugins: [],
}
