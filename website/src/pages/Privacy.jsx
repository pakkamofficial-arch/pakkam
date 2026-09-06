import React from 'react';

export const Privacy = () => {
  return (
    <div className="container-custom py-12 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-4 text-xs text-slate-600 leading-relaxed">
        <p>
          At Pakkam, we prioritize customer privacy and transparency. This policy outlines how information is handled when you use the Pakkam application.
        </p>

        <h3 className="font-bold text-sm text-slate-900 pt-2">Information We Collect</h3>
        <p>
          When placing an order or using delivery services, we collect necessary contact information including mobile number, delivery address, and order selections to fulfill orders.
        </p>

        <h3 className="font-bold text-sm text-slate-900 pt-2">How We Use Information</h3>
        <p>
          Your information is used strictly to process orders, communicate delivery updates, and support customer service inquiries. We do not sell user data to third parties.
        </p>

        <h3 className="font-bold text-sm text-slate-900 pt-2">Contact Us</h3>
        <p>
          If you have any questions regarding privacy practices, please contact support at pakkamofficial@gmail.com.
        </p>
      </div>
    </div>
  );
};
