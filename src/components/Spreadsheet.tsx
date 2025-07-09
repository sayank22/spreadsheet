import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useState } from 'react'
import {
  Search,
  Bell,
  EyeOff,
  Filter,
  SortAsc,
  Upload,
  Share2,
  LayoutGrid,
  RefreshCw,
  Plus,
  Download,
  ChevronsRight,
  MoreHorizontal,
  Link,
  GitFork,
} from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'
import { initialColumns, data as baseData } from './mockData'
import avatarImg from '../assets/1.jpg'

export default function Spreadsheet() {
  const [selectedCell, setSelectedCell] = useState<[number, string] | null>(null)

  const columns = initialColumns

  const filledData = [...baseData]
  for (let i = baseData.length + 1; i <= 24; i++) {
    filledData.push({
      id: i,
      jobRequest: '',
      submitted: '',
      status: '',
      submitter: '',
      url: '',
      assigned: '',
      priority: '',
      dueDate: '',
      estValue: '',
      actions: '',
    })
  }

  const table = useReactTable({
    data: filledData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'In-process': return 'bg-yellow-100 text-yellow-800'
      case 'Need to start': return 'bg-blue-100 text-blue-800'
      case 'Complete': return 'bg-green-100 text-green-800'
      case 'Blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 font-medium'
      case 'Medium': return 'text-yellow-700 font-medium'
      case 'Low': return 'text-blue-600 font-medium'
      default: return 'text-gray-600'
    }
  }

  const notify = (msg: string) => toast.success(msg)
  

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-sm text-gray-800 font-medium">
      <Toaster />
      
      {/* Top Nav */}
      <div className="flex justify-between items-center px-4 pt-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="17" height="15" rx="3" fill="#4D7C57" />
            <rect x="1" y="1" width="10" height="13" rx="2" fill="white" />
          </svg>
          <span>Workspace</span>
          <span>{'>'}</span>
          <span>Folder 2</span>
          <span>{'>'}</span>
          <span className="text-black font-semibold">Spreadsheet 3</span>
          <MoreHorizontal className="w-5 h-5 text-gray-600 cursor-pointer hover:text-black" onClick={() => notify('More options')} />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input type="text" placeholder="Search within sheet" className="border rounded px-3 py-1 text-sm" />
            <Search className="absolute right-2 top-1.5 w-4 h-4 text-gray-400" />
          </div>
          <div className="relative cursor-pointer" onClick={() => notify('Notifications')}>
            <Bell className="w-5 h-5 text-gray-500 hover:text-black" />
            <span className="absolute -top-1 -right-1 text-xs bg-green-500 text-white rounded-full px-1">2</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={avatarImg} alt="avatar" className="w-8 h-8 rounded-full" />
            <div>
              <span className="text-sm text-gray-800 font-medium">John Doe</span>
              <div className="text-xs text-gray-500">john.doe@email.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center h-[56px] px-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <button onClick={() => notify('Toolbar clicked')} className="flex items-center gap-1 text-gray-600 hover:text-black"><span>Tool bar</span><ChevronsRight className="w-4 h-4" /></button>
          <button onClick={() => notify('Hide fields')} className="flex items-center gap-1 text-gray-600 hover:text-black"><EyeOff className="w-4 h-4" /> Hide fields</button>
          <button onClick={() => notify('Sort')} className="flex items-center gap-1 text-gray-600 hover:text-black"><SortAsc className="w-4 h-4" /> Sort</button>
          <button onClick={() => notify('Filter')} className="flex items-center gap-1 text-gray-600 hover:text-black"><Filter className="w-4 h-4" /> Filter</button>
          <button onClick={() => notify('Cell view')} className="flex items-center gap-1 text-gray-600 hover:text-black"><LayoutGrid className="w-4 h-4" /> Cell view</button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => notify('Importing...')} className="flex items-center gap-1 text-sm px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"><Upload className="w-4 h-4" /> Import</button>
          <button onClick={() => notify('Exporting...')} className="flex items-center gap-1 text-sm px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"><Download className="w-4 h-4" /> Export</button>
          <button onClick={() => notify('Sharing...')} className="flex items-center gap-1 text-sm px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"><Share2 className="w-4 h-4" /> Share</button>
          <button onClick={() => notify('Creating new action')} className="flex items-center gap-1 text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-400 hover:text-blue-500"><GitFork className="w-4 h-4 rotate-180" /> New Action</button>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[1440px]">
          {/* Column Group Header */}
          <div className="grid grid-cols-[50px_393px_138px_132px_182px_152px_114px_75px_107px_97px] text-sm border-b border-gray-300">
            <div className="bg-white border" />
