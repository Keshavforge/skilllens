import { Check, CircleHelp, FileSearch, Target } from 'lucide-react'
import type { AnalysisResult } from '../types/analysis'

type Props = Pick<AnalysisResult, 'score' | 'matched_count' | 'not_found_count' | 'required_skill_count'>

export function ScoreSummary({ score, matched_count, not_found_count, required_skill_count }: Props) {
  return (
    <section className="score-panel" aria-labelledby="score-title">
      <div className="score-copy">
        <span className="eyebrow"><Target size={15} aria-hidden="true" /> BASELINE SKILL COVERAGE</span>
        <h2 id="score-title">{score === null ? 'Not calculated' : `${score}%`}</h2>
        <p>{score === null ? 'No skills from the current catalog were recognized in the job description.' : 'Share of recognized job-description skills also mentioned in your resume.'}</p>
        <div className="score-bar" role="img" aria-label={score === null ? 'Score not calculated' : `${score}% baseline skill coverage`}>
          <span style={{ width: `${score ?? 0}%` }} />
        </div>
      </div>
      <div className="score-stats" aria-label="Skill counts">
        <div><span className="stat-icon matched"><Check size={16} aria-hidden="true" /></span><strong>{matched_count}</strong><small>matched</small></div>
        <div><span className="stat-icon missing"><FileSearch size={16} aria-hidden="true" /></span><strong>{not_found_count}</strong><small>not found</small></div>
        <div><span className="stat-icon total"><CircleHelp size={16} aria-hidden="true" /></span><strong>{required_skill_count}</strong><small>identified</small></div>
      </div>
    </section>
  )
}
