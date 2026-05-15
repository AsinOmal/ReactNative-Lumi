/**
 * Tests for the pack download subsystem: store helpers, store state machine,
 * and download service orchestration.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-blob-util', () => ({
  __esModule: true,
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

import { emptyState, patchPack } from '../src/store/packDownloadStore.helpers';
import { usePackDownloadStore } from '../src/store/usePackDownloadStore';
import {
  downloadPack,
  cancelPackDownload,
} from '../src/services/packDownloadService';
import {
  buildAssetTasks,
  getLocalModelPath,
  getLocalAudioPath,
} from '../src/utils/packStorage';
import { config } from '../src/constants/config';
import type { RemoteModelEntry } from '../src/types/remoteContent';

const blob = (): ReturnType<typeof jest.requireMock> =>
  jest.requireMock('react-native-blob-util').default;

const makeHandle = (status = 200) =>
  Object.assign(Promise.resolve({ respInfo: { status } }), {
    cancel: jest.fn(),
  });

const makeRemoteModels = (words: string[]): Record<string, RemoteModelEntry> =>
  Object.fromEntries(
    words.map((w) => [
      w,
      {
        word: w,
        syllables: [w],
        audioUrl: `https://cdn/${w}.mp3`,
        modelUrl: `https://cdn/${w}.glb`,
        audioRef: `audio/${w}.mp3`,
        modelRef: `models/${w}.glb`,
        scale: 0.01,
        positionY: 0,
        packId: 'fruits',
        isCalibrated: true,
      },
    ])
  );

// Model-only (no audioUrl) so buildAssetTasks generates a single task — used for retry tests
const makeModelOnlyRemoteModels = (
  words: string[]
): Record<string, RemoteModelEntry> =>
  Object.fromEntries(
    words.map((w) => [
      w,
      {
        word: w,
        syllables: [w],
        audioUrl: '',
        modelUrl: `https://cdn/${w}.glb`,
        audioRef: '',
        modelRef: `models/${w}.glb`,
        scale: 0.01,
        positionY: 0,
        packId: 'fruits',
        isCalibrated: true,
      },
    ])
  );

beforeEach(() => {
  jest.clearAllMocks();
  const b = blob();
  b.config.mockReturnValue({ fetch: jest.fn().mockReturnValue(makeHandle()) });
  b.fs.df.mockResolvedValue({ free: 200 * 1024 * 1024 });
  b.fs.exists.mockResolvedValue(true);
  b.fs.stat.mockResolvedValue({ size: 1000 });
  b.fs.isDir.mockResolvedValue(true);
  b.fs.mkdir.mockResolvedValue(undefined);
  b.fs.unlink.mockResolvedValue(undefined);
  usePackDownloadStore.setState({ packs: {} });
});

// ── packDownloadStore.helpers ─────────────────────────────────────────────────

describe('packDownloadStore.helpers — emptyState', () => {
  it('returns idle state with zeroed counters', () => {
    const s = emptyState('pack1', 10);
    expect(s.packId).toBe('pack1');
    expect(s.status).toBe('idle');
    expect(s.progress).toBe(0);
    expect(s.totalFiles).toBe(10);
  });

  it('defaults totalFiles to 0 when omitted', () => {
    expect(emptyState('pack1').totalFiles).toBe(0);
  });
});

describe('packDownloadStore.helpers — patchPack', () => {
  it('merges partial state into an existing pack', () => {
    const base = { pack1: emptyState('pack1', 4) };
    const result = patchPack(base, 'pack1', {
      status: 'downloading',
      downloadedFiles: 2,
    });
    expect(result.pack1.status).toBe('downloading');
    expect(result.pack1.downloadedFiles).toBe(2);
    expect(result.pack1.totalFiles).toBe(4); // original value preserved
  });

  it('creates a new entry if the pack did not exist', () => {
    const result = patchPack({}, 'newPack', {
      status: 'error',
      errorMessage: 'oops',
    });
    expect(result.newPack.status).toBe('error');
    expect(result.newPack.errorMessage).toBe('oops');
  });
});

// ── usePackDownloadStore state machine ────────────────────────────────────────

describe('usePackDownloadStore — isDownloaded', () => {
  it('returns false for an unknown pack', () => {
    expect(usePackDownloadStore.getState().isDownloaded('unknown', 'v1')).toBe(
      false
    );
  });

  it('returns false when status is downloading', () => {
    usePackDownloadStore.getState().startDownload('p1', 2);
    expect(usePackDownloadStore.getState().isDownloaded('p1', 'v1')).toBe(
      false
    );
  });

  it('returns true after completeDownload with matching version', () => {
    usePackDownloadStore.getState().startDownload('p1', 2);
    usePackDownloadStore
      .getState()
      .completeDownload(
        'p1',
        { localModelPaths: {}, localAudioPaths: {} },
        'v1'
      );
    expect(usePackDownloadStore.getState().isDownloaded('p1', 'v1')).toBe(true);
  });

  it('returns false when version mismatches', () => {
    usePackDownloadStore
      .getState()
      .completeDownload(
        'p1',
        { localModelPaths: {}, localAudioPaths: {} },
        'v1'
      );
    expect(usePackDownloadStore.getState().isDownloaded('p1', 'v2')).toBe(
      false
    );
  });
});

describe('usePackDownloadStore — getLocalPaths', () => {
  it('returns null when pack is not downloaded', () => {
    expect(usePackDownloadStore.getState().getLocalPaths('p1')).toBeNull();
  });

  it('returns model and audio paths after completeDownload', () => {
    const result = {
      localModelPaths: { apple: '/a.glb' },
      localAudioPaths: { apple: '/a.mp3' },
    };
    usePackDownloadStore.getState().completeDownload('p1', result, 'v1');
    const paths = usePackDownloadStore.getState().getLocalPaths('p1');
    expect(paths?.models.apple).toBe('/a.glb');
    expect(paths?.audio.apple).toBe('/a.mp3');
  });

  it('returns null after deleteDownload', async () => {
    usePackDownloadStore
      .getState()
      .completeDownload(
        'p1',
        { localModelPaths: {}, localAudioPaths: {} },
        'v1'
      );
    await usePackDownloadStore.getState().deleteDownload('p1');
    expect(usePackDownloadStore.getState().getLocalPaths('p1')).toBeNull();
  });
});

describe('usePackDownloadStore — updateProgress', () => {
  it('computes progress as downloaded / total', () => {
    usePackDownloadStore.getState().startDownload('p1', 4);
    usePackDownloadStore.getState().updateProgress('p1', 2);
    expect(usePackDownloadStore.getState().packs.p1.progress).toBeCloseTo(0.5);
  });
});

// ── packDownloadService ───────────────────────────────────────────────────────

describe('packDownloadService — downloadPack', () => {
  it('resolves with localModelPaths and localAudioPaths', async () => {
    const words = ['apple'];
    const result = await downloadPack(
      'pack1',
      words,
      makeRemoteModels(words),
      jest.fn()
    );
    expect(result.localModelPaths).toHaveProperty('apple');
    expect(result.localAudioPaths).toHaveProperty('apple');
  });

  it('calls onProgress once per downloaded file', async () => {
    const onProgress = jest.fn();
    const words = ['apple', 'banana']; // 2 words × 2 files = 4 tasks
    await downloadPack('pack1', words, makeRemoteModels(words), onProgress);
    expect(onProgress).toHaveBeenCalledTimes(4);
    expect(onProgress).toHaveBeenLastCalledWith(4, 4);
  });

  it('caps concurrent fetches at DOWNLOAD_CONCURRENCY', async () => {
    let active = 0;
    let peak = 0;
    blob().config.mockImplementation(() => ({
      fetch: jest.fn(() => {
        active++;
        peak = Math.max(peak, active);
        const p = new Promise<object>((res) =>
          setImmediate(() => {
            active--;
            res({ respInfo: { status: 200 } });
          })
        );
        return Object.assign(p, { cancel: jest.fn() });
      }),
    }));
    const words = ['apple', 'banana', 'cherry', 'grape', 'lemon'];
    await downloadPack('pack1', words, makeRemoteModels(words), jest.fn());
    expect(peak).toBeLessThanOrEqual(config.DOWNLOAD_CONCURRENCY);
    expect(peak).toBeGreaterThan(1);
  });

  it('retries once on failure and succeeds on the second attempt', async () => {
    let calls = 0;
    blob().config.mockImplementation(() => ({
      fetch: jest.fn(() => {
        calls++;
        if (calls === 1) {
          const p = Promise.reject(new Error('transient'));
          void p.catch(() => {}); // silence unhandled rejection
          return Object.assign(p, { cancel: jest.fn() });
        }
        return makeHandle();
      }),
    }));
    // Model-only entry → single task → exactly 2 fetch calls (1 fail + 1 retry)
    const words = ['apple'];
    await expect(
      downloadPack('pack1', words, makeModelOnlyRemoteModels(words), jest.fn())
    ).resolves.toBeDefined();
    expect(calls).toBe(2);
  });

  it('throws when both the attempt and the retry fail', async () => {
    blob().config.mockImplementation(() => ({
      fetch: jest.fn(() => {
        const p = Promise.reject(new Error('persistent'));
        void p.catch(() => {});
        return Object.assign(p, { cancel: jest.fn() });
      }),
    }));
    await expect(
      downloadPack('pack1', ['apple'], makeRemoteModels(['apple']), jest.fn())
    ).rejects.toThrow();
  });

  it('throws NoSpaceError when free disk space is below threshold', async () => {
    blob().fs.df.mockResolvedValue({ free: 1024 }); // 1 KB — well below 50 MB threshold
    await expect(
      downloadPack('pack1', ['apple'], makeRemoteModels(['apple']), jest.fn())
    ).rejects.toThrow('Not enough free space');
  });
});

// ── packStorage pure helpers ──────────────────────────────────────────────────

describe('packStorage — pure path helpers', () => {
  it('getLocalModelPath returns the correct subdir and extension', () => {
    expect(getLocalModelPath('apple')).toBe('/mock/docs/lumi_models/apple.glb');
  });

  it('getLocalAudioPath returns the correct subdir and extension', () => {
    expect(getLocalAudioPath('apple')).toBe('/mock/docs/lumi_audio/apple.mp3');
  });

  it('buildAssetTasks generates one model and one audio task per word', () => {
    const tasks = buildAssetTasks(['apple'], makeRemoteModels(['apple']));
    expect(tasks).toHaveLength(2);
    expect(tasks.find((t) => t.kind === 'model')?.url).toBe(
      'https://cdn/apple.glb'
    );
    expect(tasks.find((t) => t.kind === 'audio')?.url).toBe(
      'https://cdn/apple.mp3'
    );
  });

  it('buildAssetTasks skips words that have no remote entry', () => {
    const tasks = buildAssetTasks(['unknown'], makeRemoteModels(['apple']));
    expect(tasks).toHaveLength(0);
  });
});
