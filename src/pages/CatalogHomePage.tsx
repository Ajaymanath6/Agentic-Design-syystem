import { Card } from '../components/Card'

const stubs = [
  { title: 'Buttons', description: 'Primary and neutral actions from the theme guide.' },
  { title: 'Cards', description: 'Surface pattern: rounded-lg, strokeweak border, shadow-card.' },
  { title: 'Forms', description: 'Inputs use strokestrong border and textstrong focus ring.' },
  { title: 'Layout', description: 'Catalog shell with sidebar and results background.' },
]

export function CatalogHomePage() {
  return (
    <div>
      <h1 className="font-sans text-3xl font-semibold tracking-tight text-brandcolor-textstrong c_md:text-4xl">
        Catalog home
      </h1>
      <p className="mt-2 max-w-2xl text-brandcolor-textweak">
        Browse UI building blocks aligned with the Orbin design system. All
        surfaces use brandcolor tokens only.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 c_xl:grid-cols-2">
        {stubs.map((item) => (
          <li key={item.title}>
            <Card className="p-5">
              <h2 className="font-sans text-lg font-semibold text-brandcolor-textstrong">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-brandcolor-textweak">
                {item.description}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
