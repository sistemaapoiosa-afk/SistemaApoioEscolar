import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Calendar,
  Power,
  BookOpen,
  Settings,
  Monitor,
  School,
  GraduationCap,
  Instagram,
  Mail,
  ChevronLeft,
  ChevronRight,
  UserCog
} from 'lucide-react';
import { useResource } from '../contexts/ResourceContext';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../contexts/LayoutContext';
import { ProfileModal } from './ProfileModal';

export const Sidebar: React.FC = () => {
  const { institutionName, logoUrl } = useResource();
  const { profile, signOut } = useAuth();
  const { isMobileMenuOpen, closeMobileMenu } = useLayout();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative ${isActive
      ? 'bg-primary-50 text-primary-600 font-bold'
      : 'text-slate-600 hover:bg-slate-100 font-medium'
    } ${isCollapsed ? 'lg:justify-center' : ''}`;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[998] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`
          flex flex-col bg-white z-[999] transition-all duration-300
          fixed inset-y-0 left-0 h-full shadow-2xl lg:shadow-none
          lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-slate-200
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-6 flex-1 overflow-y-auto no-scrollbar">
            {/* Brand */}
            <div className={`flex flex-col px-2 transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="bg-primary-50 text-primary-600 p-2 rounded-lg shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                  ) : (
                    <School className="w-6 h-6" />
                  )}
                </div>
                {!isCollapsed && <span className="text-sm border-t border-slate-100 pt-4 mt-4 hidden lg:block"></span>}
                {(!isCollapsed || isMobileMenuOpen) && (
                  <div className="flex flex-col overflow-hidden">
                    <h1 className="text-slate-900 text-base font-bold leading-tight">{institutionName}</h1>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex flex-col gap-1 mt-2 flex-1">
              {!isCollapsed && <span className="text-sm border-t border-slate-100 pt-4 mt-4 hidden lg:block"></span>}
              {(!isCollapsed || isMobileMenuOpen) && (
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                  Acadêmico
                </div>
              )}

              {/* 1. Documentos/Links */}
              <NavLink to="/teacher-portal" className={linkClass} title={isCollapsed ? "Documentos/Links" : ""} onClick={closeMobileMenu}>
                <BookOpen className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-sm truncate">Documentos/Links</span>}
              </NavLink>

              {/* 2. Alunos PCD */}
              <NavLink to="/" className={linkClass} title={isCollapsed ? "Alunos PCD" : ""} onClick={closeMobileMenu}>
                <Users className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-sm truncate">Alunos PCD</span>}
              </NavLink>

              {/* 3. Agendamento */}
              <NavLink to="/resource-schedule" className={linkClass} title={isCollapsed ? "Agendamento" : ""} onClick={closeMobileMenu}>
                <Monitor className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-sm truncate">Agendamento</span>}
              </NavLink>

              {/* 4. Horários Prof. */}
              <NavLink to="/teacher-schedule" className={linkClass} title={isCollapsed ? "Horários Prof." : ""} onClick={closeMobileMenu}>
                <Calendar className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-sm truncate">Horários Prof.</span>}
              </NavLink>

              {/* 5. Horários das Turmas */}
              <NavLink to="/class-schedule" className={linkClass} title={isCollapsed ? "Horários das Turmas" : ""} onClick={closeMobileMenu}>
                <GraduationCap className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-sm truncate">Horários das Turmas</span>}
              </NavLink>



            </nav>

            {/* Bottom Section: User Info + Credits */}
            <div className="flex flex-col gap-4 shrink-0">

              {/* User Info & Logout - Always visible (adapts) */}
              {profile && (
                <div className={`
                  relative group/user
                  ${isCollapsed
                    ? 'flex flex-col items-center gap-2 px-0 mb-2'
                    : 'bg-slate-50 rounded-xl p-3 mx-2 border border-slate-200 mb-2'
                  }
                `}>
                  {/* Collapse Button (Desktop Only) - Moved to Top */}
                  <button
                    onClick={toggleSidebar}
                    className={`
                        hidden lg:flex items-center gap-2 text-slate-400 hover:text-primary-600 hover:bg-slate-50 transition-all cursor-pointer
                        ${isCollapsed
                        ? 'w-10 h-10 justify-center rounded-lg'
                        : 'w-full mb-2 pb-2 border-b border-slate-200/60 justify-center h-8 rounded-lg text-xs font-semibold uppercase tracking-wider'
                      }
                      `}
                    title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
                  >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-4 h-4" />}
                    {!isCollapsed && "Recolher"}
                  </button>

                  <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>

                    {/* Avatar */}
                    <div className={`
                      relative rounded-full overflow-hidden border border-white shadow-sm shrink-0
                      ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'}
                    `}>
                      {profile.foto ? (
                        <img src={profile.foto} alt={profile.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                          {profile.nome.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Text Info */}
                    {!isCollapsed && (
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-bold text-slate-900 leading-tight mb-0.5">
                          {profile.nome}
                        </span>
                        <span className="text-xs text-slate-500 font-medium truncate flex items-center gap-1">
                          {profile.tipo}
                        </span>
                        <button
                          onClick={() => setIsProfileOpen(true)}
                          className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wide transition-colors self-start"
                        >
                          <UserCog className="w-3 h-3" />
                          Alterar Perfil
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Settings Link - Moved here */}
              {profile?.tipo === 'Administrador' && (
                <div className="mb-2">
                  <NavLink to="/resources" className={linkClass} title={isCollapsed ? "Configurações" : ""} onClick={closeMobileMenu}>
                    <Settings className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="text-sm truncate">Configurações</span>}
                  </NavLink>
                </div>
              )}

              {/* Developer Credits - Hidden if Collapsed */}
              {(!isCollapsed || isMobileMenuOpen) && (
                <div className="mx-2 mt-2 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col gap-2 shrink-0 transition-colors">
                  {/* Header with Title */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded bg-blue-50 text-blue-600">
                      <Monitor className="w-3 h-3" />
                    </div>
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">Sistema de Apoio Escolar</p>
                  </div>

                  {/* Developer */}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium leading-tight">Desenvolvido por</span>
                    <span className="text-sm font-bold text-slate-700 leading-tight">Prof. Neylor FM</span>
                  </div>

                  {/* Contacts Divider */}
                  <div className="h-px w-full bg-slate-200/60 my-0.5"></div>

                  {/* Contacts */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary-600 transition-colors cursor-pointer group/item">
                      <Mail className="w-3 h-3 text-slate-400 group-hover/item:text-primary-600" />
                      <span className="truncate">neylor.prof@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 hover:text-pink-600 transition-colors cursor-pointer group/item">
                      <Instagram className="w-3 h-3 text-slate-400 group-hover/item:text-pink-600" />
                      <span className="truncate">@fmneylor</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="px-2 border-t border-slate-100 pt-4 shrink-0">
            {/* Logout Button (Footer) */}
            <button
              onClick={signOut}
              className={`flex items-center gap-3 w-full px-3 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
              title="Sair do Sistema"
            >
              <div className={`p-0.5 rounded ${isCollapsed ? 'bg-white shadow-sm' : ''}`}>
                <Power className="w-5 h-5" />
              </div>
              {!isCollapsed && <span className="text-sm font-bold">Sair</span>}
            </button>
          </div>
        </div>
      </aside>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};