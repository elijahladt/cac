import { Resource, VerificationStatus } from '@/lib/types';
import { VERIFIED_RESOURCES } from '@/lib/data/verifiedResources';

export function getAdminResources(): Resource[] {
  try {
    const stored = localStorage.getItem('nv_nexus_admin_resources');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore error
  }
  return [...VERIFIED_RESOURCES];
}

export function saveAdminResources(resources: Resource[]): void {
  try {
    localStorage.setItem('nv_nexus_admin_resources', JSON.stringify(resources));
  } catch {
    // Ignore error
  }
}

export function updateResourceStatus(
  resourceId: string,
  newStatus: VerificationStatus,
  resources: Resource[]
): Resource[] {
  const updated = resources.map((r) => {
    if (r.id === resourceId) {
      return {
        ...r,
        verification_status: newStatus,
        last_verified_at: newStatus === 'VERIFIED' ? new Date().toISOString() : r.last_verified_at,
        updated_at: new Date().toISOString(),
      };
    }
    return r;
  });

  saveAdminResources(updated);
  return updated;
}
