'use client';

import React from 'react';

interface SuccessModalProps {
  onClose: () => void;
  transactionData: {
    senderBank: string;
    receiverName: string;
    amount: string;
    date: string;
  };
}

export default function SuccessModal({ onClose, transactionData }: SuccessModalProps) {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Main Card */}
      <div className="w-[587px] h-[621px] flex flex-col justify-end items-center p-6 gap-6 bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
        
        {/* Success Card */}
        <div className="w-[553px] h-[225px] relative bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
          
          {/* Success Icon and Text */}
          <div className="absolute w-[83px] h-[80px] left-[235px] top-6 flex flex-col items-center gap-2.5">
            {/* Check Icon */}
            <div className="w-[50px] h-[50px] flex items-center justify-center">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#34C759"/>
                <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Success Text */}
            <div className="w-[84px] h-5 font-['Inter'] font-bold text-xl leading-5 text-[#34C759]">
              Success
            </div>
          </div>

          {/* Main Content */}
          <div className="absolute w-[349px] h-[68px] left-[102px] top-[134px] flex flex-col items-center gap-4">
            
            {/* Title */}
            <div className="w-[349px] h-5 font-['Inter'] font-semibold text-xl leading-5 text-[#09090B] text-center">
              Transaction Verification Successful.
            </div>
            
            {/* Status Button */}
            <div className="w-[124px] h-8 flex flex-row justify-center items-center px-3 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <span className="w-[100px] h-4 font-['Inter'] font-medium text-xs leading-4 flex items-center text-[#FAFAFA]">
                Status: Complete
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Details Card */}
        <div className="w-[553px] h-[284px] flex flex-col items-start p-6 gap-6 bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
          
          {/* Transaction Details Title */}
          <div className="w-[505px] h-[23px] font-['Inter'] font-semibold text-xl leading-5 text-[#09090B]">
            Transaction Details
          </div>

          {/* Details List */}
          <div className="w-[505px] flex flex-col gap-4">
            
            {/* Sender Bank */}
            <div className="w-[505px] h-5 flex flex-row justify-between items-center gap-[35px]">
              <span className="w-[85px] h-5 font-['Inter'] font-normal text-sm leading-5 text-[#71717A]">
                Sender Bank
              </span>
              <span className="w-[192px] h-5 font-['Inter'] font-normal text-sm leading-5 text-[#09090B]">
                {transactionData.senderBank}
              </span>
            </div>

            {/* Receiver Name */}
            <div className="w-[505px] h-5 flex flex-row justify-between items-center gap-[35px]">
              <span className="w-[100px] h-5 font-['Inter'] font-normal text-sm leading-5 text-[#71717A]">
                Receiver Name
              </span>
              <span className="w-[159px] h-5 font-['Inter'] font-normal text-sm leading-5 text-[#09090B]">
                {transactionData.receiverName}
              </span>
            </div>

            {/* Amount */}
            <div className="w-[505px] h-5 flex flex-row justify-between items-center gap-[35px]">
              <span className="w-[52px] h-5 font-['Inter'] font-normal text-sm leading-5 text-[#71717A]">
                Amount
              </span>
              <span className="w-[106px] h-5 font-['Inter'] font-normal text-sm leading-5 text-[#09090B]">
                {transactionData.amount}
              </span>
            </div>

            {/* Date */}
            <div className="w-[505px] h-5 flex flex-row justify-between items-center gap-[35px]">
              <span className="w-[32px] h-5 font-['Inter'] font-normal text-sm leading-5 text-[#71717A]">
                Date
              </span>
              <span className="w-[181px] h-5 font-['Inter'] font-normal text-sm leading-5 text-[#09090B]">
                {transactionData.date}
              </span>
            </div>
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
  );
}
