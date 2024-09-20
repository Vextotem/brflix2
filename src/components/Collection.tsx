/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import CollectionT from '@/types/Collection';
import Card from './Card';

export default function Collection({ title, items }: CollectionT) {
  const card = useRef<HTMLAnchorElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [indexMax, setIndexMax] = useState(0);

  function onBack() {
    if (index <= 0) return;
    setIndex(index - 1);
  }

  function onNext() {
    if (index >= indexMax) return;
    setIndex(index + 1);
  }

  function onResize() {
    if (!card.current) return;
    const el = card.current;
    const cardWidth = el.clientWidth + 15; // width of a card plus gap
    const sliderWidth = window.innerWidth - 120; // width of visible area minus padding
    const cardsCount = items.length;
    const cardsVisible = Math.floor(sliderWidth / cardWidth);
    const indexMax = Math.max(0, cardsCount - cardsVisible); // avoid negative indexMax
    setCardWidth(cardWidth);
    setIndexMax(indexMax);
    if (index > indexMax) setIndex(indexMax); // Ensure index doesn't exceed the max after resize
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
          style={{
            transform: `translateX(-${index * cardWidth}px)`,
            display: 'flex',
            transition: 'transform 0.3s ease-in-out',
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
