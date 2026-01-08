import { describe, it, expect } from 'vitest';
import { GraphCrawler } from './graph-crawler';

describe('P0_LIDLESS_LEGION Sub 5: Graph Crawler', () => {
  const crawler = new GraphCrawler();

  it('should detect connectivity between nodes', () => {
    crawler.ingest({ id: 'A', type: 'port', links: ['B'] });
    crawler.ingest({ id: 'B', type: 'port', links: ['C'] });
    crawler.ingest({ id: 'C', type: 'port', links: [] });

    expect(crawler.isConnected('A', 'C')).toBe(true);
    expect(crawler.isConnected('A', 'D')).toBe(false);
  });
});
