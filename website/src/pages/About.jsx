import React from 'react';
import { Smartphone, CheckCircle2 } from 'lucide-react';
import { config } from '../config/env';

export const About = () => {
  return (
    <div className="container-custom py-12 space-y-12 max-w-4xl">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">About Pakkam</h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Pakkam is built to make everyday shopping more convenient. We bring essential groceries and everyday products together in one simple app, with delivery designed around the needs of local customers.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">What We Focus On</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>Simple Shopping</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              Clear categories and straightforward checkout without unnecessary steps or complicated processes.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>Reliable Delivery</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              Orders are prepared carefully and delivered to your doorstep in your local area.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4">
          <a
            href={config.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2"
          >
            <Smartphone size={16} />
            <span>Download Mobile App</span>
          </a>
        </div>
      </div>
    </div>
  );
};
