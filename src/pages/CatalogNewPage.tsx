import { Card } from '../components/Card'

export function CatalogNewPage() {
  return (
    <div>
      <h1 className="font-sans text-3xl font-semibold tracking-tight text-brandcolor-textstrong c_md:text-4xl">
        New
      </h1>
      <p className="mt-2 text-brandcolor-textweak">
        Recently added or highlighted catalog entries. Stub for v1.
      </p>
      <Card className="mt-8 p-6">
        <p className="text-sm text-brandcolor-textweak">
          Connect this route to your CMS or API when you are ready.
        </p>
      </Card>
    </div>
  )
}
