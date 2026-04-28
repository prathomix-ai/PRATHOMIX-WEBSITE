import { render, screen } from '@testing-library/react'
import Badge from '../components/Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Live</Badge>)
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('applies default variant class', () => {
    const { container } = render(<Badge>Test</Badge>)
    expect(container.firstChild).toHaveClass('text-brand-300')
  })

  it('applies success variant', () => {
    const { container } = render(<Badge variant="success">OK</Badge>)
    expect(container.firstChild).toHaveClass('text-green-300')
  })
})
