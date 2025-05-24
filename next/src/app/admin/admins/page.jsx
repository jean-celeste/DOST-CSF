"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Eye, EyeOff, CheckCircle, XCircle, Info, Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';

export default function AdminManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '', password: '', role: '', office_id: '', division_id: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [offices, setOffices] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper to check if selected office is DOST Regional Office
  const isRegionalOffice = formData.office_id && offices.find(o => o.office_id.toString() === formData.office_id)?.office_name === 'DOST Regional Office';

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/admin/login");
    else if (status === "authenticated" && session.user.role !== 'Regional Administrator') router.replace("/admin");
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchOffices();
      fetchDivisions();
      fetchAdmins();
    }
  }, [status]);

  useEffect(() => {
    // Auto-set role and division logic
    if (!formData.office_id) {
      setFormData(f => ({ ...f, division_id: '', role: '' }));
      return;
    }
    if (isRegionalOffice) {
      // If division is selected, role is Division Administrator
      if (formData.division_id) {
        setFormData(f => ({ ...f, role: 'Division Administrator' }));
      } else {
        setFormData(f => ({ ...f, role: '' }));
      }
    } else {
      // PSTO: role is PSTO Administrator, division is always blank
      setFormData(f => ({ ...f, division_id: '', role: 'PSTO Administrator' }));
    }
  }, [formData.office_id, formData.division_id, isRegionalOffice]);

  const fetchOffices = async () => {
    try {
      const res = await fetch('/api/admin/offices');
      const data = await res.json();
      if (data.success) setOffices(data.data);
    } catch {
      toast.error('Error fetching offices');
    }
  };

  const fetchDivisions = async () => {
    try {
      const res = await fetch('/api/admin/divisions');
      const data = await res.json();
      if (data.success) setDivisions(data.data);
    } catch {
      toast.error('Error fetching divisions');
    }
  };

  const fetchAdmins = async () => {
    setAdminsLoading(true);
    try {
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      if (data.success) setAdmins(data.data);
      else toast.error(data.error || 'Failed to fetch admins');
    } catch {
      toast.error('Error fetching admins');
    }
    setAdminsLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    // Password requirements regex
    const password = formData.password;
    const requirements = [
      { regex: /.{8,}/, message: 'at least 8 characters' },
      { regex: /[A-Z]/, message: 'an uppercase letter' },
      { regex: /[a-z]/, message: 'a lowercase letter' },
      { regex: /[0-9]/, message: 'a number' },
      { regex: /[^A-Za-z0-9]/, message: 'a special character' },
    ];
    const unmet = requirements.filter(r => !r.regex.test(password));
    if (unmet.length > 0) {
      toast.error('Password must contain ' + unmet.map(r => r.message).join(', '));
      setShowConfirmDialog(false);
      return;
    }
    if (formData.password !== confirmPassword) {
      toast.error('Passwords do not match');
      setShowConfirmDialog(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/admins/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Admin account created successfully');
        setFormData({ username: '', password: '', role: '', office_id: '', division_id: '' });
        setConfirmPassword('');
        fetchAdmins();
      } else {
        toast.error(data.error || 'Failed to create admin account');
      }
    } catch {
      toast.error('Error creating admin account');
    }
    setLoading(false);
    setShowConfirmDialog(false);
  };

  // Password requirements
  const passwordRequirements = [
    { regex: /.{8,}/, message: 'At least 8 characters' },
    { regex: /[A-Z]/, message: 'At least 1 uppercase letter' },
    { regex: /[a-z]/, message: 'At least 1 lowercase letter' },
    { regex: /[0-9]/, message: 'At least 1 number' },
    { regex: /[^A-Za-z0-9]/, message: 'At least 1 special character' },
  ];
  const unmetRequirements = passwordRequirements.filter(r => !r.regex.test(formData.password));

  // Filtered and paginated admins
  const filteredAdmins = admins.filter(admin => admin.username.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const paginatedAdmins = filteredAdmins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  if (status === "loading") return <div>Loading...</div>;
  if (!session || session.user.role !== 'Regional Administrator') return null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="outline"
              className="h-10 px-4 border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-2"
            >
              <Plus size={18} />
              Create Admin
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="relative md:col-span-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search admins by username..."
              className="w-full h-10 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-900 text-2xl font-semibold">
              <Info className="w-6 h-6 text-blue-500" /> Create New Admin
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label>Username</label>
                <Input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
              </div>
              <div>
                <label>Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && unmetRequirements.length > 0 && (
                  <ul className="mt-2 text-xs text-red-600 space-y-1">
                    {unmetRequirements.map((r, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-red-400" /> {r.message}
                      </li>
                    ))}
                  </ul>
                )}
                {formData.password && unmetRequirements.length === 0 && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Password meets all requirements
                  </div>
                )}
              </div>
              <div>
                <label>Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${formData.password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {formData.password === confirmPassword ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    {formData.password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                )}
              </div>
              <div>
                <label>Office</label>
                <Select value={formData.office_id} onValueChange={value => setFormData({ ...formData, office_id: value, division_id: '' })} required>
                  <SelectTrigger><SelectValue placeholder="Select office" /></SelectTrigger>
                  <SelectContent>
                    {offices.map(office => (
                      <SelectItem key={office.office_id} value={office.office_id.toString()}>
                        {office.office_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label>Division</label>
                <Select
                  value={formData.division_id}
                  onValueChange={value => setFormData({ ...formData, division_id: value })}
                  disabled={!isRegionalOffice}
                  required={isRegionalOffice}
                >
                  <SelectTrigger><SelectValue placeholder={isRegionalOffice ? "Select division" : "Select office first"} /></SelectTrigger>
                  <SelectContent>
                    {divisions
                      .filter(division => division && division.office_id && division.office_id.toString() === "1")
                      .map(division => (
                        <SelectItem key={division.division_id} value={division.division_id.toString()}>
                          {division.division_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label>Role</label>
                <Input type="text" value={formData.role} readOnly disabled />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                disabled={loading || !formData.role}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Admin Account'}
              </Button>
              <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Admin Account Creation</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to create this admin account? Please confirm that all details are correct.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleConfirmSubmit} disabled={loading}>
                      {loading ? 'Creating...' : 'Confirm'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Office</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAdmins.map(admin => (
                <tr key={admin.admin_id}>
                  <td className="px-6 py-4 whitespace-nowrap">{admin.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{admin.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{admin.office_name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{admin.division_name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            Showing {filteredAdmins.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAdmins.length)} of {filteredAdmins.length} results
          </div>
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                variant={currentPage === i + 1 ? "default" : "outline"}
                className={`px-3 py-1 text-sm ${
                  currentPage === i + 1 
                    ? "bg-blue-500 text-white hover:bg-blue-600" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 