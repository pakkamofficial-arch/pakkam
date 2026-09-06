import React from 'react';
import { Smartphone } from 'lucide-react';
import { config } from '../config/env';

export const HowItWorks = () => {
  return (
    <div className="container-custom py-12 space-y-10 max-w-4xl">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">How Pakkam Works</h1>
        <p className="text-sm text-slate-600">
          Four simple steps from choosing your groceries to receiving your delivery.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-8">
        <div className="space-y-6">
          <div className="border-l-2 border-emerald-500 pl-4 space-y-1">
            <span className="text-xs font-bold text-emerald-700">STEP 01</span>
            <h3 className="text-base font-bold text-slate-900">Open Pakkam</h3>
            <p className="text-xs text-slate-600">Open the app and browse everyday essentials in your area.</p>
          </div>

          <div className="border-l-2 border-emerald-500 pl-4 space-y-1">
            <span className="text-xs font-bold text-emerald-700">STEP 02</span>
            <h3 className="text-base font-bold text-slate-900">Choose what you need</h3>
            <p className="text-xs text-slate-600">Add fresh vegetables, fruits, groceries and daily items to your cart.</p>
          </div>

          <div className="border-l-2 border-emerald-500 pl-4 space-y-1">
            <span className="text-xs font-bold text-emerald-700">STEP 03</span>
            <h3 className="text-base font-bold text-slate-900">Place your order</h3>
            <p className="text-xs text-slate-600">Confirm your delivery address and choose your payment option.</p>
          </div>

          <div className="border-l-2 border-emerald-500 pl-4 space-y-1">
            <span className="text-xs font-bold text-emerald-700">STEP 04</span>
            <h3 className="text-base font-bold text-slate-900">Get it delivered</h3>
            <p className="text-xs text-slate-600">Your order is prepared and delivered to your doorstep.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <a
            href={config.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
          >
            <Smartphone size={16} />
            <span>Download Pakkam Now</span>
          </a>
        </div>
      </div>
    </div>
  );
};
