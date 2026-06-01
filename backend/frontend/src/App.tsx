import React, { useState, useCallback } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  FileUp,
  Server,
  Activity,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Upload,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  AlertCircle,
  Terminal,
  Database,
  Lock,
  Globe,
  Zap,
  ArrowRight,
  Code,
  Layers,
  Users,
} from 'lucide-react';

interface ApiResponse {
  id: string;
  endpoint: string;
  method: string;
  status: number;
  ok: boolean;
  data: any;
  timestamp: Date;
  duration: number;
}

interface Document {
  _id?: string;
  id?: string;
  filename: string;
  fileSize?: number;
  size?: number;
  fileType?: string;
  uploadedAt?: string;
  createdAt?: string;
  status?: string;
}

interface FormState {
  regUser: string;
  regPass: string;
  regRole: string;
  loginUser: string;
  loginPass: string;
  apiBase: string;
}

type SessionStatus = 'none' | 'user' | 'admin';
type ActiveTab = 'dashboard' | 'auth' | 'documents' | 'responses' | 'settings';

const App: React.FC = () => {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('none');
  const [userToken, setUserToken] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [responses, setResponses] = useState<ApiResponse[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docPage, setDocPage] = useState(1);
  const [docLimit, setDocLimit] = useState(5);
  const [docSearch, setDocSearch] = useState('');
  const [docTotal, setDocTotal] = useState(0);
  const [formData, setFormData] = useState<FormState>({
    regUser: '',
    regPass: '',
    regRole: 'User',
    loginUser: '',
    loginPass: '',
    apiBase: 'https://backend1-axab.onrender.com/api',
  });

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const apiBase = formData.apiBase.replace(/\/+$/, '');
  const authToken = adminToken || userToken;

  const getAuthHeaders = (isJson = true): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    if (isJson) headers['Content-Type'] = 'application/json';
    return headers;
  };

  const getFullUrl = (endpoint: string) => {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    return `${apiBase}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  };

  const parseResponse = async (response: Response) => {
    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    return { status: response.status, ok: response.ok, data };
  };

  const mockDelay = () => new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));

  const generateMockResponse = useCallback((endpoint: string, method: string, body?: any): { status: number; ok: boolean; data: any } => {
    if (endpoint.includes('/auth/register')) {
      if (!body?.username || !body?.password) {
        return {
          status: 400,
          ok: false,
          data: { error: 'Bad Request', message: 'Username and password are required.', timestamp: new Date().toISOString() },
        };
      }
      return {
        status: 201,
        ok: true,
        data: {
          success: true,
          message: 'User registered successfully',
          user: { id: `usr_${Math.random().toString(36).slice(2, 9)}`, username: body.username, role: body.role || 'User', createdAt: new Date().toISOString() },
        },
      };
    }

    if (endpoint.includes('/auth/login')) {
      if (!body?.username || !body?.password) {
        return { status: 400, ok: false, data: { error: 'Bad Request', message: 'Username and password are required.' } };
      }
      const isAdmin = body.username.toLowerCase().includes('admin');
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: body.username, role: isAdmin ? 'Admin' : 'User', iat: Date.now(), exp: Date.now() + 86400000 }))}.${Math.random().toString(36).slice(2)}`;
      return {
        status: 200,
        ok: true,
        data: {
          success: true,
          token,
          user: { username: body.username, role: isAdmin ? 'Admin' : 'User', lastLogin: new Date().toISOString() },
          expiresIn: '24h',
        },
      };
    }

    if (endpoint.includes('/documents/upload')) {
      return {
        status: 201,
        ok: true,
        data: {
          success: true,
          message: 'Document uploaded',
          document: {
            id: `doc_${Math.random().toString(36).slice(2, 9)}`,
            filename: 'report.pdf',
            size: 1048576,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'processed',
          },
        },
      };
    }

    if (endpoint.includes('/documents')) {
      return {
        status: 200,
        ok: true,
        data: {
          success: true,
          count: 4,
          documents: [
            { id: 'doc_a1b2c3d', filename: 'invoice_2026.pdf', size: 245760, status: 'ready', createdAt: '2026-01-12T09:30:00Z' },
            { id: 'doc_e4f5g6h', filename: 'contract_draft.docx', size: 153600, status: 'ready', createdAt: '2026-01-11T14:22:00Z' },
            { id: 'doc_i7j8k9l', filename: 'report_q1.pdf', size: 1048576, status: 'processed', createdAt: '2026-01-10T11:05:00Z' },
            { id: 'doc_m0n1o2p', filename: 'presentation.pptx', size: 5242880, status: 'ready', createdAt: '2026-01-09T16:45:00Z' },
          ],
        },
      };
    }

    if (endpoint.includes('/logs')) {
      return {
        status: 200,
        ok: true,
        data: {
          success: true,
          totalLogs: 127,
          logs: [
            { id: 'log_001', level: 'INFO', message: 'Admin authentication successful', user: 'admin', ip: '192.168.1.100', timestamp: '2026-01-12T16:30:00Z' },
            { id: 'log_002', level: 'WARN', message: 'Rate limit threshold reached for endpoint /api/documents', user: 'alice', ip: '10.0.0.45', timestamp: '2026-01-12T16:25:00Z' },
            { id: 'log_003', level: 'INFO', message: 'Document uploaded: report.pdf', user: 'bob', ip: '172.16.0.89', timestamp: '2026-01-12T16:20:00Z' },
            { id: 'log_004', level: 'ERROR', message: 'Failed login attempt for user: unknown', user: null, ip: '203.0.113.42', timestamp: '2026-01-12T16:15:00Z' },
            { id: 'log_005', level: 'INFO', message: 'User registration: charlie', user: 'charlie', ip: '192.168.1.120', timestamp: '2026-01-12T16:10:00Z' },
          ],
        },
      };
    }

    return {
      status: 200,
      ok: true,
      data: { success: true, message: 'OK', timestamp: new Date().toISOString(), endpoint, method },
    };
  }, []);

  const storeResponse = useCallback((endpoint: string, method: string, result: { status: number; ok: boolean; data: any }, duration: number) => {
    const newResponse: ApiResponse = {
      id: `resp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      endpoint,
      method,
      status: result.status,
      ok: result.ok,
      data: result.data,
      timestamp: new Date(),
      duration,
    };
    setResponses(prev => [newResponse, ...prev].slice(0, 30));
  }, []);

  const handleRegister = async () => {
    setLoading(prev => ({ ...prev, register: true }));
    const startTime = Date.now();
    try {
      const response = await fetch(getFullUrl('/auth/register'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: formData.regUser,
          password: formData.regPass,
          role: formData.regRole,
        }),
      });

      const result = await parseResponse(response);
      const duration = Date.now() - startTime;
      storeResponse('/auth/register', 'POST', result, duration);

      if (result.ok) {
        showNotification('User registered successfully', 'success');
        setFormData(prev => ({ ...prev, regUser: '', regPass: '', regRole: 'User' }));
      } else {
        showNotification('Registration failed: ' + (result.data?.message || result.data?.error || 'Bad request'), 'error');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      storeResponse('/auth/register', 'POST', { status: 0, ok: false, data: { message: 'Network error' } }, duration);
      showNotification('Registration failed: Network error', 'error');
    } finally {
      setLoading(prev => ({ ...prev, register: false }));
    }
  };

  const handleLogin = async () => {
    setLoading(prev => ({ ...prev, login: true }));
    const startTime = Date.now();
    try {
      const response = await fetch(getFullUrl('/auth/login'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: formData.loginUser,
          password: formData.loginPass,
        }),
      });

      const result = await parseResponse(response);
      const duration = Date.now() - startTime;
      storeResponse('/auth/login', 'POST', result, duration);

      if (result.ok && result.data?.token) {
        const isAdmin = formData.loginUser.toLowerCase().includes('admin');
        setUserToken(result.data.token);
        setAdminToken(isAdmin ? result.data.token : '');
        setSessionStatus(isAdmin ? 'admin' : 'user');
        showNotification(`Logged in as ${isAdmin ? 'Admin' : 'User'}`, 'success');
      } else {
        showNotification('Login failed: ' + (result.data?.message || 'Invalid credentials'), 'error');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      storeResponse('/auth/login', 'POST', { status: 0, ok: false, data: { message: 'Network error' } }, duration);
      showNotification('Login failed: Network error', 'error');
    } finally {
      setLoading(prev => ({ ...prev, login: false }));
    }
  };

  const handleLogout = () => {
    setUserToken('');
    setAdminToken('');
    setSessionStatus('none');
    showNotification('Logged out', 'info');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showNotification('Please select a file first', 'error');
      return;
    }
    if (sessionStatus === 'none') {
      showNotification('Please login first', 'error');
      return;
    }

    setLoading(prev => ({ ...prev, upload: true }));
    const startTime = Date.now();

    try {
      const form = new FormData();
      form.append('files', selectedFile);

      const response = await fetch(getFullUrl('/documents/upload'), {
        method: 'POST',
        headers: getAuthHeaders(false),
        body: form,
      });

      const result = await parseResponse(response);
      const duration = Date.now() - startTime;
      storeResponse('/documents/upload', 'POST', result, duration);

      if (result.ok) {
        showNotification('Document uploaded', 'success');
        setSelectedFile(null);
      } else {
        showNotification('Upload failed: ' + (result.data?.message || 'Bad request'), 'error');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      storeResponse('/documents/upload', 'POST', { status: 0, ok: false, data: { message: 'Network error' } }, duration);
      showNotification('Upload failed: Network error', 'error');
    } finally {
      setLoading(prev => ({ ...prev, upload: false }));
    }
  };

  const handleFetchDocs = async () => {
    if (sessionStatus === 'none') {
      showNotification('Please login first', 'error');
      return;
    }
    setLoading(prev => ({ ...prev, docs: true }));
    const startTime = Date.now();

    try {
      // Build query params with pagination and search
      const params = new URLSearchParams({
        page: docPage.toString(),
        limit: docLimit.toString(),
        search: docSearch
      });

      const response = await fetch(getFullUrl(`/documents?${params}`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await parseResponse(response);
      const duration = Date.now() - startTime;
      storeResponse('/documents', 'GET', result, duration);

      if (result.ok) {
        // Handle both mock and real API responses
        const data = result.data;
        const docsArray = data.documents || data.docs || [];
        setDocuments(docsArray);
        setDocTotal(data.total || data.count || docsArray.length);
        showNotification(`Fetched ${docsArray.length} documents`, 'success');
      } else {
        showNotification('Failed to fetch documents: ' + (result.data?.message || 'Bad request'), 'error');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      storeResponse('/documents', 'GET', { status: 0, ok: false, data: { message: 'Network error' } }, duration);
      showNotification('Failed to fetch documents: Network error', 'error');
    } finally {
      setLoading(prev => ({ ...prev, docs: false }));
    }
  };

  const handleFetchLogs = async () => {
    if (sessionStatus !== 'admin') {
      showNotification('Admin login required', 'error');
      return;
    }
    setLoading(prev => ({ ...prev, logs: true }));
    const startTime = Date.now();

    try {
      const response = await fetch(getFullUrl('/logs'), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await parseResponse(response);
      const duration = Date.now() - startTime;
      storeResponse('/logs', 'GET', result, duration);

      if (result.ok) {
        showNotification('Logs fetched', 'success');
      } else {
        showNotification('Failed to fetch logs: ' + (result.data?.message || 'Bad request'), 'error');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      storeResponse('/logs', 'GET', { status: 0, ok: false, data: { message: 'Network error' } }, duration);
      showNotification('Failed to fetch logs: Network error', 'error');
    } finally {
      setLoading(prev => ({ ...prev, logs: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      showNotification('Copied to clipboard', 'info');
    }).catch(() => {});
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-emerald-600 bg-emerald-50';
      case 'POST':
        return 'text-blue-600 bg-blue-50';
      case 'PUT':
        return 'text-amber-600 bg-amber-50';
      case 'DELETE':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getMethodColorDark = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-emerald-400 bg-emerald-900/30';
      case 'POST':
        return 'text-blue-400 bg-blue-900/30';
      case 'PUT':
        return 'text-amber-400 bg-amber-900/30';
      case 'DELETE':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-800';
    }
  };

  const navItems: { id: ActiveTab; icon: React.ReactNode; label: string; badge?: string }[] = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'auth', icon: <ShieldCheck size={18} />, label: 'Authentication' },
    { id: 'documents', icon: <FileUp size={18} />, label: 'Documents' },
    { id: 'responses', icon: <Activity size={18} />, label: 'Responses', badge: responses.length > 0 ? String(responses.length) : undefined },
    { id: 'settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  const sessionInfo = {
    none: { label: 'Not logged in', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <XCircle size={14} className="text-gray-400" /> },
    user: { label: 'User logged in', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <CheckCircle size={14} className="text-blue-500" /> },
    admin: { label: 'Admin logged in', color: 'bg-red-50 text-red-700 border-red-200', icon: <ShieldCheck size={14} className="text-red-500" /> },
  }[sessionStatus];

  const sessionInfoDark = {
    none: { label: 'Not logged in', color: 'bg-gray-800 text-gray-400 border-gray-700', icon: <XCircle size={14} className="text-gray-500" /> },
    user: { label: 'User logged in', color: 'bg-blue-900/30 text-blue-400 border-blue-800', icon: <CheckCircle size={14} className="text-blue-400" /> },
    admin: { label: 'Admin logged in', color: 'bg-red-900/30 text-red-400 border-red-800', icon: <ShieldCheck size={14} className="text-red-400" /> },
  }[sessionStatus];

  const currentSession = darkMode ? sessionInfoDark : sessionInfo;

  const bg = darkMode ? 'bg-gray-950' : 'bg-slate-50';
  const cardBg = darkMode ? 'bg-gray-900' : 'bg-white';
  const cardBorder = darkMode ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const textMuted = darkMode ? 'text-gray-500' : 'text-gray-400';
  const softBg = darkMode ? 'bg-gray-800/50' : 'bg-gray-50';
  const inputBg = darkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400';
  const hoverBg = darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';

  const latestResponses = responses.slice(0, 4);
  const successRate = responses.length > 0 ? Math.round((responses.filter(r => r.ok).length / responses.length) * 100) : 100;

  const stats = [
    { label: 'API Calls', value: String(responses.length), icon: <Zap size={20} />, color: 'text-blue-600', bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50' },
    { label: 'Success Rate', value: `${successRate}%`, icon: <CheckCircle size={20} />, color: 'text-emerald-600', bg: darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50' },
    { label: 'Active Session', value: sessionStatus === 'none' ? 'Inactive' : sessionStatus === 'admin' ? 'Admin' : 'User', icon: <Users size={20} />, color: sessionStatus === 'none' ? 'text-gray-400' : sessionStatus === 'admin' ? 'text-red-600' : 'text-blue-600', bg: darkMode ? 'bg-gray-800' : 'bg-gray-50' },
    { label: 'Avg Response', value: responses.length > 0 ? `${Math.round(responses.reduce((a, r) => a + r.duration, 0) / responses.length)}ms` : '—', icon: <Clock size={20} />, color: 'text-amber-600', bg: darkMode ? 'bg-amber-900/20' : 'bg-amber-50' },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Dashboard</h2>
          <p className={`text-sm mt-1 ${textSecondary}`}>Monitor your API activity and session status at a glance.</p>
        </div>
        <button onClick={() => setActiveTab('auth')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20">
          <Code size={16} />
          New Action
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`${cardBg} border ${cardBorder} rounded-2xl p-5 shadow-sm transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium ${textSecondary}`}>{stat.label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <p className={`text-2xl font-bold ${textPrimary}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 shadow-sm`}>
          <h3 className={`text-sm font-semibold mb-4 ${textSecondary} uppercase tracking-wider`}>Session Status</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold ${currentSession.color}`}>
              {currentSession.icon}
              {currentSession.label}
            </div>
          </div>
          <div className={`text-sm ${textSecondary} space-y-2`}>
            {sessionStatus !== 'none' && (
              <>
                <div className="flex items-center justify-between">
                  <span>Token type</span>
                  <span className={`font-semibold ${textPrimary}`}>{sessionStatus === 'admin' ? 'JWT (Admin)' : 'JWT (User)'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Expires in</span>
                  <span className={`font-semibold ${textPrimary}`}>24h</span>
                </div>
                <div className="mt-4">
                  <button onClick={handleLogout} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
            {sessionStatus === 'none' && (
              <div className="flex items-center justify-between">
                <span>Authenticate to enable API requests.</span>
              </div>
            )}
          </div>
        </div>

        <div className={`lg:col-span-2 ${cardBg} border ${cardBorder} rounded-2xl p-6 shadow-sm`}>
          <h3 className={`text-sm font-semibold mb-4 ${textSecondary} uppercase tracking-wider`}>Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Go to Authentication', icon: <Lock size={16} />, tab: 'auth' as ActiveTab, desc: 'Register or login users' },
              { label: 'Upload Document', icon: <Upload size={16} />, tab: 'documents' as ActiveTab, desc: 'Send files to your API' },
              { label: 'Open API Tester', icon: <Terminal size={16} />, tab: 'apitester' as ActiveTab, desc: 'Build custom HTTP requests' },
              { label: 'View Response History', icon: <Activity size={16} />, tab: 'responses' as ActiveTab, desc: `See ${responses.length} recorded responses` },
            ].map((item, i) => (
              <button key={i} onClick={() => setActiveTab(item.tab)} className={`flex items-start gap-3 p-4 rounded-xl text-left transition-all ${hoverBg} border ${cardBorder}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  {item.icon}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${textPrimary}`}>{item.label}</p>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-semibold ${textSecondary} uppercase tracking-wider`}>Recent Activity</h3>
          {responses.length > 0 && (
            <button onClick={() => setActiveTab('responses')} className={`text-xs font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
              View all
            </button>
          )}
        </div>
        {latestResponses.length === 0 ? (
          <div className={`text-center py-12 ${textMuted}`}>
            <Activity size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No API requests yet. Try the <span onClick={() => setActiveTab('auth')} className={`font-semibold cursor-pointer ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Authentication</span> tab to register or login.</p>
          </div>
        ) : (
          <div className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
            {latestResponses.map(r => (
              <div key={r.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`inline-flex items-center justify-center w-12 h-7 rounded-lg text-xs font-bold font-mono ${darkMode ? getMethodColorDark(r.method) : getMethodColor(r.method)}`}>
                    {r.method}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-mono truncate ${textPrimary}`}>{r.endpoint}</p>
                    <p className={`text-xs ${textMuted}`}>{r.timestamp.toLocaleTimeString()} · {r.duration}ms</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${r.ok ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
                  {r.ok ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAuth = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${textPrimary}`}>Authentication</h2>
        <p className={`text-sm mt-1 ${textSecondary}`}>Register users and acquire JWT tokens for authorized endpoints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <Users size={20} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${textPrimary}`}>Register User</h3>
              <p className={`text-xs ${textMuted}`}>Create a new user account</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Username</label>
              <input
                value={formData.regUser}
                onChange={e => setFormData(prev => ({ ...prev, regUser: e.target.value }))}
                placeholder="e.g. alice"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${inputBg}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Password</label>
              <div className="relative">
                <input
                  type={showRegPass ? 'text' : 'password'}
                  value={formData.regPass}
                  onChange={e => setFormData(prev => ({ ...prev, regPass: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${inputBg}`}
                />
                <button onClick={() => setShowRegPass(!showRegPass)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted}`}>
                  {showRegPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Role</label>
              <select
                value={formData.regRole}
                onChange={e => setFormData(prev => ({ ...prev, regRole: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${inputBg}`}
              >
                <option>User</option>
                <option>Admin</option>
              </select>
            </div>
            <button
              onClick={handleRegister}
              disabled={loading.register}
              className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${loading.register ? 'bg-blue-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5'}`}
            >
              {loading.register ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              Register user
            </button>
          </div>
        </div>

        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <Lock size={20} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${textPrimary}`}>Login</h3>
              <p className={`text-xs ${textMuted}`}>Authenticate to receive a JWT token</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Username</label>
              <input
                value={formData.loginUser}
                onChange={e => setFormData(prev => ({ ...prev, loginUser: e.target.value }))}
                placeholder="e.g. alice (or 'admin' for admin role)"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${inputBg}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Password</label>
              <div className="relative">
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  value={formData.loginPass}
                  onChange={e => setFormData(prev => ({ ...prev, loginPass: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${inputBg}`}
                />
                <button onClick={() => setShowLoginPass(!showLoginPass)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted}`}>
                  {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={`p-3 rounded-xl ${softBg} text-xs ${textSecondary} flex items-start gap-2.5`}>
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
              <span>Include "admin" in the username to simulate an admin login (e.g. <span className={`font-mono font-semibold ${textPrimary}`}>admin</span> or <span className={`font-mono font-semibold ${textPrimary}`}>alice_admin</span>).</span>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading.login}
              className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${loading.login ? (darkMode ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-gray-200 cursor-not-allowed text-gray-500') : (darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700' : 'bg-gray-100 hover:bg-gray-50 text-gray-900 border border-gray-200 hover:-translate-y-0.5')}`}
            >
              {loading.login ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
              Login
            </button>
          </div>
        </div>
      </div>

      {responses.length > 0 && (
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-semibold ${textPrimary}`}>Latest Response</h3>
            <button onClick={() => setActiveTab('responses')} className={`text-xs font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>View all →</button>
          </div>
          <pre className={`p-4 rounded-xl text-xs font-mono overflow-auto max-h-64 ${softBg} ${textPrimary}`}>
            {JSON.stringify(responses[0].data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${textPrimary}`}>Documents</h2>
        <p className={`text-sm mt-1 ${textSecondary}`}>Upload, search, and manage your documents.</p>
      </div>

      {/* Upload Section */}
      <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 shadow-sm`}>
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            <Upload size={20} />
          </div>
          <div>
            <h3 className={`text-base font-bold ${textPrimary}`}>Upload Document</h3>
            <p className={`text-xs ${textMuted}`}>POST /api/documents/upload</p>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${selectedFile ? (darkMode ? 'border-blue-500 bg-blue-900/10' : 'border-blue-400 bg-blue-50') : (darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300')}`}
            onClick={() => document.getElementById('hiddenFile')?.click()}
          >
            <input
              id="hiddenFile"
              type="file"
              className="hidden"
              onChange={e => setSelectedFile(e.target.files?.[0] || null)}
            />
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <FileUp size={22} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            {selectedFile ? (
              <div>
                <p className={`text-sm font-semibold ${textPrimary}`}>{selectedFile.name}</p>
                <p className={`text-xs mt-1 ${textMuted}`}>{(selectedFile.size / 1024).toFixed(1)} KB · Click to change</p>
              </div>
            ) : (
              <div>
                <p className={`text-sm font-semibold ${textPrimary}`}>Click to select a file</p>
                <p className={`text-xs mt-1 ${textMuted}`}>or drag and drop</p>
              </div>
            )}
          </div>

          {sessionStatus === 'none' && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${darkMode ? 'bg-amber-900/20 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>You need to be logged in to upload documents.</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading.upload || sessionStatus === 'none' || !selectedFile}
            className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${loading.upload || sessionStatus === 'none' || !selectedFile ? (darkMode ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed') : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5'}`}
          >
            {loading.upload ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
            Upload document
          </button>
        </div>
      </div>

      {/* Fetch & Search Section */}
      <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 shadow-sm`}>
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            <Download size={20} />
          </div>
          <div>
            <h3 className={`text-base font-bold ${textPrimary}`}>Search & Fetch Documents</h3>
            <p className={`text-xs ${textMuted}`}>GET /api/documents with pagination & search</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Search by filename</label>
            <input
              type="text"
              value={docSearch}
              onChange={e => {
                setDocSearch(e.target.value);
                setDocPage(1); // Reset to page 1 when searching
              }}
              placeholder="e.g. invoice, report.pdf..."
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${inputBg}`}
            />
            <p className={`text-xs mt-1 ${textMuted}`}>Search is case-insensitive</p>
          </div>

          {/* Pagination Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Items per page</label>
              <select
                value={docLimit}
                onChange={e => {
                  setDocLimit(parseInt(e.target.value));
                  setDocPage(1);
                }}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${inputBg}`}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Current page</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDocPage(Math.max(1, docPage - 1))}
                  disabled={docPage === 1 || loading.docs}
                  className={`flex-1 px-3 py-3 rounded-xl border text-sm font-semibold transition-all ${docPage === 1 || loading.docs ? (darkMode ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed') : (darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50')}`}
                >
                  ← Prev
                </button>
                <div className={`flex-1 px-3 py-3 rounded-xl border text-sm font-semibold text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  Page {docPage}
                </div>
                <button
                  onClick={() => setDocPage(docPage + 1)}
                  disabled={documents.length === 0 || loading.docs}
                  className={`flex-1 px-3 py-3 rounded-xl border text-sm font-semibold transition-all ${documents.length === 0 || loading.docs ? (darkMode ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed') : (darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50')}`}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {sessionStatus === 'none' && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${darkMode ? 'bg-amber-900/20 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>You need to be logged in to view documents.</span>
            </div>
          )}

          <button
            onClick={handleFetchDocs}
            disabled={loading.docs || sessionStatus === 'none'}
            className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${loading.docs || sessionStatus === 'none' ? (darkMode ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed') : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5'}`}
          >
            {loading.docs ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
            Fetch documents
          </button>
        </div>
      </div>

      {/* Documents List Section */}
      {documents.length > 0 && (
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className={`text-base font-bold ${textPrimary}`}>Results</h3>
              <p className={`text-xs mt-1 ${textSecondary}`}>Showing {documents.length} of {docTotal} document{docTotal !== 1 ? 's' : ''}</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              Page {docPage}
            </div>
          </div>

          <div className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
            {documents.map((doc, idx) => (
              <div key={doc._id || doc.id || idx} className={`flex items-center justify-between py-4 first:pt-0 last:pb-0`}>
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <FileUp size={18} className={doc.fileType === 'pdf' || doc.filename?.includes('.pdf') ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-blue-400' : 'text-blue-600')} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${textPrimary}`}>{doc.filename}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs ${textMuted}`}>{(((doc.fileSize ?? doc.size ?? 0) / 1024).toFixed(1))} KB</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${doc.fileType === 'pdf' || doc.filename?.includes('.pdf') ? (darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700') : (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700')}`}>
                        {doc.fileType || (doc.filename?.includes('.pdf') ? 'PDF' : 'Image')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`text-right flex-shrink-0 ml-3`}>
                  <p className={`text-xs ${textMuted}`}>{new Date(doc.uploadedAt ?? doc.createdAt ?? Date.now()).toLocaleDateString()}</p>
                  <p className={`text-xs font-semibold mt-1 ${doc.status === 'processed' ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : (darkMode ? 'text-amber-400' : 'text-amber-600')}`}>
                    {doc.status || 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Info */}
          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <p className={`text-xs ${textSecondary}`}>
              Showing page <span className={`font-semibold ${textPrimary}`}>{docPage}</span> with <span className={`font-semibold ${textPrimary}`}>{docLimit}</span> items per page
              {docSearch && <>, filtered by: <span className={`font-mono ${textPrimary}`}>"{docSearch}"</span></>}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && sessionStatus !== 'none' && (
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-12 text-center shadow-sm`}>
          <Download size={40} className={`mx-auto mb-3 ${textMuted} opacity-30`} />
          <p className={`text-sm font-medium ${textPrimary}`}>No documents found</p>
          <p className={`text-xs mt-1 ${textSecondary}`}>
            {docSearch ? 'Try adjusting your search filters or ' : ''}Click "Fetch documents" to load your documents.
          </p>
        </div>
      )}
    </div>
  );



  const renderResponses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Response History</h2>
          <p className={`text-sm mt-1 ${textSecondary}`}>{responses.length} responses recorded</p>
        </div>
        {responses.length > 0 && (
          <button onClick={() => { setResponses([]); showNotification('History cleared', 'info'); }} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}>
            <Trash2 size={16} />
            Clear all
          </button>
        )}
      </div>

      {responses.length === 0 ? (
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-12 text-center shadow-sm`}>
          <Activity size={40} className={`mx-auto mb-3 ${textMuted} opacity-30`} />
          <p className={`text-sm font-medium ${textPrimary}`}>No responses yet</p>
          <p className={`text-xs mt-1 ${textSecondary}`}>Authenticate or upload documents to generate API requests.</p>
          <button onClick={() => setActiveTab('auth')} className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all">
            <Terminal size={16} />
            Go to Authentication
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {responses.map(r => (
            <div key={r.id} className={`${cardBg} border ${cardBorder} rounded-2xl shadow-sm overflow-hidden`}>
              <div className={`flex items-center justify-between px-5 py-4 ${softBg}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`inline-flex items-center justify-center w-14 h-7 rounded-lg text-xs font-bold font-mono flex-shrink-0 ${darkMode ? getMethodColorDark(r.method) : getMethodColor(r.method)}`}>
                    {r.method}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-mono truncate font-semibold ${textPrimary}`}>{r.endpoint}</p>
                    <p className={`text-xs ${textMuted}`}>{r.timestamp.toLocaleString()} · <span className="font-semibold">{r.duration}ms</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${r.ok ? (darkMode ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-700 bg-emerald-50') : (darkMode ? 'text-red-400 bg-red-900/30' : 'text-red-700 bg-red-50')}`}>
                    {r.ok ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {r.status}
                  </span>
                  <button onClick={() => copyToClipboard(JSON.stringify(r.data, null, 2))} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${hoverBg} ${textSecondary}`} title="Copy response">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <pre className="px-5 py-4 text-xs font-mono overflow-auto max-h-64 text-gray-100 bg-gray-950 dark:text-gray-100 dark:bg-gray-900">
                {JSON.stringify(r.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${textPrimary}`}>Settings</h2>
        <p className={`text-sm mt-1 ${textSecondary}`}>Configure your backend control panel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              <Globe size={20} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${textPrimary}`}>API Configuration</h3>
              <p className={`text-xs ${textMuted}`}>Base URL for your backend API</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>API Base URL</label>
              <input
                value={formData.apiBase}
                onChange={e => setFormData(prev => ({ ...prev, apiBase: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${inputBg}`}
              />
            </div>

            <div className={`p-3 rounded-xl text-xs ${softBg} ${textSecondary} flex items-start gap-2.5`}>
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-blue-500" />
              <div>
                <p className={`font-semibold mb-1 ${textPrimary}`}>Note</p>
                <p>This demo uses mock responses. To connect to a real backend, update the base URL and implement actual fetch calls.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              <Layers size={20} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${textPrimary}`}>Appearance</h3>
              <p className={`text-xs ${textMuted}`}>Interface theme preferences</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${hoverBg} ${cardBorder}`}
            >
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-900/30 text-indigo-400">
                    <Moon size={18} />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
                    <Sun size={18} />
                  </div>
                )}
                <div className="text-left">
                  <p className={`text-sm font-semibold ${textPrimary}`}>{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
                  <p className={`text-xs ${textMuted}`}>Click to toggle theme</p>
                </div>
              </div>
              <div className={`w-11 h-7 rounded-full p-0.5 transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>

            <div className={`p-4 rounded-xl ${softBg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Database size={16} className={textMuted} />
                <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Session</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className={textSecondary}>Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${currentSession.color}`}>
                    {currentSession.icon}
                    {currentSession.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={textSecondary}>Responses stored</span>
                  <span className={`font-mono font-semibold ${textPrimary}`}>{responses.length}</span>
                </div>
                {sessionStatus !== 'none' && (
                  <div className="pt-2">
                    <button
                      onClick={handleLogout}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'auth':
        return renderAuth();
      case 'documents':
        return renderDocuments();
      case 'responses':
        return renderResponses();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`inline-flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold animate-pulse ${notification.type === 'success' ? (darkMode ? 'bg-emerald-900/90 border-emerald-700 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-800') : notification.type === 'error' ? (darkMode ? 'bg-red-900/90 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800') : (darkMode ? 'bg-blue-900/90 border-blue-700 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800')}`}>
            {notification.type === 'success' && <CheckCircle size={16} />}
            {notification.type === 'error' && <XCircle size={16} />}
            {notification.type === 'info' && <AlertCircle size={16} />}
            {notification.message}
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${cardBg} border-r ${cardBorder} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex flex-col h-full">
          <div className={`flex items-center ${sidebarOpen ? 'justify-between px-5' : 'justify-center'} py-5 border-b ${cardBorder}`}>
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <Server size={18} className="text-white" />
                </div>
                <div>
                  <p className={`text-sm font-bold leading-none ${textPrimary}`}>Backend Panel</p>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>API Control Center</p>
                </div>
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Server size={18} className="text-white" />
              </div>
            )}
            <div className="flex items-center gap-1">
              <button onClick={() => setDarkMode(!darkMode)} className={`hidden lg:flex w-8 h-8 rounded-lg items-center justify-center transition-all ${hoverBg} ${textSecondary}`} title={darkMode ? 'Light mode' : 'Dark mode'}>
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`hidden lg:flex w-8 h-8 rounded-lg items-center justify-center transition-all ${hoverBg} ${textSecondary}`} title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
                <ChevronRight size={16} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
              </button>
              <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all ${hoverBg} ${textSecondary}">
                <X size={16} />
              </button>
            </div>
          </div>

          {sidebarOpen && (
            <div className="mx-4 mt-4 mb-2">
              <div className={`p-3 rounded-xl border ${currentSession.color}`}>
                <div className="flex items-center gap-2">
                  {currentSession.icon}
                  <span className="text-xs font-semibold">{currentSession.label}</span>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} className={`w-full flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? (darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600') : `${hoverBg} ${textSecondary}`}`} title={item.label}>
                <div className="flex items-center gap-3">
                  {item.icon}
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
                {sidebarOpen && item.badge && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-bold">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          {sessionStatus !== 'none' && sidebarOpen && (
            <div className={`p-4 border-t ${cardBorder}`}>
              <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}>
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}

          {sessionStatus !== 'none' && !sidebarOpen && (
            <div className={`p-2 border-t ${cardBorder}`}>
              <button onClick={handleLogout} className={`w-full flex items-center justify-center w-9 h-9 rounded-xl transition-all ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <header className={`lg:hidden sticky top-0 z-30 ${cardBg} border-b ${cardBorder} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className={`w-9 h-9 rounded-xl flex items-center justify-center ${hoverBg}`}>
              <Menu size={20} className={textPrimary} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Server size={16} className="text-white" />
              </div>
              <span className={`text-sm font-bold ${textPrimary}`}>Backend Panel</span>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className={`w-9 h-9 rounded-xl flex items-center justify-center ${hoverBg} ${textSecondary}`}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
