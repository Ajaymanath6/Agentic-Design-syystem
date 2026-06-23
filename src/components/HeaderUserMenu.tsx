import { RiLogoutBoxRLine, RiUser3Line } from '@remixicon/react'
import { Link } from 'react-router-dom'

const HEADER_USER_NAME = 'Ajay Manath'

/** Right-side profile chip + log out (returns to landing page). */
export function HeaderUserMenu() {
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2">
      <div
        className="inline-flex max-w-[min(100vw-10rem,220px)] items-center gap-2 rounded-full border border-brandcolor-strokeweak bg-brandcolor-white py-1 pl-1 pr-3"
        aria-label={`Signed in as ${HEADER_USER_NAME}`}
      >
        <span
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brandcolor-fill text-brandcolor-textstrong"
          aria-hidden
        >
          <RiUser3Line className="size-4" />
        </span>
        <span className="truncate text-[13px] font-medium text-brandcolor-textstrong">
          {HEADER_USER_NAME}
        </span>
      </div>
      <Link
        to="/"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-3 py-1.5 text-[13px] font-medium text-brandcolor-textstrong transition-colors hover:bg-brandcolor-fill focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-textstrong focus-visible:ring-offset-2"
        aria-label="Log out and return to landing page"
      >
        <RiLogoutBoxRLine className="size-4 shrink-0" aria-hidden />
        <span>Log out</span>
      </Link>
    </div>
  )
}
