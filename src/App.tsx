import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  CreditCard,
  Dumbbell,
  CheckCircle2,
  Search,
  Plus,
  Filter,
  TrendingUp,
  AlertCircle,
  Calendar,
  ChevronRight,
  UserPlus,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  Wallet,
  Home,
  LayoutDashboard,
  CalendarDays,
  Menu,
  Bell,
  MoreHorizontal,
  FileText,
  X,
  Edit2,
  Trash2,
  ChevronLeft,
  Clock,
  Minus,
  User,
  Zap,
  Check,
  Cake,
  Upload,
  Loader2,
  Camera,
  Link2,
  Phone,
  LogOut,
  Download,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  LabelList
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

  import { supabase } from './lib/supabase';
  import jsPDF from 'jspdf';
  import autoTable from 'jspdf-autotable';

// --- Utils ---
  function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }

  function formatDisplayDate(dateStr: string) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

// --- Constants ---
const MODALITIES = [
  'FUNCIONAL',
  'YOGA',
  'BOXE',
  'MUAY THAI',
  'KARATE',
  'RITMOS',
  'FUNCIONAL FIGHT',
  'ALONGAMENTO',
  'KRAV MAGÁ',
  'ALONGAMENTO COM MASSAGEM'
];

const TIME_SLOTS = [
  '06:30', '07:00', '08:00', '09:00', '10:00',
  '16:00', '17:30', '18:30', '19:00', '19:30', '20:00', '21:00'
];

const PLAN_OPTIONS = ['K1', 'K2', 'K3', 'Wellhub', 'Krav Magá', 'Karate', 'Ritmos'];

// --- Types ---
interface Booking {
  id: string;
  studentName: string;
  isExperimental: boolean;
}

interface ModalitySlot {
  modality: string;
  bookings: Booking[];
}

interface AgendaSlot {
  modalities: ModalitySlot[];
}

// --- Mock Data ---
const WEEKLY_DATA = [
  { name: 'Seg', checkins: 45 },
  { name: 'Ter', checkins: 52 },
  { name: 'Qua', checkins: 38 },
  { name: 'Qui', checkins: 65 },
  { name: 'Sex', checkins: 48 },
  { name: 'Sáb', checkins: 30 },
  { name: 'Dom', checkins: 12 },
];

const INITIAL_STUDENTS = [
  { id: 1, name: 'Guilherme (karate)', plan: 'Karate', lastCheckin: 'Nunca', status: 'Em dia', birthDate: '1990-03-11', enrollmentDate: '2024-03-11', preferredDueDay: '10', value: 150 },
  { id: 2, name: 'Iara Neusa de Lima Figueiredo', plan: 'K1', lastCheckin: 'Nunca', status: 'Em dia', birthDate: '1985-05-20', enrollmentDate: '2024-01-15', preferredDueDay: '05', value: 120 },
];

const INITIAL_TRANSACTIONS = [
  { id: 1, description: 'Mensalidade Iara', amount: 150, type: 'in', status: 'pending', date: '2026-03-15' },
  { id: 2, description: 'Aluguel março', amount: 2075, type: 'out', status: 'completed', date: '2026-03-10' },
];

// --- Components ---

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-[12px]" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0a0a0b]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] p-8 z-[201] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          <div className="overflow-y-auto pr-2 custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const StatCard = ({ title, value, trend, isCurrency = false, type = 'success' }: { 
  title: string, 
  value: number | string, 
  trend?: string,
  isCurrency?: boolean,
  type?: 'success' | 'danger' | 'info'
}) => (
  <div className="glass-card p-6 rounded-[2rem] flex-1 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-amber-500/10 transition-all duration-700" />
    <div className="flex items-center gap-3 mb-4">
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md border",
        type === 'success' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : 
        type === 'danger' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
        "bg-blue-500/10 border-blue-500/20 text-blue-400"
      )}>
        {type === 'success' ? <TrendingUp size={18} className="text-glow-gold" /> : 
         type === 'danger' ? <TrendingUp size={18} className="rotate-180" /> :
         <DollarSign size={18} />}
      </div>
      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.15em]">{title}</span>
    </div>
    <h3 className={cn(
      "text-3xl font-bold tracking-tight mb-1 text-white group-hover:text-amber-50 transition-colors",
      type === 'info' && (Number(value) < 0 && "text-rose-500")
    )}>
      {isCurrency ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : value}
    </h3>
    {trend && (
      <div className="flex items-center gap-1.5">
        <span className={cn(
          "text-[11px] font-semibold",
          type === 'success' ? "text-amber-500/80" : 
          type === 'danger' ? "text-rose-500/80" :
          (Number(value) >= 0 ? "text-blue-400/80" : "text-rose-400/80")
        )}>
          {trend}
        </span>
      </div>
    )}
  </div>
);

const NavItem = ({ id, icon: Icon, label, active, onClick }: { id: string, icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-center gap-1.5 transition-all duration-500 py-2 w-full group",
      active ? "text-amber-500" : "text-neutral-600 hover:text-neutral-400"
    )}
  >
    {active && (
      <motion.div 
        layoutId="activeNav"
        className="absolute left-0 w-1 h-8 bg-amber-500 rounded-r-full glow-gold shadow-[0_0_15px_rgba(245,158,11,0.5)]"
      />
    )}
    <Icon 
      size={24} 
      strokeWidth={active ? 2.5 : 2} 
      className={cn(
        "transition-transform duration-500 group-hover:scale-110",
        active && "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
      )}
    />
    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{label}</span>
  </button>
);

