import React from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import { config } from '../config/env';

export const Contact = () => {
  return (
    <div className="container-custom py-12 space-y-10 max-w-4xl">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Have a question?</h1>
        <p className="text-sm text-slate-600">
          We are here to help. Get in touch with us through any of the channels below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {config.supportEmail && (
          <a
            href={`mailto:${config.supportEmail}`}
            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-6 space-y-3 transition-colors block"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Mail size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">Email Us</h3>
            <p className="text-xs text-slate-600">{config.supportEmail}</p>
          </a>
        )}

        {config.supportPhone && (
          <a
            href={`tel:${config.supportPhone}`}
            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-6 space-y-3 transition-colors block"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Phone size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">Call Us</h3>
            <p className="text-xs text-slate-600">{config.supportPhone}</p>
          </a>
        )}

        {config.whatsappUrl && (
          <a
            href={config.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-6 space-y-3 transition-colors block"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">WhatsApp Support</h3>
            <p className="text-xs text-slate-600">Chat with support</p>
          </a>
        )}
      </div>
    </div>
  );
};
