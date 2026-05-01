// ============================================
// 🌙 LUNA AI — Emotion Engine
// Real-time tone detection + personality adjustment
// ============================================

function detectEmotion(text) {
  if (!text || typeof text !== 'string') return { emotion: 'neutral', confidence: 50, signals: [] };

  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).length;
  const exclamations = (text.match(/!/g) || []).length;
  const isAllCaps = text === text.toUpperCase() && wordCount > 2;
  const hour = new Date().getHours();
  const signals = [];

  // STRESSED
  const stressWords = ['deadline', "can't", 'help', 'urgent', 'stuck', 'failing', 'stressed', 'panic', 'worried', 'anxiety'];
  const stressHits = stressWords.filter(w => lower.includes(w));
  if (stressHits.length > 0) signals.push(...stressHits.map(w => `word:${w}`));
  if (isAllCaps) signals.push('ALL_CAPS');
  if (exclamations >= 3) signals.push('multiple_exclamations');
  if (wordCount > 40) signals.push('long_message');

  if (stressHits.length >= 1 || (isAllCaps && exclamations >= 3)) {
    return { emotion: 'stressed', confidence: Math.min(90, 50 + stressHits.length * 15), signals };
  }

  // HYPED
  const hypeWords = ["let's go", 'lessgo', 'yesss', 'fire', 'hype', 'amazing', 'awesome', 'perfect', 'crushed it', 'lfg'];
  const hypeHits = hypeWords.filter(w => lower.includes(w));
  if (hypeHits.length > 0 || (exclamations >= 3 && wordCount < 10)) {
    return { emotion: 'hyped', confidence: Math.min(90, 50 + hypeHits.length * 15), signals: hypeHits.map(w => `word:${w}`) };
  }

  // SAD
  const sadWords = ['idk', 'whatever', 'tired', "don't care", 'pointless', 'depressed', 'sad', 'lonely', 'give up'];
  const sadHits = sadWords.filter(w => lower.includes(w));
  if (sadHits.length > 0 && wordCount < 15) {
    return { emotion: 'sad', confidence: Math.min(85, 45 + sadHits.length * 15), signals: sadHits.map(w => `word:${w}`) };
  }

  // FOCUSED
  const hasCode = /```|function |const |let |var |import |class |def |return /.test(text);
  if (hasCode || (wordCount > 30 && exclamations === 0)) {
    return { emotion: 'focused', confidence: hasCode ? 85 : 60, signals: hasCode ? ['code_detected'] : ['detailed_message'] };
  }

  // LAZY
  const lazyWords = ['ugh', 'later', 'tomorrow', "can't be bothered", 'nah', 'meh', 'cba', 'lazy'];
  const lazyHits = lazyWords.filter(w => lower.includes(w));
  if (lazyHits.length > 0) {
    return { emotion: 'lazy', confidence: Math.min(80, 45 + lazyHits.length * 15), signals: lazyHits.map(w => `word:${w}`) };
  }

  // PROCRASTINATING
  const procrastWords = ['what should i', 'random', 'bored', 'entertain', 'joke', 'meme'];
  const procrastHits = procrastWords.filter(w => lower.includes(w));
  if ((hour >= 22 || hour < 6) && procrastHits.length > 0) {
    return { emotion: 'procrastinating', confidence: 70, signals: ['late_night', ...procrastHits.map(w => `word:${w}`)] };
  }

  return { emotion: 'neutral', confidence: 50, signals: [] };
}

function adjustPersonality(emotion) {
  const modifiers = {
    stressed: "Be calmer and more supportive. Focus on solutions. Don't be sarcastic right now.",
    hyped: "Match the energy! Be hype, use more Gen-Z slang, short punchy responses.",
    sad: "Be warmer and gentler. Check in. Offer help without being pushy.",
    lazy: "Be gently teasing and motivating. Light roast energy.",
    focused: "Be concise and precise. No fluff. Just answer directly.",
    procrastinating: "Gently call out the procrastination. Be motivating but not annoying. It's late!",
    neutral: "",
  };
  return modifiers[emotion] || '';
}

module.exports = { detectEmotion, adjustPersonality };
