import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useState } from 'react'
import { columns, data as baseData } from './mockData'
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

export default function Spreadsheet() {
  const [selectedCell, setSelectedCell] = useState<[number, string] | null>(null)

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

  

  return (
    <div className="w-[1440px] h-[1024px] flex flex-col overflow-hidden bg-[#F8FAFC] text-sm text-gray-800 font-medium">
      {/* Top Nav */}
      <div className="flex justify-between items-center px-4 pt-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
         <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="17" height="15" rx="3" fill="#4D7C57"/>
  <rect x="1" y="1" width="10" height="13" rx="2" fill="white"/>
</svg>
          <span>Workspace</span>
          <span>{'>'}</span>
          <span>Folder 2</span>
          <span>{'>'}</span>
          <span className="text-black font-semibold">Spreadsheet 3</span>
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input type="text" placeholder="Search within sheet" className="border rounded px-3 py-1 text-sm" />
            <Search className="absolute right-2 top-1.5 w-4 h-4 text-gray-400" />
          </div>
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute -top-1 -right-1 text-xs bg-green-500 text-white rounded-full px-1">2</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="https://i.pravatar.cc/32" alt="avatar" className="w-8 h-8 rounded-full" />
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
          <div className="flex items-center gap-1 text-gray-600">Tool bar<ChevronsRight className="w-4 h-4" /> </div>
          <div className="flex items-center gap-1 text-gray-600"><EyeOff className="w-4 h-4" /> Hide fields</div>
          <div className="flex items-center gap-1 text-gray-600"><SortAsc className="w-4 h-4" /> Sort</div>
          <div className="flex items-center gap-1 text-gray-600"><Filter className="w-4 h-4" /> Filter</div>
          <div className="flex items-center gap-1 text-gray-600"><LayoutGrid className="w-4 h-4" /> Cell view</div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-sm px-2 py-1 border border-gray-300 rounded"><Upload className="w-4 h-4" /> Import</button>
          <button className="flex items-center gap-1 text-sm px-2 py-1 border border-gray-300 rounded"><Download className="w-4 h-4" /> Export</button>
          <button className="flex items-center gap-1 text-sm px-2 py-1 border border-gray-300 rounded"><Share2 className="w-4 h-4" /> Share</button>
          <button className="flex items-center gap-1 text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"><GitFork  className="w-4 h-4 rotate-180" /> New Action</button>
        </div>
      </div>

<div className="flex-1 bg-white overflow-auto">
  <div className="min-w-[1440px]">
      {/* Column Group Header */}
      <div className="grid grid-cols-[50px_400px_144px_132px_182px_157px_117px_80px_107px_71px] text-sm border-b border-gray-300">
        <div className="bg-white border" />
        <div className="col-span-3 bg-gray-200 flex items-center justify-between px-2 py-2 font-semibold text-gray-700 border">
          <div className="bg-gray-100 px-3 py-1">
          <button className="text-blue-600">
  <Link className="w-4 h-4" />
  </button>
          <span> Q3 Financial Overview</span>
          </div>
          <RefreshCw className="absolute right-80 w-4 h-4 text-red-500" />
        </div>
        <div className="bg-white border" />
        <div className="bg-green-200 flex items-center justify-center px-2 py-2 font-semibold text-gray-700 border"><GitFork className="w-5 h-5 text-gray-600 rotate-180" /> ABC</div>
        <div className="col-span-2 bg-purple-200 flex items-center px-2 py-2 font-semibold text-gray-700 border"><GitFork className="w-5 h-5 text-gray-600 rotate-180" /> Answer a question</div>
        <div className="bg-orange-200 flex items-center px-2 py-2 font-semibold text-gray-700 border"><GitFork className="w-5 h-5 text-gray-600 rotate-180" /> Extract</div>
        <div className="flex items-center justify-center px-2 py-2 bg-white border">
          <Plus className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Table Section */}
  <table
    className="table-fixed border border-gray-300"
    style={{
      tableLayout: 'fixed',
    }}
  >
    <colgroup>
      <col style={{ width: '50px' }} />
      <col style={{ width: '360px' }} />
      <col style={{ width: '120px' }} />
      <col style={{ width: '130px' }} />
      <col style={{ width: '130px' }} />
      <col style={{ width: '165px' }} />
      <col style={{ width: '170px' }} />
      <col style={{ width: '90px' }} />
      <col style={{ width: '120px' }} />
      <col style={{ width: '110px' }} />
      <col style={{ width: '90px' }} />
    </colgroup>
  <thead>
  {table.getHeaderGroups().map((headerGroup) => (
    <tr key={headerGroup.id} className="border-t border-gray-300">
      {headerGroup.headers.map((header) => {
        let headerBg = 'bg-white'
        if (
          ['jobRequest', 'submitted', 'status', 'submitter', 'url'].includes(header.id)
        ) {
          headerBg = 'bg-gray-100'
        } else if (header.id === 'assigned') {
          headerBg = 'bg-green-100'
        } else if (['priority', 'dueDate'].includes(header.id)) {
          headerBg = 'bg-purple-100'
        } else if (header.id === 'estValue') {
          headerBg = 'bg-orange-100'
        }

        return (
          <th
            key={header.id}
            className={`text-left px-4 py-2 border-r border-gray-300 text-gray-600 font-semibold ${headerBg}`}
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
            const isSelected =
              selectedCell?.[0] === row.index &&
              selectedCell?.[1] === columnId

            if (columnId === 'status') {
              return (
                <td key={cell.id} className="px-4 py-2 border-r border-gray-200">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                      value
                    )}`}
                  >
                    {value}
                  </span>
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
                  <a
                    href={`https://${value}`}
                    className="text-blue-600 underline hover:text-blue-800 truncate inline-block max-w-[150px]"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {value}
                  </a>
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
                className={`px-4 py-[6px] border-r border-gray-200 ${
                  isSelected ? 'ring-2 ring-blue-500 bg-white' : ''
                }`}
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
          <button className="px-3 py-1 font-semibold text-green-800 border-b-4 border-green-700 bg-green-100 rounded-t">All Orders</button>
          <button className="text-gray-600 hover:text-black">Pending</button>
          <button className="text-gray-600 hover:text-black">Reviewed</button>
          <button className="text-gray-600 hover:text-black">Arrived</button>
          <button className="text-gray-600 hover:text-black text-xl">+</button>
        </div>
      </div>
    </div>
  )
}
