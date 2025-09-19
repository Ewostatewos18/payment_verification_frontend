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
      {/* Main Card - Matching Figma specs: 559x364px */}
      <div className="w-[559px] h-[364px] flex flex-col bg-white border border-[#E4E4E7] shadow-[0px_2px_2px_rgba(0,0,0,0.1)] rounded-xl p-6 gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center gap-4">
          
          {/* Shield Alert Icon */}
          <div className="w-[60px] h-[60px] flex items-center justify-center">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="#FF383C"/>
              <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Failed Text */}
          <div className="font-['Inter'] font-bold text-2xl leading-8 text-[#FF383C] text-center">
            Failed
          </div>

          {/* Title */}
          <div className="font-['Inter'] font-bold text-xl leading-8 text-[#09090B] text-center">
            {errorInfo.title}
          </div>
          
          {/* Status Button */}
          <div className="w-[124px] h-8 flex flex-row justify-center items-center px-1 py-2 gap-2 bg-[#FF383C] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
            <span className="font-['Inter'] font-medium text-sm leading-4 flex items-center text-[#FAFAFA]">
              Status: Failed
            </span>
          </div>
        </div>

        {/* Error Message */}
        <div className="w-[500px] h-12 font-['Inter'] font-normal text-sm leading-6 text-center text-[#8C8C8C]">
          {errorInfo.message}
        </div>

        {/* Action Buttons - Centered */}
        <div className="flex flex-row items-center justify-center gap-4">
          
          {/* Retry Button (if applicable) */}
          {errorInfo.showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="w-[100px] h-10 flex flex-row justify-center items-center px-4 py-2 gap-2 bg-[#10B981] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md font-['Inter'] font-medium text-sm leading-5 text-[#FAFAFA]"
            >
              Retry
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-[100px] h-10 flex flex-row justify-center items-center px-4 py-2 gap-2 bg-[#10B981] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md font-['Inter'] font-medium text-sm leading-5 text-[#FAFAFA]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
