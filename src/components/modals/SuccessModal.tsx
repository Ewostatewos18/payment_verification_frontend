import React from 'react';
import { ExtractedData } from '../../types/verification';
import { formatCurrency, formatDate } from '../../utils/modalHelpers';

interface SuccessModalProps {
  displayData: ExtractedData;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ displayData, onClose }) => {

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Main Card - Matching Figma specs: 587x621px */}
      <div className="w-[587px] h-[621px] flex flex-col bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl p-6 gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center gap-4">
          
          {/* Success Icon */}
          <div className="w-[60px] h-[60px] flex items-center justify-center">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#34C759" strokeWidth="2" fill="none"/>
              <path d="M9 12L11 14L15 10" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Success Text */}
          <div className="font-['Inter'] font-bold text-2xl leading-8 text-[#34C759] text-center">
            Success
          </div>

          {/* Title */}
          <div className="font-['Inter'] font-bold text-xl leading-8 text-[#09090B] text-center">
            Transaction Verification Successful.
          </div>
          
          {/* Status Button */}
          <div className="w-[124px] h-8 flex flex-row justify-center items-center px-1 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
            <span className="font-['Inter'] font-medium text-sm leading-4 flex items-center text-[#FAFAFA]">
              Status: Complete
            </span>
          </div>
        </div>

        {/* Transaction Details Card - Separate bordered container like Figma */}
        <div className="w-[553px] h-[284px] flex flex-col bg-white border border-[#E4E4E7] rounded-xl p-6 gap-6">
          
          {/* Transaction Details Title */}
          <div className="font-['Inter'] font-bold text-lg leading-6 text-[#09090B]">
            Transaction Details
          </div>
          
          {/* Transaction Details Grid - Right-aligned values like Figma */}
          <div className="flex flex-col gap-3">
              {/* Sender Name */}
              <div className="flex flex-row justify-between items-center">
              <div className="font-['Inter'] font-normal text-sm leading-6 text-[#6B7280]">
                Sender Name:
              </div>
              <div className="font-['Inter'] font-normal text-sm leading-6 text-[#09090B] text-right">
                {displayData.sender_name || 'N/A'}
              </div>
            </div>
            
            {/* Sender Bank */}
            <div className="flex flex-row justify-between items-center">
              <div className="font-['Inter'] font-normal text-sm leading-6 text-[#6B7280]">
                Sender Bank:
              </div>
              <div className="font-['Inter'] font-normal text-sm leading-6 text-[#09090B] text-right">
                {displayData.sender_bank_name || 'N/A'}
              </div>
            </div>

            {/* Receiver Name */}
            <div className="flex flex-row justify-between items-center">
              <div className="font-['Inter'] font-normal text-sm leading-6 text-[#6B7280]">
                Receiver Name:
              </div>
              <div className="font-['Inter'] font-normal text-sm leading-6 text-[#09090B] text-right">
                {displayData.receiver_name || 'N/A'}
              </div>
            </div>
            
            {/* Amount */}
            <div className="flex flex-row justify-between items-center">
              <div className="font-['Inter'] font-normal text-sm leading-6 text-[#6B7280]">
                Amount:
              </div>
              <div className="font-['Inter'] font-normal text-sm leading-6 text-[#09090B] text-right">
                {formatCurrency(displayData.amount)}
              </div>
            </div>

            {/* Date */}
            <div className="flex flex-row justify-between items-center">
              <div className="font-['Inter'] font-normal text-sm leading-6 text-[#6B7280]">
                Date:
              </div>
              <div className="font-['Inter'] font-normal text-sm leading-6 text-[#09090B] text-right">
                {formatDate(displayData.transaction_date || displayData.date)}
              </div>
            </div>
          </div>
        </div>

        {/* Close Button - Centered */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="w-[200px] h-10 flex flex-row justify-center items-center px-6 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md font-['Inter'] font-medium text-sm leading-5 text-[#FAFAFA] hover:bg-[#2FB351] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
