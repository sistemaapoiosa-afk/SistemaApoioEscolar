import React, { useState } from 'react';
import {
  Folder,
  MoreVertical,
  ExternalLink,
  Calendar,
  Eye,
  Download,
  Video,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Database,
  FileText,
  Settings,
  UploadCloud,
  X,
  Trash2,
  Save,
  Pen,
  HardDrive,
  ChevronsUp,
  School,
  UserCog
} from 'lucide-react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useResource } from '../contexts/ResourceContext';
import { PortalLink } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ProfileModal } from '../components/ProfileModal';
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

// Card Component extracted for Sortable usage
interface LinkCardProps {
  link: PortalLink;
  canEdit: boolean;
  onOpenModal: (link: PortalLink) => void;
  onDelete: (id: string) => void;
  navigate: any;
  isDraggable?: boolean;
  onMoveToFront: (id: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, canEdit, onOpenModal, onDelete, navigate, isDraggable, onMoveToFront }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const getCardConfig = (category: PortalLink['category']) => {
    switch (category) {
      case 'calendar':
        return { icon: <Calendar className="w-7 h-7" />, bg: 'bg-orange-50', color: 'text-orange-600', ring: 'ring-2 ring-orange-100' };
      case 'folder':
        return { icon: <Folder className="w-7 h-7" />, bg: 'bg-blue-50', color: 'text-blue-600', ring: '' };
      case 'drive':
        return { icon: <HardDrive className="w-7 h-7" />, bg: 'bg-green-50', color: 'text-green-600', ring: 'ring-2 ring-green-100' };
      case 'system':
        return { icon: <Database className="w-7 h-7" />, bg: 'bg-purple-50', color: 'text-purple-600', ring: '' };
      case 'pdf':
        return { icon: <FileText className="w-7 h-7" />, bg: 'bg-emerald-50', color: 'text-emerald-600', ring: '' };
      case 'video':
        return { icon: <Video className="w-7 h-7" />, bg: 'bg-indigo-50', color: 'text-indigo-600', ring: '' };
      case 'upload':
        return { icon: <UploadCloud className="w-7 h-7" />, bg: 'bg-sky-50', color: 'text-sky-600', ring: 'ring-2 ring-sky-100' };
      default:
        return { icon: <ExternalLink className="w-7 h-7" />, bg: 'bg-slate-50', color: 'text-slate-600', ring: '' };
    }
  };

  const config = getCardConfig(link.category);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-300 relative flex flex-col h-full ${config.ring} ${isDraggable ? 'cursor-move' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`size-12 rounded-lg ${config.bg} flex items-center justify-center ${config.color}`}>
          {config.icon}
        </div>

        <div className="flex items-center gap-1">
          {/* Move to Front Button using ChevronsUp */}
          <button
            onClick={(e) => { e.stopPropagation(); onMoveToFront(link.id); }}
            className="text-slate-300 hover:text-primary-600 p-1.5 rounded-md hover:bg-primary-50 transition-colors opacity-0 group-hover:opacity-100"
            title="Mover para o início"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <ChevronsUp className="w-5 h-5" />
          </button>

