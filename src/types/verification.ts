// --- Type Definitions for Payment Verification ---

export interface ExtractedData {
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
  status: "success" | "pending" | "warning" | "failed" | "PENDING_MANUAL_REVIEW" | "HIGH_CONFIDENCE_OCR_MATCH" | "Account_Number_Required" | "Completed" | "Manual_Verification_Required";
  message: string;
  verified_data?: ExtractedData;
  cbe_extracted_data?: ExtractedData;
  extracted_data?: ExtractedData;
  debug_info?: string;
  error_type?: 'network' | 'timeout' | 'invalid_transaction' | 'validation' | 'unknown';
  suggested_action?: string;
}

export interface ResultModalProps {
  response: VerificationResponse;
  onClose: () => void;
  onRetry?: () => void;
}
