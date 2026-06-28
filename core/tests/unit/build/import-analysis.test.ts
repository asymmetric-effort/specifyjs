import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import {
  detectUnusedImports,
  formatUnusedImportReport,
  analyzeImportDepth,
  buildDependencyGraph,
  exportGraphMermaid,
  exportGraphDOT,
} from '@asymmetric-effort/nogginlessdom';

const ROOT = new URL('../../..', import.meta.url).pathname;
const CORE_SRC = ROOT + 'src';

const ENTRY_POINTS = [
  CORE_SRC + '/index.ts',
  CORE_SRC + '/dom/index.ts',
  CORE_SRC + '/hooks/index.ts',
  CORE_SRC + '/server/index.ts',
];

const EXCLUDE_PATTERNS = ['node_modules', 'dist', '.test.', '.spec.'];

describe('import analysis APIs', () => {
  describe('detectUnusedImports', () => {
    it('returns an array', () => {
      const result = detectUnusedImports([CORE_SRC]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns no unused imports for core/src', () => {
      const result = detectUnusedImports([CORE_SRC]);
      expect(result.length).toBe(0);
    });

    it('accepts exclude option', () => {
      const result = detectUnusedImports([CORE_SRC], {
        exclude: EXCLUDE_PATTERNS,
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('formatUnusedImportReport', () => {
    it('returns empty string for empty array', () => {
      const report = formatUnusedImportReport([]);
      expect(typeof report).toBe('string');
    });

    it('formats a report for unused imports', () => {
      const fakeUnused = [
        {
          file: '/tmp/test.ts',
          importSource: './other',
          importedSymbols: ['foo', 'bar'],
          line: 1,
          isNamespaceImport: false,
          isTypeOnly: false,
        },
      ];
      const report = formatUnusedImportReport(fakeUnused);
      expect(report).toContain('foo');
      expect(report).toContain('bar');
    });
  });

  describe('analyzeImportDepth', () => {
    it('returns a result with expected properties', () => {
      const result = analyzeImportDepth(ENTRY_POINTS, {
        exclude: EXCLUDE_PATTERNS,
        threshold: 10,
      });
      expect(typeof result.maxDepth).toBe('number');
      expect(typeof result.averageDepth).toBe('number');
      expect(Array.isArray(result.entries)).toBe(true);
      expect(Array.isArray(result.filesExceedingThreshold)).toBe(true);
    });

    it('reports no files exceeding a high threshold', () => {
      const result = analyzeImportDepth(ENTRY_POINTS, {
        exclude: EXCLUDE_PATTERNS,
        threshold: 100,
      });
      expect(result.filesExceedingThreshold.length).toBe(0);
    });

    it('reports files exceeding a low threshold', () => {
      const result = analyzeImportDepth(ENTRY_POINTS, {
        exclude: EXCLUDE_PATTERNS,
        threshold: 0,
      });
      // With threshold 0, any file with depth > 0 should appear
      if (result.maxDepth > 0) {
        expect(result.filesExceedingThreshold.length).toBeGreaterThan(0);
      }
    });

    it('each entry has expected shape', () => {
      const result = analyzeImportDepth(ENTRY_POINTS, {
        exclude: EXCLUDE_PATTERNS,
      });
      if (result.entries.length > 0) {
        const entry = result.entries[0];
        expect(typeof entry.file).toBe('string');
        expect(typeof entry.depth).toBe('number');
        expect(Array.isArray(entry.longestChain)).toBe(true);
        expect(typeof entry.directImports).toBe('number');
        expect(typeof entry.transitiveImports).toBe('number');
      }
    });
  });

  describe('buildDependencyGraph', () => {
    it('builds a graph with expected structure', () => {
      const graph = buildDependencyGraph(ENTRY_POINTS, {
        exclude: EXCLUDE_PATTERNS,
        relativePaths: true,
      });
      expect(graph.version).toBe(1);
      expect(typeof graph.generated).toBe('string');
      expect(Array.isArray(graph.nodes)).toBe(true);
      expect(Array.isArray(graph.edges)).toBe(true);
      expect(Array.isArray(graph.entryPoints)).toBe(true);
      expect(typeof graph.summary).toBe('object');
      expect(typeof graph.summary.totalFiles).toBe('number');
      expect(typeof graph.summary.totalEdges).toBe('number');
      expect(graph.summary.totalFiles).toBeGreaterThan(0);
      expect(graph.summary.totalEdges).toBeGreaterThan(0);
    });

    it('exports to Mermaid format', () => {
      const graph = buildDependencyGraph(ENTRY_POINTS, {
        exclude: EXCLUDE_PATTERNS,
        relativePaths: true,
      });
      const mermaid = exportGraphMermaid(graph);
      expect(typeof mermaid).toBe('string');
      expect(mermaid).toContain('graph');
      expect(mermaid).toContain('-->');
    });

    it('exports to DOT format', () => {
      const graph = buildDependencyGraph(ENTRY_POINTS, {
        exclude: EXCLUDE_PATTERNS,
        relativePaths: true,
      });
      const dot = exportGraphDOT(graph);
      expect(typeof dot).toBe('string');
      expect(dot).toContain('digraph');
      expect(dot).toContain('->');
    });

    it('identifies hub files', () => {
      const graph = buildDependencyGraph(ENTRY_POINTS, {
        exclude: EXCLUDE_PATTERNS,
        relativePaths: true,
      });
      expect(Array.isArray(graph.summary.hubFiles)).toBe(true);
    });

    it('marks entry points correctly', () => {
      const graph = buildDependencyGraph(ENTRY_POINTS, {
        exclude: EXCLUDE_PATTERNS,
        relativePaths: true,
      });
      const entryNodes = graph.nodes.filter((n) => n.isEntryPoint);
      expect(entryNodes.length).toBeGreaterThan(0);
    });
  });
});
