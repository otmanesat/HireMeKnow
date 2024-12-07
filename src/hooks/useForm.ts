import { useState, useCallback } from 'react';

interface FormState {
  [key: string]: any;
}

interface ValidationRules {
  [key: string]: (value: any) => boolean;
}

export const useForm = <T extends FormState>(
  initialState: T,
  validationRules?: ValidationRules
) => {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (validationRules && validationRules[name as string]) {
      const isValid = validationRules[name as string](value);
      setErrors(prev => ({
        ...prev,
        [name]: isValid ? '' : `Invalid ${String(name)}`,
      }));
    }
  }, [validationRules]);

  const reset = useCallback(() => {
    setValues(initialState);
    setErrors({});
  }, [initialState]);

  return {
    values,
    errors,
    handleChange,
    reset,
  };
}; 