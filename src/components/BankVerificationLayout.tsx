// src/components/BankVerificationLayout.tsx
'use client';

import React, { useState, ChangeEvent, FormEvent, useRef, useCallback } from 'react';
import Image from 'next/image';
import Webcam from 'react-webcam';
import ResultModal, { VerificationResponse } from './ResultModal'; // Import ResultModal and its types
import { useRouter } from 'next/navigation'; // Import useRouter

// --- Type Definitions ---
type InputMethod = 'text' | 'image' | 'camera';

interface BankVerificationLayoutProps {
  bankName: string;
  bankColorClass: string; // e.g., 'from-green-50 to-green-100' for Telebirr
  requiresAccountNumber: boolean;
  onVerify: (
    inputMethod: InputMethod,
    transactionId: string,
    accountNumber: string,
    fileToUpload: File | Blob | null
  ) => Promise<VerificationResponse>;
}

const BankVerificationLayout: React.FC<BankVerificationLayoutProps> = ({
  bankName,
  bankColorClass, // This will now be used for the *main background gradient* of this page
  requiresAccountNumber,
  onVerify,
}) => {
  const router = useRouter();

  // State for inputs
  const [activeInputMethod, setActiveInputMethod] = useState<InputMethod>('text');
  const [transactionId, setTransactionId] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // State for camera using react-webcam
  const webcamRef = useRef<Webcam>(null);
  const [capturedImageSrc, setCapturedImageSrc] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  // State for UI feedback
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTransactionId('');
    setAccountNumber('');
    setImageFile(null);
    setCapturedImageSrc(null);
    setResponse(null);
    setError(null);
    setIsCameraActive(false);
  };

  const handleInputMethodSelect = (method: InputMethod) => {
    setActiveInputMethod(method);
    resetForm();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'transactionId') {
      setTransactionId(value);
    } else if (name === 'accountNumber') {
      setAccountNumber(value);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImageSrc(imageSrc);
        setError(null);
      } else {
        setError('Failed to capture image from camera. Stream might not be ready.');
      }
    } else {
      setError('Webcam component not ready.');
    }
  }, [webcamRef]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setError(null);

    // Basic validation before calling the bank-specific onVerify
    if (activeInputMethod === 'text' && !transactionId) {
      setError(`Please enter a Transaction ID for ${bankName}.`);
      setIsLoading(false);
      return;
    }
    if (requiresAccountNumber && activeInputMethod === 'text' && !accountNumber) {
      setError(`Please enter an Account Number for ${bankName}.`);
      setIsLoading(false);
      return;
    }
    if ((activeInputMethod === 'image' && !imageFile) || (activeInputMethod === 'camera' && !capturedImageSrc)) {
      setError(`Please ${activeInputMethod === 'image' ? 'select an image file' : 'capture an image'} to upload.`);
      setIsLoading(false);
      return;
    }
    if (requiresAccountNumber && (activeInputMethod === 'image' || activeInputMethod === 'camera') && !accountNumber) {
      setError(`Please enter an Account Number for ${bankName} image verification.`);
      setIsLoading(false);
      return;
    }

    const fileToUpload =
      activeInputMethod === 'image'
        ? imageFile
        : capturedImageSrc
        ? new Blob([atob(capturedImageSrc.split(',')[1])], {
            type: capturedImageSrc.split(',')[0].split(':')[1].split(';')[0],
          })
        : null;

    try {
      const result = await onVerify(activeInputMethod, transactionId, accountNumber, fileToUpload);
      setResponse(result);
      console.log('Verification Success! Response set to state.');
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : 'An unknown error occurred during verification. Please check console for details.');
      setError(errorMessage);
      console.error('Verification Error:', errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-100 to-gray-200 font-sans text-gray-800 relative overflow-hidden`}>
      {/* Background circles for dynamic effect - Consistent with main page */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 opacity-20 rounded-full mix-blend-multiply animate-float-slow" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 opacity-20 rounded-full mix-blend-multiply animate-float-medium" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-1/12 w-48 h-48 bg-green-200 opacity-20 rounded-full mix-blend-multiply animate-float-fast" style={{ animationDelay: '4s' }}></div>

      <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg p-12 rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100 animate-fade-in-up z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{bankName} Verification</h1>
          <button
            onClick={() => router.push('/')}
            className="flex items-center px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full transition duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H16a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back 
          </button>
        </div>
        <p className="text-lg text-center text-gray-600 mb-10 leading-relaxed">
          Verify {bankName} transactions using various input methods.
        </p>

        {/* Input Method Selection - Revamped Tabs */}
        <div className="mb-8 p-2 bg-gray-100 rounded-2xl shadow-inner flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => handleInputMethodSelect('text')}
            className={`
              flex-1 min-w-[120px] px-4 py-3 rounded-xl font-semibold text-lg transition duration-300 ease-in-out transform
              ${activeInputMethod === 'text'
                ? 'bg-blue-600 text-white shadow-lg scale-100'
                : 'bg-transparent text-gray-700 hover:bg-gray-200 hover:scale-98'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100
            `}
          >
            <span className="text-3xl mb-1 block">📝</span>
            Text
          </button>
          <button
            type="button"
            onClick={() => handleInputMethodSelect('image')}
            className={`
              flex-1 min-w-[120px] px-4 py-3 rounded-xl font-semibold text-lg transition duration-300 ease-in-out transform
              ${activeInputMethod === 'image'
                ? 'bg-green-600 text-white shadow-lg scale-100'
                : 'bg-transparent text-gray-700 hover:bg-gray-200 hover:scale-98'}
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-100
            `}
          >
            <span className="text-3xl mb-1 block">🖼️</span>
            Image
          </button>
          <button
            type="button"
            onClick={() => handleInputMethodSelect('camera')}
            className={`
              flex-1 min-w-[120px] px-4 py-3 rounded-xl font-semibold text-lg transition duration-300 ease-in-out transform
              ${activeInputMethod === 'camera'
                ? 'bg-purple-600 text-white shadow-lg scale-100'
                : 'bg-transparent text-gray-700 hover:bg-gray-200 hover:scale-98'}
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-100
            `}
          >
            <span className="text-3xl mb-1 block">📸</span>
            Camera
          </button>
        </div>

        {/* Main Verification Form */}
        <form onSubmit={handleSubmit} className="p-8 border border-gray-200 rounded-2xl bg-gray-50 shadow-inner animate-fade-in">
          {activeInputMethod === 'text' && (
            <>
              <h2 className="text-2xl font-bold text-gray-700 mb-5 text-center">Enter {bankName} Transaction Details</h2>
              <div className="mb-5">
                <label htmlFor="transactionId" className="block text-gray-700 text-sm font-bold mb-2">
                  Transaction ID:
                </label>
                <input
                  type="text"
                  id="transactionId"
                  name="transactionId"
                  value={transactionId}
                  onChange={handleInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder={`Enter ${bankName} transaction ID`}
                  required
                />
              </div>
              {requiresAccountNumber && (
                <div className="mb-6">
                  <label htmlFor="accountNumber" className="block text-gray-700 text-sm font-bold mb-2">
                    Account Number:
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={accountNumber}
                    onChange={handleInputChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter account number"
                    required
                  />
                </div>
              )}
            </>
          )}

          {activeInputMethod === 'image' && (
            <>
              <h2 className="text-2xl font-bold text-gray-700 mb-5 text-center">Upload {bankName} Screenshot / Image</h2>
              <div className="mb-5">
                <label htmlFor="imageUpload" className="block text-gray-700 text-sm font-bold mb-2">
                  Select Image File:
                </label>
                <input
                  type="file"
                  id="imageUpload"
                  name="imageUpload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 transition duration-200 cursor-pointer"
                  required
                />
              </div>
              {imageFile && (
                <div className="mt-4 text-center p-4 bg-gray-100 rounded-lg shadow-inner">
                  <Image src={URL.createObjectURL(imageFile)} alt="Selected Preview" width={500} height={500} className="max-w-full h-auto rounded-lg shadow-md mx-auto border border-gray-200" />
                  <Image src={URL.createObjectURL(imageFile)} alt="Selected Preview" width={500} height={500} className="max-w-full h-auto rounded-lg shadow-md mx-auto border border-gray-200" />
                  
                </div>
              )}
              {requiresAccountNumber && (
                <div className="mb-6 mt-5">
                  <label htmlFor="accountNumber" className="block text-gray-700 text-sm font-bold mb-2">
                    Account Number:
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={accountNumber}
                    onChange={handleInputChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter account number"
                    required
                  />
                </div>
              )}
            </>
          )}

          {activeInputMethod === 'camera' && (
            <>
              <h2 className="text-2xl font-bold text-gray-700 mb-5 text-center">Capture {bankName} Payment Details</h2>
              {error && (
                <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm animate-fade-in">
                  {error}
                </div>
              )}
              <div className="relative w-full h-auto bg-gray-200 rounded-lg overflow-hidden mb-5 aspect-video border border-gray-300 shadow-inner">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  videoConstraints={{ facingMode: 'environment' }}
                  onUserMedia={() => { setIsCameraActive(true); setError(null); }}
                  onUserMediaError={(err) => {
                    console.error("Webcam user media error:", err);
                    setError(`Camera access error: ${typeof err === 'object' && 'message' in err ? err.message : String(err) || 'Permission denied or no camera found.'}`);
                    setIsCameraActive(false);
                  }}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex justify-center mb-5 space-x-4">
                <button
                  type="button"
                  onClick={capture}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  disabled={!isCameraActive || isLoading}
                >
                  Capture Image
                </button>
                {capturedImageSrc && (
                  <button
                    type="button"
                    onClick={() => setCapturedImageSrc(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    Retake
                  </button>
                )}
              </div>
              {capturedImageSrc && (
                <div className="mt-4 text-center p-4 bg-gray-100 rounded-lg shadow-inner">
                  <p className="text-sm text-gray-600 mb-3">Captured image preview:</p>
                  <Image
                    src={URL.createObjectURL(new Blob([atob(capturedImageSrc.split(',')[1])], { type: capturedImageSrc.split(',')[0].split(':')[1].split(';')[0] }))}
                    alt="Captured"
                    width={500}
                    height={500}
                    className="max-w-full h-auto rounded-lg shadow-md mx-auto border border-gray-200"
                  />
                </div>
              )}
              {requiresAccountNumber && (
                <div className="mb-6 mt-5">
                  <label htmlFor="accountNumber" className="block text-gray-700 text-sm font-bold mb-2">
                    Account Number:
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={accountNumber}
                    onChange={handleInputChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter account number"
                    required
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isLoading || (activeInputMethod === 'camera' && !capturedImageSrc) || ( (activeInputMethod === 'image' || activeInputMethod === 'camera') && requiresAccountNumber && !accountNumber) }
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Verify Payment'
            )}
          </button>
        </form>

        {error && !response && (
          <div className="mt-8 p-5 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl text-lg text-center font-medium animate-fade-in shadow-md">
            <p className="font-bold mb-2">Verification Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>

      {response && <ResultModal response={response} onClose={() => setResponse(null)} />}

      {/* Tailwind CSS custom animations - Re-added for consistency */}
      <style jsx>{`
        @keyframes float-slow {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, 10px) rotate(5deg); }
          50% { transform: translate(0, 20px) rotate(0deg); }
          75% { transform: translate(-20px, 10px) rotate(-5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes float-medium {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-15px, -10px) rotate(-3deg); }
          50% { transform: translate(0, -25px) rotate(0deg); }
          75% { transform: translate(15px, -10px) rotate(3deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes float-fast {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -5px) rotate(2deg); }
          50% { transform: translate(0, -10px) rotate(0deg); }
          75% { transform: translate(-10px, -5px) rotate(-2deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .animate-float-slow { animation: float-slow 18s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 22s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 15s ease-in-out infinite; }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
};

export default BankVerificationLayout;
