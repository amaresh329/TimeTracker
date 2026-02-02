import { useState, useEffect } from "react";
import { TimeTracker } from "@/components/TimeTracker";
import { TimeEntriesList } from "@/components/TimeEntriesList";
import { TimeEntry } from "@/types/timeEntry";
import { Timer } from "lucide-react";

const Index = () => {
  const [entries, setEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem("timeEntries");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("timeEntries", JSON.stringify(entries));
  }, [entries]);

  const handleTimeEntryComplete = (entry: TimeEntry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  const handleClearEntries = () => {
    setEntries([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Timer className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">TimeTrack</h1>
              <p className="text-xs text-muted-foreground">
                Track your time, boost productivity
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Timer */}
          <div className="flex justify-center lg:sticky lg:top-24">
            <TimeTracker onTimeEntryComplete={handleTimeEntryComplete} />
          </div>

          {/* Right: Entries List */}
          <div>
            <TimeEntriesList
              entries={entries}
              onClearEntries={handleClearEntries}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
