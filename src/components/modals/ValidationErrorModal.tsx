import React from 'react';
import { VerificationResponse } from '../../types/verification';
import { getErrorInfo } from '../../utils/modalHelpers';

interface ValidationErrorModalProps {
  response: VerificationResponse;
  onClose: () => void;
}

const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({ response, onClose }) => {
  const errorInfo = getErrorInfo(response);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-[559px] h-auto min-h-[300px] sm:min-h-[350px] flex flex-col items-center p-4 sm:p-6 gap-4 bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
        <div className="w-full h-auto relative bg-white flex flex-col items-center justify-center">
          <div className="w-12 h-12 sm:w-[50px] sm:h-[50px] flex items-center justify-center mb-4">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="1.5" fill="none"/>
              <path d="M12 16V12M12 8H12.01" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="w-full h-auto font-['Inter'] font-bold text-lg sm:text-xl leading-6 text-[#3B82F6] text-center mb-2">
            {errorInfo.title}
          </div>
          <div className="w-full h-auto font-['Inter'] font-semibold text-base sm:text-lg leading-6 text-[#09090B] text-center">
            Please Complete Required Fields
          </div>
        </div>
        <div className="w-full h-auto flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-6">
          <div className="w-full h-auto font-['Inter'] font-normal text-sm sm:text-base leading-6 text-center text-[#8C8C8C]">
            {errorInfo.message}
          </div>
          <div className="w-full h-auto flex flex-row justify-center items-center">
            <div className="w-full sm:w-[200px] h-10 flex flex-row justify-center items-center px-6 py-2 gap-2 bg-[#3B82F6] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <button
                onClick={onClose}
                className="w-auto h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center justify-center text-[#FAFAFA]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationErrorModal;
