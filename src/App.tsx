import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Menu, Search, X } from 'lucide-react';
import productsData from './data/products.json';
import { EnergyRing, ShaderPlane } from './components/ui/background-paper-shaders';
import './App.css';

const headerItemAnimation = {
  initial: { opacity: 0, y: -12, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

const languages = ['TR', 'EN', 'DE'];

const productItems = productsData.categories.flatMap((category) =>
  category.products.map((product) => ({
    ...product,
    categoryKey: category.key,
    categoryTitle: category.title,
  })),
);

function App() {
  const [language, setLanguage] = useState('TR');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [hasQuoteButtonEntered, setHasQuoteButtonEntered] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  const activeProduct = productItems[activeProductIndex];

  const showPreviousProduct = () => {
    setActiveProductIndex((currentIndex) =>
      currentIndex === 0 ? productItems.length - 1 : currentIndex - 1,
    );
  };

  const showNextProduct = () => {
    setActiveProductIndex((currentIndex) =>
      currentIndex === productItems.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <main className="page">
      <LayoutGroup id="quote-modal">
        <header className="siteHeader">
          <motion.a
            className="logoLink"
            href="/"
            aria-label="HHS Otomatik Kapı ana sayfa"
            initial={{
              opacity: 0,
              width: 8,
              height: 8,
              borderRadius: 999,
              y: -8,
            }}
            animate={{
              opacity: 1,
              width: [8, 52, 92],
              height: [8, 52, 52],
              borderRadius: [999, 999, 6],
              y: 0,
            }}
            transition={{
              duration: 0.9,
              ease: 'easeInOut',
              times: [0, 0.48, 1],
            }}
          >
            <motion.img
              src="/apple-touch-icon.png"
              alt="HHS Otomatik Kapı"
              initial={{ opacity: 0, scale: 0.72 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.58, ease: 'easeOut' }}
            />
          </motion.a>

          <div className="headerCenter">
            <AnimatePresence>
              {!isQuoteModalOpen && (
                <motion.button
                  className="headerQuoteButton"
                  type="button"
                  layoutId="quote-surface"
                  initial={hasQuoteButtonEntered ? false : headerItemAnimation.initial}
                  animate={headerItemAnimation.animate}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: hasQuoteButtonEntered ? 0 : 0.95,
                    ease: 'easeOut',
                  }}
                  onAnimationComplete={() => setHasQuoteButtonEntered(true)}
                  onClick={() => setIsQuoteModalOpen(true)}
                >
                  Teklif Al
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <nav className="headerActions" aria-label="Üst menü">
            <motion.button
              className="iconButton"
              type="button"
              aria-label="Ara"
              initial={headerItemAnimation.initial}
              animate={headerItemAnimation.animate}
              transition={{ duration: 0.45, delay: 0.95, ease: 'easeOut' }}
            >
              <Search size={22} strokeWidth={2.2} />
            </motion.button>

            <motion.div
              className="languageButton"
              initial={headerItemAnimation.initial}
              animate={headerItemAnimation.animate}
              transition={{ duration: 0.45, delay: 1.08, ease: 'easeOut' }}
            >
              <select
                aria-label="Dil seçimi"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                {languages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} strokeWidth={2.3} />
            </motion.div>

            <motion.button
              className="iconButton"
              type="button"
              aria-label="Menüyü aç"
              initial={headerItemAnimation.initial}
              animate={headerItemAnimation.animate}
              transition={{ duration: 0.45, delay: 1.21, ease: 'easeOut' }}
            >
              <Menu size={28} strokeWidth={2.2} />
            </motion.button>
          </nav>
        </header>

        <AnimatePresence>
          {isQuoteModalOpen && (
            <motion.div
              className="quoteModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsQuoteModalOpen(false)}
            >
              <motion.section
                className="quoteModal"
                layoutId="quote-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="quote-modal-title"
                exit={{ opacity: 0, scale: 0.2, y: -94, borderRadius: 999 }}
                transition={{ type: 'spring', stiffness: 190, damping: 24 }}
                onClick={(event) => event.stopPropagation()}
              >
              <button
                className="quoteModalClose"
                type="button"
                aria-label="Teklif penceresini kapat"
                onClick={() => setIsQuoteModalOpen(false)}
              >
                <X size={22} strokeWidth={2.2} />
              </button>

              <div className="quoteModalContent">
                <p className="quoteModalEyebrow">Hızlı Teklif</p>
                <h2 id="quote-modal-title">Projeniz için teklif alalım</h2>
                <p>
                  Otomatik kapı, bariyer veya geçiş sistemi ihtiyacınız için bize
                  ulaşın. Keşif ve ürün önerisi için hızlıca dönüş yapalım.
                </p>

                <div className="productCarousel" aria-label="Ürün seçenekleri">
                  <div className="productCarouselHeader">
                    <div>
                      <p className="productCarouselEyebrow">Ürün Seçimi</p>
                      <h3>{activeProduct.title}</h3>
                    </div>
                    <div className="productCarouselControls">
                      <button type="button" aria-label="Önceki ürün" onClick={showPreviousProduct}>
                        <ChevronLeft size={20} strokeWidth={2.4} />
                      </button>
                      <button type="button" aria-label="Sonraki ürün" onClick={showNextProduct}>
                        <ChevronRight size={20} strokeWidth={2.4} />
                      </button>
                    </div>
                  </div>

                  <div className="productCarouselViewport">
                    <motion.div
                      className="productCarouselTrack"
                      animate={{ x: `-${activeProductIndex * 100}%` }}
                      transition={{ type: 'spring', stiffness: 190, damping: 24 }}
                    >
                      {productItems.map((product) => (
                        <article className="productSlide" key={product.key}>
                          <span>{product.categoryTitle}</span>
                          <h4>{product.title}</h4>
                          <p>{product.description}</p>
                          {product.children.length > 0 && (
                            <div className="productChildren">
                              {product.children.map((child) => (
                                <small key={child.key}>{child.title}</small>
                              ))}
                            </div>
                          )}
                        </article>
                      ))}
                    </motion.div>
                  </div>
                </div>

                <div className="quoteModalActions">
                  <a href="tel:+902642910060">Telefonla Ara</a>
                  <a href="https://wa.me/905426142929">WhatsApp Yaz</a>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
        </AnimatePresence>
      </LayoutGroup>

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
