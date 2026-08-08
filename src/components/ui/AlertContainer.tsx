'use client';

import { ReactNode, createContext, useContext, useState, useCallback } from 'react';
import Alert from '@/components/ui/Alert';

export interface AlertMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
  duration?: number;
}

interface AlertContextType {
  alerts: AlertMessage[];
  addAlert: (alert: Omit<AlertMessage, 'id'>) => string;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const addAlert = useCallback(
    (alert: Omit<AlertMessage, 'id'>) => {
      const id = `alert-${Date.now()}-${Math.random()}`;
      setAlerts((prev) => [...prev, { ...alert, id }]);
      return id;
    },
    []
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearAlerts }}>
      {children}
      {alerts.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[999999]">
          <div className="fixed top-0 right-0 pointer-events-none w-full h-full">
            {alerts.map((alert, index) => (
              <Alert
                key={alert.id}
                type={alert.type}
                message={alert.message}
                duration={alert.duration}
                index={index}
                onClose={() => removeAlert(alert.id)}
              />
            ))}
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}
