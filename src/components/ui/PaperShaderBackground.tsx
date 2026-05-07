import { Component, lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

const PaperShaderBackgroundCanvas = lazy(() => import('./PaperShaderBackgroundCanvas'));

/** Network Information API — `connection` tüm TypeScript lib.dom sürümlerinde yok. */
type NetworkInformationLite = EventTarget & {
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: EventListener) => void;
  removeEventListener?: (type: 'change', listener: EventListener) => void;
};

function getNetworkConnection(): NetworkInformationLite | undefined {
  return (navigator as Navigator & { connection?: NetworkInformationLite }).connection;
}

/**
 * Statik gradient: reduced-motion, dokunmatik-öncelikli işaretçi (çoğu telefon) veya veri tasarrufu.
 * Mobil INP ve pil için WebGL bu durumlarda hiç yüklenmez.
 */
function subscribeStaticBackgroundMode(onChange: () => void) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  reducedMotion.addEventListener('change', onChange);
  coarsePointer.addEventListener('change', onChange);

  const conn = getNetworkConnection();
  conn?.addEventListener?.('change', onChange as EventListener);

  return () => {
    reducedMotion.removeEventListener('change', onChange);
    coarsePointer.removeEventListener('change', onChange);
    conn?.removeEventListener?.('change', onChange as EventListener);
  };
}

function getStaticBackgroundModeSnapshot() {
  const saveData = Boolean(getNetworkConnection()?.saveData);

  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(pointer: coarse)').matches ||
    saveData
  );
}

function useStaticBackgroundMode() {
  return useSyncExternalStore(subscribeStaticBackgroundMode, getStaticBackgroundModeSnapshot, () => true);
}

const serverDprSnapshot: [number, number] = [1, 1];
let dprSnapshotCache: [number, number] = [1, 1];

function computeDprTuple(): [number, number] {
  const narrow = window.matchMedia('(max-width: 768px)').matches;
  const maxDpr = narrow ? 1 : 2;
  const device = Math.min(window.devicePixelRatio || 1, maxDpr);

  return [1, Math.max(1, device)];
}

function getDprSnapshot(): [number, number] {
  const next = computeDprTuple();
  if (dprSnapshotCache[0] === next[0] && dprSnapshotCache[1] === next[1]) {
    return dprSnapshotCache;
  }
  dprSnapshotCache = next;
  return dprSnapshotCache;
}

function subscribeDpr(onChange: () => void) {
  const narrowMq = window.matchMedia('(max-width: 768px)');
  narrowMq.addEventListener('change', onChange);
  window.addEventListener('resize', onChange);

  return () => {
    narrowMq.removeEventListener('change', onChange);
    window.removeEventListener('resize', onChange);
  };
}

function useAdaptiveDpr(): [number, number] {
  return useSyncExternalStore(subscribeDpr, getDprSnapshot, () => serverDprSnapshot);
}

class PaperShaderCanvasErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[PaperShaderBackground] WebGL / sahne hatası; arka plan yalnızca CSS gradient ile devam ediyor.', error, info);
  }

  render() {
    if (this.state.failed) {
      return null;
    }
    return this.props.children;
  }
}

export default function PaperShaderBackground() {
  const staticBackgroundMode = useStaticBackgroundMode();
  const dpr = useAdaptiveDpr();
  const [mountCanvas, setMountCanvas] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (staticBackgroundMode || mountCanvas) {
      return;
    }

    let cancelled = false;
    const activate = () => {
      if (!cancelled) {
        setMountCanvas(true);
      }
    };

    let idleId: ReturnType<typeof setTimeout> | number | undefined;
    let usedIdleCallback = false;
    if (typeof window.requestIdleCallback === 'function') {
      usedIdleCallback = true;
      idleId = window.requestIdleCallback(activate, { timeout: 2200 });
    } else {
      idleId = window.setTimeout(activate, 450);
    }

    const node = containerRef.current;
    const observer =
      node &&
      new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            activate();
          }
        },
        { root: null, rootMargin: '120px 0px', threshold: 0 },
      );

    if (node && observer) {
      observer.observe(node);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) {
        if (usedIdleCallback && typeof window.cancelIdleCallback === 'function') {
          window.cancelIdleCallback(idleId);
        } else {
          clearTimeout(idleId as ReturnType<typeof setTimeout>);
        }
      }
      observer?.disconnect();
    };
  }, [staticBackgroundMode, mountCanvas]);

  if (staticBackgroundMode) {
    return <div className="paperShaderBackground paperShaderBackground--static" aria-hidden="true" />;
  }

  return (
    <div ref={containerRef} className="paperShaderBackground" aria-hidden="true">
      {mountCanvas ? (
        <Suspense fallback={null}>
          <PaperShaderCanvasErrorBoundary>
            <PaperShaderBackgroundCanvas dpr={dpr} />
          </PaperShaderCanvasErrorBoundary>
        </Suspense>
      ) : null}
    </div>
  );
}