          {canEdit && link.category !== 'calendar' && (
            <div className="relative group/menu">
              <button
                className="text-slate-300 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Context Menu on Hover */}
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1 hidden group-hover/menu:block z-10 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenModal(link); }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 flex items-center gap-2"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Pen className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(link.id); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-primary-600 transition-colors" title={link.title}>{link.title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2" title={link.description}>{link.description}</p>

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
        {/* Tag / Category Label */}
        {link.category !== 'calendar' && (
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">
            {link.category === 'drive' ? 'Google Drive' :
              link.category === 'upload' ? 'Upload' :
                link.category === 'system' ? 'Sistema' :
                  link.category === 'pdf' ? 'PDF' :
                    link.category === 'video' ? 'Video' : 'Link'}
          </span>
        )}

        {/* Special Handling for System vs External Links */}
        {link.category === 'calendar' ? (
          <div className="flex items-center gap-3 w-full justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(link.url, { state: { readonly: true } }); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors"
            >
              Visualizar <Eye className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-200"></div>
            {canEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(link.url, { state: { readonly: false } }); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-sm font-bold text-primary-600 hover:underline"
              >
                Gerenciar <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-bold text-primary-600 hover:underline"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {link.category === 'pdf' ? 'Download' :
              link.category === 'upload' ? 'Enviar' :
                link.category === 'drive' ? 'Abrir Drive' : 'Acessar'}
            {link.category === 'pdf' ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
          </a>
        )}
      </div>
    </div>
  );
};

export const TeacherPortal: React.FC = () => {
  const navigate = useNavigate();
  const { portalLinks, addPortalLink, updatePortalLink, removePortalLink, linkOrder, updateLinkOrder, institutionName, logoUrl } = useResource();
  const { profile } = useAuth();

  const canEdit = profile?.tipo === 'Administrador' || profile?.tipo === 'Coordenador';

  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<PortalLink | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: PortalLink['category'];
    url: string;
  }>({
    title: '',
    description: '',
    category: 'folder',
    url: ''
  });

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

  // Sorting Logic
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const sortedLinks = React.useMemo(() => {
    // 1. Separate Calendar Links (Pinned to Top)
    const calendarLinks = portalLinks.filter(l => l.category === 'calendar');
    const otherLinks = portalLinks.filter(l => l.category !== 'calendar');

    // 2. Sort Other Links
    if (!linkOrder || linkOrder.length === 0) {
      return [...calendarLinks, ...otherLinks];
    }

    const orderMap = new Map<string, number>(linkOrder.map((id, i) => [id, i]));
    const sortedOthers = [...otherLinks].sort((a, b) => {
      const indexA = orderMap.get(a.id) ?? 9999;
      const indexB = orderMap.get(b.id) ?? 9999;
      return indexA - indexB;
    });

    return [...calendarLinks, ...sortedOthers];
  }, [portalLinks, linkOrder]);

  const filteredLinks = sortedLinks.filter(link =>
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Combine items for display (Calendar -> Add New -> Others)
  const allItems = React.useMemo(() => {
    const items: Array<{ type: 'link' | 'add-new', data: any }> = [];

    // 1. Calendar Links
    const calendarLinks = filteredLinks.filter(l => l.category === 'calendar');
    calendarLinks.forEach(link => items.push({ type: 'link', data: link }));

    // 2. Add New Button (If Admin/Coord and no search)
    if (canEdit && !searchTerm) {
      items.push({ type: 'add-new', data: null });
    }

    // 3. Other Links
    const otherLinks = filteredLinks.filter(l => l.category !== 'calendar');
    otherLinks.forEach(link => items.push({ type: 'link', data: link }));

    return items;
  }, [filteredLinks, canEdit, searchTerm]);

  const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
  const paginatedItems = allItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset to page 1 if search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // Prevent reordering key items if needed, but for now allow reordering amongst themselves
      // Note: Since we force calendar to top in render/useMemo, reordering might jump.
      // Ideally we just update the order for non-calendar items or full list.

      const oldIndex = sortedLinks.findIndex((item) => item.id === active.id);
      const newIndex = sortedLinks.findIndex((item) => item.id === (over as any).id);

      const newOrder = (arrayMove(sortedLinks, oldIndex, newIndex) as PortalLink[]).map(l => l.id);
      updateLinkOrder(newOrder);
    }
  };

  const moveToFront = (id: string) => {
    const currentList = [...sortedLinks];
    const currentIndex = currentList.findIndex(l => l.id === id);
    if (currentIndex > 0) {
      const newOrder = arrayMove(currentList, currentIndex, 0).map(l => l.id);
      updateLinkOrder(newOrder);
    }
  };

