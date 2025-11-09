import React, { useState, useEffect } from 'react';
import type { GoldRates } from '../types';
import { PlayIcon, PauseIcon, ShareIcon } from './icons';

const carouselImages = [
  'https://placehold.co/1200x400/fefce8/ca8a04?text=Exquisite+Designs',
  'https://placehold.co/1200x400/fefce8/ca8a04?text=Timeless+Elegance',
  'https://placehold.co/1200x400/fefce8/ca8a04?text=Pure+Perfection',
];

const ImageCarousel: React.FC<{ images: string[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000); // Change image every 5 seconds
      return () => clearTimeout(timer);
    }
  }, [currentIndex, images.length, isPlaying]);

  return (
    <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden shadow-lg mb-8">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`Carousel image ${index + 1}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-black/20"></div>
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-yellow-500 w-4' : 'bg-gray-400/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute bottom-4 right-4 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors z-10"
        aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
      >
        {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
      </button>
    </div>
  );
};

const RateCard: React.FC<{ purity: string; rate: number; description: string }> = ({ purity, rate, description }) => (
  <div className="bg-gray-50 border border-yellow-400/50 rounded-lg p-6 shadow-lg shadow-yellow-500/20 text-center transform hover:scale-105 hover:border-yellow-500 transition-all duration-300">
    <h3 className="text-2xl font-bold text-yellow-600 font-tinos">{purity}</h3>
    <p className="text-4xl font-bold text-gray-900 my-2 font-tinos">
      ₹{rate.toLocaleString('en-IN')}
    </p>
    <p className="text-gray-500">{description}</p>
  </div>
);


interface LiveRatesProps {
  goldRates: GoldRates | null;
}

const LiveRates: React.FC<LiveRatesProps> = ({ goldRates }) => {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const handleShare = async () => {
    if (!goldRates) return;

    const shareText = `Today's Gold Rates from Shri Murari Jewellers:\n\n24 Karat: ₹${goldRates.rate24k.toLocaleString('en-IN')}/10g\n22 Karat: ₹${goldRates.rate22k.toLocaleString('en-IN')}/10g\n18 Karat: ₹${goldRates.rate18k.toLocaleString('en-IN')}/10g\n\nFind your perfect piece today!`;
    const shareData = {
        title: "Shri Murari Jewellers Gold Rates",
        text: shareText,
        url: window.location.href,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (error) {
            console.error('Error sharing:', error);
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareText);
            setShareStatus('copied');
            setTimeout(() => setShareStatus('idle'), 2000); // Reset after 2 seconds
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            alert('Failed to copy rates to clipboard.');
        }
    }
  };

  return (
    <div className="p-4 md:p-6 text-center animate-fade-in">
      <ImageCarousel images={carouselImages} />
      <div className="flex justify-center items-center gap-4 mb-2">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-600 font-tinos">
          Today's Gold Rate
        </h2>
         <button onClick={handleShare} className="relative p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition-colors" aria-label="Share gold rates">
          <ShareIcon className="h-6 w-6" />
          {shareStatus === 'copied' && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md animate-fade-in-fast">
              Copied!
            </span>
          )}
        </button>
      </div>
      <p className="text-gray-600 mb-8">Price per 10 grams (excluding GST & making charges)</p>

      {goldRates ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <RateCard purity="24 Karat" rate={goldRates.rate24k} description="99.9% Purity" />
          <RateCard purity="22 Karat" rate={goldRates.rate22k} description="91.6% Purity" />
          <RateCard purity="18 Karat" rate={goldRates.rate18k} description="75.0% Purity" />
        </div>
      ) : (
        <div className="h-[150px] flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-gray-500">Rates currently unavailable.</p>
        </div>
      )}
       <p className="text-gray-400 mt-6 text-xs">
          Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
};

export default LiveRates;