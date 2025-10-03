import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NewsPanelProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function NewsPanel({ collapsed, onToggle }: NewsPanelProps) {
  const drawerWidth = 400;
  return (
    <>
      {/* Drawer panel: only visible when not collapsed */}
      <aside
        className={
          `fixed top-0 right-0 h-full z-40 bg-white border transition-transform duration-300 ease-in-out flex flex-col p-0` +
          (collapsed ? ' translate-x-full' : ' translate-x-0')
        }
        style={{ width: drawerWidth, minWidth: drawerWidth, maxWidth: drawerWidth }}
        aria-hidden={collapsed}
      >
        {!collapsed && (
          <div className="flex flex-col p-6 gap-4 h-full w-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-black">News</h2>
              <button
                className="bg-card rounded-full shadow p-2 hover:bg-accent transition-colors"
                aria-label="Collapse news panel"
                onClick={onToggle}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col gap-4 h-full transition-all duration-300 ease-in-out">
              <section className="bg-card rounded-lg shadow p-4 flex-1 flex flex-col min-h-0">
                <h3 className="text-md font-bold mb-2">NFL News</h3>
                <div className="flex-1 overflow-auto">
                  {/* Placeholder for NFL news items */}
                  <p className="text-muted-foreground">
                    Latest NFL news will appear here.
                  </p>
                </div>
              </section>
              <section className="bg-card rounded-lg shadow p-4 flex-1 flex flex-col min-h-0">
                <h3 className="text-md font-bold mb-2">College News</h3>
                <div className="flex-1 overflow-auto">
                  {/* Placeholder for College news items */}
                  <p className="text-muted-foreground">
                    Latest college football news will appear here.
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}
      </aside>
      {/* Collapsed chevron button: always visible at right edge */}
      {collapsed && (
        <button
          className="fixed top-1/2 right-0 z-50 bg-gray-900 text-white rounded-l-full shadow-lg p-3 hover:bg-gray-800 transition-colors border border-gray-700"
          style={{ transform: 'translateY(-50%)' }}
          aria-label="Expand news panel"
          onClick={onToggle}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
    </>
  );
}
