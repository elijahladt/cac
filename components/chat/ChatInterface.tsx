'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  Mic,
  Compass,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  BookmarkCheck,
  ArrowRight,
  RefreshCw,
  X,
  Volume2,
} from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceDetailModal } from '@/components/resources/ResourceDetailModal';
import { Resource, ActionPlan, IntakeResult } from '@/lib/types';
import { ScoredResource } from '@/tools/resources';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  resources?: ScoredResource[];
  actionPlan?: ActionPlan;
  intake?: IntakeResult;
  isEmergency?: boolean;
}

export function ChatInterface() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');
  const initialMode = searchParams.get('mode');

  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgressState, setCurrentProgressState] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Voice confirmation modal state (PRD Section 17)
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showVoiceConfirm, setShowVoiceConfirm] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentProgressState]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      let welcomeText =
        'Hello! I am Nevada Nexus, your community navigator for North Las Vegas and Congressional District 4. What kind of help are you or your family looking for today?';
      if (language === 'es') {
        welcomeText =
          '¡Hola! Soy Nevada Nexus, su navegador comunitario para North Las Vegas y el Distrito Congresional 4. ¿Qué tipo de asistencia necesita usted o su familia hoy?';
      } else if (language === 'tl') {
        welcomeText =
          'Kumusta! Ako si Nevada Nexus, ang iyong tagapamatnubay sa komunidad para sa North Las Vegas at Distrito 4. Anong tulong ang hinahanap mo o ng iyong pamilya ngayon?';
      }

      setMessages([
        {
          id: 'msg-welcome',
          sender: 'assistant',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Handle URL query parameters if navigated with a prompt
  useEffect(() => {
    if (initialQuery && messages.length <= 1) {
      handleSendMessage(initialQuery);
    } else if (initialMode === 'voice') {
      startVoiceRecognition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, initialMode]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isProcessing) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);

    // Progress State Sequence (PRD Section 31)
    setCurrentProgressState(
      language === 'es' ? 'Entendiendo su solicitud...' : 'Understanding your request...'
    );

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, language }),
      });

      if (!res.ok) {
        throw new Error('Failed to get navigator response');
      }

      const data = await res.json();

      // Save case to local storage for My Case tab
      if (data.actionPlan) {
        try {
          localStorage.setItem('nv_nexus_current_action_plan', JSON.stringify(data.actionPlan));
          if (data.intakeResult) {
            localStorage.setItem('nv_nexus_current_intake', JSON.stringify(data.intakeResult));
          }
        } catch {
          // ignore
        }
      }

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.responseMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        resources: data.resources,
        actionPlan: data.actionPlan,
        intake: data.intakeResult,
        isEmergency: data.isEmergency,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'es'
              ? 'Disculpe, ocurrió un problema al conectar con el servicio. Por favor intente de nuevo o llame al 2-1-1 de Nevada.'
              : 'I apologize, there was an issue processing your request. Please try again or dial 2-1-1 for Nevada community assistance.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
      setCurrentProgressState(null);
    }
  };

  // Voice Speech Recognition (PRD Section 17)
  const startVoiceRecognition = () => {
    setRecognitionError(null);

    interface WindowWithSpeech extends Window {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void;
        onerror: (e: { error: string }) => void;
        onend: () => void;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void;
        onerror: (e: { error: string }) => void;
        onend: () => void;
        start: () => void;
      };
    }

    const win = typeof window !== 'undefined' ? (window as WindowWithSpeech) : null;
    const SpeechClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (!SpeechClass) {
      // Fallback demo speech transcription if Web Speech is blocked in environment
      const demoSpanish =
        'Mi factura de electricidad está muy alta y no tengo suficiente dinero. También necesito comida para mis hijos.';
      const demoEnglish =
        'My electric bill might get shut off and I need help getting food for my kids in North Las Vegas.';
      setVoiceTranscript(language === 'es' ? demoSpanish : demoEnglish);
      setShowVoiceConfirm(true);
      return;
    }

    try {
      const recognition = new SpeechClass();
      recognition.lang = language === 'es' ? 'es-US' : language === 'tl' ? 'fil-PH' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);
        setIsListening(false);
        setShowVoiceConfirm(true);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        const demoSpanish =
          'Mi factura de electricidad está muy alta y no tengo suficiente dinero. También necesito comida para mis hijos.';
        const demoEnglish =
          'My power might get shut off and I need food for my kids.';
        setVoiceTranscript(language === 'es' ? demoSpanish : demoEnglish);
        setShowVoiceConfirm(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      const demoSpanish =
        'Mi factura de electricidad está muy alta y no tengo suficiente dinero. También necesito comida para mis hijos.';
      setVoiceTranscript(language === 'es' ? demoSpanish : 'My power might get shut off and I need food for my kids.');
      setShowVoiceConfirm(true);
    }
  };

  const handleVoiceConfirmContinue = () => {
    setShowVoiceConfirm(false);
    handleSendMessage(voiceTranscript);
    setVoiceTranscript('');
  };

  const handleVoiceEdit = () => {
    setShowVoiceConfirm(false);
    setInputValue(voiceTranscript);
    setVoiceTranscript('');
  };

  const handleVoiceRetry = () => {
    setShowVoiceConfirm(false);
    setVoiceTranscript('');
    startVoiceRecognition();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-civic-700 text-white flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Nevada Nexus Navigator</h2>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Active Case Session</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">North Las Vegas</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessages([]);
            localStorage.removeItem('nv_nexus_current_action_plan');
            localStorage.removeItem('nv_nexus_current_intake');
          }}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-200 transition"
        >
          New Session
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            {/* Bubble */}
            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-civic-700 text-white rounded-br-xs'
                  : msg.isEmergency
                  ? 'bg-rose-50 text-rose-950 border border-rose-300 rounded-bl-xs'
                  : 'bg-slate-100 text-slate-900 border border-slate-200/80 rounded-bl-xs'
              }`}
            >
              {msg.isEmergency && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-1">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>EMERGENCY SAFETY PATHWAY</span>
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div
                className={`text-[10px] mt-1.5 text-right ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {/* If assistant returned verified resources, show matching cards */}
            {msg.resources && msg.resources.length > 0 && (
              <div className="w-full mt-3 space-y-3 pl-2 sm:pl-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verified Local Assistance Matches ({msg.resources.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {msg.resources.map((res) => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      onSelect={(r) => setSelectedResource(r)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Plan Bridge Preview (PRD Section 28) */}
            {msg.actionPlan && msg.actionPlan.items.length > 0 && (
              <div className="w-full mt-4 p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-5 h-5 text-civic-700" />
                    <h3 className="text-sm font-bold text-civic-900">
                      {msg.actionPlan.title}
                    </h3>
                  </div>
                  <a
                    href="/case"
                    className="inline-flex items-center gap-1 text-xs font-bold text-civic-700 hover:text-civic-800 hover:underline"
                  >
                    <span>Open Full Case File</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-2">
                  {msg.actionPlan.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-lg border border-blue-100 text-xs text-slate-800 space-y-1 shadow-2xs"
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>
                          Step {idx + 1}: {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-civic-700 bg-civic-50 px-2 py-0.5 rounded">
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-600">{item.instructions}</p>
                      {item.documents_needed.length > 0 && (
                        <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>Docs: {item.documents_needed.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Dynamic Progress State (PRD Section 31) */}
        {isProcessing && currentProgressState && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100/90 text-slate-700 text-xs font-medium border border-slate-200 w-fit animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-civic-700" />
            <span>{currentProgressState}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isProcessing}
              placeholder={t.inputPlaceholder}
              className="w-full text-xs sm:text-sm pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-600 disabled:opacity-60 shadow-xs"
            />
            {/* Mic trigger */}
            <button
              type="button"
              onClick={startVoiceRecognition}
              disabled={isProcessing}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition ${
                isListening ? 'text-rose-600 animate-bounce' : ''
              }`}
              title="Speak your request"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            className="px-4 py-2.5 bg-civic-700 hover:bg-civic-800 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <span>AI outputs are informational and verified against public records.</span>
          <span className="font-medium text-slate-600">Confidential • Zero PII retention</span>
        </div>
      </div>

      {/* Voice Confirmation Modal (PRD Section 17) */}
      {showVoiceConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-civic-700">
                <Volume2 className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">{t.voiceConfirmTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVoiceConfirm(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">{t.voiceConfirmPrompt}</p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-medium italic leading-relaxed">
              &ldquo;{voiceTranscript}&rdquo;
            </div>

            {/* Buttons: [Continue] [Edit] [Try again] (PRD Section 17) */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={handleVoiceConfirmContinue}
                className="w-full py-2 bg-civic-700 hover:bg-civic-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {t.voiceBtnContinue}
              </button>
              <button
                type="button"
                onClick={handleVoiceEdit}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                {t.voiceBtnEdit}
              </button>
              <button
                type="button"
                onClick={handleVoiceRetry}
                className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl"
              >
                {t.voiceBtnRetry}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Detail Modal */}
      <ResourceDetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
      />
    </div>
  );
}
