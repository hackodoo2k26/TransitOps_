import type { HTMLAttributes } from 'react'

import { Section } from '../ui/Section'

export function SectionWrapper(props: HTMLAttributes<HTMLElement>) {
  return <Section {...props} />
}
