import React, { useState } from 'react';

const TABS = ['PDF', 'YouTube', 'Link', 'Quiz', 'Feynman'];

export default function StudentPage() {
  const [activeTab, setActiveTab] = useState('Feynman');
  const [loading, setLoading] = useState(false);

  // PDF state
  const [pdfResult, setPdfResult] = useState(null);
  const [pdfPath, setPdfPath] = useState('');

  // YouTube state
  const [ytUrl, setYtUrl] = useState('');
  const [ytResult, setYtResult] = useState(null);

  // Link state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkResult, setLinkResult] = useState(null);

  // Quiz state
  const [quizTopic, setQuizTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);

  // Feynman state
  const [feynmanTopic, setFeynmanTopic] = useState('');
  const [feynmanResult, setFeynmanResult] = useState(null);
  const [userExplanation, setUserExplanation] = useState('');
  const [feedback, setFeedback] = useState(null);

  // ── PDF ─────────────────────────────────────
  async function uploadPDF() {
    const fileResult = await window.luna?.openFileDialog([
      { name: 'PDF Files', extensions: ['pdf'] }
    ]);
    if (!fileResult?.success || !fileResult.path) return;

    setPdfPath(fileResult.path);
    setLoading(true);
    try {
      const res = await window.student?.summarizePDF({ filePath: fileResult.path });
      if (res?.success) {
        setPdfResult({ overview: res.summary || 'no summary available', keyPoints: [], path: fileResult.path });
      } else {
        setPdfResult({ overview: res?.error || 'failed to process PDF', keyPoints: [] });
      }
    } catch (err) {
      setPdfResult({ overview: `failed to process PDF: ${err.message}`, keyPoints: [] });
    }
    setLoading(false);
  }

  // ── YouTube ─────────────────────────────────
  async function summarizeYT() {
    if (!ytUrl.trim()) return;
    setLoading(true);
    try {
      const res = await window.student?.summarizeYouTube({ url: ytUrl });
      if (res?.success) {
        setYtResult({ summary: res.summary || 'no summary available' });
      } else {
        setYtResult({ summary: res?.error || 'failed to summarize video' });
      }
    } catch (err) {
      setYtResult({ summary: `failed: ${err.message}` });
    }
    setLoading(false);
  }

  // ── Link ────────────────────────────────────
  async function summarizeLink() {
    if (!linkUrl.trim()) return;
    setLoading(true);
    try {
      const res = await window.luna?.summarizeLink({ url: linkUrl });
      if (res?.success) {
        setLinkResult({ title: res.title, summary: res.summary, keyPoints: res.keyPoints || [] });
      } else {
        const chatRes = await window.luna?.chat({ message: `summarize this link: ${linkUrl}`, nickname: 'baddy' });
        setLinkResult({ summary: chatRes?.response || 'failed' });
      }
    } catch (err) {
      setLinkResult({ summary: `failed: ${err.message}` });
    }
    setLoading(false);
  }

  // ── Quiz ────────────────────────────────────
  async function generateQuiz() {
    if (!quizTopic.trim()) return;
    setLoading(true);
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setAnswered(null);
    try {
      const res = await window.student?.generateQuestions({ content: quizTopic, count: 5 });
      if (res?.success && Array.isArray(res.questions) && res.questions.length > 0) {
        const normalized = res.questions.map((q) => {
          const opts = Array.isArray(q.options) && q.options.length >= 4
            ? q.options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`)
            : ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'];
          const answerLetter = (q.answer || 'A').toString().trim().charAt(0).toUpperCase();
          return {
            question: q.question || 'Untitled question',
            options: opts,
            answer: ['A', 'B', 'C', 'D'].includes(answerLetter) ? answerLetter : 'A',
          };
        });
        setQuestions(normalized);
      } else {
        setQuestions([{ question: 'Quiz generation failed. Try a different topic.', options: [], answer: '' }]);
      }
    } catch {
      setQuestions([{ question: 'Quiz generation failed. Try again.', options: [], answer: '' }]);
    }
    setLoading(false);
  }

  function answerQuiz(letter) {
    const q = questions[currentQ];
    const correct = letter === q.answer;
    if (correct) setScore(s => s + 1);
    setAnswered({ letter, correct });
  }

  function nextQuestion() {
    setAnswered(null);
    setCurrentQ(c => c + 1);
  }

  // ── Feynman ─────────────────────────────────
  async function feynmanExplain() {
    if (!feynmanTopic.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await window.student?.feynmanExplain({ topic: feynmanTopic });
      if (res?.success) {
        setFeynmanResult({ explanation: res.explanation || 'no explanation available' });
      } else {
        setFeynmanResult({ explanation: res?.error || 'failed to explain this topic' });
      }
    } catch (err) {
      setFeynmanResult({ explanation: `failed: ${err.message}` });
    }
    setLoading(false);
  }

  async function evaluateExplanation() {
    if (!userExplanation.trim()) return;
    setLoading(true);
    try {
      const res = await window.luna?.chat({
        message: `I tried to explain "${feynmanTopic}" in my own words: "${userExplanation}". Evaluate my explanation. Tell me what I got right, what I missed, and give me a score out of 100.`,
        nickname: 'baddy'
      });
      setFeedback(res?.response || 'no feedback');
    } catch (err) {
      setFeedback(`failed: ${err.message}`);
    }
    setLoading(false);
  }

  return (
    <div className="h-full overflow-y-auto bg-black px-8 py-6 flex flex-col">
      <h1 className="text-xl font-semibold text-luna-text-primary mb-1">Student Superpower 📚</h1>
      <p className="text-sm text-luna-text-muted mb-4">Luna helps you study smarter, not harder</p>

      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-luna-border rounded-luna p-8 mt-4">
        <span className="text-5xl block mb-4">🚀</span>
        <h2 className="text-xl font-semibold text-luna-text-primary mb-2">Coming Soon</h2>
        <p className="text-sm text-luna-text-muted text-center max-w-md">
          The Student Superpower features are currently in development. Soon you'll be able to summarize PDFs, YouTube videos, websites, and generate smart quizzes!
        </p>
      </div>
    </div>
  );
}
