import { type ChangeEvent, type FormEvent, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, CheckCircle2, FileText, LockKeyhole, ScanSearch, ShieldCheck, Sparkles, Upload, X } from 'lucide-react'
import { AnalysisResults } from './components/AnalysisResults'
import { analyzeResume, parseResume } from './services/api'
import type { AnalysisResult } from './types/analysis'

const MIN_TEXT_LENGTH = 40
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export default function App() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [uploadMessage, setUploadMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const canAnalyze = resumeText.trim().length >= MIN_TEXT_LENGTH && jobDescription.trim().length >= MIN_TEXT_LENGTH

  async function onAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setResult(null)
    if (!canAnalyze) {
      setError(`Add at least ${MIN_TEXT_LENGTH} characters of resume text and job-description text.`)
      return
    }
    setIsAnalyzing(true)
    try {
      const response = await analyzeResume(resumeText.trim(), jobDescription.trim())
      setResult(response)
      window.setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Analysis failed. Check the API connection and try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    setUploadMessage('')
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'docx'].includes(extension ?? '')) {
      setError('Choose a PDF or DOCX file.')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('This file is larger than 5 MiB. Choose a smaller PDF or DOCX.')
      return
    }
    setIsParsing(true)
    try {
      const parsed = await parseResume(file)
      setResumeText(parsed.text)
      setResult(null)
      setUploadMessage(`${parsed.filename} parsed — review and edit the extracted text below.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not read this file. Try another file or paste the text.')
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SkillLens home"><span className="brand-mark"><ScanSearch size={20} aria-hidden="true" /></span><span>Skill<span>Lens</span></span></a>
        <nav aria-label="Main navigation"><a href="#workspace">Workspace</a><a href="#how-it-works">How it works</a><a href="#privacy">Privacy</a></nav>
        <a className="header-cta" href="#workspace">Try the analyzer <ArrowRight size={15} aria-hidden="true" /></a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-content">
            <div className="hero-kicker"><span className="kicker-dot" /> A clearer next step for your career</div>
            <h1>See where your skills <span>meet the role.</span></h1>
            <p className="hero-description">Compare your resume with a job description. Get an explainable skill match, evidence from your resume, and a practical plan for what to do next.</p>
            <a className="button button-primary hero-button" href="#workspace">Analyze your resume <ArrowRight size={17} aria-hidden="true" /></a>
            <div className="hero-trust"><span><ShieldCheck size={15} aria-hidden="true" /> No account required</span><span><LockKeyhole size={15} aria-hidden="true" /> Your text isn't saved</span></div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
            <div className="visual-card visual-card-top"><span className="mini-icon"><FileText size={16} /></span><span><b>Resume evidence</b><small>Matched from your text</small></span><CheckCircle2 className="visual-check" size={18} /></div>
            <div className="visual-focus"><div className="focus-ring"><ScanSearch size={38} /></div><span className="focus-label">SKILL MATCH</span><strong>Clear, not mysterious.</strong><small>See the method behind every result.</small></div>
            <div className="visual-card visual-card-bottom"><span className="mini-icon mini-lilac"><Sparkles size={16} /></span><span><b>Next steps</b><small>Practical learning roadmap</small></span><ArrowRight className="visual-arrow" size={18} /></div>
            <div className="floating-dot dot-a" /><div className="floating-dot dot-b" />
          </div>
        </section>

        <section className="workspace-section" id="workspace" aria-labelledby="workspace-title">
          <div className="section-heading workspace-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h2 id="workspace-title">Start with the role you want.</h2><p>Paste or upload your resume, add a job description, and see a transparent comparison.</p></div><span className="private-badge"><LockKeyhole size={14} aria-hidden="true" /> Private by design</span></div>
          <form className="input-grid" onSubmit={onAnalyze} noValidate>
            <section className="input-card" aria-labelledby="resume-input-title">
              <div className="input-card-head"><div className="step-badge">01</div><div><h3 id="resume-input-title">Your resume</h3><p>Paste your text or upload a document</p></div></div>
              <div className="input-actions"><span className="input-label">RESUME CONTENT</span><button type="button" className="upload-button" onClick={() => fileInput.current?.click()} disabled={isParsing}><Upload size={15} aria-hidden="true" />{isParsing ? 'Reading file…' : 'Upload PDF or DOCX'}</button><input ref={fileInput} className="visually-hidden" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onFileSelected} aria-label="Upload resume PDF or DOCX" /></div>
              <label className="visually-hidden" htmlFor="resume-text">Resume text</label>
              <textarea id="resume-text" className="text-input" value={resumeText} onChange={(event) => { setResumeText(event.target.value); setResult(null); setUploadMessage('') }} placeholder="Paste the resume text you want to compare…" minLength={MIN_TEXT_LENGTH} maxLength={80000} aria-describedby="resume-help" />
              <div className="field-meta" id="resume-help"><span>{uploadMessage || 'Text is sent only when you request an analysis.'}</span><span>{resumeText.length.toLocaleString()} / 80,000</span></div>
            </section>

            <section className="input-card" aria-labelledby="job-input-title">
              <div className="input-card-head"><div className="step-badge step-badge-violet">02</div><div><h3 id="job-input-title">Job description</h3><p>Paste the role's responsibilities and requirements</p></div></div>
              <div className="input-actions"><span className="input-label">TARGET ROLE</span><span className="field-hint">At least 40 characters</span></div>
              <label className="visually-hidden" htmlFor="job-description">Job description text</label>
              <textarea id="job-description" className="text-input" value={jobDescription} onChange={(event) => { setJobDescription(event.target.value); setResult(null) }} placeholder="Paste the job description here…" minLength={MIN_TEXT_LENGTH} maxLength={80000} aria-describedby="job-help" />
              <div className="field-meta" id="job-help"><span>Only catalog skills are counted in the baseline score.</span><span>{jobDescription.length.toLocaleString()} / 80,000</span></div>
            </section>

            <div className="form-footer">
              <div className="form-note"><LockKeyhole size={15} aria-hidden="true" /><span>Inputs are processed in memory and aren't stored. <a href="#privacy">Learn about privacy</a></span></div>
              <button type="submit" className="button button-primary analyze-button" disabled={!canAnalyze || isAnalyzing || isParsing}>{isAnalyzing ? <><span className="spinner" /> Analyzing…</> : <>Analyze skill match <ArrowRight size={16} aria-hidden="true" /></>}</button>
            </div>
            {error && <div className="error-banner" role="alert"><span>{error}</span><button type="button" aria-label="Dismiss error" onClick={() => setError('')}><X size={16} /></button></div>}
          </form>
          {!result && <div className="empty-state"><span className="empty-icon"><ArrowDown size={18} aria-hidden="true" /></span><p>Your analysis will appear here after you submit both inputs.</p></div>}
        </section>

        {result && <AnalysisResults result={result} />}

        <section className="how-section" id="how-it-works" aria-labelledby="how-title">
          <div className="section-heading centered-heading"><span className="eyebrow">BUILT FOR CLARITY</span><h2 id="how-title">Useful insight, without the black box.</h2><p>Every result has a method you can inspect and explain.</p></div>
          <div className="how-grid"><article><span className="how-number">01</span><h3>Extract mentions</h3><p>A small, extendable skill catalog looks for whole-word matches and common aliases in both texts.</p></article><article><span className="how-number">02</span><h3>Show the evidence</h3><p>Matched terms link back to a sentence in the supplied resume. Missing means “not found here,” not “you don't have it.”</p></article><article><span className="how-number">03</span><h3>Plan your next step</h3><p>A transparent coverage formula and practical suggestions help you focus. The score is not a hiring prediction.</p></article></div>
        </section>

        <section className="privacy-section" id="privacy" aria-labelledby="privacy-title"><div className="privacy-icon"><ShieldCheck size={22} aria-hidden="true" /></div><div><span className="eyebrow">PRIVACY FIRST</span><h2 id="privacy-title">Your resume stays yours.</h2><p>SkillLens does not save resume text or analyses. Uploads are parsed in memory, then discarded. Optional AI advice sends the text to the server-configured AI provider; if no provider key is set, all advice is rule-based. The report is created in your browser.</p></div></section>
      </main>

      <footer className="site-footer"><a className="brand footer-brand" href="#top"><span className="brand-mark"><ScanSearch size={17} aria-hidden="true" /></span><span>Skill<span>Lens</span></span></a><p>Explainable skill matching, built to help you take the next step.</p><a href="#how-it-works">How the score works <ArrowRight size={14} aria-hidden="true" /></a></footer>
    </div>
  )
}
