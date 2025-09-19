'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Webcam from 'react-webcam';
import ResultModal from '../../components/ResultModal';
import { VerificationResponse } from '../../types/verification';
import { apiClient, ApiResponse } from '../../lib/api';
import { ErrorHandler } from '../../lib/errorHandler';

export default function CBEPage() {
  const router = useRouter();
  const [transactionId, setTransactionId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<VerificationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'transaction'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImageSrc, setCapturedImageSrc] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);


  const handleCBEVerify = async () => {
    // For upload tab, only require file and account number
    if (activeTab === 'upload') {
      if ((!selectedFile && !capturedImageSrc) || !accountNumber.trim()) {
        const missingFields = [];
        if (!selectedFile && !capturedImageSrc) missingFields.push('image file or captured photo');
        if (!accountNumber.trim()) missingFields.push('account number');
        
        setResponse({
          status: 'failed',
          message: `Please ${missingFields.join(' and ')} to continue with verification.`,
          error_type: 'validation'
        } as VerificationResponse);
        return;
      }
    } else {
      // For transaction tab, require transaction ID and account number
      if (!transactionId.trim() || !accountNumber.trim()) {
        const missingFields = [];
        if (!transactionId.trim()) missingFields.push('transaction ID');
        if (!accountNumber.trim()) missingFields.push('account number');
        
        setResponse({
          status: 'failed',
          message: `Please enter ${missingFields.join(' and ')} to continue with verification.`,
          error_type: 'validation'
        } as VerificationResponse);
        return;
      }
    }

    setIsLoading(true);

    try {
      let data: ApiResponse;
      
      if (activeTab === 'upload') {
        // Use captured image if available, otherwise use selected file
        let fileToUpload = selectedFile;
        if (capturedImageSrc && !selectedFile) {
          // Convert base64 to Blob
          const response = await fetch(capturedImageSrc);
          const blob = await response.blob();
          fileToUpload = new File([blob], 'captured-image.png', { type: 'image/png' });
        }
        
        // Use image verification
        data = await apiClient.verifyCbeImage({
          file: fileToUpload!,
          transaction_id: transactionId || undefined,
          account_number: accountNumber,
        });
      } else {
        // Use transaction ID verification
        data = await apiClient.verifyCbePayment({
          transaction_id: transactionId,
          account_number: accountNumber,
        });
      }

      setResponse(data as VerificationResponse);
    } catch (err) {
      // Debug logging to see what error we're getting
      // Error handling for CBE verification
      
      // Check if this is a Manual Verification Required response
      if (err && typeof err === 'object') {
        // Check if it's the processed error from API client
        if ('message' in err && 'error_type' in err) {
          const processedError = err as { message: string; error_type: string; status?: number };
          
          // Check if the message indicates manual verification required
          if (processedError.message.includes('Unable to extract transaction ID from image') && 
              processedError.message.includes('Please enter it manually')) {
            setResponse({
              status: 'Manual_Verification_Required',
              message: processedError.message,
              extracted_data: { transaction_id: undefined }
            } as VerificationResponse);
            return;
          }
        }
        
        // Check if it's an unknown error type but actually manual entry required
        if ('message' in err && 'error_type' in err) {
          const processedError = err as { message: string; error_type: string; status?: number };
          if (processedError.error_type === 'unknown' && 
              processedError.message.includes('Unable to extract transaction ID from image') && 
              processedError.message.includes('Please enter it manually')) {
            setResponse({
              status: 'Manual_Verification_Required',
              message: processedError.message,
              extracted_data: { transaction_id: undefined }
            } as VerificationResponse);
            return;
          }
        }
        
        // Check if it's the raw axios error
        if ('response' in err) {
          const axiosError = err as { response?: { data?: { data?: { status?: string }; message?: string } } };
          const responseData = axiosError.response?.data;
          
          if (responseData?.data?.status === 'Manual Entry Required' || responseData?.data?.status === 'Manual Verification Required') {
            setResponse({
              status: 'Manual_Verification_Required',
              message: responseData.message,
              extracted_data: responseData.data
            } as VerificationResponse);
            return;
          }
        }
        
        // Check if it's a direct error with the message
        if ('message' in err) {
          const directError = err as { message: string };
          
          if (directError.message.includes('Unable to extract transaction ID from image') && 
              directError.message.includes('Please enter it manually')) {
            setResponse({
              status: 'Manual_Verification_Required',
              message: directError.message,
              extracted_data: { transaction_id: undefined }
            } as VerificationResponse);
            return;
          }
        }
      }
      
      // More aggressive manual verification detection
      const errorMessage = (err as { message?: string; response?: { data?: { message?: string } } })?.message || (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '';
      const responseData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      
      // Check for manual verification keywords in multiple places
      if (errorMessage.includes('manual') || 
          errorMessage.includes('extract') || 
          errorMessage.includes('transaction ID') ||
          errorMessage.includes('Unable to extract') ||
          errorMessage.includes('enter it manually') ||
          (responseData as { data?: { status?: string } })?.data?.status === 'Manual Entry Required' ||
          (responseData as { data?: { status?: string } })?.data?.status === 'Manual Verification Required' ||
          (responseData as { status?: string })?.status === 'Manual Entry Required' ||
          (responseData as { status?: string })?.status === 'Manual Verification Required') {
        
        // Manual verification required
        setResponse({
          status: 'Manual_Verification_Required',
          message: errorMessage || 'Unable to extract transaction ID from image. Please enter it manually.',
          extracted_data: { transaction_id: undefined }
        } as VerificationResponse);
        return;
      }
      
      // Handle timeout/network errors as potential manual verification cases
      if (errorMessage.includes('timeout') || 
          errorMessage.includes('Network Error') ||
          errorMessage.includes('Unable to connect') ||
          (err && typeof err === 'object' && 'error_type' in err && (err as { error_type?: string }).error_type === 'timeout')) {
        
        // Network/timeout error detected - suggesting manual entry
        
        setResponse({
          status: 'Manual_Verification_Required',
          message: 'Image processing timed out. Please enter the transaction ID manually.',
          extracted_data: { transaction_id: undefined }
        } as VerificationResponse);
        return;
      }
      
      // Final fallback: check if the error message contains manual entry keywords
      if (err && typeof err === 'object' && 'message' in err) {
        const errorMessage = (err as { message: string }).message;
        
        if (errorMessage.includes('manual') || errorMessage.includes('enter') || 
            errorMessage.includes('Unable to extract') || errorMessage.includes('transaction ID')) {
          setResponse({
            status: 'Manual_Verification_Required',
            message: errorMessage,
            extracted_data: { transaction_id: undefined }
          } as VerificationResponse);
          return;
        }
      }
      
      const errorState = ErrorHandler.handle(err);
      
      // Set response with error information for ResultModal (no more generic error modal)
      setResponse({
        status: 'failed',
        message: errorState.message,
        error_type: errorState.type as 'network' | 'timeout' | 'invalid_transaction' | 'validation' | 'unknown'
      } as VerificationResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setResponse(null);
  };

  const handleSwitchToManualEntry = () => {
    // Extract transaction ID from response if available
    const extractedId = response?.extracted_data?.transaction_id || response?.verified_data?.transaction_id;
    if (extractedId) {
      setTransactionId(extractedId);
    }
    // Switch to transaction tab
    setActiveTab('transaction');
    // Close modal
    closeModal();
  };

  const handleRetry = () => {
    // Close modal and retry the same operation
    closeModal();
    handleCBEVerify();
  };




  const handleBrowseFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
      }
    };
    input.click();
  };

  const handleUseCamera = () => {
    setShowCamera(true);
    setSelectedFile(null); // Clear uploaded file if switching to camera
    setCapturedImageSrc(null); // Clear captured image
    setCameraError(null);
    setIsCameraActive(false); // Reset camera state
  };

  const capture = useCallback(() => {
    if (!webcamRef.current) {
      setCameraError('Webcam component not ready. Please wait for camera to initialize.');
      return;
    }

    if (!isCameraActive) {
      setCameraError('Camera is not active. Please wait for camera to start.');
      return;
    }

    try {
      // Try different screenshot methods
      let imageSrc = null;
      
      // Method 1: Standard getScreenshot
      try {
        imageSrc = webcamRef.current.getScreenshot();
      } catch {
        // Silent fail, try next method
      }
      
      // Method 2: getScreenshot with options
      if (!imageSrc) {
        try {
          imageSrc = webcamRef.current.getScreenshot({
            width: 1280,
            height: 720
          });
        } catch {
          // Silent fail, try next method
        }
      }
      
      // Method 3: Canvas fallback
      if (!imageSrc) {
        try {
          const video = webcamRef.current.video;
          if (video) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              imageSrc = canvas.toDataURL('image/jpeg', 0.8);
            }
          }
        } catch {
          // Silent fail
        }
      }
      
      if (imageSrc) {
        setCapturedImageSrc(imageSrc);
        setSelectedFile(null); // Clear uploaded file if image is captured
        setCameraError(null);
      } else {
        setCameraError('Failed to capture image. Please try again.');
      }
    } catch {
      setCameraError('Error capturing image. Please try again.');
    }
  }, [isCameraActive]);

  const retakePhoto = () => {
    setCapturedImageSrc(null);
    setCameraError(null);
    // Go back to live camera feed
  };

  const closeCamera = () => {
    setShowCamera(false);
    setCapturedImageSrc(null);
    setCameraError(null);
    setIsCameraActive(false);
  };

  // Add a small delay after camera becomes active to ensure it's fully ready
  useEffect(() => {
    if (isCameraActive && showCamera) {
      const timer = setTimeout(() => {
        // Camera should be ready now
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCameraActive, showCamera]);

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      {/* Main Container - Depth 2, Frame 1 */}
      <div className="w-full max-w-6xl mx-auto flex flex-row justify-center items-start p-4 sm:p-6 lg:p-8">
        
        {/* Content Container - Depth 3, Frame 0 */}
        <div className="w-full max-w-[960px] h-auto min-h-[815px] flex flex-col items-start gap-0.5">
          
          {/* Header Section - Depth 4, Frame 0 */}
          <div className="w-full max-w-[960px] h-auto min-h-[67px] flex flex-col items-center py-5 px-4 pb-3 relative">
            {/* Back Button */}
            <button
              onClick={() => router.push('/')}
              className="absolute top-5 left-5 w-9 h-9 bg-[#F0F2F5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="#121417" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <h1 className="w-full max-w-[928px] h-auto min-h-[35px] font-['Inter'] font-bold text-2xl sm:text-3xl lg:text-[28px] leading-[35px] text-center text-[#121417]">
              Verify your payment method
            </h1>
          </div>

          {/* Subtitle Section - Depth 4, Frame 1 */}
          <div className="w-full max-w-[960px] h-auto min-h-10 flex flex-col items-center py-1 px-4 pb-3">
            <p className="w-full max-w-[928px] h-auto min-h-6 font-['Inter'] font-normal text-sm sm:text-base leading-6 text-center text-[#121417]">
              Select the bank associated with your payment method to proceed with verification.
            </p>
          </div>

          {/* Bank Card Section - Depth 4, Frame 7 */}
          <div className="w-full max-w-[960px] h-auto min-h-[203.5px] flex flex-col items-start p-4 border-b border-[#8C8C8C] border-opacity-50">
            <div className="w-full max-w-[928px] h-auto min-h-[171px] flex flex-col sm:flex-row justify-between items-center gap-4 rounded-lg">
              
              {/* Left Content - Depth 6, Frame 0 */}
              <div className="w-full sm:w-[608px] h-auto min-h-[171px] flex flex-col justify-center items-start gap-1">
                
                {/* Title - Depth 7, Frame 0 */}
                <div className="w-full sm:w-[608px] h-auto min-h-5 flex flex-col items-start">
                  <h3 className="w-full sm:w-[608px] h-auto min-h-5 font-['Inter'] font-bold text-lg sm:text-xl leading-5 text-[#121417]">
                    Commercial Bank of Ethiopia
                  </h3>
                </div>
                
                {/* Description - Depth 7, Frame 1 */}
                <div className="w-full sm:w-[608px] h-auto min-h-[21px] flex flex-col items-start">
                  <p className="w-full sm:w-[608px] h-auto min-h-[21px] font-['Inter'] font-normal text-sm sm:text-base leading-[21px] text-[#61758A]">
                    Validate Commercial Bank of Ethiopia Payments.
                  </p>
                </div>
                
              </div>

              {/* Right Content - Logo */}
              <div className="w-full sm:w-[400px] h-16 sm:h-[150px] bg-contain bg-no-repeat bg-center" style={{ backgroundImage: 'url(/logos/cbe.png)' }}></div>
            </div>
          </div>

          {/* Tab Navigation - Depth 4, Frame 3 */}
          <div className="w-full max-w-[960px] h-auto min-h-[61px] flex flex-col items-start pb-3">
            <div className="w-full max-w-[960px] h-auto min-h-[49px] flex flex-row items-start px-4 gap-4 sm:gap-8 border-b border-[#DBE0E6]">
              <div className="w-full max-w-[928px] h-12 flex flex-row items-center">
                
                {/* Upload Tab */}
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`w-[72px] h-12 flex flex-row justify-center items-center p-1.5 gap-2 ${activeTab === 'upload' ? 'border-b-2 border-[#18181B]' : ''}`}
                >
                  <span className={`font-['Inter'] font-medium text-sm leading-5 ${activeTab === 'upload' ? 'text-[#18181B]' : 'text-[#71717A]'}`}>
                    Upload
                  </span>
                </button>

                {/* Enter Transaction ID Tab */}
                <button
                  onClick={() => setActiveTab('transaction')}
                  className={`w-[159px] h-12 flex flex-row justify-center items-center p-1.5 gap-2 ${activeTab === 'transaction' ? 'border-b-2 border-[#18181B]' : ''}`}
                >
                  <span className={`font-['Inter'] font-normal text-sm leading-5 ${activeTab === 'transaction' ? 'text-[#18181B]' : 'text-[#71717A]'}`}>
                    Enter Transaction ID
                  </span>
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'upload' ? (
            <>
              {/* Upload Tab Content */}
              {/* Content Area - Depth 4, Frame 4 */}
              <div className="w-full max-w-[960px] h-auto min-h-[281px] flex flex-col items-start p-4">
                {/* Upload Area - Depth 5, Frame 0 */}
                <div 
                  className={`w-full max-w-[928px] h-auto min-h-[249px] flex flex-col items-center py-4 px-4 sm:px-6 gap-4 sm:gap-6 border-2 border-dashed border-[#DBE0E6] rounded-lg ${!showCamera && !capturedImageSrc ? 'cursor-pointer' : ''}`}
                  onDragOver={(e) => !showCamera && !capturedImageSrc && e.preventDefault()}
                  onDragLeave={(e) => !showCamera && !capturedImageSrc && e.preventDefault()}
                  onDrop={(e) => {
                    if (!showCamera && !capturedImageSrc) {
                      e.preventDefault();
                      const files = e.dataTransfer.files;
                      if (files && files[0]) {
                        const file = files[0];
                        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                          setSelectedFile(file);
                        } else {
                          setResponse({
                            status: 'failed',
                            message: 'Please drop an image file or PDF',
                            error_type: 'validation'
                          } as VerificationResponse);
                        }
                      }
                    }
                  }}
                  onClick={!showCamera && !capturedImageSrc ? handleBrowseFile : undefined}
                >
                  
                  {/* Camera Interface */}
                  {showCamera && (
                    <>
                      {cameraError && (
                        <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          {cameraError}
                        </div>
                      )}
                      
                      <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 mb-4 relative">
                        {capturedImageSrc ? (
                          <Image 
                            src={capturedImageSrc} 
                            alt="Captured" 
                            width={512}
                            height={256}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              screenshotQuality={0.8}
                              videoConstraints={{ 
                                facingMode: 'environment',
                                width: { ideal: 1280 },
                                height: { ideal: 720 }
                              }}
                          onUserMedia={() => { 
                            setIsCameraActive(true); 
                            setCameraError(null);
                          }}
                              onUserMediaError={(err) => {
                                console.error('Camera error:', err);
                                setCameraError(`Camera access error: ${typeof err === 'object' && 'message' in err ? err.message : String(err) || 'Permission denied or no camera found.'}`);
                                setIsCameraActive(false);
                              }}
                              className="w-full h-full object-cover"
                            />
                            {!isCameraActive && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                <div className="text-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#34C759] mx-auto mb-2"></div>
                                  <p className="text-sm text-gray-600">Initializing Camera...</p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      {!capturedImageSrc && (
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={capture}
                            className="bg-[#34C759] hover:bg-[#2FB351] text-white font-bold py-2 px-6 rounded-md transition-colors disabled:bg-gray-400"
                            disabled={!isCameraActive || isLoading}
                          >
                            {isCameraActive ? 'Capture Image' : 'Initializing Camera...'}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Captured Image Actions */}
                  {capturedImageSrc && showCamera && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="bg-[#34C759] hover:bg-[#2FB351] text-white font-bold py-2 px-6 rounded-md transition-colors"
                      >
                        Retake
                      </button>
                    </div>
                  )}

                  {/* Default Drag and Drop Interface */}
                  {!showCamera && !capturedImageSrc && (
                    <>
                  {/* Text Content - Depth 6, Frame 0 */}
                      <div className="w-full max-w-[480px] h-auto min-h-[73px] flex flex-col items-center gap-2">
                    
                    {/* Main Text - Depth 7, Frame 0 */}
                        <div className="w-full max-w-[480px] h-auto min-h-[23px] flex flex-col items-center">
                          <h3 className="w-full max-w-[480px] h-auto min-h-[23px] font-['Inter'] font-bold text-base sm:text-lg leading-[23px] text-center text-[#121417]">
                        {selectedFile ? 'File Selected' : 'Drag and drop or browse'}
                      </h3>
                    </div>
                    
                    {/* Description - Depth 7, Frame 1 */}
                        <div className="w-full max-w-[480px] h-auto min-h-[42px] flex flex-col items-center">
                      {selectedFile ? (
                            <p className="w-full max-w-[480px] h-auto min-h-[42px] font-['Inter'] font-normal text-xs sm:text-sm leading-[21px] text-center text-[#34C759] break-words">
                          Selected: {selectedFile.name}
                        </p>
                      ) : (
                            <p className="w-full max-w-[480px] h-auto min-h-[42px] font-['Inter'] font-normal text-xs sm:text-sm leading-[21px] text-center text-[#121417]">
                          Upload a bank statement or a screenshot of a recent transaction from your CBE account.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Browse File Button - Button Wrapper */}
                      <div className="w-full sm:w-[109px] h-9 flex flex-col items-start gap-2.5">
                    <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBrowseFile();
                          }}
                          className="w-full sm:w-[109px] h-9 bg-[#F0F2F5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-4 py-2 hover:bg-[#E5E7EB] transition-colors"
                        >
                          <span className="w-full sm:w-[77px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#121417]">
                        {selectedFile ? 'Change File' : 'Browse File'}
                      </span>
                    </button>
                  </div>
                    </>
                  )}
                </div>
              </div>


              {/* Account Number Input - Input / Basic */}
              <div className="w-full max-w-[960px] h-auto min-h-[58px] flex flex-col items-start gap-2">
                
                {/* Label */}
                <label className="w-full max-w-[960px] h-auto min-h-[14px] font-['Inter'] font-medium text-sm leading-[14px] text-[#18181B]">
                  Account Number
                </label>
                
                {/* Input Wrapper */}
                <div className="w-full max-w-[960px] h-9 flex flex-col items-start gap-2">
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter Account Number"
                    className="w-full max-w-[960px] h-9 px-3 py-1 border border-[#E4E4E7] rounded-md font-['Inter'] font-normal text-sm leading-5 text-[#121417] placeholder:text-[#71717A] placeholder:font-['Inter'] placeholder:font-normal placeholder:text-sm placeholder:leading-5 focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-transparent"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Transaction ID Tab Content */}
              {/* Input Section - Depth 4, Frame 4 */}
              <div className="w-full max-w-[960px] h-auto min-h-[158px] flex flex-col items-start p-4 gap-2.5">
                
                {/* Transaction ID Input - Input / Basic */}
                <div className="w-full max-w-[928px] h-auto min-h-[58px] flex flex-col items-start gap-2">
                  
                  {/* Label */}
                  <label className="w-full max-w-[928px] h-auto min-h-[14px] font-['Inter'] font-medium text-sm leading-[14px] text-[#18181B]">
                    Transaction ID
                  </label>
                  
                  {/* Input Wrapper */}
                  <div className="w-full max-w-[928px] h-9 flex flex-col items-start gap-2">
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter Transaction ID"
                      className="w-full max-w-[928px] h-9 px-3 py-1 border border-[#E4E4E7] rounded-md font-['Inter'] font-normal text-sm leading-5 text-[#121417] placeholder:text-[#71717A] placeholder:font-['Inter'] placeholder:font-normal placeholder:text-sm placeholder:leading-5 focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Account Number Input - Input / Basic */}
                <div className="w-full max-w-[928px] h-auto min-h-[58px] flex flex-col items-start gap-2">
                  
                  {/* Label */}
                  <label className="w-full max-w-[928px] h-auto min-h-[14px] font-['Inter'] font-medium text-sm leading-[14px] text-[#18181B]">
                    Account Number
                  </label>
                  
                  {/* Input Wrapper */}
                  <div className="w-full max-w-[928px] h-9 flex flex-col items-start gap-2">
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter Account Number"
                      className="w-full max-w-[928px] h-9 px-3 py-1 border border-[#E4E4E7] rounded-md font-['Inter'] font-normal text-sm leading-5 text-[#121417] placeholder:text-[#71717A] placeholder:font-['Inter'] placeholder:font-normal placeholder:text-sm placeholder:leading-5 focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Action Buttons - Depth 4, Frame 5 */}
          <div className="w-full max-w-[960px] h-auto min-h-[64px] flex flex-row justify-center items-start">
            <div className="w-full max-w-[480px] h-auto min-h-[64px] flex flex-row flex-wrap justify-center items-start content-center py-3 px-4 gap-3">
              
              {activeTab === 'upload' ? (
                <>
                  {/* Use Camera Button - Button Wrapper */}
                  <div className="w-full sm:w-[168px] h-9 flex flex-col items-start gap-2.5">
                    <button 
                      onClick={showCamera ? closeCamera : handleUseCamera}
                      className="w-full sm:w-[168px] h-9 bg-[#F0F2F5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-4 py-2 hover:bg-[#E5E7EB] transition-colors"
                    >
                      <span className="w-full sm:w-[82px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#121417]">
                        {showCamera ? 'Close Camera' : 'Use Camera'}
                      </span>
                    </button>
                  </div>
                  
                  {/* Verify Button */}
                  <div className="w-full sm:w-[168px] h-10 flex flex-col items-start gap-2.5">
                    <button
                      onClick={handleCBEVerify}
                      disabled={isLoading}
                      className="w-full sm:w-[168px] h-10 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="w-full sm:w-10 h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]">
                        {isLoading ? 'Verifying...' : 'Verify'}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                /* Verify Button - Centered for Transaction ID tab */
                <div className="w-full sm:w-[168px] h-10 flex flex-col items-start gap-2.5">
                  <button
                    onClick={handleCBEVerify}
                    disabled={isLoading}
                    className="w-full sm:w-[168px] h-10 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="w-full sm:w-10 h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]">
                      {isLoading ? 'Verifying...' : 'Verify'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {response && (
        <ResultModal
          onClose={closeModal}
          response={response!}
          onRetry={response?.status === 'Manual_Verification_Required' ? handleSwitchToManualEntry : handleRetry}
        />
      )}

    </div>
  );
}
