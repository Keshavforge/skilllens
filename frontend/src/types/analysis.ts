export type SkillStatus = 'matched' | 'not_found_in_resume'

export interface SkillResult {
  name: string
  status: SkillStatus
  evidence: string | null
}

export interface Recommendation {
  title: string
  detail: string
  related_skill: string | null
}

export interface RoadmapItem {
  phase: string
  title: string
  actions: string[]
  estimated_time: string
  target_skill: string | null
}

export interface AnalysisResult {
  score: number | null
  score_explanation: string
  summary: string
  required_skill_count: number
  matched_count: number
  not_found_count: number
  requirements: SkillResult[]
  recommendations: Recommendation[]
  roadmap: RoadmapItem[]
  resume_checklist: string[]
  advice_source: 'rule_based' | 'ai'
  advice_notice: string
}

export interface ResumeParseResult {
  filename: string
  text: string
  character_count: number
  note: string
}
