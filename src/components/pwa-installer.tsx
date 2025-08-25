
'use client';

import React, { useState, useEffect } from 'react';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { Download as DownloadIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

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

  const canInstall = !!installPrompt;

  return (
    <Tooltip>
        <TooltipTrigger asChild>
            <div className="relative w-full"> {/* Wrapper div for tooltip to work on disabled items */}
                <DropdownMenuItem onClick={handleInstallClick} disabled={!canInstall} className="flex items-center gap-2 cursor-pointer">
                    <DownloadIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Install App</span>
                </DropdownMenuItem>
            </div>
        </TooltipTrigger>
        {!canInstall && (
            <TooltipContent>
                <p>Installation not available on this browser or app is already installed.</p>
            </TooltipContent>
        )}
    </Tooltip>
  );
}
