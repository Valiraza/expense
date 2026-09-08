import React from 'react';

interface FormFeedbackProps {
  message: string | null;
  type: 'success' | 'error';
}

export const FormFeedback = ({ message, type }: FormFeedbackProps) => {
  if (!message) return null;
  
  const styles = type === 'success' 
    ? 'bg-green-100 text-green-700 border-green-200' 
    : 'bg-red-100 text-red-700 border-red-200';

  return (
    <div className={`p-3 rounded-lg border text-sm mb-4 ${styles}`}>
      {message}
    </div>
  );
};
