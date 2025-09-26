'use client';

import React, { useState, useRef, useCallback, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
// Use native img for base64 data/camera preview to avoid Next image overhead
// eslint-disable-next-line @next/next/no-img-element
import Webcam from 'react-webcam';
import ResultModal from '../../components/ResultModal';
import HistoryInput from '../../components/HistoryInput';
import { VerificationResponse } from '../../types/verification';
import { apiClient, ApiResponse } from '../../lib/api';
import { ErrorHandler } from '../../lib/errorHandler';
import { VerificationHistory } from '../../utils/verificationHistory'; 

export default function BoaPage() {
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


  const handleBoaVerify = async () => {
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

    // Record the verification attempt in history
    const attemptId = VerificationHistory.addAttempt('boa', {
      accountNumber: accountNumber,
      transactionId: activeTab === 'transaction' ? transactionId : undefined,
      status: 'pending'
    });

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
        
        data = await apiClient.verifyBoaImage({
          file: fileToUpload!,
          account_number: accountNumber,
        });
      } else {
        data = await apiClient.verifyBoaPayment({
        transaction_id: transactionId,
        account_number: accountNumber,
      });
      }

      // Update attempt status to success
      VerificationHistory.updateAttemptStatus('boa', attemptId, 'success');
      setResponse(data as VerificationResponse);
    } catch (err) {
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
      
      // Update attempt status to failed
      VerificationHistory.updateAttemptStatus('boa', attemptId, 'failed', 'network');
      
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

  const closeModal = useCallback(() => {
    startTransition(() => setResponse(null));
  }, []);

  const handleSwitchToManualEntry = useCallback(() => {
    // Extract transaction ID from response if available
    const extractedId = response?.extracted_data?.transaction_id || response?.verified_data?.transaction_id;
    if (extractedId) {
      startTransition(() => setTransactionId(extractedId));
    }
    // Switch to transaction tab
    startTransition(() => setActiveTab('transaction'));
    // Close modal
    closeModal();
  }, [response, closeModal]);

  const handleRetry = useCallback(() => {
    // Close modal and retry the same operation
    closeModal();
    handleBoaVerify();
  }, [closeModal]);




  const handleBrowseFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        startTransition(() => setSelectedFile(file));
      }
    };
    input.click();
  }, []);

  const handleUseCamera = useCallback(() => {
    startTransition(() => {
      setShowCamera(true);
      setSelectedFile(null);
      setCapturedImageSrc(null);
      setCameraError(null);
      setIsCameraActive(false);
    });
  }, []);

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

  const retakePhoto = useCallback(() => {
    startTransition(() => {
      setCapturedImageSrc(null);
      setCameraError(null);
    });
  }, []);

  const closeCamera = useCallback(() => {
    try {
      const mediaStream = (webcamRef.current?.video?.srcObject as MediaStream | null);
      mediaStream?.getTracks().forEach((t) => t.stop());
    } catch {}
    startTransition(() => {
      setShowCamera(false);
      setCapturedImageSrc(null);
      setCameraError(null);
      setIsCameraActive(false);
    });
  }, []);

  // Add a small delay after camera becomes active to ensure it's fully ready
  useEffect(() => {
    if (isCameraActive && showCamera) {
      const timer = setTimeout(() => {
        // Camera should be ready now
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCameraActive, showCamera]);

  // Ensure camera tracks stop on unmount
  useEffect(() => {
    return () => {
      try {
        const mediaStream = (webcamRef.current?.video?.srcObject as MediaStream | null);
        mediaStream?.getTracks().forEach((t) => t.stop());
      } catch {}
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      {/* Main Container - Responsive */}
      <div className="w-full max-w-7xl mx-auto flex flex-row justify-center items-start p-4 sm:p-6 lg:p-8">
        
        {/* Content Container - Responsive */}
        <div className="w-full max-w-4xl flex flex-col items-start gap-0.5">
          
          {/* Header Section - Responsive */}
          <div className="w-full h-auto flex flex-col items-center py-4 sm:py-6 px-4 pb-3 relative">
            {/* Back Button */}
            <button
              onClick={() => router.push('/')}
              className="absolute top-4 left-4 sm:top-6 sm:left-6 w-9 h-9 bg-[#F0F2F5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="#121417" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <h1 className="w-full font-['Inter'] font-bold text-xl sm:text-2xl lg:text-[28px] leading-tight text-center text-[#121417]">
              Verify your payment method
            </h1>
            <p className="w-full font-['Inter'] font-normal text-sm sm:text-base leading-relaxed text-center text-[#121417]">
              Select the bank associated with your payment method to proceed with verification.
            </p>
          </div>

          {/* Bank Card Section - Responsive */}
          <div className="w-full h-auto flex flex-col items-start p-4 sm:p-6 border-b border-[#8C8C8C] border-opacity-50">
            <div className="w-full h-auto flex flex-col sm:flex-row justify-between items-center gap-4 rounded-lg">
              
              {/* Left Content - Depth 6, Frame 0 */}
              <div className="w-full sm:w-[608px] h-auto min-h-[171px] flex flex-col justify-center items-start gap-1">
                
                {/* Title - Depth 7, Frame 0 */}
                <div className="w-full sm:w-[608px] h-auto min-h-5 flex flex-col items-start">
                  <h3 className="w-full sm:w-[608px] h-auto min-h-5 font-['Inter'] font-bold text-base leading-5 text-[#121417]">
                    Bank Of Abyssinia
                  </h3>
                </div>
                
                {/* Description - Depth 7, Frame 1 */}
                <div className="w-full sm:w-[608px] h-auto min-h-[21px] flex flex-col items-start">
                  <p className="w-full sm:w-[608px] h-auto min-h-[21px] font-['Inter'] font-normal text-sm leading-[21px] text-[#61758A]">
                    Validate Bank of Abyssinia Payments.
                  </p>
                </div>
                
              </div>

              {/* Right Content - Logo */}
              <div className="w-full sm:w-[312.2px] h-16 sm:h-[77px] bg-contain bg-no-repeat bg-center" style={{ backgroundImage: 'url(/logos/boa.png)' }}></div>
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
              {/* Content Area - Responsive */}
              <div className="w-full h-auto flex flex-col items-start p-4 sm:p-6">
                {/* Upload Area - Responsive */}
                <div 
                  className={`w-full h-auto min-h-[200px] sm:min-h-[249px] flex flex-col items-center py-8 sm:py-14 px-6 gap-6 border-2 border-dashed border-[#DBE0E6] rounded-lg ${!showCamera && !capturedImageSrc ? 'cursor-pointer' : ''}`}
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
                      
                      <div className="w-full h-48 sm:h-64 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 mb-4 relative">
                        {capturedImageSrc ? (
                          <img 
                            src={capturedImageSrc} 
                            alt="Captured" 
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
                      {/* Drag and Drop Content - Responsive */}
                      <div className="flex flex-col items-center p-0 gap-2 w-full max-w-[480px] h-auto">
                        
                        {/* Drag and drop or browse */}
                        <h3 className="w-full font-['Inter'] font-bold text-base sm:text-[18px] leading-tight text-center text-[#121417]">
                          {selectedFile ? 'File Selected' : 'Drag and drop or browse'}
                        </h3>
                        
                        {/* Description */}
                        <div className="flex flex-col items-center p-0 w-full h-auto">
                      {selectedFile ? (
                            <p className="w-full font-['Inter'] font-normal text-sm leading-[21px] text-center text-[#34C759] break-words">
                          Selected: {selectedFile.name}
                        </p>
                      ) : (
                            <p className="w-full font-['Inter'] font-normal text-sm leading-[21px] text-center text-[#121417]">
                          Upload a bank statement or a screenshot of a recent transaction from your BOA account.
                        </p>
                      )}
                    </div>
                  </div>
                  
                      {/* Button Wrapper - Responsive */}
                      <div className="flex flex-col items-center p-0 gap-2 w-auto h-auto">
                    <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBrowseFile();
                          }}
                          className="flex flex-row justify-center items-center px-4 py-2 gap-2 w-auto h-9 bg-[#F0F2F5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md hover:bg-[#E5E7EB] transition-colors"
                        >
                          <span className="font-['Inter'] font-medium text-sm leading-5 whitespace-nowrap text-[#121417]">
                        {selectedFile ? 'Change File' : 'Browse File'}
                      </span>
                    </button>
                  </div>
                    </>
                  )}
                </div>
              </div>


              {/* Account Number Input with History */}
              <div className="w-full h-auto flex flex-col items-start gap-2 mt-6">
                <HistoryInput
                    value={accountNumber}
                  onChange={setAccountNumber}
                    placeholder="Enter Account Number"
                  label="Account Number"
                  bank="boa"
                  type="accountNumber"
                  onEnterPress={handleBoaVerify}
                  />
              </div>
            </>
          ) : (
            <>
              {/* Transaction ID Tab Content */}
              {/* Input Section - Depth 4, Frame 4 */}
              <div className="w-full max-w-[960px] h-auto min-h-[158px] flex flex-col items-start p-4 gap-2.5">
                
                {/* Transaction ID Input with History */}
                <div className="w-full h-auto flex flex-col items-start gap-2">
                <HistoryInput
                      value={transactionId}
                  onChange={setTransactionId}
                      placeholder="Enter Transaction ID"
                  label="Transaction ID"
                  bank="boa"
                  type="transactionId"
                  onEnterPress={handleBoaVerify}
                    />
                </div>

                {/* Account Number Input with History */}
                <div className="w-full h-auto flex flex-col items-start gap-2">
                  <HistoryInput
                      value={accountNumber}
                    onChange={setAccountNumber}
                      placeholder="Enter Account Number"
                    label="Account Number"
                    bank="boa"
                    type="accountNumber"
                    onEnterPress={handleBoaVerify}
                    />
                </div>
              </div>
            </>
          )}
          
          {/* Action Buttons - Responsive */}
          <div className="w-full h-auto flex flex-row justify-center items-start mt-6">
            <div className="w-full max-w-md h-auto flex flex-col sm:flex-row justify-center items-center gap-3 py-3">
              
              {activeTab === 'upload' ? (
                <>
                  {/* Use Camera Button - Responsive */}
                  <div className="w-full sm:w-auto h-9 flex flex-col items-center">
                    <button 
                      onClick={showCamera ? closeCamera : handleUseCamera}
                      className="w-full sm:w-[168px] h-9 bg-[#F0F2F5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-4 py-2 hover:bg-[#E5E7EB] transition-colors"
                    >
                       <span className="font-['Inter'] font-medium text-sm leading-5 text-[#121417] whitespace-nowrap">
                        {showCamera ? 'Close Camera' : 'Use Camera'}
                      </span>
                    </button>
                  </div>
                  
                  {/* Verify Button - Responsive */}
                  <div className="w-full sm:w-auto h-10 flex flex-col items-center">
                    <button
                      onClick={handleBoaVerify}
                      disabled={isLoading}
                      className="w-full sm:w-[168px] h-10 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="font-['Inter'] font-medium text-sm leading-5 text-[#FAFAFA]">
                        {isLoading ? 'Verifying...' : 'Verify'}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                /* Verify Button - Responsive for Transaction ID tab */
                <div className="w-full sm:w-auto h-10 flex flex-col items-center">
                  <button
                    onClick={handleBoaVerify}
                    disabled={isLoading}
                    className="w-full sm:w-[168px] h-10 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="font-['Inter'] font-medium text-sm leading-5 text-[#FAFAFA]">
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
          allowManual={activeTab !== 'transaction'}
          onRetry={response?.status === 'Manual_Verification_Required' ? handleSwitchToManualEntry : handleRetry}
        />
      )}

    </div>
  );
}
