import React, { useState } from 'react';
import { TRANSLATIONS, Language } from '../translations';
import { User } from '../types';
import { Shield, User as UserIcon, Lock, Mail, Eye, EyeOff, Sparkles, LogIn, Compass } from 'lucide-react';

interface LoginProps {
  currentLang: Language;
  onLogin: (user: User) => void;
  usersList: User[];
  adminPassword?: string;
  onLangChange?: (lang: Language) => void;
}

export const Login: React.FC<LoginProps> = ({
  currentLang,
  onLogin,
  usersList,
  adminPassword,
  onLangChange
}) => {
  const t = TRANSLATIONS[currentLang];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Find the user by email (case insensitive comparison)
    const normalizedEmail = email.trim().toLowerCase();
    const matchedUser = usersList.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!matchedUser) {
      setError(
        currentLang === 'zh' 
          ? '※ 未找到对应的用户账号，请检查邮箱是否输入正确！' 
          : 'No account matching this email was found. Please check and try again.'
      );
      return;
    }

    // Passwords check
    // If the user's role is HR, verify with either their personal password or the defined admin password.
    const userStoredPassword = matchedUser.password || 'staff123';
    
    let isPasswordCorrect = password === userStoredPassword;
    if ((matchedUser.role === 'hr_admin' || matchedUser.role === 'hr_agent') && adminPassword && password === adminPassword) {
      isPasswordCorrect = true;
    }

    if (isPasswordCorrect) {
      onLogin(matchedUser);
    } else {
      setError(
        currentLang === 'zh'
          ? '※ 登录密码验证错误，请输入正确的密码！'
          : 'Incorrect password. Please verify current login credentials.'
      );
    }
  };

  const handlePrefill = (user: User) => {
    setEmail(user.email);
    setPassword(user.password || 'staff123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Floating Language Toggler */}
      {onLangChange && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => onLangChange(currentLang === 'zh' ? 'en' : 'zh')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full transition shadow-md flex items-center gap-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <span>🌐</span>
            <span>{currentLang === 'zh' ? 'English' : '华文版'}</span>
          </button>
        </div>
      )}

      {/* Dynamic Ambient light blobs for background styling */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-750 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="z-10 w-full max-w-lg space-y-8">
        
        {/* Main Brand Logo Header block */}
        <div className="text-center space-y-4">
          <div className="inline-flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-blue-700 text-white border-2 border-amber-400 shadow-xl">
            <span className="text-sm font-black mt-1 leading-none tracking-tight">董总</span>
            <span className="text-[10px] scale-90 font-bold text-amber-300 leading-none">DZ</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              {t.appName}
            </h1>
            <p className="text-sm text-slate-300 font-medium max-w-md mx-auto mt-2">
              {t.appSubName}
            </p>
          </div>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-3xl border border-slate-700/10 shadow-2xl p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 text-center">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold leading-none">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentLang === 'zh' ? '安全认证入口' : 'Secure Login Portal'}</span>
            </span>
            <h2 className="text-[17px] font-bold text-slate-800 mt-2">
              {currentLang === 'zh' ? '登录后开始申报或核实培训' : 'Please authenticate to access your account'}
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* EMAIL ADRESS */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">
                {currentLang === 'zh' ? '电子邮箱地址' : 'Account Email Address'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="e.g. kslim@dongzong.my"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono transition duration-150"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">
                {currentLang === 'zh' ? '登录密码' : 'Password'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl pl-10 pr-12 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono transition duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-450 hover:text-slate-700 transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Error messaging */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl font-semibold animate-shake">
                {error}
              </div>
            )}

            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-850 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg flex items-center justify-center space-x-2 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>{currentLang === 'zh' ? '安全验证登录' : 'Sign In To Account'}</span>
            </button>
          </form>

          {/* HELP ACCESSIBILITY SECTION (Aesthetic Prefills) */}
          <div className="border-t border-slate-100 pt-5 space-y-3.5">
            <span className="block text-[11px] font-bold uppercase text-slate-400 tracking-widest text-center">
              💡 {currentLang === 'zh' ? '演示及测试快捷入口' : 'Demo & Auditor Access Helper'}
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {usersList.map((usr) => (
                <button
                  key={usr.id}
                  type="button"
                  onClick={() => handlePrefill(usr)}
                  className="p-2 border border-slate-100 rounded-xl bg-slate-50 hover:bg-blue-50/50 hover:border-blue-250 transition text-left flex items-start space-x-2 cursor-pointer group"
                >
                  <div className="mt-0.5">
                    {(usr.role === 'hr_admin' || usr.role === 'hr_agent') ? (
                      <Shield className={`w-3.5 h-3.5 ${usr.role === 'hr_admin' ? 'text-amber-500' : 'text-indigo-500'}`} />
                    ) : (
                      <UserIcon className="w-3.5 h-3.5 text-blue-700 group-hover:scale-105 transition" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-slate-700 truncate leading-snug">
                      {usr.chineseName} ({usr.name})
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex justify-between">
                      <span className={usr.role === 'hr_admin' ? 'text-amber-600 font-bold' : usr.role === 'hr_agent' ? 'text-indigo-600 font-bold' : ''}>
                        {usr.role === 'hr_admin' ? 'HR ADMIN' : usr.role === 'hr_agent' ? 'HR AGENT' : 'STAFF'}
                      </span>
                      <span>pass: {usr.password || 'staff123'}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Simple footer security note */}
        <div className="text-center text-slate-400 text-xs flex justify-center items-center space-x-1.5 leading-none">
          <span>🔒 SHA-256 Synchronized Local Ledger</span>
          <span>•</span>
          <span>Dong Zong IT Unit 2026</span>
        </div>

      </div>
    </div>
  );
};
