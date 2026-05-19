import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Lead {
  _id: string
  name: string
  email: string
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost'
  source: 'Website' | 'Instagram' | 'Referral'
  createdAt: string
}

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Contacted: 'bg-yellow-100 text-yellow-800',
  Qualified: 'bg-green-100 text-green-800',
  Lost: 'bg-red-100 text-red-800',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [source, setSource] = useState('')
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editLead, setEditLead] = useState<Lead | null>(null)
  const [form, setForm] = useState({ name: '', email: '', status: 'New', source: 'Website' })

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/leads', {
        params: { search, status, source, sort, page, limit: 10 }
      })
      setLeads(res.data.data)
      setTotalPages(res.data.pagination.pages)
    } catch {
      console.error('Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }, [search, status, source, sort, page])

  useEffect(() => {
    const timer = setTimeout(fetchLeads, 400)
    return () => clearTimeout(timer)
  }, [fetchLeads])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editLead) {
        await api.put(`/leads/${editLead._id}`, form)
      } else {
        await api.post('/leads', form)
      }
      setShowForm(false)
      setEditLead(null)
      setForm({ name: '', email: '', status: 'New', source: 'Website' })
      fetchLeads()
    } catch {
      console.error('Failed to save lead')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    try {
      await api.delete(`/leads/${id}`)
      fetchLeads()
    } catch {
      console.error('Failed to delete lead')
    }
  }

  const handleExport = async () => {
    try {
      const res = await api.get('/leads/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'leads.csv'
      a.click()
    } catch {
      console.error('Export failed')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">GigFlow Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.name} ({user.role})</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="border rounded-lg px-3 py-2 flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="border rounded-lg px-3 py-2 focus:outline-none">
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
          </select>
          <select value={source} onChange={e => { setSource(e.target.value); setPage(1) }}
            className="border rounded-lg px-3 py-2 focus:outline-none">
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Instagram">Instagram</option>
            <option value="Referral">Referral</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none">
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
          <button onClick={handleExport}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            Export CSV
          </button>
          <button onClick={() => { setShowForm(true); setEditLead(null) }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Add Lead
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No leads found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.source}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => { setEditLead(lead); setForm({ name: lead.name, email: lead.email, status: lead.status, source: lead.source }); setShowForm(true) }}
                        className="text-blue-600 hover:underline text-xs">Edit</button>
                      {user.role === 'admin' && (
                        <button onClick={() => handleDelete(lead._id)}
                          className="text-red-500 hover:underline text-xs">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editLead ? 'Edit Lead' : 'Add Lead'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Name" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none" required />
              <input type="email" placeholder="Email" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none" required />
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none">
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
              </select>
              <select value={form.source} onChange={e => setForm({...form, source: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none">
                <option value="Website">Website</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
              </select>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editLead ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}