// src/components/BankVerificationLayout.tsx
'use client';

import React, { useState, ChangeEvent, FormEvent, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import ResultModal, { VerificationResponse } from './ResultModal';
import { useRouter } from 'next/navigation';

// --- Type Definitions ---
type InputMethod = 'text' | 'media';

interface BankVerificationLayoutProps {
  bankName: string;
  requiresAccountNumber: boolean;
  onVerify: (
    // This signature must match what the backend expects, which is still 'text', 'image', or 'camera'
    inputMethod: 'text' | 'image' | 'camera',
    transactionId: string,
    accountNumber: string,
    fileToUpload: File | Blob | null
  ) => Promise<VerificationResponse>;
}

const BankVerificationLayout: React.FC<BankVerificationLayoutProps> = ({
  bankName,
  requiresAccountNumber,
  onVerify,
}) => {
  const router = useRouter();

  // State for main input method selection (text or media) - Defaults to 'text'
  const [activeInputMethod, setActiveInputMethod] = useState<InputMethod>('text');

  // State to control camera visibility within 'media' input
  const [showCamera, setShowCamera] = useState<boolean>(false);

  // State for form inputs
  const [transactionId, setTransactionId] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // State for camera using react-webcam
  const webcamRef = useRef<Webcam>(null);
  const [capturedImageSrc, setCapturedImageSrc] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false); // Tracks if camera stream is active

  // State for drag-and-drop visual feedback
  const [isDragging, setIsDragging] = useState(false);

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
    setShowCamera(false);
  };

  const handleInputMethodToggle = () => {
    // Toggle between 'text' and 'media'
    setActiveInputMethod(prevMethod => (prevMethod === 'text' ? 'media' : 'text'));
    resetForm();
  };

  // Function to toggle camera view
  const toggleCameraView = () => {
    setShowCamera(prev => !prev);
    setImageFile(null); // Clear uploaded image if switching to camera
    setCapturedImageSrc(null); // Clear captured image if switching away from camera
    setError(null); // Clear errors
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
      setCapturedImageSrc(null); // Clear captured image if file is uploaded
      setShowCamera(false); // Hide camera if a file is uploaded
      setError(null);
    } else {
      setImageFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImageFile(e.dataTransfer.files[0]);
      setCapturedImageSrc(null); // Clear captured image if file is dropped
      setShowCamera(false); // Hide camera if a file is dropped
      setError(null);
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImageSrc(imageSrc);
        setImageFile(null); // Clear uploaded file if image is captured
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

    let fileToUpload: File | Blob | null = null;
    let inputMethodForBackend: 'text' | 'image' | 'camera'; // This is what onVerify expects

    if (activeInputMethod === 'text') {
      inputMethodForBackend = 'text';
      if (!transactionId) {
        setError(`Please enter a Transaction ID for ${bankName}.`);
        setIsLoading(false);
        return;
      }
      if (requiresAccountNumber && !accountNumber) {
        setError(`Please enter an Account Number for ${bankName}.`);
        setIsLoading(false);
        return;
      }
    } else { // activeInputMethod === 'media'
      if (showCamera) { // If camera view is active
        inputMethodForBackend = 'camera'; // Backend expects 'camera' for camera captures
        if (!capturedImageSrc) {
          setError('Please capture an image from the camera.');
          setIsLoading(false);
          return;
        }
        // Convert base64 image to Blob
        fileToUpload = new Blob([atob(capturedImageSrc.split(',')[1])], {
          type: capturedImageSrc.split(',')[0].split(':')[1].split(';')[0],
        });
      } else { // If camera view is not active, assume file upload/drag-drop
        inputMethodForBackend = 'image'; // Backend expects 'image' for file uploads
        if (!imageFile) {
          setError('Please select an image file to upload or use the camera.');
          setIsLoading(false);
          return;
        }
        fileToUpload = imageFile;
      }

      if (requiresAccountNumber && !accountNumber) {
        setError(`Please enter an Account Number for ${bankName} image verification.`);
        setIsLoading(false);
        return;
      }
    }

    try {
      const result = await onVerify(inputMethodForBackend, transactionId, accountNumber, fileToUpload);
      setResponse(result);
      console.log('Verification Success! Response set to state.');
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : String(err)) || 'An unknown error occurred during verification. Please check console for details.';
      setError(errorMessage);
      console.error('Verification Error:', errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={`flex min-h-screen flex-col items-center justify-start p-10 bg-gradient-to-br from-gray-100 to-gray-200 font-sans text-gray-800 relative overflow-hidden`}>
      {/* Background circles for dynamic effect - Consistent with main page */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 opacity-20 rounded-full mix-blend-multiply animate-float-slow" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 opacity-20 rounded-full mix-blend-multiply animate-float-medium" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-1/12 w-48 h-48 bg-green-200 opacity-20 rounded-full mix-blend-multiply animate-float-fast" style={{ animationDelay: '4s' }}></div>

      <div className="w-full flex-grow flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 z-10 bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-100 animate-fade-in-up max-w-5xl">
        {/* Header Content - Now part of the main section */}
        <div className="w-full flex justify-between items-center py-4 px-4 sm:px-8 mb-8"> {/* Adjusted padding and margin */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">{bankName} Verification</h1>
          <button
            onClick={() => router.push('/')}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H16a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div>

        <p className="text-xl text-center text-gray-700 mb-12 max-w-3xl leading-relaxed">
          Verify {bankName} transactions using your preferred method.
        </p>

        {/* Single Toggle Button for Input Method */}
        <div className="mb-8 flex justify-center w-full max-w-sm">
          <button
            type="button"
            onClick={handleInputMethodToggle}
            className={`
              flex-1 px-8 py-4 rounded-full font-bold text-xl shadow-lg
              transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl
              focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white
              ${activeInputMethod === 'text'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'}
            `}
          >
            {activeInputMethod === 'text' ? 'Switch to Upload/Scan' : 'Switch to Enter ID'}
          </button>
        </div>

        {/* Main Verification Form */}
        <form onSubmit={handleSubmit} className="p-8 border border-gray-200 rounded-2xl bg-gray-50 shadow-inner w-full max-w-4xl">
          {activeInputMethod === 'text' && (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Enter Transaction Details</h2>
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

          {activeInputMethod === 'media' && (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Upload or Scan Payment Details</h2>

              {/* Centralized Camera Toggle Button */}
              <div className="mb-6 flex justify-center">
                <button
                  type="button"
                  onClick={toggleCameraView}
                  className={`
                    flex items-center px-8 py-3 rounded-full font-semibold text-lg shadow-md
                    transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white
                    ${showCamera
                      ? 'bg-red-500 text-white focus:ring-red-500'
                      : 'bg-purple-500 text-white focus:ring-purple-500'}
                  `}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {showCamera ? 'Hide Camera' : 'Use Camera'}
                </button>
              </div>

              {!showCamera && ( // Show upload/drag-drop when camera is not active
                <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 text-center shadow-inner mb-6">
                  <label
                    htmlFor="imageUpload"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      block w-full py-10 rounded-lg border-2 border-dashed
                      ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
                      text-gray-600 cursor-pointer transition-all duration-200
                      hover:border-blue-400 hover:text-blue-600
                      relative flex flex-col items-center justify-center
                    `}
                  >
                    <input
                      type="file"
                      id="imageUpload"
                      name="imageUpload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required={!imageFile && !capturedImageSrc} // Required if no file and no captured image
                    />
                    {imageFile ? (
                      <div className="flex flex-col items-center">
                        <p className="text-lg font-semibold mb-2 text-blue-700">
                          Selected file: <span className="font-bold">{imageFile.name}</span>
                        </p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setImageFile(null); }} // Stop propagation and clear file
                          className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-full shadow-md transition duration-200"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-semibold mb-2">Drag & Drop Image Here</p>
                        <p className="text-sm mb-4">or</p>
                        <span className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-full transition duration-200 shadow-md">
                          Browse Files
                        </span>
                      </>
                    )}
                  </label>
                </div>
              )}

              {showCamera && ( // Show camera when active
                <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 text-center shadow-inner mb-6">
                  {error && ( // Display error specific to camera if any
                    <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm animate-fade-in flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
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
                    <div className="mt-4 text-center p-4 bg-gray-100 rounded-lg shadow-inner border border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">Image Captured!</p>
                    </div>
                  )}
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
            disabled={
              isLoading ||
              (activeInputMethod === 'text' && (!transactionId || (requiresAccountNumber && !accountNumber))) ||
              (activeInputMethod === 'media' && showCamera && !capturedImageSrc) ||
              (activeInputMethod === 'media' && !showCamera && !imageFile) ||
              (activeInputMethod === 'media' && requiresAccountNumber && !accountNumber)
            }
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
          <div className="mt-8 p-5 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl text-lg text-center font-medium animate-fade-in shadow-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="font-bold mr-2">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>

      {response && <ResultModal response={response} onClose={() => setResponse(null)} />}

      {/* Tailwind CSS custom animations */}
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
