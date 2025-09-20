export interface VerificationAttempt {
  id: string;
  bank: 'telebirr' | 'boa' | 'cbe';
  transactionId?: string;
  accountNumber?: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  errorType?: string;
}

export class VerificationHistory {
  private static getStorageKey(bank: string): string {
    return `${bank}_verification_history`;
  }

  static addAttempt(
    bank: 'telebirr' | 'boa' | 'cbe', 
    attempt: Omit<VerificationAttempt, 'id' | 'timestamp' | 'bank'>
  ): string {
    const history = this.getHistory(bank);
    const newAttempt: VerificationAttempt = {
      ...attempt,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      bank,
    };

    // Add to beginning of array (most recent first)
    history.unshift(newAttempt);

    // Keep only last 50 attempts to prevent storage bloat
    const limitedHistory = history.slice(0, 50);

    localStorage.setItem(this.getStorageKey(bank), JSON.stringify(limitedHistory));
    
    return newAttempt.id;
  }

  static getHistory(bank: 'telebirr' | 'boa' | 'cbe'): VerificationAttempt[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(bank));
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error(`Error parsing history for ${bank}:`, e);
      return [];
    }
  }

  static updateAttemptStatus(
    bank: 'telebirr' | 'boa' | 'cbe', 
    id: string, 
    status: 'success' | 'failed',
    errorType?: string
  ) {
    const history = this.getHistory(bank);
    const attemptIndex = history.findIndex(attempt => attempt.id === id);
    if (attemptIndex > -1) {
      history[attemptIndex].status = status;
      if (errorType) {
        history[attemptIndex].errorType = errorType;
      }
      localStorage.setItem(this.getStorageKey(bank), JSON.stringify(history));
    }
  }

  static getUniqueValues(
    bank: 'telebirr' | 'boa' | 'cbe', 
    type: 'transactionId' | 'accountNumber'
  ): string[] {
    const history = this.getHistory(bank);
    const values = history
      .map(attempt => type === 'transactionId' ? attempt.transactionId : attempt.accountNumber)
      .filter((val): val is string => !!val);
    
    // Remove duplicates and return most recent first
    return Array.from(new Set(values)).slice(0, 10);
  }

  static getAttemptsByValue(
    bank: 'telebirr' | 'boa' | 'cbe', 
    type: 'transactionId' | 'accountNumber',
    value: string
  ): VerificationAttempt[] {
    const history = this.getHistory(bank);
    return history.filter(attempt => {
      const attemptValue = type === 'transactionId' ? attempt.transactionId : attempt.accountNumber;
      return attemptValue === value;
    });
  }

  static clearHistory(bank: 'telebirr' | 'boa' | 'cbe') {
    localStorage.removeItem(this.getStorageKey(bank));
  }

  static clearAllHistory() {
    ['telebirr', 'boa', 'cbe'].forEach(bank => {
      localStorage.removeItem(this.getStorageKey(bank));
    });
  }
}
