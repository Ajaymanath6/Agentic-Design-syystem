import { Card } from '../components/Card'

type Props = { title: string }

export function ComingSoonPage({ title }: Props) {
  return (
    <div>
      <h1 className="font-sans text-3xl font-semibold tracking-tight text-brandcolor-textstrong c_md:text-4xl">
        {title}
      </h1>
      <Card className="mt-8 border-brandcolor-strokemild bg-brandcolor-banner-info-bg p-6">
        <p className="font-medium text-brandcolor-textstrong">Coming soon</p>
        <p className="mt-2 text-sm text-brandcolor-textweak">
          This area is not ported in v1. Check back when Uni Search or Build
          with AMI is scoped for React.
        </p>
      </Card>
    </div>
  )
}
