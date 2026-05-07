import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ImageRevealProps {
  images: string[];
  allImages?: string[];
  startIndex?: number;
}

const cardPositionClassesByCount: Record<number, string[]> = {
  1: ['center'],
  2: ['left', 'right'],
  3: ['left', 'center', 'right'],
  4: ['farLeft', 'left', 'right', 'farRight'],
  5: ['farLeft', 'left', 'center', 'right', 'farRight'],
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function ImageReveal({ images, allImages, startIndex = 0 }: ImageRevealProps) {
  const visibleImages = useMemo(() => images.filter(Boolean).slice(0, 5), [images]);
  const galleryImages = useMemo(() => (allImages?.length ? allImages.filter(Boolean) : visibleImages), [allImages, visibleImages]);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const openImagePreview = (visibleIndex: number) => {
    if (galleryImages.length === 0) {
      return;
    }

    const safeStartIndex = clamp(startIndex, 0, Math.max(galleryImages.length - 1, 0));
    const nextIndex = clamp(safeStartIndex + visibleIndex, 0, Math.max(galleryImages.length - 1, 0));
    setActiveImageIndex(nextIndex);
  };

  const closeImagePreview = () => setActiveImageIndex(null);
  const goToNextImage = () =>
    setActiveImageIndex((currentIndex) =>
      currentIndex === null || galleryImages.length <= 1 ? currentIndex : (currentIndex + 1) % galleryImages.length,
    );
  const goToPreviousImage = () =>
    setActiveImageIndex((currentIndex) =>
      currentIndex === null || galleryImages.length <= 1
        ? currentIndex
        : (currentIndex - 1 + galleryImages.length) % galleryImages.length,
    );

  useEffect(() => {
    setActiveImageIndex(null);
  }, [images, allImages, startIndex]);

  useEffect(() => {
    if (activeImageIndex === null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeImagePreview();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextImage();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousImage();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeImageIndex, galleryImages.length]);

  const positionClasses = cardPositionClassesByCount[visibleImages.length] ?? cardPositionClassesByCount[1];
  const activeImage = activeImageIndex !== null ? galleryImages[activeImageIndex] : null;

  return (
    <>
      <div className="imageReveal">
        {visibleImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            className={`imageRevealCard imageRevealCard--${positionClasses[index] ?? 'center'}`}
            onClick={() => openImagePreview(index)}
            aria-label={`${index + 1}. görseli büyüt`}
          >
            <img src={image} alt={`Uygulama görseli ${index + 1}`} />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeImage ? (
          <motion.div
            className="imageRevealLightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Büyütülmüş görsel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImagePreview}
          >
            <motion.button
              type="button"
              className="imageRevealLightboxClose"
              onClick={closeImagePreview}
              aria-label="Büyütülmüş görseli kapat"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              Kapat
            </motion.button>
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="imageRevealLightboxNav prev"
                  aria-label="Önceki görsel"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToPreviousImage();
                  }}
                >
                  {'<'}
                </button>
                <button
                  type="button"
                  className="imageRevealLightboxNav next"
                  aria-label="Sonraki görsel"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToNextImage();
                  }}
                >
                  {'>'}
                </button>
              </>
            )}
            <motion.img
              className="imageRevealLightboxImage"
              src={activeImage}
              alt="Büyütülmüş uygulama görseli"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            />
            <motion.p className="imageRevealLightboxCount" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {(activeImageIndex ?? 0) + 1} / {galleryImages.length}
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
