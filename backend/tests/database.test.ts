import { describe, it, expect } from 'vitest';
import { getActiveEngine, getDbConnectionInfo } from '../src/db/sql-engine';

describe('Database Engine & Configuration', () => {
  it('identifies postgres as the active relational engine', () => {
    expect(getActiveEngine()).toBe('postgres');
  });

  it('provides masked connection information without leaking database credentials', () => {
    const info = getDbConnectionInfo();
    expect(info).toHaveProperty('engine', 'postgres');
    expect(info).toHaveProperty('connected');
    expect(info).toHaveProperty('databaseUrlMasked');

    // Never leak raw password
    if (info.databaseUrlMasked) {
      expect(info.databaseUrlMasked).toContain('••••');
    }
  });
});
