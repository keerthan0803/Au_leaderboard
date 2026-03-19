const axios = require('axios');
const cheerio = require('cheerio');

// Try to load puppeteer if installed
let puppeteer = null;
try {
  puppeteer = require('puppeteer');
} catch (err) {
  console.log('Puppeteer not installed. HackerRank scraping will be limited.');
}

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

// Fetch GitHub data using web scraping
const fetchGitHubData = async (username) => {
  try {
    if (!username) return null;
    
    let totalCommits = 0;
    let totalStars = 0;
    let prsCount = 0;
    let issuesCount = 0;

    // Use Puppeteer if available (better for dynamic content)
    if (puppeteer) {
      try {
        console.log(`Using Puppeteer for GitHub scraping: ${username}`);
        const browser = await puppeteer.launch({ 
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Go to profile page
        await page.goto(`https://github.com/${username}`, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });
        
        // Wait for contribution calendar to load
        await page.waitForSelector('.js-yearly-contributions', { timeout: 10000 }).catch(() => {});
        
        // Extract contribution count
        const contributionData = await page.evaluate(() => {
          // Try to find the contribution text
          const h2Element = document.querySelector('h2.f4.text-normal.mb-2');
          if (h2Element) {
            const text = h2Element.textContent;
            const match = text.match(/([\d,]+)\s+contributions?/i);
            if (match) {
              return { commits: parseInt(match[1].replace(/,/g, '')) };
            }
          }
          
          // Fallback: count from calendar
          let total = 0;
          const rects = document.querySelectorAll('rect[data-level]');
          rects.forEach(rect => {
            const level = parseInt(rect.getAttribute('data-level')) || 0;
            // Approximate based on level
            if (level === 1) total += 2;
            else if (level === 2) total += 5;
            else if (level === 3) total += 8;
            else if (level === 4) total += 12;
          });
          
          return { commits: total };
        });
        
        totalCommits = contributionData.commits || 0;
        console.log(`Puppeteer found ${totalCommits} contributions for ${username}`);
        
        // Get repository stars - go to repos tab
        await page.goto(`https://github.com/${username}?tab=repositories`, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        
        const starsData = await page.evaluate(() => {
          let stars = 0;
          const starLinks = document.querySelectorAll('a[href*="/stargazers"]');
          starLinks.forEach(link => {
            const text = link.textContent.trim();
            const count = parseInt(text.replace(/,/g, '')) || 0;
            stars += count;
          });
          return { stars };
        });
        
        totalStars = starsData.stars || 0;
        console.log(`Puppeteer found ${totalStars} stars for ${username}`);
        
        await browser.close();
        
        // PRs and Issues are harder to scrape, use approximate values
        prsCount = Math.floor(totalCommits / 50); // Rough estimate
        issuesCount = Math.floor(totalCommits / 100); // Rough estimate
        
      } catch (puppeteerErr) {
        console.log(`Puppeteer failed for ${username}, falling back to axios:`, puppeteerErr.message);
      }
    }
    
    // Fallback to axios/cheerio if Puppeteer not available or failed
    if (totalCommits === 0 && !puppeteer) {
      console.log(`Using axios/cheerio for GitHub (limited functionality): ${username}`);
      try {
        const profileResponse = await axios.get(`https://github.com/${username}`, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
          }
        });

        const $ = cheerio.load(profileResponse.data);
        
        // Try to parse contribution count
        let contributionText = $('h2.f4.text-normal.mb-2').text();
        if (contributionText) {
          const match = contributionText.match(/([\d,]+)\s+contributions?/i);
          if (match) {
            totalCommits = parseInt(match[1].replace(/,/g, ''));
          }
        }
        
        // Count stars
        const reposResponse = await axios.get(`https://github.com/${username}?tab=repositories`, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        
        const $repos = cheerio.load(reposResponse.data);
        $repos('a[href*="/stargazers"]').each((i, elem) => {
          const starText = $repos(elem).text().trim();
          const starCount = parseInt(starText.replace(/,/g, '')) || 0;
          totalStars += starCount;
        });
        
      } catch (fallbackErr) {
        console.log(`Axios fallback failed for ${username}:`, fallbackErr.message);
      }
    }

    console.log(`GitHub data (scraped) for ${username}: commits=${totalCommits}, stars=${totalStars}, prs=${prsCount}, issues=${issuesCount}`);
    
    return {
      commits: totalCommits,
      stars: totalStars,
      prs: prsCount,
      issues: issuesCount
    };
  } catch (error) {
    console.error(`Error scraping GitHub data for ${username}:`, error.message);
    return null;
  }
};

// Fetch CodeChef data
const fetchCodeChefData = async (username) => {
  try {
    if (!username) return null;
    
    // Method 1: Try CodeChef API first (more reliable)
    try {
      const apiResponse = await axios.get(`https://codechef-api.vercel.app/handle/${username}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (apiResponse.data && apiResponse.data.success) {
        const data = apiResponse.data;
        const rating = data.currentRating || 0;
        const problemsSolved = data.stars ? (parseInt(data.stars.split('★').length - 1) * 100) : 0; // Approximate
        
        // Try to extract contest count from rating data
        let contestCount = 0;
        if (data.ratingData && Array.isArray(data.ratingData)) {
          contestCount = data.ratingData.length;
        }

        console.log(`CodeChef API data for ${username}: solved=${problemsSolved}, rating=${rating}, contests=${contestCount}`);
        
        return {
          solved: problemsSolved,
          rating: rating,
          contestCount: contestCount
        };
      }
    } catch (apiError) {
      console.log(`CodeChef API failed for ${username}, trying web scraping...`);
    }

    // Method 2: Fallback to web scraping
    const response = await axios.get(`https://www.codechef.com/users/${username}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const $ = cheerio.load(response.data);

    // Extract rating
    let rating = 0;
    const ratingText = $('.rating-number').text().trim();
    rating = Number(ratingText) || 0;
    
    // Also try alternate selectors
    if (rating === 0) {
      rating = Number($('.rating-header .rating-number').text().trim()) || 0;
    }

    // Extract problems solved - look for "Total Problems Solved"
    let problemsSolved = 0;
    $('.content').find('h3').each((i, el) => {
      const headingText = $(el).text();
      if (headingText.includes('Total Problems Solved') || headingText.includes('Problems Solved')) {
        const nextText = $(el).next().text();
        const match = nextText.match(/\d+/);
        if (match) {
          problemsSolved = parseInt(match[0]);
        }
      }
    });

    // If not found, try the section approach
    if (problemsSolved === 0) {
      $('section.rating-data-section h3, .rating-data-section .problems-solved').each((i, el) => {
        const text = $(el).text();
        const match = text.match(/(\d+)/);
        if (match && text.toLowerCase().includes('problem')) {
          problemsSolved = parseInt(match[1]);
        }
      });
    }

    // Extract contest count - try multiple methods
    let contestCount = 0;
    
    // Method 1: Look for h3 tag with "Contests (number)" pattern (most reliable)
    $('h3').each((i, el) => {
      const text = $(el).text().trim();
      // Match pattern like "Contests (32)" or "Contests(32)"
      const match = text.match(/^Contests\s*\((\d+)\)/i);
      if (match) {
        contestCount = parseInt(match[1]);
        return false; // break
      }
    });
    
    // Method 2: Look in cards_container area for contest info
    if (contestCount === 0) {
      $('.cards_container').parent().find('h3').each((i, el) => {
        const text = $(el).text().trim();
        const match = text.match(/Contests\s*\((\d+)\)/i);
        if (match) {
          contestCount = parseInt(match[1]);
          return false;
        }
      });
    }

    // Method 3: Look for contest participation in script tags (JSON data)
    if (contestCount === 0) {
      const scriptText = $('script')
        .map((i, el) => $(el).html())
        .get()
        .join(' ');

      // Try different patterns that might contain contest count
      const patterns = [
        /"contestCount":(\d+)/,
        /"contests_count":(\d+)/,
        /"contestsAttended":(\d+)/,
        /"totalContests":(\d+)/,
        /"attendedContestsCount":(\d+)/,
        /"ratingData":\[([^\]]+)\]/  // Count items in ratingData array
      ];

      for (const pattern of patterns) {
        const match = scriptText.match(pattern);
        if (match) {
          if (pattern.source.includes('ratingData')) {
            // Count comma-separated items in array
            const items = match[1].split('},{');
            contestCount = items.length;
          } else {
            contestCount = parseInt(match[1]);
          }
          if (contestCount > 0) break;
        }
      }
    }

    // Method 4: Look for any heading with contest count pattern
    if (contestCount === 0) {
      $('h1, h2, h3, h4, .heading, .section-title').each((i, el) => {
        const text = $(el).text().trim();
        const matches = [
          text.match(/Contest[s]?\s*\((\d+)\)/i),
          text.match(/Contest[s]?\s+(?:Participated|Attended)[\s:]*(\d+)/i),
          text.match(/(\d+)\s+(?:Contests?|Contest\s+Participated)/i)
        ];
        
        for (const match of matches) {
          if (match) {
            contestCount = parseInt(match[1]);
            return false; // break outer loop
          }
        }
      });
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
    
    console.log(`Fetching HackerRank data for ${username}...`);

    // Try with Puppeteer first if available (for JavaScript-rendered content)
    if (puppeteer) {
      try {
        const browser = await puppeteer.launch({ 
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log(`Loading HackerRank profile: https://www.hackerrank.com/${username}`);
        await page.goto(`https://www.hackerrank.com/${username}`, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });

        // Wait for content to load
        await page.waitForTimeout(3000);

        const content = await page.content();
        await browser.close();

        const $ = cheerio.load(content);
        let hackosCount = 0;

        // Method 1: Look for hackos-count class
        const hackosElement = $('.hackos-count');
        if (hackosElement.length > 0) {
          const text = hackosElement.text().replace(/\s+/g, ' ').trim();
          console.log(`Found .hackos-count: "${text}"`);
          const match = text.match(/(\d+)/);
          if (match) hackosCount = parseInt(match[1]);
        }

        // Method 2: Search in profile items
        if (hackosCount === 0) {
          $('a[data-analytics*="Hackos"], a[href*="hackos"], .profile-nav-item').each((i, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (text.toLowerCase().includes('hackos')) {
              console.log(`Found hackos text: "${text}"`);
              const match = text.match(/(\d+)/);
              if (match) {
                hackosCount = parseInt(match[1]);
                return false;
              }
            }
          });
        }

        // Method 3: Broad text search
        if (hackosCount === 0) {
          const bodyText = $('body').text();
          const match = bodyText.match(/hackos[\s:]+(\d+)/i);
          if (match) hackosCount = parseInt(match[1]);
        }

        console.log(`HackerRank data (puppeteer) for ${username}: hackos=${hackosCount}`);
        return { solved: hackosCount };

      } catch (puppeteerError) {
        console.error(`Puppeteer failed for ${username}:`, puppeteerError.message);
      }
    }

    // Fallback: Try axios (will likely return 0 for HackerRank)
    console.log('Trying fallback axios method...');
    const response = await axios.get(`https://www.hackerrank.com/${username}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const $ = cheerio.load(response.data);
    let hackosCount = 0;

    // Try to extract from any available data
    const pageText = $('body').text();
    const match = pageText.match(/hackos[\s:]+(\d+)/i);
    if (match) hackosCount = parseInt(match[1]);

    console.log(`HackerRank data (axios) for ${username}: hackos=${hackosCount}`);
    return { solved: hackosCount };

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
