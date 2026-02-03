import { useState, useEffect, useCallback } from "react";
import { Play, Square, Clock, User, FileSpreadsheet, Users, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  "COBRA",
  "FSA",
  "LOA",
  "Benefits",
  "Retirement",
  "Others",
];

const TEAM_SUBTASKS: Record<string, string[]> = {
  "COBRA": [
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
  "FSA": [
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
  const [isAddingNewSubTask, setIsAddingNewSubTask] = useState(false);
  const [newSubTaskInput, setNewSubTaskInput] = useState("");
  const [teamSubTasks, setTeamSubTasks] = useState<Record<string, string[]>>(TEAM_SUBTASKS);
  const [userAddedSubTasks, setUserAddedSubTasks] = useState<Record<string, string[]>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [subTaskToDelete, setSubTaskToDelete] = useState<string | null>(null);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [tempProcessedVolume, setTempProcessedVolume] = useState<number | "">("");
  const [teams, setTeams] = useState<string[]>(TEAMS);
  const [teamOpen, setTeamOpen] = useState(false);
  const [isAddingNewTeam, setIsAddingNewTeam] = useState(false);
  const [newTeamInput, setNewTeamInput] = useState("");
  const [addTeamConfirmOpen, setAddTeamConfirmOpen] = useState(false);

useEffect(() => {
  let interval: NodeJS.Timeout | null = null;

  if (isRunning && startTime) {
    interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
      
      // Update saved timer state periodically
      const timerData = {
        isRunning: true,
        startTime: startTime.toISOString(),
        userName: userName.trim(),
        selectedTeam,
        selectedTask,
        subTask,
        assignedVolume: assignedVolume === "" ? null : assignedVolume,
        processedVolume: processedVolume === "" ? null : processedVolume,
      };
      localStorage.setItem("activeTimer", JSON.stringify(timerData));
    }, 1000);
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [isRunning, startTime, userName, selectedTeam, selectedTask, subTask, assignedVolume, processedVolume]);

useEffect(() => {
  const savedTimer = localStorage.getItem("activeTimer");
  if (savedTimer) {
    try {
      const timerData = JSON.parse(savedTimer);
      const savedStartTime = new Date(timerData.startTime);
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - savedStartTime.getTime()) / 1000);
      
      // Only restore if the timer was running and elapsed time is valid
      if (timerData.isRunning && elapsed >= 0) {
        setIsRunning(true);
        setStartTime(savedStartTime);
        setElapsedTime(elapsed);
        
        // Restore form data
        if (timerData.userName) setUserName(timerData.userName);
        if (timerData.selectedTeam) setSelectedTeam(timerData.selectedTeam);
        if (timerData.selectedTask) setSelectedTask(timerData.selectedTask);
        if (timerData.subTask) setSubTask(timerData.subTask);
        if (timerData.assignedVolume !== undefined) setAssignedVolume(timerData.assignedVolume);
        if (timerData.processedVolume !== undefined) setProcessedVolume(timerData.processedVolume);
      } else {
        // Clear invalid timer data
        localStorage.removeItem("activeTimer");
      }
    } catch (error) {
      console.error("Error loading saved timer:", error);
      localStorage.removeItem("activeTimer");
    }
  }
}, []); // Run only on mount



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
    const now = new Date();
    setIsRunning(true);
    setStartTime(now);
    setElapsedTime(0);
    
    // Save timer state to localStorage
    const timerData = {
      isRunning: true,
      startTime: now.toISOString(),
      userName: userName.trim(),
      selectedTeam,
      selectedTask,
      subTask,
      assignedVolume: assignedVolume === "" ? null : assignedVolume,
      processedVolume: processedVolume === "" ? null : processedVolume,
    };
    localStorage.setItem("activeTimer", JSON.stringify(timerData));
  };
  
  const handleStop = () => {
    if (!isRunning || !startTime) return;
    
    // Store current processed volume in temp state
    setTempProcessedVolume(processedVolume);
    // Open dialog to enter processed volume
    setStopDialogOpen(true);
  };



  const handleConfirmStop = () => {
    if (!startTime) return;

    const endTime = new Date();
    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      userName: userName.trim(),
      teamName: selectedTeam || undefined,
      task: selectedTask,
      subTask: subTask.trim() || undefined,
      assignedVolume: assignedVolume === "" ? undefined : Number(assignedVolume),
      processedVolume: tempProcessedVolume === "" ? undefined : Number(tempProcessedVolume),
      remainingDeficit: assignedVolume !== "" && tempProcessedVolume !== "" 
        ? Number(assignedVolume) - Number(tempProcessedVolume)
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
    setProcessedVolume(tempProcessedVolume); // Update the actual processed volume
    setStopDialogOpen(false);
    setTempProcessedVolume("");
    
    // Clear saved timer state
    localStorage.removeItem("activeTimer");
  };

  const handleCancelStop = () => {
    setStopDialogOpen(false);
    setTempProcessedVolume("");
  };
  const canStart = userName.trim() && selectedTask && !isRunning;
  const canStop = isRunning;

  const handleAddNewSubTask = () => {
    if (newSubTaskInput.trim() && selectedTeam) {
      const trimmedInput = newSubTaskInput.trim();
      setTeamSubTasks(prev => ({
        ...prev,
        [selectedTeam]: [...(prev[selectedTeam] || []), trimmedInput]
      }));
      setUserAddedSubTasks(prev => ({
        ...prev,
        [selectedTeam]: [...(prev[selectedTeam] || []), trimmedInput]
      }));
      setSubTask(trimmedInput);
      setNewSubTaskInput("");
      setIsAddingNewSubTask(false);
      setSubTaskOpen(false);
    }
  };

  const handleSubTaskSelect = (value: string) => {
    if (value === "__add_new__") {
      setIsAddingNewSubTask(true);
      setSubTaskOpen(false);
    } else {
      setSubTask(value === subTask ? "" : value);
      setSubTaskOpen(false);
    }
  };

  const handleDeleteSubTask = (subTaskToDelete: string) => {
    if (selectedTeam) {
      setTeamSubTasks(prev => ({
        ...prev,
        [selectedTeam]: prev[selectedTeam]?.filter(item => item !== subTaskToDelete) || []
      }));
      // Also remove from user-added if it was user-added
      setUserAddedSubTasks(prev => ({
        ...prev,
        [selectedTeam]: prev[selectedTeam]?.filter(item => item !== subTaskToDelete) || []
      }));
      if (subTask === subTaskToDelete) {
        setSubTask("");
      }
    }
  };


  const handleConfirmDelete = () => {
    if (subTaskToDelete) {
      handleDeleteSubTask(subTaskToDelete);
      setDeleteConfirmOpen(false);
      setSubTaskToDelete(null);
    }
  };

  const handleTeamSelect = (value: string) => {
    if (value === "__add_new_team__") {
      setIsAddingNewTeam(true);
      setTeamOpen(false);
    } else {
      setSelectedTeam(value);
      setSubTask(""); // Clear subtask when team changes
      setSubTaskOpen(false); // Close subtask dropdown
      setIsAddingNewSubTask(false); // Reset add new state
      setNewSubTaskInput(""); // Clear input
      setTeamOpen(false);
    }
  };

  const handleAddNewTeam = () => {
    if (newTeamInput.trim()) {
      setAddTeamConfirmOpen(true);
    }
  };

  const handleConfirmAddTeam = () => {
    if (newTeamInput.trim()) {
      const trimmedInput = newTeamInput.trim();
      setTeams(prev => [...prev, trimmedInput]);
      setTeamSubTasks(prev => ({
        ...prev,
        [trimmedInput]: []
      }));
      setSelectedTeam(trimmedInput);
      setNewTeamInput("");
      setIsAddingNewTeam(false);
      setAddTeamConfirmOpen(false);
      setSubTask(""); // Clear subtask
    }
  };

  const handleCancelAddTeam = () => {
    setAddTeamConfirmOpen(false);
    setIsAddingNewTeam(false);
    setNewTeamInput("");
    setTeamOpen(true);
  };

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

        {/* Team Selection */}
        <div className="space-y-2">
          <Label htmlFor="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Select Team
          </Label>
          {isAddingNewTeam ? (
            <div className="space-y-2">
              <Input
                placeholder="Enter new team name"
                value={newTeamInput}
                onChange={(e) => setNewTeamInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddNewTeam();
                  } else if (e.key === "Escape") {
                    setIsAddingNewTeam(false);
                    setNewTeamInput("");
                    setTeamOpen(true);
                  }
                }}
                autoFocus
                className="h-11"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddNewTeam}
                  disabled={!newTeamInput.trim()}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingNewTeam(false);
                    setNewTeamInput("");
                    setTeamOpen(true);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Popover open={teamOpen} onOpenChange={setTeamOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={teamOpen}
                  className="w-full justify-between h-11 bg-card"
                  disabled={isRunning}
                >
                  {selectedTeam || "Choose a team..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search teams..." />
                  <CommandList>
                    <CommandEmpty>No team found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="__add_new_team__"
                        onSelect={handleTeamSelect}
                        className="border-b mb-2 pb-2"
                      >
                        <span className="text-blue-600 dark:text-blue-400 font-medium">+ Add new team</span>
                      </CommandItem>
                      {teams.map((team) => (
                        <CommandItem
                          key={team}
                          value={team}
                          onSelect={handleTeamSelect}
                          className="flex items-center"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTeam === team ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {team}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      

        {/* Sub Task Input/Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="subTask" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Sub Task
          </Label>
          {selectedTeam ? (
            isAddingNewSubTask ? (
              <div className="space-y-2">
                <Input
                  placeholder="Enter new sub-task name"
                  value={newSubTaskInput}
                  onChange={(e) => setNewSubTaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddNewSubTask();
                    } else if (e.key === "Escape") {
                      setIsAddingNewSubTask(false);
                      setNewSubTaskInput("");
                      setSubTaskOpen(true);
                    }
                  }}
                  autoFocus
                  className="h-11"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddNewSubTask}
                    disabled={!newSubTaskInput.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingNewSubTask(false);
                      setNewSubTaskInput("");
                      setSubTaskOpen(true);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Popover open={subTaskOpen} onOpenChange={setSubTaskOpen}>
                <PopoverTrigger asChild>
                  {/* <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={subTaskOpen}
                    className="w-full justify-between h-11 bg-card"
                    disabled={isRunning}
                  >
                    {subTask || "Choose a sub task..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button> */}

<Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={subTaskOpen}
                    className="w-full justify-between h-11 bg-card"
                    disabled={isRunning}
                  >
                    {subTask ? `${selectedTeam} - ${subTask}` : "Choose a sub task..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search subtasks..." />
                    <CommandList>
                      <CommandEmpty>No subtask found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="__add_new__"
                          onSelect={handleSubTaskSelect}
                          className="border-b mb-2 pb-2"
                        >
                          <span className="text-blue-600 dark:text-blue-400 font-medium">+ Add new sub-task</span>
                        </CommandItem>
                        {/* {teamSubTasks[selectedTeam]?.map((item) => (
                          <CommandItem
                            key={item}
                            value={item}
                            onSelect={handleSubTaskSelect}
                            className="flex items-center justify-between group"
                          >
                            <div className="flex items-center">
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  subTask === item ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {item}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSubTaskToDelete(item);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </CommandItem>
                        ))} */}
                                              {teamSubTasks[selectedTeam]?.map((item) => (
                          <CommandItem
                            key={item}
                            value={item}
                            onSelect={handleSubTaskSelect}
                            className="flex items-center justify-between group"
                          >
                            <div className="flex items-center">
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  subTask === item ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {`${selectedTeam} - ${item}`}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSubTaskToDelete(item);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </CommandItem>
                        ))}  
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )
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

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sub-task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{subTaskToDelete}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirmOpen(false);
              setSubTaskToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Processed Volume</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the processed volume before completing this time entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="dialogProcessedVolume">Processed Volume</Label>
            <Input
              id="dialogProcessedVolume"
              type="number"
              placeholder="0"
              value={tempProcessedVolume}
              onChange={(e) => {
                const value = Number(e.target.value);
                setTempProcessedVolume(e.target.value === "" ? "" : (value >= 0 ? value : tempProcessedVolume));
              }}
              className="h-11 mt-2"
              min="0"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirmStop();
                } else if (e.key === "Escape") {
                  handleCancelStop();
                }
              }}
            />
            {assignedVolume !== "" && tempProcessedVolume !== "" && (
              <div className="mt-2 text-sm text-muted-foreground">
                Remaining/Deficit: {Number(assignedVolume) - Number(tempProcessedVolume)}
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelStop}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStop}>
              Complete Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={addTeamConfirmOpen} onOpenChange={setAddTeamConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are You Sure You want to add this team "{newTeamInput}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAddTeam}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAddTeam}>
              Add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Card>
  );
};
