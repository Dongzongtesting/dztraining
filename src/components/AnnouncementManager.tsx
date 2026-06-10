import React, { useState } from 'react';
import { TRANSLATIONS, Language } from '../translations';
import { User, TrainingAnnouncement } from '../types';
import { 
  Megaphone, Calendar, MapPin, UserCheck, Tag, Anchor, Link2, 
  Plus, Edit, Archive, Eye, Trash2, X, Users, AlertCircle, BookmarkCheck
} from 'lucide-react';

interface AnnouncementManagerProps {
  currentLang: Language;
  currentUser: User;
  announcements: TrainingAnnouncement[];
  onAddAnnouncement: (ann: Omit<TrainingAnnouncement, 'id'> & { id?: string }) => void;
  onArchiveAnnouncement: (id: string) => void;
  onDeleteAnnouncement: (id: string) => void;
  onRegisterAnnouncement: (annId: string, user: User, isRegistering: boolean) => void;
}

export const AnnouncementManager: React.FC<AnnouncementManagerProps> = ({
  currentLang,
  currentUser,
  announcements,
  onAddAnnouncement,
  onArchiveAnnouncement,
  onDeleteAnnouncement,
  onRegisterAnnouncement
}) => {
  const t = TRANSLATIONS[currentLang];
  const isHr = currentUser.role === 'hr_admin' || currentUser.role === 'hr_agent';

  // Tabs
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'archived'>('active');

  // Form states (Add/Edit)
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formOrganiser, setFormOrganiser] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formRegLink, setFormRegLink] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formDesc, setFormDesc] = useState('');

  // Simulation signup feedback states
  const [viewingAnn, setViewingAnn] = useState<TrainingAnnouncement | null>(null);

  // Filter lists
  const activeAnnouncements = announcements.filter(a => !a.isArchived);
  const archivedAnnouncements = announcements.filter(a => a.isArchived);
  const listToUse = activeSubTab === 'active' ? activeAnnouncements : archivedAnnouncements;

  // Open Form for Adding
  const openAddForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDate('');
    setFormTime('');
    setFormVenue('');
    setFormOrganiser('');
    setFormTarget('');
    setFormCategory('');
    setFormDeadline('');
    setFormRegLink('');
    setFormContact('');
    setFormDesc('');
    setShowFormModal(true);
  };

  // Open Form for Editing
  const openEditForm = (ann: TrainingAnnouncement) => {
    setEditingId(ann.id);
    setFormTitle(ann.title);
    setFormDate(ann.date);
    setFormTime(ann.time);
    setFormVenue(ann.venue);
    setFormOrganiser(ann.organiser);
    setFormTarget(ann.targetParticipants);
    setFormCategory(ann.category);
    setFormDeadline(ann.deadline);
    setFormRegLink(ann.registrationLink);
    setFormContact(ann.contactPerson);
    setFormDesc(ann.description);
    setShowFormModal(true);
  };

  // Form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDate || !formDeadline) return;

    onAddAnnouncement({
      id: editingId || undefined,
      title: formTitle,
      date: formDate,
      time: formTime || '09:00 - 17:00',
      venue: formVenue || 'N/A',
      organiser: formOrganiser || 'Dong Zong Unit',
      targetParticipants: formTarget || 'All Staff',
      category: formCategory || 'General',
      deadline: formDeadline,
      registrationLink: formRegLink || 'https://forms.dongzong.my',
      contactPerson: formContact || 'HR Officer',
      description: formDesc || '',
      isArchived: activeSubTab === 'archived' // retain status
    });

    setShowFormModal(false);
  };

  // Register or cancel registration for the event
  const handleRegisterSimulation = (id: string) => {
    const ann = announcements.find(a => a.id === id);
    if (!ann) return;
    
    const isCurrentlyRegistered = ann.registeredStaff?.some(s => s.email.toLowerCase() === currentUser.email.toLowerCase()) || false;
    onRegisterAnnouncement(id, currentUser, !isCurrentlyRegistered);

    if (isCurrentlyRegistered) {
      alert(currentLang === 'zh' ? '您已撤销对本项培训的登记。' : 'Registration interest cancelled.');
    } else {
      alert(currentLang === 'zh' ? '⭐ 登记成功！系统已向主办方报备您的志愿，人事处在通过后会将日程发送到您的董总邮箱。' : '⭐ Registered interest! An notification email has been queued to your Dong Zong calendar.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper header action frame */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Megaphone className="text-blue-700 w-5 h-5" />
            <span>{t.upcomingTraining}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentLang === 'zh' ? '董总主办或对口推荐之校级、省际专业高新技术培训及研讨会一览。' : 'Explore workshops curated for professional credentials.'}
          </p>
        </div>

        {/* HR Add Announcement Action */}
        {isHr && (
          <button
            onClick={openAddForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addAnnouncement}</span>
          </button>
        )}
      </div>

      {/* Announcements Tabs Drawer */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('active')}
          className={`py-3.5 px-6 text-sm font-semibold border-b-2 transition ${
            activeSubTab === 'active' 
              ? 'border-blue-600 text-blue-700 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.activeAnnouncements} ({activeAnnouncements.length})
        </button>
        <button
          onClick={() => setActiveSubTab('archived')}
          className={`py-3.5 px-6 text-sm font-semibold border-b-2 transition ${
            activeSubTab === 'archived' 
              ? 'border-blue-600 text-blue-700 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.archivedAnnouncements} ({archivedAnnouncements.length})
        </button>
      </div>

      {/* Core Announcements Grid */}
      {listToUse.length === 0 ? (
        <div className="text-center py-20 bg-white border rounded-3xl text-slate-400">
          {currentLang === 'zh' ? '暂没有任何公布的培训项目计划。' : 'No upcoming trainings or archived plans displayed.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listToUse.map((ann) => {
            const isRegistered = ann.registeredStaff?.some(s => s.email.toLowerCase() === currentUser.email.toLowerCase()) || false;
            const isDeadlinePassed = new Date(ann.deadline) < new Date();
            
            return (
              <div 
                key={ann.id} 
                className="bg-white rounded-3xl border border-slate-200/85 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition duration-200 relative overflow-hidden"
              >
                {/* Visual decoration tag */}
                <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 rounded-full bg-blue-600/5"></div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="bg-blue-50 text-blue-700 border border-blue-150 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                      {ann.category}
                    </span>

                    {/* Deadline alarm tracker badge */}
                    <div className="flex items-center space-x-1 text-xs text-amber-600 font-semibold bg-amber-50 rounded-md py-1 px-2.5 border border-amber-100">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{t.deadline}: {ann.deadline}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800 hover:text-blue-700 transition cursor-pointer" onClick={() => setViewingAnn(ann)}>
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {ann.description}
                    </p>
                  </div>

                  {/* Core parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{ann.date} ({ann.time})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate" title={ann.venue}>{ann.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Anchor className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{ann.organiser}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate" title={ann.targetParticipants}>{ann.targetParticipants}</span>
                    </div>
                  </div>

                  {/* HR Staff Listing for each Training Announcement */}
                  {isHr && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            {currentLang === 'zh' 
                              ? `已报备参训教师/职工 (${ann.registeredStaff?.length || 0})` 
                              : `Registered Staff List (${ann.registeredStaff?.length || 0})`}
                          </span>
                        </span>
                      </div>
                      
                      {!ann.registeredStaff || ann.registeredStaff.length === 0 ? (
                        <div className="text-[11px] text-slate-400 italic bg-slate-50 border border-slate-100/50 p-2 text-center rounded-xl">
                          {currentLang === 'zh' ? '暂无人员登记参训意向' : 'No staff registered yet'}
                        </div>
                      ) : (
                        <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 font-sans">
                          {ann.registeredStaff.map((staff, idx) => (
                            <div 
                              key={idx} 
                              className="text-[11px] bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100/50 p-2 rounded-xl flex justify-between items-center transition"
                            >
                              <div className="space-y-0.5">
                                <div className="font-extrabold text-slate-700">
                                  {staff.chineseName ? `${staff.chineseName} (${staff.name})` : staff.name}
                                </div>
                                <div className="text-[9px] text-slate-450 font-mono font-bold leading-none">
                                  {staff.department} • {staff.email}
                                </div>
                              </div>
                              <span className="text-[8px] text-slate-400 font-mono shrink-0 ml-2">
                                {staff.timestamp}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Operations segment */}
                <div className="border-t pt-4 mt-5 flex justify-between items-center bg-slate-50/40 -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setViewingAnn(ann)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg border hover:bg-white bg-slate-50 transition"
                    >
                      {currentLang === 'zh' ? '全屏读览' : 'Full Agenda'}
                    </button>
                    
                    {/* STAFF REGISTER BUTTON */}
                    {currentUser.role === 'staff' && !ann.isArchived && (
                      <button
                        onClick={() => handleRegisterSimulation(ann.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                          isRegistered
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 shadow-sm'
                        }`}
                      >
                        {isRegistered ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 inline mr-1" />
                            <span>{currentLang === 'zh' ? '已登记意愿' : 'Interested✓'}</span>
                          </>
                        ) : (
                          <span>{currentLang === 'zh' ? '我感兴趣，向HR登记' : 'Register Interest'}</span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* HR ADMINISTRATIVE TRIGGERS */}
                  {isHr && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => openEditForm(ann)}
                        className="p-1.5 hover:bg-amber-100 text-amber-700 rounded-lg transition"
                        title={t.edit}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onArchiveAnnouncement(ann.id)}
                        className="p-1.5 hover:bg-sky-100 text-sky-700 rounded-lg transition"
                        title={ann.isArchived ? (currentLang === 'zh' ? '重新发布' : 'Publish') : t.archive}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(currentLang === 'zh' ? '华文独立中学：确定需要删除本公告吗？' : 'Delete announcement permanently?')) {
                            onDeleteAnnouncement(ann.id);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                        title={t.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL ACCORDION DETAIL WINDOW (MODAL PANEL) */}
      {viewingAnn && (() => {
        const freshAnn = announcements.find(a => a.id === viewingAnn.id) || viewingAnn;
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex justify-between items-center">
                <span className="font-bold text-sm tracking-wide bg-blue-900/40 px-3 py-1 rounded">
                  {freshAnn.category}
                </span>
                <button onClick={() => setViewingAnn(null)} className="p-1 hover:bg-blue-800/80 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <h3 className="text-xl font-extrabold text-slate-800 leading-tight border-b pb-2">
                  {freshAnn.title}
                </h3>

                <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                  {freshAnn.description}
                </p>

                <div className="space-y-2.5 text-xs text-slate-750 pt-1">
                  <p><strong>📅 {currentLang === 'zh' ? '举办日程：' : 'Date / Time: '}</strong> {freshAnn.date} ({freshAnn.time})</p>
                  <p><strong>📍 {currentLang === 'zh' ? '培训地点：' : 'Venue: '}</strong> {freshAnn.venue}</p>
                  <p><strong>🏢 {currentLang === 'zh' ? '主办单位：' : 'Organiser: '}</strong> {freshAnn.organiser}</p>
                  <p><strong>👥 {currentLang === 'zh' ? '参训对象：' : 'Target Participants: '}</strong> {freshAnn.targetParticipants}</p>
                  <p><strong>📞 {currentLang === 'zh' ? '业务负责人：' : 'Contact coordinate: '}</strong> {freshAnn.contactPerson}</p>
                </div>

                {/* Registration Link Simulation placeholder */}
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-900 block">{currentLang === 'zh' ? '官办在线预约入口：' : 'Official registration link:'}</span>
                    <span className="underline font-mono text-amber-700 break-all">{freshAnn.registrationLink}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(currentLang === 'zh' ? '※ 正在前往外部统一申报系统' : 'Navigating to external registration...')}
                    className="bg-amber-600 font-bold hover:bg-amber-500 text-white rounded-lg px-3 py-1.5 transition ml-2 whitespace-nowrap"
                  >
                    {currentLang === 'zh' ? '前往' : 'Go'}
                  </button>
                </div>

                {/* HR Roster inside Full Agenda modal */}
                {isHr && (
                  <div className="pt-3 border-t">
                    <span className="font-bold text-slate-800 text-xs block mb-2 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>
                        {currentLang === 'zh' 
                          ? `已报备登记参训教师/职工列表 (${freshAnn.registeredStaff?.length || 0}人)` 
                          : `Registered Staff List (${freshAnn.registeredStaff?.length || 0} staff)`}
                      </span>
                    </span>
                    {!freshAnn.registeredStaff || freshAnn.registeredStaff.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 border p-3 rounded-xl text-center">
                        {currentLang === 'zh' ? '暂无任何教职工登记参训志愿。' : 'No staff registered for this announcement yet.'}
                      </p>
                    ) : (
                      <div className="max-h-[180px] overflow-y-auto space-y-1.5 border border-slate-200 bg-slate-50 p-2 text-xs rounded-xl">
                        {freshAnn.registeredStaff.map((staff, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 px-2 border-b border-slate-100 last:border-b-0 bg-white rounded-lg mb-1 shadow-xs">
                            <div>
                              <div className="font-extrabold text-slate-800">
                                {staff.chineseName ? `${staff.chineseName} (${staff.name})` : staff.name}
                              </div>
                              <div className="text-[10px] text-slate-450 font-mono font-bold">
                                {staff.department} • {staff.email}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                              {staff.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingAnn(null)}
                  className="bg-white border text-xs font-bold px-4 py-2 border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  {currentLang === 'zh' ? '关闭' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ANNOUNCEMENT CRUD CREATOR MODAL WINDOW */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl my-auto">
            <form onSubmit={handleFormSubmit}>
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-5 py-4 flex justify-between items-center font-bold">
                <span>{editingId ? (currentLang === 'zh' ? '修改培训公告' : 'Edit Training Announcement') : (currentLang === 'zh' ? '发布新培训公告' : 'Publish Training Announcement')}</span>
                <button type="button" onClick={() => setShowFormModal(false)} className="p-1 hover:bg-blue-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs grid grid-cols-1 gap-y-3.5">
                {/* Title */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block uppercase tracking-wide">{currentLang === 'zh' ? '公告标题' : 'Announcement Title'}</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. 2026 UEC Moderation guidelines workshop"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800"
                  />
                </div>

                {/* Organizer & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block uppercase tracking-wide">{currentLang === 'zh' ? '主办部门' : 'Organiser Section'}</label>
                    <input
                      type="text"
                      value={formOrganiser}
                      onChange={(e) => setFormOrganiser(e.target.value)}
                      placeholder="e.g. UEC Exam Unit"
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block uppercase tracking-wide">{currentLang === 'zh' ? '大类范畴' : 'Category / Tag'}</label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g. Course Reform"
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block uppercase tracking-wide">{currentLang === 'zh' ? '举办日期' : 'Seminar Date'}</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block uppercase tracking-wide">{currentLang === 'zh' ? '举办时刻' : 'Seminar Time'}</label>
                    <input
                      type="text"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      placeholder="e.g. 09:00 - 13:00"
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>

                {/* Venue & Target */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block uppercase tracking-wide">{currentLang === 'zh' ? '培训场所 / 平台介质' : 'Venue / Hosting Medium'}</label>
                  <input
                    type="text"
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    placeholder="e.g. ZOOM Hybrid Webinar / Hall B"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block uppercase tracking-wide">{currentLang === 'zh' ? '参课额定人群说明' : 'Target Staff Audience'}</label>
                  <input
                    type="text"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    placeholder="e.g. All Teachers and Syllabus writers"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800"
                  />
                </div>

                {/* Contact and Registration Link */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block uppercase tracking-wide">{currentLang === 'zh' ? '业务联络协调员' : 'Contact coordinate person'}</label>
                    <input
                      type="text"
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      placeholder="e.g. Mr. Wong (Ext 124)"
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block uppercase tracking-wide">{currentLang === 'zh' ? '截止日期' : 'Registration Deadline'}</label>
                    <input
                      type="date"
                      required
                      value={formDeadline}
                      onChange={(e) => setFormDeadline(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block uppercase tracking-wide">{currentLang === 'zh' ? '在线申报统一链接' : 'Registration hyperlink'}</label>
                  <input
                    type="url"
                    value={formRegLink}
                    onChange={(e) => setFormRegLink(e.target.value)}
                    placeholder="e.g. https://forms.dongzong.my/reg"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800 font-mono"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block uppercase tracking-wide">{currentLang === 'zh' ? '项目简介提要 (Description)' : 'Detailed Syllabus Summary'}</label>
                  <textarea
                    rows={4}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Outline key learning outcomes..."
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="bg-white border hover:bg-slate-100 border-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm"
                >
                  {currentLang === 'zh' ? '确认公布' : 'Publish Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
