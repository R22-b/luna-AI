import React, { useEffect, useState, useRef } from 'react';
import { PorcupineWorker } from '@picovoice/porcupine-web';
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';

export default function WakeWordEngine() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [accessKey, setAccessKey] = useState(null);
  const workerRef = useRef(null);
  const isListeningRef = useRef(false);

  // Check settings periodically to pick up key and toggle changes
  useEffect(() => {
    const checkSettings = async () => {
      try {
        const toggleRes = await window.settings?.getKey({ key: 'wakeWordEnabled' });
        const enabled = toggleRes?.success && (toggleRes.value === true || toggleRes.value === 'true');
        
        const keyRes = await window.settings?.getKey({ key: 'PORCUPINE_ACCESS_KEY' });
        const key = keyRes?.success ? keyRes.value : null;

        setIsEnabled(enabled);
        setAccessKey(key);

        // Update global status for TopBar
        window.dispatchEvent(new CustomEvent('wakeWordStatus', { detail: enabled && key ? 'active' : 'disabled' }));
      } catch (err) {
        console.error('Failed to load wake word settings', err);
      }
    };

    checkSettings();
    const interval = setInterval(checkSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize or destroy Porcupine
  useEffect(() => {
    if (isEnabled && accessKey) {
      if (!workerRef.current) {
        initPorcupine();
      }
    } else {
      if (workerRef.current) {
        stopPorcupine();
      }
    }

    return () => { stopPorcupine(); };
  }, [isEnabled, accessKey]);

  async function initPorcupine() {
    try {
      // Using built-in keyword "Computer" as default since "Luna" isn't built-in
      const porcupineWorker = await PorcupineWorker.create(
        accessKey,
        { builtin: "Computer" },
        keywordDetectionCallback
      );
      
      workerRef.current = porcupineWorker;
      await WebVoiceProcessor.subscribe(porcupineWorker);
      isListeningRef.current = true;
      console.log('🎤 Wake word engine started');
    } catch (err) {
      console.error('Failed to start Porcupine:', err);
      window.dispatchEvent(new CustomEvent('wakeWordStatus', { detail: 'error' }));
    }
  }

  async function stopPorcupine() {
    try {
      if (workerRef.current) {
        await WebVoiceProcessor.unsubscribe(workerRef.current);
        workerRef.current.terminate();
        workerRef.current = null;
        isListeningRef.current = false;
        console.log('🎤 Wake word engine stopped');
      }
    } catch (err) {
      console.error('Error stopping Porcupine:', err);
    }
  }

  function keywordDetectionCallback(keywordLabel) {
    if (!isListeningRef.current) return;
    
    console.log(`🎤 Wake word detected: ${keywordLabel}`);
    
    // Pause listening to prevent conflicts with STT
    isListeningRef.current = false;
    if (workerRef.current) {
      WebVoiceProcessor.unsubscribe(workerRef.current).catch(console.error);
    }

    // Trigger TalkMode
    window.location.hash = '#/chat';
    setTimeout(() => {
      const talkBtn = document.querySelector('[data-talkmode]');
      if (talkBtn) {
        talkBtn.click();
      } else {
        resumeListening();
      }
    }, 200);

    // Listen for STT to finish to resume wake word
    const resumeHandler = () => {
      resumeListening();
      window.removeEventListener('sttFinished', resumeHandler);
    };
    window.addEventListener('sttFinished', resumeHandler);
    
    // Fallback resume if STT never finishes
    setTimeout(() => {
      window.removeEventListener('sttFinished', resumeHandler);
      resumeListening();
    }, 20000);
  }

  function resumeListening() {
    if (workerRef.current && isEnabled && accessKey && !isListeningRef.current) {
      WebVoiceProcessor.subscribe(workerRef.current)
        .then(() => {
          isListeningRef.current = true;
          console.log('🎤 Wake word engine resumed');
        })
        .catch(console.error);
    }
  }

  return null; // Silent component
}
