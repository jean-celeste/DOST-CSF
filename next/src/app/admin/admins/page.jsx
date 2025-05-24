"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
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

  if (status === "loading") return <div>Loading...</div>;
  if (!session || session.user.role !== 'Regional Administrator') return null;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Admin</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <ul className="mt-1 text-xs text-red-500 list-disc list-inside">
                  {unmetRequirements.map((r, i) => (
                    <li key={i}>{r.message}</li>
                  ))}
                </ul>
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
                <div className={`mt-1 text-xs font-medium ${formData.password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
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
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !formData.role}>Create Admin Account</Button>
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
      </div>
      {/* Admins List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Existing Admins</h2>
        {adminsLoading ? (
          <div className="p-6">Loading admins...</div>
        ) : (
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
                {admins.map(admin => (
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
        )}
      </div>
    </div>
  );
} 