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
  Cake
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

const FINANCE_CHART_DATA = [
  { month: 'Jan', profit: 4000 },
  { month: 'Fev', profit: 5200 },
  { month: 'Mar', profit: 4800 },
  { month: 'Abr', profit: 6100 },
  { month: 'Mai', profit: 6800 },
  { month: 'Jun', profit: 7200 },
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
          className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="relative w-full max-w-lg bg-[#141414] border border-white/[0.08] rounded-[2.5rem] p-8 z-[201] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="overflow-y-auto pr-2">
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
  <div className="bg-[#141414] p-6 rounded-[1.5rem] border border-white/[0.05] flex-1">
    <div className="flex items-center gap-2 mb-4">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center",
        type === 'success' ? "bg-emerald-500/10 text-emerald-500" : 
        type === 'danger' ? "bg-rose-500/10 text-rose-500" :
        "bg-blue-500/10 text-blue-500"
      )}>
        {type === 'success' ? <TrendingUp size={16} /> : 
         type === 'danger' ? <TrendingUp size={16} className="rotate-180" /> :
         <DollarSign size={16} />}
      </div>
      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{title}</span>
    </div>
    <h3 className={cn(
      "text-2xl font-bold tracking-tight mb-1",
      type === 'info' ? (Number(value) >= 0 ? "text-blue-500" : "text-rose-500") : "text-white"
    )}>
      {isCurrency ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : value}
    </h3>
    {trend && (
      <span className={cn(
        "text-[10px] font-medium opacity-60",
        type === 'success' ? "text-emerald-500" : 
        type === 'danger' ? "text-rose-500" :
        (Number(value) >= 0 ? "text-blue-400" : "text-rose-400")
      )}>
        {trend}
      </span>
    )}
  </div>
);

const NavItem = ({ id, icon: Icon, label, active, onClick }: { id: string, icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 transition-all duration-300 py-1",
      active ? "text-emerald-500" : "text-neutral-600 hover:text-neutral-400"
    )}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

const ActionButton = ({ label, icon: Icon, primary = false, onClick }: { label: string, icon?: any, primary?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-[13px] uppercase tracking-widest transition-all active:scale-95",
      primary 
        ? "bg-emerald-500 text-[#0D0D0D] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 w-full" 
        : "bg-[#1A1A1A] text-neutral-400 hover:bg-[#222] border border-white/[0.02] w-full"
    )}
  >
    {Icon && <Icon size={18} strokeWidth={3} />}
    {label}
  </button>
);

