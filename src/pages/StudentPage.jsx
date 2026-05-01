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
    <div className="h-full overflow-y-auto bg-black px-8 py-6">
      <h1 className="text-xl font-semibold text-luna-text-primary mb-1">Student Superpower 📚</h1>
      <p className="text-sm text-luna-text-muted mb-4">Luna helps you study smarter, not harder</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-luna-surface rounded-luna p-1">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 text-xs rounded-luna-sm transition-all ${activeTab === tab ? 'bg-luna-primary text-white' : 'text-luna-text-muted hover:text-luna-text-primary'}`}>{tab}</button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 mb-4 text-luna-text-muted">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-luna-primary animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-luna-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-luna-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <span className="text-sm">Luna is working...</span>
        </div>
      )}

      {/* ── PDF TAB ── */}
      {activeTab === 'PDF' && (
        <div>
          <button onClick={uploadPDF} className="w-full border-2 border-dashed border-luna-border rounded-luna p-8 text-center hover:border-luna-primary/50 transition-colors group cursor-pointer mb-4">
            <span className="text-3xl block mb-2">📄</span>
            <span className="text-sm text-luna-text-muted group-hover:text-luna-text-primary">Click to select a PDF file</span>
            {pdfPath && <p className="text-[10px] text-luna-accent mt-2 truncate">{pdfPath}</p>}
          </button>
          {pdfResult && (
            <div className="bg-luna-surface border border-luna-border rounded-luna p-4">
              <h3 className="text-sm font-medium text-luna-text-primary mb-2">📋 Summary</h3>
              <p className="text-xs text-luna-text-muted whitespace-pre-wrap leading-relaxed">{pdfResult.overview}</p>
            </div>
          )}
        </div>
      )}

      {/* ── YouTube TAB ── */}
      {activeTab === 'YouTube' && (
        <div>
          <div className="flex gap-2 mb-4">
            <input value={ytUrl} onChange={e => setYtUrl(e.target.value)} placeholder="paste YouTube URL..." 
              className="flex-1 bg-luna-surface border border-luna-border rounded-luna px-4 py-3 text-sm text-luna-text-primary outline-none focus:border-luna-primary/50" />
            <button onClick={summarizeYT} disabled={loading} className="px-6 py-3 bg-luna-primary text-white text-sm rounded-luna hover:bg-luna-primary/80 disabled:opacity-50">Summarize</button>
          </div>
          {ytResult && (
            <div className="bg-luna-surface border border-luna-border rounded-luna p-4">
              <h3 className="text-sm font-medium text-luna-text-primary mb-2">📺 Summary</h3>
              <p className="text-xs text-luna-text-muted whitespace-pre-wrap leading-relaxed">{ytResult.summary}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Link TAB ── */}
      {activeTab === 'Link' && (
        <div>
          <div className="flex gap-2 mb-4">
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="paste any URL..." 
              className="flex-1 bg-luna-surface border border-luna-border rounded-luna px-4 py-3 text-sm text-luna-text-primary outline-none focus:border-luna-primary/50" />
            <button onClick={summarizeLink} disabled={loading} className="px-6 py-3 bg-luna-primary text-white text-sm rounded-luna hover:bg-luna-primary/80 disabled:opacity-50">Summarize</button>
          </div>
          {linkResult && (
            <div className="bg-luna-surface border border-luna-border rounded-luna p-4">
              {linkResult.title && <h3 className="text-sm font-medium text-luna-text-primary mb-2">{linkResult.title}</h3>}
              <p className="text-xs text-luna-text-muted whitespace-pre-wrap leading-relaxed">{linkResult.summary}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Quiz TAB ── */}
      {activeTab === 'Quiz' && (
        <div>
          {questions.length === 0 ? (
            <div>
              <div className="flex gap-2 mb-4">
                <input value={quizTopic} onChange={e => setQuizTopic(e.target.value)} placeholder="enter a topic (e.g. JavaScript arrays)..." 
                  className="flex-1 bg-luna-surface border border-luna-border rounded-luna px-4 py-3 text-sm text-luna-text-primary outline-none focus:border-luna-primary/50" />
                <button onClick={generateQuiz} disabled={loading} className="px-6 py-3 bg-luna-primary text-white text-sm rounded-luna hover:bg-luna-primary/80 disabled:opacity-50">Generate Quiz</button>
              </div>
            </div>
          ) : currentQ < questions.length ? (
            <div className="bg-luna-surface border border-luna-border rounded-luna p-6">
              <div className="flex justify-between mb-4">
                <span className="text-xs text-luna-text-muted">Question {currentQ + 1}/{questions.length}</span>
                <span className="text-xs text-luna-accent">Score: {score}/{currentQ}</span>
              </div>
              <p className="text-sm text-luna-text-primary mb-4">{questions[currentQ].question}</p>
              <div className="space-y-2">
                {questions[currentQ].options.map((opt, i) => {
                  const letter = opt.charAt(0);
                  const isAnswered = answered !== null;
                  const isCorrect = letter === questions[currentQ].answer;
                  const isSelected = answered?.letter === letter;
                  return (
                    <button key={i} onClick={() => !isAnswered && answerQuiz(letter)} disabled={isAnswered}
                      className={`w-full text-left px-4 py-3 text-xs rounded-luna-sm border transition-all ${isAnswered ? (isCorrect ? 'border-green-500 bg-green-500/10 text-green-400' : isSelected ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-luna-border text-luna-text-muted') : 'border-luna-border text-luna-text-primary hover:border-luna-primary'}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div className="mt-4 flex justify-between items-center">
                  <span className={`text-sm ${answered.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {answered.correct ? '✅ Correct!' : `❌ Wrong — answer: ${questions[currentQ].answer}`}
                  </span>
                  <button onClick={nextQuestion} className="px-4 py-2 text-xs bg-luna-primary text-white rounded-luna-sm">Next</button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-luna-surface border border-luna-border rounded-luna p-6 text-center">
              <span className="text-4xl block mb-2">🎉</span>
              <h3 className="text-lg text-luna-text-primary mb-1">Quiz Complete!</h3>
              <p className="text-sm text-luna-text-muted mb-4">You scored {score}/{questions.length} ({Math.round(score/questions.length*100)}%)</p>
              <button onClick={() => { setQuestions([]); setQuizTopic(''); }} className="px-4 py-2 text-xs bg-luna-primary text-white rounded-luna-sm">New Quiz</button>
            </div>
          )}
        </div>
      )}

      {/* ── Feynman TAB ── */}
      {activeTab === 'Feynman' && (
        <div>
          <div className="flex gap-2 mb-4">
            <input value={feynmanTopic} onChange={e => setFeynmanTopic(e.target.value)} placeholder="enter any topic (e.g. quantum computing)..."
              className="flex-1 bg-luna-surface border border-luna-border rounded-luna px-4 py-3 text-sm text-luna-text-primary outline-none focus:border-luna-primary/50"
              onKeyDown={e => e.key === 'Enter' && feynmanExplain()} />
            <button onClick={feynmanExplain} disabled={loading} className="px-6 py-3 bg-luna-primary text-white text-sm rounded-luna hover:bg-luna-primary/80 disabled:opacity-50">Explain</button>
          </div>
          {feynmanResult && (
            <div className="space-y-4">
              <div className="bg-luna-surface border border-luna-border rounded-luna p-4">
                <h3 className="text-sm font-medium text-luna-text-primary mb-2">🧠 Luna's Explanation</h3>
                <p className="text-xs text-luna-text-muted whitespace-pre-wrap leading-relaxed italic">{feynmanResult.explanation}</p>
              </div>
              <div className="bg-luna-surface border border-luna-border rounded-luna p-4">
                <h3 className="text-sm font-medium text-luna-text-primary mb-2">✍️ Now explain it back in YOUR words</h3>
                <textarea value={userExplanation} onChange={e => setUserExplanation(e.target.value)} rows={4} placeholder="type your explanation..."
                  className="w-full bg-luna-bg border border-luna-border rounded-luna-sm px-3 py-2 text-xs text-luna-text-primary outline-none focus:border-luna-primary/50 resize-none mb-2" />
                <button onClick={evaluateExplanation} disabled={loading || !userExplanation.trim()} className="px-4 py-2 text-xs bg-luna-accent text-white rounded-luna-sm hover:bg-luna-accent/80 disabled:opacity-50">Evaluate My Answer</button>
              </div>
              {feedback && (
                <div className="bg-luna-surface border border-green-500/30 rounded-luna p-4">
                  <h3 className="text-sm font-medium text-green-400 mb-2">📝 Luna's Feedback</h3>
                  <p className="text-xs text-luna-text-muted whitespace-pre-wrap leading-relaxed">{feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
