import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

interface StoreProviderProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({
  children,
  loadingComponent = null,
}) => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={loadingComponent} persistor={persistor}>
        {children}
      </PersistGate>
    </ReduxProvider>
  );
}; 