  const handleOpenModal = (link?: PortalLink) => {
    if (link) {
      setEditingLink(link);
      setFormData({
        title: link.title,
        description: link.description,
        category: link.category,
        url: link.url
      });
    } else {
      setEditingLink(null);
      setFormData({
        title: '',
        description: '',
        category: 'folder',
        url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.url) return;

    if (editingLink) {
      updatePortalLink(editingLink.id, formData);
    } else {
      addPortalLink(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este link?")) {
      removePortalLink(id);
    }
  };


  return (
    <div className="flex bg-background-light min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title=""
          hideUserSection={true}
          hideLogout={true}
          customTitleContent={
            <div className="w-full flex items-center">
              {/* Mobile Text */}
              <h1 className="block md:hidden text-lg font-bold text-slate-800">
                Documentos e Links
              </h1>
              {/* Desktop Text */}
              <span className="hidden md:block text-sm font-medium text-slate-600">
                Documentos essenciais, pastas compartilhadas e recursos externos para professores e equipe administrativa.
              </span>
            </div>
          }
          user={{
            name: profile?.nome || "Usuário",
            role: profile?.tipo || "Visitante",
            image: profile?.foto || ""
          }}
          showSearch={false}
          showNotifications={false}
        />

        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">




          {/* Search Bar */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all sm:text-sm"
                placeholder="Buscar por nome, categoria ou URL..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">



            </div>
          </div>

          {/* Cards Grid */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <SortableContext items={paginatedItems.filter(item => item.type === 'link').map(item => item.data.id)} strategy={rectSortingStrategy} disabled={!!searchTerm}>
                {paginatedItems.map((item, index) => {
                  if (item.type === 'add-new') {
                    return (
                      <div
                        key="add-new"
                        onClick={() => handleOpenModal()}
                        className="group border-2 border-dashed border-slate-300 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors min-h-[220px]"
                      >
                        <div className="size-14 rounded-full bg-slate-100 group-hover:bg-primary-100 flex items-center justify-center mb-3 transition-colors">
                          <Plus className="text-slate-400 group-hover:text-primary-600 w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">Adicionar Atalho</h3>
                        <p className="text-slate-500 text-sm mt-1">Crie um novo link rápido para a equipe</p>
                      </div>
                    );
                  }

                  const link = item.data as PortalLink;
                  return (
                    <LinkCard
                      key={link.id}
                      link={link}
                      canEdit={canEdit}
                      onOpenModal={handleOpenModal}
                      onDelete={handleDelete}
                      navigate={navigate}
                      isDraggable={!searchTerm}
                      onMoveToFront={moveToFront}
                    />
                  );
                })}
              </SortableContext>
            </div>

            <div className="mt-8 flex items-center justify-between text-sm text-slate-500 border-t border-slate-200 pt-4">
              <p>Mostrando {paginatedItems.length} de {allItems.length} itens</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-medium"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-medium"
                >
                  Próximo
                </button>
              </div>
            </div>
          </DndContext>

        </main>
      </div>

      {/* Modal Add/Edit */}
      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{editingLink ? 'Editar Link' : 'Novo Link'}</h3>
                  <p className="text-sm text-slate-500">Preencha os dados do atalho para o portal.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Título do Cartão</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Entrega de Provas"
                    className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-primary-500 focus:border-primary-500 p-2.5"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoria / Ícone</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-primary-500 focus:border-primary-500 p-2.5"
                  >
                    <option value="drive">Google Drive / Pasta</option>
                    <option value="folder">Pasta (Genérica)</option>
                    <option value="upload">Upload / Envio</option>
                    <option value="system">Sistema Web</option>
                    <option value="pdf">Documento PDF</option>
                    <option value="video">Vídeo / Reunião</option>
                    <option value="calendar">Calendário</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descrição do conteúdo..."
                    className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-primary-500 focus:border-primary-500 h-20 resize-none text-sm p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">URL de Destino</label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-primary-500 focus:border-primary-500 p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.title || !formData.url}
                  className="px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Link
                </button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};