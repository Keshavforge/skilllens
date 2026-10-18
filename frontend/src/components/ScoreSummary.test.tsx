import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScoreSummary } from './ScoreSummary'

describe('ScoreSummary', () => {
  it('shows the computed skill coverage and counts', () => {
    render(<ScoreSummary score={66.7} matched_count={2} not_found_count={1} required_skill_count={3} />)
    expect(screen.getByRole('heading', { name: '66.7%' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '66.7% baseline skill coverage' })).toBeInTheDocument()
  })

  it('handles the zero-requirement score explicitly', () => {
    render(<ScoreSummary score={null} matched_count={0} not_found_count={0} required_skill_count={0} />)
    expect(screen.getByRole('heading', { name: 'Not calculated' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Score not calculated' })).toBeInTheDocument()
  })
})
