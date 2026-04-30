"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface SelectedItem {
  label: string;
  sublabel?: string;
  color: string;
}

interface RouteMasterDetailProps {
  title: string;
  subtitle?: string;
  titleIcon: ReactNode;
  selectedItem: SelectedItem | null;
  onBack: () => void;
  listContent: ReactNode;
  detailContent: ReactNode;
}

export function RouteMasterDetail({
  title,
  subtitle,
  titleIcon,
  selectedItem,
  onBack,
  listContent,
  detailContent,
}: RouteMasterDetailProps) {
  if (selectedItem) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-border">
          <button
            onClick={onBack}
            className="flex items-center gap-3 w-full text-left group"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedItem.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {selectedItem.label}
              </p>
              {selectedItem.sublabel && (
                <p className="text-xs text-muted-foreground truncate">
                  {selectedItem.sublabel}
                </p>
              )}
            </div>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{detailContent}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          {titleIcon}
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {listContent}
    </div>
  );
}
