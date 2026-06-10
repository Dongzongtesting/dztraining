import React, { useState } from 'react';
import { TRANSLATIONS, Language } from '../translations';
import { User, PolicySection } from '../types';
import { 
  BookOpen, HelpCircle, Edit3, X, Save, CheckCircle2, FileText, Sparkles 
} from 'lucide-react';

interface PolicyManagerProps {
  currentLang: Language;
  currentUser: User;
  policies: PolicySection[];
  onUpdatePolicy: (id: string, updatedPolicy: Partial<PolicySection>) => void;
}

export const PolicyManager: React.FC<PolicyManagerProps> = ({
  currentLang,
  currentUser,
  policies,
  onUpdatePolicy
}) => {
  const t = TRANSLATIONS[currentLang];
  const isHr = currentUser.role === 'hr_admin' || currentUser.role === 'hr_agent';

  // State management for Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editTitleZh, setEditTitleZh] = useState('');
  const [editContentEn, setEditContentEn] = useState('');
  const [editContentZh, setEditContentZh] = useState('');

  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const startEditing = (p: PolicySection) => {
    setEditingId(p.id);
    setEditTitleEn(p.titleEn);
    setEditTitleZh(p.titleZh);
    setEditContentEn(p.contentEn);
    setEditContentZh(p.contentZh);
  };

  const handleSavePolicy = (id: string) => {
    onUpdatePolicy(id, {
      titleEn: editTitleEn,
      titleZh: editTitleZh,
      contentEn: editContentEn,
      contentZh: editContentZh
    });
    setEditingId(null);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title segment */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <BookOpen className="text-blue-700 w-5 h-5" />
            <span>{t.trainingPolicy}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentLang === 'zh' ? '董总人事规章：查看年度培训制度考核标准、学时互认办法和常见问题。' : 'Official HR guidelines on professional development compliance.'}
          </p>
        </div>

        {isHr && (
          <span className="bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs py-1 px-3.5 rounded-full inline-block self-start font-mono uppercase tracking-wider">
            Admin Policy Editing Enabled
          </span>
        )}
      </div>

      {showSuccessAlert && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-xl font-medium animate-fade-in flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{currentLang === 'zh' ? '董总规章条款更新完成！全体员工可即时查阅最新政策。' : 'Policy section successfully updated! Reforms pushed downstream.'}</span>
        </div>
      )}

      {/* Accordion / Card Segment */}
      <div className="space-y-5">
        {policies.map((p) => {
          const isEditing = editingId === p.id;
          const sectionTitle = currentLang === 'zh' ? p.titleZh : p.titleEn;
          const sectionContent = currentLang === 'zh' ? p.contentZh : p.contentEn;

          return (
            <div 
              key={p.id} 
              className={`bg-white rounded-3xl border transition duration-200 overflow-hidden ${
                isEditing ? 'border-amber-400 shadow-md ring-1 ring-amber-300' : 'border-slate-200'
              }`}
            >
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-5 h-5 text-blue-700" />
                  <h3 className="font-bold text-slate-800 text-sm md:text-base">
                    {sectionTitle}
                  </h3>
                </div>

                {isHr && !isEditing && (
                  <button
                    onClick={() => startEditing(p)}
                    className="flex items-center space-x-1 hover:bg-amber-500 hover:text-slate-900 border text-amber-700 bg-white border-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{currentLang === 'zh' ? '修改条款' : 'Edit Section'}</span>
                  </button>
                )}
              </div>

              {/* View/Edit Content Field */}
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4 text-xs">
                    {/* EN Title field */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase tracking-wide">Section Title (English)</label>
                      <input
                        type="text"
                        value={editTitleEn}
                        onChange={(e) => setEditTitleEn(e.target.value)}
                        className="w-full bg-slate-50 border px-3 py-2.5 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    {/* ZH Title field */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase tracking-wide">标题 (中文)</label>
                      <input
                        type="text"
                        value={editTitleZh}
                        onChange={(e) => setEditTitleZh(e.target.value)}
                        className="w-full bg-slate-50 border px-3 py-2.5 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    {/* Content Fields EN/ZH */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase tracking-wide">Content (English)</label>
                        <textarea
                          rows={6}
                          value={editContentEn}
                          onChange={(e) => setEditContentEn(e.target.value)}
                          className="w-full bg-slate-50 border p-3 rounded-lg text-slate-705 focus:bg-white font-mono text-[11px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase tracking-wide">条款内容细则 (中文)</label>
                        <textarea
                          rows={6}
                          value={editContentZh}
                          onChange={(e) => setEditContentZh(e.target.value)}
                          className="w-full bg-slate-50 border p-3 rounded-lg text-slate-705 focus:bg-white text-xs leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Form administration actions */}
                    <div className="flex justify-end space-x-2 pt-2 border-t">
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-white border text-slate-600 font-bold px-4 py-2 rounded-xl"
                      >
                        {t.cancel}
                      </button>
                      <button
                        onClick={() => handleSavePolicy(p.id)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{currentLang === 'zh' ? '保存更改' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-750 font-medium text-xs leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                    {sectionContent}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ISO Quality Frame Footer badge */}
      <div className="bg-emerald-50 border border-emerald-100/80 p-5 rounded-2xl flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-3 text-emerald-950">
          <Sparkles className="w-5 h-5 text-emerald-600 active:scale-110" />
          <div>
            <span className="font-bold block text-emerald-800">{currentLang === 'zh' ? '董总内部 ISO 9001:2026 认证规章体系' : 'Malaysian School Boards Accord Verification Policy'}</span>
            <span>{currentLang === 'zh' ? '年度职员参训学时换算法符合独中行政教师团队评级章程。' : 'Syllabus alignment compliance certified coordinates for independent schools board.'}</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-700/80 font-semibold bg-emerald-100/50 rounded py-1 px-2 uppercase shadow-sm">
          Compliance Verified
        </span>
      </div>
    </div>
  );
};
