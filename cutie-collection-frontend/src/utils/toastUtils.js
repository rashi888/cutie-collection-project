import { toast } from "react-toastify";

const getErrorMessage = (
  error,
  fallbackMessage = "Something went wrong"
) => {
  if (typeof error === "string") {
    return error;
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
};

export const showSuccess = (message) => {
  toast.success(`🌸 ${message}`);
};

export const showError = (
  error,
  fallbackMessage = "Something went wrong"
) => {
  const message = getErrorMessage(
    error,
    fallbackMessage
  );

  toast.error(`💔 ${message}`);
};

export const showWarning = (message) => {
  toast.warning(`✨ ${message}`);
};

export const showInfo = (message) => {
  toast.info(`ℹ️ ${message}`);
};