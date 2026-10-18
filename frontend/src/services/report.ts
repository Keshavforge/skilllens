import type { AnalysisResult } from '../types/analysis'

function bullets(items: string[]): string {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : '- None'
}

export function buildReport(result: AnalysisResult): string {
  const score = result.score === null ? 'Not calculated (no recognized job skills found)' : `${result.score}%`
  const rows = result.requirements.length
    ? result.requirements.map((skill) => {
        const evidence = skill.evidence ? ` — Evidence: “${skill.evidence}”` : ''
        const status = skill.status === 'matched' ? 'Matched' : 'Not found in supplied resume'
        return `- **${skill.name}** — ${status}${evidence}`
      }).join('\n')
    : '- No skills from the current catalog were recognized in the job description.'
  const roadmap = result.roadmap.length
    ? result.roadmap.map((item) => `### ${item.phase}: ${item.title}\n\n${item.actions.map((action) => `- ${action}`).join('\n')}\n\nEstimated time: ${item.estimated_time}`).join('\n\n')
    : '- No roadmap steps were generated.'

  return [
    '# SkillLens analysis report',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    `## Baseline skill coverage: ${score}`,
    result.score_explanation,
    '',
    `Recognized requirements: ${result.required_skill_count} · Matched: ${result.matched_count} · Not found in supplied resume: ${result.not_found_count}`,
    '',
    '## Skill comparison',
    rows,
    '',
    '## Summary',
    result.summary,
    '',
    `Advice source: ${result.advice_source === 'ai' ? 'AI-generated' : 'Rule-based'}`,
    result.advice_notice,
    '',
    '## Resume suggestions',
    ...result.recommendations.map((item) => `- **${item.title}** — ${item.detail}`),
    '',
    '## Learning roadmap',
    roadmap,
    '',
    '## Resume checklist',
    bullets(result.resume_checklist),
    '',
    '> “Not found” means only that a recognized term was not present in the supplied text. This score is not a hiring probability or a verified measure of proficiency.',
    '',
  ].join('\n')
}

export function downloadReport(result: AnalysisResult): void {
  const blob = new Blob([buildReport(result)], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `skilllens-report-${new Date().toISOString().slice(0, 10)}.md`
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