<div className="col-span-3 bg-gray-200 flex items-center px-2 py-2 font-semibold text-gray-700 border gap-2">
  <div className="bg-gray-100 px-3 py-1 flex items-center gap-2 rounded">
    <Link 
    className="w-4 h-4 text-blue-600" 
    onClick={() => toast.success('Link is opening')}
    />
    <span>Q3 Financial Overview</span>
  </div>
  <RefreshCw
    className="w-4 h-4 text-red-500 cursor-pointer"
    onClick={() => toast.success('Refreshed')}
  />
</div>

            <div className="bg-white border" />
            <div className="bg-green-200 flex items-center justify-center px-2 py-2 font-semibold text-gray-700 border hover:text-green-200 hover:bg-green-600"><GitFork className="w-5 h-5 text-gray-600 rotate-180 hover:text-red-800" /> ABC</div>
            <div className="col-span-2 bg-purple-200 flex items-center px-2 py-2 font-semibold text-gray-700 border hover:text-purple-200 hover:bg-purple-600"><GitFork className="w-5 h-5 text-gray-600 rotate-180 " /> Answer a question</div>
            <div className="bg-orange-200 flex items-center px-2 py-2 font-semibold text-gray-700 border hover:text-orange-200 hover:bg-orange-600"><GitFork className="w-5 h-5 text-gray-600 rotate-180" /> Extract</div>
            <div className="flex items-center justify-center px-2 py-2 bg-white border">
              <Plus className="w-4 h-4 text-gray-500 cursor-pointer hover:text-black" />
            </div>
          </div>

          {/* Table */}
          <table className="table-fixed border border-gray-300">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-t border-gray-300">
                  {headerGroup.headers.map((header) => {
                    const id = header.id
                    const bg = id === 'assigned' ? 'bg-green-100'
                      : ['priority', 'dueDate'].includes(id) ? 'bg-purple-100'
                      : id === 'estValue' ? 'bg-orange-100'
                      : ['jobRequest', 'submitted', 'status', 'submitter', 'url'].includes(id) ? 'bg-gray-100'
                      : 'bg-white'
                    return (
                      <th key={id} className={`text-left px-4 py-2 border-r border-gray-300 text-gray-600 font-semibold ${bg} ${
                        id === 'actions' ? 'w-[97px]' : ''
  }`}
>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                      
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 border-t border-gray-200">
                  {row.getVisibleCells().map((cell) => {
                    const columnId = cell.column.id
                    const value = cell.getValue() as string
                    const isSelected = selectedCell?.[0] === row.index && selectedCell?.[1] === columnId

                    if (columnId === 'status') {
                      return (
                        <td key={cell.id} className="px-4 py-2 border-r border-gray-200">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(value)}`}>{value}</span>
                        </td>
                      )
                    }

                    if (columnId === 'priority') {
                      return (
                        <td key={cell.id} className="px-4 py-2 border-r border-gray-200">
                          <span className={getPriorityClass(value)}>{value}</span>
                        </td>
                      )
                    }

                    if (columnId === 'url') {
                      return (
                        <td key={cell.id} className="px-4 py-2 border-r border-gray-200">
                          <a href={`https://${value}`} target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-800 truncate inline-block max-w-[150px]">{value}</a>
                        </td>
                      )
                    }

                    return (
                      <td
                        key={cell.id}
                        contentEditable={columnId !== 'id'}
                        suppressContentEditableWarning
                        spellCheck={false}
                        onFocus={() => setSelectedCell([row.index, columnId])}
                        onBlur={() => setSelectedCell(null)}
                        className={`px-4 py-[6px] border-r border-gray-200 ${isSelected ? 'ring-2 ring-blue-500 bg-white' : ''}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-300">
        <div className="flex items-center gap-6 px-4 py-2 text-sm">
          <button className="px-3 py-1 font-semibold text-green-800 border-b-4 border-green-700 bg-green-100 rounded-t hover:bg-green-700 hover:text-black">All Orders</button>
          <button 
          className="text-gray-600 hover:text-black">Pending</button>
          <button className="text-gray-600 hover:text-black">Reviewed</button>
          <button className="text-gray-600 hover:text-black">Arrived</button>
          <button className="text-gray-600 hover:text-black text-xl
          onClick={() => toast.success('New Page is Opening')}
          ">+</button>
        </div>
      </div>
    </div>
  )
}
