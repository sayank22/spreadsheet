// data/mockData.ts

import {
  ClipboardList,
  CalendarDays,
  CheckCircle,
  User,
  Link as LinkIcon,
  Users,
} from 'lucide-react'

export const initialColumns = [
  {
    accessorKey: 'id',
    header: '#',
  },
  {
    accessorKey: 'jobRequest',
    header: () => (
      <div className="flex items-center gap-1 text-gray-600">
        <ClipboardList className="w-4 h-4" /> Job Request
      </div>
    ),
  },
  {
    accessorKey: 'submitted',
    header: () => (
      <div className="flex items-center gap-1 text-gray-600">
        <CalendarDays className="w-4 h-4" /> Submitted
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: () => (
      <div className="flex items-center gap-1 text-gray-600">
        <CheckCircle className="w-4 h-4" /> Status
      </div>
    ),
  },
  {
    accessorKey: 'submitter',
    header: () => (
      <div className="flex items-center gap-1 text-gray-600">
        <User className="w-4 h-4" /> Submitter
      </div>
    ),
  },
  {
    accessorKey: 'url',
    header: () => (
      <div className="flex items-center gap-1 text-gray-600">
        <LinkIcon className="w-4 h-4" /> URL
      </div>
    ),
  },
  {
    accessorKey: 'assigned',
    header: () => (
      <div className="flex items-center gap-1 text-gray-600">
        <Users className="w-4 h-4" /> Assigned
      </div>
    ),
  },
  {
    accessorKey: 'priority',
    header: () => (
      <div className="flex items-center gap-1 text-gray-600">Priority</div>
    ),
  },
  {
    accessorKey: 'dueDate',
    header: () => (
      <div className="flex items-center gap-1 text-gray-600">Due Date</div>
    ),
  },
  {
    accessorKey: 'estValue',
    header: () => (
      <div className="flex items-center gap-1 text-gray-600">Est. Value</div>
    ),
  },
  {
  accessorKey: 'actions',
  header: () => (
    <div className="flex items-center gap-1 text-gray-600">
    </div>
  ),
},

]

export const data = [
  {
    id: 1,
    jobRequest: 'Launch social media campaign for product',
    submitted: '15-11-2024',
    status: 'In-process',
    submitter: 'Aisha Patel',
    url: 'www.aishapatel.com',
    assigned: 'Sophie Choudhury',
    priority: 'Medium',
    dueDate: '20-11-2024',
    estValue: '6,200,000 ₹',
    actions: '',
  },
  {
    id: 2,
    jobRequest: 'Update press kit for company redesign',
    submitted: '28-10-2024',
    status: 'Need to start',
    submitter: 'Irfan Khan',
    url: 'www.irfankhanpress.com',
    assigned: 'Tejas Pandey',
    priority: 'High',
    dueDate: '30-10-2024',
    estValue: '3,500,000 ₹',
    actions: '',
  },
  {
    id: 3,
    jobRequest: 'Finalize user testing feedback for app',
    submitted: '05-12-2024',
    status: 'In-process',
    submitter: 'Mark Johnson',
    url: 'www.markjohnson.dev',
    assigned: 'Rachel Lee',
    priority: 'Medium',
    dueDate: '10-12-2024',
    estValue: '4,750,000 ₹',
    actions: '',
  },
  {
    id: 4,
    jobRequest: 'Design new features for the website',
    submitted: '10-01-2025',
    status: 'Complete',
    submitter: 'Emily Green',
    url: 'www.emilygreen.me',
    assigned: 'Tom Wright',
    priority: 'Low',
    dueDate: '15-01-2025',
    estValue: '5,900,000 ₹',
    actions: '',
  },
  {
    id: 5,
    jobRequest: 'Prepare financial report for Q4',
    submitted: '25-01-2025',
    status: 'Blocked',
    submitter: 'Jessica Brown',
    url: 'www.jessicabrown.biz',
    assigned: 'Kevin Smith',
    priority: 'Low',
    dueDate: '30-01-2025',
    estValue: '2,800,000 ₹',
    actions: '',
  },
]
