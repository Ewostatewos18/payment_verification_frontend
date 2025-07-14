// src/app/boa/page.tsx
'use client';

import BankVerificationLayout from '../../components/BankVerificationLayout';
import { VerificationResponse } from '../../components/ResultModal'; // Ensure this path is correct

export default function BoaPage() {
  const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

  const handleBoaVerify = async (
    inputMethod: 'text' | 'image' | 'camera', // This now reflects the specific method for the backend
    transactionId: string,
    accountNumber: string,
    fileToUpload: File | Blob | null
  ): Promise<VerificationResponse> => {
    let apiEndpoint = '';
    let requestBody: FormData | string = '';
    let contentType: string | undefined = undefined;

    if (inputMethod === 'text') {
      apiEndpoint = `${BACKEND_BASE_URL}/verify_boa_payment`;
      requestBody = JSON.stringify({ transaction_id: transactionId, sender_account: accountNumber });
      contentType = 'application/json';
    } else if (inputMethod === 'image') { // Specific image upload endpoint
      const formData = new FormData();
      formData.append('image_file', fileToUpload!, `image_boa.png`);
      formData.append('sender_account_input', accountNumber);
      apiEndpoint = `${BACKEND_BASE_URL}/verify_boa_payment_from_image`;
      requestBody = formData;
    } else if (inputMethod === 'camera') { // Specific camera upload endpoint
      const formData = new FormData();
      formData.append('image_file', fileToUpload!, `image_boa_camera.png`);
      formData.append('sender_account_input', accountNumber);
      apiEndpoint = `${BACKEND_BASE_URL}/verify_boa_payment_from_image`; // Assuming same endpoint for camera
      requestBody = formData;
    } else {
      throw new Error('Invalid input method.');
    }

    console.log('--- Sending Request (Boa) ---');
    console.log('Endpoint:', apiEndpoint);
    console.log('Method: POST');
    console.log('Content-Type:', contentType || 'multipart/form-data (inferred)');
    if (typeof requestBody === 'string') {
      console.log('Request Body (JSON):', requestBody);
    } else {
      console.log('Request Body (FormData):', Array.from(requestBody.entries()));
    }
    console.log('-----------------------------');

    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: contentType ? { 'Content-Type': contentType } : undefined,
      body: requestBody,
    });

    const data = await res.json();
    console.log('--- Received Response (Boa) ---');
    console.log('Response Status:', res.status);
    console.log('Response OK:', res.ok);
    console.log('Response Data:', data);
    console.log('-------------------------------');

    if (!res.ok) {
      let errorMessage = data.message || data.detail || 'Boa verification failed.';
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((item: any) => item.msg || JSON.stringify(item)).join(', ');
      }
      throw new Error(errorMessage);
    }
    return data;
  };

  return (
    <BankVerificationLayout
      bankName="Boa"
      bankColorClass="from-yellow-50 to-yellow-100" // Specific background gradient for Boa
      requiresAccountNumber={true} // Boa requires account number
      onVerify={handleBoaVerify}
    />
  );
}
