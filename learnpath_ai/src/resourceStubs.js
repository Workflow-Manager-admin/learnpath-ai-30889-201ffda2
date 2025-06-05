//
// Stubbed resource aggregation logic for learning steps.
// In a real implementation, these would call APIs (YouTube, Udemy, etc);
// here we generate mock resource objects per "query".
//
/**
 * PUBLIC_INTERFACE
 * Resource object shape: {
 *   title: string,
 *   url: string,
 *   platform: 'YouTube'|'Udemy'|'Coursera'|'edX'|'FreeCodeCamp'|'W3Schools'|'GeeksforGeeks'|'Medium'|'Dev.to'|'GitHub',
 *   type: 'video'|'course'|'article'|'docs',
 *   difficulty: 'Beginner'|'Intermediate'|'Advanced',
 *   estimatedTime: string, // e.g. "1.5 hrs"
 *   rating: number // 1–5 float
 * }
 */

// PUBLIC_INTERFACE
export function fetchYouTubeResources(query) {
  // Pretend to query YouTube API; return top 2 mock videos
  return [
    {
      title: `YouTube: ${query} Crash Course`,
      url: `https://youtube.com/watch?v=${Math.floor(Math.random()*1000000)}`,
      platform: 'YouTube',
      type: 'video',
      difficulty: 'Beginner',
      estimatedTime: '1 hr',
      rating: 4.7
    },
    {
      title: `Learn ${query} - Step by Step Tutorial`,
      url: `https://youtube.com/watch?v=${Math.floor(Math.random()*1000000)}`,
      platform: 'YouTube',
      type: 'video',
      difficulty: 'Intermediate',
      estimatedTime: '1.5 hrs',
      rating: 4.5
    }
  ];
}

// PUBLIC_INTERFACE
export function fetchUdemyResources(query) {
  return [
    {
      title: `Udemy: ${query} Bootcamp`,
      url: `https://udemy.com/course/${query.replace(/\s+/g, "-").toLowerCase()}`,
      platform: 'Udemy',
      type: 'course',
      difficulty: 'Beginner',
      estimatedTime: '6 hrs',
      rating: 4.6
    }
  ];
}

// PUBLIC_INTERFACE
export function fetchCourseraResources(query) {
  return [
    {
      title: `Coursera: ${query} Specialization`,
      url: `https://coursera.org/specializations/${query.replace(/\s+/g, "-").toLowerCase()}`,
      platform: 'Coursera',
      type: 'course',
      difficulty: 'Intermediate',
      estimatedTime: '10+ hrs',
      rating: 4.8
    }
  ];
}

// PUBLIC_INTERFACE
export function fetchEdxResources(query) {
  return [
    {
      title: `edX: Introduction to ${query}`,
      url: `https://edx.org/course/${query.replace(/\s+/g, "-").toLowerCase()}`,
      platform: 'edX',
      type: 'course',
      difficulty: 'Beginner',
      estimatedTime: '8 hrs',
      rating: 4.4
    }
  ];
}

// PUBLIC_INTERFACE
export function fetchFreeCodeCampResources(query) {
  return [
    {
      title: `FreeCodeCamp: ${query} Tutorial`,
      url: `https://freecodecamp.org/news/${query.replace(/\s+/g, "-").toLowerCase()}`,
      platform: 'FreeCodeCamp',
      type: 'article',
      difficulty: 'Beginner',
      estimatedTime: '30 min',
      rating: 4.9
    }
  ];
}

// PUBLIC_INTERFACE
export function fetchW3SchoolsResources(query) {
  return [
    {
      title: `W3Schools: ${query} Documentation`,
      url: `https://w3schools.com/${query.replace(/\s+/g, "").toLowerCase()}/default.asp`,
      platform: 'W3Schools',
      type: 'docs',
      difficulty: 'Beginner',
      estimatedTime: 'Varies',
      rating: 4.3
    }
  ];
}

// PUBLIC_INTERFACE
export function fetchGeeksforGeeksResources(query) {
  return [
    {
      title: `GeeksforGeeks: ${query} Explained`,
      url: `https://geeksforgeeks.org/${query.replace(/\s+/g, "-").toLowerCase()}`,
      platform: 'GeeksforGeeks',
      type: 'article',
      difficulty: 'Intermediate',
      estimatedTime: '20 min',
      rating: 4.0
    }
  ];
}

// PUBLIC_INTERFACE
export function fetchMediumResources(query) {
  return [
    {
      title: `Medium: ${query} Insights`,
      url: `https://medium.com/search?q=${encodeURIComponent(query)}`,
      platform: 'Medium',
      type: 'article',
      difficulty: 'Intermediate',
      estimatedTime: '15 min',
      rating: 4.2
    }
  ];
}

// PUBLIC_INTERFACE
export function fetchDevtoResources(query) {
  return [
    {
      title: `Dev.to: Getting Started with ${query}`,
      url: `https://dev.to/search?q=${encodeURIComponent(query)}`,
      platform: 'Dev.to',
      type: 'article',
      difficulty: 'Beginner',
      estimatedTime: '20 min',
      rating: 4.1
    }
  ];
}

// PUBLIC_INTERFACE
export function fetchGithubResources(query) {
  return [
    {
      title: `GitHub: Example ${query} Project`,
      url: `https://github.com/search?q=${encodeURIComponent(query)}`,
      platform: 'GitHub',
      type: 'code',
      difficulty: 'Intermediate',
      estimatedTime: 'Browse',
      rating: 3.8
    }
  ];
}

/**
 * PUBLIC_INTERFACE
 * Aggregate and dedupe mock resources for a roadmap step.
 * @param {string} stepTitle
 * @returns {Array<Resource>}
 */
export function getMockResourcesForStep(stepTitle) {
  // Synthesize a mix of resources from all platforms; in real-life this would de-dupe, rank, etc.
  return [
    ...fetchYouTubeResources(stepTitle),
    ...fetchUdemyResources(stepTitle),
    ...fetchCourseraResources(stepTitle),
    ...fetchEdxResources(stepTitle),
    ...fetchFreeCodeCampResources(stepTitle),
    ...fetchW3SchoolsResources(stepTitle),
    ...fetchGeeksforGeeksResources(stepTitle),
    ...fetchMediumResources(stepTitle),
    ...fetchDevtoResources(stepTitle),
    ...fetchGithubResources(stepTitle),
  ].slice(0, 6); // only show top 6 for demo
}
