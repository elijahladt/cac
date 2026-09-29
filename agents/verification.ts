import { Resource, VerificationStatus } from '@/lib/types';
import { VERIFIED_RESOURCES } from '@/lib/data/verifiedResources';

export interface AuditReportItem {
  resourceId: string;
  resourceName: string;
  currentStatus: VerificationStatus;
  daysSinceVerification: number;
  isStale: boolean;
  issuesDetected: string[];
  proposedStatus: VerificationStatus;
  proposedChanges?: Partial<Resource>;
}

// Verification Agent audits resource freshness and flags changes (PRD Section 23)
export function auditResources(resources: Resource[] = VERIFIED_RESOURCES): AuditReportItem[] {
  const now = Date.now();
  const STALE_THRESHOLD_DAYS = 60; // Flag records older than 60 days

  const report: AuditReportItem[] = [];

  for (const res of resources) {
    const lastVerified = new Date(res.last_verified_at).getTime();
    const daysSince = Math.max(0, Math.floor((now - lastVerified) / (1000 * 60 * 60 * 24)));
    const issues: string[] = [];
    let proposedStatus = res.verification_status;

    if (daysSince > STALE_THRESHOLD_DAYS) {
      issues.push(`Record has not been recertified in ${daysSince} days (exceeds ${STALE_THRESHOLD_DAYS}-day threshold)`);
      if (res.verification_status === 'VERIFIED') {
        proposedStatus = 'STALE';
      }
    }

    if (!res.source_url || !res.source_url.startsWith('http')) {
      issues.push('Missing authoritative source URL');
      proposedStatus = 'NEEDS_REVIEW';
    }

    if (!res.phone && !res.website) {
      issues.push('Missing both direct phone and website contact points');
      proposedStatus = 'NEEDS_REVIEW';
    }

    if (res.verification_status === 'NEEDS_REVIEW') {
      issues.push('Flagged by automated crawler for potential hours/address change');
    }

    report.push({
      resourceId: res.id,
      resourceName: res.name,
      currentStatus: res.verification_status,
      daysSinceVerification: daysSince,
      isStale: daysSince > STALE_THRESHOLD_DAYS,
      issuesDetected: issues,
      proposedStatus,
    });
  }

  return report;
}
