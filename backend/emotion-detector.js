function detectEmotion(message) {
  const lower = message.toLowerCase();
  
  if (/fuck|shit|damn|stupid|idiot|hate|annoying|bad/.test(lower)) return 'angry';
  if (/sad|depressed|cry|lonely|miss|hurt|bad day|tough day|exhausted/.test(lower)) return 'sad';
  if (/happy|love|awesome|great|amazing|yay|excited|best/.test(lower)) return 'happy';
  if (/tired|sleepy|bed|nap|yawn/.test(lower)) return 'tired';
  if (/stress|anxious|nervous|worry|scared/.test(lower)) return 'stressed';
  if (/thank|thx|appreciate|helpful/.test(lower)) return 'grateful';
  if (/haha|lol|lmao|joke|funny/.test(lower)) return 'playful';
  
  return 'neutral';
}

module.exports = { detectEmotion };
