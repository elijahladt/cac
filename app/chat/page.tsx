'use client';

import React, { Suspense } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Compass } from 'lucide-react';

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
          <Compass className="w-5 h-5 animate-spin text-civic-700" />
          <span className="text-xs font-semibold">Loading Nevada Nexus Navigator...</span>
        </div>
      }
    >
      <ChatInterface />
    </Suspense>
  );
}
