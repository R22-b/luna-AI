// ============================================
// 🌙 LUNA AI — Search Engine
// Real web search via Serper + Brave fallback
// Never opens browser, never fabricates info
// ============================================

const axios = require('axios');
const brain = require('./brain-manager');

// ══════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════

/**
 * Search the web using Serper (primary) or Brave Search (fallback)
 */
async function search(query, numResults = 5) {
  // Try Serper first
  const serperKey = process.env.SERPER_API_KEY;
  if (serperKey) {
    try {
      const res = await axios.post('https://google.serper.dev/search', {
        q: query,
        num: numResults,
      }, {
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('Serper result:', JSON.stringify(res.data.organic?.slice(0,2)));
      const results = (res.data.organic || []).slice(0, numResults).map(item => ({
        title: item.title,
        snippet: item.snippet,
        url: item.link,
        source: 'Serper',
      }));

      if (results.length > 0) {
        return { success: true, results, provider: 'Serper' };
      }
    } catch (err) {
      console.log(`⚠️ Serper failed: ${err.message}`);
    }
  }

  // Fallback: Brave Search
  const braveKey = process.env.BRAVE_SEARCH_KEY;
  if (braveKey) {
    try {
      const res = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        params: { q: query, count: numResults },
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': braveKey,
        },
        timeout: 10000,
      });

      const results = (res.data.web?.results || []).slice(0, numResults).map(item => ({
        title: item.title,
        snippet: item.description,
        url: item.url,
        source: 'Brave',
      }));

      if (results.length > 0) {
        return { success: true, results, provider: 'Brave' };
      }
    } catch (err) {
      console.log(`⚠️ Brave Search failed: ${err.message}`);
    }
  }

  return { success: false, results: [], error: 'no search available — add SERPER_API_KEY or BRAVE_SEARCH_KEY', provider: null };
}

// ══════════════════════════════════════════════
// SEARCH + SUMMARIZE (AI-powered)
// ══════════════════════════════════════════════

/**
 * Search and synthesize results into one clean answer with citations
 */
async function searchAndSummarize(query, aiSystemPrompt = '') {
  const searchResults = await search(query);

  if (!searchResults.success || searchResults.results.length === 0) {
    return {
      success: false,
      answer: "couldn't find anything on that baddy — my search APIs might be down or missing keys 😅",
      sources: [],
      provider: null,
    };
  }

  // Build context from search results
  const context = searchResults.results.map((r, i) =>
    `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.url}`
  ).join('\n\n');

  const systemPrompt = aiSystemPrompt || `You are Luna, a Gen-Z AI assistant. Synthesize the following search results into one clean, comprehensive answer. Cite sources using [1], [2] etc. Be concise but thorough. Use your personality.`;

  const messages = [{
    role: 'user',
    content: `Search query: "${query}"\n\nSearch results:\n${context}\n\nSynthesize these into one clear answer with citations.`,
  }];

  const result = await brain.smartCall(messages, systemPrompt, 'research');

  const sources = searchResults.results.map(r => ({
    title: r.title,
    url: r.url,
  }));

  return {
    success: true,
    answer: result.content,
    sources,
    provider: searchResults.provider,
  };
}

// ══════════════════════════════════════════════
// FETCH PAGE CONTENT
// ══════════════════════════════════════════════

/**
 * Fetch and clean webpage content
 */
async function fetchPageContent(url) {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      maxContentLength: 500000, // 500KB max
    });

    let html = res.data;

    // Basic HTML to text conversion
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')     // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')        // Remove styles
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')            // Remove nav
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')      // Remove header
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')      // Remove footer
      .replace(/<[^>]+>/g, ' ')                               // Remove all HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')                                   // Collapse whitespace
      .trim();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    // Truncate to ~8000 chars for AI context window
    if (text.length > 8000) {
      text = text.substring(0, 8000) + '... [truncated]';
    }

    return { success: true, content: text, title };

  } catch (err) {
    return { success: false, content: null, title: null, error: err.message };
  }
}

/**
 * Fetch webpage content using a hidden Electron background window.
 * This runs JS, renders client-side webapps, and bypasses standard bot-blockers.
 */
