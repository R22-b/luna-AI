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

      {/* Tabs */}
      <div className="flex space-x-2 mt-4 mb-6 border-b border-luna-border/30 pb-2 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-luna-primary text-white shadow-[0_0_10px_rgba(var(--luna-primary-rgb),0.5)]'
                : 'bg-luna-surface text-luna-text-muted hover:bg-white/5 border border-luna-border'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-luna-surface/50 border border-luna-border rounded-luna p-5 overflow-y-auto">
        
        {/* PDF TAB */}
        {activeTab === 'PDF' && (
          <div className="flex flex-col h-full animate-fade-in">
            <h2 className="text-sm font-medium text-luna-text-primary mb-3">📄 Read & Summarize PDF</h2>
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={uploadPDF}
                disabled={loading}
                className="px-4 py-2 bg-luna-primary text-white text-xs rounded-luna hover:bg-luna-primary/80 disabled:opacity-50"
              >
                {loading ? 'Reading...' : 'Select PDF File'}
              </button>
              {pdfPath && <span className="text-xs text-luna-text-muted truncate max-w-[250px]">{pdfPath}</span>}
            </div>
            
            {pdfResult && (
              <div className="flex-1 bg-black/40 rounded p-4 overflow-y-auto border border-luna-border/50 mt-2">
                <h3 className="text-xs font-semibold text-luna-primary mb-2">Summary</h3>
                <p className="text-sm text-luna-text-primary whitespace-pre-wrap leading-relaxed">{pdfResult.overview}</p>
              </div>
            )}
            {!pdfResult && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 mt-8">
                <span className="text-4xl mb-2">📄</span>
                <p className="text-xs">Upload a PDF to see the magic</p>
              </div>
            )}
          </div>
        )}

        {/* YOUTUBE TAB */}
        {activeTab === 'YouTube' && (
          <div className="flex flex-col h-full animate-fade-in">
            <h2 className="text-sm font-medium text-luna-text-primary mb-3">📺 YouTube Summarizer</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Paste YouTube URL here..."
                value={ytUrl}
                onChange={e => setYtUrl(e.target.value)}
                className="flex-1 bg-black border border-luna-border rounded-luna px-3 py-2 text-sm text-luna-text-primary focus:outline-none focus:border-luna-primary"
              />
              <button 
                onClick={summarizeYT}
                disabled={loading || !ytUrl}
                className="px-4 py-2 bg-luna-primary text-white text-xs rounded-luna hover:bg-luna-primary/80 disabled:opacity-50"
              >
                {loading ? 'Watching...' : 'Summarize'}
              </button>
            </div>
            
            {ytResult && (
              <div className="flex-1 bg-black/40 rounded p-4 overflow-y-auto border border-luna-border/50">
                <h3 className="text-xs font-semibold text-[#FF0000] mb-2">Video Summary</h3>
                <p className="text-sm text-luna-text-primary whitespace-pre-wrap leading-relaxed">{ytResult.summary}</p>
              </div>
            )}
          </div>
        )}

        {/* LINK TAB */}
        {activeTab === 'Link' && (
          <div className="flex flex-col h-full animate-fade-in">
            <h2 className="text-sm font-medium text-luna-text-primary mb-3">🌐 Website Summarizer</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Paste any article or website link..."
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                className="flex-1 bg-black border border-luna-border rounded-luna px-3 py-2 text-sm text-luna-text-primary focus:outline-none focus:border-luna-primary"
              />
              <button 
                onClick={summarizeLink}
                disabled={loading || !linkUrl}
                className="px-4 py-2 bg-luna-primary text-white text-xs rounded-luna hover:bg-luna-primary/80 disabled:opacity-50"
              >
                {loading ? 'Reading...' : 'Summarize'}
              </button>
            </div>
            
            {linkResult && (
              <div className="flex-1 bg-black/40 rounded p-4 overflow-y-auto border border-luna-border/50">
                {linkResult.title && <h3 className="text-sm font-bold text-luna-text-primary mb-2">{linkResult.title}</h3>}
                <p className="text-sm text-luna-text-primary whitespace-pre-wrap leading-relaxed mb-4">{linkResult.summary}</p>
                {linkResult.keyPoints?.length > 0 && (
                  <ul className="list-disc pl-5 text-sm text-luna-text-muted space-y-1">
                    {linkResult.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === 'Quiz' && (
          <div className="flex flex-col h-full animate-fade-in">
            <h2 className="text-sm font-medium text-luna-text-primary mb-3">❓ Active Recall Quiz</h2>
            {questions.length === 0 ? (
              <div className="flex flex-col mt-4">
                <p className="text-xs text-luna-text-muted mb-2">What topic do you want to test yourself on?</p>
                <textarea
                  placeholder="e.g. Mitochondria, World War II, React Context API..."
                  value={quizTopic}
                  onChange={e => setQuizTopic(e.target.value)}
                  className="w-full bg-black border border-luna-border rounded-luna px-3 py-2 text-sm text-luna-text-primary focus:outline-none focus:border-luna-primary h-24 mb-3 resize-none"
                />
                <button 
                  onClick={generateQuiz}
                  disabled={loading || !quizTopic}
                  className="px-4 py-2 bg-luna-primary text-white text-xs rounded-luna hover:bg-luna-primary/80 disabled:opacity-50 self-start"
                >
                  {loading ? 'Generating...' : 'Generate 5 Questions'}
                </button>
              </div>
            ) : (
              currentQ < questions.length ? (
                <div className="flex-1 flex flex-col bg-black/40 rounded p-5 border border-luna-border/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-luna-text-muted">Question {currentQ + 1} of {questions.length}</span>
                    <span className="text-xs font-bold text-luna-primary">Score: {score}</span>
                  </div>
                  <h3 className="text-lg font-medium text-luna-text-primary mb-6">{questions[currentQ].question}</h3>
                  
                  <div className="space-y-3 mb-6">
                    {questions[currentQ].options.map((opt, i) => {
                      const letter = String.fromCharCode(65 + i);
                      let btnClass = "w-full text-left px-4 py-3 rounded-luna text-sm transition-colors border ";
                      
                      if (!answered) {
                        btnClass += "bg-luna-surface border-luna-border hover:border-luna-primary text-luna-text-primary";
                      } else {
                        if (letter === questions[currentQ].answer) {
                          btnClass += "bg-green-500/20 border-green-500 text-green-300"; // Correct answer is always green
                        } else if (letter === answered.letter && !answered.correct) {
                          btnClass += "bg-red-500/20 border-red-500 text-red-300"; // Wrong selected is red
                        } else {
                          btnClass += "bg-black/20 border-luna-border/30 text-luna-text-muted opacity-50"; // Others muted
                        }
                      }
                      
                      return (
                        <button 
                          key={i} 
                          onClick={() => !answered && answerQuiz(letter)}
                          disabled={!!answered}
                          className={btnClass}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  
                  {answered && (
                    <button 
                      onClick={nextQuestion}
                      className="px-6 py-2 bg-luna-primary text-white text-sm rounded-luna hover:bg-luna-primary/80 self-end mt-auto"
                    >
                      {currentQ === questions.length - 1 ? 'Finish Quiz' : 'Next Question ➔'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-black/40 rounded p-5 border border-luna-border/50">
                  <span className="text-5xl mb-4">🏆</span>
                  <h3 className="text-xl font-bold text-luna-text-primary mb-2">Quiz Complete!</h3>
                  <p className="text-luna-text-muted mb-6">You scored {score} out of {questions.length}</p>
                  <button 
                    onClick={() => setQuestions([])}
                    className="px-6 py-2 bg-luna-primary text-white text-sm rounded-luna hover:bg-luna-primary/80"
                  >
                    Try Another Topic
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* FEYNMAN TAB */}
        {activeTab === 'Feynman' && (
          <div className="flex flex-col h-full animate-fade-in">
            <h2 className="text-sm font-medium text-luna-text-primary mb-3">🧠 The Feynman Technique</h2>
            <p className="text-xs text-luna-text-muted mb-4">Learn by explaining. Luna will act as a 10-year-old and grade your explanation.</p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Topic to learn (e.g. Quantum Entanglement)"
                value={feynmanTopic}
                onChange={e => setFeynmanTopic(e.target.value)}
                className="flex-1 bg-black border border-luna-border rounded-luna px-3 py-2 text-sm text-luna-text-primary focus:outline-none focus:border-luna-primary"
              />
              <button 
                onClick={feynmanExplain}
                disabled={loading || !feynmanTopic}
                className="px-4 py-2 bg-luna-surface border border-luna-border text-luna-text-primary text-xs rounded-luna hover:bg-white/5 disabled:opacity-50"
              >
                {loading && !feynmanResult ? 'Thinking...' : 'Get Luna\'s Version'}
              </button>
            </div>
            
            {feynmanResult && (
              <div className="bg-luna-primary/10 border border-luna-primary/30 rounded p-3 mb-4 max-h-[150px] overflow-y-auto">
                <span className="text-[10px] font-bold text-luna-primary uppercase tracking-wider mb-1 block">Luna's Simple Explanation:</span>
                <p className="text-xs text-luna-text-primary">{feynmanResult.explanation}</p>
              </div>
            )}
            
            <div className="flex-1 flex flex-col mb-3">
              <textarea
                placeholder="Now you try! Explain it to me like I'm 10..."
                value={userExplanation}
                onChange={e => setUserExplanation(e.target.value)}
                className="flex-1 bg-black border border-luna-border rounded-luna p-3 text-sm text-luna-text-primary focus:outline-none focus:border-luna-primary resize-none min-h-[120px]"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={evaluateExplanation}
                disabled={loading || !userExplanation || !feynmanTopic}
                className="px-6 py-2 bg-luna-primary text-white text-sm rounded-luna hover:bg-luna-primary/80 disabled:opacity-50"
              >
                {loading && userExplanation ? 'Grading...' : 'Grade My Explanation'}
              </button>
            </div>
            
            {feedback && (
              <div className="bg-black/60 border border-luna-border rounded p-4 mt-4 animate-fade-in overflow-y-auto">
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1 block">Feedback:</span>
                <p className="text-sm text-luna-text-primary whitespace-pre-wrap">{feedback}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
