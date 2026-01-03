import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Home,
  Eye,
  FolderOpen,
  Plus,
  FileText,
  ExternalLink,
  Calendar,
  UserPlus,
  History,
  Lock,
  Edit,
  Trash2,
  Zap,
  AlertTriangle,
  MessageCircle,
  Star,
  BookOpen,
  Ear,
  Accessibility,
  Activity,
  HeartPulse,
  UserCheck,
  Phone,
  X
} from 'lucide-react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { PcdProfile, Student } from '../types';
import { useResource } from '../contexts/ResourceContext';
import { useAuth } from '../contexts/AuthContext';

const InfoCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  children: React.ReactNode
}> = ({ title, icon, colorClass, bgClass, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
    <div className={`px-5 py-3 border-b border-slate-100 flex items-center gap-2 ${bgClass}`}>
      <div className={`${colorClass}`}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
    </div>
    <div className="p-5 flex-1 text-sm text-slate-600 leading-relaxed">
      {children}
    </div>
  </div>
);

export const StudentDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { students, deleteStudent, refreshStudents } = useResource();
  const { user, profile } = useAuth();

  useEffect(() => {
    // If student is not found (e.g. direct link navigation), try to refresh
    if (id && !students.find(s => s.id === id)) {
      refreshStudents();
    }
  }, [id, students, refreshStudents]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const student = useMemo(() => students.find(s => s.id === id), [students, id]);

  const canDelete = React.useMemo(() => {
    return profile?.tipo === 'Administrador' || profile?.tipo === 'Coordenador';
  }, [profile]);

  const canEdit = React.useMemo(() => {
    if (canDelete) return true;
    if (profile?.tipo === 'Professor' && student?.pdt?.id && user?.id === student.pdt.id) return true;
    return false;
  }, [profile, student, user, canDelete]);

  const handleEdit = () => {
    if (canEdit) {
      // Assuming reuse of new student page or separate edit page
      navigate(`/student/edit/${id}`);
    }
  };

  const handleDeleteClick = () => {
    if (canDelete) {
      setShowDeleteModal(true);
      setDeleteConfirmation('');
    }
  };

  const confirmDelete = async () => {
    if (!student) return;
    const requiredText = `DELETE O ALUNO ${student.name.toUpperCase()} DO APLICATIVO`;

    if (deleteConfirmation === requiredText) {
      await deleteStudent(student.id);
      navigate('/'); // Redirect to list
    } else {
      alert('Texto de confirmação incorreto.');
    }
  };

  if (!student) {
    return (
      <div className="flex min-h-screen bg-background-light">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center lg:ml-64">
          <div className="text-slate-500">Carregando ou aluno não encontrado...</div>
        </div>
      </div>
    );
  }

  // Cast profile safely related to our new structure
  const pcdData = (student.pcdProfile || {}) as PcdProfile;

  const quickAccess = pcdData.quickAccess || { communicationStyle: '', avoid: '', crisisStrategy: '', mainAdaptation: '' };
  const medication = pcdData.medication || { info: '', impact: '' };
  const behavior = pcdData.behavior || { triggers: '', regulationStrategy: '' };
  const communication = pcdData.communication || { expression: '', comprehension: '' };
  const potential = pcdData.potential || { interests: [], strengths: '', rewards: '' };
  const learningStyle = pcdData.learningStyle || { format: '', time: '', environment: '' };
  const sensory = pcdData.sensory || { auditory: '', visual: '', tactile: '' };
  const autonomy = pcdData.autonomy || { bathroom: '', food: '', materials: '' };

  const pdtName = student.pdt?.name || 'Não atribuído';
  const pdtAvatar = student.pdt?.avatar;
  const pdtPhone = student.pdt?.phone;

  return (
    <div className="flex min-h-screen bg-background-light">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header
          title="Inclusão Escolar"
          user={{
            name: profile?.nome || "Usuário",
            role: profile?.tipo || "Visitante",
            image: profile?.foto || ""
          }}
          showSearch={false}
          showNotifications={false}
          hideUserSection={true}
          hideLogout={true}
          customTitleContent={
            <div className="w-full">
              {/* DESKTOP VIEW (Original Layout) - Hidden on Mobile */}
              <div className="hidden md:flex items-center gap-4">
                {canEdit && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg font-bold text-sm transition-all active:scale-95 shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                )}
                <div
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-slate-100 bg-cover bg-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundImage: `url('${student.photoUrl}')` }}
                  onClick={() => setIsPhotoModalOpen(true)}
                ></div>
                <div className="flex flex-col min-w-0">
                  <h1 className="text-xl font-bold text-slate-800 leading-tight flex items-center gap-2">
                    <span className="truncate">{student.name}</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white shadow-sm shrink-0" title="Matrícula Ativa"></div>
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
                      {student.class}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                      #{student.enrollmentId}
                    </span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap border ${student.status === 'Laudo Atualizado' ? 'bg-green-50 text-green-700 border-green-100' :
                        student.status === 'Pendente Revisão' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                          student.status === 'Aguardando Laudo' ? 'bg-slate-50 text-slate-700 border-slate-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                      {student.status || 'Sem Status'}
                    </span>
                  </div>
                </div>
              </div>

              {/* MOBILE VIEW (New Layout) - Visible only on Mobile */}
              <div className="flex md:hidden items-center gap-3 w-full">
                {/* 1. Edit Button */}
                {canEdit && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center justify-center bg-indigo-50 text-indigo-700 border border-indigo-200 w-9 h-9 rounded-lg transition-all active:scale-95 shrink-0"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}

                {/* 2. Photo */}
                <div
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-slate-100 bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url('${student.photoUrl}')` }}
                  onClick={() => setIsPhotoModalOpen(true)}
                ></div>

                {/* 3. Info (Name / Class - Status) */}
                <div className="flex flex-col min-w-0 flex-1">
                  {/* Line 1: Name */}
                  <h1 className="text-sm font-bold text-slate-900 leading-tight truncate w-full">
                    {student.name}
                  </h1>

                  {/* Line 2: Class */}
                  <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {student.class}
                  </div>

                  {/* Line 3: Status */}
                  <div className={`text-xs font-bold truncate ${student.status === 'Laudo Atualizado' ? 'text-green-600' :
                    student.status === 'Pendente Revisão' ? 'text-amber-600' :
                      student.status === 'Aguardando Laudo' ? 'text-slate-500' :
                        'text-blue-600'
                    }`}>
                    {student.status}
                  </div>
                </div>
              </div>
            </div>
          }
        >

        </Header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex mb-6">
            <ol className="flex items-center space-x-2">
              <li>
                <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-500 flex items-center">
                  <Home className="w-5 h-5" />
                </button>
              </li>
              <li><span className="text-slate-300">/</span></li>
              <li><button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-700 font-medium text-sm">Alunos Registrados</button></li>
              <li><span className="text-slate-300">/</span></li>
              <li aria-current="page" className="text-primary-600 font-bold text-sm">Prontuário #{student.enrollmentId}</li>
            </ol>
          </nav>



          {/* Quick Access Card - RESUMO PARA O PROFESSOR */}
          <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-indigo-600 w-5 h-5 fill-indigo-600" />
              <h2 className="text-lg font-black text-indigo-900 uppercase tracking-wide">Cartão de Acesso Rápido - Professor</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Diagnóstico Principal</p>
                <p className="font-bold text-slate-800 leading-tight">{profile.diagnosis || 'Não informado'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Comunicação</p>
                <p className="font-medium text-slate-700 text-sm leading-tight">{quickAccess.communicationStyle || '-'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                <p className="text-xs font-bold text-red-400 uppercase mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> O que evitar
                </p>
                <p className="font-medium text-slate-700 text-sm leading-tight">{quickAccess.avoid || '-'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Gestão de Crise</p>
                <p className="font-medium text-slate-700 text-sm leading-tight">{quickAccess.crisisStrategy || '-'}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-indigo-200/50 flex items-start gap-2">
              <Star className="w-4 h-4 text-indigo-500 mt-0.5" />
              <p className="text-sm text-indigo-800">
                <strong>Adaptação Principal:</strong> {quickAccess.mainAdaptation || 'Nenhuma adaptação principal registrada'}
              </p>
            </div>
          </div>

          {/* Detailed Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {/* Medicação */}
            <InfoCard
              title="Medicação"
              icon={<Activity className="w-5 h-5" />}
              colorClass="text-pink-600"
              bgClass="bg-pink-50"
            >
              <div className="space-y-3">
                <div className="flex gap-2">
                  <span className="font-bold text-slate-700">Uso:</span>
                  <span>{medication.info || 'Não faz uso contínuo.'}</span>
                </div>
                {medication.impact && (
                  <div className="bg-pink-50/50 p-3 rounded-lg border border-pink-100">
                    <p className="text-xs font-bold text-pink-700 uppercase mb-1">Impacto em Sala de Aula</p>
                    <p className="text-slate-700">{medication.impact}</p>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Gatilhos e Comportamento */}
            <InfoCard
              title="Gatilhos & Comportamento"
              icon={<AlertTriangle className="w-5 h-5" />}
              colorClass="text-orange-600"
              bgClass="bg-orange-50"
            >
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-slate-700 mb-1 text-xs uppercase">O que desencadeia crises?</p>
                  <p>{behavior.triggers || 'Nenhum gatilho conhecido.'}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-700 mb-1 text-xs uppercase">Estratégia de Regulação</p>
                  <p className="bg-white border border-slate-200 p-2 rounded-lg">{behavior.regulationStrategy || '-'}</p>
                </div>
              </div>
            </InfoCard>

            {/* Comunicação */}
            <InfoCard
              title="Comunicação"
              icon={<MessageCircle className="w-5 h-5" />}
              colorClass="text-blue-600"
              bgClass="bg-blue-50"
            >
              <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase shrink-0 mt-0.5">Expressão</span>
                  <span>{communication.expression || '-'}</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase shrink-0 mt-0.5">Compreensão</span>
                  <span>{communication.comprehension || '-'}</span>
                </li>
              </ul>
            </InfoCard>

            {/* Potencialidades e Hiperfocos */}
            <InfoCard
              title="Potencialidades & Hiperfocos"
              icon={<Star className="w-5 h-5" />}
              colorClass="text-yellow-600"
              bgClass="bg-yellow-50"
            >
              <div className="space-y-3">
                <div>
                  <p className="font-bold text-slate-700 mb-1 text-xs uppercase">Áreas de Interesse (Vínculo)</p>
                  <div className="flex flex-wrap gap-2">
                    {potential.interests && potential.interests.length > 0 ? potential.interests.map((int, i) => (
                      <span key={i} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium border border-yellow-200">{int}</span>
                    )) : <span className="text-slate-400 italic">Nenhum interesse registrado</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="font-bold text-slate-700 mb-1 text-xs uppercase">Pontos Fortes</p>
                    <p className="text-xs">{potential.strengths || '-'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 mb-1 text-xs uppercase">Recompensas</p>
                    <p className="text-xs">{potential.rewards || '-'}</p>
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Estilo de Aprendizagem */}
            <InfoCard
              title="Estilo de Aprendizagem & Adaptações"
              icon={<BookOpen className="w-5 h-5" />}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
            >
              <div className="space-y-3 text-sm">
                <p><strong>Formato:</strong> {learningStyle.format || '-'}</p>
                <p><strong>Tempo:</strong> {learningStyle.time || '-'}</p>
                <p><strong>Ambiente:</strong> {learningStyle.environment || '-'}</p>
              </div>
            </InfoCard>

            {/* Aspectos Sensoriais */}
            <InfoCard
              title="Aspectos Sensoriais"
              icon={<Ear className="w-5 h-5" />}
              colorClass="text-purple-600"
              bgClass="bg-purple-50"
            >
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold shrink-0 w-16">Auditivo:</span>
                  <span>{sensory.auditory || '-'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold shrink-0 w-16">Visual:</span>
                  <span>{sensory.visual || '-'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold shrink-0 w-16">Tátil:</span>
                  <span>{sensory.tactile || '-'}</span>
                </li>
              </ul>
            </InfoCard>

            {/* Autonomia e AVD */}
            <InfoCard
              title="Autonomia e Vida Diária (AVD)"
              icon={<Accessibility className="w-5 h-5" />}
              colorClass="text-cyan-600"
              bgClass="bg-cyan-50"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Banheiro</p>
                  <p className="text-xs leading-tight">{autonomy.bathroom || '-'}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Alimentação</p>
                  <p className="text-xs leading-tight">{autonomy.food || '-'}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Materiais</p>
                  <p className="text-xs leading-tight">{autonomy.materials || '-'}</p>
                </div>
              </div>
            </InfoCard>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">

              {/* Files */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="text-primary-600 w-6 h-6" />
                    <h2 className="text-lg font-bold text-slate-900">Documentos Anexados</h2>
                  </div>
                </div>
                <div className="p-0">
                  {student.attachments && student.attachments.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                      {student.attachments.map((file, index) => (
                        <li key={index} className="group flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className={`size-10 rounded-lg flex items-center justify-center border ${file.type === 'pdf' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{file.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{file.date} • {file.size}</p>
                            </div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-primary-600 transition-colors" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Nenhum documento anexado.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Metadata Sidebar */}
            <div className="lg:col-span-1 space-y-6">

              {/* PDT Card */}
              {student.pdt && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <UserCheck className="w-20 h-20 text-primary-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary-500" />
                    PDT (Professor Responsável)
                  </h3>
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div
                      className="size-12 rounded-full bg-slate-100 bg-cover bg-center border-2 border-white shadow-sm flex items-center justify-center text-slate-400"
                      style={pdtAvatar ? { backgroundImage: `url('${pdtAvatar}')` } : {}}
                    >
                      {!pdtAvatar && <UserCheck className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{pdtName}</p>
                      <p className="text-xs text-slate-500">Docente Tutor</p>
                    </div>
                  </div>
                  <div className="space-y-2 relative z-10">

                    {pdtPhone && (
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                        <Phone className="w-3 h-3" />
                        {pdtPhone}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Metadados do Registro</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-slate-400 w-5 h-5 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Cadastrado em</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {student.createdAt
                          ? new Date(student.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'Data desconhecida'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <UserPlus className="text-slate-400 w-5 h-5 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Criado por</p>
                      <p className="text-sm font-semibold text-slate-900">{student.createdBy || 'Sistema Legado'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <History className="text-slate-400 w-5 h-5 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Atualizado por</p>
                      {student.updatedBy ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="size-6 rounded-full bg-slate-200 bg-cover bg-center ring-1 ring-slate-100"></div>
                          <p className="text-sm font-semibold text-slate-900">{student.updatedBy}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-slate-900">-</p>
                      )}
                      {student.updatedAt && <p className="text-xs text-slate-400 mt-0.5">em {new Date(student.updatedAt).toLocaleDateString('pt-BR')}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Lock className="w-5 h-5" />
                  <h4 className="text-sm font-bold">Confidencialidade</h4>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed opacity-90">
                  Este prontuário contém dados sensíveis protegidos pela <strong>Lei Geral de Proteção de Dados (LGPD)</strong>. O acesso a esta página é monitorado para fins de auditoria e segurança.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">

                {canDelete && (
                  <button
                    onClick={handleDeleteClick}
                    className="col-span-1 flex items-center justify-center gap-2 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div >

      {showDeleteModal && student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Excluir Aluno</h3>
            </div>

            <p className="text-slate-600 mb-4 text-sm">
              Esta ação é irreversível. Todas as informações do aluno <strong>{student.name}</strong> serão apagadas permanentemente.
            </p>

            <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
              <p className="text-xs text-red-800 font-medium mb-1">Digite abaixo para confirmar:</p>
              <p className="text-xs font-mono text-red-600 select-all font-bold">
                DELETE O ALUNO {student.name.toUpperCase()} DO APLICATIVO
              </p>
            </div>

            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Digite o texto de confirmação"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-slate-600 text-sm font-bold hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmation !== `DELETE O ALUNO ${student.name.toUpperCase()} DO APLICATIVO`}
                className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {
        isPhotoModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsPhotoModalOpen(false)}
          >
            <div
              className="relative max-w-2xl max-h-[90vh] w-full p-4 flex flex-col items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 md:top-0 md:-right-10 text-white hover:text-gray-300 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                onClick={() => setIsPhotoModalOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={student.photoUrl}
                alt={`Foto de ${student.name}`}
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain border-4 border-white/10"
              />
              <p className="mt-4 text-white/80 font-medium text-lg text-center tracking-wide">{student.name}</p>
            </div>
          </div>
        )
      }
    </div >
  );
};