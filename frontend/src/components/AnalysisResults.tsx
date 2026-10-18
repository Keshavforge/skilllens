import { ArrowUpRight, BookOpen, Check, CircleHelp, Download, FileText, Sparkles } from 'lucide-react'
import type { AnalysisResult } from '../types/analysis'
import { downloadReport } from '../services/report'
import { ScoreSummary } from './ScoreSummary'

export function AnalysisResults({ result }: { result: AnalysisResult }) {
  const aiAdvice = result.advice_source === 'ai'
  return (
    <section className="results-section" id="results" aria-labelledby="results-heading" aria-live="polite">
      <div className="section-heading results-heading">
        <div><span className="eyebrow">YOUR ANALYSIS</span><h2 id="results-heading">A clearer picture of your fit.</h2><p>{result.summary}</p></div>
        <button className="button button-secondary" onClick={() => downloadReport(result)}><Download size={17} aria-hidden="true" /> Download report</button>
      </div>
      <ScoreSummary score={result.score} matched_count={result.matched_count} not_found_count={result.not_found_count} required_skill_count={result.required_skill_count} />

      <div className="results-grid">
        <section className="card comparison-card" aria-labelledby="comparison-title">
          <div className="card-heading"><div className="heading-icon indigo"><FileText size={18} aria-hidden="true" /></div><div><h3 id="comparison-title">Skill comparison</h3><p>Catalog mentions and resume evidence</p></div></div>
          <div className="skill-list">
            {result.requirements.length ? result.requirements.map((skill) => (
              <article className="skill-row" key={skill.name}>
                <div className="skill-title-line"><span className={`status-dot ${skill.status === 'matched' ? 'is-matched' : 'is-missing'}`} aria-hidden="true" /><strong>{skill.name}</strong><span className={`skill-status ${skill.status === 'matched' ? 'status-matched' : 'status-missing'}`}>{skill.status === 'matched' ? 'Matched' : 'Not found in resume'}</span></div>
                {skill.evidence && <blockquote>“{skill.evidence}”</blockquote>}
              </article>
            )) : <div className="empty-result"><CircleHelp size={22} aria-hidden="true" /><p>No catalog skills were recognized in this job description, so a coverage score is unavailable.</p></div>}
          </div>
        </section>

        <section className="card advice-card" aria-labelledby="advice-title">
          <div className="card-heading"><div className="heading-icon lavender"><Sparkles size={18} aria-hidden="true" /></div><div><h3 id="advice-title">Suggestions</h3><p>{aiAdvice ? 'Optional AI advice' : 'Practical, rule-based guidance'}</p></div></div>
          <div className={`advice-source ${aiAdvice ? 'source-ai' : 'source-rules'}`}><span className="source-dot" />{aiAdvice ? 'AI-generated' : 'Rule-based'}<span className="source-note">· clearly labeled</span></div>
          <p className="advice-notice">{result.advice_notice}</p>
          <div className="recommendations">{result.recommendations.map((item, index) => <article className="recommendation" key={`${item.title}-${index}`}><h4>{item.title}{item.related_skill && <span className="related-skill">{item.related_skill}</span>}</h4><p>{item.detail}</p></article>)}</div>
          <div className="checklist-block"><h4><Check size={16} aria-hidden="true" /> Resume checklist</h4><ul>{result.resume_checklist.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </section>
      </div>

      <section className="card roadmap-card" aria-labelledby="roadmap-title">
        <div className="card-heading"><div className="heading-icon mint"><BookOpen size={18} aria-hidden="true" /></div><div><h3 id="roadmap-title">Your learning roadmap</h3><p>Small, honest next steps based on this comparison</p></div></div>
        {result.roadmap.length ? <div className="roadmap-list">{result.roadmap.map((step, index) => <article className="roadmap-step" key={`${step.phase}-${step.title}`}><div className="step-number">{String(index + 1).padStart(2, '0')}</div><div className="step-content"><div className="step-meta"><span>{step.phase}</span><span>{step.estimated_time}</span></div><h4>{step.title}</h4>{step.target_skill && <span className="related-skill">{step.target_skill}</span>}<ul>{step.actions.map((action) => <li key={action}>{action}</li>)}</ul></div></article>)}</div> : <p className="empty-result">No roadmap items were returned for this analysis.</p>}
      </section>
      <p className="score-limitation"><ArrowUpRight size={15} aria-hidden="true" /> {result.score_explanation}</p>
    </section>
  )
}
