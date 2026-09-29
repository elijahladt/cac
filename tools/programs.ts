import { Program } from '@/lib/types';
import { VERIFIED_PROGRAMS } from '@/lib/data/verifiedResources';

export async function searchPrograms(params: {
  category?: string;
  resourceId?: string;
  query?: string;
}): Promise<Program[]> {
  const { category, resourceId, query } = params;
  let programs = [...VERIFIED_PROGRAMS];

  if (resourceId) {
    programs = programs.filter((p) => p.resource_id === resourceId);
  }

  if (category) {
    programs = programs.filter((p) => p.category === category);
  }

  if (query) {
    const q = query.toLowerCase();
    programs = programs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.required_documents.some((d) => d.toLowerCase().includes(q))
    );
  }

  return programs;
}

export async function getProgram(id: string): Promise<Program | null> {
  const prog = VERIFIED_PROGRAMS.find((p) => p.id === id);
  return prog || null;
}

export async function getProgramsForResource(resourceId: string): Promise<Program[]> {
  return VERIFIED_PROGRAMS.filter((p) => p.resource_id === resourceId);
}
