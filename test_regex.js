const message = '"set brightness to 100%"';
let cleanMessage = message.replace(/^["']+|["']+$/g, '').trim();
const lower = cleanMessage.toLowerCase();

const isPcControl = /^(?:(?:ok|yes|please|can you|could you|just|now|hey)\s*(?:luna)?\s*[,:]?\s*|luna\s*[,:]?\s*)*(open|launch|start|run|close|kill)\s/i.test(lower) || /\b(volume|mute|take (a )?screenshot|system info|ram|cpu|shut ?down|restart (my )?(pc|computer)|show running apps|what('s| is) (open|running|my pc ram)|bright|brightness)\b/i.test(lower);

const exactBrightnessMatch = message.match(/(?:set|change).*?bri[a-z]*?(\d+)\s*%/i);

console.log({
  isPcControl,
  exactBrightnessMatch: !!exactBrightnessMatch
});
