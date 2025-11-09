import React, { useState, useMemo } from 'react';
import type { GoldRates } from '../types';
import { ShareIcon } from './icons';

// A custom Switch component for the options
const Switch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string; }> = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-gray-700">{label}</span>
        <div className="relative">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
            <div className={`block w-12 h-6 rounded-full transition-colors ${checked ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
    </label>
);


const Calculator: React.FC<{ goldRates: GoldRates | null; }> = ({ goldRates }) => {
    const [weight, setWeight] = useState<string>('10');
    const [purity, setPurity] = useState<'22k' | '18k'>('22k');
    const [includeGST, setIncludeGST] = useState(true);
    const [includeMaking, setIncludeMaking] = useState(true);
    const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

    const parsedWeight = useMemo(() => {
        const num = parseFloat(weight);
        return isNaN(num) || num < 0 ? 0 : num;
    }, [weight]);

    const calculations = useMemo(() => {
        if (!goldRates || parsedWeight === 0) {
            return { goldValue: 0, makingCharge: 0, subTotal: 0, gstAmount: 0, totalPrice: 0, makingChargePercent: 0 };
        }
        
        const purityRate = purity === '22k' ? goldRates.rate22k : goldRates.rate18k;
        const makingChargePercent = purity === '22k' ? 0.04 : 0.055;
        
        const goldValue = (purityRate / 10) * parsedWeight;
        const makingCharge = includeMaking ? goldValue * makingChargePercent : 0;
        const subTotal = goldValue + makingCharge;
        const gstAmount = includeGST ? subTotal * 0.03 : 0;
        const totalPrice = subTotal + gstAmount;

        return { goldValue, makingCharge, subTotal, gstAmount, totalPrice, makingChargePercent };
    }, [goldRates, parsedWeight, purity, includeGST, includeMaking]);

    const handleShare = async () => {
        const { totalPrice, goldValue, makingCharge, gstAmount } = calculations;
        if (totalPrice === 0) return;

        let shareText = `Gold Price Estimate from Shri Murari Jewellers:\n\n`;
        shareText += `Weight: ${parsedWeight}g\n`;
        shareText += `Purity: ${purity === '22k' ? '22 Karat' : '18 Karat'}\n`;
        shareText += `--------------------\n`;
        shareText += `Gold Value: ₹${goldValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
        if (includeMaking) shareText += `Making Charges: ₹${makingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
        if (includeGST) shareText += `GST (3%): ₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
        shareText += `--------------------\n`;
        shareText += `Total Price: ₹${totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n`;
        shareText += `Calculate your own estimate!`;

        const shareData = {
            title: "Shri Murari Jewellers Price Estimate",
            text: shareText,
            url: window.location.href
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
                setTimeout(() => setShareStatus('idle'), 2000);
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                alert('Failed to copy estimate to clipboard.');
            }
        }
    };


    return (
        <div className="p-4 md:p-6 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-600 text-center mb-6 font-tinos">
                Price Calculator
            </h2>
            
            {!goldRates && (
                <div className="bg-yellow-100/50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg text-center mb-6">
                    Rates are not currently set. Please check the 'Rates' tab.
                </div>
            )}

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
                    <div>
                        <label htmlFor="weight" className="block text-lg text-gray-700 font-semibold mb-2">
                            Enter Weight (in grams)
                        </label>
                        <input
                            id="weight"
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="e.g., 10"
                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 text-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-lg text-gray-700 font-semibold mb-2">
                            Select Purity
                        </label>
                        <div className="flex bg-gray-200 rounded-lg p-1">
                            <button onClick={() => setPurity('22k')} className={`flex-1 p-2 rounded-md font-semibold transition-colors ${purity === '22k' ? 'bg-yellow-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                                22 Karat
                            </button>
                             <button onClick={() => setPurity('18k')} className={`flex-1 p-2 rounded-md font-semibold transition-colors ${purity === '18k' ? 'bg-yellow-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                                18 Karat
                            </button>
                        </div>
                    </div>
                     <div className="space-y-4 pt-4 border-t border-gray-200">
                        <Switch 
                            checked={includeMaking} 
                            onChange={setIncludeMaking} 
                            label={`Include Making Charges (${(calculations.makingChargePercent * 100).toFixed(1)}%)`}
                        />
                         <Switch 
                            checked={includeGST} 
                            onChange={setIncludeGST} 
                            label="Include GST (3%)"
                        />
                    </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="bg-yellow-500/10 p-6 rounded-lg border border-yellow-500/30 flex flex-col justify-center">
                    <div className="space-y-3 text-lg">
                       <div className="flex justify-between items-baseline">
                           <span className="text-gray-600">Gold Value</span>
                           <span className="font-semibold text-gray-800">₹{calculations.goldValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                       </div>
                       <div className="flex justify-between items-baseline">
                           <span className="text-gray-600">Making Charges</span>
                           <span className="font-semibold text-gray-800">₹{calculations.makingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                       </div>
                       <div className="flex justify-between items-baseline text-xl font-bold border-t border-yellow-500/30 pt-3">
                           <span className="text-gray-700">Subtotal</span>
                           <span className="text-gray-900">₹{calculations.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                       </div>
                       <div className="flex justify-between items-baseline">
                           <span className="text-gray-600">GST (3%)</span>
                           <span className="font-semibold text-gray-800">₹{calculations.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                       </div>
                    </div>
                     <div className="border-t-2 border-dashed border-yellow-600/50 mt-4 pt-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                           <p className="text-lg text-yellow-800 font-semibold">Total Estimated Price</p>
                           <button onClick={handleShare} className="relative p-1 text-yellow-700 hover:bg-yellow-200 rounded-full transition-colors" aria-label="Share price calculation">
                               <ShareIcon className="h-5 w-5" />
                               {shareStatus === 'copied' && (
                                   <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md animate-fade-in-fast">
                                       Copied!
                                   </span>
                               )}
                           </button>
                        </div>
                        <p className="text-5xl font-bold text-yellow-700 mt-1 font-tinos">
                            ₹{calculations.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>
            <p className="text-center text-gray-500 mt-8 text-sm">
                Calculations are approximate. Final price may vary based on the final product weight and prevailing market rates.
            </p>
        </div>
    );
};

export default Calculator;