'use client';

import { useState } from 'react';
import type { ProductImage } from '@/types';
import { useT } from './LangProvider';

export default function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [i, setI] = useState(0);
  const t = useT().product;
  const current = images[Math.min(i, images.length - 1)];

  if (!current) {
    return (
      <div className="gallery">
        <div className="gallery__main gallery__main--empty">
          <img src="/brand/emblem.png" alt="" width={256} height={256} />
        </div>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="gallery__main">
        <img src={current.url} alt={name} width={1000} height={1000} fetchPriority="high" />
      </div>
      {images.length > 1 && (
        <div className="gallery__thumbs">
          {images.map((img, n) => (
            <button
              key={img.url}
              type="button"
              className={n === i ? 'is-active' : ''}
              onClick={() => setI(n)}
              aria-label={t.photo(n + 1, images.length)}
              aria-pressed={n === i}
            >
              <img src={img.thumb} alt="" width={96} height={96} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
