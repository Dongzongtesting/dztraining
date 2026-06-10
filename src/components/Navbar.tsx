import React from 'react';
import { TRANSLATIONS, Language } from '../translations';
import { User } from '../types';
import { Shield, User as UserIcon, Globe, Layers, BookOpen, LogOut } from 'lucide-react';

interface NavbarProps {
  currentLang: Language;
  setLang: (lang: Language) => void;
  currentUser: User;
  usersList: User[];
  onChangeUser: (userId: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  setLang,
  currentUser,
  usersList,
  onChangeUser,
  onLogout
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Brand Stripe */}
      <div className="bg-blue-700 text-white px-4 py-1.5 flex justify-between items-center text-[10px] sm:text-xs font-mono tracking-wider">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="truncate max-w-[240px] sm:max-w-none">
            {currentLang === 'zh' 
              ? '董总员工培训与积分管理平台' 
              : 'DONG ZONG TRAINING MANAGEMENT PORTAL'}
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <span>Kuala Lumpur, Malaysia</span>
          <span>•</span>
          <span>System Version 2026.1</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20">
          {/* Logo Brand Frame */}
          <div className="flex items-center my-auto">
            <div className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-700 flex flex-col items-center justify-center text-white border-1.5 sm:border-2 border-amber-500/80 shadow-md transform transition duration-300 group-hover:scale-105 shrink-0">
                <span className="text-[9px] sm:text-xs font-bold leading-none mt-0.5 sm:mt-1">董总</span>
                <span className="text-[7px] sm:text-[9px] scale-90 font-semibold tracking-tighter leading-none text-amber-400">DZ</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold font-display text-slate-800 tracking-tight leading-tight truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[280px] md:max-w-none">
                  {currentLang === 'zh' ? '董总培训系统' : 'DZ Training TMS'}
                  <span className="hidden xs:inline">
                    {currentLang === 'zh' ? '与积分管理' : ' & Points'}
                  </span>
                </h1>
                <p className="hidden md:block text-xs text-slate-500 font-medium truncate max-w-[250px] lg:max-w-none">
                  {t.appSubName}
                </p>
              </div>
            </div>
          </div>

            {/* Controls Frame */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* User Session status display */}
            {(currentUser.role === 'hr_admin' || currentUser.role === 'hr_agent') ? (
              <div className={`relative group flex items-center transition px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border ${
                currentUser.role === 'hr_admin' 
                  ? 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-600' 
                  : 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200 text-indigo-600'
              }`}>
                <div className="mr-1 sm:mr-2">
                  <Shield className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                    currentUser.role === 'hr_admin' ? 'text-amber-600' : 'text-indigo-600'
                  }`} />
                </div>
                <div className="flex flex-col text-left pr-3 sm:pr-5 min-w-0">
                  <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider leading-none ${
                    currentUser.role === 'hr_admin' ? 'text-amber-650' : 'text-indigo-650'
                  }`}>
                    {currentUser.role === 'hr_admin' 
                      ? (currentLang === 'zh' ? '人事处 (超级管理员)' : 'HR Admin (Super)')
                      : (currentLang === 'zh' ? '人事处 (审核专员)' : 'HR Agent')
                    }
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-800 leading-normal truncate max-w-[50px] sm:max-w-[100px]" title={`${currentUser.chineseName} (${currentUser.name})`}>
                    {currentUser.chineseName}
                  </span>
                </div>

                {/* Secure Switcher dropdown - only visible for admin */}
                <select
                  value={currentUser.id}
                  onChange={(e) => onChangeUser(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title={t.switchRole}
                >
                  {usersList.map((usr) => (
                    <option key={usr.id} value={usr.id}>
                      [{usr.role === 'hr_admin' ? 'HR ADMIN' : usr.role === 'hr_agent' ? 'HR AGENT' : 'STAFF'}] {usr.chineseName}
                    </option>
                  ))}
                </select>

                <div className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] sm:text-[10px] ${
                  currentUser.role === 'hr_admin' ? 'text-amber-500' : 'text-indigo-500'
                }`}>
                  ▼
                </div>
              </div>
            ) : (
              <div className="flex items-center bg-slate-50 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-slate-200">
                <div className="mr-1 sm:mr-2">
                  <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700 shrink-0" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[8px] sm:text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-none">
                    {currentLang === 'zh' ? '职员' : 'Staff'}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-800 leading-normal truncate max-w-[50px] sm:max-w-[100px]" title={`${currentUser.chineseName} (${currentUser.name})`}>
                    {currentUser.chineseName}
                  </span>
                </div>
              </div>
            )}

            {/* Bilingual Switcher */}
            <button
              id="btn-lang-toggle"
              onClick={() => setLang(currentLang === 'en' ? 'zh' : 'en')}
              className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-750 hover:text-blue-700 font-medium text-[10px] sm:text-xs px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-slate-200 shadow-sm transition duration-150 cursor-pointer h-8 sm:h-auto shrink-0"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-105 shrink-0" />
              <span className="hidden xs:inline">{t.langToggle}</span>
            </button>

            {/* Logout Secure Trigger button */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 sm:space-x-1.5 border border-rose-200 hover:bg-rose-50 hover:text-rose-700 bg-white text-rose-600 font-bold text-[10px] sm:text-xs px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition duration-150 shadow-sm cursor-pointer h-8 sm:h-auto shrink-0"
              title={currentLang === 'zh' ? '安全退出系统' : 'Sign out securely'}
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">{currentLang === 'zh' ? '安全退出' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
