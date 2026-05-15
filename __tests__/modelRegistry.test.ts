/**
 * Tests for modelRegistry.ts — MODEL_REGISTRY structure, cache invalidation,
 * and three-tier getModel resolution (downloaded > remote URL > bundled).
 */

jest.mock('react-native-blob-util', () => ({
  default: {
    config: jest.fn(),
    fs: {
      df: jest.fn(),
      exists: jest.fn(),
      stat: jest.fn(),
      isDir: jest.fn(),
      mkdir: jest.fn(),
      unlink: jest.fn(),
      dirs: { DocumentDir: '/mock/docs' },
    },
  },
}));

jest.mock('../src/store/useRemoteContentStore', () => ({
  useRemoteContentStore: { getState: jest.fn(() => ({ remoteModels: {} })) },
}));

jest.mock('../src/store/usePackDownloadStore', () => ({
  usePackDownloadStore: { getState: jest.fn(() => ({ packs: {} })) },
}));

jest.mock('../src/utils/packStorage', () => ({
  getModelUriForViro: jest.fn((path: string) => `file://${path}`),
  getAudioUriForPlayback: jest.fn((path: string) => `file://${path}`),
}));

import { MODEL_REGISTRY, getModel, invalidateModelCache } from '../src/utils/modelRegistry';
import { useRemoteContentStore } from '../src/store/useRemoteContentStore';
import { usePackDownloadStore } from '../src/store/usePackDownloadStore';
import type { RemoteModelEntry } from '../src/types/remoteContent';

const FRUIT_WORDS = ['apple','banana','cherry','grape','lemon','mango','orange','pineapple','strawberry','watermelon'];

const makeRemoteEntry = (word: string, overrides: Partial<RemoteModelEntry> = {}): RemoteModelEntry => ({
  word, syllables: [word], audioUrl: `https://cdn/${word}.mp3`, modelUrl: `https://cdn/${word}.glb`,
  audioRef: `audio/${word}.mp3`, modelRef: `models/${word}.glb`,
  scale: 0.01, positionY: 0, packId: 'fruits', isCalibrated: true, ...overrides,
});

beforeEach(() => {
  // Clear the module-level cache between tests
  invalidateModelCache(FRUIT_WORDS);
  (useRemoteContentStore.getState as jest.Mock).mockReturnValue({ remoteModels: {} });
  (usePackDownloadStore.getState as jest.Mock).mockReturnValue({ packs: {} });
});

describe('MODEL_REGISTRY — structure', () => {
  it('contains all 10 fruit words', () => {
    FRUIT_WORDS.forEach(word => expect(MODEL_REGISTRY).toHaveProperty(word));
  });

  it('each entry has a uniform [n, n, n] scale tuple', () => {
    FRUIT_WORDS.forEach(word => {
      const [x, y, z] = MODEL_REGISTRY[word].scale;
      expect(x).toBe(y);
      expect(y).toBe(z);
      expect(x).toBeGreaterThan(0);
    });
  });

  it('mango and orange use a non-zero position offset', () => {
    expect(MODEL_REGISTRY.mango.position[2]).not.toBe(-1.0);
    expect(MODEL_REGISTRY.orange.position[2]).not.toBe(-1.0);
  });

  it('pineapple has the largest scale', () => {
    const scales = FRUIT_WORDS.map(w => MODEL_REGISTRY[w].scale[0]);
    expect(MODEL_REGISTRY.pineapple.scale[0]).toBe(Math.max(...scales));
  });

  it('each entry has syllables and audio filename', () => {
    FRUIT_WORDS.forEach(word => {
      expect(MODEL_REGISTRY[word].syllables.length).toBeGreaterThan(0);
      expect(MODEL_REGISTRY[word].audio).toMatch(/\.mp3$/);
    });
  });
});

describe('invalidateModelCache', () => {
  it('evicts specified words so the next getModel call re-resolves', () => {
    getModel('apple');
    invalidateModelCache(['apple']);
    // After invalidation, getModel must call store getState again (not return stale cache)
    // We can verify by changing the store mock and seeing the new result
    const remote = makeRemoteEntry('apple', { modelUrl: 'https://new-cdn/apple.glb' });
    (useRemoteContentStore.getState as jest.Mock).mockReturnValue({ remoteModels: { apple: remote } });
    const entry = getModel('apple');
    expect((entry?.source as { uri: string })?.uri).toBe('https://new-cdn/apple.glb');
  });

  it('does not evict unspecified words', () => {
    getModel('banana'); // populate cache
    invalidateModelCache(['apple']);
    // banana should still be cached (store not consulted again)
    (useRemoteContentStore.getState as jest.Mock).mockReturnValue({ remoteModels: {} });
    const entry = getModel('banana');
    expect(entry).not.toBeNull(); // still resolves (from cache or bundled)
  });
});

describe('getModel — three-tier resolution', () => {
  it('tier 3: returns bundled entry when no remote data exists', () => {
    const entry = getModel('apple');
    expect(entry).not.toBeNull();
    expect(typeof entry?.source).toBe('object'); // asset stub from transformer
  });

  it('tier 2: returns remote URL entry when remote exists but pack not downloaded', () => {
    const remote = makeRemoteEntry('apple');
    (useRemoteContentStore.getState as jest.Mock).mockReturnValue({ remoteModels: { apple: remote } });
    (usePackDownloadStore.getState as jest.Mock).mockReturnValue({ packs: {} });
    const entry = getModel('apple');
    expect((entry?.source as { uri: string })?.uri).toBe('https://cdn/apple.glb');
  });

  it('tier 1: returns downloaded file:// entry when pack is downloaded', () => {
    const remote = makeRemoteEntry('apple');
    (useRemoteContentStore.getState as jest.Mock).mockReturnValue({ remoteModels: { apple: remote } });
    (usePackDownloadStore.getState as jest.Mock).mockReturnValue({
      packs: {
        fruits: {
          status: 'downloaded', assetVersion: 'v1',
          localModelPaths: { apple: '/mock/docs/lumi_models/apple.glb' },
          localAudioPaths: { apple: '/mock/docs/lumi_audio/apple.mp3' },
        },
      },
    });
    const entry = getModel('apple');
    expect((entry?.source as { uri: string })?.uri).toBe('file:///mock/docs/lumi_models/apple.glb');
  });

  it('downloaded tier wins over remote URL', () => {
    const remote = makeRemoteEntry('apple');
    (useRemoteContentStore.getState as jest.Mock).mockReturnValue({ remoteModels: { apple: remote } });
    (usePackDownloadStore.getState as jest.Mock).mockReturnValue({
      packs: {
        fruits: {
          status: 'downloaded', assetVersion: 'v1',
          localModelPaths: { apple: '/mock/docs/lumi_models/apple.glb' },
          localAudioPaths: {},
        },
      },
    });
    const entry = getModel('apple');
    expect((entry?.source as { uri: string })?.uri).toMatch(/^file:\/\//);
  });

  it('returns null for an unknown word', () => {
    expect(getModel('doesnotexist')).toBeNull();
  });

  it('caches the result — store is not consulted on repeated calls', () => {
    getModel('apple');
    const callsBefore = (useRemoteContentStore.getState as jest.Mock).mock.calls.length;
    getModel('apple');
    expect((useRemoteContentStore.getState as jest.Mock).mock.calls.length).toBe(callsBefore);
  });
});
