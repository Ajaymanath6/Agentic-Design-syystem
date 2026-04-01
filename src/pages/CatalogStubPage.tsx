import { Card } from '../components/Card'

type Props = { title: string; description?: string }

export function CatalogStubPage({ title, description }: Props) {
  return (
    <div>
      <h1 className="font-sans text-3xl font-semibold tracking-tight text-brandcolor-textstrong c_md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-brandcolor-textweak">{description}</p>
      ) : null}
      <Card className="mt-8 p-6">
        <p className="text-sm text-brandcolor-textweak">
          This section mirrors the Angular catalog route tree. Replace with real
          content when those features ship.
        </p>
      </Card>
    </div>
  )
}
