import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { getMockResourcesForStep } from './resourceStubs';
import { saveUserProgress, fetchUserProgress } from './firebase';

// Difficulty filter options (display label, filter value pairs)
const DIFFICULTY_OPTS = [
  { label: "All", value: "all" },
  { label: "Beginner", value: "Beginner" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced", value: "Advanced" }
];
const PLATFORM_OPTS = [
  { label: "All", value: "all" },
  { label: "YouTube", value: "YouTube" },
  { label: "Udemy", value: "Udemy" },
  { label: "Coursera", value: "Coursera" },
  { label: "edX", value: "edX" },
  { label: "FreeCodeCamp", value: "FreeCodeCamp" },
  { label: "W3Schools", value: "W3Schools" },
  { label: "GeeksforGeeks", value: "GeeksforGeeks" },
  { label: "Medium", value: "Medium" },
  { label: "Dev.to", value: "Dev.to" },
  { label: "GitHub", value: "GitHub" },
];
const TIME_OPTS = [
  { label: "Any", value: "any" },
  { label: "< 30 min", value: "<30" },
  { label: "30-60 min", value: "30-60" },
  { label: "1-3 hrs", value: "1-3" },
  { label: "3+ hrs", value: "3+" }
];

// Helper to parse estimated time string to match time filters
function getResourceMinutes(raw) {
  // Accepts: "1 hr", "30 min", "1.5 hrs", "6 hrs", "10+ hrs", "Varies", etc.
  if (!raw) return null;
  let s = raw.toLowerCase();
  if (s.includes("varies") || s === "browse") return null; // non-numeric
  if (s.includes("+")) s = s.replace("+", "");
  let mins = 0;
  if (s.includes("hr")) {
    let match = s.match(/([0-9.]+)\s*hr/);
    if (match) mins += parseFloat(match[1]) * 60;
    // Handle also "hr" plus "min"
    let m = s.match(/([0-9]+)\s*min/);
    if (m) mins += parseInt(m[1]);
    return mins;
  } else if (s.includes("min")) {
    let match = s.match(/([0-9.]+)\s*min/);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * Main App container for LearnPath AI.
 * Scaffolds the UI into: Top goal input/search bar, visual roadmap area,
 * sidebar for progress and suggestions, and filter controls.
 * 
 * Progress on each roadmap step is tracked in Firebase per user session.
 */
function App() {
  // State for the user's learning goal
  const [goalInput, setGoalInput] = useState('');
  // State for milestones/subtopics generated from the goal, each with progress & expanded state
  const [milestones, setMilestones] = useState([]);

  // State: Track expanded/collapsed steps by index
  const [expanded, setExpanded] = useState({});

  // State: Track step progress: { idx: 'not_started'|'in_progress'|'completed'|'skipped' }
  const [progress, setProgress] = useState({});

  // Track loading state for progress (while fetching from Firebase)
  const [loadingProgress, setLoadingProgress] = useState(false);

  // FILTER STATE
  // PUBLIC_INTERFACE
  // Filters selected by user. Store as minimal strings, defaults to "all"/"any".
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterTime, setFilterTime] = useState('any');

  // Handlers for filter select controls
  function handleFilterDifficulty(e) {
    setFilterDifficulty(e.target.value);
  }
  function handleFilterPlatform(e) {
    setFilterPlatform(e.target.value);
  }
  function handleFilterTime(e) {
    setFilterTime(e.target.value);
  }
  // Generate a unique session id when the app loads (persist in sessionStorage)
  function getSessionId() {
    let ses = sessionStorage.getItem("lpath_session_id");
    if (!ses) {
      ses = "sess_" + Math.random().toString(36).slice(2, 12) + "_" + Date.now();
      sessionStorage.setItem("lpath_session_id", ses);
    }
    return ses;
  }

  // Placeholder: Step progress states and their colors/icons
  const statusMeta = {
    not_started: {
      label: 'Not Started',
      color: '#ccc',
      icon: <span style={{ marginRight: 7, fontSize: 18, color: '#ccc' }} title="Not started">○</span>
    },
    in_progress: {
      label: 'In Progress',
      color: 'var(--accent)',
      icon: <span style={{ marginRight: 7, fontSize: 18, color: 'var(--accent)' }} title="In progress">⏳</span>
    },
    completed: {
      label: 'Completed',
      color: 'var(--secondary)',
      icon: <span style={{ marginRight: 7, fontSize: 18, color: 'var(--secondary)' }} title="Completed">✔️</span>
    },
    skipped: {
      label: 'Skipped',
      color: '#b27b13',
      icon: <span style={{ marginRight: 7, fontSize: 18, color: '#b27b13' }} title="Skipped">⤼</span>
    }
  };

  /**
   * PUBLIC_INTERFACE
   * Mock/stub: Breaks down the entered goal into milestones/subtopics.
   * In real implementation, would call AI or backend API.
   */
  function mockBreakdownGoal(goalText) {
    // Very simple demo logic; later could use NLP/AI
    if (!goalText || goalText.trim() === '') return [];
    // Demo mappings for a few common goal types, else fallback
    const lower = goalText.toLocaleLowerCase();
    if (lower.includes('react')) {
      return [
        { title: "HTML & CSS Fundamentals", description: "Basics of web markup and styling" },
        { title: "Modern JavaScript (ES6+)", description: "Key ES6 features, arrays, objects" },
        { title: "React Basics", description: "Components, JSX, Props & State" },
        { title: "React Hooks & Advanced Patterns", description: "Hooks (useState, useEffect, etc.), Context" },
        { title: "Building & Deploying Projects", description: "Create React App, project structure, deployment" },
      ];
    }
    if (lower.includes('python')) {
      return [
        { title: "Python Syntax & Variables", description: "Data types, variables, input/output" },
        { title: "Control Structures", description: "if/else, loops, functions, scopes" },
        { title: "Data Structures", description: "Lists, tuples, sets, dictionaries" },
        { title: "Modules & Libraries", description: "Importing, pip, using packages" },
        { title: "Project: Build a Simple App", description: "Hands-on practice project" },
      ];
    }
    // Fallback: Generic learning breakdown
    return [
      { title: "Understand the Basics", description: "Get an overview of the discipline and core concepts." },
      { title: "Learn Fundamental Skills", description: "Master the required foundational skills." },
      { title: "Apply Skills to Projects", description: "Build small projects that reinforce the core ideas." },
      { title: "Advance and Specialize", description: "Delve deeper into important subtopics and best practices." },
      { title: "Capstone: Create Your Own", description: "Demonstrate your learning in a personalized final project." },
    ];
  }

  // Handle form submit: analyze goal and display milestones, reset states
  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    const breakdown = mockBreakdownGoal(goalInput);
    setMilestones(breakdown);

    // Reset expanded and progress state for new roadmap
    let newExpanded = {};
    breakdown.forEach((_, idx) => {
      newExpanded[idx] = false;
    });
    if (breakdown.length > 0) newExpanded[0] = true; // Expand the first by default
    setExpanded(newExpanded);

    // Load progress from Firebase if available
    setLoadingProgress(true);
    const userId = getSessionId();
    let loadedProgress = {};
    try {
      const saved = await fetchUserProgress(userId, goalInput);
      if (saved && typeof saved === "object") {
        // Only use indices found in this roadmap
        for (let i = 0; i < breakdown.length; ++i) {
          loadedProgress[i] = saved[i] || 'not_started';
        }
      } else {
        for (let i = 0; i < breakdown.length; ++i) loadedProgress[i] = 'not_started';
      }
    } catch {
      for (let i = 0; i < breakdown.length; ++i) loadedProgress[i] = 'not_started';
    }
    setProgress(loadedProgress);
    setLoadingProgress(false);
  };

  // Toggle expand/collapse for a step
  const toggleExpand = idx => setExpanded(exp => ({ ...exp, [idx]: !exp[idx] }));

  // Cycle status: not_started → in_progress → completed → skipped → not_started ...
  const advanceStatus = idx => {
    setProgress(pr => {
      const current = pr[idx] || 'not_started';
      const states = ['not_started', 'in_progress', 'completed', 'skipped'];
      const next = states[(states.indexOf(current) + 1) % states.length];
      // Save after update
      const updated = { ...pr, [idx]: next };
      persistProgress(goalInput, updated);
      return updated;
    });
  };

  /**
   * Save progress to Firebase. Assumes sessionId as user.
   */
  async function persistProgress(goalTxt, prog) {
    const userId = getSessionId();
    try {
      await saveUserProgress(userId, goalTxt, prog);
    } catch (e) {
      // Optionally handle error here
      // console.error("Could not save progress", e);
    }
  }

  // Calculate overall progress (number completed/total)
  const calculateProgress = () => {
    if (!milestones.length) return { completed: 0, total: 0 };
    let completed = Object.values(progress).filter(x => x === 'completed').length;
    return { completed, total: milestones.length };
  };

  // On first render: if there's an initial goalInput (maybe prefilled), attempt to load milestones + saved progress.
  useEffect(() => {
    if (goalInput && milestones.length === 0) {
      handleGoalSubmit({ preventDefault: () => {} });
    }
    // eslint-disable-next-line
  }, []);

  // Step Render: collapsible with progress, title, detail, resource aggregation
  const RoadmapStep = ({ idx, step }) => {
    const status = progress[idx] || 'not_started';
    const expandedStep = expanded[idx];

    // Get mock resources when expanded (for demo it's instant)
    let resourceList = expandedStep ? getMockResourcesForStep(step.title) : [];

    // Resource filtering logic
    if (expandedStep) {
      if (filterDifficulty !== "all") {
        resourceList = resourceList.filter(r =>
          (r.difficulty === filterDifficulty)
        );
      }
      if (filterPlatform !== "all") {
        resourceList = resourceList.filter(r =>
          (r.platform === filterPlatform)
        );
      }
      if (filterTime !== "any") {
        resourceList = resourceList.filter(r => {
          const m = getResourceMinutes(r.estimatedTime);
          if (m === null) return false; // Hide "Varies" etc. if filtering
          if (filterTime === "<30") return m < 30;
          if (filterTime === "30-60") return m >= 30 && m <= 60;
          if (filterTime === "1-3") return m > 60 && m <= 180;
          if (filterTime === "3+") return m > 180;
          return true;
        });
      }
    }

    // Utility for badge colors per platform
    const platformColors = {
      YouTube: "#ff3232",
      Udemy: "#57011d",
      Coursera: "#0056d2",
      edX: "#2d6a4f",
      FreeCodeCamp: "#2a6b36",
      W3Schools: "#014a82",
      GeeksforGeeks: "#31792b",
      Medium: "#12100e",
      "Dev.to": "#1a374d",
      GitHub: "#1c1c1c"
    };

    // Display resource meta-info
    const resourceMeta = (res) => (
      <span style={{
        marginLeft: 6,
        fontSize: "0.89em",
        padding: "2px 7px",
        background: platformColors[res.platform] || "#eee",
        color: "#fff",
        borderRadius: 6,
        marginRight: 8,
        letterSpacing: "0.02em"
      }}>{res.platform}</span>
    );

    // Rating stars
    const stars = (r) => "★".repeat(Math.floor(r)) + (r % 1 >= 0.5 ? "½" : "");

    return (
      <li className="roadmap-step" style={{
        background: expandedStep ? "rgba(64,145,108,0.09)" : "#fff",
        border: `1.5px solid var(--border-color)`,
        borderRadius: 10,
        marginBottom: 16,
        boxShadow: expandedStep ? "0 2px 10px 0 rgba(45,106,79,0.07)" : "none",
        padding: "0",
        overflow: "hidden",
        position: "relative"
      }}>
        <button
          className="step-toggle"
          aria-expanded={expandedStep}
          aria-controls={`panel-${idx}`}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            outline: "none",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            padding: "20px 18px 18px 10px",
            textAlign: "left",
            fontWeight: 600,
            fontSize: "1.08rem",
            color: "var(--secondary)"
          }}
          onClick={() => toggleExpand(idx)}
        >
          <span style={{
            marginRight: 16,
            fontSize: 16,
            color: expandedStep ? 'var(--secondary)' : '#cfd8dc',
            flexShrink: 0
          }}>
            {expandedStep ? '▼' : '►'}
          </span>
          {statusMeta[status].icon}
          {step.title}
          <span
            tabIndex={-1}
            onClick={e => { e.stopPropagation(); advanceStatus(idx); }}
            title="Click to update progress"
            style={{
              marginLeft: 'auto',
              background: statusMeta[status].color,
              color: (status === 'not_started' ? "#444" : "#fff"),
              fontWeight: 600,
              fontSize: "0.97rem",
              padding: "4.5px 12px",
              borderRadius: 12,
              minWidth: 70,
              textAlign: 'center',
              marginRight: 4,
              opacity: 0.92,
              cursor: 'pointer',
              border: "none"
            }}
          >
            {statusMeta[status].label}
          </span>
        </button>
        {expandedStep &&
          <div
            id={`panel-${idx}`}
            style={{
              background: "#fff",
              color: "var(--primary)",
              padding: "0 26px 18px 40px"
            }}>
            <div style={{ fontSize: "1rem", fontWeight: 400, margin: "5px 0 10px 0", lineHeight: 1.7 }}>
              {step.description}
            </div>
            <div style={{
              fontSize: "0.95rem",
              margin: "6px 0 0 0",
              color: "var(--primary)",
              borderLeft: "3px solid var(--secondary)",
              padding: "7px 0 7px 20px",
              background: "#f5f7fa",
              borderRadius: "8px"
            }}>
              <strong>Resources:</strong>
              <ul style={{ margin: "10px 0 0 0", paddingLeft: 0 }}>
                {resourceList.length === 0 ? (
                  <li style={{ color: "#888" }}><em>No resources available.</em></li>
                ) : (
                  resourceList.map((res, ri) => (
                    <li key={ri} style={{
                      marginBottom: 9,
                      display: "flex",
                      alignItems: "center",
                      lineHeight: 1.45,
                      fontSize: "0.97em"
                    }}>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "var(--secondary)",
                          textDecoration: "underline",
                          fontWeight: 500,
                          marginRight: 5,
                          maxWidth: 270,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {res.title}
                      </a>
                      {resourceMeta(res)}
                      <span style={{
                        color: "#f5ad00",
                        marginRight: 7,
                        fontSize: "1em"
                      }}>{stars(res.rating)}</span>
                      <span style={{
                        marginRight: 6,
                        fontSize: "0.94em",
                        color: "#28876e"
                      }}>{res.estimatedTime}</span>
                      <span style={{
                        background: "#eee",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        fontSize: "0.9em",
                        color: "#15504c",
                        marginRight: 6
                      }}>{res.type.charAt(0).toUpperCase() + res.type.slice(1)}</span>
                      <span style={{
                        background: "#f6eadd",
                        color: "#7b4e00",
                        borderRadius: "6px",
                        padding: "1px 7px",
                        fontSize: "0.89em"
                      }}>{res.difficulty}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        }
      </li>
    );
  };

  // PUBLIC_INTERFACE
  // Main render
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div className="logo">
            <span className="logo-symbol">*</span> LearnPath AI
          </div>
          {/* Placeholder for global actions/settings */}
        </div>
      </nav>

      <main className="main-container">
        {/* Top: Learning goal/search bar */}
        <section className="goal-input-section">
          <form
            style={{ display: 'flex', alignItems: 'center', gap: 16 }}
            onSubmit={handleGoalSubmit}
          >
            <input
              type="text"
              className="goal-input"
              placeholder="What do you want to learn? (e.g., Become a React developer)"
              aria-label="Enter your learning goal"
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              autoFocus
            />
            <button
              className="btn goal-search-btn"
              type="submit"
              disabled={goalInput.trim() === ''}
            >
              Generate Path
            </button>
          </form>
        </section>

        {/* App Body: Sidebar + Roadmap + Filters */}
        <div className="content-layout">
          {/* Sidebar for Progress/Suggestions */}
          <aside className="sidebar">
            <div className="progress-tracker">
              <h2>Progress</h2>
              {/* Progress summary and steps will be rendered here */}
              {milestones.length === 0 ? (
                <div className="progress-placeholder">Your learning progress will appear here.</div>
              ) : loadingProgress ? (
                <div className="progress-placeholder"><em>Loading saved progress...</em></div>
              ) : (
                <>
                  <div style={{
                    marginBottom: 8,
                    color: "var(--accent)",
                    fontWeight: 600,
                    letterSpacing: "0.01em"
                  }}>
                    {calculateProgress().completed} of {calculateProgress().total} completed
                  </div>
                  <ol style={{ listStyle: 'decimal inside', margin: "0 0 0 10px", padding: 0 }}>
                    {milestones.map((step, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: "1rem",
                          color: "var(--secondary)",
                          marginBottom: "7px",
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                        {statusMeta[progress[idx] || 'not_started'].icon}
                        {step.title}
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
            <div className="smart-suggestions">
              <h2>Suggestions</h2>
              {/* Suggestions area */}
              <SmartSuggestions
                milestones={milestones}
                progress={progress}
                feedback={{}} // Can hook this to a future feedback system
              />
            </div>
          </aside>

          {/* Center: Roadmap visualization */}
          <section className="roadmap-section">
            <h2 className="roadmap-title">Learning Roadmap</h2>
            {/* Render milestones if any, else placeholder */}
            {milestones.length === 0 ? (
              <div className="roadmap-placeholder">
                Your personalized path will be generated here.
              </div>
            ) : (
              <ol style={{
                margin: 0,
                padding: 0,
                width: '100%',
                listStyle: 'none',
                counterReset: 'roadmap-step'
              }}>
                {milestones.map((step, idx) => (
                  <RoadmapStep key={idx} idx={idx} step={step} />
                ))}
              </ol>
            )}
          </section>

          {/* Filters area (side widget or dropdown-like box) */}
          <section className="filters-section">
            <h3>Filters</h3>
            {/* Filter controls - wire up state and handlers */}
            <div className="filter-group">
              <label>
                Difficulty:
                <select value={filterDifficulty} onChange={handleFilterDifficulty}>
                  {DIFFICULTY_OPTS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="filter-group">
              <label>
                Platform:
                <select value={filterPlatform} onChange={handleFilterPlatform}>
                  {PLATFORM_OPTS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="filter-group">
              <label>
                Estimated Time:
                <select value={filterTime} onChange={handleFilterTime}>
                  {TIME_OPTS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/**
 * Stub logic for smart suggestions and intelligent content ranking.
 * Decides which suggestions to show based on progress, milestones, and (optionally) feedback.
 * For demo purposes, uses simple mock logic; in a real solution, would use user data, feedback, ML/AI, etc.
 */
function SmartSuggestions({ milestones, progress, feedback }) {
  // Mock calculation: suggest next incomplete step, recommend refreshing completed or skipped early steps
  if (!milestones?.length) {
    return <div className="suggestions-placeholder">AI-powered recommendations and tips will show up here.</div>;
  }

  // Step progress analysis
  const incompleteIdx = milestones.findIndex((_, idx) =>
    progress[idx] !== "completed"
  );

  const completedCount = Object.values(progress).filter(p => p === "completed").length;
  const skippedCount = Object.values(progress).filter(p => p === "skipped").length;
  const total = milestones.length;

  // Dynamic content ranking stub: rank unfinished resources higher, nudge resume
  let suggestions = [];
  if (completedCount === 0 && incompleteIdx === 0) {
    // Fresh start
    suggestions.push({
      type: "get_started",
      text: `Start with "${milestones[0].title}" to build your foundation!`,
    });
  } else if (incompleteIdx > 0 && incompleteIdx < total) {
    suggestions.push({
      type: "next_step",
      text: `Continue to <strong>${milestones[incompleteIdx].title}</strong> for your next milestone.`,
    });
    if (skippedCount > 0) {
      suggestions.push({
        type: "skipped_reminder",
        text: `Consider revisiting skipped steps to strengthen your understanding.`,
      });
    }
  } else if (completedCount === total) {
    suggestions.push({
      type: "congrats",
      text: "🎉 Fantastic! You've completed your personalized path. Explore advanced topics or review previous steps for mastery.",
    });
  } else if (skippedCount === total) {
    suggestions.push({
      type: "all_skipped",
      text: "You have skipped all steps. You might want to restart or pick a new goal.",
    });
  } else {
    suggestions.push({
      type: "keep_going",
      text: "Keep up the great work! Progress steadily for the best results.",
    });
  }

  // Intelligent content ranking stub: recommend best-rated resource for next step
  let resourceRecommendation = null;
  if (incompleteIdx >= 0 && incompleteIdx < milestones.length) {
    // Fetch and rank mock resources for the recommended step
    try {
      // eslint-disable-next-line no-unused-vars
      const { getMockResourcesForStep } = require("./resourceStubs");
      // fallback for static analysis
      let getResources = getMockResourcesForStep;
      if (!getResources) getResources = window.getMockResourcesForStep;
      const resources = getResources
        ? getResources(milestones[incompleteIdx].title)
        : [];
      if (resources.length) {
        // Rank: highest rating, then lowest estimatedTime, then beginner difficulty
        const ranked = resources
          .slice()
          .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            // Prefer shorter content
            if (typeof a.estimatedTime === "string" && typeof b.estimatedTime === "string") {
              const aMins = parseInt(a.estimatedTime) || 999;
              const bMins = parseInt(b.estimatedTime) || 999;
              if (aMins !== bMins) return aMins - bMins;
            }
            // Prefer beginner
            if (a.difficulty === "Beginner" && b.difficulty !== "Beginner") return -1;
            if (b.difficulty === "Beginner" && a.difficulty !== "Beginner") return 1;
            return 0;
          });
        const topRes = ranked[0];
        resourceRecommendation = topRes;
      }
    } catch (e) {
      // no-op
      resourceRecommendation = null;
    }
  }

  return (
    <div style={{padding: 0, display: "flex", flexDirection: "column", gap: 7}}>
      {suggestions.map((s, i) => (
        <div
          key={s.type + i}
          style={{
            marginBottom: 5,
            fontSize: "0.98em",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 6,
            padding: "9px 12px",
            color: "var(--text-secondary)",
            fontWeight: (s.type === "congrats" ? 700 : 500),
            borderLeft: s.type === "congrats" ? "3px solid var(--accent)" : undefined
          }}
          dangerouslySetInnerHTML={{ __html: s.text }}
        />
      ))}

      {resourceRecommendation && (
        <div
          style={{
            background: "#f5eecc",
            color: "#693d02",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: "0.99em",
            marginTop: 6,
            padding: "10px 13px",
            border: "1px solid #FFD166"
          }}
        >
          <span role="img" aria-label="star" style={{fontSize: "1.15em"}}>⭐️</span>
          Recommended for you:
          <br />
          <a
            href={resourceRecommendation.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--secondary)",
              fontWeight: 700,
              textDecoration: "underline"
            }}
          >
            {resourceRecommendation.title}
          </a>
          <span
            style={{
              marginLeft: 7,
              background: "#40916C",
              color: "#fff",
              fontSize: "0.93em",
              borderRadius: 6,
              padding: "3px 10px",
              fontWeight: 500
            }}>
            {resourceRecommendation.platform}
          </span>
          <span style={{
            background: "#ffeead",
            color: "#7b4e00",
            borderRadius: "6px",
            padding: "2px 8px",
            marginLeft: 6,
            fontSize: "0.92em"
          }}>{resourceRecommendation.difficulty}</span>
          <span style={{
            marginLeft: 7,
            color: "#f2ad00"
          }}>({resourceRecommendation.rating}★)</span>
        </div>
      )}

      {!suggestions.length && !resourceRecommendation && (
        <div className="suggestions-placeholder">
          AI-powered recommendations and tips will show up here.
        </div>
      )}
    </div>
  );
}

export default App;