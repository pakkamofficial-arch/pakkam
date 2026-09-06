import React from 'react';

export const Terms = () => {
  return (
    <div className="container-custom py-12 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-4 text-xs text-slate-600 leading-relaxed">
        <p>
          Welcome to Pakkam. By using our application and website services, you agree to comply with the terms and conditions outlined below.
        </p>

        <h3 className="font-bold text-sm text-slate-900 pt-2">Service Availability</h3>
        <p>
          Delivery services and product availability are subject to local area serviceability and stock levels at the time of order placement.
        </p>

        <h3 className="font-bold text-sm text-slate-900 pt-2">Order Fulfillment</h3>
        <p>
          Orders confirmed through the app will be processed and delivered to the provided delivery address. Payment details and final totals are shown prior to order placement.
        </p>

        <h3 className="font-bold text-sm text-slate-900 pt-2">Updates to Terms</h3>
        <p>
          Terms may be updated periodically to reflect service improvements or legal compliance requirements.
        </p>
      </div>
    </div>
  );
};
