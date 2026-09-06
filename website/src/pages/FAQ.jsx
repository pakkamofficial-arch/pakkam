import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const FAQ = () => {
  const [activeIdx, setActiveIdx] = useState(null);

  const list = [
    {
      q: 'Do I need an account or password to order on Pakkam?',
      a: 'No! You can order directly as a guest by entering your name, phone number, and delivery address at checkout. No account or password is ever required.',
    },
    {
      q: 'How fast will my order be delivered?',
      a: 'Orders are delivered within 1 to 2 hours directly from your nearest verified local seller.',
    },
    {
      q: 'How do I track my guest order?',
      a: 'Simply click "Track Order" in the top navigation bar and enter your Order Number and Phone Number. You will see a live status timeline and your 4-digit delivery OTP.',
    },
    {
      q: 'What payment methods are supported?',
      a: 'We accept Cash on Delivery (COD) as well as online payments via Razorpay (UPI, Credit/Debit Cards, Net Banking).',
    },
    {
      q: 'Are product prices accurate?',
      a: 'Yes, product prices are synced directly with local partner stores and recomputed server-side during checkout.',
    },
  ];

  return (
    <div className="container-custom py-12 max-w-3xl space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h1>
        <p className="text-xs text-slate-500">Everything you need to know about shopping on PAKKAM</p>
      </div>

      <div className="space-y-4">
        {list.map((item, idx) => {
          const isOpen = activeIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setActiveIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left font-bold text-slate-900 text-sm flex justify-between items-center"
              >
                <span>{item.q}</span>
                {isOpen ? <ChevronUp size={18} className="text-emerald-600" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
