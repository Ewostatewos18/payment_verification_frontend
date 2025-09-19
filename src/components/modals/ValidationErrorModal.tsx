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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="w-[559px] h-[350px] flex flex-col items-center p-0 gap-0.5 bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
        <div className="w-[553px] h-[180px] relative bg-white flex flex-col items-center justify-center">
          <div className="w-[50px] h-[50px] flex items-center justify-center mb-4">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="1.5" fill="none"/>
              <path d="M12 16V12M12 8H12.01" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="w-[400px] h-6 font-['Inter'] font-bold text-xl leading-6 text-[#3B82F6] text-center mb-2">
            {errorInfo.title}
          </div>
          <div className="w-[400px] h-6 font-['Inter'] font-semibold text-lg leading-6 text-[#09090B] text-center">
            Please Complete Required Fields
          </div>
        </div>
        <div className="w-[500px] h-[150px] flex flex-col items-center gap-6 p-6">
          <div className="w-[500px] h-12 font-['Inter'] font-normal text-base leading-6 text-center text-[#8C8C8C]">
            {errorInfo.message}
          </div>
          <div className="w-[500px] h-10 flex flex-row justify-center items-center">
            <div className="w-[200px] h-10 flex flex-row justify-center items-center px-6 py-2 gap-2 bg-[#3B82F6] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <button
                onClick={onClose}
                className="w-[168px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center justify-center text-[#FAFAFA]"
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
