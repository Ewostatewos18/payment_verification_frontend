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
}

const ResultModal: React.FC<ResultModalProps> = ({ response, onClose }) => {
  let bgColorClass = 'bg-blue-50 border-blue-200';
  let icon = 'ℹ️';
  let iconColorClass = 'text-blue-600';
  let titleColorClass = 'text-blue-800';
  let displayStatusText = response.status.replace(/_/g, ' ');

  if (response.status === 'success' || response.status === 'HIGH_CONFIDENCE_OCR_MATCH' || response.status === 'Completed') {
    bgColorClass = 'bg-green-50 border-green-200';
    icon = '✅';
    iconColorClass = 'text-green-600';
    titleColorClass = 'text-green-800';
    displayStatusText = 'Success!';
  } else if (response.status === 'failed') {
    bgColorClass = 'bg-red-50 border-red-200';
    icon = '❌';
    iconColorClass = 'text-red-600';
    titleColorClass = 'text-red-800';
    displayStatusText = 'Verification Failed';
  } else if (response.status === 'warning' || response.status === 'pending' || response.status === 'PENDING_MANUAL_REVIEW') {
    bgColorClass = 'bg-yellow-50 border-yellow-200';
    icon = '⚠️';
    iconColorClass = 'text-yellow-600';
    titleColorClass = 'text-yellow-800';
    displayStatusText = response.status === 'PENDING_MANUAL_REVIEW' ? 'Pending Manual Review' : 'Verification Pending';
  } else if (response.status === 'Account_Number_Required') {
    bgColorClass = 'bg-orange-50 border-orange-200';
    icon = '⚠️';
    iconColorClass = 'text-orange-600';
    titleColorClass = 'text-orange-800';
    displayStatusText = 'Account Number Required';
  }

  // Corrected logical OR operators (||) for displayData assignment
  const displayData = response.verified_data || response.cbe_extracted_data || response.extracted_data;

  // The renderDetail function remains the same as it's already quite good for individual rows
  const renderDetail = (label: string, value: unknown) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
        <span className="font-medium text-gray-700 pr-2">{label}:</span>
        <span className="text-gray-800 font-mono text-sm break-all text-right flex-1">{String(value)}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
      {/* Corrected template literal for className */}
      <div className={`bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full ${bgColorClass} border-2 transform scale-95 animate-zoom-in`}>
        <div className="flex flex-col items-center mb-6">
          {/* Corrected template literal for className */}
          <span className={`text-6xl mb-4 ${iconColorClass} animate-bounce-in`}>{icon}</span>
          {/* Corrected template literal for className */}
          <h2 className={`text-3xl font-bold ${titleColorClass} text-center mb-2`}>{displayStatusText}</h2>
          <p className="text-md text-gray-600 text-center leading-relaxed">{response.message}</p>
        </div>
        {/* --- UI UPDATE: Transaction Details Section --- */}
        {displayData && (
          <div className="mt-6 p-5 bg-white rounded-lg border border-gray-200 shadow-sm"> {/* Changed bg-gray-50 to bg-white for a cleaner look */}
            <p className="font-bold mb-4 text-gray-800 text-xl border-b pb-2 border-gray-200">Transaction Details</p>
            <div className="space-y-2"> {/* Added spacing between detail rows */}
              {renderDetail('Transaction ID', displayData.transaction_id || displayData.possible_transaction_id)}
              {renderDetail('Sender Name', displayData.sender_name)}
              {renderDetail('Sender Bank', displayData.sender_bank_name)}
              {renderDetail('Receiver Name', displayData.receiver_name)}
              {renderDetail('Receiver Bank', displayData.receiver_bank_name)}
              {renderDetail('Amount', displayData.amount ? `ETB ${displayData.amount.toFixed(2)}` : null)}
              {renderDetail('Date', displayData.transaction_date || displayData.date)}
            </div>
          </div>
        )}
        {/* --- END UI UPDATE --- */}

        <div className="text-center mt-8">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;