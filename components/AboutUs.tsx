import React, { useState, useEffect, useRef } from 'react';
import { fetchStoreInfo } from '../services/geminiService';
import type { StoreInfo, Store, Director, GoldRates } from '../types';
import { StoreIcon, PlayIcon, PauseIcon } from './icons';

const carouselImages = [
  'https://placehold.co/1200x400/fefce8/ca8a04?text=Our+Legacy',
  'https://placehold.co/1200x400/fefce8/ca8a04?text=A+Tradition+of+Trust',
];

const ImageCarousel: React.FC<{ images: string[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
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

const RateUpdateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentRates: GoldRates;
  onSave: (newRates: GoldRates) => void;
}> = ({ isOpen, onClose, currentRates, onSave }) => {
  const [rates, setRates] = useState(currentRates);

  useEffect(() => {
    setRates(currentRates);
  }, [currentRates]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(rates);
    onClose();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof GoldRates) => {
    const value = e.target.value;
    setRates(prev => ({...prev, [key]: value === '' ? 0 : parseInt(value, 10)}));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast">
      <div className="bg-white border border-yellow-400 rounded-lg p-6 w-full max-w-sm m-4 shadow-2xl shadow-yellow-500/10">
        <h2 className="text-2xl font-bold text-yellow-600 mb-4 font-tinos">Update Gold Rates</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="rate24k" className="block text-sm font-medium text-gray-600">24 Karat Rate (per 10g)</label>
            <input type="number" id="rate24k" value={rates.rate24k} onChange={(e) => handleInputChange(e, 'rate24k')} className="mt-1 w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-900 outline-none focus:ring-2 focus:ring-yellow-500"/>
          </div>
           <div>
            <label htmlFor="rate22k" className="block text-sm font-medium text-gray-600">22 Karat Rate (per 10g)</label>
            <input type="number" id="rate22k" value={rates.rate22k} onChange={(e) => handleInputChange(e, 'rate22k')} className="mt-1 w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-900 outline-none focus:ring-2 focus:ring-yellow-500"/>
          </div>
           <div>
            <label htmlFor="rate18k" className="block text-sm font-medium text-gray-600">18 Karat Rate (per 10g)</label>
            <input type="number" id="rate18k" value={rates.rate18k} onChange={(e) => handleInputChange(e, 'rate18k')} className="mt-1 w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-900 outline-none focus:ring-2 focus:ring-yellow-500"/>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-yellow-500 text-white font-bold hover:bg-yellow-600 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}


const StoreCard: React.FC<{ store: Store }> = ({ store }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-yellow-400/50 shadow-lg shadow-yellow-500/20">
    <h3 className="text-2xl font-bold text-yellow-600 font-tinos mb-2">{store.name}</h3>
    <p className="text-gray-600 mb-1">{store.address}</p>
    <p className="text-gray-600">{store.phone}</p>
  </div>
);

const DirectorCard: React.FC<{ director: Director }> = ({ director }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-yellow-400/50 shadow-lg shadow-yellow-500/20">
    <h3 className="text-2xl font-bold text-yellow-600 font-tinos">{director.name}</h3>
    <p className="text-yellow-500 text-lg mb-2">{director.title}</p>
    <p className="text-gray-600">{director.bio}</p>
  </div>
);

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4">
        <div className="bg-gray-200 p-6 rounded-lg w-full h-24 animate-pulse"></div>
        <div className="bg-gray-200 p-6 rounded-lg w-full h-24 animate-pulse"></div>
    </div>
)


interface AboutUsProps {
  goldRates: GoldRates;
  setGoldRates: React.Dispatch<React.SetStateAction<GoldRates>>;
}

const AboutUs: React.FC<AboutUsProps> = ({ goldRates, setGoldRates }) => {
  const [info, setInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  // FIX: Initialize useRef with an explicit undefined value to satisfy the hook's signature
  // when a generic type is provided, and correct the type to allow for an undefined value.
  const longPressTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const getInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const storeInfo = await fetchStoreInfo();
        setInfo(storeInfo);
      } catch (err) {
        setError('Failed to load company information.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getInfo();
  }, []);

  const handleLongPress = () => {
    const pin = prompt("Enter Admin PIN to update rates:");
    if (pin === "5555") {
      setIsRateModalOpen(true);
    } else if (pin !== null) {
      alert("Incorrect PIN.");
    }
  };

  const handlePressStart = () => {
    longPressTimerRef.current = window.setTimeout(handleLongPress, 1500);
  };
  
  const handlePressEnd = () => {
    if(longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };


  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-8">
      <RateUpdateModal 
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        currentRates={goldRates}
        onSave={setGoldRates}
      />
      <ImageCarousel images={carouselImages} />
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-600 text-center mb-4 font-tinos flex items-center justify-center gap-3">
            <StoreIcon className="h-8 w-8"/>
            Our Locations
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {loading ? (
             <LoadingSkeleton/>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            info?.stores.map((store, index) => <StoreCard key={index} store={store} />)
          )}
        </div>
      </div>

      <div>
        <h2 
          className="text-3xl md:text-4xl font-bold text-yellow-600 text-center mb-4 font-tinos cursor-pointer"
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          title="Long press to update rates"
        >
          Our Directors
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {loading ? (
             <LoadingSkeleton/>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            info?.directors.map((director, index) => <DirectorCard key={index} director={director} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;