'use client';

import React from 'react';
import { CaseFileView } from '@/components/case/CaseFileView';
import { DocumentUploader } from '@/components/documents/DocumentUploader';

export default function CasePage() {
  return (
    <div className="space-y-8">
      <CaseFileView />
      <DocumentUploader />
    </div>
  );
}
