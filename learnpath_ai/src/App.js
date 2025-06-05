import React, { useState } from 'react';
import './App.css';
import { getMockResourcesForStep } from './resourceStubs';

/**
 * PUBLIC_INTERFACE
 * Main App container for LearnPath AI.
 * Scaffolds the UI into: Top goal input/search bar, visual roadmap area,
 * sidebar for progress and suggestions, and filter controls.
 */
function App() {
  // State for the user's learning goal
  const [goalInput, setGoalInput] = useState('');
  // State for milestones/subtopics generated from the goal, each with progress & expanded state
  const [milestones, setMilestones] = useState([]);

  // State: Track expanded/collapsed steps by index
  const [expanded, setExpanded] = useState({});

  // State: Track step progress: { idx: 'not_started'|'in_progress'|'completed' }
  const [progress, setProgress] = useState({});

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
  const handleGoalSubmit = (e) => {
    e.preventDefault();
    const breakdown = mockBreakdownGoal(goalInput);
    setMilestones(breakdown);
    // Reset expanded and progress state for new roadmap
    let newProgress = {};
    let newExpanded = {};
    breakdown.forEach((_, idx) => {
      newProgress[idx] = 'not_started';
      newExpanded[idx] = false;
    });
    if (breakdown.length > 0) newExpanded[0] = true; // Expand the first by default
    setProgress(newProgress);
    setExpanded(newExpanded);
  };

  // Toggle expand/collapse for a step
  const toggleExpand = idx => setExpanded(exp => ({ ...exp, [idx]: !exp[idx] }));

  // Cycle status: not_started → in_progress → completed → not_started ...
  const advanceStatus = idx => setProgress(pr => {
    const current = pr[idx] || 'not_started';
    const states = ['not_started', 'in_progress', 'completed'];
    const next = states[(states.indexOf(current) + 1) % states.length];
    return { ...pr, [idx]: next };
  });

  // Calculate overall progress (number completed/total)
  const calculateProgress = () => {
    if (!milestones.length) return { completed: 0, total: 0 };
    let completed = Object.values(progress).filter(x => x === 'completed').length;
    return { completed, total: milestones.length };
  };

  // Step Render: collapsible with progress, title, detail, resource aggregation
  const RoadmapStep = ({ idx, step }) => {
    const status = progress[idx] || 'not_started';
    const expandedStep = expanded[idx];

    // Get mock resources when expanded (for demo it's instant)
    const resourceList = expandedStep ? getMockResourcesForStep(step.title) : [];

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
              <div className="suggestions-placeholder">AI-powered recommendations and tips will show up here.</div>
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
            {/* Simple placeholder filter controls, can be expanded later */}
            <div className="filter-group">
              <label>
                Difficulty:
                <select>
                  <option>All</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>
            </div>
            <div className="filter-group">
              <label>
                Platform:
                <select>
                  <option>All</option>
                  <option>YouTube</option>
                  <option>Udemy</option>
                  <option>Coursera</option>
                  <option>edX</option>
                  <option>FreeCodeCamp</option>
                </select>
              </label>
            </div>
            <div className="filter-group">
              <label>
                Time Available:
                <select>
                  <option>Any</option>
                  <option>&lt; 1 hr/week</option>
                  <option>1-3 hrs/week</option>
                  <option>3-5 hrs/week</option>
                  <option>5+ hrs/week</option>
                </select>
              </label>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;