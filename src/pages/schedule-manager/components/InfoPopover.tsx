import React, { useEffect, useRef, useState } from 'react';
import { InformationCircleIcon } from './icons';

interface InfoPopoverProps {
  anchorEl: HTMLElement;
  content: string;
}

const InfoPopover: React.FC<InfoPopoverProps> = ({ anchorEl, content }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: -9999, left: -9999 });

  useEffect(() => {
    if (!popoverRef.current || !anchorEl) return;

    const anchorRect = anchorEl.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const vpWidth = window.innerWidth;

    let top = anchorRect.bottom + 8;
    let left = anchorRect.left + (anchorRect.width / 2) - (popoverRect.width / 2);

    // Adjust position if it overflows the viewport
    if (left + popoverRect.width > vpWidth) {
      left = vpWidth - 16 - popoverRect.width;
    }
    if (left < 16) {
      left = 16;
    }

    setPosition({ top: top + window.scrollY, left: left + window.scrollX });
  }, [anchorEl]);

  return (
    <div
      ref={popoverRef}
      className="fixed z-[70] w-64 p-3 bg-charcoal-black text-white rounded-lg shadow-xl transition-opacity duration-200 opacity-0 animate-fade-in-popover"
      style={{ ...position }}
      role="tooltip"
    >
      <div className="flex items-start gap-2">
        <InformationCircleIcon className="h-5 w-5 text-lime-green flex-shrink-0 mt-0.5" />
        <p className="text-sm">{content}</p>
      </div>
      <style>{`
        @keyframes fade-in-popover {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-popover {
          animation: fade-in-popover 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default InfoPopover;
