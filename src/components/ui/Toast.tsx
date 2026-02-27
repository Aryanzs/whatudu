import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToastStore } from "../../stores/toastStore";
import type { Toast } from "../../stores/toastStore";

const ICONS: Record<Toast["type"], React.ReactNode> = {
  success: <CheckCircle size={16} />,
  error: <AlertCircle size={16} />,
  info: <Info size={16} />,
};

const ToastItem = ({ toast }: { toast: Toast }) => {
  const { dismissToast } = useToastStore();

  return (
    <div className={`toast-item toast-${toast.type}`}>
      <span className="toast-icon">{ICONS[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
      <div className="toast-controls">
        {toast.action && (
          <button
            className="toast-action-btn"
            onClick={() => {
              toast.action!.onClick();
              dismissToast(toast.id);
            }}
          >
            {toast.action.label}
          </button>
        )}
        <button
          className="toast-close-btn"
          onClick={() => dismissToast(toast.id)}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts } = useToastStore();
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
};
