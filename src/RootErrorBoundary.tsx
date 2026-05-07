import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };

type State = { error: Error | null };

export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[HHS] Yakalanmamış arayüz hatası', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            boxSizing: 'border-box',
            minHeight: '100svh',
            padding: '2rem',
            fontFamily: 'system-ui, Segoe UI, sans-serif',
            background: '#172447',
            color: '#f0f0f0',
          }}
        >
          <h1 style={{ fontSize: '1.35rem', marginTop: 0 }}>Sayfa yüklenemedi</h1>
          <p style={{ maxWidth: '40rem', lineHeight: 1.55 }}>
            Arayüz beklenmedik bir hatada kapandı. Bu genelde tarayıcı eklentisi, ağ iletişimi veya panelden eklenen
            özel head/HTML snippet’leriyle de tetiklenebilir.
          </p>
          <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>
            Geliştirici araçlarında (F12) Konsol sekmesindeki kırmızı hata satırı sorunu net gösterir.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.6rem 1.1rem',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '8px',
              border: 'none',
              background: '#f0801a',
              color: '#1a1a1a',
              fontWeight: 600,
            }}
          >
            Sayfayı yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
