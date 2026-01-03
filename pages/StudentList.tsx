import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Paperclip, ChevronRight, ChevronLeft, MoreVertical, ChevronsUp } from 'lucide-react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Student } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useResource } from '../contexts/ResourceContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// MOCK_STUDENTS removed in favor of ResourceContext students

const StatusBadge: React.FC<{ status: Student['status'] }> = ({ status }) => {
  const styles = {
    'Laudo Atualizado': 'bg-green-100 text-green-800',
    'Pendente Revisão': 'bg-yellow-100 text-yellow-800',
    'Acompanhamento': 'bg-blue-100 text-blue-800',
    'Aguardando Laudo': 'bg-slate-100 text-slate-800'
  };

  const tooltips = {
    'Laudo Atualizado': 'Documento válido e recente. Garante segurança legal, registro no censo e direitos em vestibulares/ENEM.',
    'Pendente Revisão': 'Laudo antigo ou vencido. Pode não refletir a condição atual. Requer solicitação de reavaliação médica.',
    'Acompanhamento': 'Sem laudo fechado, mas com necessidades observadas (monitoria/psicólogo). Flexibilidade sem obrigatoriedade legal estrita.',
    'Aguardando Laudo': 'Família informou condição mas documento está pendente. Alerta vermelho para prazos e respaldo jurídico.'
  };

  return (
    <div className="group/status relative inline-block">
      <span className={`cursor-help inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status]}`}>
        {status}
      </span>
      {/* Tooltip */}
      <div className="invisible group-hover/status:visible absolute left-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl z-[100] transition-opacity opacity-0 group-hover/status:opacity-100 pointer-events-none">
        <p>{tooltips[status]}</p>
        <div className="absolute left-4 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800"></div>
      </div>
    </div>
  );
};

interface SortableStudentCardProps {
  student: Student;
  navigate: ReturnType<typeof useNavigate>;
  onMoveToFront: (id: string) => void;
  isDraggable?: boolean;
}

const SortableStudentCard: React.FC<SortableStudentCardProps> = ({ student, navigate, onMoveToFront, isDraggable }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: student.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:z-50 transition-all duration-300 flex flex-col relative ${isDraggable ? 'cursor-move' : ''}`}
    >
      {/* Actions Menu */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onMoveToFront(student.id); }}
          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          title="Mover para o início"
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag
        >
          <ChevronsUp className="w-4 h-4" />
        </button>
      </div>

      <div
        onClick={() => navigate(`/student/${student.id}`)}
        className="cursor-pointer flex-1 flex flex-col"
      >
        <div className={`h-24 w-full rounded-t-xl relative ${student.id === '1' ? 'bg-gradient-to-r from-blue-50 to-indigo-50' :
          student.id === '2' ? 'bg-gradient-to-r from-purple-50 to-pink-50' :
            student.id === '3' ? 'bg-gradient-to-r from-orange-50 to-red-50' :
              student.id === '4' ? 'bg-gradient-to-r from-teal-50 to-green-50' :
                'bg-gradient-to-r from-slate-100 to-slate-200'
          }`}></div>
        <div className="px-5 pb-5 flex flex-col flex-1">
          <div className="relative -mt-10 mb-4 flex justify-center">
            {student.photoUrl ? (
              <div
                className="size-20 rounded-full border-[4px] border-white shadow-sm bg-slate-100 bg-cover bg-center"
                style={{ backgroundImage: `url('${student.photoUrl}')` }}
              />
            ) : (
              <div className="size-20 rounded-full border-[4px] border-white shadow-sm bg-indigo-100 flex items-center justify-center text-indigo-500">
                <span className="text-2xl font-bold">{student.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{student.name}</h3>
            <p className="text-sm text-slate-500 font-medium">{student.class}</p>
            <p className="text-sm text-slate-500 font-medium">PDT: {student.pdt?.alias || student.pdt?.name || ''}</p>
            <div className="mt-2">
              <StatusBadge status={student.status} />
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Paperclip className="w-4 h-4" />
              <span>{student.attachmentsCount} Anexos</span>
            </div>
            <span className="text-primary-600 text-sm font-bold flex items-center gap-1 group-hover:underline">
              Ver detalhes <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { students, studentOrder, updateStudentOrder, refreshStudents } = useResource();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (students.length === 0) {
      refreshStudents();
    }
  }, [students.length, refreshStudents]);

  const canAddStudent = profile?.tipo === 'Administrador' || profile?.tipo === 'Coordenador';

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sorting Logic (Similar to TeacherPortal)
  const sortedStudents = useMemo(() => {
    // If we have a stored order, use it
    if (studentOrder && studentOrder.length > 0) {
      const orderMap = new Map<string, number>(studentOrder.map((id, i) => [id, i]));
      return [...students].sort((a, b) => {
        const indexA = orderMap.get(a.id) ?? 9999;
        const indexB = orderMap.get(b.id) ?? 9999;
        return indexA - indexB;
      });
    }
    return students;
  }, [students, studentOrder]);

  const filteredStudents = sortedStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // We need to operate on the FULL sorted list index, not just the page view
      const oldIndex = sortedStudents.findIndex((item) => item.id === active.id);
      const newIndex = sortedStudents.findIndex((item) => item.id === over.id);

      const newOrder = (arrayMove(sortedStudents, oldIndex, newIndex) as Student[]).map(s => s.id);
      updateStudentOrder(newOrder);
    }
  };

  const moveToFront = (id: string) => {
    const currentList = [...sortedStudents];
    const currentIndex = currentList.findIndex(s => s.id === id);
    if (currentIndex > 0) {
      // Move to index 0
      const newOrder = arrayMove(currentList, currentIndex, 0).map(s => s.id);
      updateStudentOrder(newOrder);
      // Reset to page 1 to see the moved item
      setCurrentPage(1);
    }
  }

  // Handle Page Change
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  return (
    <div className="flex min-h-screen bg-background-light">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header
          title=""
          hideUserSection={true}
          hideLogout={true}
          customTitleContent={
            <h1 className="text-lg font-bold text-slate-800">
              Relatório de Alunos
            </h1>
          }
          user={{
            name: profile?.nome || "Usuário",
            role: profile?.tipo || "Visitante",
            image: profile?.foto || ""
          }}
          showSearch={false}
          showNotifications={false}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">



          <div className="mb-10">
            <label className="relative block w-full shadow-sm rounded-xl group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary-600 transition-colors">
                <Search className="w-5 h-5" />
              </span>
              <input
                className="block w-full bg-white border-0 py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-primary-600 rounded-xl sm:text-sm sm:leading-6 shadow-sm"
                placeholder="Buscar por nome, matrícula, laudo ou turma..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {canAddStudent && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <button
                    onClick={() => navigate('/new-student')}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95 font-bold text-sm h-10"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Novo Aluno</span>
                  </button>
                </div>
              )}
            </label>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <SortableContext items={currentStudents.map(s => s.id)} strategy={rectSortingStrategy} disabled={!!searchTerm}>
                {currentStudents.map((student) => (
                  <SortableStudentCard
                    key={student.id}
                    student={student}
                    navigate={navigate}
                    onMoveToFront={moveToFront}
                    isDraggable={!searchTerm}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>

          {/* Pagination Controls */}
          <div className="mt-8 flex items-center justify-between text-sm text-slate-500 border-t border-slate-200 pt-4">
            <p>Mostrando {currentStudents.length} de {filteredStudents.length} alunos</p>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-medium"
              >
                Anterior
              </button>
              <button
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-medium"
              >
                Próximo
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};