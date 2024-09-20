/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import CollectionT from '@/types/Collection';
import Card from './Card';

export default function Collection({ title, items }: CollectionT) {
  const card = useRef<HTMLAnchorElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [indexMax, setIndexMax] = useState(0);

  function onBack() {
    if (index <= 0) return;
    const newIndex = index - 1;
    setIndex(newIndex);
    scrollToIndex(newIndex);
  }

  function onNext() {
    if (index >= indexMax) return;
    const newIndex = index + 1;
    setIndex(newIndex);
    scrollToIndex(newIndex);
  }

  function scrollToIndex(newIndex: number) {
    if (!cardsContainerRef.current || !card.current) return;
    const cardWidth = card.current.clientWidth + 15; // Include the margin or spacing
    const scrollPos = newIndex * cardWidth;
    cardsContainerRef.current.scrollTo({
      left: scrollPos,
      behavior: 'smooth',
    });
  }

  function onResize() {
    if (!card.current) return;
    const el = card.current;
    const cardWidth = el.clientWidth + 15;
    const sliderWidth = window.innerWidth - 120;
    const cardsCount = items.length;
    const cardsVisible = Math.floor(sliderWidth / cardWidth);
    const indexMax = cardsCount - cardsVisible;
    setIndexMax(indexMax - 1);
  }

  useEffect(() => {
    if (!card.current) return;
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [card]);

  return (
    <div className="collection">
      <h2 className="collection-title">{title}</h2>

      <div className="collection-slider">
        {/* Left Arrow */}
        {index > 0 && (
          <div className="arrow left-arrow" onClick={onBack}>
            &#9664;
          </div>
        )}

        <div
          className="collection-cards"
          ref={cardsContainerRef}
          style={{
            display: 'flex',
            overflowX: 'auto', // Allow horizontal scrolling
            scrollBehavior: 'smooth', // Smooth scroll when using scrollTo
          }}
        >
          {items.map((item, i) => {
            return <Card key={i} Ref={i === 0 ? card : undefined} {...item} />;
          })}
        </div>

        {/* Right Arrow */}
        {index < indexMax && (
          <div className="arrow right-arrow" onClick={onNext}>
            &#9654;
          </div>
        )}
      </div>
    </div>
  );
}
