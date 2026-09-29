import { describe, it, expect } from 'vitest';
import { getRouteEstimate } from '@/tools/maps';

describe('Geospatial & Route Estimate Tests', () => {
  it('should return valid driving and walking estimates without crashing', async () => {
    // North Las Vegas City Hall to Three Square Food Bank
    const estimate = await getRouteEstimate(36.1989, -115.1175, 36.2361, -115.0978);
    expect(estimate.distanceMiles).toBeGreaterThan(0);
    expect(estimate.drivingTime).toContain('min');
    expect(estimate.walkingTime).toContain('min');
    expect(estimate.transitAvailable).toBe(true);
  });
});
