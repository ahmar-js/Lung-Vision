import { Alert, AlertDescription } from "@/components/ui/alert";
import type { MessageState } from "@/types/auth";

interface MessageAlertProps {
  message: MessageState;
  onClose?: () => void;
}

export function MessageAlert({ message, onClose }: MessageAlertProps) {
  return (
    <Alert 
      className={`${
        message.type === "success" 
          ? "border-green-200 bg-green-50 text-green-800" 
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <AlertDescription className="text-sm font-medium flex items-center justify-between">
        <span>{message.text}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-current opacity-70 hover:opacity-100"
            aria-label="Close message"
          >
            ×
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
} 