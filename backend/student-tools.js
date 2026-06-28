// ============================================
// 🌙 LUNA AI — Student Tools
// PDF, YouTube, quiz, Feynman, active recall
// ============================================

const fs = require('fs');
const brain = require('./brain-manager');

async function readPDF(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return { success: true, text: data.text, pageCount: data.numpages, title: data.info?.Title || filePath.split(/[\\/]/).pop() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function summarizePDF(filePath) {
  const pdf = await readPDF(filePath);
  if (!pdf.success) return { success: false, error: pdf.error };

  let text = pdf.text;
  if (text.length > 15000) text = text.substring(0, 15000) + '... [truncated]';

  const result = await brain.smartCall([{
    role: 'user',
    content: `Summarize this document. Provide:\n1. Overview (2-3 sentences)\n2. Key Points (bullet list)\n3. Important Terms\n\nDocument:\n${text}`,
  }], 'You are Luna. Summarize clearly with your Gen-Z personality.', 'summarize');

  return { success: true, summary: result.content, pageCount: pdf.pageCount, title: pdf.title, providerUsed: result.providerUsed };
}

async function generateQuestions(content, count = 10) {
  const result = await brain.smartCall([{
    role: 'user',
    content: `Generate ${count} quiz questions from this content. Mix MCQ (with 4 options) and short answer. Return as JSON array with format: [{"question":"...","type":"mcq","options":["a","b","c","d"],"answer":"...","explanation":"..."}]\n\nContent:\n${content.substring(0, 8000)}`,
  }], 'Generate educational quiz questions. Return valid JSON only.', 'reasoning');

  try {
    const arr = result.content.match(/\[[\s\S]*\]/)?.[0];
    return { success: true, questions: JSON.parse(arr) };
  } catch {
    return { success: false, error: 'Failed to parse questions' };
  }
}

async function feynmanExplain(topic) {
  const result = await brain.smartCall([{
    role: 'user',
    content: `Explain "${topic}" like I'm 10 years old. Use simple analogies. Be Luna — Gen-Z, fun, clear. Include: 1) Simple explanation, 2) Real-world analogy, 3) Why it matters.`,
  }], 'You are Luna. Explain complex topics simply with personality.', 'reasoning');

  return { success: true, explanation: result.content, providerUsed: result.providerUsed };
}

async function activeRecall(topic, userAnswer = null) {
  if (!userAnswer) {
    const result = await brain.smartCall([{
      role: 'user', content: `Generate one quiz question about: ${topic}. Just the question, nothing else.`,
    }], '', 'reasoning');
    return { success: true, question: result.content, phase: 'question' };
  }

  const result = await brain.smartCall([{
    role: 'user',
    content: `Topic: ${topic}\nQuestion was asked, user answered: "${userAnswer}"\nEvaluate: is this correct? Give feedback and a better answer if needed. Score 0-100.`,
  }], 'You are Luna. Give honest, encouraging feedback.', 'reasoning');

  return { success: true, feedback: result.content, phase: 'feedback' };
}

async function summarizeYouTube(url) {
  const videoIdMatch = url.match(/(?:v=|youtu\.be\/|\/v\/|embed\/)([a-zA-Z0-9_-]{11})/);
  if (!videoIdMatch) return { success: false, error: 'invalid YouTube URL' };

  const videoId = videoIdMatch[1];
  try {
    const { YoutubeTranscript } = require('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const text = transcript.map(t => t.text).join(' ');
    
    let content = text;
    if (content.length > 15000) content = content.substring(0, 15000) + '...';

    const result = await brain.smartCall([{
      role: 'user',
      content: `Summarize this YouTube video transcript. Provide:\n1. Overview (2-3 sentences)\n2. Key Takeaways (bullet list)\n3. Action Items (if any)\n\nTranscript:\n${content}`,
    }], 'You are Luna. Summarize this video clearly with your Gen-Z personality.', 'summarize');

    return { success: true, summary: result.content, videoId, title: `YouTube: ${videoId}`, providerUsed: result.providerUsed };
  } catch (err) {
    // Fallback: search-based summary
    const search = require('./search-engine');
    const result = await search.searchAndSummarize(
      `YouTube ${videoId} video content summary`,
      'Summarize what this YouTube video is about.'
    );
    return { success: true, summary: result.answer, providerUsed: 'search-fallback' };
  }
}

async function summarizeLink(url) {
  const searchEngine = require('./search-engine');
  return await searchEngine.summarizeLink(url);
}

module.exports = { readPDF, summarizePDF, generateQuestions, feynmanExplain, activeRecall, summarizeYouTube, summarizeLink };
