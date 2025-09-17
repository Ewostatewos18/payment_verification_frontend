'use client';

import React from 'react';
import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter();

  const handleBankSelect = (bankName: string) => {
    router.push(`/${bankName.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      {/* Main Container - Responsive */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-start p-4 sm:p-6 lg:p-8">
        
        {/* Header Section - Responsive */}
        <div className="w-full flex flex-col items-center p-5 pb-3">
          <h1 className="w-full font-['Inter'] font-bold text-[28px] leading-[35px] text-center text-[#121417]">
            Verify your payment method
          </h1>
        </div>

        {/* Subtitle Section - Responsive */}
        <div className="w-full flex flex-col items-center p-1 pb-3">
          <p className="w-full font-['Inter'] font-normal text-base leading-6 text-center text-[#121417]">
            Select the bank associated with your payment method to proceed with verification.
          </p>
        </div>

        {/* Telebirr Card Section - Responsive */}
        <div className="w-full flex flex-col justify-center items-start p-4 border-b border-[#8C8C8C] border-opacity-50 relative">
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 rounded-lg">
            
            {/* Left Content - Title and Description */}
            <div className="flex-1 flex flex-col justify-center items-start gap-1">
              
              {/* Title */}
              <h3 className="font-['Inter'] font-semibold text-xl leading-5 text-[#09090B]">
                TeleBirr
              </h3>
              
              {/* Description */}
              <p className="font-['Inter'] font-normal text-base leading-5 text-[#71717A]">
                Verify mobile money transfer instantly.
              </p>
            </div>

            {/* Right Content - Logo */}
            <div className="w-full sm:w-48 h-24 sm:h-32 bg-cover bg-center" style={{ backgroundImage: 'url(/logos/telebirr.png)' }}></div>
          </div>
          
          {/* Clickable Overlay */}
          <button
            onClick={() => handleBankSelect('telebirr')}
            className="absolute inset-0 w-full h-full bg-transparent"
          ></button>
        </div>

        {/* Bank of Abyssinia Card Section - Responsive */}
        <div className="w-full flex flex-col justify-center items-start p-4 border-b border-[#8C8C8C] border-opacity-50 relative">
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 rounded-lg">
            
            {/* Left Content - Title and Description */}
            <div className="flex-1 flex flex-col justify-center items-start gap-1">
              {/* Title */}
              <h3 className="font-['Inter'] font-semibold text-xl leading-5 text-[#09090B]">
                Bank Of Abyssinia
              </h3>
              
              {/* Description */}
              <p className="font-['Inter'] font-normal text-base leading-5 text-[#71717A]">
                Validate Bank of Abyssinia Payments.
              </p>
            </div>

            {/* Right Content - Logo */}
            <div className="w-full sm:w-48 h-24 sm:h-32 bg-contain bg-no-repeat bg-center" style={{ backgroundImage: 'url(/logos/boa.png)' }}></div>
          </div>
          
          {/* Clickable Overlay */}
          <button
            onClick={() => handleBankSelect('boa')}
            className="absolute inset-0 w-full h-full bg-transparent">
            </button>
        </div>

        {/* Commercial Bank of Ethiopia Card Section - Responsive */}
        <div className="w-full flex flex-col justify-center items-start p-4 border-b border-[#8C8C8C] border-opacity-50 relative">
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 rounded-lg">
            
            {/* Left Content - Title and Description */}
            <div className="flex-1 flex flex-col justify-center items-start gap-1">
              
              {/* Title */}
              <h3 className="font-['Inter'] font-semibold text-xl leading-5 text-[#09090B]">
                Commercial Bank of Ethiopia
              </h3>
              
              {/* Description */}
              <p className="font-['Inter'] font-normal text-base leading-5 text-[#71717A]">
                Confirm CBE Transaction.
              </p>
            </div>

            {/* Right Content - Logo */}
            <div className="w-full sm:w-48 h-24 sm:h-32 bg-cover bg-center" style={{ backgroundImage: 'url(/logos/cbe.png)' }}></div>
          </div>
          
          {/* Clickable Overlay */}
          <button
            onClick={() => handleBankSelect('cbe')}
            className="absolute inset-0 w-full h-full bg-transparent"
          ></button>
        </div>

        {/* Next Button Section - Responsive */}
        <div className="w-full flex flex-row justify-center items-start p-3">
          <button className="w-24 h-10 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-8 py-2 hover:bg-[#2FB351] transition-colors">
            <span className="w-8 h-5 font-['Inter'] font-medium text-sm leading-5 text-[#FAFAFA] text-center">
              Next
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}



