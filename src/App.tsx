/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  User as UserIcon, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  Search, 
  LogOut, 
  Users,
  Building2,
  GraduationCap,
  FileUp,
  Eye,
  EyeOff,
  Download,
  Paperclip,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Offer, Application, UserRole } from './types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import optiStageLogo from './assets/optistage_logo.png';

// --- Components ---

const Navbar = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => (
  <nav className="bg-white border-b border-zinc-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
    <div className="flex items-center gap-3">
      <img src={optiStageLogo} alt="OptiStage" className="h-10 w-10 rounded-xl object-cover" />
      <div>
        <span className="font-extrabold text-xl tracking-tight text-zinc-900">OptiStage</span>
        <p className="text-xs text-zinc-400 leading-none">منصة طلبة الجزائر للبحث عن تربصات</p>
      </div>
    </div>
    {user && (
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
            <p className="text-xs text-zinc-500 capitalize">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
            <UserIcon className="w-5 h-5 text-zinc-600" />
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    )}
  </nav>
);

const Badge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    closed: 'bg-zinc-50 text-zinc-700 border-zinc-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.pending} capitalize`}>
      {status}
    </span>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);

  // Data States
  const [offers, setOffers] = useState<Offer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setView('dashboard');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [offersRes, appsRes] = await Promise.all([
        fetch(`/api/offers?role=${user.role}&company_id=${user.id}`),
        fetch(`/api/applications?role=${user.role}&${user.role === 'student' ? 'student_id' : 'company_id'}=${user.id}`)
      ]);
      setOffers(await offersRes.json());
      setApplications(await appsRes.json());

      if (user.role === 'admin') {
        const [usersRes, statsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/stats')
        ]);
        setUsers(await usersRes.json());
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        setView('dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, name })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Inscription réussie sur OptiStage ! En attente de validation par l'administrateur.");
        setView('login');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setView('login');
  };

  // --- Views ---

  if (view === 'login' || view === 'register') {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Navbar user={null} onLogout={() => {}} />
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-200 w-full max-w-md"
          >
            <div className="flex justify-center mb-4">
              <img src={optiStageLogo} alt="OptiStage Logo" className="h-16 w-16 rounded-2xl object-cover shadow-md" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              {view === 'login' ? 'Connexion' : 'Inscription'}
            </h2>
            <p className="text-zinc-500 mb-8">
              {view === 'login' ? 'Accédez à votre espace OptiStage' : 'Rejoignez OptiStage — منصة طلبة الجزائر للبحث عن تربصات'}
            </p>

            <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {view === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Nom complet</label>
                    <input 
                      required
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Rôle</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`py-2 rounded-lg border text-sm font-medium transition-all ${role === 'student' ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-50'}`}
                      >
                        Étudiant
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('company')}
                        className={`py-2 rounded-lg border text-sm font-medium transition-all ${role === 'company' ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-50'}`}
                      >
                        Entreprise
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Mot de passe</label>
                <div className="relative">
                  <input 
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Chargement...' : (view === 'login' ? 'Se connecter' : "S'inscrire")}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
              <button 
                onClick={() => setView(view === 'login' ? 'register' : 'login')}
                className="text-sm text-indigo-600 hover:underline font-medium"
              >
                {view === 'login' ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (user?.status === 'pending') {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-200 w-full max-w-md text-center">
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Compte en attente</h2>
            <p className="text-zinc-500 mb-6">Votre compte est en cours de validation par l'administrateur. Vous recevrez un accès complet une fois validé.</p>
            <button onClick={handleLogout} className="text-indigo-600 font-medium hover:underline">Retour à la connexion</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        {user?.role === 'student' && <StudentDashboard user={user} offers={offers} applications={applications} onRefresh={fetchData} />}
        {user?.role === 'company' && <CompanyDashboard user={user} offers={offers} applications={applications} onRefresh={fetchData} />}
        {user?.role === 'admin' && <AdminDashboard user={user} users={users} offers={offers} applications={applications} stats={stats} onRefresh={fetchData} />}
      </main>
    </div>
  );
}

// --- Dashboard Components ---

