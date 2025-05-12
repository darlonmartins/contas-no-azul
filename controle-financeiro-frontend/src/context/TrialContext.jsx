import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const TrialContext = createContext();

export const TrialProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [trialStatus, setTrialStatus] = useState({
    isActive: true,
    hasPaid: false,
    daysLeft: 7,
    startDate: null,
    endDate: null,
    status: 'active' // 'active', 'expiring', 'expired'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkTrialStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const checkTrialStatus = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.get('/api/trial/status', config);
      
      const { daysLeft, isActive, hasPaid, startDate, endDate } = res.data.data;
      
      let status = 'active';
      if (!isActive && !hasPaid) {
        status = 'expired';
      } else if (daysLeft <= 2) {
        status = 'expiring';
      }
      
      setTrialStatus({
        isActive,
        hasPaid,
        daysLeft,
        startDate,
        endDate,
        status
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao verificar status do trial:', error);
      setError('Erro ao verificar status do trial');
      setLoading(false);
    }
  };

  const startTrial = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.post('/api/trial/start', {}, config);
      await checkTrialStatus();
    } catch (error) {
      console.error('Erro ao iniciar trial:', error);
      setError('Erro ao iniciar período de trial');
      setLoading(false);
    }
  };

  const registerPayment = async (paymentData) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.post('/api/trial/payment', paymentData, config);
      await checkTrialStatus();
      return true;
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      setError('Erro ao registrar pagamento');
      setLoading(false);
      return false;
    }
  };

  return (
    <TrialContext.Provider
      value={{
        ...trialStatus,
        loading,
        error,
        checkTrialStatus,
        startTrial,
        registerPayment
      }}
    >
      {children}
    </TrialContext.Provider>
  );
};

export const useTrial = () => useContext(TrialContext);
