import React, { useState } from 'react';
import LiveRates from './components/LiveRates';
import Calculator from './components/Calculator';
import AboutUs from './components/AboutUs';
import { GoldBarIcon, CalculatorIcon, StoreIcon } from './components/icons';
import { Tab } from './types';
import type { GoldRates } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Rates);
  const [goldRates, setGoldRates] = useState<GoldRates>({
    rate24k: 72500,
    rate22k: 67100,
    rate18k: 55200,
  });

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Rates:
        return <LiveRates goldRates={goldRates} />;
      case Tab.Calculator:
        return <Calculator goldRates={goldRates} />;
      case Tab.About:
        return <AboutUs goldRates={goldRates} setGoldRates={setGoldRates} />;
      default:
        return null;
    }
  };

  const NavItem: React.FC<{ tab: Tab; label: string; icon: React.ReactNode }> = ({ tab, label, icon }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`flex-1 flex flex-col items-center justify-center p-2 transition-colors duration-300 ${isActive ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-500'}`}
      >
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </button>
    );
  };
  
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <header className="p-4 text-center bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-gray-800 font-tinos">
          Shri Murari Jewellers <span className="text-yellow-600">Pvt. Ltd.</span>
        </h1>
      </header>

      <main className="flex-grow container mx-auto px-4 py-4 mb-20">
         {/* Desktop navigation */}
        <nav className="hidden md:flex justify-center pt-2 pb-6">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
            <TabItem tab={Tab.Rates} label="Live Rates" />
            <TabItem tab={Tab.Calculator} label="Calculator" />
            <TabItem tab={Tab.About} label="About Us" />
          </div>
        </nav>
        {renderContent()}
      </main>

       {/* Mobile navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg flex justify-around md:hidden">
        <NavItem tab={Tab.Rates} label="Rates" icon={<GoldBarIcon className="h-6 w-6 mb-1" />} />
        <NavItem tab={Tab.Calculator} label="Calculator" icon={<CalculatorIcon className="h-6 w-6 mb-1" />} />
        <NavItem tab={Tab.About} label="About Us" icon={<StoreIcon className="h-6 w-6 mb-1" />} />
      </nav>
    </div>
  );

  function TabItem({ tab, label }: { tab: Tab; label: string }) {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive ? 'bg-yellow-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        {label}
      </button>
    );
  }
};

export default App;