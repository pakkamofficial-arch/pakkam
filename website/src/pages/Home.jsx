import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  ShoppingBag,
  MapPin,
  Receipt,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';
import appLogo from '../assets/app-logo.png';
import { config } from '../config/env';

export const Home = () => {
  return (
    <div className="space-y-16 py-8">
      {/* 1. HERO SECTION */}
      <section className="container-custom">
        <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-8 md:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold">
                <span>Local Grocery & Essentials</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Fresh groceries. <br className="hidden sm:inline" />
                <span className="text-emerald-700">Simple delivery.</span>
              </h1>

              <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-xl">
                Pakkam brings everyday essentials closer to you, with an easy way to shop and get your order delivered right to your doorstep.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={config.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Smartphone size={18} />
                  <span>Download Pakkam</span>
                </a>

                <a
                  href="#how-it-works"
                  className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm rounded-lg transition-colors"
                >
                  How It Works
                </a>
              </div>
            </div>

            {/* Right App Preview Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <img
                    src={appLogo}
                    alt="Pakkam Logo"
                    className="w-12 h-12 object-contain rounded-xl border border-slate-200"
                  />
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">PAKKAM App</h3>
                    <p className="text-xs text-slate-500">Everyday essentials delivered</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Browse nearby local grocery products</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Quick & transparent order checkout</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Fast doorstep delivery in your area</span>
                  </div>
                </div>

                <a
                  href={config.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Get Started on Mobile</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY PAKKAM */}
      <section id="why-pakkam" className="container-custom scroll-mt-24">
        <div className="space-y-8">
          <div className="max-w-2xl text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Pakkam?
            </h2>
            <p className="text-sm md:text-base text-slate-600 mt-2">
              Pakkam is built to make everyday shopping easier — without making the process complicated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Easy to use</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Find what you need and place your order in a few simple steps.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Local delivery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Designed around everyday shopping and delivery needs in your area.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Receipt size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Clear pricing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                See your order details and items clearly before you confirm.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Simple experience</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No unnecessary steps. Just shop, order and receive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW PAKKAM WORKS */}
      <section id="how-it-works" className="container-custom scroll-mt-24">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 space-y-8">
          <div className="max-w-xl text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              How Pakkam works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Getting your everyday groceries is quick and simple.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3 border-l-2 border-emerald-500 pl-4">
              <span className="text-xs font-extrabold text-emerald-700 tracking-wider">STEP 01</span>
              <h3 className="font-bold text-base text-slate-900">Open Pakkam</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open the app and browse everyday essentials.
              </p>
            </div>

            <div className="space-y-3 border-l-2 border-emerald-500 pl-4">
              <span className="text-xs font-extrabold text-emerald-700 tracking-wider">STEP 02</span>
              <h3 className="font-bold text-base text-slate-900">Choose what you need</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add the products you want to your cart.
              </p>
            </div>

            <div className="space-y-3 border-l-2 border-emerald-500 pl-4">
              <span className="text-xs font-extrabold text-emerald-700 tracking-wider">STEP 03</span>
              <h3 className="font-bold text-base text-slate-900">Place your order</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Confirm your address and choose your payment option.
              </p>
            </div>

            <div className="space-y-3 border-l-2 border-emerald-500 pl-4">
              <span className="text-xs font-extrabold text-emerald-700 tracking-wider">STEP 04</span>
              <h3 className="font-bold text-base text-slate-900">Get it delivered</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your order is prepared and delivered to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SCAN & DOWNLOAD */}
      <section id="scan-download" className="container-custom scroll-mt-24">
        <div className="bg-emerald-900 text-white rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Get Pakkam on your phone
              </h2>
              <p className="text-sm md:text-base text-emerald-100 max-w-lg leading-relaxed">
                Scan the QR code with your phone camera or click below to download the application directly.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href={config.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white text-emerald-950 font-bold text-sm rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
                >
                  <Smartphone size={18} />
                  <span>Download Pakkam</span>
                </a>
                <span className="text-xs text-emerald-200 font-medium">Android app available</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="bg-white p-5 rounded-xl text-center space-y-3 shadow-md">
                <div className="bg-white p-2 border border-slate-200 rounded-lg inline-block">
                  <QRCodeSVG
                    value={config.downloadUrl}
                    size={140}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <p className="text-xs font-semibold text-slate-700">Scan to Download</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ABOUT PAKKAM */}
      <section id="about" className="container-custom scroll-mt-24">
        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-4">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            About Pakkam
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Pakkam is built to make everyday shopping more convenient. We bring essential groceries and everyday products together in one simple app, with delivery designed around the needs of local customers.
          </p>
        </div>
      </section>

      {/* 6. CONTACT */}
      <section id="contact" className="container-custom scroll-mt-24">
        <div className="space-y-6">
          <div className="max-w-xl text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Have a question?
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Reach out to us through any of our official contact channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.supportEmail && (
              <a
                href={`mailto:${config.supportEmail}`}
                className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-6 space-y-3 transition-colors group block"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                  <Mail size={20} />
                </div>
                <h3 className="font-bold text-base text-slate-900">Email Us</h3>
                <p className="text-xs text-slate-600">{config.supportEmail}</p>
              </a>
            )}

            {config.supportPhone && (
              <a
                href={`tel:${config.supportPhone}`}
                className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-6 space-y-3 transition-colors group block"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
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
                className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-6 space-y-3 transition-colors group block"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                  <MessageSquare size={20} />
                </div>
                <h3 className="font-bold text-base text-slate-900">WhatsApp Support</h3>
                <p className="text-xs text-slate-600">Chat with support</p>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
