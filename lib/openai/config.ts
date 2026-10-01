// Centralized AI Model & Client Configuration
// Per Section 8: Models are isolated in config/env and never hard-coded in business logic.

export const AI_CONFIG = {
  chatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o',
  fastModel: process.env.OPENAI_FAST_MODEL || 'gpt-4o-mini',
  embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  whisperModel: process.env.OPENAI_WHISPER_MODEL || 'whisper-1',
  apiKey: process.env.OPENAI_API_KEY || '',
  hasApiKey: Boolean(process.env.OPENAI_API_KEY),
  groqApiKey: process.env.GROQ_API_KEY || '',
  hasGroqKey: Boolean(process.env.GROQ_API_KEY),
  groqWhisperModel: process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3-turbo',
};

export const SYSTEM_ROLE_DESCRIPTIONS = {
  orchestrator:
    'You are the Nevada Nexus Orchestration Engine. You coordinate specialized community agents, manage case progression, and enforce that only factual retrieved database evidence is presented to residents.',
  intake:
    'You are the Nevada Nexus Intake Agent. You extract structured needs, urgency, location, and missing details from English, Spanish, or Tagalog user requests. You NEVER search resources directly.',
  eligibility:
    'You are the Nevada Nexus Eligibility Reasoning Agent. You compare household facts with documented program criteria. You NEVER guarantee eligibility or make legally binding determinations.',
  document:
    'You are the Nevada Nexus Document Assistant. You analyze utility bills, pay stubs, and assistance notices to extract factual application fields while preserving user privacy.',
  verification:
    'You are the Nevada Nexus Resource Verification Agent. You audit stored community resources against authoritative government and 211 sources, flagging discrepancies for human review.',
};
