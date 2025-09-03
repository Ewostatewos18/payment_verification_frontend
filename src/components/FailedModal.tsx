'use client';

import React from 'react';

interface FailedModalProps {
  onClose: () => void;
  onRetry: () => void;
  errorMessage: string;
}

export default function FailedModal({ onClose, onRetry, errorMessage }: FailedModalProps) {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Main Card */}
      <div className="w-[559px] h-[364px] flex flex-col items-center p-0 gap-0.5 bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
        
        {/* Failed Card */}
        <div className="w-[553px] h-[225px] relative bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
          
          {/* Failed Icon and Text */}
          <div className="absolute w-[83px] h-[80px] left-[235px] top-6 flex flex-col items-center gap-2.5">
            {/* Shield Alert Icon */}
            <div className="w-[50px] h-[50px] flex items-center justify-center">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="#FF383C"/>
                <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Failed Text */}
            <div className="w-[59px] h-5 font-['Inter'] font-bold text-xl leading-5 text-[#FF383C]">
              Failed
            </div>
          </div>

          {/* Main Content */}
          <div className="absolute w-[349px] h-[68px] left-[102px] top-[134px] flex flex-col items-center gap-4">
            
            {/* Title */}
            <div className="w-[208px] h-5 font-['Inter'] font-semibold text-xl leading-5 text-[#09090B] text-center">
              Invalid Transaction ID
            </div>
            
            {/* Status Button */}
            <div className="w-[102px] h-8 flex flex-row justify-center items-center px-3 py-2 gap-2 bg-[#FF383C] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <span className="w-[78px] h-4 font-['Inter'] font-medium text-xs leading-4 flex items-center text-[#FAFAFA]">
                Status: Failed
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="w-[432px] h-[112px] flex flex-col items-center gap-8">
          
          {/* Error Message */}
          <div className="w-[432px] h-10 font-['Inter'] font-normal text-base leading-5 text-center text-[#8C8C8C]">
            {errorMessage}
          </div>

          {/* Action Buttons */}
          <div className="w-[220px] h-10 flex flex-row items-center gap-[18px]">
            
            {/* Retry Button */}
            <div className="w-[100px] h-10 flex flex-row justify-center items-center px-8 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <button
                onClick={onRetry}
                className="w-[36px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]"
              >
                Retry
              </button>
            </div>

            {/* Close Button */}
            <div className="w-[102px] h-10 flex flex-row justify-center items-center px-8 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <button
                onClick={onClose}
                className="w-[38px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
