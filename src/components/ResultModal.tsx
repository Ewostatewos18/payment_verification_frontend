import React from 'react';

// --- Type Definitions (Centralized for consistency) ---
interface ExtractedData {
  transaction_id?: string;
  amount?: number | null;
  sender_account_full?: string;
  receiver_account_full?: string;
  sender_name?: string;
  receiver_name?: string;
  transaction_date?: string;
  transaction_time?: string;
  account_match?: boolean;
  transaction_status?: string;
  full_text_extracted_snippet?: string;
  possible_transaction_id?: string;
  status_keywords_found?: boolean;
  full_text?: string;
  sender_bank_name?: string;
  receiver_bank_name?: string;
  date?: string;
  status?: string;
  debug_info?: string;
}

export interface VerificationResponse {
  status: "success" | "pending" | "warning" | "failed" | "PENDING_MANUAL_REVIEW" | "HIGH_CONFIDENCE_OCR_MATCH" | "Account_Number_Required" | "Completed";
  message: string;
  verified_data?: ExtractedData;
  cbe_extracted_data?: ExtractedData;
  extracted_data?: ExtractedData;
  debug_info?: string;
}

interface ResultModalProps {
  response: VerificationResponse;
  onClose: () => void;
  onRetry?: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ response, onClose, onRetry }) => {
  const displayData = response.verified_data || response.cbe_extracted_data || response.extracted_data;
  
  // Check if this is a successful transaction (API success with valid transaction data, not test data)
  const isTransactionSuccess = response.status === 'success' && 
    displayData && 
    (displayData.transaction_id || displayData.possible_transaction_id) &&
    displayData.sender_name &&
    displayData.receiver_name &&
    displayData.amount &&
    !displayData.debug_info?.includes('Test data') &&
    !displayData.debug_info?.includes('temporarily unavailable'); 
  
  if (isTransactionSuccess) {
    const transactionData = {
      transactionId: displayData.transaction_id || displayData.possible_transaction_id,
      senderName: displayData.sender_name,
      senderBank: displayData.sender_bank_name || 'N/A',
      receiverName: displayData.receiver_name,
      amount: `ETB ${displayData.amount?.toFixed(2) || '0.00'}`,
      date: displayData.transaction_date || displayData.date || 'N/A'
    };

    // Success Modal UI (integrated from SuccessModal.tsx)
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Main Card - Adjusted for content */}
        <div 
          className="flex flex-col justify-end items-center p-6 gap-6 bg-white border border-[#E4E4E7] rounded-xl"
          style={{
            width: '587px',
            height: 'auto',
            minHeight: '700px',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
            borderRadius: '12px'
          }}
        >
          
          {/* Success Card */}
          <div 
            className="relative bg-white"
            style={{
              width: '553px',
              height: '225px',
               }}
          >
            
            {/* Success Icon and Text */}
            <div 
              className="flex flex-col items-center gap-2.5"
              style={{
                position: 'absolute',
                width: '83px',
                height: '80px',
                left: '235px',
                top: '24px'
              }}
            >
              {/* Check Icon */}
              <div 
                className="flex items-center justify-center"
                style={{
                  width: '50px',
                  height: '50px'
                }}
              >
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#34C759" strokeWidth="1.5" fill="none"/>
                  <path d="M9 12L11 14L15 10" stroke="#34C759" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              {/* Success Text */}
              <div 
                className="font-bold text-[#34C759]"
                style={{
                  width: '84px',
                  height: '20px',
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  fontSize: '20px',
                  lineHeight: '20px'
                }}
              >
                Success
              </div>
            </div>

            {/* Main Content */}
            <div 
              className="flex flex-col items-center gap-4"
              style={{
                position: 'absolute',
                width: '349px',
                height: '68px',
                left: '102px',
                top: '134px'
              }}
            >
              
              {/* Title */}
              <div 
                className="text-center"
                style={{
                  width: '349px',
                  height: '20px',
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '20px',
                  lineHeight: '20px',
                  color: '#09090B',
                  whiteSpace: 'nowrap'
                }}
              >
                Transaction Verification Successful.
              </div>
              
              {/* Status Button */}
              <div 
                className="flex flex-row justify-center items-center px-3 py-2 gap-2 bg-[#34C759] rounded-md"
                style={{
                  width: '124px',
                  height: '32px',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
                  borderRadius: '6px'
                }}
              >
                <span 
                  className="flex items-center text-[#FAFAFA]"
                  style={{
                    width: '100px',
                    height: '16px',
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px'
                  }}
                >
                  Status: Complete
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Details Card */}
          <div 
            className="flex flex-col items-start bg-white border border-[#E4E4E7] rounded-xl"
            style={{
              width: '553px',
              height: 'auto',
              minHeight: '350px',
              padding: '24px',
              gap: '24px',
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
              borderRadius: '12px'
            }}
          >
            
            {/* Transaction Details Title */}
            <div 
              className="font-semibold text-[#09090B]"
              style={{
                width: '505px',
                height: '23px',
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '20px',
                color: '#09090B'
              }}
            >
              Transaction Details
            </div>

            {/* Details List */}
            <div className="flex flex-col" style={{ width: '505px', gap: '20px' }}>
              
              {/* Transaction ID */}
              <div 
                className="flex flex-row justify-between items-center"
                style={{
                  width: '505px',
                  height: '20px'
                }}
              >
                <span 
                  className="text-[#71717A]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#71717A',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Transaction ID
                </span>
                <span 
                  className="text-[#09090B]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#09090B',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {transactionData.transactionId}
                </span>
              </div>

              {/* Sender Name */}
              <div 
                className="flex flex-row justify-between items-center"
                style={{
                  width: '505px',
                  height: '20px'
                }}
              >
                <span 
                  className="text-[#71717A]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#71717A',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Sender Name
                </span>
                <span 
                  className="text-[#09090B]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#09090B',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {transactionData.senderName}
                </span>
              </div>
              
              {/* Sender Bank */}
              <div 
                className="flex flex-row justify-between items-center"
                style={{
                  width: '505px',
                  height: '20px'
                }}
              >
                <span 
                  className="text-[#71717A]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#71717A',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Sender Bank
                </span>
                <span 
                  className="text-[#09090B]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#09090B',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {transactionData.senderBank}
                </span>
              </div>

              {/* Receiver Name */}
              <div 
                className="flex flex-row justify-between items-center"
                style={{
                  width: '505px',
                  height: '20px'
                }}
              >
                <span 
                  className="text-[#71717A]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#71717A',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Receiver Name
                </span>
                <span 
                  className="text-[#09090B]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#09090B',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {transactionData.receiverName}
                </span>
              </div>

              {/* Amount */}
              <div 
                className="flex flex-row justify-between items-center"
                style={{
                  width: '505px',
                  height: '20px'
                }}
              >
                <span 
                  className="text-[#71717A]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#71717A',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Amount
                </span>
                <span 
                  className="text-[#09090B]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#09090B',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {transactionData.amount}
                </span>
              </div>

              {/* Date */}
              <div 
                className="flex flex-row justify-between items-center"
                style={{
                  width: '505px',
                  height: '20px'
                }}
              >
                <span 
                  className="text-[#71717A]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#71717A',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Date
                </span>
                <span 
                  className="text-[#09090B]"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#09090B',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {transactionData.date}
                </span>
              </div>
            </div>

           
          </div>
           {/* Close Button */}
           <div 
              className="flex flex-row justify-center items-center px-8 py-2 gap-2 bg-[#34C759] rounded-md"
              style={{
                width: '102px',
                height: '40px',
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
                borderRadius: '6px'
              }}
            >
              <button
                onClick={onClose}
                className="flex items-center text-[#FAFAFA]"
                style={{
                  width: '38px',
                  height: '20px',
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                Close
              </button>
            </div>
        </div>
      </div>
    );
  }

  // Handle all failed cases - show FailedModal for any failure
  const isTransactionFailed = response.status === 'failed' || 
    displayData?.transaction_status === 'Failed' || 
    displayData?.status === 'Failed' ||
    displayData?.status === 'Service Unavailable';

  if (isTransactionFailed) {
    // Failed Modal UI (integrated from FailedModal.tsx)
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Main Card */}
        <div className="w-[559px] h-[364px] flex flex-col items-center p-0 gap-0.5 bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
          
          {/* Failed Card */}
          <div className="w-[553px] h-[225px] relative bg-white ">
            
            {/* Failed Icon and Text */}
            <div className="absolute w-[83px] h-[80px] left-[235px] top-6 flex flex-col items-center gap-2.5">
              {/* Shield Alert Icon */}
              <div className="w-[50px] h-[50px] flex items-center justify-center">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="#FF383C"/>
                  <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              {/* Failed Text */}
              <div className="w-[59px] h-5 font-['Inter'] font-bold text-xl leading-5 text-[#FF383C]">
                Failed
              </div>
            </div>

            {/* Main Content */}
            <div className="absolute w-[349px] h-[68px] left-[102px] top-[134px] flex flex-col items-center gap-4">
              
              {/* Title */}
              <div className="w-[208px] h-5 font-['Inter'] font-semibold text-xl leading-5 text-[#09090B] text-center whitespace-nowrap">
                {displayData?.status === 'Service Unavailable' 
                  ? 'Service Unavailable' 
                  : 'Invalid Transaction ID'}
              </div>
              
              {/* Status Button */}
              <div className="w-[102px] h-8 flex flex-row justify-center items-center px-3 py-2 gap-2 bg-[#FF383C] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
                <span className="w-[78px] h-4 font-['Inter'] font-medium text-xs leading-4 flex items-center text-[#FAFAFA]">
                  Status: Failed
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="w-[432px] h-[112px] flex flex-col items-center gap-8">
            
            {/* Additional Information */}
            <div className="w-[432px] h-10 font-['Inter'] font-normal text-base leading-5 text-center text-[#8C8C8C]">
              {displayData?.status === 'Service Unavailable' 
                ? 'CBE verification service is temporarily unavailable. Please try again later.'
                : 'Transaction verification failed. Please check your transaction ID and try again.'}
            </div>

            {/* Action Buttons */}
            <div className="w-[220px] h-10 flex flex-row items-center gap-[18px]">
              
              {/* Retry Button */}
              <div className="w-[100px] h-10 flex flex-row justify-center items-center px-8 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
                <button
                  onClick={onRetry || (() => window.location.reload())}
                  className="w-[36px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]"
                >
                  Retry
                </button>
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
      </div>
    );
  }

  // For any other status (pending, warning, etc.), show FailedModal as fallback
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Main Card */}
      <div className="w-[559px] h-[364px] flex flex-col items-center p-0 gap-0.5 bg-white border border-[#E4E4E7] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
        
        {/* Failed Card */}
        <div className="w-[553px] h-[225px] relative bg-white ">
          
          {/* Failed Icon and Text */}
          <div className="absolute w-[83px] h-[80px] left-[235px] top-6 flex flex-col items-center gap-2.5">
            {/* Shield Alert Icon */}
            <div className="w-[50px] h-[50px] flex items-center justify-center">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="#FF383C"/>
                <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Failed Text */}
            <div className="w-[59px] h-5 font-['Inter'] font-bold text-xl leading-5 text-[#FF383C]">
              Failed
            </div>
          </div>

          {/* Main Content */}
          <div className="absolute w-[349px] h-[68px] left-[102px] top-[134px] flex flex-col items-center gap-4">
            
            {/* Title */}
            <div className="w-[208px] h-5 font-['Inter'] font-semibold text-xl leading-5 text-[#09090B] text-center whitespace-nowrap">
              {displayData?.status === 'Service Unavailable' 
                ? 'Service Unavailable' 
                : 'Invalid Transaction ID'}
            </div>
            
            {/* Status Button */}
            <div className="w-[102px] h-8 flex flex-row justify-center items-center px-3 py-2 gap-2 bg-[#FF383C] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <span className="w-[78px] h-4 font-['Inter'] font-medium text-xs leading-4 flex items-center text-[#FAFAFA]">
                Status: Failed
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="w-[432px] h-[112px] flex flex-col items-center gap-8">
          
          {/* Additional Information */}
          <div className="w-[432px] h-10 font-['Inter'] font-normal text-base leading-5 text-center text-[#8C8C8C]">
            {displayData?.status === 'Service Unavailable' 
              ? 'CBE verification service is temporarily unavailable. Please try again later.'
              : 'Transaction verification failed. Please check your transaction ID and try again.'}
          </div>

          {/* Action Buttons */}
          <div className="w-[220px] h-10 flex flex-row items-center gap-[18px]">
            
            {/* Retry Button */}
            <div className="w-[100px] h-10 flex flex-row justify-center items-center px-8 py-2 gap-2 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md">
              <button
                onClick={onRetry || (() => window.location.reload())}
                className="w-[36px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]"
              >
                Retry
              </button>
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
    </div>
  );
};

export default ResultModal;
