const axios = require('axios');
const cheerio = require('cheerio');

// Fetch LeetCode data
const fetchLeetCodeData = async (username) => {
  try {
    if (!username) return null;
    
    const query = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            profile { 
              ranking 
            }
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
          userContestRanking(username: $username) {
            rating
            attendedContestsCount
          }
        }
      `,
      variables: { username }
    };

    const response = await axios.post('https://leetcode.com/graphql', query, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      }
    });

    const matchedUser = response.data?.data?.matchedUser;
    if (!matchedUser) {
      console.log(`LeetCode user ${username} not found`);
      return { solved: 0, contestRating: 0, contestCount: 0 };
    }

    // Get total solved count - look for "All" difficulty or sum Easy+Medium+Hard
    const submissionStats = matchedUser.submitStats.acSubmissionNum;
    let totalSolved = 0;
    
    // First try to find "All" entry
    const allEntry = submissionStats.find(item => item.difficulty === 'All');
    if (allEntry) {
      totalSolved = allEntry.count;
    } else {
      // Fallback: sum Easy, Medium, Hard
      const easy = submissionStats.find(item => item.difficulty === 'Easy')?.count || 0;
      const medium = submissionStats.find(item => item.difficulty === 'Medium')?.count || 0;
      const hard = submissionStats.find(item => item.difficulty === 'Hard')?.count || 0;
      totalSolved = easy + medium + hard;
    }

    const contestRating = Math.round(response.data.data.userContestRanking?.rating || 0);
    const contestCount = response.data.data.userContestRanking?.attendedContestsCount || 0;

    console.log(`LeetCode data for ${username}: solved=${totalSolved}, rating=${contestRating}, contests=${contestCount}`);

    return {
      solved: totalSolved,
      contestRating: contestRating,
      contestCount: contestCount
    };
  } catch (error) {
    console.error(`Error fetching LeetCode data for ${username}:`, error.message);
    return { solved: 0, contestRating: 0, contestCount: 0 };
  }
};

// Fetch GitHub data
const fetchGitHubData = async (username) => {
  try {
    if (!username) return null;
    
    const token = process.env.GITHUB_API_TOKEN;
    const headers = token ? { Authorization: `token ${token}` } : {};

    // Fetch user's repositories
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { 
      headers,
      timeout: 10000
    });

    let totalStars = 0;
    let totalCommits = 0;

    // Calculate total stars
    reposResponse.data.forEach(repo => {
      totalStars += repo.stargazers_count || 0;
    });

    // Better commit counting: Use search API to count commits
    try {
      // Get commits from the past year (more reliable)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const dateString = oneYearAgo.toISOString().split('T')[0];
      
      const commitsResponse = await axios.get(
        `https://api.github.com/search/commits?q=author:${username}+committer-date:>${dateString}&per_page=1`,
        {
          headers: {
            ...headers,
            'Accept': 'application/vnd.github.cloak-preview'
          },
          timeout: 10000
        }
      );
      
      totalCommits = commitsResponse.data.total_count || 0;
      
      // If low count, try getting events
      if (totalCommits < 100) {
        try {
          const eventsResponse = await axios.get(`https://api.github.com/users/${username}/events?per_page=100`, { 
            headers,
            timeout: 10000
          });
          
          // Count push events
          const pushEvents = eventsResponse.data.filter(e => e.type === 'PushEvent');
          const commitCount = pushEvents.reduce((sum, event) => {
            return sum + (event.payload?.commits?.length || 0);
          }, 0);
          
          totalCommits = Math.max(totalCommits, commitCount);
        } catch (eventsErr) {
          console.log('Could not fetch events for commit count');
        }
      }
      
    } catch (commitErr) {
      console.log('Could not fetch commit count via search, using approximation...');
      // Fallback: estimate from repos (each repo averages some commits)
      totalCommits = reposResponse.data.length * 10; // Rough estimate
    }

    // Get PRs count
    let prsCount = 0;
    try {
      const prsResponse = await axios.get(`https://api.github.com/search/issues?q=author:${username}+type:pr`, {
        headers,
        timeout: 10000
      });
      prsCount = prsResponse.data.total_count || 0;
    } catch (err) {
      console.log('Could not fetch PRs count');
    }

    // Get issues count
    let issuesCount = 0;
    try {
      const issuesResponse = await axios.get(`https://api.github.com/search/issues?q=author:${username}+type:issue`, {
        headers,
        timeout: 10000
      });
      issuesCount = issuesResponse.data.total_count || 0;
    } catch (err) {
      console.log('Could not fetch issues count');
    }

    console.log(`GitHub data for ${username}: commits=${totalCommits}, stars=${totalStars}, prs=${prsCount}, issues=${issuesCount}`);
    
    return {
      commits: totalCommits,
      stars: totalStars,
      prs: prsCount,
      issues: issuesCount
    };
  } catch (error) {
    console.error(`Error fetching GitHub data for ${username}:`, error.message);
    return null;
  }
};

// Fetch CodeChef data
const fetchCodeChefData = async (username) => {
  try {
    if (!username) return null;
    
    const response = await axios.get(`https://www.codechef.com/users/${username}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const $ = cheerio.load(response.data);

    // Extract rating
    const rating = Number($('.rating-number').text().trim()) || 0;

    // Extract problems solved - look for "Total Problems Solved"
    let problemsSolved = 0;
    $('.content').find('h3').each((i, el) => {
      if ($(el).text().includes('Total Problems Solved')) {
        const nextText = $(el).next().text();
        const match = nextText.match(/\d+/);
        if (match) {
          problemsSolved = parseInt(match[0]);
        }
      }
    });

    // If not found, try the section approach
    if (problemsSolved === 0) {
      $('section.rating-data-section h3').each((i, el) => {
        const match = $(el).text().match(/\d+/);
        if (match) {
          problemsSolved = parseInt(match[0]);
        }
      });
    }

    // Extract contest count from script tags
    let contestCount = 0;
    const scriptText = $('script')
      .map((i, el) => $(el).html())
      .get()
      .join(' ');

    const contestMatch = scriptText.match(/"contestCount":(\d+)/);
    if (contestMatch) {
      contestCount = parseInt(contestMatch[1]);
    }

    console.log(`CodeChef data for ${username}: solved=${problemsSolved}, rating=${rating}, contests=${contestCount}`);

    return {
      solved: problemsSolved,
      rating: rating,
      contestCount: contestCount
    };
  } catch (error) {
    console.error(`Error fetching CodeChef data for ${username}:`, error.message);
    return { solved: 0, rating: 0, contestCount: 0 };
  }
};

// Fetch HackerRank data
const fetchHackerRankData = async (username) => {
  try {
    if (!username) return null;
    
    const response = await axios.get(`https://www.hackerrank.com/${username}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const $ = cheerio.load(response.data);

    // Count solved challenges from profile stats
    let totalSolved = 0;

    $('.profile-card-stats').find('.stat').each((i, el) => {
      const text = $(el).text();
      const match = text.match(/\d+/);
      if (match) {
        totalSolved += parseInt(match[0]);
      }
    });

    console.log(`HackerRank data for ${username}: solved=${totalSolved}`);

    return {
      solved: totalSolved
    };
  } catch (error) {
    console.error(`Error fetching HackerRank data for ${username}:`, error.message);
    return { solved: 0 };
  }
};

module.exports = {
  fetchLeetCodeData,
  fetchGitHubData,
  fetchCodeChefData,
  fetchHackerRankData
};
