import { Canvas } from '@react-three/fiber';
import { EnergyRing, ShaderPlane } from './components/ui/background-paper-shaders';
import './App.css';

function App() {
  return (
    <main className="page">
      <div className="paperShaderBackground" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 48 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
        >
          <ShaderPlane position={[-1.7, 0.9, 0]} color1="#f0801a" color2="#d8d8d8" />
          <ShaderPlane position={[1.7, -0.8, -0.3]} color1="#253669" color2="#f0801a" />
          <EnergyRing radius={1.35} position={[1.25, 0.8, 0.1]} />
          <EnergyRing radius={0.85} position={[-1.4, -0.9, 0.2]} />
        </Canvas>
      </div>

      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">HHS Otomatik Kapı Sistemleri</p>
          <h1>
            Otomatik kapı, bariyer ve geçiş sistemlerinde profesyonel çözümler
          </h1>
          <p className="lead">
            Bahçe kapısı motorları, otomatik bariyer sistemleri, fotoselli
            kapılar, garaj kapıları ve plaka tanıma çözümleri için keşif, satış,
            montaj ve teknik destek.
          </p>

          <div className="actions">
            <a className="primary" href="tel:+902642910060">
              Hemen Ara
            </a>
            <a className="secondary" href="https://wa.me/905426142929">
              WhatsApp Teklif Al
            </a>
          </div>
        </div>

        <div className="heroCard">
          <h2>25+ Yıllık Tecrübe</h2>
          <p>
            Yetkili bayi güvencesi, stoktan teslim ürünler ve saha deneyimiyle
            hızlı çözüm.
          </p>
        </div>
      </section>

      <section className="services">
        <h2>Hizmet Alanları</h2>
        <div className="grid">
          <article>
            <h3>Bahçe Kapısı Motorları</h3>
            <p>
              Yana kayar ve kanatlı kapılar için motor, kumanda, fotosel ve
              aksesuar çözümleri.
            </p>
          </article>
          <article>
            <h3>Otomatik Bariyer Sistemleri</h3>
            <p>
              Site, fabrika, otopark ve işletme girişleri için profesyonel
              bariyer sistemleri.
            </p>
          </article>
          <article>
            <h3>Fotoselli Kapılar</h3>
            <p>
              Mağaza, hastane, ofis ve yoğun geçiş alanları için otomatik cam
              kapı sistemleri.
            </p>
          </article>
          <article>
            <h3>Plaka Tanıma Sistemleri</h3>
            <p>
              Araç giriş kontrolü, ambulans geçiş önceliği ve yetkili araç geçiş
              çözümleri.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default App;
