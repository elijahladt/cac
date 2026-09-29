'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, RefreshCw, Check, Edit2 } from 'lucide-react';
import { SupportedLanguage } from '@/lib/types';
import { getTranslation } from '@/lib/i18n';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmedText: (text: string) => void;
  language: SupportedLanguage;
}

export function VoiceInputModal({
  isOpen,
  onClose,
  onConfirmedText,
  language,
}: VoiceInputModalProps) {
  const t = getTranslation(language);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [step, setStep] = useState<'record' | 'confirm' | 'edit'>('record');
  const [editableText, setEditableText] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('record');
      setTranscript('');
      setEditableText('');
      setRecordingSeconds(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!isOpen) return null;

  const triggerFallbackDemoSpeech = () => {
    const demo =
      language === 'es'
        ? 'Mi factura de electricidad está muy alta y no tengo suficiente dinero. También necesito comida para mis hijos.'
        : language === 'tl'
        ? 'Mataas ang singil sa kuryente at kailangan ko ng pagkain para sa mga bata.'
        : 'My power might get shut off and I need help getting food for my kids in North Las Vegas.';
    finishRecording(demo);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setTranscript('');

    interface WindowWithSpeech extends Window {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void;
        onerror: () => void;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void;
        onerror: () => void;
        start: () => void;
      };
    }

    const win = typeof window !== 'undefined' ? (window as WindowWithSpeech) : null;
    const SpeechClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechClass) {
      try {
        const recognition = new SpeechClass();
        recognition.lang = language === 'es' ? 'es-US' : language === 'tl' ? 'fil-PH' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          const res = event.results[0][0].transcript;
          finishRecording(res);
        };

        recognition.onerror = () => {
          triggerFallbackDemoSpeech();
        };

        recognition.start();
        return;
      } catch {
        // Fall back below
      }
    }

    // If Web Speech is unsupported or blocked, simulate 3-second recording then fallback
    setTimeout(() => {
      triggerFallbackDemoSpeech();
    }, 2800);
  };

  const finishRecording = (recognizedText: string) => {
    setIsRecording(false);
    setIsTranscribing(true);
    setTimeout(() => {
      setIsTranscribing(false);
      setTranscript(recognizedText);
      setEditableText(recognizedText);
      setStep('confirm');
    }, 400);
  };

  const handleContinue = () => {
    onConfirmedText(transcript);
    onClose();
  };

  const handleSaveEdit = () => {
    onConfirmedText(editableText);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-civic-700">
            <Volume2 className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900">
              {step === 'record' ? 'Speak to Nevada Nexus' : t.voiceConfirmTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Record Mode */}
        {step === 'record' && (
          <div className="text-center py-6 space-y-5">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={isRecording ? () => setIsRecording(false) : startRecording}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition shadow-lg ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse shadow-rose-200 ring-8 ring-rose-100'
                    : 'bg-civic-700 hover:bg-civic-800 text-white shadow-civic-200 hover:scale-105 active:scale-95'
                }`}
              >
                {isRecording ? <Mic className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {isRecording ? t.voiceListening : 'Tap the microphone to speak'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isRecording
                  ? `Recording (${recordingSeconds}s)... speak naturally in ${
                      language === 'es' ? 'Spanish' : language === 'tl' ? 'Tagalog' : 'English'
                    }`
                  : 'Speak about rent, electric bills, groceries, or childcare'}
              </p>
            </div>

            {isTranscribing && (
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-civic-700">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Transcribing audio...</span>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Mode (PRD Section 17) */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">{t.voiceConfirmPrompt}</p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 leading-relaxed italic">
              &ldquo;{transcript}&rdquo;
            </div>

            {/* Buttons: [Continue] [Edit] [Try again] */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={handleContinue}
                className="w-full py-2.5 bg-civic-700 hover:bg-civic-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.voiceBtnContinue}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('edit')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t.voiceBtnEdit}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('record');
                  startRecording();
                }}
                className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.voiceBtnRetry}</span>
              </button>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {step === 'edit' && (
          <div className="space-y-4">
            <label htmlFor="voice-edit" className="text-xs font-semibold text-slate-700 block">
              Edit Transcribed Text
            </label>
            <textarea
              id="voice-edit"
              rows={3}
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-600 shadow-xs"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-bold bg-civic-700 text-white rounded-lg hover:bg-civic-800 shadow-xs"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
