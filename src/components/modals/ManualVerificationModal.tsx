import React from 'react';

interface ManualVerificationModalProps {
  onClose: () => void;
  onRetry?: () => void;
}

const ManualVerificationModal: React.FC<ManualVerificationModalProps> = ({ onClose, onRetry }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Main Card - Responsive */}
      <div className="w-full max-w-[559px] h-auto min-h-[300px] sm:min-h-[350px] flex flex-col items-center p-4 sm:p-6 gap-4 bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
        
        {/* Header Card - Responsive */}
        <div className="w-full h-auto relative bg-white flex flex-col items-center justify-center">
          
          {/* Icon - Responsive */}
          <div className="w-12 h-12 sm:w-[50px] sm:h-[50px] flex items-center justify-center mb-4">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="1.5" fill="none"/>
              <path d="M12 16V12M12 8H12.01" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Title - Responsive */}
          <div className="w-full h-auto font-['Inter'] font-bold text-lg sm:text-xl leading-6 text-[#3B82F6] text-center mb-2">
            Manual Entry Required
          </div>

          {/* Subtitle - Responsive */}
          <div className="w-full h-auto font-['Inter'] font-semibold text-base sm:text-lg leading-6 text-[#09090B] text-center">
            Unable to Process Image
          </div>
        </div>

        {/* Bottom Section - Responsive */}
        <div className="w-full h-auto flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-6">
          
          {/* Message - Responsive */}
          <div className="w-full h-auto font-['Inter'] font-normal text-sm sm:text-base leading-6 text-center text-[#8C8C8C]">
            Unable to process the image. Please insert the transaction ID manually.
          </div>

          {/* Action Buttons - Responsive */}
          <div className="w-full h-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            
            {/* Switch to Manual Entry Button - Responsive */}
            <div className="w-full sm:w-[150px] h-10 flex flex-row justify-center items-center px-6 py-2 gap-2 bg-[#3B82F6] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <button
                onClick={() => {
                  // This will be handled by the parent component
                  if (onRetry) onRetry();
                  onClose();
                }}
                className="w-auto h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]"
              >
                Switch to Manual Entry
              </button>
            </div>

            {/* Close Button - Responsive */}
            <div className="w-full sm:w-[100px] h-10 flex flex-row justify-center items-center px-4 py-2 gap-2 bg-[#E5E7EB] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <button
                onClick={onClose}
                className="w-auto h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#374151]"
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

export default ManualVerificationModal;
