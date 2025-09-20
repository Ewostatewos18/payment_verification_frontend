import React from 'react';
import { ExtractedData } from '../../types/verification';
import { formatCurrency, formatDate } from '../../utils/modalHelpers';

interface SuccessModalProps {
  displayData: ExtractedData;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ displayData, onClose }) => {

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Main Card - Responsive */}
      <div className="w-full max-w-[587px] h-auto min-h-[400px] sm:min-h-[621px] flex flex-col bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl p-4 sm:p-6 gap-4 sm:gap-6">
        
        {/* Header Section - Responsive */}
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
          
          {/* Success Icon - Responsive */}
          <div className="w-12 h-12 sm:w-[60px] sm:h-[60px] flex items-center justify-center">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="12" cy="12" r="10" stroke="#34C759" strokeWidth="2" fill="none"/>
              <path d="M9 12L11 14L15 10" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Success Text - Responsive */}
          <div className="font-['Inter'] font-bold text-xl sm:text-2xl leading-8 text-[#34C759] text-center">
            Success
          </div>

          {/* Title - Responsive */}
          <div className="font-['Inter'] font-bold text-lg sm:text-xl leading-6 sm:leading-8 text-[#09090B] text-center">
            Transaction Verification Successful.
          </div>
          
          {/* Status Button - Responsive */}
          <div className="w-auto h-8 flex flex-row justify-center items-center px-3 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
            <span className="font-['Inter'] font-medium text-sm leading-4 flex items-center text-[#FAFAFA]">
              Status: Complete
            </span>
          </div>
        </div>

        {/* Transaction Details Card - Responsive */}
        <div className="w-full h-auto flex flex-col bg-white border border-[#E4E4E7] rounded-xl p-4 sm:p-6 gap-4 sm:gap-6">
          
          {/* Transaction Details Title - Responsive */}
          <div className="font-['Inter'] font-bold text-base sm:text-lg leading-6 text-[#09090B]">
            Transaction Details
          </div>
          
          {/* Transaction Details Grid - Responsive */}
          <div className="flex flex-col gap-2 sm:gap-3">
              {/* Sender Name - Responsive */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1 sm:gap-2">
                <div className="font-['Inter'] font-normal text-xs sm:text-sm leading-6 text-[#6B7280]">
                  Sender Name:
                </div>
                <div className="font-['Inter'] font-normal text-xs sm:text-sm leading-6 text-[#09090B] sm:text-right break-words">
                  {displayData.sender_name || 'N/A'}
                </div>
              </div>
              
              {/* Sender Bank - Responsive */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1 sm:gap-2">
                <div className="font-['Inter'] font-normal text-xs sm:text-sm leading-6 text-[#6B7280]">
                  Sender Bank:
                </div>
                <div className="font-['Inter'] font-normal text-xs sm:text-sm leading-6 text-[#09090B] sm:text-right break-words">
                  {displayData.sender_bank_name || 'N/A'}
                </div>
              </div>

              {/* Receiver Name - Responsive */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1 sm:gap-2">
                <div className="font-['Inter'] font-normal text-xs sm:text-sm leading-6 text-[#6B7280]">
                  Receiver Name:
                </div>
                <div className="font-['Inter'] font-normal text-xs sm:text-sm leading-6 text-[#09090B] sm:text-right break-words">
                  {displayData.receiver_name || 'N/A'}
                </div>
              </div>
              
              {/* Amount - Responsive */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1 sm:gap-2">
                <div className="font-['Inter'] font-normal text-xs sm:text-sm leading-6 text-[#6B7280]">
                  Amount:
                </div>
                <div className="font-['Inter'] font-normal text-xs sm:text-sm leading-6 text-[#09090B] sm:text-right break-words">
                  {formatCurrency(displayData.amount)}
                </div>
              </div>

              {/* Date - Responsive */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1 sm:gap-2">
                <div className="font-['Inter'] font-normal text-xs sm:text-sm leading-6 text-[#6B7280]">
                  Date:
              </div>
              <div className="font-['Inter'] font-normal text-xs sm:text-sm leading-6 text-[#09090B] sm:text-right break-words">
                {formatDate(displayData.transaction_date || displayData.date)}
              </div>
            </div>
          </div>
        </div>

        {/* Close Button - Responsive */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="w-full sm:w-[200px] h-10 flex flex-row justify-center items-center px-6 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md font-['Inter'] font-medium text-sm leading-5 text-[#FAFAFA] hover:bg-[#2FB351] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
