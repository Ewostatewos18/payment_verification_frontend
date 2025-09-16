'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';

export default function HealthCheck() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      await apiClient.healthCheck();
      setStatus('connected');
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setStatus('disconnected');
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    // Check immediately
    checkHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      case 'checking':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Backend Connected';
      case 'disconnected':
        return 'Backend Disconnected';
      case 'checking':
        return 'Checking connection...';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        status === 'connected' ? 'bg-green-500' : 
        status === 'disconnected' ? 'bg-red-500' : 
        'bg-yellow-500 animate-pulse'
      }`} />
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
      {lastChecked && (
        <span className="text-xs text-gray-500">
          ({lastChecked.toLocaleTimeString()})
        </span>
      )}
    </div>
  );
}
