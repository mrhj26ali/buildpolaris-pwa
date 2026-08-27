import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createProject, listHolidayLists, createHolidayList } from '../model/projectsApi'
import { Plus, Trash2, Calendar } from 'lucide-react'

interface CreateProjectDialogProps { onCreated: () => void }

export function CreateProjectDialog({ onCreated }: CreateProjectDialogProps) {
    const [open, setOpen] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [refCode, setRefCode] = useState('')
    const [clientName, setClientName] = useState('')
    const [description, setDescription] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [budget, setBudget] = useState('')
    const [currency, setCurrency] = useState('USD')
    const [initialTasksText, setInitialTasksText] = useState('')
    const [holidayList, setHolidayList] = useState('')
    const [holidayLists, setHolidayLists] = useState<{ name: string; holiday_list_name: string }[]>([])
    
    // Calendar Creation State
    const [calOpen, setCalOpen] = useState(false)
    const [calName, setCalName] = useState('')
    const [calDates, setCalDates] = useState([{ date: '', description: 'Holiday' }])
    const [weeklyOff, setWeeklyOff] = useState('Sunday')
    const WEEKLY_OFFS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            listHolidayLists().then(setHolidayLists).catch(console.error)
        }
    }, [open])

    async function handleCreateCalendar() {
        if (!calName.trim()) return
        const validDates = calDates.filter(d => d.date)
        if (validDates.length === 0) return

        try {
            const newList = await createHolidayList({ 
                list_name: calName, 
                holidays: validDates,
                weekly_off: weeklyOff // <-- ADD THIS
            })
            // Refresh the list and auto-select the new one
            const updatedLists = await listHolidayLists()
            setHolidayLists(updatedLists)
            setHolidayList(newList.name)
            setCalOpen(false)
            setCalName('')
            setCalDates([{ date: '', description: 'Holiday' }])
            setWeeklyOff('Sunday') // Reset
        } catch (err: any) {
            console.error(err)
        }
    }

    async function handleCreate() {
        if (!projectName.trim() || !refCode.trim() || !clientName.trim()) {
            setError('Project Name, Reference Code, and Client are required.')
            return
        }
        setSubmitting(true)
        setError(null)

        let initialTasks: Array<{ subject: string; duration: number }> | undefined = undefined
        if (initialTasksText.trim()) {
            initialTasks = initialTasksText.split('\n').map(line => line.trim()).filter(line => line.length > 0).map(line => {
                const parts = line.split(',')
                return { subject: parts[0].trim(), duration: parseInt(parts[1]?.trim() || '1', 10) }
            })
        }

        try {
            await createProject({
                project_name: projectName.trim(),
                reference_code: refCode.trim(),
                client_name: clientName.trim(),
                description: description || undefined,
                expected_start_date: startDate || undefined,
                expected_end_date: endDate || undefined,
                budget_amount: budget ? parseFloat(budget) : 0,
                currency,
                initial_tasks: initialTasks,
                holiday_list: holidayList || undefined,
            })
            setOpen(false)
            // Reset form
            setProjectName(''); setRefCode(''); setClientName(''); setDescription('')
            setStartDate(''); setEndDate(''); setBudget(''); setCurrency('USD'); setInitialTasksText('')
            setHolidayList('')
            onCreated()
        } catch (err: any) {
            setError(err?.message || 'Failed to create project.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="min-h-11 gap-1.5"><Plus className="h-4 w-4" aria-hidden="true" /> New Project</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Project Name *</Label>
                            <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Reference Code *</Label>
                            <Input value={refCode} onChange={(e) => setRefCode(e.target.value)} placeholder="e.g. PRJ-2026-001" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Client / Owner *</Label>
                        <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Target Start Date</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Target End Date</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Approved Budget</Label>
                            <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Currency</Label>
                            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" />
                        </div>
                    </div>
                    
                    {/* HOLIDAY CALENDAR SECTION */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Holiday Calendar</Label>
                        <div className="flex gap-2">
                            <Select value={holidayList} onValueChange={setHolidayList}>
                                <SelectTrigger className="flex-1"><SelectValue placeholder="Select or create a calendar" /></SelectTrigger>
                                <SelectContent>
                                    {holidayLists.map(hl => (
                                        <SelectItem key={hl.name} value={hl.name}>{hl.holiday_list_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" variant="outline" className="min-h-9 gap-1.5" onClick={() => setCalOpen(true)}>
                                <Calendar className="h-4 w-4" /> New
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Defines non-working days for the CPM schedule.</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Initial WBS Tasks (Optional)</Label>
                        <Textarea value={initialTasksText} onChange={(e) => setInitialTasksText(e.target.value)} placeholder="e.g.,&#10;Mobilization, 5&#10;Site Preparation, 10" rows={4} />
                    </div>
                    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                    <Button onClick={() => void handleCreate()} disabled={submitting} className="min-h-11">
                        {submitting ? 'Creating…' : 'Create Project'}
                    </Button>
                </DialogFooter>

                {/* INLINE CALENDAR CREATION DIALOG */}
                <Dialog open={calOpen} onOpenChange={setCalOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create Holiday Calendar</DialogTitle></DialogHeader>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label>Calendar Name</Label>
                                <Input value={calName} onChange={(e) => setCalName(e.target.value)} placeholder="e.g. US Federal 2026" />
                            </div>
                            
                            {/* ADD THIS: Weekly Off Day Selector */}
                            <div className="flex flex-col gap-1.5">
                                <Label>Weekly Off Day</Label>
                                <Select value={weeklyOff} onValueChange={setWeeklyOff}>
                                    <SelectTrigger className="min-h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {WEEKLY_OFFS.map((day) => (
                                            <SelectItem key={day} value={day}>{day}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">The CPM engine will automatically skip this day of the week.</p>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <Label>Holidays</Label>
                                {calDates.map((row, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <Input type="date" className="flex-1" value={row.date} onChange={(e) => {
                                            const next = [...calDates]; next[i].date = e.target.value; setCalDates(next)
                                        }} />
                                        <Input placeholder="Description" className="flex-1" value={row.description} onChange={(e) => {
                                            const next = [...calDates]; next[i].description = e.target.value; setCalDates(next)
                                        }} />
                                        <Button variant="ghost" size="icon" onClick={() => setCalDates(calDates.filter((_, idx) => idx !== i))}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => setCalDates([...calDates, { date: '', description: 'Holiday' }])}>
                                    <Plus className="h-3 w-3 mr-1" /> Add Date
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCalOpen(false)}>Cancel</Button>
                            <Button onClick={() => void handleCreateCalendar()} disabled={!calName || !calDates.some(d => d.date)}>
                                Create & Select
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    )
}