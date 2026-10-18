import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { analyzeResume } from './services/api'
import App from './App'

vi.mock('./services/api', () => ({
  analyzeResume: vi.fn(),
  parseResume: vi.fn(),
}))

const mockResult = {
  score: 50,
  score_explanation: 'Transparent coverage formula.',
  summary: 'One of two recognized requirements was found in the supplied resume.',
  required_skill_count: 2,
  matched_count: 1,
  not_found_count: 1,
  requirements: [
    { name: 'React', status: 'matched' as const, evidence: 'Built a React app.' },
    { name: 'Docker', status: 'not_found_in_resume' as const, evidence: null },
  ],
  recommendations: [{ title: 'Build evidence', detail: 'Practice first.', related_skill: 'Docker' }],
  roadmap: [{ phase: 'Phase 1', title: 'Practice Docker', actions: ['Build a small app.'], estimated_time: 'One week', target_skill: 'Docker' }],
  resume_checklist: ['Use accurate claims.'],
  advice_source: 'rule_based' as const,
  advice_notice: 'Rule-based suggestions are shown.',
}

describe('SkillLens workspace', () => {
  beforeEach(() => {
    vi.mocked(analyzeResume).mockResolvedValue(mockResult)
  })

  it('starts in a real empty state and requires both inputs', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Start with the role you want.' })).toBeInTheDocument()
    expect(screen.getByLabelText('Resume text')).toBeInTheDocument()
    expect(screen.getByLabelText('Job description text')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /analyze skill match/i })).toBeDisabled()
    expect(screen.getByText('Your analysis will appear here after you submit both inputs.')).toBeInTheDocument()
  })

  it('submits both user inputs and renders the returned score', async () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Resume text'), {
      target: { value: 'Built a React app with responsive interface components.' },
    })
    fireEvent.change(screen.getByLabelText('Job description text'), {
      target: { value: 'Seeking React and Docker experience for a collaborative engineering role.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /analyze skill match/i }))

    expect(await screen.findByRole('heading', { name: '50%' })).toBeInTheDocument()
    expect(screen.getByText('One of two recognized requirements was found in the supplied resume.')).toBeInTheDocument()
    expect(analyzeResume).toHaveBeenCalledWith(
      'Built a React app with responsive interface components.',
      'Seeking React and Docker experience for a collaborative engineering role.',
    )
  })
})
