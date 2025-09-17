'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ResultModal from '../../components/ResultModal';
import { VerificationResponse } from '../../components/ResultModal';
import { apiClient, ApiResponse } from '../../lib/api';
import { ErrorHandler, ErrorState } from '../../lib/errorHandler'; 

export default function BoaPage() {
  const router = useRouter();
  const [transactionId, setTransactionId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'transaction'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const handleBoaVerify = async () => {
    if (!transactionId.trim() || !accountNumber.trim()) {
      setError({
        message: 'Please enter both transaction ID and account number',
        type: 'validation',
        retryable: false
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data: ApiResponse = await apiClient.verifyBoaPayment({
        transaction_id: transactionId,
        account_number: accountNumber,
      });

      setResponse(data as VerificationResponse);
    } catch (err) {
      const errorState = ErrorHandler.handle(err);
      setError(errorState);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setResponse(null);
    setError(null);
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
      setError({
        message: 'Unable to access camera. Please check your permissions.',
        type: 'validation',
        retryable: false
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      {/* Main Container - Depth 2, Frame 1 */}
      <div className="absolute w-[1280px] h-[871px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-row justify-center items-start p-5 px-40">
        
        {/* Content Container - Depth 3, Frame 0 */}
        <div className="w-[960px] max-w-[960px] h-[815px] flex flex-col items-start gap-0.5">
          
          {/* Header Section - Depth 4, Frame 0 */}
          <div className="w-[960px] h-[67px] flex flex-col items-center py-5 px-4 pb-3 relative">
            {/* Back Button */}
            <button
              onClick={() => router.push('/')}
              className="absolute top-5 left-5 w-9 h-9 bg-[#F0F2F5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="#121417" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <h1 className="w-[928px] h-[35px] font-['Inter'] font-bold text-[28px] leading-[35px] text-center text-[#121417]">
              Verify your payment method
            </h1>
          </div>

          {/* Subtitle Section - Depth 4, Frame 1 */}
          <div className="w-[960px] h-10 flex flex-col items-center py-1 px-4 pb-3">
            <p className="w-[928px] h-6 font-['Inter'] font-normal text-base leading-6 text-center text-[#121417]">
              Select the bank associated with your payment method to proceed with verification.
            </p>
          </div>

          {/* Bank Card Section - Depth 4, Frame 7 */}
          <div className="w-[960px] h-[203.5px] flex flex-col items-start p-4 border-b border-[#8C8C8C] border-opacity-50">
            <div className="w-[928px] h-[171px] flex flex-row justify-between items-center gap-4 rounded-lg">
              
              {/* Left Content - Depth 6, Frame 0 */}
              <div className="w-[608px] h-[171px] flex flex-col justify-center items-start gap-1">
                
                {/* Title - Depth 7, Frame 0 */}
                <div className="w-[608px] h-5 flex flex-col items-start">
                  <h3 className="w-[608px] h-5 font-['Inter'] font-bold text-base leading-5 text-[#121417]">
                    Bank Of Abyssinia
                  </h3>
                </div>
                
                {/* Description - Depth 7, Frame 1 */}
                <div className="w-[608px] h-[21px] flex flex-col items-start">
                  <p className="w-[608px] h-[21px] font-['Inter'] font-normal text-sm leading-[21px] text-[#61758A]">
                    Validate Bank of Abyssinia Payments.
                  </p>
                </div>
                
              </div>

              {/* Right Content - Logo */}
              <div className="w-[312.2px] h-[77px] bg-contain bg-no-repeat bg-center" style={{ backgroundImage: 'url(/logos/boa.png)' }}></div>
            </div>
          </div>

          {/* Tab Navigation - Depth 4, Frame 3 */}
          <div className="w-[960px] h-[61px] flex flex-col items-start pb-3">
            <div className="w-[960px] h-[49px] flex flex-row items-start px-4 gap-8 border-b border-[#DBE0E6]">
              <div className="w-[928px] max-w-[1304px] h-12 flex flex-row items-center">
                
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
              <div className="w-[960px] h-[281px] flex flex-col items-start p-4">
                {/* Upload Area - Depth 5, Frame 0 */}
                <div 
                  className="w-[928px] h-[249px] flex flex-col items-center py-14 px-6 gap-6 border-2 border-dashed border-[#DBE0E6] rounded-lg"
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
                        setError({
                          message: 'Please drop an image file or PDF',
                          type: 'validation',
                          retryable: false
                        });
                      }
                    }
                  }}
                  onClick={handleBrowseFile}
                  style={{ cursor: 'pointer' }}
                >
                  
                  {/* Text Content - Depth 6, Frame 0 */}
                  <div className="w-[480px] max-w-[480px] h-[73px] flex flex-col items-center gap-2">
                    
                    {/* Main Text - Depth 7, Frame 0 */}
                    <div className="w-[217px] max-w-[480px] h-[23px] flex flex-col items-center">
                      <h3 className="w-[217px] h-[23px] font-['Inter'] font-bold text-lg leading-[23px] text-center text-[#121417] whitespace-nowrap">
                        {selectedFile ? 'File Selected' : 'Drag and drop or browse'}
                      </h3>
                    </div>
                    
                    {/* Description - Depth 7, Frame 1 */}
                    <div className="w-[480px] max-w-[480px] h-[42px] flex flex-col items-center">
                      {selectedFile ? (
                        <p className="w-[480px] h-[42px] font-['Inter'] font-normal text-sm leading-[21px] text-center text-[#34C759]">
                          Selected: {selectedFile.name}
                        </p>
                      ) : (
                        <p className="w-[480px] h-[42px] font-['Inter'] font-normal text-sm leading-[21px] text-center text-[#121417]">
                          Upload a bank statement or a screenshot of a recent transaction from your BOA account.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Browse File Button - Button Wrapper */}
                  <div className="w-[109px] h-9 flex flex-col items-start gap-2.5">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBrowseFile();
                      }}
                      className="w-[109px] h-9 bg-[#F0F2F5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-4 py-2 hover:bg-[#E5E7EB] transition-colors"
                    >
                      <span className="w-[77px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#121417] whitespace-nowrap">
                        {selectedFile ? 'Change File' : 'Browse File'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Number Input - Input / Basic */}
              <div className="w-[960px] h-[58px] flex flex-col items-start gap-2">
                
                {/* Label */}
                <label className="w-[960px] h-[14px] font-['Inter'] font-medium text-sm leading-[14px] text-[#18181B]">
                  Account Number
                </label>
                
                {/* Input Wrapper */}
                <div className="w-[960px] h-9 flex flex-col items-start gap-2">
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter Account Number"
                    className="w-[960px] h-9 px-3 py-1 border border-[#E4E4E7] rounded-md font-['Inter'] font-normal text-sm leading-5 text-[#121417] placeholder:text-[#71717A] placeholder:font-['Inter'] placeholder:font-normal placeholder:text-sm placeholder:leading-5 focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-transparent"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Transaction ID Tab Content */}
              {/* Input Section - Depth 4, Frame 4 */}
              <div className="w-[960px] h-[158px] flex flex-col items-start p-4 gap-2.5">
                
                {/* Transaction ID Input - Input / Basic */}
                <div className="w-[928px] h-[58px] flex flex-col items-start gap-2">
                  
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
                      placeholder="Enter Transaction ID"
                      className="w-[928px] h-9 px-3 py-1 border border-[#E4E4E7] rounded-md font-['Inter'] font-normal text-sm leading-5 text-[#121417] placeholder:text-[#71717A] placeholder:font-['Inter'] placeholder:font-normal placeholder:text-sm placeholder:leading-5 focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Account Number Input - Input / Basic */}
                <div className="w-[928px] h-[58px] flex flex-col items-start gap-2">
                  
                  {/* Label */}
                  <label className="w-[928px] h-[14px] font-['Inter'] font-medium text-sm leading-[14px] text-[#18181B]">
                    Account Number
                  </label>
                  
                  {/* Input Wrapper */}
                  <div className="w-[928px] h-9 flex flex-col items-start gap-2">
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter Account Number"
                      className="w-[928px] h-9 px-3 py-1 border border-[#E4E4E7] rounded-md font-['Inter'] font-normal text-sm leading-5 text-[#121417] placeholder:text-[#71717A] placeholder:font-['Inter'] placeholder:font-normal placeholder:text-sm placeholder:leading-5 focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Action Buttons - Depth 4, Frame 5 */}
          <div className="w-[960px] h-[64px] flex flex-row justify-center items-start">
            <div className="w-[480px] max-w-[480px] h-[64px] flex flex-row flex-wrap justify-center items-start content-center py-3 px-4 gap-3">
              
              {activeTab === 'upload' ? (
                <>
                  {/* Use Camera Button - Button Wrapper */}
                  <div className="w-[168px] h-9 flex flex-col items-start gap-2.5">
                    <button 
                      onClick={handleUseCamera}
                      className="w-[168px] h-9 bg-[#F0F2F5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-4 py-2 hover:bg-[#E5E7EB] transition-colors"
                    >
                      <span className="w-[82px] h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#121417]">
                        Use Camera
                      </span>
                    </button>
                  </div>
                  
                  {/* Verify Button */}
                  <div className="w-[168px] h-10 flex flex-col items-start gap-2.5">
                    <button
                      onClick={handleBoaVerify}
                      disabled={isLoading}
                      className="w-[168px] h-10 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="w-10 h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]">
                        {isLoading ? 'Verifying...' : 'Verify'}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                /* Verify Button - Centered for Transaction ID tab */
                <div className="w-[168px] h-10 flex flex-col items-start gap-2.5">
                  <button
                    onClick={handleBoaVerify}
                    disabled={isLoading}
                    className="w-[168px] h-10 bg-[#34C759] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-md flex items-center justify-center px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="w-10 h-5 font-['Inter'] font-medium text-sm leading-5 flex items-center text-[#FAFAFA]">
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
        />
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Error</h3>
            <p className="text-gray-700 mb-4">{error.message}</p>
            {error.details && (
              <p className="text-sm text-gray-500 mb-6">{error.details}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 bg-[#18181B] text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
              {ErrorHandler.isRetryable(error) && (
                <button
                  onClick={() => {
                    setError(null);
                    handleBoaVerify();
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
