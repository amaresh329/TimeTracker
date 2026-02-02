import { useState, useEffect, useCallback } from "react";
import { Play, Square, Clock, User, FileSpreadsheet, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { TimeEntry } from "@/types/timeEntry";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

const TASKS = [
  "Processing",
  "Auditing",
  "Meeting",
  "Training",
  "Break",
  "Reports",
  "Idle",
  "Other Activities",
 
];

const TEAMS = [
  "Cobra",
  "Flex comp",
  "LOA",
  "Benefits",
  "Retirement",
  "Others",
];

const TEAM_SUBTASKS: Record<string, string[]> = {
  "Cobra": [
    "Email Rehire Process",
    "Audit",
    "Confirmation Statement",
    "Confirmation Statement Image to PC & Email",
    "DAR Term Mail Merge and Print",
    "Dual Enrollment",
    "Enrollment",
    "Image Payments to PC",
    "Ineligible Letter Generation",
    "Initial Election Notice Imaging and Emailing",
    "Open Enrollment",
    "Quarterly Exhaust Letters",
    "Refund Audit",
    "Address Change",
    "C Number Query",
  ],
  "Flex comp": [
    "Assigning Salesforce Cases",
    "Changes Report",
    "Daily Metric Report",
    "EDI Error Report",
    "EE - Repayment",
    "Linking Audit",
    "Linking Unassigned Document",
    "SOI Posi pay report",
    "POS Merchant Refund Process",
    "Credit Failure Process",
    "Direct Deposit information in Alegeus",
    "$1 HSA Election Report",
    "Claim with No Doc",
    "Flex Comp - HSA Pushout",
    "Mailer Labels",
    "HSA Client Contribution Reports",
    "Optum Suspense Return Process",
    "Debit Card Adjudication",
    "Debit Card Adjudication by Image Date",
    "Participant Claims Adjudication",
    "Claims by Image Date Process",
    "Creating Manual Claims by Adjudication",
    "Health Equity CB Exception file",
    "New to Pending in Alegeus",
  ],
  "LOA": [
    "Termination (Client)",
    "Termination (WSE)",
    "Fitness for Duty to Role Holder",
    "Verify Return to Work",
    "Case Scrubbing and Assignment",
    "Responding to the Hartford Short Term Disability",
    "Open Events Process",
    "Return to Work",
    "Leave Adjustment Process",
    "Manual Leave Accrual Process",
    "Cancelling Service Order Actions",
    "State Disability Forms - CA EDD",
    "State Disability Forms - NY",
  ],
  "Benefits": [
    "Consulting Team - BSS Reports process",
    "Consulting Team - Dependent Data Reports",
    "Services - BAC Emails to Salesforce Case",
    "Services - Canadian Open Events",
    "Services - Run Open Events Report and Sort (Daily Metric Report)",
    "Services - ImageNow Linking",
    "Services - ImageNow Linking Routing",
    "Services - Open Events Address Change/Transfer",
    "Services - Part Time and Regular Temporary Report",
    "Services - SO Rehires",
    "Services - Term'd Employees w/Active Benefits",
    "HR Services - Close Loop Process",
    "Insurance Services - Recon - TriNet Billing Email Validation",
    "Insurance Services - Recon EDI/Election Lookup",
    "Internal Audit - SOC Services Request",
    "Life & Disability - Aetna STD/LTD Denial Process",
    "7 Day Letter",
    "Services salesforce work distribution process(general Cue)",
    "Services salesforce work distribution process(30 Cues)",
    "Open Events Report(Brandon)",
    "Aduit team(BAT)",
  ],
  "Retirement": [
    "Email Case SCRUB in Salesforce",
    "Employer Sponsored Plan",
    "Passport - Prior Deferral Contribution Entry",
    "Pre-approval of WSE communication",
    "Simple IRA Catch-Up Process",
    "Passport - Loan Entry",
    "Qualtrics - Scheduling Survey Reminders",
    "MASS HIRD",
  ],
  "Others": [
    "Bio Break",
    "Lunch Break",
    "Dinner Break",
    "Meeting",
    "Report",
    "Idle",
    "Down Time",
  ],
};

interface TimeTrackerProps {
  onTimeEntryComplete: (entry: TimeEntry) => void;
}

export const TimeTracker = ({ onTimeEntryComplete }: TimeTrackerProps) => {
  const [userName, setUserName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [subTask, setSubTask] = useState("");
  const [assignedVolume, setAssignedVolume] = useState<number | "">("");
  const [processedVolume, setProcessedVolume] = useState<number | "">("");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [subTaskOpen, setSubTaskOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleStart = () => {
    if (!userName.trim() || !selectedTask) return;
    setIsRunning(true);
    setStartTime(new Date());
    setElapsedTime(0);
  };

  const handleStop = () => {
    if (!isRunning || !startTime) return;

    const endTime = new Date();
    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      userName: userName.trim(),
      teamName: selectedTeam || undefined,
      task: selectedTask,
      subTask: subTask.trim() || undefined,
      assignedVolume: assignedVolume === "" ? undefined : Number(assignedVolume),
      processedVolume: processedVolume === "" ? undefined : Number(processedVolume),
      remainingDeficit: assignedVolume !== "" && processedVolume !== "" 
        ? Number(assignedVolume) - Number(processedVolume)
        : undefined,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: elapsedTime,
      formattedDuration: formatTime(elapsedTime),
    };

    onTimeEntryComplete(entry);
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
  };

  const canStart = userName.trim() && selectedTask && !isRunning;
  const canStop = isRunning;

  return (
    <Card className="w-full max-w-lg shadow-[var(--shadow-card)] border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Clock className="w-5 h-5 text-primary" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="flex flex-col items-center py-8">
          <div
            className={cn(
              "timer-display text-6xl font-bold tracking-tight transition-colors duration-300",
              isRunning ? "text-accent" : "text-muted-foreground"
            )}
          >
            {formatTime(elapsedTime)}
          </div>
          {isRunning && (
            <div className="flex items-center gap-2 mt-3">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
              <span className="text-sm text-muted-foreground">Recording</span>
            </div>
          )}
        </div>

        {/* User Name Input */}
        <div className="space-y-2">
          <Label htmlFor="userName" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Your Name
          </Label>
          <Input
            id="userName"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isRunning}
            className="h-11"
          />
        </div>

        {/* Team Selection */}
        <div className="space-y-2">
          <Label htmlFor="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Select Team
          </Label>
          <Select
            value={selectedTeam}
            onValueChange={(value) => {
              setSelectedTeam(value);
              setSubTask(""); // Clear subtask when team changes
              setSubTaskOpen(false); // Close subtask dropdown
            }}
            disabled={isRunning}
          >
            <SelectTrigger className="h-11 bg-card">
              <SelectValue placeholder="Choose a team" />
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-lg z-50">
              {TEAMS.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Task Selection */}
        <div className="space-y-2">
          <Label htmlFor="task" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Select Task
          </Label>
          <Select
            value={selectedTask}
            onValueChange={setSelectedTask}
            disabled={isRunning}
          >
            <SelectTrigger className="h-11 bg-card">
              <SelectValue placeholder="Choose a task" />
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-lg z-50">
              {TASKS.map((task) => (
                <SelectItem key={task} value={task}>
                  {task}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub Task Input/Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="subTask" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Sub Task
          </Label>
          {selectedTeam ? (
            <Popover open={subTaskOpen} onOpenChange={setSubTaskOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={subTaskOpen}
                  className="w-full justify-between h-11 bg-card"
                  disabled={isRunning}
                >
                  {subTask || "Choose a sub task..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search subtasks..." />
                  <CommandList>
                    <CommandEmpty>No subtask found.</CommandEmpty>
                    <CommandGroup>
                      {TEAM_SUBTASKS[selectedTeam]?.map((item) => (
                        <CommandItem
                          key={item}
                          value={item}
                          onSelect={(value) => {
                            setSubTask(value === subTask ? "" : value);
                            setSubTaskOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              subTask === item ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {item}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <Input
              id="subTask"
              placeholder="Select a team first"
              value={subTask}
              onChange={(e) => setSubTask(e.target.value)}
              disabled
              className="h-11"
            />
          )}
        </div>

        {/* Volume Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assignedVolume">Assigned Volume</Label>
            <Input
              id="assignedVolume"
              type="number"
              placeholder="0"
              value={assignedVolume}
              onChange={(e) => {
                const value = Number(e.target.value);
                setAssignedVolume(e.target.value === "" ? "" : (value >= 0 ? value : assignedVolume));
              }}
              disabled={isRunning}
              className="h-11"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processedVolume">Processed Volume</Label>
            <Input
              id="processedVolume"
              type="number"
              placeholder="0"
              value={processedVolume}
              onChange={(e) => {
                const value = Number(e.target.value);
                setProcessedVolume(e.target.value === "" ? "" : (value >= 0 ? value : processedVolume));
              }}
              disabled={isRunning}
              className="h-11"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remainingDeficit">Remaining/Deficit</Label>
            <Input
              id="remainingDeficit"
              type="number"
              placeholder="0"
              value={
                assignedVolume !== "" && processedVolume !== ""
                  ? Number(assignedVolume) - Number(processedVolume)
                  : ""
              }
              disabled
              className="h-11 bg-muted"
            />
          </div>
        </div>

   

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleStart}
            disabled={!canStart}
            className="flex-1 h-12 text-base font-medium shadow-[var(--shadow-button)] hover:shadow-lg transition-all"
          >
            <Play className="w-5 h-5 mr-2" />
            Start
          </Button>
          <Button
            onClick={handleStop}
            disabled={!canStop}
            variant="destructive"
            className="flex-1 h-12 text-base font-medium transition-all"
          >
            <Square className="w-5 h-5 mr-2" />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
