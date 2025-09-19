'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ResultModal from '../../components/ResultModal';
import { VerificationResponse } from '../../components/ResultModal';
import { apiClient, ApiResponse } from '../../lib/api';
import { ErrorHandler } from '../../lib/errorHandler';

export default function TelebirrPage() {
  const router = useRouter();
  const [transactionId, setTransactionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<VerificationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'transaction'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const handleTelebirrVerify = async () => {
    if (activeTab === 'upload') {
        if (!selectedFile) {
          setResponse({
            status: 'failed',
            message: 'Please select an image file to continue with verification.',
            error_type: 'validation'
          } as VerificationResponse);
          return;
        }
    } else {
      if (!transactionId.trim()) {
        setResponse({
          status: 'failed',
          message: 'Please enter a transaction ID to continue with verification.',
          error_type: 'validation'
        } as VerificationResponse);
        return;
      }
    }

    setIsLoading(true);

    try {
      let data: ApiResponse;
      
      if (activeTab === 'upload') {
        data = await apiClient.verifyTelebirrImage({
          file: selectedFile!,
        });
      } else {
        data = await apiClient.verifyTelebirrPayment({
          transaction_id: transactionId,
        });
      }

      setResponse(data as VerificationResponse);
    } catch (err) {
      console.log('Telebirr Error caught:', err);
      
      // Check if this is a Manual Verification Required response
      // The error might be in different structures depending on how it's processed
      if (err && typeof err === 'object') {
        console.log('Full error object:', err);
        
        // Check if it's the processed error from API client
        if ('message' in err && 'error_type' in err) {
          const processedError = err as { message: string; error_type: string; status?: number };
          console.log('Processed error structure:', processedError);
          
          // Check if the message indicates manual verification required
          if (processedError.message.includes('Unable to extract transaction ID from image') && 
              processedError.message.includes('Please enter it manually')) {
            console.log('Manual verification required detected from processed error');
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
          
          console.log('Raw response data structure:', responseData);
          console.log('Checking status:', responseData?.data?.status);
          
          if (responseData?.data?.status === 'Manual Verification Required') {
            console.log('Manual verification required detected from raw response');
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
          console.log('Direct error message:', directError.message);
          
          if (directError.message.includes('Unable to extract transaction ID from image') && 
              directError.message.includes('Please enter it manually')) {
            console.log('Manual verification required detected from direct error');
            setResponse({
              status: 'Manual_Verification_Required',
              message: directError.message,
              extracted_data: { transaction_id: undefined }
            } as VerificationResponse);
            return;
          }
        }
      }
      
      const errorState = ErrorHandler.handle(err);
      
      // Set response with error information for ResultModal
      setResponse({
        status: 'failed',
        message: errorState.message,
        error_type: errorState.type
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
    handleTelebirrVerify();
  };

  const retryVerification = () => {
    setResponse(null);
    setError(null);
    // Automatically retry the verification with the same form data
    handleTelebirrVerify();
  };



  const handleBrowseFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        console.log('File selected:', file.name);
      }
    };
    input.click();
  };

  const handleUseCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // For now, we'll just show an alert. In a real app, you'd implement camera capture
      alert('Camera access granted! Camera capture functionality would be implemented here.');
      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error accessing camera:', error);
      setResponse({
        status: 'failed',
        message: 'Unable to access camera. Please check your permissions.',
        error_type: 'validation'
      } as VerificationResponse);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      {/* Main Container - Depth 2, Frame 1 */}
      <div className="absolute w-full max-w-[1280px] h-auto min-h-[765px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-row justify-center items-start p-4 sm:p-5 px-4 sm:px-40">
        
        {/* Content Container - Depth 3, Frame 0 */}
        <div className="w-full max-w-[960px] h-auto min-h-[716.5px] flex flex-col items-start">
          
          {/* Header Section - Depth 4, Frame 0 */}
          <div className="w-full max-w-[960px] h-auto min-h-[67px] flex flex-col items-center p-5 pb-3 gap-3 relative">
            {/* Back Button */}
            <button
              onClick={() => router.push('/')}
              className="absolute top-5 left-5 w-9 h-9 bg-[#F0F2F5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="#121417" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <h1 className="w-full max-w-[928px] h-auto min-h-[35px] font-['Inter'] font-bold text-[28px] leading-[35px] text-center text-[#121417]">
              Verify your payment method
            </h1>
            <p className="w-full max-w-[928px] h-auto min-h-6 font-['Inter'] font-normal text-base leading-6 text-center text-[#121417]">
              Select the bank associated with your payment method to proceed with verification.
            </p>
          </div>

          {/* Telebirr Card Section - Depth 4, Frame 6 */}
          <div className="w-full max-w-[960px] h-auto min-h-[203.5px] flex flex-col justify-center items-start p-4 border-b border-[#8C8C8C] border-opacity-50">
            <div className="w-full max-w-[928px] h-auto min-h-[171px] flex flex-col sm:flex-row justify-between items-center gap-4 rounded-lg">
              
              {/* Left Content - Depth 6, Frame 0 */}
              <div className="w-full sm:w-[608px] h-auto min-h-[171px] flex flex-col justify-center items-start gap-1">
                
                {/* Title - Depth 7, Frame 0 */}
                <div className="w-full sm:w-[608px] h-auto min-h-5 flex flex-col items-start">
                  <h3 className="w-full sm:w-[608px] h-auto min-h-5 font-['Inter'] font-bold text-base leading-5 text-[#121417]">
                    Telebirr
                  </h3>
                </div>
                
                {/* Description - Depth 7, Frame 1 */}
                <div className="w-full sm:w-[608px] h-auto min-h-[21px] flex flex-col items-start">
                  <p className="w-full sm:w-[608px] h-auto min-h-[21px] font-['Inter'] font-normal text-sm leading-[21px] text-[#61758A]">
                    Verify mobile money transfer instantly.
                  </p>
                </div>
                
             </div>

              {/* Right Content - Logo */}
              <div className="w-full sm:w-[327.21px] h-16 sm:h-[127px] bg-contain bg-no-repeat bg-center" style={{ backgroundImage: 'url(/logos/telebirr.png)' }}></div>
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
                  <span className="font-['Inter'] font-medium text-sm leading-5 text-[#121417]">
                    Upload
                  </span>
                </button>

                {/* Enter Transaction ID Tab */}
                <button
                  onClick={() => setActiveTab('transaction')}
                  className={`w-[159px] h-12 flex flex-row justify-center items-center p-1.5 gap-2 ${activeTab === 'transaction' ? 'border-b-2 border-[#18181B]' : ''}`}
                >
                  <span className="font-['Inter'] font-medium text-sm leading-5 text-[#121417]">
                    Enter Transaction ID
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area - Depth 4, Frame 4 */}
          <div className="w-full max-w-[960px] h-auto min-h-[281px] flex flex-col items-start p-4">
            
            {activeTab === 'upload' ? (
              <>
                {/* Upload Area - Depth 5, Frame 0 */}
                <div 
                  className="w-full max-w-[928px] h-auto min-h-[249px] flex flex-col items-center py-8 sm:py-14 px-4 sm:px-6 gap-4 sm:gap-6 border-2 border-dashed border-[#DBE0E6] rounded-lg"
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = e.dataTransfer.files;
                    if (files && files[0]) {
                      const file = files[0];
                      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                        setSelectedFile(file);
                        console.log('File dropped:', file.name);
                      } else {
                        setResponse({
                          status: 'failed',
                          message: 'Please drop an image file or PDF',
                          error_type: 'validation'
                        } as VerificationResponse);
                      }
                    }
                  }}
                  onClick={handleBrowseFile}
                  style={{ cursor: 'pointer' }}
                >
                  
                  {/* Text Content - Depth 6, Frame 0 */}
                  <div className="w-full max-w-[480px] h-auto min-h-[73px] flex flex-col items-center gap-2">
                    
                    {/* Main Text - Depth 7, Frame 0 */}
                    <div className="w-full max-w-[480px] h-auto min-h-[23px] flex flex-col items-center">
                      <h3 className="w-full max-w-[480px] h-auto min-h-[23px] font-['Inter'] font-bold text-lg leading-[23px] text-center text-[#121417]">
                        {selectedFile ? 'File Selected' : 'Drag and drop or browse'}
                      </h3>
                    </div>
                    
                    {/* Description - Depth 7, Frame 1 */}
                    <div className="w-full max-w-[480px] h-auto min-h-[42px] flex flex-col items-center">
                      {selectedFile ? (
                        <p className="w-full max-w-[480px] h-auto min-h-[42px] font-['Inter'] font-normal text-sm leading-[21px] text-center text-[#34C759] break-words">
                          Selected: {selectedFile.name}
                        </p>
                      ) : (
                        <p className="w-full max-w-[480px] h-auto min-h-[42px] font-['Inter'] font-normal text-sm leading-[21px] text-center text-[#121417]">
                          Upload a bank statement or a screenshot of a recent transaction from your Telebirr account.
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
                      <span className="w-full sm:w-[82px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#121417]">
                        {selectedFile ? 'Change File' : 'Browse File'}
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons - Depth 4, Frame 5 */}
                <div className="w-full max-w-[960px] h-auto min-h-[64px] flex mt-4 flex-row justify-center items-start">
                  <div className="w-full max-w-[480px] h-auto min-h-[64px] flex flex-row flex-wrap justify-center items-start content-center py-3 px-4 gap-3">
                    
                    {/* Use Camera Button - Button Wrapper */}
                    <div className="w-full sm:w-[168px] h-9 flex flex-col items-start gap-2.5">
                      <button 
                        onClick={handleUseCamera}
                        className="w-full sm:w-[168px] h-9 bg-[#F0F2F5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-4 py-2 hover:bg-[#E5E7EB] transition-colors"
                      >
                        <span className="w-full sm:w-[82px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#121417]">
                          Use Camera
                        </span>
                      </button>
                    </div>
                    
                    {/* Verify Button */}
                    <div className="w-full sm:w-[168px] h-9 flex flex-col items-start gap-2.5">
                      <button
                        onClick={handleTelebirrVerify}
                        disabled={isLoading}
                        className="w-full sm:w-[168px] h-9 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="w-full sm:w-10 h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]">
                          {isLoading ? 'Verifying...' : 'Verify'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Transaction ID Input Area - Depth 4, Frame 4 */
              <div className="w-[960px] h-[90px] flex flex-col items-start">
                
                {/* Input / Basic */}
                <div className="w-[928px] h-[58px] mb-4 flex flex-col items-start gap-2">
                  
                  {/* Label */}
                  <label className="w-[928px] h-[14px] font-['Inter'] font-medium text-sm leading-[14px] text-[#18181B]">
                    Transaction ID
                  </label>
                  
                  {/* Input Wrapper */}
                  <div className="w-[928px] h-9 flex flex-col items-start gap-2">
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter Telebirr Transaction ID"
                      className="w-[928px] h-9 px-3 py-2 border border-[#E4E4E7] rounded-md font-['Inter'] font-normal text-sm leading-5 text-[#121417] placeholder:text-[#71717A] placeholder:font-['Inter'] placeholder:font-normal placeholder:text-sm placeholder:leading-5 focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Verify Button Section - Depth 4, Frame 5 */}
                <div className="w-[960px] h-[64px] flex flex-row justify-center items-start">
                  <div className="w-[480px] max-w-[480px] h-[64px] flex flex-row flex-wrap justify-center items-start content-center py-3 px-4 gap-3">
                    
                    {/* Verify Button */}
                    <button
                      onClick={handleTelebirrVerify} 
                      disabled={isLoading}
                      className="w-[168px] h-10 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="w-10 h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]">
                        {isLoading ? 'Verifying...' : 'Verify'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
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