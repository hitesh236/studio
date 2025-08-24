
'use client';

import React, { useState, useEffect } from 'react';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { Download as DownloadIcon } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

export function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <DropdownMenuItem onClick={handleInstallClick} className="flex items-center gap-2 cursor-pointer">
      <DownloadIcon className="h-4 w-4 text-muted-foreground" />
      <span>Install App</span>
    </DropdownMenuItem>
  );
}
