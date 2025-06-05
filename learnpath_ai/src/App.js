import React, { useState } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * Main App container for LearnPath AI. 
 * Scaffolds the UI into: Top goal input/search bar, visual roadmap area,
 * sidebar for progress and suggestions, and filter controls.
 */
function App() {
  // State for the user's learning goal
  const [goalInput, setGoalInput] = useState('');
  // State for milestones/subtopics generated from the goal
  const [milestones, setMilestones] = useState([]);

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

  // Handle form submit: analyze goal and display milestones
  const handleGoalSubmit = (e) => {
    e.preventDefault();
    const breakdown = mockBreakdownGoal(goalInput);
    setMilestones(breakdown);
  };

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
            style={{display: 'flex', alignItems: 'center', gap: 16}}
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
              <div className="progress-placeholder">Your learning progress will appear here.</div>
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
              <ol style={{margin: 0, padding: 0, listStyle: 'decimal inside', width: '100%'}}>
                {milestones.map((step, idx) => (
                  <li key={idx} style={{marginBottom: '22px', fontSize: '1.13rem', fontWeight: 500}}>
                    <span style={{color: 'var(--secondary)'}}>{step.title}</span>
                    <div style={{color: 'var(--primary)', fontSize: '1rem', fontWeight: 400, marginTop: '3px'}}>
                      {step.description}
                    </div>
                  </li>
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