const ActionButton = ({ label, icon: Icon, primary = false, onClick }: { label: string, icon?: any, primary?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-[13px] uppercase tracking-widest transition-all active:scale-95 duration-300 overflow-hidden relative group",
      primary 
        ? "bg-amber-500 text-black shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:bg-amber-400 hover:shadow-[0_15px_40px_rgba(245,158,11,0.4)] w-full" 
        : "glass-card text-neutral-300 hover:text-white hover:bg-white/[0.08] w-full"
    )}
  >
    {primary && (
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    )}
    {Icon && <Icon size={18} strokeWidth={2.5} />}
    {label}
  </button>
);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthInit, setIsAuthInit] = useState(false);
  
  const [view, setView] = useState<'home' | 'alunos' | 'experimentais' | 'agenda' | 'financeiro' | 'public_agenda' | 'login'>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExperimentalModalOpen, setIsExperimentalModalOpen] = useState(false);
  const [dashboardPlanFilter, setDashboardPlanFilter] = useState('Todos');
  const [dashboardViewMode, setDashboardViewMode] = useState<'distribuicao' | 'frequencia' | 'ranking'>('distribuicao');
  const [students, setStudents] = useState<any[]>([]);
  const [experimentalStudents, setExperimentalStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editingExperimental, setEditingExperimental] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ativos' | 'em_dia' | 'atrasados'>('ativos');

  // Reports State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportMonth, setReportMonth] = useState(() => new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(() => new Date().getFullYear());
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthInit(true);
      if (!session) {
        setView('public_agenda');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setView('public_agenda');
      } else if (view === 'public_agenda' || view === 'login') {
        setView('home');
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    // Bypass provisório para desenvolvimento/testes
    if (authPassword === '1234') {
      setSession({ user: { email: authEmail || 'admin@gestaokz.com' } } as any);
      setView('home');
      setAuthLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (error) alert('Erro de login: ' + error.message);
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo e tamanho (2MB)
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Foto muito grande! O limite é 2MB.');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      // Usar o ID do aluno se estiver editando, senão um time aleatório
      const studentId = editingStudent?.id || editingExperimental?.id || Date.now();
      const fileName = `${studentId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName; // No bucket

      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) {
        // Se o erro for bucket não encontrado, avisar o usuário
        if (uploadError.message.includes('bucket not found')) {
          throw new Error('O bucket "student-photos" precisa ser criado no Supabase Storage.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('student-photos')
        .getPublicUrl(filePath);

      setNewStudentPhotoUrl(publicUrl);
    } catch (error: any) {
      console.error('Erro no upload:', error);
      alert(`Erro no upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhotoUrl, setNewStudentPhotoUrl] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('K1');
  const [selectedPayment, setSelectedPayment] = useState('Em dia');
  const [newStudentValue, setNewStudentValue] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [preferredModality, setPreferredModality] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [preferredDueDay, setPreferredDueDay] = useState('10');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');

  // Agenda State
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [agendaEvents, setAgendaEvents] = useState<Record<string, AgendaSlot>>({});
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  
  // Booking Form State
  const [selectedBookingModality, setSelectedBookingModality] = useState('');
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [isExperimental, setIsExperimental] = useState(false);

  // Finance State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [financeFilter, setFinanceFilter] = useState<'todos' | 'receitas' | 'despesas'>('todos');
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);

  // New Transaction Form State
  const [newTransType, setNewTransType] = useState<'in' | 'out'>('in');
  const [newTransStatus, setNewTransStatus] = useState<'pending' | 'completed'>('completed');
  const [newTransDesc, setNewTransDesc] = useState('');
  const [newTransValue, setNewTransValue] = useState('');
  const [newTransDate, setNewTransDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // Fetch from Supabase
  const fetchData = async () => {
    // Fetch Alunos
    const { data: studentsData, error: studentsError } = await supabase.from('students').select('*').order('name');
    if (studentsData) {
      const mapped = studentsData.map((s: any) => ({
        id: s.id,
        name: s.name,
        plan: s.plan,
        lastCheckin: s.last_checkin,
        status: s.status,
        value: s.value,
        preferredTime: s.preferred_time,
        preferredModality: s.preferred_modality,
        enrollmentDate: s.enrollment_date,
        preferredDueDay: s.preferred_due_day,
        birthDate: s.birth_date,
        phone: s.phone,
        photoUrl: s.photo_url,
        cancelledAt: s.cancelled_at
      }));
      setStudents(mapped);
    } else if (studentsError) console.error('Erro ao buscar alunos:', studentsError);

    // Fetch Experimentais
    const { data: expData, error: expError } = await supabase.from('experimental_students').select('*').order('name');
    if (expData) {
      const mapped = expData.map((s: any) => ({
        id: s.id,
        name: s.name,
        preferredTime: s.preferred_time,
        preferredModality: s.preferred_modality,
        enrollmentDate: s.enrollment_date,
        birthDate: s.birth_date,
        phone: s.phone,
        status: s.status,
        photoUrl: s.photo_url
      }));
      setExperimentalStudents(mapped);
    } else if (expError) console.error('Erro ao buscar experimentais:', expError);

    // Fetch Transações
    const { data: transData, error: transError } = await supabase.from('transactions').select('*').order('date', { ascending: false }).order('id', { ascending: false });
    if (transData) {
      const mapped = transData.map((t: any) => ({
        id: t.id,
        studentId: t.student_id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        status: t.status,
        date: t.date
      }));
      setTransactions(mapped);
    } else if (transError) console.error('Erro ao buscar transações:', transError);

    // Fetch Agendamentos
    const { data: agendaData, error: agendaError } = await supabase.from('agenda_bookings').select('*');
    if (agendaData) {
      const groupedAgenda: Record<string, AgendaSlot> = {};
      agendaData.forEach(booking => {
        const key = booking.slot_key;
        if (!groupedAgenda[key]) groupedAgenda[key] = { modalities: [] };
        let modSlot = groupedAgenda[key].modalities.find(m => m.modality === booking.modality);
        if (!modSlot) {
          modSlot = { modality: booking.modality, bookings: [] };
          groupedAgenda[key].modalities.push(modSlot);
        }
        modSlot.bookings.push({
          id: booking.id,
          studentName: booking.student_name,
          isExperimental: booking.is_experimental
        });
      });
      setAgendaEvents(groupedAgenda);
    } else if (agendaError) console.error('Erro ao buscar agenda:', agendaError);

    // Fetch Relatórios Mensais
    const { data: reportsData, error: reportsError } = await supabase.from('monthly_reports').select('*').order('created_at', { ascending: false });
    if (reportsData) {
      setMonthlyReports(reportsData);
    } else if (reportsError) console.error('Erro ao buscar relatórios:', reportsError);
  };

  useEffect(() => {
    fetchData();

    // Setup Realtime subscriptions
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experimental_students' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda_bookings' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monthly_reports' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Remove Persistence Effects (localStorage)
  // useEffect(() => { ... }, [students, ...]);

  const filteredStudents = students.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (s.plan && s.plan.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'em_dia' ? s.status === 'Em dia' :
      statusFilter === 'atrasados' ? s.status === 'Pendente' :
      s.status !== 'Cancelado'; // 'ativos'
      
    return matchesSearch && matchesStatus;
  });
  const filteredExperimental = experimentalStudents.filter((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Finance Calculations
  const { totalInCompleted, totalInPending, totalOutCompleted, totalOutPending, totalProfit } = useMemo(() => {
    const totals = transactions.reduce((acc: any, t: any) => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'in') {
        if (t.status === 'completed') acc.inCompleted += amount;
        else acc.inPending += amount;
      } else {
        if (t.status === 'completed') acc.outCompleted += amount;
        else acc.outPending += amount;
      }
      return acc;
    }, { inCompleted: 0, inPending: 0, outCompleted: 0, outPending: 0 });

    return {
      totalInCompleted: totals.inCompleted,
      totalInPending: totals.inPending,
      totalOutCompleted: totals.outCompleted,
      totalOutPending: totals.outPending,
      totalProfit: totals.inCompleted - totals.outCompleted
    };
  }, [transactions]);

  const filteredTransactions = transactions.filter((t: any) => {
    if (financeFilter === 'receitas') return t.type === 'in';
    if (financeFilter === 'despesas') return t.type === 'out';
    return true;
  }).sort((a: any, b: any) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return Number(b.id) - Number(a.id);
  });

  const financeChartData = useMemo(() => {
    const monthLabel = (year: number, monthIndex0: number) =>
      new Date(year, monthIndex0, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

    const parseDateSafe = (value: any) => {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    // Group by YYYY-MM, summing receitas/despesas (independente do status)
    const byMonth = new Map<string, { year: number; month0: number; receitas: number; despesas: number }>();

    for (const t of transactions) {
      const d = parseDateSafe(t?.date);
      if (!d) continue;
      const year = d.getFullYear();
      const month0 = d.getMonth();
      const key = `${year}-${String(month0 + 1).padStart(2, '0')}`;

      const amount = Number(t?.amount) || 0;
      const current = byMonth.get(key) ?? { year, month0, receitas: 0, despesas: 0 };

      if (t?.type === 'in') current.receitas += amount;
      else if (t?.type === 'out') current.despesas += amount;

      byMonth.set(key, current);
    }

    const rows = Array.from(byMonth.values())
      .sort((a, b) => (a.year - b.year) || (a.month0 - b.month0))
      .map((m) => ({
        month: monthLabel(m.year, m.month0),
        receitas: Math.round((m.receitas + Number.EPSILON) * 100) / 100,
        despesas: Math.round((m.despesas + Number.EPSILON) * 100) / 100,
        lucro: Math.round(((m.receitas - m.despesas) + Number.EPSILON) * 100) / 100,
      }));

    // Keep last 6 months with data
    return rows.slice(-6);
  }, [transactions]);

  const expensesByItem = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t: any) => t.type === 'out')
      .forEach((t: any) => {
        map[t.description] = (map[t.description] || 0) + Number(t.amount || 0);
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions]);

  const handleAddTransaction = async () => {
    if (!newTransDesc || !newTransValue) return;
    
    const transactionId = editingTransaction ? editingTransaction.id : Date.now();
    const transData = {
      id: transactionId,
      description: newTransDesc,
      amount: parseFloat(newTransValue),
      type: newTransType,
      status: newTransStatus,
      date: newTransDate
    };

    if (editingTransaction) {
      const { error } = await supabase.from('transactions').update(transData).eq('id', transactionId);
      if (error) {
        console.error('Erro ao atualizar transação:', error);
        alert(`Erro ao atualizar transação: ${error.message || 'Erro desconhecido'}`);
        return;
      }
      setTransactions(prevTransactions => prevTransactions.map((t: any) => t.id == transactionId ? { ...t, ...transData } : t));
    } else {
      const { error } = await supabase.from('transactions').insert([transData]);
      if (error) {
        console.error('Erro ao inserir transação:', error);
        alert(`Erro ao salvar transação: ${error.message || 'Erro desconhecido'}`);
        return;
      }
      setTransactions(prevTransactions => [transData, ...prevTransactions]);
    }
    
    setNewTransDesc('');
    setNewTransValue('');
    setNewTransDate(new Date().toISOString().split('T')[0]);
    setNewTransStatus('completed');
    setEditingTransaction(null);
    setIsFinanceModalOpen(false);
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setNewTransType(transaction.type);
    setNewTransStatus(transaction.status);
    setNewTransDesc(transaction.description);
    setNewTransValue(transaction.amount.toString());
    setNewTransDate(transaction.date);
    setIsFinanceModalOpen(true);
  };

  const handleToggleTransactionStatus = async (id: number) => {
    const transaction = transactions.find(t => t.id == id);
    if (!transaction) return;

    const newStatus = transaction.status === 'completed' ? 'pending' : 'completed';
    
    const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
    if (error) {
      console.error('Erro ao alternar status da transação:', error);
      alert(`Erro ao atualizar status da transação: ${error.message}`);
      return;
    }

    setTransactions(transactions.map((t: any) => {
      if (t.id == id) {
        // Se a transação for de um aluno, sincroniza o status do aluno também
        if (t.studentId) {
          const studentStatus = newStatus === 'completed' ? 'Em dia' : 'Pendente';
          supabase.from('students').update({ status: studentStatus }).eq('id', t.studentId);
          setStudents(prevStudents => prevStudents.map(s => 
            s.id == t.studentId ? { ...s, status: studentStatus } : s
          ));
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const handleDeleteTransaction = async (id: number) => {
    if (window.confirm('Excluir esta transação?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) {
        console.error('Erro ao excluir transação:', error);
        alert(`Erro ao excluir transação: ${error.message}`);
        return;
      }
      setTransactions(transactions.filter((t: any) => t.id != id));
    }
  };

  // Get days of the current week
  const getWeekDays = () => {
    const days = [];
    const tempDate = new Date(currentWeekStart);
    for (let i = 0; i < 6; i++) {
      days.push({
        day: tempDate.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', ''),
        date: tempDate.getDate().toString(),
        fullDate: tempDate.toISOString().split('T')[0]
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Dynamic Frequency Data based on Agenda and Filter
  const frequencyData = useMemo(() => {
    return weekDays.map(day => {
      let count = 0;
      
      // Search all slots for this specific day
      Object.entries(agendaEvents).forEach(([key, slot]) => {
        if (key.startsWith(day.fullDate)) {
          slot.modalities.forEach(modalitySlot => {
            modalitySlot.bookings.forEach(booking => {
              if (dashboardPlanFilter === 'Todos') {
                count++;
              } else {
                // Normaliza para comparação (case insensitive e trim)
                const normalizedFilter = dashboardPlanFilter.toLowerCase().trim();
                
                // Busca o aluno para verificar o plano
                const student = students.find((s: any) => 
                  s.name.toLowerCase().trim() === booking.studentName.toLowerCase().trim()
                );
                
                if (student && student.plan.toLowerCase().trim() === normalizedFilter) {
                  count++;
                }
              }
            });
          });
        }
      });

      return {
        name: day.day,
        value: count,
        plan: 'N/A'
      };
    });
  }, [weekDays, agendaEvents, dashboardPlanFilter, students]);

  // Dynamic Distribution Data (Total students per plan)
  const distributionData = useMemo(() => {
    const totalStudents = students.length;
    
    return PLAN_OPTIONS
      .filter(plan => plan !== 'Ritmos')
      .map(plan => {
        const count = students.filter((s: any) => s.plan === plan).length;
        return {
          name: plan,
          value: count,
          total: totalStudents,
          plan: plan
        };
      });
  }, [students]);

  // Attendance Ranking Data (Top students by total bookings)
  const studentAttendanceMap = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(agendaEvents).forEach(slot => {
      slot.modalities.forEach(modalitySlot => {
        modalitySlot.bookings.forEach(booking => {
          const name = booking.studentName?.trim() || '';
          if (name) {
            counts[name] = (counts[name] || 0) + 1;
          }
        });
      });
    });
    return counts;
  }, [agendaEvents]);

  // Normalized map for the student list check (handle case-insensitive matches)
  const normalizedAttendanceMap = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(studentAttendanceMap).forEach(([name, count]) => {
      counts[name.toLowerCase()] = count;
    });
    return counts;
  }, [studentAttendanceMap]);

  const attendanceRankingData = useMemo(() => {
    return Object.entries(studentAttendanceMap)
      .map(([name, value]) => {
        const student = students.find(s => s.name.toLowerCase().trim() === name.toLowerCase().trim());
        return { 
          name, 
          value, 
          plan: student?.plan || 'N/A' 
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [studentAttendanceMap, students]);

  const chartData = useMemo(() => {
    if (dashboardViewMode === 'frequencia') return frequencyData;
    if (dashboardViewMode === 'ranking') return attendanceRankingData;
    return distributionData;
  }, [dashboardViewMode, frequencyData, attendanceRankingData, distributionData]);

  // New students per month (based on enrollmentDate)
  const newStudentsChartData = useMemo(() => {
    const monthLabel = (year: number, monthIndex0: number) =>
      new Date(year, monthIndex0, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

    const byMonth = new Map<string, { year: number; month0: number; total: number }>();

    // Build last 6 months skeleton
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth.set(key, { year: d.getFullYear(), month0: d.getMonth(), total: 0 });
    }

    for (const s of students) {
      if (!s.enrollmentDate) continue;
      // Parsing agnóstico ao fuso horário (AAAA-MM-DD)
      const parts = s.enrollmentDate.split('-');
      if (parts.length < 2) continue;
      const key = `${parts[0]}-${parts[1]}`;
      
      const entry = byMonth.get(key);
      if (entry) entry.total += 1;
    }

    return Array.from(byMonth.values())
      .sort((a, b) => (a.year - b.year) || (a.month0 - b.month0))
      .map(m => ({ name: monthLabel(m.year, m.month0), total: m.total }));
  }, [students]);

  // Cancelled students per month (based on cancelledAt)
  const cancelledStudentsChartData = useMemo(() => {
    const monthLabel = (year: number, monthIndex0: number) =>
      new Date(year, monthIndex0, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

    const byMonth = new Map<string, { year: number; month0: number; total: number }>();

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth.set(key, { year: d.getFullYear(), month0: d.getMonth(), total: 0 });
    }

    for (const s of students) {
      if (s.status !== 'Cancelado' || !s.cancelledAt) continue;
      const parts = s.cancelledAt.split('-');
      if (parts.length < 2) continue;
      const key = `${parts[0]}-${parts[1]}`;
      
      const entry = byMonth.get(key);
      if (entry) entry.total += 1;
    }

    return Array.from(byMonth.values())
      .sort((a, b) => (a.year - b.year) || (a.month0 - b.month0))
      .map(m => ({ name: monthLabel(m.year, m.month0), total: m.total }));
  }, [students]);

  const birthdayStudents = useMemo(() => {
    const today = new Date();
    // Obtemos o mês e dia atual no formato "MM-DD" para comparação direta
    const todayMMDD = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    return students.filter((s: any) => {
      if (!s.birthDate) return false;
      // bDate será algo como "1990-03-11"
      // Pegamos apenas o "03-11" (substring de 5 em diante)
      const bMMDD = s.birthDate.substring(5);
      return bMMDD === todayMMDD;
    });
  }, [students]);

  const handleAddOrUpdateStudent = async () => {
    if (!newStudentName.trim()) return;
    
    const studentId = editingStudent ? editingStudent.id : Date.now();
    const amount = parseFloat(newStudentValue) || 0;
    
    const studentDataDB = {
      id: studentId,
      name: newStudentName,
      plan: selectedPlan,
      status: selectedPayment,
      value: amount,
      preferred_time: preferredTime,
      preferred_modality: preferredModality,
      enrollment_date: enrollmentDate,
      preferred_due_day: preferredDueDay,
      birth_date: birthDate || null,
      phone: phone,
      photo_url: newStudentPhotoUrl || null
    };

    const studentDataUI = {
      id: studentId,
      name: newStudentName,
      plan: selectedPlan,
      status: selectedPayment,
      value: amount,
      preferredTime: preferredTime,
      preferredModality: preferredModality,
      enrollmentDate: enrollmentDate,
      preferredDueDay: preferredDueDay,
      birthDate: birthDate,
      phone: phone,
      photoUrl: newStudentPhotoUrl || '',
      lastCheckin: editingStudent ? editingStudent.lastCheckin : 'Nunca'
    };

    if (editingStudent) {
      const { error } = await supabase.from('students').update(studentDataDB).eq('id', studentId);
      if (error) {
        console.error('Erro ao atualizar aluno:', error);
        alert('Erro ao atualizar aluno no banco de dados. Verifique sua conexão.');
        return;
      }

      setStudents(prevStudents => prevStudents.map(s => s.id == studentId ? { ...s, ...studentDataUI } : s));

      // Atualiza transação se existir
      const transData = {
        description: `Mensalidade ${newStudentName}`,
        amount: amount,
        status: selectedPayment === 'Em dia' ? 'completed' : 'pending'
      };
      await supabase.from('transactions').update(transData).eq('student_id', studentId);
      setTransactions(prevTransactions => prevTransactions.map((t: any) => 
        t.studentId == studentId ? { ...t, ...transData } : t
      ));
    } else {
      const { error } = await supabase.from('students').insert([studentDataDB]);
      if (error) {
        console.error('Erro ao inserir aluno:', error);
        alert(`Erro ao salvar aluno: ${error.message || 'Erro desconhecido'}`);
        return;
      }

      setStudents(prevStudents => [studentDataUI, ...prevStudents]);

      // Cria transação automática
      const newTrans = {
        id: Date.now() + 1,
        student_id: studentId,
        description: `Mensalidade ${newStudentName}`,
        amount: amount,
        type: 'in',
        status: selectedPayment === 'Em dia' ? 'completed' : 'pending',
        date: new Date().toISOString().split('T')[0]
      };
      
      const { error: transError } = await supabase.from('transactions').insert([newTrans]);
      if (transError) {
        console.error('Erro ao criar transação inicial:', transError);
      }

      const newTransUI = {
        id: newTrans.id,
        studentId: studentId,
        description: newTrans.description,
        amount: newTrans.amount,
        type: newTrans.type,
        status: newTrans.status,
        date: newTrans.date
      };
      setTransactions(prevTransactions => [newTransUI, ...prevTransactions]);
    }

    setNewStudentName('');
    setNewStudentValue('');
    setPreferredTime('');
    setPreferredModality('');
    setEnrollmentDate(new Date().toISOString().split('T')[0]);
    setPreferredDueDay('10');
    setBirthDate('');
    setPhone('');
    setNewStudentPhotoUrl('');
    setEditingStudent(null);
    setIsModalOpen(false);
  };

  const handleAddOrUpdateExperimental = async () => {
    if (!newStudentName.trim()) return;
    
    const studentId = editingExperimental ? editingExperimental.id : Date.now();
    
    const experimentalDataDB = {
      id: studentId,
      name: newStudentName,
      preferred_time: preferredTime,
      preferred_modality: preferredModality,
      enrollment_date: enrollmentDate,
      birth_date: birthDate || null,
      phone: phone,
      status: 'Experimental',
      photo_url: newStudentPhotoUrl || null
    };

    const experimentalDataUI = {
      id: studentId,
      name: newStudentName,
      preferredTime: preferredTime,
      preferredModality: preferredModality,
      enrollmentDate: enrollmentDate,
      birthDate: birthDate,
      phone: phone,
      status: 'Experimental',
      photoUrl: newStudentPhotoUrl || ''
    };

    if (editingExperimental) {
      const { error } = await supabase.from('experimental_students').update(experimentalDataDB).eq('id', studentId);
      if (error) {
        console.error('Erro ao atualizar experimental:', error);
        alert(`Erro ao atualizar experimental: ${error.message}`);
        return;
      }
      setExperimentalStudents(prevStudents => prevStudents.map(s => s.id === studentId ? { ...s, ...experimentalDataUI } : s));
    } else {
      const { error } = await supabase.from('experimental_students').insert([experimentalDataDB]);
      if (error) {
        console.error('Erro ao inserir experimental:', error);
        alert(`Erro ao salvar experimental: ${error.message}`);
        return;
      }
      setExperimentalStudents(prevStudents => [experimentalDataUI, ...prevStudents]);
    }

    setNewStudentName('');
    setNewStudentValue('');
    setPreferredTime('');
    setPreferredModality('');
    setEnrollmentDate(new Date().toISOString().split('T')[0]);
    setPreferredDueDay('10');
    setBirthDate('');
    setPhone('');
    setNewStudentPhotoUrl('');
    setEditingExperimental(null);
    setIsExperimentalModalOpen(false);
  };

  const handleTogglePaymentStatus = async (student: any) => {
    const newStatus = student.status === 'Em dia' ? 'Pendente' : 'Em dia';
    const newTransStatus = newStatus === 'Em dia' ? 'completed' : 'pending';
    
    // Atualiza Aluno
    const { error: studentError } = await supabase.from('students').update({ status: newStatus }).eq('id', student.id);
    if (studentError) {
      console.error('Erro ao alternar status do aluno:', studentError);
      alert(`Erro ao atualizar status do aluno: ${studentError.message}`);
      return;
    }
    setStudents(students.map(s => s.id == student.id ? { ...s, status: newStatus } : s));
    
    // Atualiza Transação Vinculada
    const { error: transError } = await supabase.from('transactions').update({ status: newTransStatus }).eq('student_id', student.id);
    if (transError) {
      console.error('Erro ao atualizar transação vinculada:', transError);
    }
    
    setTransactions(transactions.map((t: any) => 
      t.studentId == student.id ? { ...t, status: newTransStatus } : t
    ));
  };

  const handleCancelStudent = async (student: any) => {
    if (window.confirm(`Deseja marcar ${student.name} como desistente? (Cancelamento de Matrícula)`)) {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('students')
        .update({ status: 'Cancelado', cancelled_at: today })
        .eq('id', student.id);
      
      if (error) {
        console.error('Erro ao cancelar aluno:', error);
        alert(`Erro ao cancelar aluno: ${error.message}`);
        return;
      }
      
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'Cancelado', cancelledAt: today } : s));
      alert('Matrícula cancelada com sucesso.');
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este aluno?')) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) {
        console.error('Erro ao excluir aluno:', error);
        return;
      }
      setStudents(students.filter(s => s.id !== id));
      // Transações serão mantidas ou deletadas dependendo da FK (no schema coloquei SET NULL)
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setNewStudentName(student.name);
    setNewStudentPhotoUrl(student.photoUrl || '');
    setSelectedPlan(student.plan);
    setSelectedPayment(student.status);
    setNewStudentValue(student.value ? student.value.toString() : '');
    setPreferredTime(student.preferredTime || '');
    setPreferredModality(student.preferredModality || '');
    setEnrollmentDate(student.enrollmentDate || new Date().toISOString().split('T')[0]);
    setPreferredDueDay(student.preferredDueDay || '10');
    setBirthDate(student.birthDate || '');
    setPhone(student.phone || '');
    setIsModalOpen(true);
  };

  const handleEditExperimental = (student: any) => {
    setEditingExperimental(student);
    setNewStudentName(student.name);
    setNewStudentValue('');
    setPreferredTime(student.preferredTime || '');
    setPreferredModality(student.preferredModality || '');
    setEnrollmentDate(student.enrollmentDate || new Date().toISOString().split('T')[0]);
    setBirthDate(student.birthDate || '');
    setPhone(student.phone || '');
    setNewStudentPhotoUrl(student.photoUrl || '');
    setIsExperimentalModalOpen(true);
  };

  const handleToggleModality = (time: string, modality: string) => {
    const key = `${selectedAgendaDate}-${time}`;
    const currentSlot = agendaEvents[key] || { modalities: [] };
    
    const exists = currentSlot.modalities.find(m => m.modality === modality);
    let newModalities;
    
    if (exists) {
      newModalities = currentSlot.modalities.filter(m => m.modality !== modality);
      if (selectedBookingModality === modality) setSelectedBookingModality('');
    } else {
      newModalities = [...currentSlot.modalities, { modality, bookings: [] }];
      setSelectedBookingModality(modality);
    }

    setAgendaEvents({
      ...agendaEvents,
      [key]: { ...currentSlot, modalities: newModalities }
    });
  };

  const handleAddBooking = async (studentName: string, experimental: boolean) => {
    if (!selectedBookingModality) return;
    const slotKey = `${selectedAgendaDate}-${selectedTimeSlot}`;
    const bookingId = Date.now().toString();
    
    const newBooking = {
      id: bookingId,
      slot_key: slotKey,
      modality: selectedBookingModality,
      student_name: studentName,
      is_experimental: experimental
    };

    const { error } = await supabase.from('agenda_bookings').insert([newBooking]);
    if (error) {
      console.error('Erro ao adicionar agendamento:', error);
      return;
    }

    setAgendaEvents(prev => {
      const currentSlot = prev[slotKey] || { modalities: [] };
      let modSlot = currentSlot.modalities.find(m => m.modality === selectedBookingModality);
      
      let newModalities;
      if (modSlot) {
        newModalities = currentSlot.modalities.map(m => 
          m.modality === selectedBookingModality 
            ? { ...m, bookings: [...m.bookings, { id: bookingId, studentName, isExperimental: experimental }] }
            : m
        );
      } else {
        newModalities = [...currentSlot.modalities, { 
          modality: selectedBookingModality, 
          bookings: [{ id: bookingId, studentName, isExperimental: experimental }] 
        }];
      }

      return {
        ...prev,
        [slotKey]: { ...currentSlot, modalities: newModalities }
      };
    });

    setBookingSearchTerm('');
    setIsExperimental(false);
  };

  const handleRemoveBooking = async (modality: string, bookingId: string) => {
    const slotKey = `${selectedAgendaDate}-${selectedTimeSlot}`;
    
    const { error } = await supabase.from('agenda_bookings').delete().eq('id', bookingId);
    if (error) {
      console.error('Erro ao remover agendamento:', error);
      return;
    }

    setAgendaEvents(prev => {
      const currentSlot = prev[slotKey];
      if (!currentSlot) return prev;
      
      const newModalities = currentSlot.modalities.map(m => {
        if (m.modality === modality) {
          return {
            ...m,
            bookings: m.bookings.filter(b => b.id !== bookingId)
          };
        }
        return m;
      }).filter(m => m.bookings.length > 0 || m.modality === selectedBookingModality); // Mantém se tiver bookings ou for a selecionada

      return {
        ...prev,
        [slotKey]: { ...currentSlot, modalities: newModalities }
      };
    });
  };

  const handleOpenCheckin = () => {
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, '0') + ':00';
    const today = now.toISOString().split('T')[0];
    
    setSelectedAgendaDate(today);
    setSelectedTimeSlot(hour);
    setIsAgendaModalOpen(true);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const filteredTrans = transactions.filter((t: any) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === reportMonth && d.getFullYear() === reportYear;
      });

      const filteredNewStudents = students.filter((s: any) => {
        if (!s.enrollmentDate) return false;
        const d = new Date(s.enrollmentDate);
        return d.getMonth() + 1 === reportMonth && d.getFullYear() === reportYear;
      });

      let inTotal = 0, outTotal = 0;
      filteredTrans.forEach((t: any) => {
        if (t.type === 'in' && t.status === 'completed') inTotal += Number(t.amount);
        if (t.type === 'out' && t.status === 'completed') outTotal += Number(t.amount);
      });
      const balance = inTotal - outTotal;

      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text(`Relatório Mensal - ${String(reportMonth).padStart(2, '0')}/${reportYear}`, 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Total de Receitas (Concluidas): R$ ${inTotal.toFixed(2)}`, 14, 32);
      doc.text(`Total de Despesas (Concluidas): R$ ${outTotal.toFixed(2)}`, 14, 40);
      doc.text(`Saldo Final: R$ ${balance.toFixed(2)}`, 14, 48);
      doc.text(`Novos Alunos no Mes: ${filteredNewStudents.length}`, 14, 56);

      const tableData = filteredTrans.map((t: any) => [
        formatDisplayDate(t.date),
        t.description,
        t.type === 'in' ? 'Receita' : 'Despesa',
        t.status === 'completed' ? 'Concluido' : 'Pendente',
        `R$ ${Number(t.amount).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 64,
        head: [['Data', 'Descricao', 'Tipo', 'Status', 'Valor']],
        body: tableData,
      });

      const pdfBlob = doc.output('blob');
      const fileName = `relatorio-${reportYear}-${reportMonth}-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf'
        });

      if (uploadError) {
        const errorMsg = uploadError.message.toLowerCase();
        if (errorMsg.includes('bucket not found') || errorMsg.includes('bucket_not_found')) {
           alert('O bucket "reports" não foi encontrado no Supabase Storage. O PDF será baixado localmente para o seu computador agora.');
           doc.save(fileName);
           setIsGeneratingReport(false);
           return;
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('monthly_reports').insert([{
        month: reportMonth,
        year: reportYear,
        file_url: publicUrl
      }]);

      if (dbError) throw dbError;

      // Force refresh data
      await fetchData();

      alert('Relatório gerado e salvo com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório: ' + error.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const BackgroundBlobs = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [0, 40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/[0.05] blur-[120px] rounded-full"
      />
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 80, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/[0.03] blur-[100px] rounded-full"
      />
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-amber-400/[0.02] blur-[80px] rounded-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e5e7eb] font-sans relative overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      <BackgroundBlobs />
      
      {/* Desktop Sidebar */}
      {session && view !== 'public_agenda' && view !== 'login' && (
        <aside className="fixed left-0 top-0 h-full w-24 hidden lg:flex flex-col items-center py-10 glass-card border-r border-white/[0.05] z-50 rounded-none">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-12">
            <Dumbbell size={24} className="text-black" strokeWidth={2.5} />
          </div>
          
          <nav className="flex flex-col gap-8 w-full px-4">
            <NavItem id="home" icon={LayoutDashboard} label="Home" active={view === 'home'} onClick={() => setView('home')} />
            <NavItem id="alunos" icon={Users} label="Alunos" active={view === 'alunos'} onClick={() => setView('alunos')} />
            <NavItem id="experimentais" icon={Zap} label="Leads" active={view === 'experimentais'} onClick={() => setView('experimentais')} />
            <NavItem id="agenda" icon={CalendarDays} label="Agenda" active={view === 'agenda'} onClick={() => setView('agenda')} />
            <NavItem id="financeiro" icon={Wallet} label="Caixa" active={view === 'financeiro'} onClick={() => setView('financeiro')} />
            <div className="mt-4 pt-6 border-t border-white/10 w-full flex justify-center">
              <button onClick={handleLogout} className="text-neutral-500 hover:text-rose-500 transition-colors p-3 rounded-xl hover:bg-rose-500/10">
                <LogOut size={20} />
              </button>
            </div>
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <div className={cn("relative z-10 w-full", session && view !== 'public_agenda' && view !== 'login' ? "lg:pl-24" : "")}>
        {/* Top Header */}
        {session && view !== 'public_agenda' && view !== 'login' && (
          <header className="border-b border-white/[0.03] backdrop-blur-md sticky top-0 z-[40]">
            <div className="px-4 lg:px-12 py-8 flex items-center justify-between max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-4">
                <div className="lg:hidden w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Dumbbell size={20} className="text-black" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em] mb-0.5">Gestão Fitness</p>
                  <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">K<span className="text-amber-500">Z</span></h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-3 glass-card rounded-2xl text-neutral-400 hover:text-amber-500 transition-all group lg:hidden">
                  <Menu size={20} className="group-hover:scale-110 transition-transform" />
                </button>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 glass-card rounded-full text-[11px] font-bold text-amber-500/80 uppercase tracking-widest border border-amber-500/20">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  Sistema Ativo
                </div>
                <button onClick={handleLogout} className="p-3 glass-card rounded-2xl text-neutral-400 hover:text-rose-500 transition-all group lg:hidden ml-2 border border-white/5">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </header>
        )}

        <main className={cn(
          "px-4 py-8 mx-auto w-full", 
          session && view !== 'public_agenda' && view !== 'login' 
            ? "lg:px-12 max-w-7xl" 
            : (view === 'agenda' ? "max-w-3xl" : "max-w-xl flex-1 flex flex-col justify-center min-h-[80vh]")
        )}>

        <AnimatePresence mode="wait">
          {view === 'login' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-sm mx-auto flex flex-col items-center justify-center mt-10"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] mb-8">
                <Dumbbell size={32} className="text-black" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-8">Gestão <span className="text-amber-500">KZ</span></h2>
              <form onSubmit={handleLogin} className="w-full glass-card-premium p-8 rounded-[2rem] space-y-6">
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Email</label>
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white placeholder:text-neutral-700" 
                    placeholder="email@gestaokz.com"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Senha</label>
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white placeholder:text-neutral-700" 
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" disabled={authLoading} className="w-full bg-amber-500 text-black py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-amber-400 transition-colors mt-4">
                  {authLoading ? 'Entrando...' : 'Acessar'}
                </button>
              </form>
              <button 
                type="button" 
                onClick={() => setView('public_agenda')} 
                className="mt-8 text-[11px] font-bold text-neutral-500 hover:text-amber-500 tracking-widest uppercase transition-colors"
              >
                Ir para Agendamentos
              </button>
            </motion.div>
          )}

          {view === 'public_agenda' && (
            <motion.div 
              key="p_agenda"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full min-h-[70vh] flex flex-col items-center mt-10"
            >
              <div className="flex items-center justify-center gap-6 mb-16">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)]">
                  <Dumbbell size={48} className="text-black" strokeWidth={2.5} />
                </div>
                <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic flex items-center">
                  K<span className="text-amber-500">Z</span>
                </h1>
              </div>

              <button 
                onClick={() => setView('agenda')} 
                className="bg-amber-500 text-black px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-[0.2em] hover:bg-amber-400 active:scale-95 transition-all shadow-[0_15px_40px_rgba(245,158,11,0.3)]"
              >
                Marque sua Aula
              </button>
              
              {!session && (
              <button 
                type="button"
                onClick={() => setView('login')}
                className="fixed bottom-6 right-6 text-[10px] text-neutral-700 hover:text-neutral-500 transition-colors uppercase font-bold tracking-widest"
              >
                Admin
              </button>
              )}
            </motion.div>
          )}
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Main Dashboard Chart Section */}
              <section className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      <button
                        onClick={() => setDashboardViewMode('distribuicao')}
                        className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all border whitespace-nowrap",
                          dashboardViewMode === 'distribuicao' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 text-glow-gold" : "text-neutral-500 border-transparent hover:text-neutral-400"
                        )}
                      >
                        Distribuição
                      </button>
                      <button
                        onClick={() => setDashboardViewMode('frequencia')}
                        className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all border whitespace-nowrap",
                          dashboardViewMode === 'frequencia' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 text-glow-gold" : "text-neutral-500 border-transparent hover:text-neutral-400"
                        )}
                      >
                        Frequência
                      </button>
                      <button
                        onClick={() => setDashboardViewMode('ranking')}
                        className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all border whitespace-nowrap",
                          dashboardViewMode === 'ranking' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 text-glow-gold" : "text-neutral-500 border-transparent hover:text-neutral-400"
                        )}
                      >
                        Ranking
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {dashboardViewMode === 'ranking' && (
                        <div className="flex items-center gap-4 pr-2">
                           <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                             <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Normal</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                             <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Wellhub</span>
                           </div>
                        </div>
                      )}
                      {dashboardViewMode === 'frequencia' ? (
                        ['Todos', ...PLAN_OPTIONS].map((plan) => (
                          <button
                            key={plan}
                            onClick={() => setDashboardPlanFilter(plan)}
                            className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border",
                              dashboardPlanFilter === plan 
                                ? (plan === 'Wellhub' ? "bg-rose-500/20 text-rose-500 border-rose-500/30" : "bg-amber-500/20 text-amber-500 border-amber-500/30") 
                                : "bg-white/[0.02] text-neutral-600 border-white/[0.05] hover:border-white/10"
                            )}
                          >
                            {plan}
                          </button>
                        ))
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.05]">
                            Total: <span className="text-amber-500">{students.length}</span> Alunos
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="self-end lg:self-center p-3 glass-card rounded-2xl text-neutral-600 hover:text-amber-500 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <div className="relative group/chart">
                  {dashboardViewMode === 'ranking' && chartData.length > 5 && (
                    <>
                      <button 
                        onClick={() => {
                          const container = document.getElementById('chart-scroll-container');
                          if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                        }}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 glass-card rounded-full flex items-center justify-center text-white opacity-0 group-hover/chart:opacity-100 transition-all hover:border-amber-500/40 shadow-2xl"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          const container = document.getElementById('chart-scroll-container');
                          if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                        }}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 glass-card rounded-full flex items-center justify-center text-white opacity-0 group-hover/chart:opacity-100 transition-all hover:border-amber-500/40 shadow-2xl"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                  
                  <div 
                    id="chart-scroll-container"
                    className={cn(
                      "h-[280px] w-full",
                      dashboardViewMode === 'ranking' ? "overflow-x-auto overflow-y-hidden no-scrollbar" : "overflow-hidden"
                    )}
                  >
                    <div style={{ 
                      width: dashboardViewMode === 'ranking' ? `${Math.max(100, chartData.length * 80)}px` : '100%',
                      height: '100%' 
                    }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={chartData} 
                          margin={{ top: 20, right: 30, left: -40, bottom: 40 }}
                        >
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={dashboardViewMode !== 'frequencia' || dashboardPlanFilter === 'Todos' ? { fontSize: 9, fill: '#525252', fontWeight: 800, style: { textTransform: 'uppercase', letterSpacing: '0.1em' } } : false} 
                            dy={15}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis hide />
                          <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            contentStyle={{ 
                              background: 'rgba(10, 10, 11, 0.8)', 
                              backdropFilter: 'blur(16px)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '1.25rem',
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                              padding: '12px 16px'
                            }}
                            itemStyle={{ color: '#fff', fontSize: 13, fontWeight: 700 }}
                            labelStyle={{ color: '#fbbf24', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}
                          />
                          <Bar 
                            dataKey="value" 
                            radius={[10, 10, 10, 10]} 
                            barSize={32}
                            animationDuration={2000}
                          >
                            <LabelList 
                              dataKey="value" 
                              position="top" 
                              content={(props: any) => {
                                const { x, y, width, value } = props;
                                if (value === 0) return null;
                                return (
                                  <text 
                                    x={x + width / 2} 
                                    y={y - 12} 
                                    fill={((chartData as any[])[props.index])?.plan === 'Wellhub' ? '#f43f5e' : '#fbbf24'} 
                                    fontSize={12} 
                                    fontWeight={800} 
                                    textAnchor="middle"
                                    className="drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                  >
                                    {value}
                                  </text>
                                );
                              }}
                            />
                            {chartData.map((entry: any, index: number) => {
                              const isWellhub = entry.plan === 'Wellhub';
                              const isTop = index === 0 && dashboardViewMode === 'ranking';
                              return (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={isWellhub ? '#f43f5e' : (isTop ? '#fbbf24' : 'rgba(255,255,255,0.05)')} 
                                  className={cn(
                                    "transition-all duration-700",
                                    isWellhub && "drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]",
                                    isTop && "drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                                  )}
                                />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                  title="Receita" 
                  value={totalInCompleted} 
                  trend={`${totalInPending > 0 ? `+ R$ ${totalInPending.toLocaleString('pt-BR')} previsto` : ''}`} 
                  isCurrency 
                  type="success" 
                />
                <StatCard 
                  title="Despesa" 
                  value={totalOutCompleted} 
                  trend={`${totalOutPending > 0 ? `+ R$ ${totalOutPending.toLocaleString('pt-BR')} previsto` : ''}`} 
                  isCurrency 
                  type="danger" 
                />
                <StatCard 
                  title="Saldo" 
                  value={totalProfit} 
                  trend={totalProfit >= 0 ? "Saldo Positivo" : "Saldo Negativo"} 
                  isCurrency 
                  type="info" 
                />
              </section>

              <section className="flex justify-end">
                <button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-500 transition-all rounded-2xl font-bold text-sm tracking-widest uppercase text-neutral-400"
                >
                  <FileText size={18} />
                  Relatórios
                </button>
              </section>

              {/* New Students Monthly Chart */}
              <section className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-1.5">Crescimento Mensal</p>
                    <h2 className="text-white font-black text-2xl tracking-tight leading-none">
                      Novos Alunos
                      <span className="ml-3 text-amber-500 text-glow-gold">
                        {newStudentsChartData.at(-1)?.total ?? 0}
                      </span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2.5 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20">
                    <UserPlus size={14} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                      {students.filter(s => s.status !== 'Cancelado').length} Ativos
                    </span>
                  </div>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={newStudentsChartData} margin={{ top: 20, right: 0, left: -40, bottom: 0 }}>
                      <defs>
                        <linearGradient id="newStudentsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#525252', fontWeight: 800 }}
                        dy={10}
                      />
                      <YAxis hide allowDecimals={false} />
                      <Tooltip
                        cursor={{ stroke: '#fbbf24', strokeWidth: 1.5, strokeDasharray: '6 6' }}
                        contentStyle={{
                          background: 'rgba(10, 10, 11, 0.8)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '1.25rem',
                          padding: '12px 16px',
                          color: '#fff'
                        }}
                        formatter={(value: any) => [`${value} aluno${value !== 1 ? 's' : ''}`, 'Matrículas']}
                        labelStyle={{ color: '#fbbf24', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#fbbf24"
                        strokeWidth={3}
                        fill="url(#newStudentsGrad)"
                        dot={{ fill: '#fbbf24', r: 5, strokeWidth: 0 }}
                        activeDot={{ fill: '#fbbf24', r: 8, strokeWidth: 3, stroke: '#0a0a0b' }}
                        animationDuration={2500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Cancelled Students Monthly Chart */}
              <section className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-1.5">Desistências / Saídas</p>
                    <h2 className="text-white font-black text-2xl tracking-tight leading-none">
                      Cancelamentos
                      <span className="ml-3 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                        {cancelledStudentsChartData.at(-1)?.total ?? 0}
                      </span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2.5 bg-rose-500/10 px-4 py-2 rounded-2xl border border-rose-500/20">
                    <LogOut size={14} className="text-rose-500" />
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                      {students.filter(s => s.status === 'Cancelado').length} Inativos
                    </span>
                  </div>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cancelledStudentsChartData} margin={{ top: 20, right: 0, left: -40, bottom: 0 }}>
                      <defs>
                        <linearGradient id="cancelledStudentsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#525252', fontWeight: 800 }}
                        dy={10}
                      />
                      <YAxis hide allowDecimals={false} />
                      <Tooltip
                        cursor={{ stroke: '#f43f5e', strokeWidth: 1.5, strokeDasharray: '6 6' }}
                        contentStyle={{
                          background: 'rgba(10, 10, 11, 0.8)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '1.25rem',
                          padding: '12px 16px',
                          color: '#fff'
                        }}
                        formatter={(value: any) => [`${value} aluno${value !== 1 ? 's' : ''}`, 'Saídas']}
                        labelStyle={{ color: '#f43f5e', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        fill="url(#cancelledStudentsGrad)"
                        dot={{ fill: '#f43f5e', r: 5, strokeWidth: 0 }}
                        activeDot={{ fill: '#f43f5e', r: 8, strokeWidth: 3, stroke: '#0a0a0b' }}
                        animationDuration={2500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Quick Actions (Ações) */}
              <section className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em]">Ações Rápidas</h2>
                  {birthdayStudents.length > 0 && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/20"
                    >
                      <Cake size={14} className="text-rose-500" />
                      <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Aniversariantes!</span>
                    </motion.div>
                  )}
                </div>

                {birthdayStudents.length > 0 && (
                  <div className="mb-8 space-y-3">
                    {birthdayStudents.map((s: any) => (
                      <div key={s.id} className="bg-gradient-to-r from-rose-500/10 to-transparent p-5 rounded-2xl border border-rose-500/10 flex items-center justify-between group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 blur-2xl rounded-full -mr-8 -mt-8" />
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                            <Cake size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] mb-0.5">Parabéns!</p>
                            <p className="text-base font-bold text-white">{s.name}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const text = `Parabéns ${s.name}! Feliz aniversário de toda a equipe Kross Zone! 🎂💪`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="bg-rose-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 transition-all relative z-10"
                        >
                          Parabenizar
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <ActionButton label="Novo Aluno" primary onClick={() => { setEditingStudent(null); setNewStudentName(''); setSelectedPlan('K1'); setSelectedPayment('Em dia'); setView('alunos'); setIsModalOpen(true); }} />
                  <ActionButton label="Nova Experimental" primary onClick={() => { setEditingExperimental(null); setNewStudentName(''); setView('experimentais'); setIsExperimentalModalOpen(true); }} />
                  <ActionButton label="Check-in" onClick={handleOpenCheckin} />
                  <ActionButton label="Lançamento" onClick={() => { setView('financeiro'); setIsFinanceModalOpen(true); setNewTransType('in'); }} />
                </div>
              </section>
            </motion.div>
          )}

          {view === 'experimentais' && (
            <motion.div 
              key="experimentais"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic">Aulas <span className="text-amber-500">Experimentais</span></h2>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Gerencie leads e novos interessados</p>
                </div>
                <button 
                  onClick={() => { setEditingExperimental(null); setNewStudentName(''); setView('experimentais'); setIsExperimentalModalOpen(true); }}
                  className="w-12 h-12 bg-amber-500 text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all hover:bg-amber-400"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Pesquisar experimental..." 
                  className="w-full glass-card rounded-[2rem] py-5 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-amber-500/50 transition-all text-white placeholder:text-neutral-600 shadow-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Experimental List */}
              <div className="space-y-4 pb-24">
                {filteredExperimental.map((s, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={s.id} 
                    className="glass-card-premium p-6 rounded-[2rem] flex items-center justify-between group hover:border-amber-500/30 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="relative w-14 h-14 flex-shrink-0">
                        <div className="w-full h-full bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center text-amber-500">
                          <Zap size={24} className="text-glow-gold" />
                        </div>
                        {(() => {
                          const count = normalizedAttendanceMap[s.name.toLowerCase().trim()] || 0;
                          return count > 0 && (
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0a0a0b] shadow-[0_0_10px_rgba(245,158,11,0.5)] z-10">
                              {count}
                            </div>
                          );
                        })()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-white mb-1 group-hover:text-amber-50 transition-colors">{s.name}</p>
                        <div className="flex flex-wrap gap-3 mb-2">
                          {s.enrollmentDate && (
                            <div className="flex items-center gap-1.5 opacity-60">
                              <Calendar size={10} className="text-amber-500" />
                              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                                {formatDisplayDate(s.enrollmentDate)}
                              </span>
                            </div>
                          )}
                          {s.birthDate && (
                            <div className="flex items-center gap-1.5 opacity-60">
                              <Cake size={10} className="text-rose-500" />
                              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                                Nasc: {formatDisplayDate(s.birthDate)}
                              </span>
                            </div>
                          )}
                          {s.phone && (
                            <button 
                              onClick={() => {
                                const cleanPhone = s.phone.replace(/\D/g, '');
                                window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                              }}
                              className="text-[9px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-1.5 hover:text-amber-400 transition-colors bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10"
                            >
                              <CheckCircle2 size={10} />
                              {s.phone}
                            </button>
                          )}
                        </div>
                        {(s.preferredTime || s.preferredModality) && (
                          <div className="flex gap-2">
                            {s.preferredTime && (
                              <span className="text-[9px] bg-white/[0.03] text-neutral-400 px-3 py-1 rounded-full border border-white/[0.05] font-bold">
                                {s.preferredTime}
                              </span>
                            )}
                            {s.preferredModality && (
                              <span className="text-[9px] bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 uppercase font-black tracking-widest text-glow-gold">
                                {s.preferredModality}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                      <button 
                        onClick={() => {
                          if (window.confirm('Converter este experimental em aluno regular?')) {
                            const newStudent = {
                              ...s,
                              status: 'Em dia',
                              plan: 'K1',
                              value: 0
                            };
                            setStudents([newStudent, ...students]);
                            setExperimentalStudents(experimentalStudents.filter(ex => ex.id !== s.id));
                          }
                        }}
                        className="w-10 h-10 flex items-center justify-center text-amber-500 bg-amber-500/5 border border-amber-500/10 rounded-xl hover:bg-amber-500 hover:text-black transition-all"
                        title="Converter em Aluno"
                      >
                        <UserPlus size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditExperimental(s)}
                        className="w-10 h-10 flex items-center justify-center text-neutral-500 bg-white/[0.03] border border-white/[0.05] rounded-xl hover:text-white hover:bg-white/[0.08] transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Excluir este aluno experimental?')) {
                            setExperimentalStudents(experimentalStudents.filter(ex => ex.id !== s.id));
                          }
                        }}
                        className="w-10 h-10 flex items-center justify-center text-rose-500/50 bg-rose-500/5 border border-rose-500/10 rounded-xl hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {filteredExperimental.length === 0 && (
                  <div className="text-center py-24 opacity-20">
                    <Zap size={48} className="mx-auto mb-4 text-amber-500" />
                    <p className="text-xs font-bold uppercase tracking-[0.3em]">Nenhum registro encontrado</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {view === 'alunos' && (
            <motion.div 
              key="alunos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic">Lista de <span className="text-amber-500">Alunos</span></h2>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Gerencie sua base de membros ativos</p>
                </div>
                <button 
                  onClick={() => { setEditingStudent(null); setNewStudentName(''); setSelectedPlan('K1'); setSelectedPayment('Em dia'); setIsModalOpen(true); }}
                  className="w-12 h-12 bg-amber-500 text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all hover:bg-amber-400"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome ou plano..." 
                  className="w-full glass-card rounded-[2rem] py-5 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-amber-500/50 transition-all text-white placeholder:text-neutral-600 shadow-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Student Status Cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'ativos', label: 'Ativos', value: students.filter(s => s.status !== 'Cancelado').length.toString(), color: 'text-white', glow: 'bg-white/10' },
                  { id: 'em_dia', label: 'Em Dia', value: students.filter(s => s.status === 'Em dia').length.toString(), color: 'text-amber-500', glow: 'bg-amber-500/10' },
                  { id: 'atrasados', label: 'Atrasos', value: students.filter(s => s.status === 'Pendente').length.toString(), color: 'text-rose-500', glow: 'bg-rose-500/10' },
                ].map((stat) => (
                  <button 
                    key={stat.id} 
                    onClick={() => setStatusFilter(stat.id as any)}
                    className={cn(
                      "glass-card p-5 rounded-[2rem] text-center relative overflow-hidden group/stat transition-all duration-300 border",
                      statusFilter === stat.id ? "border-white/30 scale-[1.02] shadow-[0_10px_30px_rgba(255,255,255,0.05)]" : "border-white/[0.05] hover:border-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute inset-0 transition-opacity duration-500", 
                      statusFilter === stat.id ? "opacity-100" : "opacity-0 group-hover/stat:opacity-100",
                      stat.glow
                    )} />
                    <p className={cn("text-2xl font-black mb-1 relative z-10", stat.color, statusFilter === stat.id && "drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]")}>{stat.value}</p>
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em] relative z-10">{stat.label}</p>
                  </button>
                ))}
              </div>

              {/* Students List */}
              <div className="space-y-4 pb-24">
                {filteredStudents.map((s, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={s.id} 
                    className="glass-card-premium p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-amber-500/30 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-5 relative z-10">
                      {s.photoUrl ? (
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <div className="w-full h-full rounded-[1.5rem] overflow-hidden border-2 border-white/[0.08] group-hover:border-amber-500/30 transition-colors bg-[#1A1A1A] p-0.5">
                            <img 
                              src={s.photoUrl} 
                              alt={s.name} 
                              className="w-full h-full object-cover rounded-[1.25rem]"
                            />
                          </div>
                          {(() => {
                            const count = normalizedAttendanceMap[s.name.toLowerCase().trim()] || 0;
                            return count > 0 && (
                              <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0a0a0b] shadow-[0_0_10px_rgba(245,158,11,0.5)] z-10">
                                {count}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.08] group-hover:border-amber-500/20 rounded-[1.5rem] flex items-center justify-center text-neutral-500 flex-shrink-0 relative transition-all">
                          <Users size={24} />
                          {(() => {
                            const count = normalizedAttendanceMap[s.name.toLowerCase().trim()] || 0;
                            return count > 0 && (
                              <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0a0a0b] shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                                {count}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-base font-bold text-white mb-1 group-hover:text-amber-50 transition-colors">{s.name}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn(
                            "text-[10px] font-bold px-2.5 py-0.5 rounded-full border tracking-widest",
                            s.plan === 'Wellhub' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20 text-glow-gold"
                          )}>
                            {s.plan}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-bold tracking-tight">
                            R$ {s.value?.toLocaleString('pt-BR') || '0,00'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {s.enrollmentDate && (
                            <div className="flex items-center gap-1.5 opacity-60">
                              <Calendar size={10} />
                              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                                {formatDisplayDate(s.enrollmentDate)}
                              </span>
                            </div>
                          )}
                          {s.birthDate && (
                            <div className="flex items-center gap-1.5 opacity-60">
                              <Cake size={10} className="text-rose-500" />
                              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                                Nasc: {formatDisplayDate(s.birthDate)}
                              </span>
                            </div>
                          )}
                          {s.preferredDueDay && (
                            <div className="flex items-center gap-1.5 opacity-80">
                              <Clock size={10} className="text-amber-500" />
                              <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">
                                Vencimento: {s.preferredDueDay}
                              </span>
                            </div>
                          )}
                          {s.phone && (
                            <button 
                              onClick={() => {
                                const cleanPhone = s.phone.replace(/\D/g, '');
                                window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                              }}
                              className="text-[9px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                            >
                              <CheckCircle2 size={10} />
                              WhatsApp
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 relative z-10">
                      <button 
                        onClick={() => handleTogglePaymentStatus(s)}
                        className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                          s.status === 'Em dia' ? "text-amber-500 bg-amber-500/5 border border-amber-500/20" : "text-rose-500 bg-rose-500/5 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                        )}
                        title={s.status === 'Em dia' ? 'Pendente' : 'Confirmar Pagamento'}
                      >
                        <CheckCircle2 size={20} />
                      </button>
                      <button 
                        onClick={() => handleEditStudent(s)}
                        className="w-10 h-10 flex items-center justify-center text-neutral-400 bg-white/[0.03] border border-white/[0.05] rounded-xl hover:text-white hover:bg-white/[0.08] transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleCancelStudent(s)}
                        className="w-10 h-10 flex items-center justify-center text-rose-500/50 bg-rose-500/5 border border-rose-500/10 rounded-xl hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        title="Cancelar Matrícula / Desistência"
                      >
                        <LogOut size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(s.id)}
                        className="w-10 h-10 flex items-center justify-center text-neutral-500/50 bg-white/[0.03] border border-white/[0.05] rounded-xl hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        title="Excluir Definitivamente"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'agenda' && (
            <motion.div 
              key="agenda"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic">Agenda de <span className="text-amber-500">Treinos</span></h2>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Organize as sessões e frequências</p>
                </div>
              </div>

              {/* Week Selector Section */}
              <section className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 px-2 relative z-10">
                  <button 
                    onClick={() => {
                      const newStart = new Date(currentWeekStart);
                      newStart.setDate(newStart.getDate() - 7);
                      setCurrentWeekStart(newStart);
                    }}
                    className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-amber-500 transition-colors bg-white/[0.03] rounded-xl border border-white/[0.05]"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.2em] text-glow-gold">
                    {currentWeekStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => {
                      const newStart = new Date(currentWeekStart);
                      newStart.setDate(newStart.getDate() + 7);
                      setCurrentWeekStart(newStart);
                    }}
                    className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-amber-500 transition-colors bg-white/[0.03] rounded-xl border border-white/[0.05]"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 relative z-10">
                  {weekDays.map((day) => (
                    <button 
                      key={day.fullDate}
                      onClick={() => setSelectedAgendaDate(day.fullDate)}
                      className={cn(
                        "flex flex-col items-center justify-center py-5 rounded-[1.5rem] transition-all duration-500 border",
                        selectedAgendaDate === day.fullDate 
                          ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-105 z-20" 
                          : "bg-white/[0.02] text-neutral-500 border-white/[0.05] hover:bg-white/[0.05] hover:border-amber-500/20"
                      )}
                    >
                      <span className={cn("text-[9px] font-black mb-1 uppercase tracking-widest", selectedAgendaDate === day.fullDate ? "text-black/60" : "text-neutral-500")}>
                        {day.day}
                      </span>
                      <span className="text-xl font-black">{day.date}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Time Slots List */}
              <div className="space-y-3 pb-24">
                {TIME_SLOTS.map((time, idx) => {
                  const key = `${selectedAgendaDate}-${time}`;
                  const slot = agendaEvents[key] || { modalities: [] };
                  const totalAttendees = slot.modalities.reduce((sum, m) => sum + m.bookings.length, 0);
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setSelectedTimeSlot(time);
                        setIsAgendaModalOpen(true);
                      }}
                      className="glass-card p-6 rounded-[2rem] flex flex-col gap-5 group cursor-pointer hover:border-amber-500/20 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3 text-white">
                            <Clock size={18} className="text-amber-500" />
                            <span className="text-base font-black tracking-tight">{time}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {slot.modalities.map((m, mIdx) => (
                              <div key={mIdx} className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5">
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest text-glow-gold">{m.modality}</span>
                                <span className="text-[10px] font-black text-amber-400/60 ml-1">{m.bookings.length}</span>
                              </div>
                            ))}
                            {slot.modalities.length === 0 && (
                              <span className="text-[10px] text-neutral-700 font-bold uppercase tracking-[0.3em]">Disponível</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-full border border-white/[0.05]">
                          <User size={14} className="text-neutral-500 group-hover:text-amber-500 transition-colors" />
                          <span className="text-[11px] font-black text-neutral-400">{totalAttendees}</span>
                        </div>
                      </div>

                      {/* Display Student Names */}
                      {slot.modalities.length > 0 && (
                        <div className="flex flex-wrap gap-x-5 gap-y-2 pl-8 border-l-2 border-amber-500/20 relative z-10">
                          {slot.modalities.map(m => m.bookings.map(b => (
                            <div key={b.id} className="flex items-center gap-2">
                              {b.isExperimental ? (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                  <Zap size={10} className="text-amber-500 fill-amber-500" />
                                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-tight">
                                    EXP: {b.studentName}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-neutral-500 group-hover:text-neutral-300 transition-colors">
                                  {b.studentName}
                                </span>
                              )}
                            </div>
                          )))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {view === 'financeiro' && (
            <motion.div 
              key="financeiro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic">Controle <span className="text-amber-500">Financeiro</span></h2>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Fluxo de caixa e faturamento</p>
                </div>
                <button 
                  onClick={() => { setIsFinanceModalOpen(true); setNewTransType('in'); }}
                  className="w-12 h-12 bg-amber-500 text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all hover:bg-amber-400"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-5 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="flex flex-col items-center relative z-10">
                    <span className="text-[13px] font-black text-amber-500 text-glow-gold mb-1">R$ {totalInCompleted.toLocaleString('pt-BR')}</span>
                    <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Liquidez</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 w-full flex flex-col items-center opacity-40 relative z-10">
                    <span className="text-[10px] font-bold text-amber-500/80">R$ {totalInPending.toLocaleString('pt-BR')}</span>
                    <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-tighter">Previsto</span>
                  </div>
                  <p className="absolute bottom-1 right-2 text-[6px] font-black text-neutral-700 uppercase tracking-[0.3em]">Receitas</p>
                </div>

                <div className="glass-card p-5 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="flex flex-col items-center relative z-10">
                    <span className="text-[13px] font-black text-rose-500 mb-1">R$ {totalOutCompleted.toLocaleString('pt-BR')}</span>
                    <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Realizado</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 w-full flex flex-col items-center opacity-40 relative z-10">
                    <span className="text-[10px] font-bold text-rose-400/80">R$ {totalOutPending.toLocaleString('pt-BR')}</span>
                    <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-tighter">Pendente</span>
                  </div>
                  <p className="absolute bottom-1 right-2 text-[6px] font-black text-neutral-700 uppercase tracking-[0.3em]">Despesas</p>
                </div>

                <div className="glass-card p-5 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden group border-amber-500/10">
                  <div className="absolute inset-0 bg-amber-500/[0.02]" />
                  <p className={cn("text-sm font-black mb-1 relative z-10", totalProfit >= 0 ? "text-amber-500 text-glow-gold" : "text-rose-500")}>
                    R$ {totalProfit.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest relative z-10">Saldo Real</p>
                  <div className="mt-4 text-[7px] font-bold text-neutral-500 uppercase text-center leading-tight relative z-10">
                    Projeção:<br/>
                    <span className="text-white/60">R$ {(totalProfit + totalInPending - totalOutPending).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Evolution Chart */}
              <section className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em]">Performance Financeira</h2>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      <span className="text-[9px] font-bold text-neutral-400 uppercase">Receitas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                      <span className="text-[9px] font-bold text-neutral-400 uppercase">Despesas</span>
                    </div>
                  </div>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReceitasFin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDespesasFin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fill: '#525252', fontWeight: 800 }}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(10, 10, 11, 0.9)', 
                          border: '1px solid rgba(245, 158, 11, 0.2)', 
                          borderRadius: '1.5rem',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        labelStyle={{ color: '#f59e0b', fontWeight: '900', marginBottom: '8px', fontSize: '10px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="receitas" 
                        name="Receitas"
                        stroke="#f59e0b" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorReceitasFin)" 
                        animationDuration={1500}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="despesas" 
                        name="Despesas"
                        stroke="#f43f5e" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorDespesasFin)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Expenses by Item Chart */}
              {expensesByItem.length > 0 && (
                <section className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-1.5">Controlo de Gastos</p>
                      <h2 className="text-white font-black text-2xl tracking-tight leading-none">
                        Despesas <span className="text-rose-500">por Item</span>
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 bg-rose-500/10 px-4 py-2 rounded-2xl border border-rose-500/20">
                      <ArrowDownRight size={14} className="text-rose-500" />
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                        R$ {expensesByItem.reduce((s, i) => s + i.value, 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={expensesByItem}
                        margin={{ top: 24, right: 10, left: -20, bottom: 60 }}
                      >
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 9, fill: '#525252', fontWeight: 800 }}
                          angle={-40}
                          textAnchor="end"
                          interval={0}
                          height={70}
                        />
                        <YAxis hide />
                        <Tooltip
                          cursor={{ fill: 'rgba(244,63,94,0.05)' }}
                          contentStyle={{
                            background: 'rgba(10,10,11,0.9)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(244,63,94,0.2)',
                            borderRadius: '1.25rem',
                            padding: '12px 16px'
                          }}
                          formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Total']}
                          labelStyle={{ color: '#f43f5e', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}
                          itemStyle={{ color: '#fff', fontSize: 13, fontWeight: 700 }}
                        />
                        <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={36} fill="#f43f5e" animationDuration={1500}>
                          <LabelList
                            dataKey="value"
                            position="top"
                            content={(props: any) => {
                              const { x, y, width, value } = props;
                              if (!value) return null;
                              return (
                                <text
                                  x={x + width / 2}
                                  y={y - 10}
                                  fill="#f43f5e"
                                  fontSize={10}
                                  fontWeight={800}
                                  textAnchor="middle"
                                >
                                  {Number(value).toLocaleString('pt-BR')}
                                </text>
                              );
                            }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Transaction Filters */}
              <div className="glass-card p-1.5 rounded-[1.8rem] flex gap-1 bg-white/[0.01]">
                {(['todos', 'receitas', 'despesas'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFinanceFilter(f)}
                    className={cn(
                      "flex-1 py-3.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                      financeFilter === f 
                        ? "bg-amber-500 text-black shadow-[0_5px_15px_rgba(245,158,11,0.2)]" 
                        : "text-neutral-500 hover:text-neutral-300"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Transactions List */}
              <div className="space-y-3 pb-24">
                {filteredTransactions.map((t: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    key={t.id} 
                    onClick={() => handleEditTransaction(t)}
                    className={cn(
                      "glass-card-premium p-5 rounded-[2rem] flex items-center justify-between group transition-all duration-500 cursor-pointer overflow-hidden",
                      t.status === 'pending' ? "opacity-60 border-dashed border-white/10" : "hover:border-amber-500/30"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                        t.type === 'in' ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {t.type === 'in' ? <ArrowUpRight size={22} className="text-glow-gold" /> : <ArrowDownRight size={22} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-bold text-white mb-0.5 group-hover:text-amber-50 transition-colors">{t.description}</p>
                          {t.status === 'pending' && (
                            <span className="text-[7px] font-black bg-white/5 text-neutral-500 px-2.5 py-1 rounded-full uppercase tracking-widest border border-white/[0.05]">
                              {t.type === 'in' ? 'A Receber' : 'A Pagar'}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">
                          {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "text-sm font-black tracking-tight",
                        t.type === 'in' ? "text-amber-500 text-glow-gold" : "text-rose-500"
                      )}>
                        {t.type === 'in' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {t.status === 'pending' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleToggleTransactionStatus(t.id); }}
                            className="w-9 h-9 flex items-center justify-center text-amber-500 bg-amber-500/5 rounded-xl hover:bg-amber-500 hover:text-black transition-all border border-amber-500/10"
                            title="Confirmar"
                          >
                            <Check size={16} strokeWidth={4} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(t.id); }}
                          className="w-9 h-9 flex items-center justify-center text-neutral-700 hover:text-rose-500 transition-colors group-hover:opacity-100 opacity-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-24 opacity-20">
                    <Wallet size={48} className="mx-auto mb-4 text-neutral-500" />
                    <p className="text-xs font-bold uppercase tracking-[0.3em]">Nenhum lançamento</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Modal isOpen={isExperimentalModalOpen} onClose={() => { setIsExperimentalModalOpen(false); setEditingExperimental(null); setNewStudentName(''); setNewStudentPhotoUrl(''); }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">{editingExperimental ? 'Editar' : 'Novo'} <span className="text-amber-500">Experimental</span></h2>
          <button onClick={() => { setIsExperimentalModalOpen(false); setEditingExperimental(null); setNewStudentPhotoUrl(''); }} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <p className="text-[11px] text-neutral-500 mb-10 font-bold uppercase tracking-widest">Registro de novo interessado</p>

        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Nome Completo</label>
            <input 
              type="text" 
              placeholder="Digite o nome do aluno..." 
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-[1.2rem] py-5 px-6 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white placeholder:text-neutral-700 shadow-inner"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Foto do Aluno</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/[0.02] border border-white/[0.08] rounded-[2rem] flex items-center justify-center overflow-hidden flex-shrink-0 relative group/photo">
                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover/photo:opacity-100 transition-opacity" />
                {newStudentPhotoUrl ? (
                  <img src={newStudentPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Users size={32} className="text-neutral-700" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden" 
                    id="experimental-photo-upload"
                  />
                  <label 
                    htmlFor="experimental-photo-upload"
                    className={cn(
                      "w-full flex items-center justify-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black rounded-xl py-4 px-4 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all duration-500",
                      isUploading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isUploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}
                    {isUploading ? 'Processando...' : 'Carregar Imagem'}
                  </label>
                </div>
                <div className="relative group/url">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/url:text-amber-500 transition-colors" size={14} />
                  <input 
                    type="url" 
                    placeholder="Ou cole o link da foto..." 
                    value={newStudentPhotoUrl}
                    onChange={(e) => setNewStudentPhotoUrl(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 pl-11 pr-4 text-[10px] font-bold focus:outline-none focus:border-amber-500/30 transition-all text-white placeholder:text-neutral-800"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Telefone</label>
              <div className="relative group/phone">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/phone:text-amber-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="(00) 00000-0000" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 pl-12 pr-5 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Data da Aula</label>
              <input 
                type="date" 
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Data de Nascimento</label>
              <input 
                type="date" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Selecione o Horário</label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => setPreferredTime(preferredTime === time ? '' : time)}
                  className={cn(
                    "py-3 rounded-xl text-[10px] font-black transition-all border duration-500",
                    preferredTime === time 
                      ? "bg-amber-500 text-black border-amber-500 shadow-[0_5px_15px_rgba(245,158,11,0.2)]" 
                      : "bg-white/[0.02] text-neutral-500 border-white/[0.05] hover:border-amber-500/20"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Modalidade</label>
            <div className="grid grid-cols-2 gap-3">
              {MODALITIES.map((mod) => (
                <button
                  key={mod}
                  onClick={() => setPreferredModality(preferredModality === mod ? '' : mod)}
                  className={cn(
                    "px-4 py-4 rounded-xl text-[10px] font-black transition-all border uppercase text-center duration-500 tracking-widest",
                    preferredModality === mod 
                      ? "bg-amber-500 text-black border-amber-500 shadow-[0_5px_15px_rgba(245,158,11,0.2)]" 
                      : "bg-white/[0.02] text-neutral-500 border-white/[0.05] hover:border-amber-500/20"
                  )}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleAddOrUpdateExperimental}
              className="w-full bg-amber-500 text-black py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:bg-amber-400 active:scale-95 transition-all duration-500"
            >
              {editingExperimental ? 'Salvar Edição' : 'Concluir Cadastro'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Aluno */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingStudent(null); setNewStudentName(''); setNewStudentPhotoUrl(''); }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">{editingStudent ? 'Editar' : 'Novo'} <span className="text-amber-500">Aluno</span></h2>
          <button onClick={() => { setIsModalOpen(false); setEditingStudent(null); setNewStudentPhotoUrl(''); }} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <p className="text-[11px] text-neutral-500 mb-10 font-bold uppercase tracking-widest">Cadastro oficial de membro</p>

        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Nome Completo</label>
            <input 
              type="text" 
              placeholder="Digite o nome completo do aluno..." 
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-[1.2rem] py-5 px-6 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white placeholder:text-neutral-700 shadow-inner"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Foto do Aluno</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/[0.02] border border-white/[0.08] rounded-[2rem] flex items-center justify-center overflow-hidden flex-shrink-0 relative group/photo">
                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover/photo:opacity-100 transition-opacity" />
                {newStudentPhotoUrl ? (
                  <img src={newStudentPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Users size={32} className="text-neutral-700" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden" 
                    id="student-photo-upload"
                  />
                  <label 
                    htmlFor="student-photo-upload"
                    className={cn(
                      "w-full flex items-center justify-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black rounded-xl py-4 px-4 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all duration-500",
                      isUploading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isUploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}
                    {isUploading ? 'Processando...' : 'Carregar Imagem'}
                  </label>
                </div>
                <div className="relative group/url">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/url:text-amber-500 transition-colors" size={14} />
                  <input 
                    type="url" 
                    placeholder="Ou cole o link da foto..." 
                    value={newStudentPhotoUrl}
                    onChange={(e) => setNewStudentPhotoUrl(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 pl-11 pr-4 text-[10px] font-bold focus:outline-none focus:border-amber-500/30 transition-all text-white placeholder:text-neutral-800"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Mensalidade (R$)</label>
              <input 
                type="number" 
                placeholder="Ex: 150,00" 
                value={newStudentValue}
                onChange={(e) => setNewStudentValue(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Telefone</label>
              <div className="relative group/phone">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/phone:text-amber-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="(00) 00000-0000" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 pl-12 pr-5 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Data Matrícula</label>
              <input 
                type="date" 
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Data de Nascimento</label>
              <input 
                type="date" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Vencimento</label>
              <div className="grid grid-cols-6 gap-2">
                {['05', '10', '15', '20', '25', '30'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setPreferredDueDay(day)}
                    className={cn(
                      "py-3 rounded-lg text-[9px] font-black transition-all border duration-500",
                      preferredDueDay === day 
                        ? "bg-amber-500 text-black border-amber-500 shadow-[0_5px_10px_rgba(245,158,11,0.2)]" 
                        : "bg-white/[0.02] text-neutral-500 border-white/[0.05] hover:border-amber-500/20"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Plano de Treino</label>
            <div className="grid grid-cols-2 gap-3">
              {PLAN_OPTIONS.map((p) => (
                <button 
                  key={p}
                  type="button"
                  onClick={() => setSelectedPlan(p)}
                  className={cn(
                    "py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border duration-500",
                    selectedPlan === p 
                      ? "bg-amber-500 text-black border-amber-500 shadow-[0_5px_15px_rgba(245,158,11,0.2)]" 
                      : "bg-white/[0.02] text-neutral-500 border-white/[0.05] hover:border-amber-500/20"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Status Financeiro</label>
            <div className="grid grid-cols-2 gap-3">
              {['Em dia', 'Pendente'].map((st) => (
                <button 
                  key={st}
                  type="button"
                  onClick={() => setSelectedPayment(st)}
                  className={cn(
                    "py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border duration-500",
                    selectedPayment === st 
                      ? (st === 'Em dia' ? "bg-amber-500 text-black border-amber-500 shadow-[0_5px_15px_rgba(245,158,11,0.2)]" : "bg-rose-500 text-white border-rose-500 shadow-[0_5px_15px_rgba(244,63,94,0.3)]") 
                      : "bg-white/[0.02] text-neutral-500 border-white/[0.05] hover:border-white/10"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Horário</label>
              <div className="grid grid-cols-3 gap-2">
                {['06:00', '07:00', '08:00', '09:00', '17:00', '18:00', '19:00', '20:00'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setPreferredTime(preferredTime === time ? '' : time)}
                    className={cn(
                      "py-2.5 rounded-lg text-[9px] font-black transition-all border duration-500",
                      preferredTime === time 
                        ? "bg-amber-500 text-black border-amber-500 shadow-[0_5px_10px_rgba(245,158,11,0.2)]" 
                        : "bg-white/[0.02] text-neutral-500 border-white/[0.05] hover:border-amber-500/20"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Modalidade</label>
              <div className="space-y-2">
                {MODALITIES.slice(0, 4).map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setPreferredModality(preferredModality === mod ? '' : mod)}
                    className={cn(
                      "w-full py-2.5 rounded-lg text-[9px] font-black transition-all border uppercase duration-500",
                      preferredModality === mod 
                        ? "bg-amber-500 text-black border-amber-500 shadow-[0_5px_10px_rgba(245,158,11,0.2)]" 
                        : "bg-white/[0.02] text-neutral-500 border-white/[0.05] hover:border-amber-500/20"
                    )}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleAddOrUpdateStudent}
              className="w-full bg-amber-500 text-black py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:bg-amber-400 active:scale-95 transition-all duration-500"
            >
              {editingStudent ? 'Atualizar Membro' : 'Concluir Registro'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Agenda (Gerenciar Horário) */}
      <Modal isOpen={isAgendaModalOpen} onClose={() => { setIsAgendaModalOpen(false); setSelectedBookingModality(''); setBookingSearchTerm(''); }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">{session ? 'Gerenciar' : 'Agendar'} <span className="text-amber-500">{session ? 'Horário' : 'Aula'}</span></h2>
          <button onClick={() => { setIsAgendaModalOpen(false); setSelectedBookingModality(''); }} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <p className="text-[11px] text-neutral-500 mb-8 font-bold uppercase tracking-widest">{session ? 'Controle de ocupação e modalidades' : 'Selecione a modalidade e confirme sua presença'}</p>

        {/* Time Selection inside Modal */}
        <div className="mb-8 p-6 glass-card rounded-[2rem]">
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Horário da Aula</label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                onClick={() => {
                  setSelectedTimeSlot(time);
                  setSelectedBookingModality(''); // Reset modality selection when time changes
                }}
                className={cn(
                  "py-3 rounded-xl text-[10px] font-black transition-all border duration-500",
                  selectedTimeSlot === time 
                    ? "bg-amber-500 text-black border-amber-500 shadow-[0_5px_15px_rgba(245,158,11,0.2)]" 
                    : "bg-white/[0.02] text-neutral-500 border-white/[0.05] hover:border-amber-500/20"
                )}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Modality Selection */}
        {session && (
          <div className="grid grid-cols-2 gap-3 mb-10">
            {MODALITIES.map((mod) => {
              const key = `${selectedAgendaDate}-${selectedTimeSlot}`;
              const isActive = (agendaEvents[key]?.modalities || []).find(m => m.modality === mod);
              
              return (
                <button
                  key={mod}
                  onClick={() => handleToggleModality(selectedTimeSlot, mod)}
                  className={cn(
                    "py-4 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 text-center leading-tight flex items-center justify-center gap-2 border",
                    isActive 
                      ? "bg-amber-500 text-black border-amber-500 shadow-[0_5px_15px_rgba(245,158,11,0.2)]" 
                      : "bg-white/[0.02] text-neutral-500 border-white/[0.05] hover:border-amber-500/20"
                  )}
                >
                  {isActive && <Check size={14} strokeWidth={4} />}
                  {mod}
                </button>
              );
            })}
          </div>
        )}

        {/* Booking Management Section */}
        <AnimatePresence>
          {(!session || (agendaEvents[`${selectedAgendaDate}-${selectedTimeSlot}`]?.modalities || []).length > 0) ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-8"
            >
              <div className="h-px bg-white/[0.05] w-full mt-4" />
              
              {/* Select Modality to Add Students */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">{session ? 'Incluir Aluno em:' : 'Qual modalidade você vai treinar?'}</label>
                <div className="flex flex-wrap gap-2">
                  {(session ? (agendaEvents[`${selectedAgendaDate}-${selectedTimeSlot}`]?.modalities || []).map(m => m.modality) : MODALITIES).map(modName => (
                    <button
                      key={modName}
                      onClick={() => setSelectedBookingModality(modName)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black transition-all duration-500 uppercase tracking-widest",
                        selectedBookingModality === modName 
                          ? "bg-amber-500 text-black shadow-[0_5px_15px_rgba(245,158,11,0.2)]" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      )}
                    >
                      {modName}
                    </button>
                  ))}
                </div>
              </div>

              {selectedBookingModality && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{session ? 'Nome do Aluno' : 'Seu Nome'}</label>
                    {session && (
                      <button 
                        onClick={() => setIsExperimental(!isExperimental)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all border duration-500 uppercase tracking-widest",
                          isExperimental ? "bg-amber-500 text-black border-amber-500" : "bg-neutral-900 text-neutral-500 border-white/5"
                        )}
                      >
                        <Zap size={10} className={isExperimental ? "fill-black" : ""} />
                        EXPERIMENTAL
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        placeholder={session ? (isExperimental ? "Nome do aluno experimental..." : "Buscar aluno regular...") : "Digite seu nome para confirmar..."}
                        value={bookingSearchTerm}
                        onChange={(e) => setBookingSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-amber-500/50 text-white placeholder:text-neutral-700"
                      />
                      
                      {/* Quick Suggestions for Regular Students */}
                      {(!isExperimental || !session) && bookingSearchTerm.length > 1 && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-[#0a0a0b] border border-white/[0.1] rounded-[1.5rem] shadow-2xl z-[60] overflow-hidden backdrop-blur-3xl">
                          {students
                            .filter(s => s.name.toLowerCase().includes(bookingSearchTerm.toLowerCase()))
                            .map(s => (
                              <button
                                key={s.id}
                                onClick={() => handleAddBooking(s.name, false)}
                                className="w-full text-left px-5 py-3.5 text-xs font-bold hover:bg-amber-500 hover:text-black transition-all border-b border-white/[0.03] last:border-0"
                              >
                                {s.name}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleAddBooking(bookingSearchTerm, session ? isExperimental : false)}
                      disabled={!bookingSearchTerm.trim()}
                      className="bg-amber-500 text-black px-6 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-amber-400 focus:scale-95"
                    >
                      {session ? 'ADICIONAR' : 'CONFIRMAR PRESENÇA'}
                    </button>
                  </div>
                </div>
              )}

              {/* List Bookings per Modality */}
              <div className="space-y-6 pt-2 pb-10">
                {(agendaEvents[`${selectedAgendaDate}-${selectedTimeSlot}`]?.modalities || []).map(m => (
                  <div key={m.modality} className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[11px] font-black text-amber-500 tracking-[0.2em] uppercase text-glow-gold">{m.modality} ({m.bookings.length})</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {m.bookings.map(b => (
                        <div key={b.id} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] p-5 rounded-[1.5rem] group hover:border-amber-500/20 transition-all duration-500">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", b.isExperimental ? "bg-amber-500/10 text-amber-500" : "bg-neutral-800/10 text-neutral-500")}>
                              {b.isExperimental ? <Zap size={18} className="fill-amber-500 text-glow-gold" /> : <User size={18} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-neutral-300 group-hover:text-white transition-colors">{b.studentName}</span>
                              {b.isExperimental && (
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-0.5 text-glow-gold">EXPERIMENTAL</span>
                              )}
                            </div>
                          </div>
                          {session && (
                            <button 
                              onClick={() => handleRemoveBooking(m.modality, b.id)}
                              className="w-10 h-10 flex items-center justify-center text-neutral-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                      {m.bookings.length === 0 && (
                        <div className="text-[10px] text-neutral-700 font-bold uppercase py-10 text-center border border-dashed border-white/[0.05] rounded-[2rem]">
                          Vazio
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10"
            >
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">Nenhuma aula programada para este horário.</p>
              {session && <p className="text-[9px] font-medium text-neutral-600 mt-2 block">Selecione uma modalidade acima abri-la na grade.</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-8 mt-auto sticky bottom-0 bg-[#0a0a0b]">
          <button 
            onClick={() => { setIsAgendaModalOpen(false); setSelectedBookingModality(''); }}
            className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-neutral-200 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
          >
            Concluído
          </button>
        </div>
      </Modal>

      {/* Modal Financeiro (Novo Lançamento) */}
      <Modal isOpen={isFinanceModalOpen} onClose={() => { setIsFinanceModalOpen(false); setNewTransDesc(''); setNewTransValue(''); setEditingTransaction(null); }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">{editingTransaction ? 'Editar' : 'Novo'} <span className="text-amber-500">Lançamento</span></h2>
          <button onClick={() => { setIsFinanceModalOpen(false); setEditingTransaction(null); }} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <p className="text-[11px] text-neutral-500 mb-10 font-bold uppercase tracking-widest">Fluxo de caixa e controle diário</p>

        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Data da Operação</label>
            <input 
              type="date" 
              value={newTransDate}
              onChange={(e) => setNewTransDate(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Tipo de Movimentação</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setNewTransType('in')}
                className={cn(
                  "py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border",
                  newTransType === 'in' ? "bg-amber-500 text-black border-amber-500 shadow-[0_5px_15px_rgba(245,158,11,0.2)]" : "bg-white/[0.02] text-neutral-600 border-white/[0.05]"
                )}
              >
                Receita
              </button>
              <button 
                onClick={() => setNewTransType('out')}
                className={cn(
                  "py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border",
                  newTransType === 'out' ? "bg-rose-500 text-white border-rose-500 shadow-[0_5px_15px_rgba(244,63,94,0.3)]" : "bg-white/[0.02] text-neutral-600 border-white/[0.05]"
                )}
              >
                Despesa
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Status do Pagamento</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setNewTransStatus('pending')}
                className={cn(
                  "py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border",
                  newTransStatus === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "bg-white/[0.02] text-neutral-600 border-white/[0.05]"
                )}
              >
                {newTransType === 'in' ? 'A Receber' : 'A Pagar'}
              </button>
              <button 
                onClick={() => setNewTransStatus('completed')}
                className={cn(
                  "py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border",
                  newTransStatus === 'completed' ? "bg-amber-500 text-black border-amber-500 shadow-[0_5px_15px_rgba(245,158,11,0.2)]" : "bg-white/[0.02] text-neutral-600 border-white/[0.05]"
                )}
              >
                {newTransType === 'in' ? 'Recebido' : 'Pago'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Descrição</label>
            <input 
              type="text" 
              placeholder="Ex: Mensalidade, Aluguel, Equipamento..." 
              value={newTransDesc}
              onChange={(e) => setNewTransDesc(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all text-white placeholder:text-neutral-700"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Valor Líquido (R$)</label>
            <div className="relative group/value">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-500/50">R$</div>
              <input 
                type="number" 
                placeholder="0,00" 
                value={newTransValue}
                onChange={(e) => setNewTransValue(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 pl-12 pr-5 text-xl font-black focus:outline-none focus:border-amber-500/50 transition-all text-amber-500 placeholder:text-neutral-700"
              />
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleAddTransaction}
              className="w-full bg-amber-500 text-black py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:bg-amber-400 active:scale-95 transition-all duration-500"
            >
              {editingTransaction ? 'Salvar Alterações' : 'Concluir Lançamento'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Relatórios Mensais */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">Relatórios <span className="text-amber-500">Mensais</span></h2>
          <button onClick={() => setIsReportModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <p className="text-[11px] text-neutral-500 mb-8 font-bold uppercase tracking-widest">Arquivamento e Geração de PDFs</p>

        <div className="space-y-8">
          <div className="glass-card p-6 rounded-[2rem] border border-white/[0.05]">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 block">Gerar Novo Relatório</label>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-2 block">Mês</label>
                <select 
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-amber-500/50 text-white"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={m} value={m} className="bg-[#0a0a0b]">{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-2 block">Ano</label>
                <select 
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-amber-500/50 text-white"
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y} className="bg-[#0a0a0b]">{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="w-full bg-amber-500 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50"
            >
              {isGeneratingReport ? 'Gerando...' : 'Gerar e Arquivar PDF'}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <Archive size={14} />
              Relatórios Arquivados
            </h3>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {monthlyReports.length > 0 ? (
                monthlyReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl group hover:border-amber-500/20 transition-all">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">
                        Mês {String(report.month).padStart(2, '0')} / {report.year}
                      </span>
                      <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
                        Gerado em {new Date(report.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <a 
                      href={report.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-black transition-all"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed border-white/[0.05] rounded-2xl">
                  <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest">Nenhum relatório arquivado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Bottom Navigation (Mobile Only) */}
      {session && view !== 'public_agenda' && view !== 'login' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0b]/60 backdrop-blur-3xl border-t border-white/[0.05] px-8 py-5 flex lg:hidden items-center justify-around z-[100] safe-area-bottom">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          <NavItem 
            id="home" 
            icon={LayoutDashboard} 
            label="Início" 
            active={view === 'home'} 
            onClick={() => setView('home')} 
          />
          <NavItem 
            id="alunos" 
            icon={Users} 
            label="Membros" 
            active={view === 'alunos'} 
            onClick={() => setView('alunos')} 
          />
          <NavItem 
            id="experimentais" 
            icon={Zap} 
            label="Aulas" 
            active={view === 'experimentais'} 
            onClick={() => setView('experimentais')} 
          />
          <NavItem 
            id="agenda" 
            icon={CalendarDays} 
            label="Agenda" 
            active={view === 'agenda'} 
            onClick={() => setView('agenda')} 
          />
          <NavItem 
            id="financeiro" 
            icon={Wallet} 
            label="Caixa" 
            active={view === 'financeiro'} 
            onClick={() => setView('financeiro')} 
          />
        </nav>
      )}
      </div>
    </div>
  );
}