export default function App() {
  const [view, setView] = useState<'home' | 'alunos' | 'experimentais' | 'agenda' | 'financeiro'>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExperimentalModalOpen, setIsExperimentalModalOpen] = useState(false);
  const [dashboardPlanFilter, setDashboardPlanFilter] = useState('Todos');
  const [dashboardViewMode, setDashboardViewMode] = useState<'distribuicao' | 'frequencia'>('distribuicao');
  const [students, setStudents] = useState<any[]>([]);
  const [experimentalStudents, setExperimentalStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editingExperimental, setEditingExperimental] = useState<any>(null);

  // Form State
  const [newStudentName, setNewStudentName] = useState('');
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

  // Fetch from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Alunos
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*').order('name');
      if (studentsData) {
        // Map snake_case from DB to camelCase for UI
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
          phone: s.phone
        }));
        setStudents(mapped);
      }
      else if (studentsError) console.error('Erro ao buscar alunos:', studentsError);

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
          status: s.status
        }));
        setExperimentalStudents(mapped);
      }
      else if (expError) console.error('Erro ao buscar experimentais:', expError);

      // Fetch Transações
      const { data: transData, error: transError } = await supabase.from('transactions').select('*').order('date', { ascending: false });
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
      }
      else if (transError) console.error('Erro ao buscar transações:', transError);

      // Fetch Agendamentos e agrupar para o formato do UI
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
    };

    fetchData();
  }, []);

  // Remove Persistence Effects (localStorage)
  // useEffect(() => { ... }, [students, ...]);

  const filteredStudents = students.filter((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
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
  }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        return;
      }
      setTransactions(prevTransactions => prevTransactions.map((t: any) => t.id === transactionId ? { ...t, ...transData } : t));
    } else {
      const { error } = await supabase.from('transactions').insert([transData]);
      if (error) {
        console.error('Erro ao inserir transação:', error);
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
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    const newStatus = transaction.status === 'completed' ? 'pending' : 'completed';
    
    const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
    if (error) {
      console.error('Erro ao alternar status da transação:', error);
      return;
    }

    setTransactions(transactions.map((t: any) => {
      if (t.id === id) {
        // Se a transação for de um aluno, sincroniza o status do aluno também
        if (t.studentId) {
          const studentStatus = newStatus === 'completed' ? 'Em dia' : 'Pendente';
          supabase.from('students').update({ status: studentStatus }).eq('id', t.studentId);
          setStudents(prevStudents => prevStudents.map(s => 
            s.id === t.studentId ? { ...s, status: studentStatus } : s
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
        return;
      }
      setTransactions(transactions.filter((t: any) => t.id !== id));
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
        value: count
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
          total: totalStudents
        };
      });
  }, [students]);

  const chartData = dashboardViewMode === 'frequencia' ? frequencyData : distributionData;

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
      phone: phone
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
      lastCheckin: editingStudent ? editingStudent.lastCheckin : 'Nunca'
    };

    if (editingStudent) {
      const { error } = await supabase.from('students').update(studentDataDB).eq('id', studentId);
      if (error) {
        console.error('Erro ao atualizar aluno:', error);
        alert('Erro ao atualizar aluno no banco de dados. Verifique sua conexão.');
        return;
      }

      setStudents(prevStudents => prevStudents.map(s => s.id === studentId ? { ...s, ...studentDataUI } : s));

      // Atualiza transação se existir
      const transData = {
        description: `Mensalidade ${newStudentName}`,
        amount: amount,
        status: selectedPayment === 'Em dia' ? 'completed' : 'pending'
      };
      await supabase.from('transactions').update(transData).eq('student_id', studentId);
      setTransactions(prevTransactions => prevTransactions.map((t: any) => 
        t.studentId === studentId ? { ...t, ...transData } : t
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
      status: 'Experimental'
    };

    const experimentalDataUI = {
      id: studentId,
      name: newStudentName,
      preferredTime: preferredTime,
      preferredModality: preferredModality,
      enrollmentDate: enrollmentDate,
      birthDate: birthDate,
      phone: phone,
      status: 'Experimental'
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
      return;
    }
    setStudents(students.map(s => s.id === student.id ? { ...s, status: newStatus } : s));
    
    // Atualiza Transação Vinculada
    await supabase.from('transactions').update({ status: newTransStatus }).eq('student_id', student.id);
    setTransactions(transactions.map((t: any) => 
      t.studentId === student.id ? { ...t, status: newTransStatus } : t
    ));
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

    const { error } = await supabase.from('agenda_reservas').insert([newBooking]);
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
    
    const { error } = await supabase.from('agenda_reservas').delete().eq('id', bookingId);
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

  const handleMigrateToSupabase = async () => {
    if (!window.confirm('Deseja migrar todos os dados locais (do navegador) para o Supabase? Isso pode duplicar dados se já houver registros lá.')) return;

    try {
      const localStudents = JSON.parse(localStorage.getItem('gestao-kz-students') || '[]');
      const localExp = JSON.parse(localStorage.getItem('gestao-kz-experimental') || '[]');
      const localTrans = JSON.parse(localStorage.getItem('gestao-kz-transactions') || '[]');
      const localAgenda = JSON.parse(localStorage.getItem('gestao-kz-agenda') || '{}');

      // Migrate Students
      if (localStudents.length > 0) {
        const studentsToInsert = localStudents.map((s: any) => ({
          id: s.id,
          name: s.name,
          plan: s.plan,
          last_checkin: s.lastCheckin,
          status: s.status,
          value: s.value,
          preferred_time: s.preferredTime,
          preferred_modality: s.preferredModality,
          enrollment_date: s.enrollmentDate,
          preferred_due_day: s.preferredDueDay,
          birth_date: s.birthDate || null,
          phone: s.phone
        }));
        await supabase.from('estudantes').upsert(studentsToInsert);
      }

      // Migrate Experimental
      if (localExp.length > 0) {
        const expToInsert = localExp.map((s: any) => ({
          id: s.id,
          name: s.name,
          preferred_time: s.preferredTime,
          preferred_modality: s.preferredModality,
          enrollment_date: s.enrollmentDate,
          birth_date: s.birthDate || null,
          phone: s.phone,
          status: s.status
        }));
        await supabase.from('estudantes_experimentais').upsert(expToInsert);
      }

      // Migrate Transactions
      if (localTrans.length > 0) {
        const transToInsert = localTrans.map((t: any) => ({
          id: t.id,
          student_id: t.studentId || t.student_id,
          description: t.description,
          amount: t.amount,
          type: t.type,
          status: t.status,
          date: t.date
        }));
        await supabase.from('transactions').upsert(transToInsert);
      }

      // Migrate Agenda
      const bookingsToInsert: any[] = [];
      Object.entries(localAgenda).forEach(([slotKey, slot]: [string, any]) => {
        slot.modalities.forEach((m: any) => {
          m.bookings.forEach((b: any) => {
            bookingsToInsert.push({
              id: b.id,
              slot_key: slotKey,
              modality: m.modality,
              student_name: b.studentName,
              is_experimental: b.isExperimental
            });
          });
        });
      });
      if (bookingsToInsert.length > 0) {
        await supabase.from('agenda_reservas').upsert(bookingsToInsert);
      }

      alert('Migração concluída com sucesso! Recarregue a página.');
      window.location.reload();
    } catch (error) {
      console.error('Erro na migração:', error);
      alert('Ocorreu um erro na migração. Verifique o console.');
    }
  };

  const handleExportData = () => {
    const data = {
      students: JSON.parse(localStorage.getItem('gestao-kz-students') || '[]'),
      experimental: JSON.parse(localStorage.getItem('gestao-kz-experimental') || '[]'),
      agenda: JSON.parse(localStorage.getItem('gestao-kz-agenda') || '{}'),
      transactions: JSON.parse(localStorage.getItem('gestao-kz-transactions') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-gestao-kz-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleOpenCheckin = () => {
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, '0') + ':00';
    const today = now.toISOString().split('T')[0];
    
    setSelectedAgendaDate(today);
    setSelectedTimeSlot(hour);
    setIsAgendaModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans pb-32">
      {/* Top Header */}
      <header className="px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[12px] font-bold text-neutral-500 uppercase tracking-widest">Bem-vindo</p>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase">Kross Zone</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-3 bg-[#141414] rounded-2xl border border-white/[0.05] text-neutral-500 hover:text-white transition-colors lg:hidden">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <main className="px-4 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Main Dashboard Chart Section */}
              <section className="bg-[#141414] p-6 rounded-[2rem] border border-white/[0.05] relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDashboardViewMode('distribuicao')}
                        className={cn(
                          "text-[11px] font-bold uppercase tracking-[0.2em] transition-all",
                          dashboardViewMode === 'distribuicao' ? "text-emerald-500" : "text-neutral-500 hover:text-neutral-400"
                        )}
                      >
                        Distribuição Alunos
                      </button>
                      <span className="text-neutral-800 text-[10px]">/</span>
                      <button
                        onClick={() => setDashboardViewMode('frequencia')}
                        className={cn(
                          "text-[11px] font-bold uppercase tracking-[0.2em] transition-all",
                          dashboardViewMode === 'frequencia' ? "text-emerald-500" : "text-neutral-500 hover:text-neutral-400"
                        )}
                      >
                        Frequência Semanal
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 py-2 max-w-[280px] sm:max-w-md">
                      {dashboardViewMode === 'frequencia' ? (
                        ['Todos', ...PLAN_OPTIONS].map((plan) => (
                          <button
                            key={plan}
                            onClick={() => setDashboardPlanFilter(plan)}
                            className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
                              dashboardPlanFilter === plan 
                                ? (plan === 'Wellhub' ? "bg-rose-500 text-white border-rose-500" : "bg-emerald-500 text-[#0D0D0D] border-emerald-500") 
                                : (plan === 'Wellhub' ? "text-rose-500 border-rose-500/30" : "bg-[#1A1A1A] text-neutral-600 border-white/[0.05] hover:border-white/10")
                            )}
                          >
                            {plan}
                          </button>
                        ))
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                            Total: {students.length} Alunos
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="p-1 text-neutral-700 hover:text-neutral-500">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData} 
                      margin={{ top: 20, right: 0, left: -40, bottom: 0 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={dashboardViewMode === 'distribuicao' || dashboardPlanFilter === 'Todos' ? { fontSize: 10, fill: '#404040', fontWeight: 700, textTransform: 'uppercase' } : false} 
                        dy={15}
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ display: 'none' }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[8, 8, 8, 8]} 
                        barSize={dashboardViewMode === 'frequencia' ? 60 : 40}
                        animationDuration={1500}
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
                                y={y - 10} 
                                fill="#404040" 
                                fontSize={10} 
                                fontWeight={900} 
                                textAnchor="middle"
                              >
                                {value}
                              </text>
                            );
                          }}
                        />
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === (dashboardViewMode === 'frequencia' ? 3 : 0) ? '#10b981' : '#262626'} 
                            className={cn(
                              "transition-all duration-500",
                              index === (dashboardViewMode === 'frequencia' ? 3 : 0) && "shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                            )}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute bottom-12 left-[calc(50%+10px)] -translate-x-1/2 w-20 h-20 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
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

              {/* Quick Actions (Ações) */}
              <section className="bg-[#141414] p-6 rounded-[2rem] border border-white/[0.05]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Ações</h2>
                  {birthdayStudents.length > 0 && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20"
                    >
                      <Cake size={12} className="text-rose-500" />
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Aniversariantes do Dia!</span>
                    </motion.div>
                  )}
                </div>

                {birthdayStudents.length > 0 && (
                  <div className="mb-6 space-y-2">
                    {birthdayStudents.map((s: any) => (
                      <div key={s.id} className="bg-gradient-to-r from-rose-500/10 to-transparent p-4 rounded-2xl border border-rose-500/10 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                            <Cake size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Parabéns!</p>
                            <p className="text-sm font-bold text-white">{s.name}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const text = `Parabéns ${s.name}! Feliz aniversário de toda a equipe Kross Zone! 🎂💪`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:scale-105 transition-all"
                        >
                          Dar Parabéns
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
                  <ActionButton label="Migrar Dados p/ Nuvem" onClick={handleMigrateToSupabase} />
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
                <h2 className="text-xl font-black tracking-tighter uppercase">Experimentais</h2>
                <button 
                  onClick={() => { setEditingExperimental(null); setNewStudentName(''); setView('experimentais'); setIsExperimentalModalOpen(true); }}
                  className="w-10 h-10 bg-emerald-500 text-[#0D0D0D] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar experimental..." 
                  className="w-full bg-[#141414] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Experimental List */}
              <div className="space-y-3 pb-10">
                {filteredExperimental.map((s) => (
                  <div key={s.id} className="bg-[#141414] p-5 rounded-2xl border border-white/[0.05] flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                        <Zap size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5">{s.name}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {s.enrollmentDate && (
                            <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-tighter">
                              Data: {formatDisplayDate(s.enrollmentDate)}
                            </span>
                          )}
                          {s.phone && (
                            <button 
                              onClick={() => {
                                const cleanPhone = s.phone.replace(/\D/g, '');
                                window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                              }}
                              className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter flex items-center gap-1 hover:text-emerald-400 transition-colors"
                            >
                              Zap: {s.phone}
                            </button>
                          )}
                        </div>
                        {(s.preferredTime || s.preferredModality) && (
                          <div className="flex gap-2">
                            {s.preferredTime && (
                              <span className="text-[9px] bg-white/5 text-neutral-400 px-2 py-0.5 rounded-full border border-white/5">
                                {s.preferredTime}
                              </span>
                            )}
                            {s.preferredModality && (
                              <span className="text-[9px] bg-emerald-500/5 text-emerald-500/60 px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase font-black tracking-tighter">
                                {s.preferredModality}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                        className="p-2 text-emerald-500 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-all"
                        title="Converter em Aluno"
                      >
                        <UserPlus size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditExperimental(s)}
                        className="p-2 text-neutral-500 bg-[#1A1A1A] rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Excluir este aluno experimental?')) {
                            setExperimentalStudents(experimentalStudents.filter(ex => ex.id !== s.id));
                          }
                        }}
                        className="p-2 text-neutral-700 bg-[#1A1A1A] rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredExperimental.length === 0 && (
                  <div className="text-center py-20 opacity-30">
                    <Zap size={40} className="mx-auto mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">Nenhum experimental encontrado</p>
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
                <h2 className="text-xl font-black tracking-tighter uppercase">Alunos</h2>
                <button 
                  onClick={() => { setEditingStudent(null); setNewStudentName(''); setSelectedPlan('K1'); setSelectedPayment('Em dia'); setIsModalOpen(true); }}
                  className="w-10 h-10 bg-emerald-500 text-[#0D0D0D] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar aluno..." 
                  className="w-full bg-[#141414] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Student Status Cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total', value: students.length.toString(), color: 'text-neutral-400' },
                  { label: 'Em dia', value: students.filter(s => s.status === 'Em dia').length.toString(), color: 'text-emerald-500' },
                  { label: 'Pendente', value: students.filter(s => s.status === 'Pendente').length.toString(), color: 'text-rose-500' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#141414] p-4 rounded-2xl border border-white/[0.05] text-center">
                    <p className={cn("text-xl font-black mb-0.5", stat.color)}>{stat.value}</p>
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Students List */}
              <div className="space-y-3">
                {filteredStudents.map((s) => (
                  <div key={s.id} className="bg-[#141414] p-5 rounded-2xl border border-white/[0.05] flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center text-neutral-600">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5">{s.name}</p>
                        <p className="text-[11px] text-neutral-500 font-medium mb-1">
                          <span className={cn(s.plan === 'Wellhub' && "text-rose-500 font-black tracking-widest")}>{s.plan}</span> • R$ {s.value?.toLocaleString('pt-BR') || '0,00'}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {s.enrollmentDate && (
                            <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-tighter">
                              Matrícula: {formatDisplayDate(s.enrollmentDate)}
                            </span>
                          )}
                          {s.preferredDueDay && (
                            <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-tighter">
                              Vence dia: {s.preferredDueDay}
                            </span>
                          )}
                          {s.birthDate && (
                            <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-tighter">
                              Nasc: {formatDisplayDate(s.birthDate)}
                            </span>
                          )}
                          {s.phone && (
                            <button 
                              onClick={() => {
                                const cleanPhone = s.phone.replace(/\D/g, '');
                                window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                              }}
                              className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter flex items-center gap-1 hover:text-emerald-400 transition-colors"
                            >
                              Zap: {s.phone}
                            </button>
                          )}
                        </div>
                        {(s.preferredTime || s.preferredModality) && (
                          <div className="flex gap-2">
                            {s.preferredTime && (
                              <span className="text-[9px] bg-white/5 text-neutral-400 px-2 py-0.5 rounded-full border border-white/5">
                                {s.preferredTime}
                              </span>
                            )}
                            {s.preferredModality && (
                              <span className="text-[9px] bg-emerald-500/5 text-emerald-500/60 px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase font-black tracking-tighter">
                                {s.preferredModality}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleTogglePaymentStatus(s)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          s.status === 'Em dia' ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                        )}
                        title={s.status === 'Em dia' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditStudent(s)}
                        className="p-2 text-neutral-500 bg-[#1A1A1A] rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(s.id)}
                        className="p-2 text-neutral-700 bg-[#1A1A1A] rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
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
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-xl font-black tracking-tighter uppercase">Agenda</h2>
              </div>

              {/* Week Selector Section */}
              <section className="bg-[#141414] p-6 rounded-[2rem] border border-white/[0.05]">
                <div className="flex items-center justify-between mb-6 px-2">
                  <button 
                    onClick={() => {
                      const newStart = new Date(currentWeekStart);
                      newStart.setDate(newStart.getDate() - 7);
                      setCurrentWeekStart(newStart);
                    }}
                    className="p-1 text-neutral-700 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                    {currentWeekStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => {
                      const newStart = new Date(currentWeekStart);
                      newStart.setDate(newStart.getDate() + 7);
                      setCurrentWeekStart(newStart);
                    }}
                    className="p-1 text-neutral-700 hover:text-white transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {weekDays.map((day) => (
                    <button 
                      key={day.fullDate}
                      onClick={() => setSelectedAgendaDate(day.fullDate)}
                      className={cn(
                        "flex flex-col items-center justify-center py-4 rounded-2xl transition-all duration-300",
                        selectedAgendaDate === day.fullDate 
                          ? "bg-emerald-500 text-[#0D0D0D] shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                          : "bg-[#1A1A1A] text-neutral-500 hover:bg-[#222]"
                      )}
                    >
                      <span className="text-[9px] font-black mb-1">{day.day}</span>
                      <span className="text-lg font-black">{day.date}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Time Slots List */}
              <div className="space-y-2">
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
                      className="bg-[#141414] p-5 rounded-2xl border border-white/[0.05] flex flex-col gap-4 group cursor-pointer hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-white">
                            <Clock size={16} className="text-neutral-500" />
                            <span className="text-sm font-bold">{time}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {slot.modalities.map((m, mIdx) => (
                              <div key={mIdx} className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{m.modality}</span>
                                <span className="text-[10px] font-black text-emerald-400/60 ml-1">{m.bookings.length}</span>
                              </div>
                            ))}
                            {slot.modalities.length === 0 && (
                              <span className="text-[10px] text-neutral-700 font-bold uppercase tracking-widest">Livre</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-neutral-600">
                          <User size={14} className="text-neutral-700 group-hover:text-emerald-500 transition-colors" />
                          <span className="text-[11px] font-black">{totalAttendees}</span>
                        </div>
                      </div>

                      {/* Display Student Names */}
                      {slot.modalities.length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pl-8 border-l border-white/[0.03]">
                          {slot.modalities.map(m => m.bookings.map(b => (
                            <div key={b.id} className="flex items-center gap-1.5">
                              {b.isExperimental ? (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                                  <Zap size={8} className="text-amber-500 fill-amber-500" />
                                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">
                                    EXP: {b.studentName}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-medium text-neutral-400">
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
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black tracking-tighter uppercase">Financeiro</h2>
                <button 
                  onClick={() => { setIsFinanceModalOpen(true); setNewTransType('in'); }}
                  className="w-10 h-10 bg-emerald-500 text-[#0D0D0D] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.05] flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center mb-1">
                    <span className="text-[10px] font-black text-emerald-500">R$ {totalInCompleted.toLocaleString('pt-BR')}</span>
                    <span className="text-[8px] font-bold text-neutral-600 uppercase">Realizado</span>
                  </div>
                  <div className="flex flex-col items-center opacity-60">
                    <span className="text-[9px] font-bold text-emerald-400/80">R$ {totalInPending.toLocaleString('pt-BR')}</span>
                    <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-tighter">Previsto</span>
                  </div>
                  <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mt-2 border-t border-white/5 pt-1 w-full text-center">Receitas</p>
                </div>

                <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.05] flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center mb-1">
                    <span className="text-[10px] font-black text-rose-500">R$ {totalOutCompleted.toLocaleString('pt-BR')}</span>
                    <span className="text-[8px] font-bold text-neutral-600 uppercase">Realizado</span>
                  </div>
                  <div className="flex flex-col items-center opacity-60">
                    <span className="text-[9px] font-bold text-rose-400/80">R$ {totalOutPending.toLocaleString('pt-BR')}</span>
                    <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-tighter">Previsto</span>
                  </div>
                  <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mt-2 border-t border-white/5 pt-1 w-full text-center">Despesas</p>
                </div>

                <div className="bg-[#141414] p-4 rounded-2xl border border-white/[0.05] flex flex-col items-center justify-center">
                  <p className={cn("text-xs font-black mb-1", totalProfit >= 0 ? "text-emerald-500" : "text-rose-500")}>
                    R$ {totalProfit.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Lucro Real</p>
                  <div className="mt-2 text-[7px] font-bold text-neutral-600 uppercase text-center leading-tight">
                    Previsto Final:<br/>
                    <span className="text-neutral-400">R$ {(totalProfit + totalInPending - totalOutPending).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Evolution Chart */}
              <section className="bg-[#141414] p-6 rounded-[2rem] border border-white/[0.05] relative overflow-hidden">
                <h2 className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-8">Evolução do Lucro</h2>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={FINANCE_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fill: '#404040', fontWeight: 700 }}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                        itemStyle={{ color: '#10b981', fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorProfit)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Transaction Filters */}
              <div className="bg-[#141414] p-1 rounded-2xl border border-white/[0.05] flex gap-1">
                {(['todos', 'receitas', 'despesas'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFinanceFilter(f)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      financeFilter === f ? "bg-emerald-500 text-[#0D0D0D]" : "text-neutral-500 hover:text-neutral-300"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Transactions List */}
              <div className="space-y-2 pb-10">
                {filteredTransactions.map((t: any) => (
                  <div 
                    key={t.id} 
                    onClick={() => handleEditTransaction(t)}
                    className={cn(
                      "bg-[#141414] p-4 rounded-2xl border border-white/[0.05] flex items-center justify-between group transition-all cursor-pointer hover:border-white/10",
                      t.status === 'pending' && "opacity-60 border-dashed"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        t.type === 'in' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {t.type === 'in' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white mb-0.5">{t.description}</p>
                          {t.status === 'pending' && (
                            <span className="text-[7px] font-black bg-white/5 text-neutral-500 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                              {t.type === 'in' ? 'A Receber' : 'A Pagar'}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tight">
                          {new Date(t.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-xs font-black",
                        t.type === 'in' ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {t.type === 'in' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {t.status === 'pending' && (
                          <button 
                            onClick={() => handleToggleTransactionStatus(t.id)}
                            className="p-2 text-emerald-500 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-all"
                            title="Marcar como realizado"
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="p-2 text-neutral-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Modal isOpen={isExperimentalModalOpen} onClose={() => { setIsExperimentalModalOpen(false); setEditingExperimental(null); setNewStudentName(''); }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black tracking-tighter">{editingExperimental ? 'Editar Experimental' : 'Novo Experimental'}</h2>
          <button onClick={() => { setIsExperimentalModalOpen(false); setEditingExperimental(null); }} className="text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <p className="text-[13px] text-neutral-500 mb-8 font-medium">Preencha os dados do aluno experimental.</p>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Nome</label>
            <input 
              type="text" 
              placeholder="Nome do aluno" 
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-4 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Telefone</label>
            <input 
              type="text" 
              placeholder="Ex: 11 99999-9999" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-4 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Data Aula Experimental</label>
              <input 
                type="date" 
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-4 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Data Nascimento</label>
              <input 
                type="date" 
                value={birthDate || ''}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-4 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Horário Preferencial</label>
            <div className="grid grid-cols-4 gap-2 pb-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => setPreferredTime(preferredTime === time ? '' : time)}
                  className={cn(
                    "px-2 py-2 rounded-xl text-[10px] font-black transition-all border",
                    preferredTime === time 
                      ? "bg-emerald-500 text-[#0D0D0D] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                      : "bg-[#1A1A1A] text-neutral-500 border-white/[0.05] hover:border-white/10"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Modalidade Preferencial</label>
            <div className="grid grid-cols-2 gap-2 pb-2">
              {MODALITIES.map((mod) => (
                <button
                  key={mod}
                  onClick={() => setPreferredModality(preferredModality === mod ? '' : mod)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-[10px] font-black transition-all border uppercase text-left",
                    preferredModality === mod 
                      ? "bg-emerald-500 text-[#0D0D0D] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                      : "bg-[#1A1A1A] text-neutral-500 border-white/[0.05] hover:border-white/10"
                  )}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleAddOrUpdateExperimental}
              className="w-full bg-emerald-500 text-[#0D0D0D] py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 active:scale-95 transition-all"
            >
              {editingExperimental ? 'Salvar Alterações' : 'Adicionar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Aluno */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingStudent(null); setNewStudentName(''); }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black tracking-tighter">{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</h2>
          <button onClick={() => { setIsModalOpen(false); setEditingStudent(null); }} className="text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <p className="text-[13px] text-neutral-500 mb-8 font-medium">Preencha os dados do aluno.</p>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Nome</label>
            <input 
              type="text" 
              placeholder="Nome do aluno" 
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-4 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Valor Mensalidade (R$)</label>
            <input 
              type="number" 
              placeholder="Ex: 150,00" 
              value={newStudentValue}
              onChange={(e) => setNewStudentValue(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-4 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Telefone</label>
            <input 
              type="text" 
              placeholder="Ex: 11 99999-9999" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-4 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Data Matrícula</label>
              <input 
                type="date" 
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-4 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Data Nascimento</label>
              <input 
                type="date" 
                value={birthDate || ''}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-4 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Dia de Vencimento Preferencial</label>
            <div className="grid grid-cols-6 gap-2">
              {['05', '10', '15', '20', '25', '30'].map((day) => (
                <button
                  key={day}
                  onClick={() => setPreferredDueDay(day)}
                  className={cn(
                    "py-3 rounded-xl text-[11px] font-bold transition-all border",
                    preferredDueDay === day 
                      ? "bg-emerald-500 text-[#0D0D0D] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                      : "bg-[#1A1A1A] text-neutral-500 border-white/[0.05] hover:border-white/10"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Plano</label>
            <div className="grid grid-cols-2 gap-2">
              {PLAN_OPTIONS.map((p) => (
                <button 
                  key={p}
                  onClick={() => setSelectedPlan(p)}
                  className={cn(
                    "py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                    selectedPlan === p 
                      ? (p === 'Wellhub' ? "bg-rose-500 text-white" : "bg-emerald-500 text-[#0D0D0D]") 
                      : (p === 'Wellhub' ? "bg-[#1A1A1A] text-rose-500 hover:bg-rose-500/10 border border-rose-500/20" : "bg-[#1A1A1A] text-neutral-500 hover:bg-[#222]")
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {['Em dia', 'Pendente'].map((st) => (
                <button 
                  key={st}
                  onClick={() => setSelectedPayment(st)}
                  className={cn(
                    "py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                    selectedPayment === st 
                      ? (st === 'Em dia' ? "bg-emerald-500 text-[#0D0D0D]" : "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]") 
                      : "bg-[#1A1A1A] text-neutral-500 hover:bg-[#222]"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Horário Preferencial</label>
            <div className="grid grid-cols-4 gap-2 pb-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => setPreferredTime(preferredTime === time ? '' : time)}
                  className={cn(
                    "px-2 py-2 rounded-xl text-[10px] font-black transition-all border",
                    preferredTime === time 
                      ? "bg-emerald-500 text-[#0D0D0D] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                      : "bg-[#1A1A1A] text-neutral-500 border-white/[0.05] hover:border-white/10"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Modalidade Preferencial</label>
            <div className="grid grid-cols-2 gap-2 pb-2">
              {MODALITIES.map((mod) => (
                <button
                  key={mod}
                  onClick={() => setPreferredModality(preferredModality === mod ? '' : mod)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-[10px] font-black transition-all border uppercase text-left",
                    preferredModality === mod 
                      ? "bg-emerald-500 text-[#0D0D0D] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                      : "bg-[#1A1A1A] text-neutral-500 border-white/[0.05] hover:border-white/10"
                  )}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleAddOrUpdateStudent}
              className="w-full bg-emerald-500 text-[#0D0D0D] py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 active:scale-95 transition-all"
            >
              {editingStudent ? 'Salvar Alterações' : 'Adicionar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Agenda (Gerenciar Horário) */}
      <Modal isOpen={isAgendaModalOpen} onClose={() => { setIsAgendaModalOpen(false); setSelectedBookingModality(''); setBookingSearchTerm(''); }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black tracking-tighter uppercase">Gerenciar Horário</h2>
          <button onClick={() => { setIsAgendaModalOpen(false); setSelectedBookingModality(''); }} className="text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <p className="text-[13px] text-neutral-500 mb-6 font-medium tracking-tight">Selecione o horário e as modalidades desejadas.</p>

        {/* Time Selection inside Modal */}
        <div className="mb-8">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Horário da Aula</label>
          <div className="grid grid-cols-4 gap-2 pb-2">
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                onClick={() => {
                  setSelectedTimeSlot(time);
                  setSelectedBookingModality(''); // Reset modality selection when time changes
                }}
                className={cn(
                  "px-2 py-2 rounded-xl text-[10px] font-black transition-all border",
                  selectedTimeSlot === time 
                    ? "bg-emerald-500 text-[#0D0D0D] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                    : "bg-[#1A1A1A] text-neutral-500 border-white/[0.05] hover:border-white/10"
                )}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Modality Selection */}
        <div className="grid grid-cols-2 gap-2 mb-8">
          {MODALITIES.map((mod) => {
            const key = `${selectedAgendaDate}-${selectedTimeSlot}`;
            const isActive = (agendaEvents[key]?.modalities || []).find(m => m.modality === mod);
            
            return (
              <button
                key={mod}
                onClick={() => handleToggleModality(selectedTimeSlot, mod)}
                className={cn(
                  "py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-center leading-tight flex items-center justify-center gap-2",
                  isActive 
                    ? "bg-emerald-500 text-[#0D0D0D] shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                    : "bg-[#1A1A1A] text-neutral-500 hover:bg-[#222] border border-white/[0.02]"
                )}
              >
                {isActive && <Check size={12} strokeWidth={4} />}
                {mod}
              </button>
            );
          })}
        </div>

        {/* Booking Management Section */}
        <AnimatePresence>
          {(agendaEvents[`${selectedAgendaDate}-${selectedTimeSlot}`]?.modalities || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              <div className="h-px bg-white/[0.05] w-full" />
              
              {/* Select Modality to Add Students */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Incluir Aluno em:</label>
                <div className="flex flex-wrap gap-2">
                  {(agendaEvents[`${selectedAgendaDate}-${selectedTimeSlot}`]?.modalities || []).map(m => (
                    <button
                      key={m.modality}
                      onClick={() => setSelectedBookingModality(m.modality)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all",
                        selectedBookingModality === m.modality 
                          ? "bg-emerald-500 text-[#0D0D0D]" 
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      )}
                    >
                      {m.modality}
                    </button>
                  ))}
                </div>
              </div>

              {selectedBookingModality && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Nome do Aluno</label>
                    <button 
                      onClick={() => setIsExperimental(!isExperimental)}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black transition-colors",
                        isExperimental ? "bg-amber-500 text-[#0D0D0D]" : "bg-neutral-800 text-neutral-500"
                      )}
                    >
                      <Zap size={10} className={isExperimental ? "fill-[#0D0D0D]" : ""} />
                      EXPERIMENTAL
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        placeholder={isExperimental ? "Nome do aluno experimental..." : "Buscar aluno regular..."}
                        value={bookingSearchTerm}
                        onChange={(e) => setBookingSearchTerm(e.target.value)}
                        className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-emerald-500/50 text-white"
                      />
                      
                      {/* Quick Suggestions for Regular Students */}
                      {!isExperimental && bookingSearchTerm.length > 1 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-[#1A1A1A] border border-white/[0.08] rounded-xl shadow-2xl z-10 overflow-hidden">
                          {students
                            .filter(s => s.name.toLowerCase().includes(bookingSearchTerm.toLowerCase()))
                            .map(s => (
                              <button
                                key={s.id}
                                onClick={() => handleAddBooking(s.name, false)}
                                className="w-full text-left px-4 py-2 text-xs hover:bg-emerald-500 hover:text-[#0D0D0D] transition-colors"
                              >
                                {s.name}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleAddBooking(bookingSearchTerm, isExperimental)}
                      disabled={!bookingSearchTerm.trim()}
                      className="bg-emerald-500 text-[#0D0D0D] px-4 rounded-xl font-black text-xs uppercase disabled:opacity-50"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              {/* List Bookings per Modality */}
              <div className="space-y-4 pt-2">
                {(agendaEvents[`${selectedAgendaDate}-${selectedTimeSlot}`]?.modalities || []).map(m => (
                  <div key={m.modality} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black text-emerald-500 tracking-tighter uppercase">{m.modality} ({m.bookings.length})</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {m.bookings.map(b => (
                        <div key={b.id} className="flex items-center justify-between bg-[#0D0D0D]/50 border border-white/[0.02] p-3 rounded-xl group">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", b.isExperimental ? "bg-amber-500/10 text-amber-500" : "bg-neutral-800 text-neutral-500")}>
                              {b.isExperimental ? <Zap size={12} className="fill-amber-500" /> : <User size={12} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-neutral-300">{b.studentName}</span>
                              {b.isExperimental && (
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5">EXPERIMENTAL</span>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveBooking(m.modality, b.id)}
                            className="text-neutral-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {m.bookings.length === 0 && (
                        <div className="text-[10px] text-neutral-700 font-bold uppercase py-2 text-center border border-dashed border-white/[0.03] rounded-xl">
                          Nenhum agendamento
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-8 mt-auto">
          <button 
            onClick={() => { setIsAgendaModalOpen(false); setSelectedBookingModality(''); }}
            className="w-full bg-white text-[#0D0D0D] py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-neutral-200 active:scale-95 transition-all shadow-xl"
          >
            Concluído
          </button>
        </div>
      </Modal>

      {/* Modal Financeiro (Novo Lançamento) */}
      <Modal isOpen={isFinanceModalOpen} onClose={() => { setIsFinanceModalOpen(false); setNewTransDesc(''); setNewTransValue(''); setEditingTransaction(null); }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black tracking-tighter uppercase">{editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
          <button onClick={() => { setIsFinanceModalOpen(false); setEditingTransaction(null); }} className="text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <p className="text-[13px] text-neutral-500 mb-8 font-medium tracking-tight">
          {editingTransaction ? 'Atualize os dados da transação.' : 'Adicione uma receita ou despesa.'}
        </p>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Data</label>
            <input 
              type="date" 
              value={newTransDate}
              onChange={(e) => setNewTransDate(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-4 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setNewTransType('in')}
                className={cn(
                  "py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                  newTransType === 'in' ? "bg-[#1A1A1A] text-neutral-400 border border-white/[0.05]" : "text-neutral-600"
                )}
              >
                Receita
              </button>
              <button 
                onClick={() => setNewTransType('out')}
                className={cn(
                  "py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                  newTransType === 'out' ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]" : "text-neutral-600"
                )}
              >
                Despesa
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setNewTransStatus('pending')}
                className={cn(
                  "py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                  newTransStatus === 'pending' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "text-neutral-600"
                )}
              >
                {newTransType === 'in' ? 'A Receber' : 'A Pagar'}
              </button>
              <button 
                onClick={() => setNewTransStatus('completed')}
                className={cn(
                  "py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                  newTransStatus === 'completed' ? "bg-emerald-500 text-[#0D0D0D] shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-neutral-600"
                )}
              >
                {newTransType === 'in' ? 'Recebido' : 'Pago'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Descrição</label>
            <input 
              type="text" 
              placeholder="Ex: Mensalidade, Aluguel..." 
              value={newTransDesc}
              onChange={(e) => setNewTransDesc(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-4 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Valor (R$)</label>
            <input 
              type="number" 
              placeholder="0,00" 
              value={newTransValue}
              onChange={(e) => setNewTransValue(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl py-4 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
            />
          </div>

          <div className="pt-4">
            <button 
              onClick={handleAddTransaction}
              className="w-full bg-emerald-500 text-[#0D0D0D] py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 active:scale-95 transition-all"
            >
              {editingTransaction ? 'Salvar Alterações' : 'Adicionar Lançamento'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0D0D0D]/80 backdrop-blur-xl border-t border-white/[0.05] px-6 py-4 flex items-center justify-around z-[100]">
        <NavItem 
          id="home" 
          icon={LayoutDashboard} 
          label="Home" 
          active={view === 'home'} 
          onClick={() => setView('home')} 
        />
        <NavItem 
          id="alunos" 
          icon={Users} 
          label="Alunos" 
          active={view === 'alunos'} 
          onClick={() => setView('alunos')} 
        />
        <NavItem 
          id="experimentais" 
          icon={Zap} 
          label="Exps" 
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
          label="Financeiro" 
          active={view === 'financeiro'} 
          onClick={() => setView('financeiro')} 
        />
      </nav>
    </div>
  );
}
