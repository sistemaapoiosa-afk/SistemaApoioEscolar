import React, { useState } from 'react';
import { Bell, Search, Menu, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../contexts/LayoutContext';
import { ProfileModal } from './ProfileModal';

interface HeaderProps {
  title: string;
  subtitle?: string;
  user?: {
    name: string;
    role: string;
    image: string;
  };
  showSearch?: boolean;
  showNotifications?: boolean;
  hideUserSection?: boolean;
  hideLogout?: boolean;
  customTitleContent?: React.ReactNode;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  user = {
    name: "Maria Silva",
    role: "Coordenadora",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfVZPJpm-VhL8o9oQR2eFp414ebWoQc8TntUdCcZCOTE8DwQDhrnPBcLL8SJLGKsfmlX91MJJMw-N7Uy-D_o8_00Stg2acD0HYqz_lVgn0kWTPt2LvGAqwSI7wSJhx2E6u9gTPlC14yMiDEh1oBm5SoZ1lW1JvUk9r3WNj4vfzstVMaKcu1VI7a44onTFITpSyR4UrjTkb3CseIdGMh6ooWEJmPT4TYaXN8DxJyS7ust81yQIbA5t-t6ifOFjyEU-K1z2NLXGBkL4"
  },
  showSearch = true,
  showNotifications = true,
  hideUserSection = false,
  hideLogout = false,
  children,
  customTitleContent
}) => {
  const { signOut } = useAuth();
  const { toggleMobileMenu } = useLayout();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4 lg:hidden">
        <button
          onClick={toggleMobileMenu}
          className="text-slate-500 hover:text-slate-700"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {customTitleContent ? (
        <div className="flex-1 ml-4 lg:ml-0">
          {customTitleContent}
        </div>
      ) : (
        <div className="flex flex-col ml-4 lg:ml-0">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      )}

      <div className="flex items-center gap-4 ml-auto">
        {/* Custom Children (Buttons, etc) */}
        {children && (
          <div className="mr-2">
            {children}
          </div>
        )}

        {showSearch && (
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Busca rápida..."
              className="pl-9 pr-4 py-2 rounded-full bg-slate-100 border-none text-sm focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>
        )}

        {showNotifications && (
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        )}

        {/* User Section (Hidden if hideUserSection is true) */}
        {!hideUserSection && (
          <>
            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 leading-none">{user.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                  {user.role !== 'Administrador' && (
                    <button
                      onClick={() => setIsProfileOpen(true)}
                      className="text-[10px] font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-2 py-0.5 rounded border border-primary-200 transition-colors uppercase flex items-center gap-1"
                    >
                      <UserCog className="w-3 h-3" />
                      PERFIL
                    </button>
                  )}
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-full bg-gray-200 border border-slate-100 bg-cover bg-center"
                style={{ backgroundImage: user.image ? `url('${user.image}')` : undefined }}
              >
                {!user.image && <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-100 rounded-full">{user.name.charAt(0)}</div>}
              </div>
            </div>
          </>
        )}

        {/* Logout Button */}
        {!hideLogout && (
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-bold text-xs uppercase"
            title="Sair do Sistema"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        )}
      </div>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </header >
  );
};