const StudentDashboard = ({ user, offers, applications, onRefresh }: any) => {
  const [activeTab, setActiveTab] = useState<'offers' | 'my-apps'>('offers');
  const [applyingTo, setApplyingTo] = useState<Offer | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvBase64, setCvBase64] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredOffers = offers.filter((o: Offer) => {
    const q = searchQuery.toLowerCase();
    return (
      o.title.toLowerCase().includes(q) ||
      (o.company_name || '').toLowerCase().includes(q) ||
      (o.location || '').toLowerCase().includes(q)
    );
  });

  // Build a Set of offer IDs the student has already applied to
  const appliedOfferIds = new Set(
    applications.map((a: Application) => String(a.offer_id))
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvFile(file);
    const reader = new FileReader();
    reader.onload = () => setCvBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleApply = async () => {
    if (!applyingTo) return;
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: user.id,
        offer_id: applyingTo.id,
        cover_letter: coverLetter,
        cv_data: cvBase64 || 'no_cv'
      })
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Erreur lors de la candidature.');
    }
    setApplyingTo(null);
    setCoverLetter('');
    setCvFile(null);
    setCvBase64('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Espace Étudiant</h1>
        <div className="flex bg-white rounded-lg p-1 border border-zinc-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'offers' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            Offres
          </button>
          <button 
            onClick={() => setActiveTab('my-apps')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'my-apps' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            Mes Candidatures
          </button>
        </div>
      </div>

      {activeTab === 'offers' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, entreprise ou lieu..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white shadow-sm text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.length === 0 ? (
              <p className="text-zinc-400 text-sm col-span-3 text-center py-10">Aucune offre ne correspond à votre recherche.</p>
            ) : filteredOffers.map((offer: Offer) => (
            <motion.div 
              layout
              key={offer.id}
              className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 p-3 rounded-xl">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <Badge status={offer.status} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">{offer.title}</h3>
              <p className="text-sm text-indigo-600 font-medium mb-3">{offer.company_name}</p>
              <p className="text-sm text-zinc-500 line-clamp-3 mb-4 flex-1">{offer.description}</p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="w-3.5 h-3.5" /> {offer.duration}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Search className="w-3.5 h-3.5" /> {offer.location}
                </div>
              </div>
              {(() => {
                const alreadyApplied = appliedOfferIds.has(String(offer.id));
                return (
                  <button
                    onClick={() => !alreadyApplied && setApplyingTo(offer)}
                    disabled={alreadyApplied}
                    className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      alreadyApplied
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                        : 'bg-zinc-900 text-white hover:bg-zinc-800'
                    }`}
                  >
                    {alreadyApplied ? (
                      <><CheckCircle className="w-4 h-4" /> Déjà postulé</>
                    ) : 'Postuler'}
                  </button>
                );
              })()}
            </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Offre</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Entreprise</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {applications.map((app: Application) => (
                <tr key={app.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {app.offer_title}
                    {app.feedback && (
                      <div className="mt-1 text-xs text-indigo-600 bg-indigo-50 p-2 rounded border border-indigo-100 italic">
                        " {app.feedback} "
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{app.company_name}</td>
                  <td className="px-6 py-4 text-zinc-500 text-sm">{new Date(app.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><Badge status={app.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {app.acceptance_document && (
                        <a
                          href={app.acceptance_document}
                          download={`acceptation_${app.offer_title || 'document'}.pdf`}
                          className="text-emerald-600 text-sm font-medium hover:underline flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" /> Télécharger document
                        </a>
                      )}
                      {app.status === 'accepted' && !app.report_data && (
                        <button className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">
                          <FileUp className="w-4 h-4" /> Rapport
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Apply Modal */}
      <AnimatePresence>
        {applyingTo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[60]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-lg"
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Postuler pour {applyingTo.title}</h2>
              <p className="text-zinc-500 mb-6">Envoyez votre candidature à {applyingTo.company_name}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Lettre de motivation</label>
                  <textarea 
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Pourquoi êtes-vous le candidat idéal ?"
                  />
                </div>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    cvFile ? 'border-emerald-400 bg-emerald-50' : 'border-zinc-200 hover:border-indigo-400'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {cvFile ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-emerald-700">{cvFile.name}</p>
                      <p className="text-xs text-emerald-500 mt-1">Cliquez pour changer</p>
                    </>
                  ) : (
                    <>
                      <FileUp className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-zinc-600">Cliquez pour uploader votre CV (PDF)</p>
                      <p className="text-xs text-zinc-400 mt-1">Maximum 5MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setApplyingTo(null)}
                  className="flex-1 py-2.5 border border-zinc-300 rounded-lg font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleApply}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Envoyer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CompanyDashboard = ({ user, offers, applications, onRefresh }: any) => {
  const [activeTab, setActiveTab] = useState<'offers' | 'candidates'>('offers');
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: '', description: '', requirements: '', location: '', duration: '' });
  const [decidingApp, setDecidingApp] = useState<{id: number, status: string} | null>(null);
  const [feedback, setFeedback] = useState('');
  const [acceptanceFile, setAcceptanceFile] = useState<File | null>(null);
  const [acceptanceBase64, setAcceptanceBase64] = useState<string>('');
  const acceptanceFileRef = useRef<HTMLInputElement>(null);
  const [previewingCvApp, setPreviewingCvApp] = useState<Application | null>(null);

  const handleAcceptanceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAcceptanceFile(file);
    const reader = new FileReader();
    reader.onload = () => setAcceptanceBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const closeDecisionModal = () => {
    setDecidingApp(null);
    setFeedback('');
    setAcceptanceFile(null);
    setAcceptanceBase64('');
  };

  const handleAddOffer = async () => {
    await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newOffer, company_id: user.id })
    });
    setShowAddOffer(false);
    setNewOffer({ title: '', description: '', requirements: '', location: '', duration: '' });
    onRefresh();
  };

  const handleAppStatus = async (id: number, status: string, feedback: string = '', acceptance_document: string = '') => {
    await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, feedback, acceptance_document })
    });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Espace Entreprise</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-lg p-1 border border-zinc-200 shadow-sm">
            <button 
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'offers' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}`}
            >
              Mes Offres
            </button>
            <button 
              onClick={() => setActiveTab('candidates')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'candidates' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}`}
            >
              Candidats
            </button>
          </div>
          <button 
            onClick={() => setShowAddOffer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Publier
          </button>
        </div>
      </div>

      {activeTab === 'offers' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer: Offer) => (
            <div key={offer.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <Badge status={offer.status} />
                <span className="text-xs text-zinc-400">{new Date(offer.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">{offer.title}</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{offer.description}</p>
              <div className="flex items-center gap-4 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Users className="w-3.5 h-3.5" /> 
                  {applications.filter((a: any) => a.offer_id === offer.id).length} candidats
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Étudiant</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Offre</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {applications.map((app: Application) => (
                <tr key={app.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{app.student_name}</div>
                    <div className="text-xs text-zinc-500">{app.student_email}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{app.offer_title}</td>
                  <td className="px-6 py-4"><Badge status={app.status} /></td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {app.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => setDecidingApp({ id: app.id, status: 'accepted' })}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Accepter"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setDecidingApp({ id: app.id, status: 'rejected' })}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Refuser"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {app.acceptance_document && (
                      <a
                        href={app.acceptance_document}
                        download={`acceptation_${app.offer_title || 'document'}.pdf`}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-flex"
                        title="Télécharger le document d'acceptation"
                      >
                        <Paperclip className="w-5 h-5" />
                      </a>
                    )}
                    <button
                      onClick={() => setPreviewingCvApp(app)}
                      className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Voir le CV"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Decision Modal */}
      <AnimatePresence>
        {decidingApp && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[60]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">
                {decidingApp.status === 'accepted' ? 'Accepter la candidature' : 'Refuser la candidature'}
              </h2>
              <p className="text-zinc-500 mb-6">Ajoutez un message pour l'étudiant (optionnel).</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Commentaire / Feedback</label>
                  <textarea 
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ex: Nous sommes ravis de vous accueillir..."
                  />
                </div>

                {/* PDF upload only for acceptance */}
                {decidingApp.status === 'accepted' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Document d'acceptation (PDF, optionnel)
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
                        acceptanceFile ? 'border-emerald-400 bg-emerald-50' : 'border-zinc-200 hover:border-indigo-400'
                      }`}
                      onClick={() => acceptanceFileRef.current?.click()}
                    >
                      <input
                        ref={acceptanceFileRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleAcceptanceFileChange}
                      />
                      {acceptanceFile ? (
                        <>
                          <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-emerald-700">{acceptanceFile.name}</p>
                          <p className="text-xs text-emerald-500 mt-0.5">Cliquez pour changer</p>
                        </>
                      ) : (
                        <>
                          <FileUp className="w-7 h-7 text-zinc-400 mx-auto mb-1" />
                          <p className="text-sm font-medium text-zinc-600">Cliquez pour joindre un document PDF</p>
                          <p className="text-xs text-zinc-400 mt-0.5">Lettre d'acceptation, convention de stage...</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={closeDecisionModal}
                  className="flex-1 py-2.5 border border-zinc-300 rounded-lg font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    handleAppStatus(decidingApp.id, decidingApp.status, feedback, acceptanceBase64);
                    closeDecisionModal();
                  }}
                  className={`flex-1 py-2.5 text-white rounded-lg font-medium transition-colors ${decidingApp.status === 'accepted' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CV Preview Modal */}
      <AnimatePresence>
        {previewingCvApp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-4xl flex flex-col"
              style={{ height: '90vh' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    CV de {previewingCvApp.student_name}
                  </h2>
                  <p className="text-sm text-zinc-500">Candidature pour : {previewingCvApp.offer_title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {previewingCvApp.cv_data && previewingCvApp.cv_data !== 'no_cv' && (
                    <a
                      href={previewingCvApp.cv_data}
                      download={`CV_${previewingCvApp.student_name || 'etudiant'}.pdf`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Télécharger
                    </a>
                  )}
                  <button
                    onClick={() => setPreviewingCvApp(null)}
                    className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-hidden rounded-b-2xl">
                {previewingCvApp.cv_data && previewingCvApp.cv_data !== 'no_cv' ? (
                  <iframe
                    src={previewingCvApp.cv_data}
                    title="CV Étudiant"
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4">
                    <FileText className="w-16 h-16 opacity-30" />
                    <p className="text-lg font-medium">Aucun CV soumis</p>
                    <p className="text-sm">L'étudiant n'a pas joint de CV à sa candidature.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Offer Modal */}
      <AnimatePresence>
        {showAddOffer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[60]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl"
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Nouvelle Offre de Stage</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Titre de l'offre</label>
                  <input 
                    type="text" 
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Développeur Fullstack Junior"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                  <textarea 
                    rows={3}
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Détails du stage..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Lieu</label>
                  <input 
                    type="text" 
                    value={newOffer.location}
                    onChange={(e) => setNewOffer({...newOffer, location: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Paris / Télétravail"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Durée</label>
                  <input 
                    type="text" 
                    value={newOffer.duration}
                    onChange={(e) => setNewOffer({...newOffer, duration: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="6 mois"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAddOffer(false)}
                  className="flex-1 py-2.5 border border-zinc-300 rounded-lg font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAddOffer}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Publier l'offre
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminDashboard = ({ user, users, offers, applications, stats, onRefresh }: any) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'offers'>('stats');
  const [confirmDeleteId, setConfirmDeleteId] = useState<any>(null);

  const handleUserStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    onRefresh();
  };

  const handleOfferStatus = async (id: number, status: string) => {
    await fetch(`/api/offers/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    onRefresh();
  };

  const handleDeleteOffer = async (id: any) => {
    await fetch(`/api/offers/${id}`, { method: 'DELETE' });
    setConfirmDeleteId(null);
    onRefresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Administration</h1>
        <div className="flex bg-white rounded-lg p-1 border border-zinc-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            Stats
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            Utilisateurs
          </button>
          <button 
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'offers' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            Modération
          </button>
        </div>
      </div>

      {activeTab === 'stats' && stats && (() => {
        const studentCount = users.filter((u: User) => u.role === 'student').length;
        const companyCount = users.filter((u: User) => u.role === 'company').length;

        const appsByStatus = [
          { name: 'En attente', value: applications.filter((a: any) => a.status === 'pending').length, color: '#f59e0b' },
          { name: 'Acceptées', value: applications.filter((a: any) => a.status === 'accepted').length, color: '#10b981' },
          { name: 'Refusées', value: applications.filter((a: any) => a.status === 'rejected').length, color: '#f43f5e' },
        ];

        const roleData = [
          { name: 'Étudiants', value: studentCount, color: '#6366f1' },
          { name: 'Entreprises', value: companyCount, color: '#0ea5e9' },
        ];

        const barData = [
          { name: 'Utilisateurs', total: stats.users },
          { name: 'Offres', total: stats.offers },
          { name: 'Candidatures', total: stats.applications },
          { name: 'Acceptées', total: stats.accepted },
        ];

        return (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Utilisateurs', value: stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Offres', value: stats.offers, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Candidatures', value: stats.applications, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Stages validés', value: stats.accepted, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={item.label}
                  className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
                >
                  <div className={`${item.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <p className="text-sm font-medium text-zinc-500">{item.label}</p>
                  <p className="text-3xl font-bold text-zinc-900 mt-1">{item.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
              >
                <h3 className="text-base font-semibold text-zinc-800 mb-6">Vue d'ensemble</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} barSize={40}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                      cursor={{ fill: '#f4f4f5' }}
                    />
                    <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Pie Charts */}
              <div className="grid grid-rows-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
                >
                  <h3 className="text-base font-semibold text-zinc-800 mb-2">Répartition des utilisateurs</h3>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width={120} height={100}>
                      <PieChart>
                        <Pie data={roleData} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={4}>
                          {roleData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e4e4e7' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1">
                      {roleData.map(d => (
                        <div key={d.name} className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-zinc-600">{d.name}:</span>
                          <span className="font-semibold text-zinc-900">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
                >
                  <h3 className="text-base font-semibold text-zinc-800 mb-2">Statut des candidatures</h3>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width={120} height={100}>
                      <PieChart>
                        <Pie data={appsByStatus} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={4}>
                          {appsByStatus.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e4e4e7' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1">
                      {appsByStatus.map(d => (
                        <div key={d.name} className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-zinc-600">{d.name}:</span>
                          <span className="font-semibold text-zinc-900">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {users.map((u: User) => (
                <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{u.name}</div>
                    <div className="text-xs text-zinc-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-sm text-zinc-600">
                      {u.role === 'student' ? <GraduationCap className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4"><Badge status={u.status} /></td>
                  <td className="px-6 py-4 text-right">
                    {u.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleUserStatus(u.id, 'active')}
                          className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700 transition-colors"
                        >
                          Valider
                        </button>
                        <button 
                          onClick={() => handleUserStatus(u.id, 'rejected')}
                          className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-md hover:bg-rose-700 transition-colors"
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'offers' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Offre</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Entreprise</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {offers.map((o: Offer) => (
                <tr key={o.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">{o.title}</td>
                  <td className="px-6 py-4 text-zinc-600">{o.company_name}</td>
                  <td className="px-6 py-4"><Badge status={o.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {o.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleOfferStatus(o.id, 'active')}
                            className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700 transition-colors"
                          >
                            Approuver
                          </button>
                          <button 
                            onClick={() => handleOfferStatus(o.id, 'closed')}
                            className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-md hover:bg-rose-700 transition-colors"
                          >
                            Rejeter
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => setConfirmDeleteId(o.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Supprimer l'offre"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[60]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-sm text-center"
            >
              <div className="bg-rose-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">Supprimer l'offre ?</h2>
              <p className="text-zinc-500 text-sm mb-6">Cette action est irréversible. L'offre sera définitivement supprimée.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-2.5 border border-zinc-300 rounded-lg font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteOffer(confirmDeleteId)}
                  className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
