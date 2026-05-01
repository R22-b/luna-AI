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
    const match = result.content.match(/\[[\s\S]*\]/);
    const questions = match ? JSON.parse(match[0]) : [];
    return { success: true, questions };
  } catch {
    return { success: true, questions: [], raw: result.content };
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
  const result = await brain.smartCall([{
    role: 'user',
    content: `I want a summary of this YouTube video (ID: ${videoId}, URL: ${url}). Since I can't watch it right now, please provide: 1) What the video is likely about based on the URL, 2) Key topics it might cover, 3) Suggest what to look for when watching. Note: I don't have transcript access, so give your best analysis.`,
  }], 'You are Luna. Be helpful about YouTube content.', 'summarize');

  return { success: true, summary: result.content, videoId, title: `YouTube: ${videoId}`, providerUsed: result.providerUsed };
}

async function summarizeLink(url) {
  const searchEngine = require('./search-engine');
  return await searchEngine.summarizeLink(url);
}

module.exports = { readPDF, summarizePDF, generateQuestions, feynmanExplain, activeRecall, summarizeYouTube, summarizeLink };
