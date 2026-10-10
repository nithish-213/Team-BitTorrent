import React, { useState } from "react";
import { 
  ChevronLeft, ChevronRight, Play, BookOpen, Target, CheckCircle2, 
  HelpCircle, Layers, Cpu, Compass, Activity, Database, ShieldAlert, Zap, Award
} from "lucide-react";

export default function PresentationDeck({ onJumpToDemo }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);

  const slides = [
    {
      id: "slide_1",
      badge: "Project Proposal & Progress Meeting",
      title: "5A) Context-Aware Application Agent",
      subtitle: "Intelligent In-App Companion for No-Code Business Platforms & Dynamic Dashboards",
      speakerNotes: "Opening slide: Introduce the core vision — transforming complex no-code SaaS platforms into natural language driven intelligent systems that navigate, configure UI state, and reason analytically.",
      render: () => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", height: "100%", alignItems: "center" }}>
          <div>
            <div className="badge-pill indigo" style={{ marginBottom: "16px" }}>
              <Zap size={14} /> Agentic AI Presentation
            </div>
            <h1 className="gradient-text" style={{ fontSize: "40px", lineHeight: "1.2", marginBottom: "20px", fontFamily: "var(--font-heading)" }}>
              Context-Aware Application Agent
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: "1.6", marginBottom: "28px" }}>
              An autonomous conversational assistant embedded directly into enterprise no-code platforms. It parses natural language intent, operates dynamic navigation hierarchy, configures multi-column grid filters & date ranges, and performs traceable period-over-period analytical reasoning.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn-primary" onClick={onJumpToDemo}>
                <Play size={16} /> Launch Live Prototype Sandbox
              </button>
              <button className="btn-secondary" onClick={() => setCurrentSlide(1)}>
                <BookOpen size={16} /> View Proposal Slides
              </button>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: "28px", borderLeft: "4px solid var(--accent-primary)" }}>
            <h3 style={{ marginBottom: "16px", fontFamily: "var(--font-heading)", color: "#a5b4fc" }}>Mentor Meeting Focus Areas:</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-muted)", fontSize: "14.5px" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} color="#34d399" /> <strong>Problem & Proposed Approach</strong>: Metadata Graph + RAG Orchestrator
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} color="#34d399" /> <strong>Key Performance Indicators</strong>: Accuracy, UI-State, Latency, MRR
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} color="#34d399" /> <strong>Expectations & Deliverables</strong>: Browser driver, Guardrail system
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} color="#34d399" /> <strong>Project Progress</strong>: Live Working Demo & Benchmark Suite
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} color="#34d399" /> <strong>Mentor Discussion Questions</strong>: Grounding datasets & production hooks
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "slide_2",
      badge: "Problem Definition",
      title: "Problem Statement & Industry Challenge",
      subtitle: "Why Traditional Chatbots Fail in Dynamic Enterprise No-Code Applications",
      speakerNotes: "Explain the core friction point: Business applications have deep nested page hierarchies, dynamic grid filters, date range parameters, and complex widgets. Standard LLM chatbots only answer textual Q&A without taking actual UI action.",
      render: () => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div className="glass-panel" style={{ padding: "24px", borderColor: "rgba(244, 63, 94, 0.3)" }}>
            <div className="badge-pill rose" style={{ marginBottom: "12px" }}><ShieldAlert size={14} /> Traditional Chatbot Limitation</div>
            <h3 style={{ fontSize: "18px", marginBottom: "12px", color: "#fb7185" }}>Static Q&A Without Application Action</h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "var(--text-muted)", paddingLeft: "20px" }}>
              <li>User must manually locate pages across hundreds of directories.</li>
              <li>Cannot auto-configure date ranges, multi-select filters, or column sorts.</li>
              <li>Prone to hallucination without grounding in platform metadata schemas.</li>
              <li>No audit trail or step-by-step confirmation guardrails for state changes.</li>
            </ul>
          </div>

          <div className="glass-panel" style={{ padding: "24px", borderColor: "rgba(16, 185, 129, 0.3)" }}>
            <div className="badge-pill emerald" style={{ marginBottom: "12px" }}><Zap size={14} /> Our Solution: Context-Aware Agent</div>
            <h3 style={{ fontSize: "18px", marginBottom: "12px", color: "#34d399" }}>Deep In-App Action & Analytical Reasoning</h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "var(--text-muted)", paddingLeft: "20px" }}>
              <li>Understands platform navigation catalog & widget schemas via Knowledge Graph.</li>
              <li>Directly navigates routes and applies UI state parameters automatically.</li>
              <li>Performs multi-step period comparisons (Q3 vs Q2) & likely cause detection.</li>
              <li>Traceable answers directly mapped to active grid and dashboard views.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "slide_3",
      badge: "Architecture & Approach",
      title: "Proposed System Architecture & Dataflow",
      subtitle: "Multi-Layered Agentic Engine: Metadata Graph, Vector Retrieval & Action Orchestrator",
      speakerNotes: "Walk through the four architecture layers: Data/Metadata, Modeling/AI, Orchestration/Actions, and Application UX embedded companion.",
      render: () => (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <div className="glass-panel" style={{ padding: "20px", borderTop: "3px solid #6366f1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#a5b4fc" }}>
              <Database size={18} /> <strong>1. Data/Metadata Layer</strong>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              • Application-metadata Store<br/>
              • Knowledge Graph of pages & widgets<br/>
              • Vector Index<br/>
              • Connector APIs for schemas
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "20px", borderTop: "3px solid #a855f7" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#c084fc" }}>
              <Cpu size={18} /> <strong>2. AI Modeling Layer</strong>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              • LLM Intent Classification<br/>
              • Slot Extraction (filters/dates)<br/>
              • Semantic RAG Metadata Retrieval<br/>
              • Multi-step Analytical Reasoning
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "20px", borderTop: "3px solid #06b6d4" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#67e8f9" }}>
              <Compass size={18} /> <strong>3. Orchestration Layer</strong>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              • Agent Function Controller<br/>
              • Route & Deep-Link Driver<br/>
              • UI-State Filter Configurator<br/>
              • Guardrails & Human Review
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "20px", borderTop: "3px solid #10b981" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#6ee7b7" }}>
              <Layers size={18} /> <strong>4. Application / UX</strong>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              • In-App Conversational Sidecar<br/>
              • Dynamic Summary Cards<br/>
              • Real-time Action Trace Log<br/>
              • Deep-Link Routing Map
            </p>
          </div>
        </div>
      )
    },
    {
      id: "slide_4",
      badge: "KPIs & Benchmark Matrix",
      title: "Key Performance Indicators (KPIs)",
      subtitle: "Empirical Target Metrics & Evaluation System",
      speakerNotes: "Highlight the concrete evaluation metrics required by the problem statement: Intent-to-destination accuracy, UI state correctness, task success rate, latency, and retrieval MRR.",
      render: () => (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
            <div className="glass-panel" style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Intent-to-Destination</div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#34d399", fontFamily: "var(--font-heading)" }}>
                see eval results
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Target: &gt;95%</div>
            </div>

            <div className="glass-panel" style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>UI-State Correctness</div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#38bdf8", fontFamily: "var(--font-heading)" }}>
                see eval results
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Filters, Dates & Sorts</div>
            </div>

            <div className="glass-panel" style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Multi-Step Task Success</div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#c084fc", fontFamily: "var(--font-heading)" }}>
                see eval results
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>End-to-End Execution</div>
            </div>

            <div className="glass-panel" style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Retrieval Quality (MRR@5)</div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#fbbf24", fontFamily: "var(--font-heading)" }}>
                see eval results
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Over 100+ pages</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "slide_5",
      badge: "Expectations & Deliverables",
      title: "Project Deliverables & Milestones Roadmap",
      subtitle: "Phased Execution Plan from Data Schema Ingestion to In-App Companion",
      speakerNotes: "Detail the five key deliverables promised for the solution: Metadata store, agent framework, action drivers, embedded UI, and evaluation benchmarking pipeline.",
      render: () => (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Deliverable Module</th>
                <th>Description & Core Functionality</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. Metadata Knowledge Graph & Vector Store</strong></td>
                <td>Ingestion pipeline for navigation trees, page catalogs, grid schemas, and filter definitions with vector similarity indexing.</td>
                <td><span className="badge-pill emerald">Completed</span></td>
              </tr>
              <tr>
                <td><strong>2. Natural Language Intent & Slot Engine</strong></td>
                <td>Extracts destination page, dynamic filter dropdown options, date range scopes, and sorting directions from unstructured user prompts.</td>
                <td><span className="badge-pill emerald">Completed</span></td>
              </tr>
              <tr>
                <td><strong>3. UI Orchestration & Action Drivers</strong></td>
                <td>Automated router driver updating deep-links and applying active UI filters directly onto pages.</td>
                <td><span className="badge-pill emerald">Completed</span></td>
              </tr>
              <tr>
                <td><strong>4. Analytical Reasoning & Guardrails</strong></td>
                <td>Period comparison engine, top churn contributor isolation, and state-change confirmation dialogs.</td>
                <td><span className="badge-pill emerald">Completed</span></td>
              </tr>
              <tr>
                <td><strong>5. In-App Conversational Sidecar & Benchmarks</strong></td>
                <td>Embedded floating companion widget with live action trace log and empirical evaluation suite.</td>
                <td><span className="badge-pill emerald">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      id: "slide_6",
      badge: "Expected Outcomes",
      title: "Expected Business & Technical Outcomes",
      subtitle: "Transforming Enterprise Platform Usability & Analytical Efficiency",
      speakerNotes: "Explain the tangible impact: eliminating manual multi-click navigation, accelerating executive decision-making, and achieving high action faithfulness.",
      render: () => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ fontSize: "32px", color: "#6366f1", marginBottom: "12px" }}>🚀 80%</div>
            <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Zero-Friction Navigation</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              Users navigate directly to complex multi-nested subdirectories without remembering manual menu paths or URL parameters.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ fontSize: "32px", color: "#a855f7", marginBottom: "12px" }}>⚡ 5x</div>
            <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Faster Analytical Insights</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              Instant period-over-period comparisons with probable root-cause explanations grounded directly in active grids.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ fontSize: "32px", color: "#10b981", marginBottom: "12px" }}>🛡️ 99%+</div>
            <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Action Safety & Trust</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              Zero action hallucination guaranteed through confirmation guardrails for high-risk data exports or state modifications.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "slide_7",
      badge: "Project Progress",
      title: "Current Progress & Prototype Demonstration",
      subtitle: "Functional End-to-End Implementation Ready for Live Meeting Review",
      speakerNotes: "Summarize the tangible progress made so far: We have built a complete working prototype simulating an enterprise platform with major directories, live data grids, dynamic SVG charts, and an embedded agent sidecar.",
      render: () => (
        <div className="glass-panel" style={{ padding: "28px", textAlign: "center" }}>
          <Award size={48} color="#6366f1" style={{ marginBottom: "16px" }} />
          <h2 style={{ fontSize: "24px", marginBottom: "12px", fontFamily: "var(--font-heading)" }}>
            Functional Prototype & Benchmark Engine Built
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "700px", margin: "0 auto 24px auto", fontSize: "15px", lineHeight: "1.6" }}>
            We have developed the complete end-to-end Context-Aware Application Agent application featuring a simulated no-code enterprise portal, metadata RAG retrieval engine, dynamic UI controller, and live benchmark testing suite.
          </p>
          <button className="btn-primary" onClick={onJumpToDemo} style={{ fontSize: "15px", padding: "12px 28px" }}>
            <Play size={18} /> Experience Interactive Working Prototype Sandbox
          </button>
        </div>
      )
    },
    {
      id: "slide_8",
      badge: "Mentor Questions",
      title: "Key Questions & Alignment for Mentors",
      subtitle: "Specific Questions for Guidance in Session",
      speakerNotes: "Walk through specific questions for the mentors to gather guidance on fine-tuning, benchmark expansion, and handling browser automation vs direct API hooks.",
      render: () => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", color: "#a5b4fc", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <HelpCircle size={18} /> 1. Metadata Grounding Strategy
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              What is the recommended approach for standardizing exported no-code platform schemas across multi-tenant environments with thousands of custom fields?
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", color: "#a5b4fc", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <HelpCircle size={18} /> 2. RAG vs Fine-Tuned Intent Parser
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              Should intent and slot classification rely primarily on structured JSON-mode LLM prompts with RAG context, or fine-tuned SLMs for ultra-low latency (&lt;200ms)?
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", color: "#a5b4fc", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <HelpCircle size={18} /> 3. Playwright Automation vs Direct Hook APIs
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              For state manipulation on legacy pages without open APIs, what guardrails best prevent race conditions when using Playwright browser driver actions?
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", color: "#a5b4fc", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <HelpCircle size={18} /> 4. Benchmark Expansion & Evaluation
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              Are there specific synthetic NL-to-UI evaluation benchmarks or RAG corpora recommended for scaling our test suite from 10 to 500+ test cases?
            </p>
          </div>
        </div>
      )
    }
  ];

  const current = slides[currentSlide];

  return (
    <div className="presentation-container">
      <div className="glass-panel slide-wrapper">
        <div className="slide-glow-accent"></div>

        <div>
          <div className="slide-header">
            <span className="slide-badge">{current.badge}</span>
            <div style={{ color: "var(--text-dim)", fontSize: "13px", fontWeight: "600" }}>
              Slide {currentSlide + 1} of {slides.length}
            </div>
          </div>

          <h2 className="slide-title">{current.title}</h2>
          <p className="slide-subtitle">{current.subtitle}</p>

          <div className="slide-content-area">
            {current.render()}
          </div>
        </div>

        <div>
          {showSpeakerNotes && current.speakerNotes && (
            <div className="speaker-notes-box">
              <strong>🎙️ Mentor Meeting Speaker Notes:</strong> {current.speakerNotes}
            </div>
          )}

          <div className="slide-controls-bar">
            <button
              className="btn-secondary"
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
              style={{ fontSize: "12px" }}
            >
              <BookOpen size={14} /> {showSpeakerNotes ? "Hide Speaker Notes" : "Show Speaker Notes"}
            </button>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn-secondary"
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                className="btn-primary"
                disabled={currentSlide === slides.length - 1}
                onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
