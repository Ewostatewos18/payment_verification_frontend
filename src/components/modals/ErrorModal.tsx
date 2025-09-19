import React from 'react';
import { VerificationResponse } from '../../types/verification';
import { getErrorInfo } from '../../utils/modalHelpers';

interface ErrorModalProps {
  response: VerificationResponse;
  onClose: () => void;
  onRetry?: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ response, onClose, onRetry }) => {
  const errorInfo = getErrorInfo(response);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Main Card - Exact Figma specs: 559x364px */}
      <div className="w-[559px] h-[364px] bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl flex flex-col items-center p-0 gap-2">
        
        {/* Card Content - 553x225px */}
        <div className="w-[553px] h-[225px] flex flex-col items-center p-0 gap-2 relative">
          
          {/* Icon and Failed Text - 83x80px positioned at 235px from left, 24px from top */}
          <div className="w-[83px] h-[80px] flex flex-col items-center p-0 gap-2 absolute left-[235px] top-6">
            
            {/* Shield Alert Icon - 50x50px */}
            <div className="w-[50px] h-[50px] flex items-center justify-center">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" stroke="#FF383C" strokeWidth="2" fill="none"/>
                <path d="M12 8V12M12 16H12.01" stroke="#FF383C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Failed Text - 59x20px */}
            <div className="w-[59px] h-5 font-['Inter'] font-bold text-xl leading-5 text-[#FF383C]">
              Failed
            </div>
          </div>

          {/* Title and Status Button - 349x68px positioned at 102px from left, 134px from top */}
          <div className="w-[349px] h-[68px] flex flex-col items-center p-0 gap-4 absolute left-[102px] top-[134px]">
            
            {/* Error Title - 208x20px */}
            <div className={`h-5 font-['Inter'] font-semibold text-xl leading-5 text-[#09090B] ${errorInfo.title === 'Connection Error' ? 'w-full text-center' : 'w-[208px]'}`}>
              {errorInfo.title}
            </div>
            
            {/* Status Button - 102x32px */}
            <div className="w-[102px] h-8 flex flex-row justify-center items-center px-3 py-2 gap-2 bg-[#FF383C] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <span className="w-[78px] h-4 font-['Inter'] font-medium text-xs leading-4 flex items-center text-[#FAFAFA]">
                Status: Failed
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section - 432x112px */}
        <div className="w-[432px] h-[112px] flex flex-col items-center p-0 gap-8">
          
          {/* Error Message - 432x40px */}
          <div className="w-[432px] h-10 font-['Inter'] font-normal text-base leading-5 text-center text-[#8C8C8C]">
            {errorInfo.message}
          </div>
          
          {/* Action Buttons - 220x40px */}
          <div className={`h-10 flex flex-row items-center p-0 gap-[18px] ${errorInfo.title === 'Invalid Transaction ID' ? 'w-[102px] justify-center' : 'w-[220px]'}`}>
            
            {/* Retry Button - 100x40px - Only show if not Invalid Transaction ID */}
            {errorInfo.showRetry && onRetry && errorInfo.title !== 'Invalid Transaction ID' && (
              <button
                onClick={onRetry}
                className="w-[100px] h-10 flex flex-row justify-center items-center px-8 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md"
              >
                <span className="w-9 h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]">
                  Retry
                </span>
              </button>
            )}

            {/* Close Button - 102x40px - Always centered for Invalid Transaction ID */}
            <button
              onClick={onClose}
              className="w-[102px] h-10 flex flex-row justify-center items-center px-8 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md"
            >
              <span className="w-[38px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]">
                Close
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
