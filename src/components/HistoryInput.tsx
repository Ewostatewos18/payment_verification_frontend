'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VerificationHistory, VerificationAttempt } from '../utils/verificationHistory';

interface HistoryInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  bank: 'telebirr' | 'boa' | 'cbe';
  type: 'transactionId' | 'accountNumber';
  className?: string;
}

const HistoryInput: React.FC<HistoryInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  bank,
  type,
  className,
}) => {
  const [history, setHistory] = useState<VerificationAttempt[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredHistory, setFilteredHistory] = useState<VerificationAttempt[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, [bank, type]);

  const loadHistory = () => {
    const allAttempts = VerificationHistory.getHistory(bank);
    setHistory(allAttempts);
    setFilteredHistory(allAttempts);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Filter history based on input
    const filtered = history.filter(attempt => {
      const attemptValue = type === 'transactionId' ? attempt.transactionId : attempt.accountNumber;
      return attemptValue?.toLowerCase().includes(newValue.toLowerCase());
    });
    setFilteredHistory(filtered);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleSelectHistory = (attempt: VerificationAttempt) => {
    const selectedValue = type === 'transactionId' ? attempt.transactionId : attempt.accountNumber;
    if (selectedValue) {
      onChange(selectedValue);
      setShowDropdown(false);
    }
  };


  const handleClickOutside = (event: MouseEvent) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(event.target as Node) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Group attempts by value for better display
  const groupedHistory = filteredHistory.reduce((acc, attempt) => {
    const attemptValue = type === 'transactionId' ? attempt.transactionId : attempt.accountNumber;
    if (!attemptValue) return acc;
    
    if (!acc[attemptValue]) {
      acc[attemptValue] = [];
    }
    acc[attemptValue].push(attempt);
    return acc;
  }, {} as Record<string, VerificationAttempt[]>);

  return (
    <div className="relative w-full">
      <label className="w-full h-[14px] font-['Inter'] font-medium text-sm leading-[14px] text-[#18181B] mb-2 block">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className={`w-full h-9 px-3 py-2 border border-[#E4E4E7] rounded-md font-['Inter'] font-normal text-sm leading-5 text-[#121417] placeholder:text-[#71717A] placeholder:font-['Inter'] placeholder:font-normal placeholder:text-sm placeholder:leading-5 focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-transparent ${className}`}
      />

      {showDropdown && Object.keys(groupedHistory).length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full bg-white border border-[#E4E4E7] rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
        >
          {Object.entries(groupedHistory).map(([value, attempts]) => {
            const latestAttempt = attempts[0]; // Most recent attempt
            
            return (
              <div
                key={value}
                className="px-3 py-2 cursor-pointer hover:bg-[#F0F2F5] text-[#121417] text-sm border-b border-[#F0F2F5] last:border-b-0"
                onClick={() => handleSelectHistory(latestAttempt)}
              >
                <div className="flex items-center">
                  <span className="truncate">{value}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryInput;
