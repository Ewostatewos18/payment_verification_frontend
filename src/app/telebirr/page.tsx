// src/app/telebirr/page.tsx
'use client';

import BankVerificationLayout from '../../components/BankVerificationLayout';
import { VerificationResponse } from '../../components/ResultModal';

export default function TelebirrPage() {

  const handleTelebirrVerify = async (
    inputMethod: 'text' | 'image' | 'camera',
    transactionId: string,
    accountNumber: string, // Not used for Telebirr, but kept for consistent signature
    fileToUpload: File | Blob | null
  ): Promise<VerificationResponse> => {
    let apiEndpoint = '';
    let requestBody: FormData | string = '';
    let contentType: string | undefined = undefined;

    // Access the base URL from the environment variable
    const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    if (!BACKEND_BASE_URL) {
      throw new Error("Backend URL is not configured. Please set NEXT_PUBLIC_BACKEND_BASE_URL in your .env.local file.");
    }

    if (inputMethod === 'text') {
      apiEndpoint = `${BACKEND_BASE_URL}/verify_telebirr_payment`;
      requestBody = JSON.stringify({ transaction_id: transactionId });
      contentType = 'application/json';
    } else if (inputMethod === 'image' || inputMethod === 'camera') {
      const formData = new FormData();
      formData.append('image_file', fileToUpload!, `image_telebirr.png`); // '!' asserts non-null
      apiEndpoint = `${BACKEND_BASE_URL}/verify_telebirr_payment_from_image`;
      requestBody = formData;
    } else {
      throw new Error('Invalid input method.');
    }

    console.log('--- Sending Request (Telebirr) ---');
    console.log('Endpoint:', apiEndpoint);
    console.log('Method: POST');
    console.log('Content-Type:', contentType || 'multipart/form-data (inferred)');
    if (typeof requestBody === 'string') {
      console.log('Request Body (JSON):', requestBody);
    } else {
      console.log('Request Body (FormData):', Array.from(requestBody.entries()));
    }
    console.log('-----------------------------------');

    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: contentType ? { 'Content-Type': contentType } : undefined,
      body: requestBody,
    });

    const data = await res.json();
    console.log('--- Received Response (Telebirr) ---');
    console.log('Response Status:', res.status);
    console.log('Response OK:', res.ok);
    console.log('Response Data:', data);
    console.log('------------------------------------');

    if (!res.ok) {
      let errorMessage = data.message || data.detail || 'Telebirr verification failed.';
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((item: unknown) => {
          const typedItem = item as { msg?: string };
          return typedItem.msg || JSON.stringify(item);
        }).join(', ');
      }
      throw new Error(errorMessage);
    }
    return data;
  };

  return (
    <BankVerificationLayout
      bankName="Telebirr"
      bankColorClass="from-green-50 to-green-100"
      requiresAccountNumber={false}
      onVerify={handleTelebirrVerify}
    />
  );
}
