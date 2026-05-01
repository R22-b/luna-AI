import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Welcome', 'Your Name', 'API Keys', 'Ready!'];

export default function SetupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');

  async function completeSetup() {
    if (nickname.trim()) {
      await window.luna?.setProfile({ key: 'nickname', value: nickname });
    }
    await window.luna?.completeSetup();
    navigate('/chat');
  }

  return (
    <div className="h-full flex items-center justify-center bg-black">
      <div className="w-[440px]">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border ${i <= step ? 'bg-luna-primary border-luna-primary text-white' : 'border-luna-border text-luna-text-muted'}`}>{i + 1}</div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-luna-primary' : 'bg-luna-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        {step === 0 && (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-luna-primary/20 border-2 border-luna-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-luna-primary">L</span>
            </div>
            <h2 className="text-2xl font-semibold text-luna-text-primary mb-2">Welcome to Luna AI 🌙</h2>
            <p className="text-sm text-luna-text-muted mb-6">your rebellious AI companion, built by Ravikiran</p>
            <button onClick={() => setStep(1)} className="px-8 py-3 bg-luna-primary text-white rounded-luna hover:bg-luna-primary/80 transition-all">Let's Go</button>
          </div>
        )}

        {step === 1 && (
          <div className="text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-luna-text-primary mb-2">what should I call you?</h2>
            <p className="text-sm text-luna-text-muted mb-6">default is "baddy" — change it anytime</p>
            <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="baddy"
              className="w-full bg-luna-surface border border-luna-border rounded-luna px-4 py-3 text-center text-lg text-luna-text-primary outline-none focus:border-luna-primary/50 mb-4" />
            <button onClick={() => setStep(2)} className="px-8 py-3 bg-luna-primary text-white rounded-luna hover:bg-luna-primary/80">Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-luna-text-primary mb-2">API Keys (optional)</h2>
            <p className="text-sm text-luna-text-muted mb-4">Luna works WITHOUT any keys using Pollinations. Add keys later for faster responses.</p>
            <div className="bg-luna-surface border border-luna-border rounded-luna p-4 mb-4 text-left">
              <div className="space-y-2 text-xs text-luna-text-muted">
                <p>🟢 <strong className="text-green-400">Pollinations</strong> — free, no key needed (active)</p>
                <p>⚪ Groq — fast inference (add key in .env)</p>
                <p>⚪ Gemini — Google AI (add key in .env)</p>
                <p>⚪ OpenRouter, Cohere, Mistral, Together, HF</p>
              </div>
            </div>
            <button onClick={() => setStep(3)} className="px-8 py-3 bg-luna-primary text-white rounded-luna hover:bg-luna-primary/80">Next</button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center animate-fade-in">
            <span className="text-5xl block mb-4">🚀</span>
            <h2 className="text-xl font-semibold text-luna-text-primary mb-2">you're all set{nickname ? `, ${nickname}` : ''}!</h2>
            <p className="text-sm text-luna-text-muted mb-6">Luna is ready. let's build something legendary 🌙</p>
            <button onClick={completeSetup} className="px-8 py-3 bg-luna-primary text-white rounded-luna hover:bg-luna-primary/80">Start Chatting</button>
          </div>
        )}
      </div>
    </div>
  );
}
