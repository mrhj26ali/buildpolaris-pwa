import { useEffect, useState } from 'react';
import { CloudOff } from 'lucide-react';

export function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="bg-red-100 border-b border-red-200 px-4 py-2 text-sm text-red-800 flex items-center gap-2">
      <CloudOff size={16} />
      <span>You are offline. Changes will sync when connection is restored.</span>
    </div>
  );
}
