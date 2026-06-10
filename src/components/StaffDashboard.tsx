import React, { useState, useRef, useEffect } from 'react';
import { TRANSLATIONS, Language } from '../translations';
import { User, TrainingRecord, TrainingType, PointRule, AppNotification } from '../types';
import { getCategories, getCategoryLabel, CourseCategory } from '../utils/categories';
import { 
  FileCheck, Clock, Award, AlertCircle, FilePlus, ChevronRight, 
  HelpCircle, Eye, Trash2, Edit3, X, Paperclip, CheckCircle2, AlertOctagon, Bell,
  Download, Cloud, CloudOff, RefreshCw
} from 'lucide-react';

interface StaffDashboardProps {
  currentLang: Language;
  currentUser: User;
  records: TrainingRecord[];
  pointRule: PointRule;
  onSubmitRecord: (record: Omit<TrainingRecord, 'id' | 'staffName' | 'staffEmail' | 'department' | 'submissionDate'> & { id?: string; driveFileId?: string; driveFileUrl?: string }) => void;
  onDeleteRecord: (id: string) => void;
  notifications: AppNotification[];
  onMarkNotificationsRead: (email: string) => void;
  onClearNotifications: (email: string) => void;
  googleUser?: any;
  googleToken?: string | null;
  connectGoogleDrive?: () => Promise<any>;
  disconnectGoogleDrive?: () => Promise<void>;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  currentLang,
  currentUser,
  records,
  pointRule,
  onSubmitRecord,
  onDeleteRecord,
  notifications,
  onMarkNotificationsRead,
  onClearNotifications,
  googleUser,
  googleToken,
  connectGoogleDrive,
  disconnectGoogleDrive
}) => {
  const t = TRANSLATIONS[currentLang];
  
  // States
  const [activeTab, setActiveTab] = useState<'overview' | 'submit' | 'records'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Submit Form States (Dual purpose: Edit / Create)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formOrganiser, setFormOrganiser] = useState('');
  const [formType, setFormType] = useState<TrainingType>(() => {
    const cats = getCategories();
    return cats.length > 0 ? cats[0].id : 'internal';
  });
  const [formDate, setFormDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formDuration, setFormDuration] = useState<number>(2);
  const [formVenue, setFormVenue] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLecturer, setFormLecturer] = useState('');
  const [formTrainingTime, setFormTrainingTime] = useState('');
  const [formDriveFileId, setFormDriveFileId] = useState<string>('');
  const [formDriveFileUrl, setFormDriveFileUrl] = useState<string>('');
  
  // File upload simulation
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');
  const [uploadedFileData, setUploadedFileData] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Real Google Drive states
  const [uploadedFileObject, setUploadedFileObject] = useState<File | null>(null);
  const [isSyncingToDrive, setIsSyncingToDrive] = useState(false);
  const [googleUploadError, setGoogleUploadError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<TrainingRecord | null>(null);
  const [drivePreviewUrl, setDrivePreviewUrl] = useState<string | null>(null);
  const [isLoadingDriveFile, setIsLoadingDriveFile] = useState(false);

  // Load Drive files privately via OAuth token for secure client viewing
  useEffect(() => {
    let active = true;
    if (selectedRecord && selectedRecord.driveFileId && googleToken) {
      setIsLoadingDriveFile(true);
      setDrivePreviewUrl(null);
      import('../lib/googleDrive')
        .then((m) => m.downloadFileFromGoogleDrive(selectedRecord.driveFileId!))
        .then((blob) => {
          if (active) {
            const url = URL.createObjectURL(blob);
            setDrivePreviewUrl(url);
            setIsLoadingDriveFile(false);
          }
        })
        .catch((err) => {
          console.error("Error loaded Drive file", err);
          if (active) {
            setIsLoadingDriveFile(false);
          }
        });
    } else {
      setDrivePreviewUrl(null);
      setIsLoadingDriveFile(false);
    }

    return () => {
      active = false;
      if (drivePreviewUrl) {
        URL.revokeObjectURL(drivePreviewUrl);
      }
    };
  }, [selectedRecord, googleToken]);

  // Helper function to extract year from YYYY-MM-DD
  const getYearFromDate = (dateStr: string) => dateStr ? dateStr.split('-')[0] : '2026';

  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [sortField, setSortField] = useState<'date' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');



  // Helper calculations (only verified records are counted for official points)
  const myRecords = records.filter(r => r.staffEmail === currentUser.email);
  
  // Dynamic list of active years based on real staff history
  const availableYears = Array.from(new Set([
    '2026',
    '2025',
    ...myRecords.map(r => getYearFromDate(r.date))
  ])).filter(Boolean).sort((a, b) => b.localeCompare(a));

  // Points will refresh on 1 January each year: filter records by selectedYear!
  const myRecordsForSelectedYear = myRecords.filter(r => selectedYear === 'all' || getYearFromDate(r.date) === selectedYear);
  const verifiedRecords = myRecordsForSelectedYear.filter(r => r.status === 'Verified');
  const pendingRecords = myRecordsForSelectedYear.filter(r => r.status === 'Pending Verification' || r.status === 'Correction Req.' as any);
  
  const totalVerifiedHours = verifiedRecords.reduce((sum, r) => sum + r.duration, 0);
  
  // Points calculation logic (using HR-set rule)
  // Max cap: e.g. 10 points per year, refreshing on Jan 1st of each year
  const calculatedPointsRaw = totalVerifiedHours / pointRule.hoursPerPoint;
  const totalVerifiedPoints = Math.min(calculatedPointsRaw, pointRule.maxPointsPerYear);
  const remainingPoints = Math.max(0, pointRule.maxPointsPerYear - totalVerifiedPoints);
  const totalPendingHours = pendingRecords.reduce((sum, r) => sum + r.duration, 0);

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateFileUpload(e.target.files[0]);
    }
  };

  const simulateFileUpload = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      alert(currentLang === 'zh' ? '上传失败：证明文件大小不能超过 8MB！' : 'Upload failed: Attachment size cannot exceed 8MB!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    setIsUploading(true);
    setUploadedFileObject(file);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFileData(reader.result as string);
      setUploadedFileName(file.name);
      const sizeKB = Math.round(file.size / 1024);
      setUploadedFileSize(sizeKB > 1000 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setUploadedFileName(file.name);
      const sizeKB = Math.round(file.size / 1024);
      setUploadedFileSize(sizeKB > 1000 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formOrganiser || !formDate || formDuration <= 0) {
      alert(currentLang === 'zh' ? '请完整填写表单关键信息！' : 'Please fill in all critical fields!');
      return;
    }

    if (formDesc.trim().length < 100) {
      alert(
        currentLang === 'zh'
          ? `培训详细内容概要需要至少100字，当前仅有 ${formDesc.trim().length} 字，还差 ${100 - formDesc.trim().length} 字才能提交。`
          : `Training detailed content summary must be at least 100 characters. Current length: ${formDesc.trim().length} characters, need ${100 - formDesc.trim().length} more to submit.`
      );
      return;
    }

    let finalDriveId = formDriveFileId || undefined;
    let finalDriveUrl = formDriveFileUrl || undefined;

    if (uploadedFileObject && googleToken) {
      setIsSyncingToDrive(true);
      setGoogleUploadError(null);
      try {
        const { uploadFileToGoogleDrive } = await import('../lib/googleDrive');
        const res = await uploadFileToGoogleDrive(uploadedFileObject, uploadedFileObject.name, {
          applicant: currentUser.chineseName || currentUser.name,
          title: formTitle,
        });
        finalDriveId = res.fileId;
        finalDriveUrl = res.webViewLink;
      } catch (uploadErr: any) {
        console.error("Failed to upload to Google Drive", uploadErr);
        setGoogleUploadError(uploadErr.message || 'Drive Upload Failed');
        setIsSyncingToDrive(false);
        const proceed = confirm(
          currentLang === 'zh' 
            ? 'Google Drive 上传失败：' + (uploadErr.message || '') + '\n是否仍以本地备份方式提交申请？' 
            : 'Google Drive upload failed: ' + (uploadErr.message || '') + '\nDo you still want to submit using local backup storage?'
        );
        if (!proceed) {
          return;
        }
      }
    }

    try {
      onSubmitRecord({
        id: editingId || undefined,
        title: formTitle,
        organiser: formOrganiser,
        type: formType,
        date: formDate,
        endDate: formEndDate ? formEndDate : undefined,
        duration: Number(formDuration),
        venue: formVenue || 'N/A',
        description: formDesc,
        lecturer: formLecturer ? formLecturer : undefined,
        trainingTime: formTrainingTime ? formTrainingTime : undefined,
        fileName: uploadedFileName || 'unspecified_document.pdf',
        fileSize: uploadedFileSize || '250 KB',
        fileData: uploadedFileData || undefined,
        status: 'Pending Verification',
        driveFileId: finalDriveId,
        driveFileUrl: finalDriveUrl
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingToDrive(false);
      resetForm();
      setActiveTab('records');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormOrganiser('');
    setFormType('internal');
    setFormDate('');
    setFormEndDate('');
    setFormDuration(2);
    setFormVenue('');
    setFormDesc('');
    setFormLecturer('');
    setFormTrainingTime('');
    setUploadedFileName('');
    setUploadedFileSize('');
    setUploadedFileData('');
    setUploadedFileObject(null);
    setGoogleUploadError(null);
    setFormDriveFileId('');
    setFormDriveFileUrl('');
  };

  const startEdit = (rec: TrainingRecord) => {
    setEditingId(rec.id);
    setFormTitle(rec.title);
    setFormOrganiser(rec.organiser);
    setFormType(rec.type);
    setFormDate(rec.date);
    setFormEndDate(rec.endDate || '');
    setFormDuration(rec.duration);
    setFormVenue(rec.venue);
    setFormDesc(rec.description);
    setFormLecturer(rec.lecturer || '');
    setFormTrainingTime(rec.trainingTime || '');
    setUploadedFileName(rec.fileName || '');
    setUploadedFileSize(rec.fileSize || '');
    setUploadedFileData(rec.fileData || '');
    setFormDriveFileId(rec.driveFileId || '');
    setFormDriveFileUrl(rec.driveFileUrl || '');
    setActiveTab('submit');
  };

  const handleExportCSV = () => {
    let csvRows: string[] = [];
    csvRows.push('Staff No,Chinese Name,English Name,Email,Department,Training program title,Organiser,Category,Training Date,Stated Hours (Duration),Venue/Platform,Verification Status,Feedback/Remarks');
    filteredRecords.forEach(r => {
      csvRows.push(`"${currentUser.staffNo || ''}","${currentUser.chineseName}","${currentUser.name}","${currentUser.email}","${currentUser.department}","${r.title.replace(/"/g, '""')}","${r.organiser.replace(/"/g, '""')}","${r.type.toUpperCase()}","${r.date}",${r.duration},"${r.venue.replace(/"/g, '""')}","${r.status}","${(r.remarks || '').replace(/"/g, '""')}"`);
    });
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `My_Training_Records_${currentUser.name.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportStatsOnly = () => {
    let csvRows: string[] = [];
    csvRows.push('Category,Detail Value');
    csvRows.push(`Staff No,"${currentUser.staffNo || ''}"`);
    csvRows.push(`Staff Name,"${currentUser.chineseName} (${currentUser.name})"`);
    csvRows.push(`Email,"${currentUser.email}"`);
    csvRows.push(`Department,"${currentUser.department}"`);
    csvRows.push(`Appraisal Year,"${selectedYear === 'all' ? 'All Years' : selectedYear}"`);
    csvRows.push(`Verified Training Courses,${verifiedRecords.length}`);
    csvRows.push(`Verified Training Hours,${totalVerifiedHours}`);
    csvRows.push(`Verified CPD Points,${totalVerifiedPoints} / ${pointRule.maxPointsPerYear}`);
    csvRows.push(`Remaining Points to Target,${remainingPoints}`);
    csvRows.push(`Pending Applications,${pendingRecords.length}`);
    csvRows.push(`Pending Training Hours,${totalPendingHours}`);
    csvRows.push(`Goal Status,"${totalVerifiedPoints >= pointRule.maxPointsPerYear ? 'TARGET REACHED (PASSED)' : 'PENDING TARGET'}"`);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `My_Training_Statistics_${currentUser.name.replace(/\s+/g, '_')}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filters, Searching, and Sorting
  const filteredRecords = myRecords
    .filter(rec => {
      const matchesQuery = 
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.organiser.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.venue.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || rec.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
      const matchesYear = selectedYear === 'all' || getYearFromDate(rec.date) === selectedYear;

      return matchesQuery && matchesType && matchesStatus && matchesYear;
    })
    .sort((a, b) => {
      if (sortField === 'type') {
        const typeA = a.type.toLowerCase();
        const typeB = b.type.toLowerCase();
        if (typeA < typeB) return sortOrder === 'asc' ? -1 : 1;
        if (typeA > typeB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      } else {
        // default date sort
        return sortOrder === 'asc' 
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      }
    });

  return (
    <div className="space-y-6">
      {/* Tab Navigation Menu */}
      <div className="flex border-b border-slate-200 bg-white px-6 rounded-2xl shadow-xs">
        <button
          onClick={() => { setActiveTab('overview'); resetForm(); }}
          className={`py-4 px-6 text-sm font-semibold tracking-wide border-b-2 transition duration-150 ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-750 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          {t.dashboard}
        </button>
        <button
          onClick={() => { setActiveTab('records'); resetForm(); }}
          className={`py-4 px-6 text-sm font-semibold tracking-wide border-b-2 transition duration-150 ${
            activeTab === 'records'
              ? 'border-blue-600 text-blue-750 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          {t.myRecords} ({myRecords.length})
        </button>
        <button
          onClick={() => { setActiveTab('submit'); }}
          className={`py-4 px-6 text-sm font-semibold tracking-wide border-b-2 transition duration-150 flex items-center space-x-2 ${
            activeTab === 'submit'
              ? 'border-blue-600 text-blue-750 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          <FilePlus className="w-4 h-4 text-blue-600" />
          <span>{editingId ? (currentLang === 'zh' ? '更正培训申报' : 'Edit Claims') : t.submitRecord}</span>
        </button>
      </div>

      {/* VIEW: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Welcome Card banner */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl shadow-md text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-blue-600/20 blur-xl pointer-events-none"></div>
            <div className="z-10 space-y-2">
              <span className="bg-amber-500/90 text-slate-950 font-bold uppercase text-[10px] tracking-widest px-2.5 py-1 rounded-full border border-amber-300">
                Staff Account {currentUser.staffNo ? `• ${currentUser.staffNo}` : ''} • {currentUser.department.split(' ')[0]}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight pt-1">
                {t.welcomeBack}, {currentUser.chineseName} {currentUser.name}!
              </h2>
              <p className="text-blue-105 font-medium text-sm max-w-xl">
                {currentLang === 'zh' 
                  ? '这是您的董总专属专业成长积分板。持续参与培训，提升独中行政与教学质量。' 
                  : 'Welcome to your Dong Zong Continuous Professional Development board. Build competency for independent schools.'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('submit')}
              className="mt-4 md:mt-0 z-10 bg-amber-500 text-slate-900 hover:bg-amber-400 font-bold text-sm px-5 py-3 rounded-xl transition shadow-md flex items-center space-x-1.5"
            >
              <span>{t.submitRecord}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* NOTIFICATION INBOX CORNER */}
          {((notifications || []).filter(n => n.userEmail.toLowerCase() === currentUser.email.toLowerCase())).length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Bell className="w-5 h-5 text-blue-600 animate-swing" />
                    {((notifications || []).filter(n => n.userEmail.toLowerCase() === currentUser.email.toLowerCase() && !n.isRead)).length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                        {((notifications || []).filter(n => n.userEmail.toLowerCase() === currentUser.email.toLowerCase() && !n.isRead)).length}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">
                      {currentLang === 'zh' ? '审核提报通知中心' : 'Audit Feedback Desk'}
                    </h3>
                    <p className="text-[11px] text-slate-450">
                      {currentLang === 'zh' ? '查看您提交的学时材料最新的审核驳回或通过状态' : 'Track active approval / return-rejection updates on your submissions.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-[10px]">
                  {((notifications || []).filter(n => n.userEmail.toLowerCase() === currentUser.email.toLowerCase() && !n.isRead)).length > 0 && (
                    <button
                      onClick={() => onMarkNotificationsRead(currentUser.email)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      {currentLang === 'zh' ? '📭 全部标记已读' : 'Mark all read'}
                    </button>
                  )}
                  <button
                    onClick={() => onClearNotifications(currentUser.email)}
                    className="text-[11px] font-bold text-slate-550 hover:text-slate-650 bg-slate-100 px-2.5 py-1 rounded-lg transition active:scale-95 cursor-pointer"
                  >
                    {currentLang === 'zh' ? '🧹 清空通知历史' : 'Clear history'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {((notifications || []).filter(n => n.userEmail.toLowerCase() === currentUser.email.toLowerCase())).map((notif) => {
                  const correspondingRec = records.find(r => r.id === notif.recordId);
                  
                  return (
                    <div 
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition duration-150 relative ${
                        notif.type === 'rejected' 
                          ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-50' 
                          : 'bg-emerald-50/50 border-emerald-150 hover:bg-emerald-50'
                      } ${!notif.isRead ? 'ring-1.5 ring-blue-500/10' : ''}`}
                    >
                      {!notif.isRead && (
                        <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-blue-600 rounded-full" title="New alert"></span>
                      )}
                      
                      <div className="space-y-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          notif.type === 'rejected' ? 'bg-rose-100/90 text-rose-800' : 'bg-emerald-100/90 text-emerald-805'
                        }`}>
                          {notif.type === 'rejected' ? (currentLang === 'zh' ? '⚠️ 驳回重审' : 'Returned') : (currentLang === 'zh' ? '✓ 审核通过' : 'Approved')}
                        </span>
                        
                        <div className="font-extrabold text-xs text-slate-850 leading-tight">
                          {currentLang === 'zh' ? notif.titleZh : notif.titleEn}
                        </div>
                        
                        <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                          {currentLang === 'zh' ? notif.messageZh : notif.messageEn}
                        </p>
                        
                        <div className="text-[9px] text-slate-400 font-mono pt-1">
                          {notif.timestamp}
                        </div>

                        {notif.type === 'rejected' && correspondingRec && (
                          <div className="pt-2 border-t border-rose-100/70 mt-2 flex justify-end">
                            <button
                              onClick={() => {
                                // Mark single read
                                onMarkNotificationsRead(currentUser.email);
                                // Start editing directly and return to editing state
                                startEdit(correspondingRec);
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition active:scale-95"
                            >
                              <span>✏️</span>
                              <span>{currentLang === 'zh' ? '编辑并再次提报' : 'Correct & Resubmit'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Year Selector Control (Points reset on Jan 1st each year) */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📅</span>
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {currentLang === 'zh' ? '当前考核与积分度量年度' : 'CPD Points Valuation Calendar'}
                </h3>
                <p className="text-[11px] text-slate-450 mt-0.5">
                  {currentLang === 'zh' ? '考核积分于每年1月1日自动清零并重启核算。切换年度查看历史学时与积分累计。' : 'Annual training points reset on Jan 1st each year. Select a year to review statistics.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-black px-4 py-2.5 rounded-xl cursor-pointer focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>
                    ⭐ {yr} {currentLang === 'zh' ? '计划年度' : 'Year Appraisal'}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleExportStatsOnly}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title={currentLang === 'zh' ? '导出并下载我的学时与积分统计极简报告' : 'Export My Training Credits Statistics Summary Roster'}
              >
                <Download className="w-4 h-4" />
                <span>{currentLang === 'zh' ? '导出统计' : 'Export Stats'}</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Verified Hours Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/85 shadow-xs flex items-center space-x-4">
              <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  {t.accumulatedHours}
                </span>
                <span className="text-2xl md:text-3xl font-black text-slate-800">
                  {totalVerifiedHours} <span className="text-xs font-semibold text-slate-400">{t.hoursShort}</span>
                </span>
              </div>
            </div>

            {/* Verified Points Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/85 shadow-xs flex items-center space-x-4 relative overflow-hidden">
              <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  {t.accumulatedPoints}
                </span>
                <span className="text-2xl md:text-3xl font-black text-slate-800 block">
                  {totalVerifiedPoints} / {pointRule.maxPointsPerYear} <span className="text-xs font-semibold text-slate-400">{t.pointsShort}</span>
                </span>
              </div>
              {/* Simple progress pill */}
              <div className="absolute right-4 top-4">
                {totalVerifiedPoints >= pointRule.maxPointsPerYear ? (
                  <span className="bg-blue-105 text-blue-800 font-extrabold text-[10px] px-2 py-0.5 rounded border border-blue-300">
                    PASS
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded border border-amber-300">
                    PENDING
                  </span>
                )}
              </div>
            </div>

            {/* Points to Max Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/85 shadow-xs flex items-center space-x-4">
              <div className="p-3.5 bg-amber-50 rounded-xl text-amber-600">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  {t.pointsToMax}
                </span>
                <span className="text-2xl md:text-3xl font-black text-slate-800">
                  {remainingPoints} <span className="text-xs font-semibold text-slate-400">{t.pointsShort}</span>
                </span>
              </div>
            </div>

            {/* Pending Hours card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/85 shadow-xs flex items-center space-x-4">
              <div className="p-3.5 bg-rose-50 rounded-xl text-rose-500">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block animate-pulse">
                  {t.pendingHours}
                </span>
                <span className="text-2xl md:text-3xl font-black text-slate-800">
                  {totalPendingHours} <span className="text-xs font-semibold text-slate-400">{t.hoursShort}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Ring & Rules breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1 border-b pb-3 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-700" />
                  <span>{currentLang === 'zh' ? '年度考核积分进度' : 'Annual Targets Tracker'}</span>
                </h3>

                {/* Circular Progress Gauge */}
                <div className="flex justify-center items-center py-6">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        stroke="#f1f5f9"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        stroke="#1d4ed8"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 68}
                        strokeDashoffset={2 * Math.PI * 68 * (1 - (totalVerifiedPoints / pointRule.maxPointsPerYear))}
                        className="transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-4xl font-extrabold text-slate-800 font-display block">
                        {Math.floor((totalVerifiedPoints / pointRule.maxPointsPerYear) * 100)}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block mt-0.5">
                        {totalVerifiedPoints} / {pointRule.maxPointsPerYear} PTS
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Rules Explanations Board */}
              <div className="bg-blue-50 border border-blue-100/80 p-4 rounded-xl text-blue-950 text-xs leading-relaxed space-y-1">
                <span className="font-bold text-blue-850 text-sm block">
                  {currentLang === 'zh' ? '当前换算制度明细' : 'Current Policy Summary'}
                </span>
                <p>• {pointRule.hoursPerPoint} {currentLang === 'zh' ? '个培训小时' : 'hours of training'} = 1 {currentLang === 'zh' ? '分' : 'point'}</p>
                <p>• {currentLang === 'zh' ? '每年考核最高计入' : 'Maximum claim allowed'} = {pointRule.maxPointsPerYear} {currentLang === 'zh' ? '个积分 (即' : 'points ('}{pointRule.maxPointsPerYear * pointRule.hoursPerPoint} {currentLang === 'zh' ? '小时)' : 'verified hrs)'}</p>
                <p>• {currentLang === 'zh' ? '必须上传培训证明，方可审核计分。' : 'Supporting evidence is mandatory for all claims.'}</p>
              </div>
            </div>

            {/* Recent Submissions Status Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:col-span-2 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <h3 className="text-base font-bold text-slate-800">
                    {currentLang === 'zh' ? '我最近的申报记录' : 'Recent Submissions Log'}
                  </h3>
                  <button
                    onClick={() => setActiveTab('records')}
                    className="text-xs text-blue-700 hover:underline font-semibold"
                  >
                    {currentLang === 'zh' ? '查看全部' : 'View All'} ({myRecords.length})
                  </button>
                </div>

                {myRecords.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    {currentLang === 'zh' ? '暂无申报记录。点击上方标签即可申报！' : 'No training submissions recorded yet. Click above to submit!'}
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1">
                    {myRecords.slice(0, 4).map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedRecord(rec)}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 cursor-pointer transition"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-850 text-sm group-hover:text-blue-700 transition">
                            {rec.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                            <span>{rec.organiser}</span>
                            <span>•</span>
                            <span>{rec.date}</span>
                            <span>•</span>
                            <span className="font-mono bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                              {rec.duration} {t.hoursShort}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 md:mt-0 flex items-center space-x-2 self-start md:self-center">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            rec.status === 'Verified'
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                              : rec.status === 'Rejected'
                              ? 'bg-rose-50 border border-rose-200 text-rose-700'
                              : 'bg-amber-50 border border-amber-200 text-amber-700'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              rec.status === 'Verified' ? 'bg-emerald-500' : rec.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                            }`}></span>
                            <span>
                              {rec.status === 'Verified' 
                                ? t.verified 
                                : rec.status === 'Rejected' 
                                ? t.rejected 
                                : t.pending}
                            </span>
                          </span>
                          <Eye className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-4 flex justify-between items-center text-xs text-slate-400">
                <span>{currentLang === 'zh' ? '※ 仅经人事处审核通过的小时方累计入积分。' : '* Points count certified hours only.'}</span>
                <span className="font-mono text-[9px] uppercase bg-slate-100 px-2 py-0.5 rounded tracking-wider">
                  PERSISTENT ENGINE: ACTIVE (LOCALSTORAGE)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ALL MY RECORDS TABLE */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {currentLang === 'zh' ? '全员申报历史与检索' : 'All Training Claims Directory'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentLang === 'zh' ? '检索、编辑或跟踪您的所有申报记录。' : 'Filter, search and manage your personal validation sheets.'}
              </p>
            </div>

            {/* Quick Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-sky-50 text-sky-800 text-xs px-3 py-2 rounded-lg border border-sky-200 font-extrabold whitespace-nowrap cursor-pointer focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="all">{currentLang === 'zh' ? '📅 全部年度' : '📅 All Years'}</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>📅 {yr} {currentLang === 'zh' ? '年度' : 'Year'}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 text-slate-700 text-xs px-3 py-2 rounded-lg border border-slate-200 font-medium whitespace-nowrap focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="all">{t.filterType}</option>
                {getCategories().map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {currentLang === 'zh' ? cat.nameZh : cat.nameEn}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 text-slate-700 text-xs px-3 py-2 rounded-lg border border-slate-200 font-medium whitespace-nowrap focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="all">{t.filterStatus}</option>
                <option value="Pending Verification">{t.pending}</option>
                <option value="Verified">{t.verified}</option>
                <option value="Rejected">{t.rejected}</option>
              </select>

              <span className="w-px h-6 bg-slate-200 mx-1 hidden sm:inline-block"></span>

              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-slate-50 text-slate-705 text-xs px-3 py-2 rounded-lg border border-slate-200 font-bold whitespace-nowrap cursor-pointer focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="date">{currentLang === 'zh' ? '📅 按日期排序' : '📅 Sort by Date'}</option>
                <option value="type">{currentLang === 'zh' ? '📚 按培训类型排序' : '📚 Sort by Type'}</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 transition cursor-pointer focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                title={currentLang === 'zh' ? '点击切换倒序/正序' : 'Click to toggle sort order'}
              >
                {sortOrder === 'asc' ? '▲ ASC' : '▼ DESC'}
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition flex items-center space-x-1 cursor-pointer focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                title={currentLang === 'zh' ? '一键导出当前检索的培训时数报表到CSV表格' : 'Export current filtered listing to CSV'}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{currentLang === 'zh' ? '导出 CSV' : 'Export'}</span>
              </button>
            </div>
          </div>

          {/* Search bar input */}
          <div className="relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 text-sm px-4 py-3 pl-10 rounded-xl border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>

          {/* Records Table representation */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              {currentLang === 'zh' ? '未找到符合条件或未曾申报此类的培训项目。' : 'No records match search parameters configured.'}
            </div>
          ) : (
            <div>
              {/* Desktop View Table */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/60">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                      <th className="p-4">{t.trainingTitle}</th>
                      <th className="p-4">{t.trainingDate}</th>
                      <th className="p-4">{t.durationHours}</th>
                      <th className="p-4">{t.organiser}</th>
                      <th className="p-4">{t.status}</th>
                      <th className="p-4 text-right">{currentLang === 'zh' ? '管理' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60 transition duration-150">
                        <td className="p-4 max-w-xs md:max-w-sm">
                          <div className="font-bold text-slate-800 leading-tight">
                            {rec.title}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 font-mono">
                            {getCategoryLabel(rec.type, currentLang)} • {rec.venue}
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 font-mono text-xs whitespace-nowrap">
                          {rec.date}
                        </td>
                        <td className="p-4 font-mono whitespace-nowrap">
                          <span className="bg-sky-50 text-sky-800 font-bold px-2 py-0.5 rounded text-xs border border-sky-100">
                            {rec.duration} h
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 truncate max-w-[120px]">
                          {rec.organiser}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            rec.status === 'Verified'
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                              : rec.status === 'Rejected'
                              ? 'bg-rose-50 border border-rose-200 text-rose-700'
                              : 'bg-amber-50 border border-amber-200 text-amber-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              rec.status === 'Verified' ? 'bg-emerald-500' : rec.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                            }`}></span>
                            <span>
                              {rec.status === 'Verified' 
                                ? t.verified 
                                : rec.status === 'Rejected' 
                                ? t.rejected 
                                : t.pending}
                            </span>
                          </span>
                          
                          {/* Tiny remarks indicator */}
                          {rec.remarks && (
                            <div className="text-[10px] text-rose-500 mt-1 max-w-[160px] truncate" title={rec.remarks}>
                              {currentLang === 'zh' ? '反馈: ' : 'Feedback: '} {rec.remarks}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedRecord(rec)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 text-slate-500 rounded-lg transition"
                              title={currentLang === 'zh' ? '查看详情及证明' : 'View documentation details'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Allow Edit / Delete ONLY if pending verification or rejected (can make corrections) */}
                            {rec.status !== 'Verified' && (
                              <>
                                <button
                                  onClick={() => startEdit(rec)}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                                  title={t.edit}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(currentLang === 'zh' ? '确定要删除这条培训申请吗？本操作不可撤销。' : 'Are you sure you want to delete this training claim?')) {
                                      onDeleteRecord(rec.id);
                                    }
                                  }}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                                  title={t.delete}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Stack (Sleek, Minimalist Cards instead of wide tables) */}
              <div className="block md:hidden space-y-4">
                {filteredRecords.map((rec) => (
                  <div 
                    key={rec.id} 
                    className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5 transition"
                  >
                    <div className="flex justify-between items-start gap-2.5">
                      <div className="space-y-1">
                        <span className="inline-block font-sans font-extrabold text-[9px] bg-slate-100 rounded-md px-1.5 py-0.5 border text-slate-500 uppercase tracking-wide">
                          {getCategoryLabel(rec.type, currentLang)}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm leading-snug">
                          {rec.title}
                        </h4>
                      </div>
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        rec.status === 'Verified'
                          ? 'bg-emerald-50 border border-emerald-150 text-emerald-700'
                          : rec.status === 'Rejected'
                          ? 'bg-rose-50 border border-rose-150 text-rose-700'
                          : 'bg-amber-50 border border-amber-150 text-amber-700'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          rec.status === 'Verified' ? 'bg-emerald-500' : rec.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}></span>
                        <span>{rec.status === 'Verified' ? t.verified : rec.status === 'Rejected' ? t.rejected : t.pending}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pb-2 border-b text-xs font-semibold text-slate-500 border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">{t.trainingDate}</span>
                        <span className="font-mono text-slate-850 font-bold">{rec.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">{t.durationHours}</span>
                        <span className="font-mono text-sky-850 font-bold inline-block bg-sky-50/70 px-1.5 py-0.2 rounded border border-sky-100">{rec.duration} {t.hoursShort}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">{t.organiser}</span>
                        <span className="text-slate-800 truncate block max-w-full">{rec.organiser}</span>
                      </div>
                      {rec.remarks && (
                        <div className="col-span-2 bg-rose-50/70 border border-rose-100 p-2.5 rounded-xl text-rose-700 text-xs mt-1">
                          <span className="font-bold text-[10px] block mb-0.5">⚠️ {currentLang === 'zh' ? '驳回反馈: ' : 'Return Feedback: '}</span>
                          <p className="font-mono text-[11px] whitespace-pre-wrap font-semibold leading-normal">{rec.remarks}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex space-x-1.5 max-w-[50%]">
                        {rec.fileName && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-150 rounded-lg px-2 py-0.5 font-mono font-bold truncate" title={rec.fileName}>
                            📎 {rec.fileName}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2 shrink-0">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border text-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{currentLang === 'zh' ? '查看' : 'Details'}</span>
                        </button>
                        {rec.status !== 'Verified' && (
                          <>
                            <button
                              onClick={() => startEdit(rec)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg transition cursor-pointer font-bold"
                              title={t.edit}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(currentLang === 'zh' ? '确定要删除这条培训申请吗？本操作不可撤销。' : 'Are you sure you want to delete this training claim?')) {
                                  onDeleteRecord(rec.id);
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg transition cursor-pointer"
                              title={t.delete}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: SUBMIT NEW / EDIT FORM */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm max-w-3xl mx-auto">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <FilePlus className="text-blue-700 w-5 h-5" />
              <span>
                {editingId 
                  ? (currentLang === 'zh' ? `修改培训申报: "${formTitle}"` : `Edit Training Claims: "${formTitle}"`) 
                  : (currentLang === 'zh' ? '提交培训积分申报' : 'Submit Staff Training Records')}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {currentLang === 'zh' 
                ? '申报个人所参与的学术论坛、培训课程、网络自学时数以换算年度CPD积分。' 
                : 'Upload proof and hours to request HR admin verification of external or internal credentials.'}
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                  {t.trainingTitle} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={currentLang === 'zh' ? '例如: 华文独中现代教学法研究班' : 'e.g. 2026 AWS Cloud Practitioner Training'}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition"
                />
              </div>

              {/* Organiser */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                  {t.organiser} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={currentLang === 'zh' ? '例如: 华社研究中心 / 国立大学' : 'e.g. Amazon Web Services'}
                  value={formOrganiser}
                  onChange={(e) => setFormOrganiser(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition"
                />
              </div>

              {/* Type selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                  {t.trainingType} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as TrainingType)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition font-medium"
                >
                  {getCategories().map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {currentLang === 'zh' ? cat.nameZh : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Training Date */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5 font-sans">
                  {t.trainingDate} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => {
                    setFormDate(e.target.value);
                    if (formEndDate && e.target.value > formEndDate) {
                      setFormEndDate('');
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition font-mono"
                />
              </div>

              {/* Training End Date */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5 font-sans flex justify-between items-center">
                  <span>{t.trainingEndDate}</span>
                  {formEndDate && formDate && (
                    <span className="text-[9px] bg-blue-105 text-white px-2 py-0.5 rounded-full font-bold">
                      {currentLang === 'zh' ? '多日日程' : 'Multi-day range'}
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  value={formEndDate}
                  min={formDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition font-mono"
                />
              </div>

              {/* Lecturer */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5 font-sans">
                  {t.lecturer}
                </label>
                <input
                  type="text"
                  placeholder={currentLang === 'zh' ? '选填：授课学者、主讲老师姓名' : 'Optional: e.g. Prof. Lee, Dr. Tan'}
                  value={formLecturer}
                  onChange={(e) => setFormLecturer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition"
                />
              </div>

              {/* Training Time */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5 font-sans">
                  {t.trainingTime}
                </label>
                <input
                  type="text"
                  placeholder={currentLang === 'zh' ? '选填：例如 09:00 - 16:30 或 午后时段' : 'Optional: e.g. 09:00 - 12:30 & 14:00 - 17:00'}
                  value={formTrainingTime}
                  onChange={(e) => setFormTrainingTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition"
                />
              </div>

              {/* Duration in Hours */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5 flex justify-between">
                  <span>{t.durationHours} <span className="text-rose-500">*</span></span>
                  <span className="text-blue-700 font-semibold font-mono">
                    {currentLang === 'zh' ? '折算预计: ' : 'Est: '} {(formDuration / pointRule.hoursPerPoint).toFixed(2)} {t.pointsShort}
                  </span>
                </label>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={formDuration}
                  onChange={(e) => setFormDuration(Math.max(0.5, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition font-mono"
                />
              </div>

              {/* Venue */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                  {t.venuePlatform}
                </label>
                <input
                  type="text"
                  placeholder={currentLang === 'zh' ? '例如: 吉隆坡董总大楼会议室B / 线上直播ZOOM' : 'e.g. Zoom Webinar, Dong Zong Hall B'}
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5 flex items-center gap-1">
                  <span>{t.description}</span>
                  <span className="text-rose-500 font-bold text-sm">*</span>
                </label>
                <textarea
                  placeholder={currentLang === 'zh' ? '请叙述培训的主要提纲及核心内容要领（最少需要100字以确保申报审核真实合规）...' : 'Summarise key learning objectives and outcomes of the professional syllabus (minimum 100 characters required).'}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={4}
                  required
                  className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 transition ${
                    formDesc.trim().length > 0 && formDesc.trim().length < 100
                      ? 'border-rose-300 focus:ring-rose-500'
                      : formDesc.trim().length >= 100
                      ? 'border-emerald-300 focus:ring-emerald-500'
                      : 'border-slate-200 focus:ring-blue-600'
                  }`}
                />
                <div className="mt-1.5 flex flex-wrap justify-between items-center gap-2 text-[11px]">
                  {formDesc.trim().length < 100 ? (
                    <span className="text-rose-600 font-medium animate-fade-in">
                      {currentLang === 'zh'
                        ? `* 必须填写最少100字（当前已输入 ${formDesc.trim().length} 字，还差 ${100 - formDesc.trim().length} 字）`
                        : `* Must be at least 100 characters (Current: ${formDesc.trim().length}, progress remaining: ${100 - formDesc.trim().length})`}
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 animate-fade-in">
                      <span>✓</span>
                      <span>
                        {currentLang === 'zh'
                          ? `字数已达标（已填写 ${formDesc.trim().length} 字，满足不少于100字规范）`
                          : `Sufficient length met (${formDesc.trim().length} characters, >= 100 requirement satisfied)`}
                      </span>
                    </span>
                  )}
                  <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                    formDesc.trim().length < 100 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {formDesc.trim().length} / 100
                  </span>
                </div>
              </div>

              {/* Google Drive Connection & Sync Status Bar */}
              <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {googleToken ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        <h4 className="text-sm font-bold text-slate-800">
                          {currentLang === 'zh' ? '已成功关联 Google 云端硬盘' : 'Google Drive Connected Successfully'}
                        </h4>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                        <h4 className="text-sm font-bold text-slate-800">
                          {currentLang === 'zh' ? '使用本地模拟存储 (未关联云端硬盘)' : 'Google Drive Disconnected (Local Backup Active)'}
                        </h4>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                    {googleToken ? (
                      currentLang === 'zh' 
                        ? `证明附件提报后将直接自动归档同步至指定的董总云盘归档文件夹（1yKGSDjtsj3ldvxFxMCxNoOPjFo-Vm9JS）。账号：${googleUser?.email || ''}`
                        : `Attachment documents will automatically upload to Google Drive folder 1yKGSDjtsj3ldvxFxMCxNoOPjFo-Vm9JS under linked account: ${googleUser?.email || ''}`
                    ) : (
                      currentLang === 'zh'
                        ? `当前正使用本地缓存机制。若需将证明高可靠归档至正式的董总 Google Drive 云盘，请授权您的谷歌工作账号进行一键存储与检索。`
                        : `Attachments will be simulated on browser disk. Connect your Google account to automatically preserve and retrieve certificates in Google Drive folder: 1yKGSDjtsj3ldvxFxMCxNoOPjFo-Vm9JS.`
                    )}
                  </p>
                  {isSyncingToDrive && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold animate-pulse pt-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>{currentLang === 'zh' ? '※ 智能云同步引擎正在将文件安全同步到 Google Drive...' : 'Sync engine uploading file securely to Google Drive...'}</span>
                    </div>
                  )}
                  {googleUploadError && (
                    <p className="text-xs text-rose-600 font-semibold pt-1">
                      ⚠️ {currentLang === 'zh' ? `云端硬盘上传失败: ${googleUploadError}` : `Drive sync failure: ${googleUploadError}`}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  {googleToken ? (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (disconnectGoogleDrive) {
                          await disconnectGoogleDrive();
                        }
                      }}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      {currentLang === 'zh' ? '解除关联' : 'Disconnect'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (connectGoogleDrive) {
                          try {
                            await connectGoogleDrive();
                          } catch (err: any) {
                            alert(err.message || 'Failed to authenticate');
                          }
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 shadow-xs transition-all cursor-pointer hover:border-slate-300"
                    >
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      </svg>
                      <span>{currentLang === 'zh' ? '关联谷歌云盘' : 'Link Google Drive'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* File upload drag drop simulated */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                  {t.supportDocument} <span className="text-rose-500">*</span>
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 ${
                    dragActive 
                      ? 'border-blue-600 bg-blue-50/20' 
                      : uploadedFileName 
                      ? 'border-blue-300 bg-blue-50/10' 
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  
                  {isUploading ? (
                    <div className="space-y-2 py-2">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <span className="text-xs font-semibold text-slate-500">
                        {currentLang === 'zh' ? '正在处理并验证文件...' : 'Simulating upload credentials verification...'}
                      </span>
                    </div>
                  ) : uploadedFileName ? (
                    <div className="space-y-1.5 text-center">
                      <div className="p-2.5 bg-blue-100 text-blue-700 rounded-full inline-block">
                        <Paperclip className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-800 block">
                        {uploadedFileName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {uploadedFileSize} • {currentLang === 'zh' ? '点击可更换文件' : 'Click to replace document'}
                      </div>
                      <span className="inline-block bg-blue-105 text-blue-800 text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded border border-blue-200">
                        {t.uploadSuccess}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-white rounded-full text-slate-400 shadow-xs border">
                        <Paperclip className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-slate-600 font-medium">
                        {t.uploadPlaceholder}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        PDF, PNG, JPG {currentLang === 'zh' ? '且不超过 8MB' : 'up to 8MB'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="border-t pt-5 mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => { resetForm(); setActiveTab('overview'); }}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-md"
              >
                {editingId ? t.saveChanges : t.submit}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: PREVIEW COMPONENT DATA */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-blue-750 text-white px-5 py-4 flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">
                  {t.myRecords} • {selectedRecord.type.toUpperCase()}
                </span>
                <h3 className="font-bold text-base leading-tight">
                  {selectedRecord.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 text-blue-100 hover:text-white hover:bg-blue-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-slate-600">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 pb-3 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider">{t.organiser}</span>
                  <span className="text-slate-800 font-medium">{selectedRecord.organiser}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider">{t.venuePlatform}</span>
                  <span className="text-slate-800 font-bold">{selectedRecord.venue}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider">{t.trainingDate}</span>
                  <span className="text-slate-800 font-bold font-mono">
                    {selectedRecord.date}
                    {selectedRecord.endDate ? ` ${currentLang === 'zh' ? '至' : 'to'} ${selectedRecord.endDate}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider">{t.durationHours}</span>
                  <span className="text-emerald-700 font-extrabold font-mono text-sm">{selectedRecord.duration} hrs</span>
                </div>
                {selectedRecord.lecturer && (
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider">{t.lecturer}</span>
                    <span className="text-slate-800 font-medium">{selectedRecord.lecturer}</span>
                  </div>
                )}
                {selectedRecord.trainingTime && (
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider">{t.trainingTime}</span>
                    <span className="text-slate-800 font-medium font-mono">{selectedRecord.trainingTime}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">{t.description}</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium">
                  {selectedRecord.description || (currentLang === 'zh' ? '职员没有提供详细叙述。' : 'No description provided.')}
                </p>
              </div>

              {/* Status & Remarks */}
              <div className="p-4 rounded-xl border flex flex-col space-y-2.5 bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t.status}</span>
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedRecord.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : selectedRecord.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span>{selectedRecord.status === 'Verified' ? t.verified : selectedRecord.status === 'Rejected' ? t.rejected : t.pending}</span>
                  </span>
                </div>

                {selectedRecord.remarks ? (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-xs text-rose-800 font-bold block mb-1">{t.hrRemarks}</span>
                    <p className="text-xs text-rose-950 font-semibold font-mono bg-rose-50/70 p-2.5 rounded border border-rose-100/50">
                      {selectedRecord.remarks}
                    </p>
                  </div>
                ) : selectedRecord.status === 'Verified' ? (
                  <div className="text-xs font-semibold text-emerald-700">
                    ✓ {currentLang === 'zh' ? '认可完成培训，积分已累计。' : 'Hours successfully converted to annual points.'}
                  </div>
                ) : null}
              </div>

              {/* Actual File Image Preview if exists */}
              {selectedRecord.driveFileId ? (
                <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col items-center">
                  <span className="text-[10px] text-emerald-600 font-bold mb-1.5 font-mono uppercase self-start flex items-center gap-1">
                    💾 {currentLang === 'zh' ? 'Google 云端硬盘证明原件' : 'Google Drive Official Attachment'}
                  </span>
                  <div className="w-full h-[180px] flex items-center justify-center overflow-hidden bg-slate-50 border border-slate-100 rounded-lg">
                    {isLoadingDriveFile ? (
                      <div className="flex flex-col items-center gap-2 p-4 text-center animate-pulse">
                        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                        <span className="text-xs text-slate-500 font-semibold">{currentLang === 'zh' ? '※ 正在自董总归档云盘安全解译凭证...' : 'Decrypting secure proof document from Google Drive...'}</span>
                      </div>
                    ) : drivePreviewUrl ? (
                      <img 
                        src={drivePreviewUrl} 
                        alt="Google Drive original proof" 
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 p-4 text-center">
                        <CloudOff className="w-5 h-5 text-slate-450" />
                        <span className="text-[11px] text-slate-500 font-medium">
                          {currentLang === 'zh' ? '证明已安全归档。请关联 Google 账户以直接浏览预览。' : 'Document is safely archived. Associate your Google account to preview.'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedRecord.fileData ? (
                <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold mb-1.5 font-mono uppercase self-start">📄 {currentLang === 'zh' ? '本地存储证明备份' : 'Local copy proof backup'}</span>
                  <div className="w-full h-[180px] flex items-center justify-center overflow-hidden bg-slate-50 border border-slate-100 rounded-lg">
                    <img 
                      src={selectedRecord.fileData} 
                      alt="Uploaded proof" 
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              ) : null}

              {/* Document Download Link */}
              <div className="border-t pt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold text-slate-800">{selectedRecord.fileName || 'document.pdf'}</span>
                  <span className="text-slate-400">({selectedRecord.fileSize || '250 KB'})</span>
                </div>
                
                {selectedRecord.driveFileUrl ? (
                  <a
                    href={selectedRecord.driveFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>{currentLang === 'zh' ? '直接打开云盘' : 'View in Google Drive'}</span>
                    <span className="text-[9px]">↗</span>
                  </a>
                ) : (
                  <a
                    href="#download"
                    onClick={(e) => { e.preventDefault(); alert(currentLang === 'zh' ? '※ 正在准备材料，证明文件预览完成。' : 'Simulation: Downloading certificate attachment file.'); }}
                    className="text-xs font-bold text-blue-700 hover:underline"
                  >
                    {currentLang === 'zh' ? '浏览下载' : 'View / Download'}
                  </a>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition"
              >
                {currentLang === 'zh' ? '关闭窗口' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
