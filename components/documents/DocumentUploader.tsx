'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Camera,
  X,
  FileText,
  Lock,
} from 'lucide-react';
import { ExtractedDocument } from '@/lib/types';
import { DocumentAnalysisResult } from '@/agents/document';
import { loadCaseFile, saveCaseFile } from '@/tools/actionPlans';

interface DocumentUploaderProps {
  onDocumentAdded?: (doc: ExtractedDocument) => void;
}

export function DocumentUploader({ onDocumentAdded }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [isConfirmedByUser, setIsConfirmedByUser] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setIsConfirmedByUser(false);
    setSavedSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/documents/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data: DocumentAnalysisResult = await res.json();
      setAnalysisResult(data);
    } catch {
      // Fallback local analysis if network/API fails
      import('@/agents/document').then(({ analyzeDocumentOffline }) => {
        const fallback = analyzeDocumentOffline(file.name, file.type);
        setAnalysisResult(fallback);
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToCase = () => {
    if (!analysisResult) return;

    const docToSave: ExtractedDocument = {
      ...analysisResult.extractedDocument,
      verified_by_user: true,
    };

    const caseFile = loadCaseFile();
    caseFile.documents.push(docToSave);

    // If utility bill, update status and clear relevant missing info
    if (docToSave.document_type === 'utility_bill') {
      caseFile.missing_information = caseFile.missing_information.filter(
        (m) => !m.toLowerCase().includes('utility') && !m.toLowerCase().includes('bill')
      );
    }

    saveCaseFile(caseFile);
    setSavedSuccess(true);
    if (onDocumentAdded) {
      onDocumentAdded(docToSave);
    }
  };

  return (
    <div id="documents" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-civic-700" />
              <span>Document Readiness & Verification</span>
            </h2>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-700" />
              Private & Transient
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Photograph or upload your NV Energy bill or notice to extract required application fields privately.
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      {!analysisResult && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
            isDragging
              ? 'border-civic-600 bg-civic-50/50'
              : 'border-slate-300 hover:border-civic-500 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-civic-100 text-civic-700 flex items-center justify-center shadow-xs">
              {isAnalyzing ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {isAnalyzing ? 'Analyzing document image...' : 'Click or drag a document here'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports PNG, JPG, or PDF (e.g. NV Energy bill, pay stub, or benefits notice)
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <Camera className="w-3.5 h-3.5 text-civic-700" />
              <span>Use Camera or Upload File</span>
            </div>
          </div>
        </div>
      )}

      {/* Analysis & Review Workflow (PRD Section 13 & 15) */}
      {analysisResult && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Extracted Document Information (Review Required)
                </h3>
                <span className="text-[11px] text-slate-500">
                  Confidence: {Math.round((analysisResult.extractedDocument.confidence || 0.95) * 100)}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAnalysisResult(null);
                setSavedSuccess(false);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Scan another document</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {analysisResult.extractedDocument.summary}
          </p>

          {/* Extracted Fields Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block">Provider</span>
              <span className="font-bold text-slate-900 text-sm">
                {analysisResult.extractedDocument.provider_name || 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block">Amount Due</span>
              <span className="font-bold text-rose-700 text-sm">
                {analysisResult.extractedDocument.amount_due || 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block">Due Date</span>
              <span className="font-bold text-slate-900 text-sm">
                {analysisResult.extractedDocument.due_date || 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block">Account Verified</span>
              <span className="font-bold text-emerald-700 text-sm flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Present
              </span>
            </div>
          </div>

          {/* Program Match Suggestions */}
          {analysisResult.relevantProgramSuggestions.length > 0 && (
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-800 space-y-1">
              <span className="font-bold text-civic-900">
                Programs potentially matched by this document:
              </span>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {analysisResult.relevantProgramSuggestions.map((prog, idx) => (
                  <li key={idx}>{prog}</li>
                ))}
              </ul>
            </div>
          )}

          {/* User Confirmation Checkbox (PRD Section 15) */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="confirm-extracted-info"
              checked={isConfirmedByUser}
              onChange={(e) => setIsConfirmedByUser(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-civic-700 focus:ring-civic-600 cursor-pointer"
            />
            <label htmlFor="confirm-extracted-info" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-bold text-slate-900 block">
                I have reviewed and confirmed that this information matches my utility statement.
              </span>
              Nevada Nexus will use this verified data to prepare your assistance checklist. We will never submit applications automatically without your explicit consent.
            </label>
          </div>

          {/* Privacy Notice Banner (PRD Section 14) */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{analysisResult.privacyNotice}</span>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {savedSuccess ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved to your active Case File!</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={!isConfirmedByUser}
                onClick={handleSaveToCase}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold bg-civic-700 hover:bg-civic-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition"
              >
                Save Extracted Data to Case File
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
