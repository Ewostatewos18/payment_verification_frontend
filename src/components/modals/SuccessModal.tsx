import React from 'react';
import { VerificationResponse, ExtractedData } from '../../types/verification';
import { formatCurrency, formatDate, formatTime, isTestTransaction } from '../../utils/modalHelpers';

interface SuccessModalProps {
  response: VerificationResponse;
  displayData: ExtractedData;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ response, displayData, onClose }) => {
  const isTest = isTestTransaction(displayData);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Main Card */}
      <div className="w-[559px] h-[364px] flex flex-col items-center p-0 gap-0.5 bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
        
        {/* Success Card */}
        <div className="w-[553px] h-[225px] relative bg-white">
          
          {/* Success Icon and Text */}
          <div className="absolute w-[83px] h-[80px] left-[235px] top-6 flex flex-col items-center gap-2.5">
            {/* Check Circle Icon */}
            <div className="w-[50px] h-[50px] flex items-center justify-center">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="1.5" fill="none"/>
                <path d="M9 12L11 14L15 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Success Text */}
            <div className="w-[59px] h-5 font-['Inter'] font-bold text-xl leading-5 text-[#10B981]">
              {isTest ? 'Test' : 'Success'}
            </div>
          </div>

          {/* Main Content */}
          <div className="absolute w-[349px] h-[68px] left-[102px] top-[134px] flex flex-col items-center gap-4">
            
            {/* Title */}
            <div className="w-[208px] h-5 font-['Inter'] font-semibold text-xl leading-5 text-[#09090B] text-center whitespace-nowrap">
              {isTest ? 'Test Transaction Verified' : 'Transaction Verified'}
            </div>
            
            {/* Status Button */}
            <div className="w-[102px] h-8 flex flex-row justify-center items-center px-3 py-2 gap-2 bg-[#10B981] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <span className="w-[78px] h-4 font-['Inter'] font-medium text-xs leading-4 flex items-center text-[#FAFAFA]">
                Status: {isTest ? 'Test' : 'Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="w-[500px] h-[120px] flex flex-col items-center gap-4 p-6">
          
          {/* Transaction ID */}
          <div className="w-[500px] h-6 flex flex-row items-center gap-2">
            <div className="w-[120px] h-6 font-['Inter'] font-medium text-sm leading-6 text-[#6B7280]">
              Transaction ID:
            </div>
            <div className="w-[360px] h-6 font-['Inter'] font-normal text-sm leading-6 text-[#09090B]">
              {displayData.transaction_id || displayData.possible_transaction_id || 'N/A'}
            </div>
          </div>

          {/* Amount */}
          <div className="w-[500px] h-6 flex flex-row items-center gap-2">
            <div className="w-[120px] h-6 font-['Inter'] font-medium text-sm leading-6 text-[#6B7280]">
              Amount:
            </div>
            <div className="w-[360px] h-6 font-['Inter'] font-normal text-sm leading-6 text-[#09090B]">
              {formatCurrency(displayData.amount)}
            </div>
          </div>

          {/* Date */}
          <div className="w-[500px] h-6 flex flex-row items-center gap-2">
            <div className="w-[120px] h-6 font-['Inter'] font-medium text-sm leading-6 text-[#6B7280]">
              Date:
            </div>
            <div className="w-[360px] h-6 font-['Inter'] font-normal text-sm leading-6 text-[#09090B]">
              {formatDate(displayData.transaction_date || displayData.date)}
            </div>
          </div>

          {/* Close Button */}
          <div className="w-[200px] h-10 flex flex-row justify-center items-center px-6 py-2 gap-2 bg-[#10B981] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
            <button
              onClick={onClose}
              className="w-[168px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
