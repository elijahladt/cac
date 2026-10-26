'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-slate-500 gap-3">
          <div className="w-6 h-6 animate-spin relative flex items-center justify-center">
            <Image
              src="/logo-mark.png"
              alt="Loading"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="text-xs font-semibold">Loading Nevada Nexus Navigator...</span>
        </div>
      }
    >
      <ChatInterface />
    </Suspense>
  );
}
