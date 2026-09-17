import { useState, useCallback } from 'react';
import type { ZodError } from 'zod';

type FormValues = Record<string, string>;
type FormErrors = Record<string, string>;

export function useForm(initial: FormValues) {
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = useCallback(
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setValues((v) => ({ ...v, [field]: e.target.value }));
        setErrors((err) => ({ ...err, [field]: '' }));
      },
    []
  );

  const setValue = useCallback((field: string, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((err) => ({ ...err, [field]: '' }));
  }, []);

  const validate = useCallback((zodError: ZodError) => {
    const map: FormErrors = {};
    for (const issue of zodError.issues) {
      const key = issue.path[0]?.toString();
      if (key && !map[key]) map[key] = issue.message;
    }
    setErrors(map);
  }, []);

  const reset = useCallback(() => {
    setValues(initial);
    setErrors({});
  }, [initial]);

  return { values, errors, handleChange, setValue, validate, reset, setErrors };
}