async function fetchPageContentElectron(url) {
  try {
    const { BrowserWindow } = require('electron');
    return new Promise((resolve) => {
      let win = new BrowserWindow({
        show: false, // hidden
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: false
        }
      });

      // 12-second load timeout
      const timeout = setTimeout(() => {
        if (win) {
          try { win.destroy(); } catch {}
          resolve({ success: false, error: 'Scraping timeout (12s)' });
        }
      }, 12000);

      win.loadURL(url, {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }).then(async () => {
        try {
          // Wait 1.5s for dynamic elements or framework render
          await new Promise(r => setTimeout(r, 1500));
          if (!win || win.isDestroyed()) return;

          const title = await win.webContents.executeJavaScript('document.title');
          const text = await win.webContents.executeJavaScript('document.body.innerText');

          clearTimeout(timeout);
          try { win.destroy(); } catch {}
          win = null;

          let cleanedText = (text || '').replace(/\s+/g, ' ').trim();
          if (cleanedText.length > 8000) {
            cleanedText = cleanedText.substring(0, 8000) + '... [truncated]';
          }

          resolve({ success: true, content: cleanedText, title });
        } catch (err) {
          clearTimeout(timeout);
          try { if (win) win.destroy(); } catch {}
          resolve({ success: false, error: err.message });
        }
      }).catch((err) => {
        clearTimeout(timeout);
        try { if (win) win.destroy(); } catch {}
        resolve({ success: false, error: err.message });
      });
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Retry fetch via alternative public mirror domains for social links
 * that often block default bot/user-agent requests.
 */
async function fetchPageContentWithFallback(url) {
  // Try Electron background window rendering FIRST (super dynamic, supports JS)
  console.log(`[Luna Scraper] Headless Electron crawling: ${url}`);
  const electronTry = await fetchPageContentElectron(url);
  if (electronTry.success) return electronTry;

  console.log(`[Luna Scraper] Headless failed (${electronTry.error}), falling back to axios static fetch...`);
  const firstTry = await fetchPageContent(url);
  if (firstTry.success) return firstTry;

  const u = new URL(url);
  const host = u.hostname.toLowerCase();
  let mirrorUrl = null;

  if (host.includes('instagram.com')) {
    mirrorUrl = url.replace(/instagram\.com/i, 'ddinstagram.com');
  } else if (host.includes('x.com') || host.includes('twitter.com')) {
    mirrorUrl = url.replace(/(x|twitter)\.com/i, 'fixupx.com');
  } else if (host.includes('tiktok.com')) {
    mirrorUrl = url.replace(/tiktok\.com/i, 'vxtiktok.com');
  }

  if (!mirrorUrl) return firstTry;

  const mirrorTry = await fetchPageContent(mirrorUrl);
  if (mirrorTry.success) {
    return {
      ...mirrorTry,
      title: `${mirrorTry.title} (mirror source)`,
      sourceUrl: mirrorUrl,
    };
  }

  return firstTry;
}

// ══════════════════════════════════════════════
// SUMMARIZE LINK
// ══════════════════════════════════════════════

/**
 * Fetch a URL and summarize its content with AI
 */
async function summarizeLink(url) {
  const page = await fetchPageContentWithFallback(url);

  if (!page.success) {
    return {
      success: false,
      summary: `couldn't fetch that link baddy — ${page.error} 😅`,
      keyPoints: [],
      title: null,
      url,
    };
  }

  const messages = [{
    role: 'user',
    content: `Summarize this webpage content. Provide:
1. A brief summary (2-3 sentences)
2. Key points (bullet list)
3. Any important details

Title: ${page.title}
Content: ${page.content}`,
  }];

  const systemPrompt = 'You are Luna. Summarize web content clearly and concisely. Use your Gen-Z personality. Format with clear sections.';

  const result = await brain.smartCall(messages, systemPrompt, 'summarize');

  return {
    success: true,
    summary: result.content,
    keyPoints: [], // AI includes these in the response
    title: page.title,
    url,
  };
}

// ══════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════

module.exports = {
  search,
  searchAndSummarize,
  fetchPageContent,
  fetchPageContentWithFallback,
  summarizeLink,
};
