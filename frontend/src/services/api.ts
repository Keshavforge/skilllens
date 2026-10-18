import type { AnalysisResult, ResumeParseResult } from '../types/analysis'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.error?.message ?? 'The request could not be completed. Please try again.'
    throw new Error(message)
  }
  return payload as T
}

export async function parseResume(file: File): Promise<ResumeParseResult> {
  const body = new FormData()
  body.append('file', file)
  const response = await fetch(`${API_BASE_URL}/api/resume/parse`, { method: 'POST', body })
  return readResponse<ResumeParseResult>(response)
}

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
  })
  return readResponse<AnalysisResult>(response)
}
