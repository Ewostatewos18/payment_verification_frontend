import React from 'react';
import { ResultModalProps } from '../types/verification';
import { getDisplayData, isTransactionSuccess } from '../utils/modalHelpers';

// Import sub-components
import SuccessModal from './modals/SuccessModal';
import ErrorModal from './modals/ErrorModal';
import ManualVerificationModal from './modals/ManualVerificationModal';
import ValidationErrorModal from './modals/ValidationErrorModal';

const ResultModal: React.FC<ResultModalProps> = ({ response, onClose, onRetry }) => {
  const displayData = getDisplayData(response);
  
  // Check if this is a successful transaction
  const isSuccess = isTransactionSuccess(response, displayData);

  // Handle Manual Verification Required
  if (response.status === 'Manual_Verification_Required' || displayData?.status === 'Manual Verification Required') {
    return (
      <ManualVerificationModal 
        onClose={onClose} 
        onRetry={onRetry}
      />
    );
  }

  // Handle validation errors
  if (response.error_type === 'validation') {
    return (
      <ValidationErrorModal 
        response={response} 
        onClose={onClose}
      />
    );
  }

  // Handle success cases
  if (isSuccess && displayData) {
    return (
      <SuccessModal 
        response={response} 
        displayData={displayData} 
        onClose={onClose}
      />
    );
  }

  // Handle all other cases (errors, failures, etc.)
  return (
    <ErrorModal 
      response={response} 
      onClose={onClose} 
      onRetry={onRetry}
    />
  );
};

export default ResultModal;