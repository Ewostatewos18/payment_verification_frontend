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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      {/* Main Card - Responsive */}
      <div className="w-full max-w-[559px] h-auto min-h-[300px] sm:min-h-[364px] bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl flex flex-col items-center p-4 sm:p-6 gap-4">
        
        {/* Card Content - Responsive */}
        <div className="w-full h-auto flex flex-col items-center p-0 gap-4 relative">
          
          {/* Icon and Failed Text - Responsive */}
          <div className="w-auto h-auto flex flex-col items-center p-0 gap-2">
            
            {/* Shield Alert Icon - Responsive */}
            <div className="w-12 h-12 sm:w-[50px] sm:h-[50px] flex items-center justify-center">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" stroke="#FF383C" strokeWidth="2" fill="none"/>
                <path d="M12 8V12M12 16H12.01" stroke="#FF383C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Failed Text - Responsive */}
            <div className="w-auto h-auto font-['Inter'] font-bold text-lg sm:text-xl leading-5 text-[#FF383C]">
              Failed
            </div>
          </div>

          {/* Title and Status Button - Responsive */}
          <div className="w-full h-auto flex flex-col items-center p-0 gap-4">
            
            {/* Error Title - Responsive */}
            <div className={`h-auto font-['Inter'] font-semibold text-lg sm:text-xl leading-5 text-[#09090B] text-center ${errorInfo.title === 'Connection Error' ? 'w-full' : 'w-auto'}`}>
              {errorInfo.title}
            </div>
            
            {/* Status Button - Responsive */}
            <div className="w-auto h-8 flex flex-row justify-center items-center px-3 py-2 gap-2 bg-[#FF383C] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <span className="w-auto h-4 font-['Inter'] font-medium text-xs leading-4 flex items-center text-[#FAFAFA]">
                Status: Failed
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section - Responsive */}
        <div className="w-full h-auto flex flex-col items-center p-0 gap-6 sm:gap-8">
          
          {/* Error Message - Responsive */}
          <div className="w-full h-auto font-['Inter'] font-normal text-sm sm:text-base leading-5 text-center text-[#8C8C8C]">
            {errorInfo.message}
          </div>
          
          {/* Action Buttons - Responsive */}
          <div className={`h-10 flex flex-col sm:flex-row items-center p-0 gap-3 sm:gap-[18px] ${errorInfo.title === 'Invalid Transaction ID' ? 'w-auto justify-center' : 'w-full sm:w-auto'}`}>
            
            {/* Retry Button - Responsive - Only show if not Invalid Transaction ID */}
            {errorInfo.showRetry && onRetry && errorInfo.title !== 'Invalid Transaction ID' && (
            <button
                onClick={onRetry}
                className="w-full sm:w-[100px] h-10 flex flex-row justify-center items-center px-8 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md"
              >
                <span className="w-auto h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]">
                  Retry
                </span>
              </button>
            )}

            {/* Close Button - Responsive - Always centered for Invalid Transaction ID */}
            <button
              onClick={onClose}
              className="w-full sm:w-[102px] h-10 flex flex-row justify-center items-center px-8 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md"
              aria-label="Close error modal"
            >
              <span className="w-auto h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]">
                Close
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ErrorModal);
