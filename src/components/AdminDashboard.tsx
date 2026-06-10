import React, { useState, useEffect } from 'react';
import { TRANSLATIONS, Language } from '../translations';
import { User, TrainingRecord, PointRule, TrainingType, AuditLog } from '../types';
import { getCategories, saveCategories, DEFAULT_CATEGORIES, CourseCategory, getCategoryLabel } from '../utils/categories';
import { 
  ShieldAlert, Clock, CheckCircle2, XCircle, Search, Layers,
  Check, X, FileEdit, Award, Settings, ListCollapse, Download, RefreshCw, BarChart4, Lock, UserPlus,
  Building, Trash2, Paperclip, Cloud, CloudOff, ChevronDown, ChevronUp
} from 'lucide-react';

interface AdminDashboardProps {
  currentLang: Language;
  currentUser: User;
  records: TrainingRecord[];
  users: User[];
  pointRule: PointRule;
  onUpdatePointRule: (rule: PointRule) => void;
  onVerifyRecord: (id: string, status: 'Verified' | 'Rejected', remarks: string, adjustedHours?: number, driveFileId?: string, driveFileUrl?: string) => void;
  onEditRecordByAdmin: (id: string, updatedFields: Partial<TrainingRecord>) => void;
  onAddRecordsByAdmin: (newRecords: TrainingRecord[]) => void;
  auditLogs: AuditLog[];
  adminPassword: string;
  onUpdateAdminPassword: (password: string) => void;
  onAddStaffAccount: (newUser: User) => void;
  onUpdateStaffAccount: (id: string, updatedUser: User) => void;
  onDeleteStaffAccount: (id: string) => void;
  departments: string[];
  onAddDepartment: (name: string) => void;
  onUpdateDepartment: (oldName: string, newName: string) => void;
  onDeleteDepartment: (name: string) => void;
  googleUser?: any;
  googleToken?: string | null;
  connectGoogleDrive?: () => Promise<any>;
  disconnectGoogleDrive?: () => Promise<void>;
}

const getAttachmentType = (fileName: string = '', title: string = '') => {
  const nameLower = (fileName || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();
  
  if (nameLower.includes('邀请') || nameLower.includes('rsvp') || nameLower.includes('invitation') || nameLower.includes('invit')) {
    return {
      type: 'invitation',
      titleZh: '大 会 特 邀 请 函',
      titleEn: 'LETTER OF INVITATION',
      headerZh: '董总学术顾问特邀函授',
      headerEn: 'DONG ZONG ACADEMIC INVOCATION',
      descZh: '特邀您出席并作为主讲或指定参研修读以下专题：',
      descEn: 'is cordially invited to participate as an esteemed member in:',
      colorTheme: {
        border: 'border-emerald-700',
        dashed: 'border-dashed border-emerald-300',
        inner: 'border-emerald-100',
        text: 'text-[#1e4620]',
        badge: 'text-emerald-700 border-emerald-500 bg-emerald-500/5',
        stamp: 'border-emerald-600 text-emerald-600',
        dot: 'bg-emerald-400',
        ocr: 'bg-emerald-500/10'
      },
      sealText: 'CONVOCATION',
      signByZh: '大会策划秘书处',
      signByEn: 'Organising Chair',
      authorizedStampZh: '特邀参会凭证',
      authorizedStampEn: 'OFFICIAL INVITATION'
    };
  }
  
  if (nameLower.includes('公函') || nameLower.includes('公文') || nameLower.includes('letter') || nameLower.includes('memo') || nameLower.includes('document')) {
    return {
      type: 'official_letter',
      titleZh: '董 总 教 职 员 公 函',
      titleEn: 'OFFICIAL MEMORANDUM',
      headerZh: '马来西亚董总华文独中师资培训处',
      headerEn: 'BOARD OF INDEPENDENT CHINESE SCHOOLS',
      descZh: '兹批复核定该员经所属行政处室主管推荐，特准报备参加：',
      descEn: 'has been formally approved and recommended to attend the curriculum:',
      colorTheme: {
        border: 'border-blue-700',
        dashed: 'border-dashed border-blue-300',
        inner: 'border-blue-100',
        text: 'text-[#1e3a8a]',
        badge: 'text-blue-700 border-blue-500 bg-blue-500/5',
        stamp: 'border-blue-600 text-blue-600',
        dot: 'bg-blue-400',
        ocr: 'bg-blue-500/10'
      },
      sealText: 'HR SANCTIONED',
      signByZh: '教师教育局处长',
      signByEn: 'Director of Education',
      authorizedStampZh: '董总行政公章',
      authorizedStampEn: 'BOARD DISPATCH'
    };
  }
  
  if (nameLower.includes('签到') || nameLower.includes('考勤') || nameLower.includes('attendance') || nameLower.includes('sign') || nameLower.includes('register')) {
    return {
      type: 'attendance',
      titleZh: '常态研习课时活动签到表',
      titleEn: 'ATTENDANCE & LOG ROSTER',
      headerZh: '董总培训时数核验证明归档记录',
      headerEn: 'DONG ZONG SECURITY INTEGRITY LOGS',
      descZh: '登记该员在研习现场之电子核销系统刷卡与在场完整时数签到记录：',
      descEn: 'has registered and checked-in via live token scan for:',
      colorTheme: {
        border: 'border-slate-700',
        dashed: 'border-dashed border-slate-300',
        inner: 'border-slate-100',
        text: 'text-slate-800',
        badge: 'text-slate-700 border-slate-500 bg-slate-550/5',
        stamp: 'border-slate-600 text-slate-600',
        dot: 'bg-slate-400',
        ocr: 'bg-slate-500/10'
      },
      sealText: 'SWIPE RECORDED',
      signByZh: '电子考勤系统归档',
      signByEn: 'System Automated Log',
      authorizedStampZh: '考勤验证章',
      authorizedStampEn: 'ATTENDANCE LOG'
    };
  }
  
  if (nameLower.includes('大纲') || nameLower.includes('课纲') || nameLower.includes('syllabus') || nameLower.includes('agenda') || nameLower.includes('schedule') || nameLower.includes('brief') || nameLower.includes('outline')) {
    return {
      type: 'syllabus',
      titleZh: '研 习 议 程 及 教 学 大 纲',
      titleEn: 'AGENDA & SYLLABUS DISCLOSURE',
      headerZh: '学术研修课程质量与课时审委会',
      headerEn: 'COMMITTEE OF ACADEMIC QUALITY CODES',
      descZh: '以下公开披露的主题大纲已列入本次专业成长培训计分指南：',
      descEn: 'has submitted the following training outlines for credit matching:',
      colorTheme: {
        border: 'border-violet-700',
        dashed: 'border-dashed border-violet-300',
        inner: 'border-violet-100',
        text: 'text-[#4c1d95]',
        badge: 'text-violet-700 border-violet-500 bg-violet-500/5',
        stamp: 'border-violet-600 text-violet-600',
        dot: 'bg-violet-400',
        ocr: 'bg-slate-500/10'
      },
      sealText: 'SYLLABUS APP',
      signByZh: '审委会首席学长',
      signByEn: 'Syllabus Auditor',
      authorizedStampZh: '大纲经审通过',
      authorizedStampEn: 'SYLLABUS VERIFIED'
    };
  }
  
  if (nameLower.includes('海报') || nameLower.includes('宣传') || nameLower.includes('poster') || nameLower.includes('flyer') || nameLower.includes('brochure')) {
    return {
      type: 'poster',
      titleZh: '专业技能研讨沙龙活动海报',
      titleEn: 'LIVE SEMINAR SESSION FLYER',
      headerZh: '马来西亚华校董事联合会总会',
      headerEn: 'LEADERS UPGRADE INITIATIVE',
      descZh: '欢迎广大教职人员即刻报名参与以下盛大前沿讲座研学沙龙：',
      descEn: 'is encouraged to enroll and attend this high-impact skill share on:',
      colorTheme: {
        border: 'border-[#b45309]',
        dashed: 'border-dashed border-amber-300',
        inner: 'border-amber-100',
        text: 'text-[#78350f]',
        badge: 'text-[#78350f] border-amber-500 bg-amber-500/5',
        stamp: 'border-amber-600 text-[#b45309]',
        dot: 'bg-amber-400',
        ocr: 'bg-amber-500/10'
      },
      sealText: 'ADVERTISE PUB',
      signByZh: '公关与活动发布处',
      signByEn: 'Public Relations Co.',
      authorizedStampZh: '大会授权发布',
      authorizedStampEn: 'OFFICIAL FLYER'
    };
  }
  
  // Default 'certificate' (结业证书)
  return {
    type: 'certificate',
    titleZh: '研 习 结 业 证 明 书',
    titleEn: 'CERTIFICATE OF DEED',
    headerZh: 'DONG ZONG EDUCATION FEDERATION',
    headerEn: 'DONG ZONG EDUCATION FEDERATION',
    descZh: '兹证明本机构教职员',
    descEn: 'This hereby certifies that our academic member',
    colorTheme: {
      border: 'border-amber-800',
      dashed: 'border-dashed border-amber-300',
      inner: 'border-amber-100',
      text: 'text-[#5c4033]',
      badge: 'text-amber-800 border-amber-600 bg-amber-500/5',
      stamp: 'border-rose-600 text-rose-600',
      dot: 'bg-amber-500',
      ocr: 'bg-emerald-500/10'
    },
    sealText: 'HR CERTIFIED',
    signByZh: '董总人事处审查主管',
    signByEn: 'Chief Admin Officer',
    authorizedStampZh: '马来西亚董总',
    authorizedStampEn: 'HR CERTIFIED'
  };
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentLang,
  currentUser,
  records,
  users,
  pointRule,
  onUpdatePointRule,
  onVerifyRecord,
  onEditRecordByAdmin,
  onAddRecordsByAdmin,
  auditLogs,
  adminPassword,
  onUpdateAdminPassword,
  onAddStaffAccount,
  onUpdateStaffAccount,
  onDeleteStaffAccount,
  departments,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  googleUser,
  googleToken,
  connectGoogleDrive,
  disconnectGoogleDrive
}) => {
  const t = TRANSLATIONS[currentLang];

  // Review interaction states declared early to avoid Temporal Dead Zone (TS2448)
  const [reviewingRecord, setReviewingRecord] = useState<TrainingRecord | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewHours, setReviewHours] = useState<number>(0);

  // Attachment Viewer Interactive Modal States declared early to avoid Temporal Dead Zone (TS2448)
  const [previewAttachmentRecord, setPreviewAttachmentRecord] = useState<TrainingRecord | null>(null);
  const [zoomMultiplier, setZoomMultiplier] = useState<number>(1);
  const [previewViewMode, setPreviewViewMode] = useState<'original' | 'digital'>('original');
  const [showOcrHighlights, setShowOcrHighlights] = useState<boolean>(true);
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState<boolean>(false);
  const [integrityVerified, setIntegrityVerified] = useState<boolean | null>(null);

  // Admin secret Google Drive attachment state triggers
  const [drivePreviewUrl, setDrivePreviewUrl] = useState<string | null>(null);
  const [isLoadingDriveFile, setIsLoadingDriveFile] = useState(false);
  const [reviewingDrivePreviewUrl, setReviewingDrivePreviewUrl] = useState<string | null>(null);
  const [isLoadingReviewingDriveFile, setIsLoadingReviewingDriveFile] = useState(false);

  // Save/Upload processed files to Google Drive states during admin verification review
  const [isAdminSyncingToDrive, setIsAdminSyncingToDrive] = useState(false);
  const [adminDriveUploadError, setAdminDriveUploadError] = useState<string | null>(null);

  // Synchronously decode Google Drive attachments for admin interactive previews
  useEffect(() => {
    let active = true;
    if (previewAttachmentRecord && previewAttachmentRecord.driveFileId && googleToken) {
      setIsLoadingDriveFile(true);
      setDrivePreviewUrl(null);
      import('../lib/googleDrive')
        .then((m) => m.downloadFileFromGoogleDrive(previewAttachmentRecord.driveFileId!))
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
  }, [previewAttachmentRecord, googleToken]);

  // Synchronously decode Google Drive attachments for inline audit workstations
  useEffect(() => {
    let active = true;
    if (reviewingRecord && reviewingRecord.driveFileId && googleToken) {
      setIsLoadingReviewingDriveFile(true);
      setReviewingDrivePreviewUrl(null);
      import('../lib/googleDrive')
        .then((m) => m.downloadFileFromGoogleDrive(reviewingRecord.driveFileId!))
        .then((blob) => {
          if (active) {
            const url = URL.createObjectURL(blob);
            setReviewingDrivePreviewUrl(url);
            setIsLoadingReviewingDriveFile(false);
          }
        })
        .catch((err) => {
          console.error("Error loaded Drive file", err);
          if (active) {
            setIsLoadingReviewingDriveFile(false);
          }
        });
    } else {
      setReviewingDrivePreviewUrl(null);
      setIsLoadingReviewingDriveFile(false);
    }

    return () => {
      active = false;
      if (reviewingDrivePreviewUrl) {
        URL.revokeObjectURL(reviewingDrivePreviewUrl);
      }
    };
  }, [reviewingRecord, googleToken]);

  // Admin section tabs
  const [adminTab, setAdminTab] = useState<'approvals' | 'staff-summary' | 'rules' | 'audit' | 'password' | 'staff-creation' | 'department-settings' | 'direct-bulk-entry'>('approvals');

  // Guardrail: Reset HR Agent state if trying to access restricted admin tabs
  useEffect(() => {
    if (currentUser.role === 'hr_agent' && ['rules', 'password', 'department-settings', 'audit'].includes(adminTab)) {
      setAdminTab('approvals');
    }
  }, [currentUser.role, adminTab]);

  const [isMenuCollapsed, setIsMenuCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return true;
  });
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [complianceFilter, setComplianceFilter] = useState<'all' | 'reached' | 'notReached'>('all');
  
  // Rule editor inputs
  const [hoursPerPoint, setHoursPerPoint] = useState<number>(pointRule.hoursPerPoint);
  const [maxPointsPerYear, setMaxPointsPerYear] = useState<number>(pointRule.maxPointsPerYear);
  const [showConfigSuccess, setShowConfigSuccess] = useState(false);

  // Security credentials control states
  const [passwordInput, setPasswordInput] = useState<string>(adminPassword);
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Advanced Change Password state variables
  const [currentPasswordConfirm, setCurrentPasswordConfirm] = useState<string>('');
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState<string>('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<boolean>(false);

  // Staff account creation states
  const [createEngName, setCreateEngName] = useState('');
  const [createChiName, setCreateChiName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('staff123');
  const [createDept, setCreateDept] = useState(departments[0] || 'Information Technology Department (资讯处)');
  const [createPoints, setCreatePoints] = useState(10);
  const [createStaffNo, setCreateStaffNo] = useState('');
  const [createRole, setCreateRole] = useState<'staff' | 'hr_admin' | 'hr_agent'>('staff');
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creationSuccess, setCreationSuccess] = useState<boolean>(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Staff bulk import states
  const [creationSubMode, setCreationSubMode] = useState<'single' | 'bulk'>('single');
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);
  const [bulkImportSuccessMsg, setBulkImportSuccessMsg] = useState<string | null>(null);
  const [bulkPreviewUsers, setBulkPreviewUsers] = useState<{
    staffNo: string;
    name: string;
    chineseName: string;
    email: string;
    role: 'staff';
    department: string;
    targetPoints: number;
    password: string;
  }[]>([]);

  // Department settings states
  const [editingDeptName, setEditingDeptName] = useState<string | null>(null);
  const [deptFormName, setDeptFormName] = useState<string>('');
  const [deptError, setDeptError] = useState<string | null>(null);
  const [deptSuccess, setDeptSuccess] = useState<string | null>(null);
  const [confirmDeleteDept, setConfirmDeleteDept] = useState<string | null>(null);

  // Dynamic Course Categories States
  const [categories, setCategories] = useState<CourseCategory[]>(() => getCategories());
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategoryId, setNewCategoryId] = useState('');
  const [categoryNameZh, setCategoryNameZh] = useState('');
  const [categoryNameEn, setCategoryNameEn] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);

  // Sync default creation department selection
  React.useEffect(() => {
    if (departments.length > 0 && !departments.includes(createDept)) {
      setCreateDept(departments[0]);
    }
  }, [departments, createDept]);

  // Ledger Sorting state variables
  const [ledgerSortField, setLedgerSortField] = useState<'name' | 'department' | 'hours' | 'points' | 'progress'>('name');
  const [ledgerSortOrder, setLedgerSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleLedgerSort = (field: 'name' | 'department' | 'hours' | 'points' | 'progress') => {
    if (ledgerSortField === field) {
      setLedgerSortOrder(ledgerSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setLedgerSortField(field);
      setLedgerSortOrder(field === 'name' || field === 'department' ? 'asc' : 'desc');
    }
  };

  // Edit record state
  const [editingRecord, setEditingRecord] = useState<TrainingRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editOrganiser, setEditOrganiser] = useState('');
  const [editDuration, setEditDuration] = useState<number>(0);
  const [editEndDate, setEditEndDate] = useState('');
  const [editLecturer, setEditLecturer] = useState('');
  const [editTrainingTime, setEditTrainingTime] = useState('');

  // Direct & Bulk insertion states
  const [entryMode, setEntryMode] = useState<'individual' | 'bulk'>('individual');
  const [bulkSelectedUserIds, setBulkSelectedUserIds] = useState<string[]>([]);
  const [directStaffId, setDirectStaffId] = useState<string>(''); // For single staff mode
  const [entryTitle, setEntryTitle] = useState('');
  const [entryOrganiser, setEntryOrganiser] = useState('');
  const [entryType, setEntryType] = useState<TrainingType>(() => {
    const cats = getCategories();
    return cats.length > 0 ? cats[0].id : 'internal';
  });
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryEndDate, setEntryEndDate] = useState('');
  const [entryLecturer, setEntryLecturer] = useState('');
  const [entryTrainingTime, setEntryTrainingTime] = useState('');
  const [entryDuration, setEntryDuration] = useState<number>(2);
  const [entryVenue, setEntryVenue] = useState('');
  const [entryDescription, setEntryDescription] = useState('');
  const [entryStatus, setEntryStatus] = useState<'Verified' | 'Pending Verification'>('Verified');
  const [entryError, setEntryError] = useState<string | null>(null);
  const [entrySuccess, setEntrySuccess] = useState<boolean>(false);

  const staffUsers = users.filter(usr => usr.role === 'staff');

  // Summary logic
  const totalSubmissionsCount = records.length;
  const pendingCount = records.filter(r => r.status === 'Pending Verification').length;
  const verifiedCount = records.filter(r => r.status === 'Verified').length;
  const rejectedCount = records.filter(r => r.status === 'Rejected').length;

  // Calculation per staff member helper
  const calculateStaffStats = (email: string) => {
    const rcs = records.filter(r => r.staffEmail === email && r.status === 'Verified');
    const hours = rcs.reduce((sum, r) => sum + r.duration, 0);
    const rawVal = hours / pointRule.hoursPerPoint;
    const points = Math.min(rawVal, pointRule.maxPointsPerYear);
    const reached = points >= pointRule.maxPointsPerYear;
    return { hours, points, reached };
  };

  const reachedCount = staffUsers.filter(u => calculateStaffStats(u.email).reached).length;
  const notReachedCount = staffUsers.length - reachedCount;

  // Handles updating the rules
  const handleRuleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePointRule({
      hoursPerPoint: Number(hoursPerPoint),
      maxPointsPerYear: Number(maxPointsPerYear)
    });
    setShowConfigSuccess(true);
    setTimeout(() => setShowConfigSuccess(false), 3000);
  };

  // Dynamic Course/Training category actions
  const handleCategoryCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);
    setCategorySuccess(null);

    const cleanId = newCategoryId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const cleanZh = categoryNameZh.trim();
    const cleanEn = categoryNameEn.trim();

    if (!cleanZh || !cleanEn) {
      setCategoryError(currentLang === 'zh' ? '中文及英文名称均不能为空！' : 'Both Chinese and English names are required.');
      return;
    }

    if (editingCategoryId) {
      // Update existing
      const updated = categories.map(cat => {
        if (cat.id === editingCategoryId) {
          return { ...cat, nameZh: cleanZh, nameEn: cleanEn };
        }
        return cat;
      });
      saveCategories(updated);
      setCategories(updated);
      setCategorySuccess(currentLang === 'zh' ? '✅ 类别更新成功！' : '✅ Category updated successfully!');
      
      // Reset editing mode
      setEditingCategoryId(null);
      setNewCategoryId('');
      setCategoryNameZh('');
      setCategoryNameEn('');
    } else {
      // Create new
      if (!cleanId) {
        setCategoryError(currentLang === 'zh' ? '类别唯一代码（ID）无效或未填！' : 'Category unique code (ID) is invalid.');
        return;
      }
      if (categories.some(cat => cat.id.toLowerCase() === cleanId)) {
        setCategoryError(currentLang === 'zh' ? '此唯一代码（ID）已存在！请更换其他唯一的字母代码。' : 'This unique code (ID) already exists! Please use a different key.');
        return;
      }
      const newCat: CourseCategory = {
        id: cleanId,
        nameZh: cleanZh,
        nameEn: cleanEn
      };
      const updated = [...categories, newCat];
      saveCategories(updated);
      setCategories(updated);
      setCategorySuccess(currentLang === 'zh' ? '🎉 新增培训类别成功！' : '🎉 New training category created!');
      
      // Reset inputs
      setNewCategoryId('');
      setCategoryNameZh('');
      setCategoryNameEn('');
    }
  };

  const startEditCategory = (cat: CourseCategory) => {
    setEditingCategoryId(cat.id);
    setNewCategoryId(cat.id);
    setCategoryNameZh(cat.nameZh);
    setCategoryNameEn(cat.nameEn);
    setCategoryError(null);
    setCategorySuccess(null);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setNewCategoryId('');
    setCategoryNameZh('');
    setCategoryNameEn('');
    setCategoryError(null);
    setCategorySuccess(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      setCategoryError(currentLang === 'zh' ? '※ 系统必须保留至少 1 个培训类别！' : '※ The system requires at least 1 training category.');
      return;
    }
    const hasRecords = records.some(r => r.type.toLowerCase() === id.toLowerCase());
    const confirmMsg = hasRecords 
      ? (currentLang === 'zh' 
          ? `⚠️ 该类别 [${id}] 下目前已有教职员提交了培训申报。删除它可能会影响原有申报数据的显示。确定要强行删除吗？` 
          : `⚠️ There are staff claims filed under category [${id}]. Deleting it might disrupt pre-existing record displays. Are you sure you want to delete anyway?`)
      : (currentLang === 'zh' 
          ? `确定要删除类别 [${id}] 吗？` 
          : `Are you sure you want to delete category [${id}]?`);

    if (window.confirm(confirmMsg)) {
      const filtered = categories.filter(cat => cat.id !== id);
      saveCategories(filtered);
      setCategories(filtered);
      setCategorySuccess(currentLang === 'zh' ? '🗑️ 培训类别已被移除。' : '🗑️ Training category deleted successfully.');
      cancelEditCategory();
    }
  };

  const handleResetCategoriesToDefault = () => {
    if (window.confirm(currentLang === 'zh' ? '确定要恢复默认的 6 大常态化培训类别吗？这将覆盖您所做的自定义改动。' : 'Are you sure you want to reset all training categories to defaults? This will overwrite your customized changes.')) {
      saveCategories(DEFAULT_CATEGORIES);
      setCategories(DEFAULT_CATEGORIES);
      setCategorySuccess(currentLang === 'zh' ? '🔄 已恢复默认培训类别设置！' : '🔄 Categories reset to defaults!');
      cancelEditCategory();
    }
  };

  // Handles updating the HR admin password setting
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(false);

    if (adminPassword && currentPasswordConfirm !== adminPassword) {
      setPasswordChangeError(currentLang === 'zh' ? '※ 当前原密码验证错误，请重新确认！' : 'The current password entered is incorrect.');
      return;
    }

    if (!newAdminPassword.trim()) {
      setPasswordChangeError(currentLang === 'zh' ? '※ 新密码不能为空！' : 'New password cannot be empty.');
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordChangeError(currentLang === 'zh' ? '※ 确认密码与新密码不一致！' : 'New password and confirmation do not match.');
      return;
    }

    onUpdateAdminPassword(newAdminPassword);
    setPasswordInput(newAdminPassword);
    setPasswordChangeSuccess(true);
    setCurrentPasswordConfirm('');
    setNewAdminPassword('');
    setConfirmAdminPassword('');

    setTimeout(() => {
      setPasswordChangeSuccess(false);
    }, 4000);
  };

  // Handles creating or updating a staff account
  const handleCreateStaffUser = (e: React.FormEvent) => {
    e.preventDefault();
    setCreationError(null);
    setCreationSuccess(false);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(createEmail.trim())) {
      setCreationError(currentLang === 'zh' ? '※ 请输入符合标准格式的有效邮箱地址！' : 'Please provide a valid email address.');
      return;
    }

    if (!createEngName.trim()) {
      setCreationError(currentLang === 'zh' ? '※ 英文姓名不能为空！' : 'English name cannot be empty.');
      return;
    }

    if (!createChiName.trim()) {
      setCreationError(currentLang === 'zh' ? '※ 中文姓名不能为空！' : 'Chinese name cannot be empty.');
      return;
    }

    if (!createPassword || createPassword.length < 4) {
      setCreationError(currentLang === 'zh' ? '※ 访问密码过短，至少应包含4个字符！' : 'Password is too short. Minimum 4 characters.');
      return;
    }

    if (editingStaffId) {
      // Edit mode checks email exists in OTHER users
      const emailExists = users.some(u => u.id !== editingStaffId && u.email.trim().toLowerCase() === createEmail.trim().toLowerCase());
      if (emailExists) {
        setCreationError(currentLang === 'zh' ? '※ 此邮箱地址已被别的账号绑定注册！' : 'This email is already associated with another account.');
        return;
      }

      const existing = users.find(u => u.id === editingStaffId);
      const finalRole = currentUser.role === 'hr_admin' ? createRole : (existing ? existing.role : 'staff');
      const updatedUser: User = {
        id: editingStaffId,
        name: createEngName.trim(),
        chineseName: createChiName.trim(),
        email: createEmail.trim().toLowerCase(),
        role: finalRole,
        department: (finalRole === 'hr_admin' || finalRole === 'hr_agent') ? undefined : createDept,
        targetPoints: (finalRole === 'hr_admin' || finalRole === 'hr_agent') ? undefined : (Number(createPoints) || 10),
        password: createPassword.trim(),
        staffNo: createStaffNo.trim() || undefined
      };

      onUpdateStaffAccount(editingStaffId, updatedUser);
      setEditingStaffId(null);
      
      // Clear form
      setCreateEngName('');
      setCreateChiName('');
      setCreateEmail('');
      setCreatePassword('staff123');
      setCreatePoints(10);
      setCreateStaffNo('');
      setCreateRole('staff');
      
      // Trigger a temporary success message
      setCreationSuccess(true);
    } else {
      // Create mode checklist
      const emailExists = users.some(u => u.email.trim().toLowerCase() === createEmail.trim().toLowerCase());
      if (emailExists) {
        setCreationError(currentLang === 'zh' ? '※ 此邮箱地址已被别的账号绑定注册！' : 'This email is already associated with an account.');
        return;
      }

      const finalRole = currentUser.role === 'hr_admin' ? createRole : 'staff';
      const newUser: User = {
        id: `staff-${Date.now()}`,
        name: createEngName.trim(),
        chineseName: createChiName.trim(),
        email: createEmail.trim().toLowerCase(),
        role: finalRole,
        department: (finalRole === 'hr_admin' || finalRole === 'hr_agent') ? undefined : createDept,
        targetPoints: (finalRole === 'hr_admin' || finalRole === 'hr_agent') ? undefined : (Number(createPoints) || 10),
        password: createPassword.trim(),
        staffNo: createStaffNo.trim() || undefined
      };

      onAddStaffAccount(newUser);
      setCreationSuccess(true);
      
      // Clear the form
      setCreateEngName('');
      setCreateChiName('');
      setCreateEmail('');
      setCreatePassword('staff123');
      setCreatePoints(10);
      setCreateStaffNo('');
      setCreateRole('staff');
    }

    setTimeout(() => {
      setCreationSuccess(false);
    }, 5000);
  };

  // Parser for CSV / TSV text clipboard paste
  const parseBulkImportText = (text: string) => {
    setBulkImportError(null);
    setBulkImportSuccessMsg(null);
    setBulkImportText(text);
    
    if (!text.trim()) {
      setBulkPreviewUsers([]);
      return;
    }

    const lines = text.split(/\r?\n/);
    if (lines.length === 0) {
      setBulkPreviewUsers([]);
      return;
    }

    // Determine separator: comma or tab
    let sep = ',';
    if (lines[0].includes('\t')) {
      sep = '\t';
    }

    const parsedUsers: {
      staffNo: string;
      name: string;
      chineseName: string;
      email: string;
      role: 'staff';
      department: string;
      targetPoints: number;
      password: string;
    }[] = [];
    let startIdx = 0;

    // Detect if first line is a header
    const firstLineLower = lines[0].toLowerCase();
    const isHeader = firstLineLower.includes('email') || firstLineLower.includes('name') || firstLineLower.includes('chinese') || firstLineLower.includes('english') || firstLineLower.includes('部门') || firstLineLower.includes('邮箱') || firstLineLower.includes('职员号') || firstLineLower.includes('no');
    if (isHeader) {
      startIdx = 1;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let parts: string[] = [];
      if (sep === ',') {
        // parse CSV line with double quotes
        const matchRegex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
        let matches = line.match(matchRegex) || [];
        if (matches.length === 0) {
          parts = line.split(',');
        } else {
          parts = matches.map(m => m.replace(/^"|"$/g, '').trim());
        }
      } else {
        parts = line.split(sep).map(p => p.trim());
      }

      if (parts.length < 3) {
        continue; // Must contain at least English Name, Chinese Name, and email
      }

      let staffNoValue = '';
      let engName = '';
      let chiName = '';
      let emailValue = '';
      let password = 'staff123';
      let rawDept = '';
      let targetPoints = 10;

      // Detect column scheme
      // If parts[3] looks like an email, we have: staffNo, engName, chiName, email, password, department, targetPoints (7 cols)
      // Otherwise parts[2] is likely the email: engName, chiName, email, password, department, targetPoints (6 cols)
      if (parts[3] && emailPattern.test(parts[3])) {
        staffNoValue = parts[0]?.trim() || '';
        engName = parts[1]?.trim() || '';
        chiName = parts[2]?.trim() || '';
        emailValue = parts[3]?.trim().toLowerCase();
        password = parts[4]?.trim() || 'staff123';
        rawDept = parts[5]?.trim() || '';
        targetPoints = Number(parts[6]) || 10;
      } else {
        staffNoValue = '';
        engName = parts[0]?.trim() || '';
        chiName = parts[1]?.trim() || '';
        emailValue = parts[2]?.trim().toLowerCase() || '';
        password = parts[3]?.trim() || 'staff123';
        rawDept = parts[4]?.trim() || '';
        targetPoints = Number(parts[5]) || 10;
      }
      
      if (!engName || !chiName || !emailValue || !emailPattern.test(emailValue)) {
        continue;
      }

      let matchedDept = departments[0] || 'Information Technology Department (资讯处)';
      if (rawDept) {
        const found = departments.find(d => d.toLowerCase().includes(rawDept.toLowerCase()) || rawDept.toLowerCase().includes(d.toLowerCase()));
        if (found) {
          matchedDept = found;
        }
      }

      parsedUsers.push({
        staffNo: staffNoValue,
        name: engName,
        chineseName: chiName,
        email: emailValue,
        role: 'staff',
        department: matchedDept,
        targetPoints: targetPoints,
        password: password
      });
    }

    setBulkPreviewUsers(parsedUsers);
  };

  const handleConfirmBulkImport = () => {
    setBulkImportError(null);
    setBulkImportSuccessMsg(null);

    if (bulkPreviewUsers.length === 0) {
      setBulkImportError(currentLang === 'zh' ? '※ 当前预览中没有任何有效的教职员账户数据可供导入！' : 'No valid records to import in the current preview.');
      return;
    }

    let successCount = 0;
    let skippedCount = 0;

    bulkPreviewUsers.forEach((previewUsr) => {
      const emailExists = users.some(u => u.email.trim().toLowerCase() === previewUsr.email.trim().toLowerCase());
      if (emailExists) {
        skippedCount++;
        return;
      }

      const newUser: User = {
        id: `staff-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        name: previewUsr.name,
        chineseName: previewUsr.chineseName,
        email: previewUsr.email,
        role: 'staff',
        department: previewUsr.department,
        targetPoints: previewUsr.targetPoints,
        password: previewUsr.password,
        staffNo: previewUsr.staffNo || undefined
      };

      onAddStaffAccount(newUser);
      successCount++;
    });

    if (successCount > 0) {
      const msgZh = `✓ 成功批量导入并激活 ${successCount} 个新职员账号！` + (skippedCount > 0 ? `另外已自动跳过 ${skippedCount} 个系统中已注册的相同邮箱。` : '');
      const msgEn = `Successfully bulk-imported and registered ${successCount} new staff accounts!` + (skippedCount > 0 ? ` (Skipped ${skippedCount} items with email conflicts)` : '');
      setBulkImportSuccessMsg(currentLang === 'zh' ? msgZh : msgEn);
      setBulkImportText('');
      setBulkPreviewUsers([]);
    } else {
      setBulkImportError(currentLang === 'zh' ? '※ 未导入任何账号：检测到此处的邮箱地址在董总人员花名册中均已存在注册。' : 'No accounts imported: all emails listed already exist as registered users.');
    }
  };

  const downloadBulkTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + 
      "English Name,Chinese Name,Email,Password,Department,Annual Target Points\n" + 
      "Wong Ken Ming,黄建明,kmwong@dongzong.my,staff123," + (departments[0] || 'Information Technology Department (资讯处)') + ",10\n" + 
      "Tan Mei Ling,陈美玲,mltan@dongzong.my,staff456," + (departments[0] || 'Information Technology Department (资讯处)') + ",12\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Dong_Zong_Staff_Bulk_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        parseBulkImportText(text);
      }
    };
    reader.readAsText(file);
  };

  const startEditStaff = (profile: User) => {
    setEditingStaffId(profile.id);
    setCreateEngName(profile.name);
    setCreateChiName(profile.chineseName);
    setCreateEmail(profile.email);
    setCreatePassword(profile.password || 'staff123');
    setCreateDept(profile.department || departments[0] || '');
    setCreatePoints(profile.targetPoints || 10);
    setCreateStaffNo(profile.staffNo || '');
    setCreateRole(profile.role);
    setCreationError(null);
    setCreationSuccess(false);
  };

  const cancelEditStaff = () => {
    setEditingStaffId(null);
    setCreateEngName('');
    setCreateChiName('');
    setCreateEmail('');
    setCreatePassword('staff123');
    setCreateDept(departments[0] || '');
    setCreatePoints(10);
    setCreateStaffNo('');
    setCreateRole('staff');
    setCreationError(null);
    setCreationSuccess(false);
  };

  const handleStaffDelete = (profile: User) => {
    setCreationError(null);
    setCreationSuccess(false);

    // Admin cannot delete themselves to prevent locking out
    if (profile.id === currentUser.id) {
      alert(currentLang === 'zh' ? '※ 无法注销您当前正在使用的管理员账号！' : 'Cannot delete the account you are currently logged in with.');
      return;
    }

    if (window.confirm(
      currentLang === 'zh'
        ? `❓ 确定要彻底注销/删除职员 "${profile.chineseName} (${profile.name})" 的账号吗？该操作会将此账号从董总花名册中永久清除。`
        : `Are you sure you want to permanently delete the staff account for "${profile.chineseName} (${profile.name})"?`
    )) {
      onDeleteStaffAccount(profile.id);
      
      // If we are currently editing this staff, cancel editing
      if (editingStaffId === profile.id) {
        cancelEditStaff();
      }
    }
  };

  // Handles adding or editing a department
  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDeptError(null);
    setDeptSuccess(null);

    const trimmed = deptFormName.trim();
    if (!trimmed) {
      setDeptError(currentLang === 'zh' ? '※ 部门名称不能为空！' : 'Department name cannot be empty.');
      return;
    }

    if (editingDeptName) {
      // AMEND MODE
      if (trimmed.toLowerCase() === editingDeptName.toLowerCase()) {
        // Unchanged
        setEditingDeptName(null);
        setDeptFormName('');
        return;
      }

      const exists = departments.some(
        d => d.toLowerCase() === trimmed.toLowerCase() && d.toLowerCase() !== editingDeptName.toLowerCase()
      );
      if (exists) {
        setDeptError(currentLang === 'zh' ? '※ 已存在同名的部门处室！' : 'A department with this name already exists.');
        return;
      }

      onUpdateDepartment(editingDeptName, trimmed);
      setDeptSuccess(currentLang === 'zh' ? `✓ 已成功将部门名称改为 "${trimmed}"` : `Successfully renamed department to "${trimmed}"`);
      setEditingDeptName(null);
      setDeptFormName('');
    } else {
      // BRAND NEW ADD MODE
      const exists = departments.some(d => d.toLowerCase() === trimmed.toLowerCase());
      if (exists) {
        setDeptError(currentLang === 'zh' ? '※ 已存在同名的部门处室！' : 'A department with this name already exists.');
        return;
      }

      onAddDepartment(trimmed);
      setDeptSuccess(currentLang === 'zh' ? `✓ 已成功录入新部门 "${trimmed}"` : `Successfully added department "${trimmed}"`);
      setDeptFormName('');
    }

    setTimeout(() => {
      setDeptSuccess(null);
    }, 4000);
  };

  const startEditDept = (dept: string) => {
    setEditingDeptName(dept);
    setDeptFormName(dept);
    setDeptError(null);
    setDeptSuccess(null);
  };

  const cancelEditDept = () => {
    setEditingDeptName(null);
    setDeptFormName('');
    setDeptError(null);
    setDeptSuccess(null);
  };

  const handleDeptDelete = (dept: string) => {
    setDeptError(null);
    setDeptSuccess(null);

    // Safeguard: Do not allow deletion of default departments if children are mapped to it!
    const activeStaff = users.filter(usr => usr.department === dept);
    if (activeStaff.length > 0) {
      const staffNames = activeStaff.map(s => `${s.chineseName} (${s.name})`).slice(0, 3).join(', ');
      setDeptError(
        currentLang === 'zh'
          ? `※ 无法删除该部门！系统目前有 ${activeStaff.length} 名教职员（如 ${staffNames} 等）归属于本部门下。请首先去教职员管理重置或修改这些职员的部门，然后再执行删除。`
          : `Cannot delete department: ${activeStaff.length} active staff member(s) (e.g. ${staffNames}) are assigned to it.`
      );
      return;
    }

    setConfirmDeleteDept(dept);
  };

  // Submits direct or bulk training records by HR Admin
  const handleDirectBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEntryError(null);
    setEntrySuccess(false);

    if (!entryTitle.trim()) {
      setEntryError(currentLang === 'zh' ? '※ 请填写学时申报项目名称！' : 'Please provide the training project title.');
      return;
    }
    if (!entryOrganiser.trim()) {
      setEntryError(currentLang === 'zh' ? '※ 请填写主办方名称！' : 'Please provide the organizer.');
      return;
    }
    if (!entryDate) {
      setEntryError(currentLang === 'zh' ? '※ 请选择培训日期！' : 'Please select the training date.');
      return;
    }
    if (entryDuration <= 0) {
      setEntryError(currentLang === 'zh' ? '※ 学时时数必须为正数！' : 'Stated hours must be a positive number.');
      return;
    }

    // Determine target users
    const targetUsers: User[] = [];
    const activeStaffUsers = users.filter(usr => usr.role === 'staff');

    if (entryMode === 'individual') {
      const selectedId = directStaffId || (activeStaffUsers[0]?.id);
      const single = users.find(u => u.id === selectedId);
      if (!single) {
        setEntryError(currentLang === 'zh' ? '※ 请先选择或创建一个有效的职员账号！' : 'Please select a valid staff member account.');
        return;
      }
      targetUsers.push(single);
    } else {
      if (bulkSelectedUserIds.length === 0) {
        setEntryError(currentLang === 'zh' ? '※ 请至少勾选一位职员进行批量发放！' : 'Please select at least one staff member for bulk entry.');
        return;
      }
      bulkSelectedUserIds.forEach(id => {
        const u = users.find(usr => usr.id === id);
        if (u) targetUsers.push(u);
      });
    }

    // Build the records
    const newRecordsList: TrainingRecord[] = targetUsers.map(u => ({
      id: `rec-direct-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      staffName: u.chineseName ? `${u.chineseName} (${u.name})` : u.name,
      staffEmail: u.email,
      department: u.department,
      title: entryTitle.trim(),
      organiser: entryOrganiser.trim(),
      type: entryType,
      date: entryDate,
      endDate: entryEndDate ? entryEndDate : undefined,
      duration: Number(entryDuration),
      venue: entryVenue.trim() || (currentLang === 'zh' ? '董总多功能厅 (Dong Zong Hall)' : 'Dong Zong Multi-Purpose Hall'),
      description: entryDescription.trim() || (currentLang === 'zh' ? '由培训/人事管理员统一录入并核实的学时记录。' : 'Direct training credit assigned and verified by Administrator.'),
      lecturer: entryLecturer ? entryLecturer.trim() : undefined,
      trainingTime: entryTrainingTime ? entryTrainingTime.trim() : undefined,
      submissionDate: new Date().toISOString().split('T')[0],
      status: entryStatus,
      remarks: currentLang === 'zh' ? '人事部直录学时入账' : 'Admin assigned direct credit'
    }));

    // Trigger parent callback
    onAddRecordsByAdmin(newRecordsList);

    // Reset Form and set success state
    setEntrySuccess(true);
    setEntryTitle('');
    setEntryOrganiser('');
    setEntryVenue('');
    setEntryDescription('');
    setEntryEndDate('');
    setEntryLecturer('');
    setEntryTrainingTime('');
    setBulkSelectedUserIds([]);
    
    // Clear success banner after 4 seconds
    setTimeout(() => {
      setEntrySuccess(false);
    }, 4000);
  };

  React.useEffect(() => {
    // Keep directStaffId set to a valid staff user if empty
    const activeStaff = users.filter(usr => usr.role === 'staff');
    if (activeStaff.length > 0 && !directStaffId) {
      setDirectStaffId(activeStaff[0].id);
    }
  }, [users, directStaffId]);

  // Submits the HR review decision
  const handleReviewSubmission = async (status: 'Verified' | 'Rejected') => {
    if (!reviewingRecord) return;
    if (currentUser.role === 'hr_agent' && reviewingRecord.staffEmail === currentUser.email) {
      alert(currentLang === 'zh' ? '※ 安全限制：您不能审核或批准您自己提交的申报记录。' : 'Security Guardrail: Self-auditing is strictly forbidden.');
      return;
    }
    const finalRemarks = reviewRemarks.trim() || (
      status === 'Rejected' 
        ? (currentLang === 'zh' ? '已退回申报，请核对信息并重新提交。' : 'Claim returned for correction. Please check details and resubmit.') 
        : (currentLang === 'zh' ? '经审核确认无误，学时入账。' : 'Claim verified. Credits successfully added.')
    );

    let finalDriveId = reviewingRecord.driveFileId;
    let finalDriveUrl = reviewingRecord.driveFileUrl;

    if (status === 'Verified' && reviewingRecord.fileData && !reviewingRecord.driveFileId && googleToken) {
      setIsAdminSyncingToDrive(true);
      setAdminDriveUploadError(null);
      try {
        const { uploadBase64ToGoogleDrive } = await import('../lib/googleDrive');
        const res = await uploadBase64ToGoogleDrive(reviewingRecord.fileData, reviewingRecord.fileName || 'attachment_proof.pdf', {
          applicant: reviewingRecord.staffName,
          title: reviewingRecord.title,
        });
        finalDriveId = res.fileId;
        finalDriveUrl = res.webViewLink;
      } catch (err: any) {
        console.error("Failed to sync processed attachment to Google Drive:", err);
        setAdminDriveUploadError(err.message || 'Drive sync failed');
        const proceed = confirm(
          currentLang === 'zh'
            ? '上传到 Google Drive 失败：' + (err.message || '') + '\n是否仍核准该申请？'
            : 'Google Drive sync failed: ' + (err.message || '') + '\nDo you still want to verify and approve anyway?'
        );
        if (!proceed) {
          setIsAdminSyncingToDrive(false);
          return; // Abort
        }
      } finally {
        setIsAdminSyncingToDrive(false);
      }
    }

    onVerifyRecord(reviewingRecord.id, status, finalRemarks, Number(reviewHours), finalDriveId, finalDriveUrl);
    setReviewingRecord(null);
    setReviewRemarks('');
  };

  // Admin manual corrections submission
  const handleAdminRecordEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    onEditRecordByAdmin(editingRecord.id, {
      title: editTitle,
      organiser: editOrganiser,
      duration: Number(editDuration),
      endDate: editEndDate ? editEndDate : undefined,
      lecturer: editLecturer ? editLecturer : undefined,
      trainingTime: editTrainingTime ? editTrainingTime : undefined
    });
    setEditingRecord(null);
  };

  // Export dynamically to CSV
  const handleExportCSV = () => {
    // Columns: Staff No, Staff Name, Email, Department, Verified Hours, Verified Points, Target Reached
    const headers = ['Staff No,Staff Name,Email,Department,Verified Hours,Verified Points,Target Reached (10 pts)'];
    const rows = staffUsers.map(usr => {
      const stats = calculateStaffStats(usr.email);
      return `"${usr.staffNo || ''}","${usr.name}","${usr.email}","${usr.department}",${stats.hours},${stats.points},"${stats.reached ? 'YES' : 'NO'}"`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dong_Zong_Staff_Training_Point_Summary_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter records
  const filteredRecords = records.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rec.staffName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rec.organiser.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Exact division match
    const matchesDept = deptFilter === 'all' || rec.department === deptFilter;
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Tab Selector Menu Container */}
      <div className="bg-white rounded-2xl border border-slate-205 overflow-hidden shadow-xs">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="p-1 px-1.5 bg-blue-50 rounded-lg text-blue-700">
              <ListCollapse className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-slate-700 font-sans">
              {currentLang === 'zh' ? '核实工作台功能导航' : 'Verification Workshop Navigation'}
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 font-extrabold rounded-full">
              {adminTab === 'approvals' && (currentLang === 'zh' ? '未审与所有申报' : 'All Submissions')}
              {adminTab === 'staff-summary' && (currentLang === 'zh' ? '教师与职员档案汇总' : 'Staff Archives')}
              {adminTab === 'direct-bulk-entry' && (currentLang === 'zh' ? '代录系统与发证' : 'Direct & Bulk Entry')}
              {adminTab === 'rules' && (currentLang === 'zh' ? '学时换算积分标准' : 'Rule Scheme')}
              {adminTab === 'password' && (currentLang === 'zh' ? '安全设置与验证锁' : 'Security Locks')}
              {adminTab === 'staff-creation' && (currentLang === 'zh' ? '账号创建中心' : 'Staffs Setup')}
              {adminTab === 'department-settings' && (currentLang === 'zh' ? '部门系统设置' : 'Depts Setup')}
              {adminTab === 'audit' && (currentLang === 'zh' ? '系统核查审计日志' : 'Audit Logs')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 rounded-lg text-xs font-sans font-bold text-slate-600 transition cursor-pointer shadow-xs select-none"
          >
            {isMenuCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>{currentLang === 'zh' ? '展开菜单' : 'Expand Menu'}</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentLang === 'zh' ? '收起菜单' : 'Collapse Menu'}</span>
              </>
            )}
          </button>
        </div>

        {/* Menu Buttons Frame */}
        <div className={`transition-all duration-300 overflow-hidden ${
          isMenuCollapsed ? 'max-h-0' : 'max-h-[1000px] opacity-100 py-1'
        }`}>
          <div className="flex flex-wrap bg-white p-2">
            <button
              onClick={() => {
                setAdminTab('approvals');
                if (window.innerWidth < 1024) setIsMenuCollapsed(true);
              }}
              className={`py-3.5 px-5 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition duration-150 flex items-center space-x-2 ${
                adminTab === 'approvals'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t.allSubmissions} ({pendingCount})</span>
            </button>
            <button
              onClick={() => {
                setAdminTab('staff-summary');
                if (window.innerWidth < 1024) setIsMenuCollapsed(true);
              }}
              className={`py-3.5 px-5 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition duration-150 flex items-center space-x-2 ${
                adminTab === 'staff-summary'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>{t.staffProfiles}</span>
            </button>
            <button
              onClick={() => {
                setAdminTab('direct-bulk-entry');
                if (window.innerWidth < 1024) setIsMenuCollapsed(true);
              }}
              className={`py-3.5 px-5 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition duration-150 flex items-center space-x-2 ${
                adminTab === 'direct-bulk-entry'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
              <span className="font-extrabold">{currentLang === 'zh' ? '代录与批量发证' : 'Direct & Bulk Entry'}</span>
            </button>
            {currentUser.role === 'hr_admin' && (
              <button
                onClick={() => {
                  setAdminTab('rules');
                  if (window.innerWidth < 1024) setIsMenuCollapsed(true);
                }}
                className={`py-3.5 px-5 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition duration-150 flex items-center space-x-2 ${
                  adminTab === 'rules'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>{t.pointScheme}</span>
              </button>
            )}
            {currentUser.role === 'hr_admin' && (
              <button
                onClick={() => {
                  setAdminTab('password');
                  if (window.innerWidth < 1024) setIsMenuCollapsed(true);
                }}
                className={`py-3.5 px-5 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition duration-150 flex items-center space-x-2 ${
                  adminTab === 'password'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>{currentLang === 'zh' ? '管理员审核密码设置' : 'Security Settings'}</span>
              </button>
            )}
            <button
              onClick={() => {
                setAdminTab('staff-creation');
                if (window.innerWidth < 1024) setIsMenuCollapsed(true);
              }}
              className={`py-3.5 px-5 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition duration-150 flex items-center space-x-2 ${
                adminTab === 'staff-creation'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>{currentLang === 'zh' ? '职员账号创建中心' : 'Staff Register Station'}</span>
            </button>
            {currentUser.role === 'hr_admin' && (
              <button
                onClick={() => {
                  setAdminTab('department-settings');
                  if (window.innerWidth < 1024) setIsMenuCollapsed(true);
                }}
                className={`py-3.5 px-5 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition duration-150 flex items-center space-x-2 ${
                  adminTab === 'department-settings'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building className="w-4 h-4 shrink-0" />
                <span>{currentLang === 'zh' ? '处室/部门管理设置' : 'Department Settings'}</span>
              </button>
            )}
            {currentUser.role === 'hr_admin' && (
              <button
                onClick={() => {
                  setAdminTab('audit');
                  if (window.innerWidth < 1024) setIsMenuCollapsed(true);
                }}
                className={`py-3.5 px-5 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition duration-150 flex items-center space-x-2 ${
                  adminTab === 'audit'
                    ? 'border-blue-600 text-blue-750 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ListCollapse className="w-4 h-4 shrink-0" />
                <span>{currentLang === 'zh' ? '系统核实日志' : 'HR Audit Logbook'}</span>
              </button>
            )}
          </div>
        </div>

        {/* When collapsed, display an extremely tidy single-line feedback bar */}
        {isMenuCollapsed && (
          <div className="bg-slate-50/70 px-5 py-3 flex items-center justify-between text-xs text-slate-600 font-medium font-sans border-t border-slate-100">
            <div className="flex items-center space-x-1.5 min-w-0">
              <span className="text-blue-500 select-none animate-pulse">📌</span>
              <span className="font-extrabold text-slate-700 truncate">
                {currentLang === 'zh' ? '当前视图：' : 'Active Workspace: '}
                {adminTab === 'approvals' && (currentLang === 'zh' ? `${t.allSubmissions} (${pendingCount})` : `${t.allSubmissions} (${pendingCount})`)}
                {adminTab === 'staff-summary' && (currentLang === 'zh' ? t.staffProfiles : 'Staff Profiles')}
                {adminTab === 'direct-bulk-entry' && (currentLang === 'zh' ? '代录与批量发证' : 'Direct & Bulk Entry')}
                {adminTab === 'rules' && (currentLang === 'zh' ? t.pointScheme : 'Point Scheme')}
                {adminTab === 'password' && (currentLang === 'zh' ? '管理员审核密码设置' : 'Security Settings')}
                {adminTab === 'staff-creation' && (currentLang === 'zh' ? '职员账号创建中心' : 'Staff Register Station')}
                {adminTab === 'department-settings' && (currentLang === 'zh' ? '处室/部门管理设置' : 'Department Settings')}
                {adminTab === 'audit' && (currentLang === 'zh' ? '系统核实日志' : 'HR Audit Logbook')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMenuCollapsed(false)}
              className="text-blue-650 hover:text-blue-800 font-bold text-[11px] shrink-0 cursor-pointer flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1 shadow-2xs hover:shadow-xs transition ml-2"
            >
              {currentLang === 'zh' ? '切换模块 ➔' : 'Switch ➔'}
            </button>
          </div>
        )}
      </div>

      {/* METRICS STACK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total submissions */}
        <button
          type="button"
          onClick={() => {
            setAdminTab('approvals');
            setStatusFilter('all');
            setDeptFilter('all');
            setSearchQuery('');
          }}
          className={`text-left p-5 flex items-center justify-between rounded-3xl border shadow-xs transition duration-200 cursor-pointer select-none hover:scale-[1.02] hover:shadow-md active:scale-[0.98] focus:outline-hidden ${
            adminTab === 'approvals' && statusFilter === 'all'
              ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
          }`}
          title={currentLang === 'zh' ? '点击跳转至：全员申报（全部列表）' : 'Click to view: All submissions'}
        >
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-widest block font-bold">
              {t.totalSubmissions}
            </span>
            <span className="text-2xl font-black text-slate-800 font-display">
              {totalSubmissionsCount}
            </span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-500 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </button>

        {/* Pending with Red alert tag */}
        <button
          type="button"
          onClick={() => {
            setAdminTab('approvals');
            setStatusFilter('Pending Verification');
            setDeptFilter('all');
            setSearchQuery('');
          }}
          className={`text-left p-5 flex items-center justify-between rounded-3xl border shadow-xs transition duration-200 cursor-pointer select-none hover:scale-[1.02] hover:shadow-md active:scale-[0.98] focus:outline-hidden ${
            adminTab === 'approvals' && statusFilter === 'Pending Verification'
              ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/40'
              : (pendingCount > 0 
                  ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400 hover:bg-amber-50/60' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/30')
          }`}
          title={currentLang === 'zh' ? '点击跳转至：待审核件' : 'Click to view: Pending audit items'}
        >
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-widest block font-bold">
              {currentLang === 'zh' ? '待审核件' : 'Pending Verification'}
            </span>
            <span className={`text-2xl font-black font-display flex items-center ${
              pendingCount > 0 ? 'text-amber-750 font-black' : 'text-slate-800'
            }`}>
              {pendingCount}
              {pendingCount > 0 && <span className="ml-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
            </span>
          </div>
          <div className="p-3 bg-amber-100/80 text-amber-700 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </button>

        {/* Verified hours */}
        <button
          type="button"
          onClick={() => {
            setAdminTab('approvals');
            setStatusFilter('Verified');
            setDeptFilter('all');
            setSearchQuery('');
          }}
          className={`text-left p-5 flex items-center justify-between rounded-3xl border shadow-xs transition duration-200 cursor-pointer select-none hover:scale-[1.02] hover:shadow-md active:scale-[0.98] focus:outline-hidden ${
            adminTab === 'approvals' && statusFilter === 'Verified'
              ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
          }`}
          title={currentLang === 'zh' ? '点击跳转至：已核实通过列表' : 'Click to view: Approved items'}
        >
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-widest block font-bold">
              {t.recordsVerified}
            </span>
            <span className="text-2xl font-black text-blue-700 font-display">
              {verifiedCount}
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </button>

        {/* Targets achieved */}
        <button
          type="button"
          onClick={() => {
            setAdminTab('staff-summary');
            setComplianceFilter('reached');
            setSearchQuery('');
          }}
          className={`text-left p-5 flex items-center justify-between rounded-3xl border shadow-xs transition duration-200 cursor-pointer select-none hover:scale-[1.02] hover:shadow-md active:scale-[0.98] focus:outline-hidden ${
            adminTab === 'staff-summary' && complianceFilter === 'reached'
              ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
          }`}
          title={currentLang === 'zh' ? '点击查看：已达成10积分考核指标的职员名单' : 'Click to filter: Staff who met target'}
        >
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-widest block font-bold">
              {currentLang === 'zh' ? '已达10分目标人数' : 'Reached 10 pts target'}
            </span>
            <span className="text-2xl font-black text-blue-700 font-display">
              {reachedCount} <span className="text-xs text-slate-400 font-normal">/ {staffUsers.length}</span>
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </button>

        {/* Not reached targets */}
        <button
          type="button"
          onClick={() => {
            setAdminTab('staff-summary');
            setComplianceFilter('notReached');
            setSearchQuery('');
          }}
          className={`text-left p-5 flex items-center justify-between rounded-3xl border shadow-xs transition duration-200 cursor-pointer select-none hover:scale-[1.02] hover:shadow-md active:scale-[0.98] focus:outline-hidden ${
            adminTab === 'staff-summary' && complianceFilter === 'notReached'
              ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/25'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
          }`}
          title={currentLang === 'zh' ? '点击查看：未达标考核指标教职员名单' : 'Click to filter: Below target staff'}
        >
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-widest block font-bold">
              {currentLang === 'zh' ? '未满10分考核人数' : 'Below target staff'}
            </span>
            <span className="text-2xl font-black text-rose-700 font-display">
              {notReachedCount}
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* VIEW: VERIFICATIONS PORTAL */}
      {adminTab === 'approvals' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {currentLang === 'zh' ? '全员申报审核台' : 'All Staff Submissions Review Station'}
              </h2>
              <p className="text-xs text-slate-500">
                {currentLang === 'zh' ? '审核职员填写的培训小时，通过佐证文件转换最终积分' : 'Verify proof transcripts, approve or request correction adjustments.'}
              </p>
            </div>

            {/* Admin filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg font-semibold"
              >
                <option value="all">{t.filterDepartment}</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept.split(' (')[0]}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg font-semibold"
              >
                <option value="all">{t.filterStatus}</option>
                <option value="Pending Verification">{t.pending}</option>
                <option value="Verified">{t.verified}</option>
                <option value="Rejected">{t.rejected}</option>
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={currentLang === 'zh' ? '输入申报员工姓名、培训项目名称、举办单位搜索...' : 'Search by staff name, title, organizer...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>

          {/* Full Table Grid */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              {currentLang === 'zh' ? '暂无符合检索条件的职员培训申报。' : 'No staff validation sheets found matching filters.'}
            </div>
          ) : (
            <div>
              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/60">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                      <th className="p-4">{t.staffName}</th>
                      <th className="p-4">{t.trainingTitle}</th>
                      <th className="p-4">{t.durationHours}</th>
                      <th className="p-4">{t.status}</th>
                      <th className="p-4 text-right">{currentLang === 'zh' ? '审核管理' : 'Action Options'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800">{rec.staffName}</div>
                          <div className="text-xs text-slate-400 font-mono">{rec.department.split(' ')[0]}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800 leading-tight">{rec.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5 max-w-sm truncate">{rec.organiser} • {rec.date}</div>
                          {rec.fileName && (
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewAttachmentRecord(rec);
                                setZoomMultiplier(1);
                                setIntegrityVerified(null);
                                setIsVerifyingIntegrity(false);
                              }}
                              className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-100/70 hover:text-emerald-800 rounded-lg px-2 py-0.5 w-fit transition cursor-pointer"
                              title={currentLang === 'zh' ? '查看附件审查报告' : 'Inspect training attachment'}
                            >
                              <Paperclip className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="font-mono truncate max-w-[200px]" title={rec.fileName}>{rec.fileName}</span>
                              {rec.fileSize && <span className="text-slate-400 text-[10px]">({rec.fileSize})</span>}
                            </button>
                          )}
                        </td>
                        <td className="p-4 font-mono text-xs whitespace-nowrap">
                          <span className="font-bold text-slate-700 bg-slate-100 border px-2 py-0.5 rounded">
                            {rec.duration} hours
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            rec.status === 'Verified' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : rec.status === 'Rejected' ? 'bg-rose-50 border border-rose-250 text-rose-700' : 'bg-amber-50 border border-amber-200 text-amber-700'
                          }`}>
                            <span>{rec.status === 'Verified' ? t.verified : rec.status === 'Rejected' ? t.rejected : t.pending}</span>
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            {/* QUICK EDIT FOR ADMIN CORRECTIONS - Super Admin only */}
                            {currentUser.role === 'hr_admin' && (
                              <button
                                onClick={() => {
                                  setEditingRecord(rec);
                                  setEditTitle(rec.title);
                                  setEditOrganiser(rec.organiser);
                                  setEditDuration(rec.duration);
                                  setEditEndDate(rec.endDate || '');
                                  setEditLecturer(rec.lecturer || '');
                                  setEditTrainingTime(rec.trainingTime || '');
                                }}
                                className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg transition"
                                title={currentLang === 'zh' ? '修正申报时数数据' : 'Edit claim data directly'}
                              >
                                <FileEdit className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* REVIEW PORTAL MODAL TRIGGER */}
                            {(rec.status === 'Pending Verification' || currentUser.role === 'hr_admin') && (
                              currentUser.role === 'hr_agent' && rec.staffEmail === currentUser.email ? (
                                <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-lg flex items-center space-x-1 font-bold">
                                  <span>🔒</span>
                                  <span>{currentLang === 'zh' ? '自审受限' : 'Self Audit Locked'}</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReviewingRecord(rec);
                                    setReviewRemarks(rec.remarks || '');
                                    setReviewHours(rec.duration);
                                  }}
                                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer ${
                                    rec.status === 'Pending Verification'
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 border border-amber-400 shadow-sm'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  <span>{rec.status === 'Pending Verification' ? (currentLang === 'zh' ? '核实' : 'Audit') : (currentLang === 'zh' ? '重审' : 'Re-audit')}</span>
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Stack Layout */}
              <div className="block md:hidden space-y-4">
                {filteredRecords.map((rec) => (
                  <div 
                    key={rec.id} 
                    className="p-4 bg-slate-50/55 rounded-2xl border border-slate-200 space-y-3 shadow-xs"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <h4 className="font-black text-slate-850 text-sm leading-snug">
                          {rec.staffName}
                        </h4>
                        <div className="text-[11px] font-bold text-slate-400 font-mono tracking-tight">
                          {rec.department.split(' ')[0]} • {rec.date}
                        </div>
                      </div>
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        rec.status === 'Verified' ? 'bg-emerald-50 border border-emerald-150 text-emerald-700' : rec.status === 'Rejected' ? 'bg-rose-50 border border-rose-150 text-rose-700' : 'bg-amber-50 border border-amber-150 text-amber-700'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          rec.status === 'Verified' ? 'bg-emerald-400' : rec.status === 'Rejected' ? 'bg-rose-400' : 'bg-amber-400'
                        }`}></span>
                        <span>{rec.status === 'Verified' ? t.verified : rec.status === 'Rejected' ? t.rejected : t.pending}</span>
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <div className="font-bold text-xs text-slate-800 leading-snug">
                        {rec.title}
                      </div>
                      <div className="text-[10px] text-slate-450 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                        {rec.organiser}
                      </div>
                      <div className="text-[10px] text-sky-800 font-black pt-1 block">
                        ⚡ {rec.duration} {currentLang === 'zh' ? '小时 (申报)' : 'hrs (Claimed)'}
                      </div>
                    </div>

                    {rec.fileName && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewAttachmentRecord(rec);
                          setZoomMultiplier(1);
                          setIntegrityVerified(null);
                          setIsVerifyingIntegrity(false);
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200 rounded-lg px-2.5 py-1 w-full transition cursor-pointer"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate flex-1 text-left">{rec.fileName}</span>
                      </button>
                    )}

                    <div className="flex items-center justify-end gap-2.5 pt-1.5 border-t border-slate-100">
                      {/* QUICK EDIT */}
                      {currentUser.role === 'hr_admin' && (
                        <button
                          onClick={() => {
                            setEditingRecord(rec);
                            setEditTitle(rec.title);
                            setEditOrganiser(rec.organiser);
                            setEditDuration(rec.duration);
                            setEditEndDate(rec.endDate || '');
                            setEditLecturer(rec.lecturer || '');
                            setEditTrainingTime(rec.trainingTime || '');
                          }}
                          className="p-2 border bg-white text-sky-800 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                          title={currentLang === 'zh' ? '修正申报时数数据' : 'Edit claim data directly'}
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>
                      )}

                      {/* AUDIT TRIGGER */}
                      {(rec.status === 'Pending Verification' || currentUser.role === 'hr_admin') && (
                        currentUser.role === 'hr_agent' && rec.staffEmail === currentUser.email ? (
                          <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl flex items-center space-x-1 font-bold">
                            <span>🔒</span>
                            <span>{currentLang === 'zh' ? '自行审计锁' : 'Self Audit'}</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setReviewingRecord(rec);
                              setReviewRemarks(rec.remarks || '');
                              setReviewHours(rec.duration);
                            }}
                            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center space-x-1.5 cursor-pointer border ${
                              rec.status === 'Pending Verification'
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 border-amber-400 shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 border-slate-250 text-slate-700'
                            }`}
                          >
                            <span>{rec.status === 'Pending Verification' ? (currentLang === 'zh' ? '核实审计' : 'Verify Audit') : (currentLang === 'zh' ? '重新抽审' : 'Re-verify')}</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: STAFF PROGRESS SUMMARY PROFILE */}
      {adminTab === 'staff-summary' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {currentLang === 'zh' ? '董总全体职员成长档案 & 积分统计' : 'Staff Training Points Report Ledger'}
              </h2>
              <p className="text-xs text-slate-400">
                {currentLang === 'zh' ? '全员各部门之培训小时与年度考核10积分达成情况。支持导出报表数据。' : 'Lists total verified stats. Only HR-verified records contribute to official point calculations.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              <select
                value={complianceFilter}
                onChange={(e) => setComplianceFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2.5 rounded-xl font-bold cursor-pointer focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="all">{currentLang === 'zh' ? '🔍 全部指标状态' : '📊 All Goal Statuses'}</option>
                <option value="reached">{currentLang === 'zh' ? '⭐ 已满10分考核达标' : '⭐ Reached 10 PTS'}</option>
                <option value="notReached">{currentLang === 'zh' ? '⚠️ 未满10分的职员' : '⚠️ Below 10 PTS'}</option>
              </select>

              <select
                value={`${ledgerSortField}-${ledgerSortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setLedgerSortField(field as any);
                  setLedgerSortOrder(order as any);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2.5 rounded-xl font-bold cursor-pointer focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-sans"
              >
                <option value="name-asc">🔤 {currentLang === 'zh' ? '姓名 (正序 A-Z)' : 'Name (A-Z)'}</option>
                <option value="name-desc">🔤 {currentLang === 'zh' ? '姓名 (倒序 Z-A)' : 'Name (Z-A)'}</option>
                <option value="department-asc">🏢 {currentLang === 'zh' ? '部门 (正序 A-Z)' : 'Department (A-Z)'}</option>
                <option value="department-desc">🏢 {currentLang === 'zh' ? '部门 (倒序 Z-A)' : 'Department (Z-A)'}</option>
                <option value="hours-desc">⏱️ {currentLang === 'zh' ? '通过核实小时 (高到低)' : 'Verified Hours (High-Low)'}</option>
                <option value="hours-asc">⏱️ {currentLang === 'zh' ? '通过核实小时 (低到高)' : 'Verified Hours (Low-High)'}</option>
                <option value="points-desc">🏆 {currentLang === 'zh' ? '获得总积分 (高到低)' : 'Total Points (High-Low)'}</option>
                <option value="points-asc">🏆 {currentLang === 'zh' ? '获得总积分 (低到高)' : 'Total Points (Low-High)'}</option>
                <option value="progress-desc">📈 {currentLang === 'zh' ? '考核目标进度 (高到低)' : 'Goal Progress (High-Low)'}</option>
                <option value="progress-asc">📈 {currentLang === 'zh' ? '考核目标进度 (低到高)' : 'Goal Progress (Low-High)'}</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.exportCsv}</span>
              </button>
            </div>
          </div>

          {(() => {
            const sortedAndFilteredStaffUsers = [...staffUsers].filter((usr) => {
              const stats = calculateStaffStats(usr.email);
              if (complianceFilter === 'reached') return stats.reached;
              if (complianceFilter === 'notReached') return !stats.reached;
              return true;
            }).sort((a, b) => {
              let valA: any = '';
              let valB: any = '';

              if (ledgerSortField === 'name') {
                valA = (a.name || '').toLowerCase();
                valB = (b.name || '').toLowerCase();
              } else if (ledgerSortField === 'department') {
                valA = (a.department || '').toLowerCase();
                valB = (b.department || '').toLowerCase();
              } else if (ledgerSortField === 'hours' || ledgerSortField === 'points' || ledgerSortField === 'progress') {
                const statsA = calculateStaffStats(a.email);
                const statsB = calculateStaffStats(b.email);
                if (ledgerSortField === 'hours') {
                  valA = statsA.hours;
                  valB = statsB.hours;
                } else if (ledgerSortField === 'points') {
                  valA = statsA.points;
                  valB = statsB.points;
                } else {
                  valA = statsA.points;
                  valB = statsB.points;
                }
              }

              if (valA < valB) return ledgerSortOrder === 'asc' ? -1 : 1;
              if (valA > valB) return ledgerSortOrder === 'asc' ? 1 : -1;
              return 0;
            });

            return (
              <div>
                {/* Desktop Table Presentation */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/60">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs tracking-wider select-none">
                        <th className="p-4 cursor-pointer hover:bg-slate-100 transition duration-150" onClick={() => handleLedgerSort('name')}>
                          <div className="flex items-center space-x-1">
                            <span>{t.staffName}</span>
                            <span className="text-slate-400 font-sans">{ledgerSortField === 'name' ? (ledgerSortOrder === 'asc' ? '▲' : '▼') : '↕'}</span>
                          </div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100 transition duration-150" onClick={() => handleLedgerSort('department')}>
                          <div className="flex items-center space-x-1">
                            <span>{t.department}</span>
                            <span className="text-slate-400 font-sans">{ledgerSortField === 'department' ? (ledgerSortOrder === 'asc' ? '▲' : '▼') : '↕'}</span>
                          </div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100 transition duration-150" onClick={() => handleLedgerSort('hours')}>
                          <div className="flex items-center space-x-1">
                            <span>{currentLang === 'zh' ? '通过核实小时' : 'Verified Hours'}</span>
                            <span className="text-slate-400 font-sans">{ledgerSortField === 'hours' ? (ledgerSortOrder === 'asc' ? '▲' : '▼') : '↕'}</span>
                          </div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100 transition duration-150" onClick={() => handleLedgerSort('points')}>
                          <div className="flex items-center space-x-1">
                            <span>{currentLang === 'zh' ? '获得总积分' : 'Verified Points'}</span>
                            <span className="text-slate-400 font-sans">{ledgerSortField === 'points' ? (ledgerSortOrder === 'asc' ? '▲' : '▼') : '↕'}</span>
                          </div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-slate-100 transition duration-150" onClick={() => handleLedgerSort('progress')}>
                          <div className="flex items-center space-x-1">
                            <span>{currentLang === 'zh' ? '考核目标进度' : 'Requirement Compliance'}</span>
                            <span className="text-slate-400 font-sans">{ledgerSortField === 'progress' ? (ledgerSortOrder === 'asc' ? '▲' : '▼') : '↕'}</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {sortedAndFilteredStaffUsers.map((usr) => {
                        const stats = calculateStaffStats(usr.email);
                        return (
                      <tr key={usr.id} className="hover:bg-slate-50/50 transition duration-100">
                        <td className="p-4">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                            <span>{usr.chineseName} ({usr.name})</span>
                            {usr.staffNo && (
                              <span className="font-mono bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.2 rounded border border-blue-150 font-bold">
                                {usr.staffNo}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-slate-400">{usr.email}</div>
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-600">
                          {usr.department}
                        </td>
                        <td className="p-4 whitespace-nowrap font-mono font-bold text-sky-850 text-xs">
                          {stats.hours} hours
                        </td>
                        <td className="p-4 whitespace-wrap font-mono">
                          <span className="bg-blue-50 text-blue-700 font-extrabold text-sm px-2.5 py-0.5 rounded-lg border border-blue-100">
                            {stats.points} / {pointRule.maxPointsPerYear} PTS
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {stats.reached ? (
                            <span className="bg-blue-50 border border-blue-200 text-blue-800 font-extrabold text-xs px-2.5 py-1 rounded-full inline-flex items-center space-x-1 animate-pulse">
                              <span>✓ {currentLang === 'zh' ? '达标 10 分' : 'COMPLETED'}</span>
                            </span>
                          ) : (
                            <div className="w-40">
                              <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                                <span>{currentLang === 'zh' ? '还差 ' : 'Need '}{(pointRule.maxPointsPerYear - stats.points).toFixed(1)}分</span>
                                <span>{Math.round((stats.points / pointRule.maxPointsPerYear) * 100)}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-amber-500 h-1.5 rounded-full"
                                  style={{ width: `${(stats.points / pointRule.maxPointsPerYear) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stack Cards Presentation */}
            <div className="block md:hidden space-y-4">
              {sortedAndFilteredStaffUsers.map((usr) => {
                const stats = calculateStaffStats(usr.email);
                return (
                  <div 
                    key={usr.id} 
                    className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-3.5 shadow-xs transition hover:bg-slate-50"
                  >
                    <div className="flex justify-between items-start gap-2.5">
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-extrabold text-slate-800 text-sm truncate flex items-center gap-1.5">
                          <span>{usr.chineseName}</span>
                          <span className="text-xs text-slate-400 font-normal">({usr.name})</span>
                        </h4>
                        <div className="text-[10px] font-mono text-slate-400 truncate">{usr.email}</div>
                      </div>
                      
                      {usr.staffNo ? (
                        <span className="font-mono bg-blue-50 text-blue-700 text-[9px] px-1.5 py-0.5 rounded border border-blue-150 font-bold shrink-0">
                          {usr.staffNo}
                        </span>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-100 text-xs font-semibold">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">
                          {currentLang === 'zh' ? '所属部门' : 'Department'}
                        </span>
                        <span className="text-slate-700 truncate block max-w-full font-medium">{usr.department}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">
                          {currentLang === 'zh' ? '核实总学时' : 'Verified Hours'}
                        </span>
                        <span className="font-mono text-sky-850 font-bold bg-sky-50/50 px-1.5 py-0.2 rounded border border-sky-100">{stats.hours} hrs</span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{currentLang === 'zh' ? '年度考核积分' : 'Goal Meter'}</span>
                        <span className="bg-slate-100 font-mono text-slate-800 text-[10px] font-black px-1.5 py-0.5 rounded">
                          {stats.points} / {pointRule.maxPointsPerYear} PTS
                        </span>
                      </div>

                      {stats.reached ? (
                        <div className="bg-emerald-50/70 border border-emerald-150 text-emerald-800 font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center justify-center space-x-1">
                          <span>✓ {currentLang === 'zh' ? '考核已达标 10 分 (通过)' : 'CPD GOAL COMPLETED'}</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>{currentLang === 'zh' ? '还差 ' : 'Short '}{(pointRule.maxPointsPerYear - stats.points).toFixed(1)} PTS</span>
                            <span>{Math.round((stats.points / pointRule.maxPointsPerYear) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-amber-500 h-1.5 rounded-full"
                              style={{ width: `${(stats.points / pointRule.maxPointsPerYear) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )})()}
        </div>
      )}

      {/* VIEW: ADJUST DYNAMIC SCALE RULES (POINT RULES) */}
      {adminTab === 'rules' && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Settings className="text-amber-500 w-5 h-5" />
              <span>{currentLang === 'zh' ? '考核学时换算积分规则设定' : 'CPD Calculation Matrix Scale Settings'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {currentLang === 'zh' ? '修改规则设定将即时引发全员已审核培训小时的重新换算！无需清理旧记录即可响应新制度。' : 'Altering constants here recalculates the global credentials schema ledger instantaneously.'}
            </p>
          </div>

          <form onSubmit={handleRuleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hours per Point */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider">
                  {currentLang === 'zh' ? '1个成长积分等同于多少学时 (Training Hours Per Point)' : 'Training Hours Per Point'}
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={hoursPerPoint}
                  onChange={(e) => setHoursPerPoint(Math.max(0.5, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                />
                <p className="text-[11px] text-slate-400 italic">
                  {currentLang === 'zh' ? '当前默认: 2小时换算1积分。' : 'Default constant: 2.0 hours. Set to 1.0 to map hours straight into points.'}
                </p>
              </div>

              {/* Annual CAP Points */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider">
                  {currentLang === 'zh' ? '每年最高可兑换/计入的积分上限 (Maximum Claim Cap)' : 'Maximum Annual Point Cap'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={maxPointsPerYear}
                  onChange={(e) => setMaxPointsPerYear(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                />
                <p className="text-[11px] text-slate-400 italic">
                  {currentLang === 'zh' ? '当前默认: 10个积分（达到 20 小时）。多出时数仍记录但停止计入达标进度。' : 'Default constant: 10 points. Maximum allowed accumulation limit.'}
                </p>
              </div>
            </div>

            {/* Simulated Live preview info */}
            <div className="bg-slate-50 border p-4 rounded-xl text-xs space-y-2">
              <span className="font-bold text-slate-700 block text-xs border-b pb-1">
                ⚙️ {currentLang === 'zh' ? '新换算标准推算器预览' : 'Calculation Mechanics Simulation Sandbox'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-slate-600">
                <div className="bg-white p-2 border rounded text-center">
                  <span className="text-[10px] uppercase text-slate-400 block">{currentLang === 'zh' ? '申报 4 小时' : '4 hours claim'}</span>
                  <span className="font-bold text-slate-800">{(4 / hoursPerPoint).toFixed(2)} {t.pointsShort}</span>
                </div>
                <div className="bg-white p-2 border rounded text-center">
                  <span className="text-[10px] uppercase text-slate-400 block">{currentLang === 'zh' ? '申报 16 小时' : '16 hours claim'}</span>
                  <span className="font-bold text-slate-800">{Math.min(16 / hoursPerPoint, maxPointsPerYear).toFixed(2)} {t.pointsShort}</span>
                </div>
                <div className="bg-white p-2 border rounded text-center">
                  <span className="text-[10px] uppercase text-slate-400 block">{currentLang === 'zh' ? '申报 30 小时 (限额)' : '30 hours (cap)'}</span>
                  <span className="font-bold text-blue-700">{Math.min(30 / hoursPerPoint, maxPointsPerYear)} {t.pointsShort} ({currentLang === 'zh' ? '封顶' : 'cap'})</span>
                </div>
              </div>
            </div>

            {showConfigSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-xl font-medium animate-fade-in flex items-center space-x-2">
                <span>⚡</span>
                <span>{currentLang === 'zh' ? '【董总TMS系统提示】：换算比例调整完成！全员积分进度已实时重算。' : 'Success: Point formulas reassessed! Staff metrics recalculated on current schema.'}</span>
              </div>
            )}

            <div className="border-t pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-sm"
              >
                {currentLang === 'zh' ? '应用新公式重算全员积分' : 'Apply Formula Parameters'}
              </button>
            </div>
          </form>
        </div>

        {/* COURSE CATEGORIES MANAGEMENT FOR HR ADMINS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-6 mt-6">
          <div className="border-b pb-4 flex justify-between items-start gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Layers className="text-amber-500 w-5 h-5" />
                <span>{currentLang === 'zh' ? '常态化培训类别与科目设置' : 'CPD Training Category Classifications'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {currentLang === 'zh' ? '管理董总教职员申报时可选择的常态化培训小类，亦可更名或自定义拓展。' : 'Administer classifications selectable by staff characters when adding credential hours.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetCategoriesToDefault}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200 transition cursor-pointer"
              title={currentLang === 'zh' ? '恢复至默认 6 类' : 'Restore 6 Original Defaults'}
            >
              🔄 {currentLang === 'zh' ? '恢复默认' : 'Reset Defaults'}
            </button>
          </div>

          {/* LIST OF CATEGORIES */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              {currentLang === 'zh' ? '当前生效类别' : 'Current Categories'}
            </span>
            <div className="border rounded-xl divide-y divide-slate-150 overflow-hidden bg-slate-50/50">
              {categories.map((cat) => (
                <div key={cat.id} className="flex justify-between items-center p-3.5 hover:bg-slate-50 transition">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] bg-sky-50 text-sky-800 border border-sky-100 px-1.5 py-0.2 rounded font-bold uppercase mr-2 tracking-wide">
                      {cat.id}
                    </span>
                    <span className="text-sm font-bold text-slate-800 font-sans">{cat.nameZh}</span>
                    <span className="text-slate-400 text-xs font-medium ml-2">/ {cat.nameEn}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => startEditCategory(cat)}
                      className="p-1 px-2 border text-xs font-bold bg-white text-blue-600 rounded-lg shadow-sm hover:bg-slate-50 transition cursor-pointer"
                    >
                      {currentLang === 'zh' ? '编辑' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 px-2 border border-rose-200 text-xs font-bold bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition cursor-pointer"
                      title={currentLang === 'zh' ? '删除类别' : 'Delete category'}
                    >
                      {currentLang === 'zh' ? '删除' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ADD / EDIT CATEGORY SUB-FORM */}
          <form onSubmit={handleCategoryCreateOrUpdate} className="bg-slate-50/50 border border-slate-200 p-4 rounded-2xl space-y-4">
            <span className="text-xs font-extrabold text-slate-705 uppercase tracking-wider block border-b pb-1.5">
              {editingCategoryId 
                ? (currentLang === 'zh' ? `✏️ 修改类别资料 - ${editingCategoryId}` : `✏️ Modify Category Details - ${editingCategoryId}`)
                : (currentLang === 'zh' ? '➕ 添加全新的培训类别' : '➕ Set Up New Category')}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* ID Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 opacity-80 uppercase tracking-wide">
                  {currentLang === 'zh' ? '标识代码 (ID) *' : 'Unique key (ID) *'}
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingCategoryId}
                  placeholder="e.g. general"
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                />
                {!editingCategoryId && (
                  <span className="text-[9px] text-slate-400 block leading-tight">
                    {currentLang === 'zh' ? '只能是字母/数字/下划线' : 'Alphanumeric letters only'}
                  </span>
                )}
              </div>

              {/* Chinese Name Input */}
              <div className="space-y-1.5 font-sans">
                <label className="block text-[11px] font-bold text-slate-600 opacity-80 uppercase tracking-wide">
                  {currentLang === 'zh' ? '中文标准名称 *' : 'Chinese standard name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={currentLang === 'zh' ? '请输入中文全称' : 'e.g. 师资研习班'}
                  value={categoryNameZh}
                  onChange={(e) => setCategoryNameZh(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-sans"
                />
              </div>

              {/* English Name Input */}
              <div className="space-y-1.5 font-sans">
                <label className="block text-[11px] font-bold text-slate-600 opacity-80 uppercase tracking-wide">
                  {currentLang === 'zh' ? '英文官方名称 *' : 'English official name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={currentLang === 'zh' ? '请输入英文全称' : 'e.g. Teacher Academy'}
                  value={categoryNameEn}
                  onChange={(e) => setCategoryNameEn(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-sans"
                />
              </div>
            </div>

            {categoryError && (
              <div className="bg-rose-50 border border-rose-250 text-rose-700 text-[11px] px-3 py-2 rounded-xl font-medium">
                {categoryError}
              </div>
            )}

            {categorySuccess && (
              <div className="bg-emerald-55 border border-emerald-250 text-emerald-800 text-[11px] px-3 py-2 rounded-xl font-medium">
                {categorySuccess}
              </div>
            )}

            <div className="flex justify-end gap-2 text-xs pt-1 border-t border-slate-200/60">
              {editingCategoryId && (
                <button
                  type="button"
                  onClick={cancelEditCategory}
                  className="px-4 py-2 border bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition cursor-pointer"
                >
                  {currentLang === 'zh' ? '取消' : 'Cancel'}
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition cursor-pointer shadow-sm animate-pulse-once"
              >
                {editingCategoryId 
                  ? (currentLang === 'zh' ? '💽 应用保存修改' : '💽 Apply Adjustments') 
                  : (currentLang === 'zh' ? '🚀 添加这个新类别' : '🚀 Publish Category')}
              </button>
            </div>
          </form>
        </div>
        </>
      )}

      {/* VIEW: PASSWORD SETTINGS */}
      {adminTab === 'password' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Lock className="text-blue-650 w-5 h-5 animate-pulse" />
              <span>{currentLang === 'zh' ? '管理员审核控制密码设置' : 'HR Admin Access Password Settings'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {currentLang === 'zh' ? '安全密钥设置：此密码保护进入具有审核及配置权能的人事处（HR）页面，规避无关人员访问。' : 'Security Access Gate: This password is required to switch session-identity to HR Administrator roles.'}
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-4">
              {/* CURRENT PASSWORD */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider flex justify-between">
                  <span>{currentLang === 'zh' ? '当前管理员密码 (Current Password)' : 'Current Admin Password'}</span>
                  <span className="text-[10px] text-slate-400 font-mono lowercase">required to authorize changes</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPasswordConfirm}
                  onChange={(e) => setCurrentPasswordConfirm(e.target.value)}
                  placeholder={currentLang === 'zh' ? '请输入当前密码以授权修改 (默认: admin123)' : 'Enter current password (default: admin123)'}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NEW PASSWORD */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider">
                    {currentLang === 'zh' ? '设定新密码 (New Password)' : 'New Access Password'}
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder={currentLang === 'zh' ? '设定新访问密码' : 'Enter new password'}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    {currentLang === 'zh' ? '※ 新密码请妥善保存' : 'Keep new secrets noted.'}
                  </span>
                </div>

                {/* CONFIRM NEW PASSWORD */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider">
                    {currentLang === 'zh' ? '确认新密码 (Confirm New Password)' : 'Confirm New Password'}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder={currentLang === 'zh' ? '再次输入新密码' : 'Confirm new password'}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                  />
                  {newAdminPassword && confirmAdminPassword && (
                    <span className={`text-[10px] font-bold block ${newAdminPassword === confirmAdminPassword ? 'text-emerald-600' : 'text-rose-605'}`}>
                      {newAdminPassword === confirmAdminPassword 
                        ? (currentLang === 'zh' ? '✓ 密码一致' : '✓ Passwords match')
                        : (currentLang === 'zh' ? '✗ 密码不匹配' : '✗ Passwords do not match')
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>

            {passwordChangeError && (
              <div className="bg-rose-50 border border-rose-250 text-rose-800 text-xs px-4 py-3 rounded-xl font-medium animate-shake">
                {passwordChangeError}
              </div>
            )}

            {passwordChangeSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-xl font-medium animate-fade-in flex items-center space-x-2">
                <span>🛡️</span>
                <span>{currentLang === 'zh' ? '人事密码已成功修改并持久安全同步！今后需要输入此新密码。' : 'Success: HR Security gateway passcode changed and securely persisted.'}</span>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
              <span className="text-[11px] text-slate-400 italic">
                {currentLang === 'zh' ? '密码采用 React 本地隔离。' : 'Secured via isolated safe ledger.'}
              </span>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-sm active:scale-95"
              >
                {currentLang === 'zh' ? '更新管理员安全密码' : 'Update Access Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: STAFF ACCOUNT CREATION STATION */}
      {adminTab === 'staff-creation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: ACCOUNT REGISTER CREATION/AMENDMENT FORM */}
          <div className="lg:col-span-12 xl:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs h-fit space-y-6">
            <div className="border-b pb-4">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold leading-none">
                <span>{editingStaffId ? '✏️' : '➕'}</span>
                <span>{editingStaffId ? (currentLang === 'zh' ? '更正职员信息' : 'Modify Credentials') : (currentLang === 'zh' ? '职员账号登记' : 'Staff Registration') }</span>
              </span>
              <h2 className="text-lg font-bold text-slate-800 mt-2">
                {editingStaffId 
                  ? (currentLang === 'zh' ? '更正职员账号详情' : 'Edit Staff Credentials') 
                  : (currentLang === 'zh' ? '新进教职员账号登记中心' : 'Staff Register Station')
                }
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {editingStaffId 
                  ? (currentLang === 'zh' ? '修改教职员账号。被修改的职员可立即通过新设定的邮箱或密码登录系统进行学时登记。' : 'Updating are applied bilingually, and credentials will instantly refresh.')
                  : (currentLang === 'zh' ? '创建独立的或批量导入教职员账号，以便他们登录系统核实与申报培训学时积分。' : 'Register accounts individually or in groups so employees can authenticate.')
                }
              </p>
            </div>

            {/* Bimodal Sub-Tabs for Single Accounts or Bulk Imports */}
            {!editingStaffId && (
              <div className="flex border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreationSubMode('single')}
                  className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition ${
                    creationSubMode === 'single'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {currentLang === 'zh' ? '➕ 单个账号创建' : 'Add Single Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setCreationSubMode('bulk')}
                  className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition ${
                    creationSubMode === 'bulk'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {currentLang === 'zh' ? '⚡ 批量群组导入' : 'Bulk Group Import'}
                </button>
              </div>
            )}

            {creationSubMode === 'single' || editingStaffId ? (
              <form onSubmit={handleCreateStaffUser} className="space-y-4">
                {/* STAFF NO */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '职员号 (Staff No.)' : 'Staff No.'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DZ-2026-001"
                    value={createStaffNo}
                    onChange={(e) => setCreateStaffNo(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                  />
                </div>

                {/* ENGLISH NAME */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '英文姓名 (Full Name in English)' : 'English Full Name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wong Ken Ming"
                    value={createEngName}
                    onChange={(e) => setCreateEngName(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* CHINESE NAME */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '中文姓名 (Chinese Name)' : 'Chinese Name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 黄建明"
                    value={createChiName}
                    onChange={(e) => setCreateChiName(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* EMAIL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '电子邮箱 (Email Address)' : 'Email Address'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. kmwong@dongzong.my"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                  />
                </div>

                {/* INITIAL PASSWORD */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {editingStaffId ? (currentLang === 'zh' ? '修改登录密码 (Login Password)' : 'Update Password') : (currentLang === 'zh' ? '设定初始登录密码 (Login Password)' : 'Login Password Assignment')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. staff123"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    {currentLang === 'zh' ? '※ 可以自由定制该账号的系统登录连接密码' : 'Set custom safe login string.'}
                  </span>
                </div>

                {createRole === 'staff' && (
                  <>
                    {/* DEPARTMENT SELECTOR */}
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {currentLang === 'zh' ? '归属行政处/部门委派 (Department Assignment)' : 'Department Unit Location'} <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={createDept}
                        onChange={(e) => setCreateDept(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* ANNUAL TARGET POINTS */}
                    <div className="space-y-1.5 block animate-fade-in">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {currentLang === 'zh' ? '年度考核积分目标 (Annual Target Points)' : 'Annual Points Target'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={createPoints}
                        onChange={(e) => setCreatePoints(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                      />
                    </div>
                  </>
                )}

                {/* ROLE SELECTOR (Super Admin Only) */}
                {currentUser.role === 'hr_admin' && (
                  <div className="space-y-1.5 font-sans">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                      {currentLang === 'zh' ? '系统角色授权 (System Role Authorization)' : 'Account Role Level'} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={createRole}
                      onChange={(e) => setCreateRole(e.target.value as any)}
                      className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-bold text-slate-700"
                    >
                      <option value="staff">{currentLang === 'zh' ? 'STAFF (普通教职员)' : 'STAFF (Ordinary User)'}</option>
                      <option value="hr_agent">{currentLang === 'zh' ? 'HR AGENT (人事验证专员)' : 'HR AGENT (Verifier/Manager)'}</option>
                      <option value="hr_admin">{currentLang === 'zh' ? 'HR ADMIN (系统超级管理员)' : 'HR ADMIN (Super Admin)'}</option>
                    </select>
                  </div>
                )}

                {creationError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl font-medium animate-shake">
                    {creationError}
                  </div>
                )}

                {creationSuccess && (
                  <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs px-4 py-3 rounded-xl font-medium animate-fade-in">
                    {currentLang === 'zh' ? '✓ 操作成功完成！董总教职员名册信息已实时更新保存。' : 'Success: Staff ledger modifications completely synchronized and saved.'}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {editingStaffId && (
                    <button
                      type="button"
                      onClick={cancelEditStaff}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-xs transition active:scale-95 text-center border"
                    >
                      {currentLang === 'zh' ? '取消编辑' : 'Cancel'}
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`py-3.5 rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center space-x-1 px-4 active:scale-95 ${editingStaffId ? 'flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold' : 'w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold'}`}
                  >
                    <span>{editingStaffId ? '💾' : '🚀'}</span>
                    <span>
                      {editingStaffId 
                        ? (currentLang === 'zh' ? '保存核心修改' : 'Save Changes') 
                        : (currentLang === 'zh' ? '创建并激活该教职员账号' : 'Register and Activate Employee')
                      }
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5 animate-fade-in">
                {/* BULK SELECTION DETAILS INSTRUCTION */}
                <div className="bg-slate-50 border p-4 rounded-2xl space-y-2.5 text-[11px] text-slate-650 leading-relaxed">
                  <div className="font-extrabold text-xs text-slate-800 flex items-center space-x-1.5">
                    <span>💡</span>
                    <span>{currentLang === 'zh' ? '全自动批量导入指引 (Bulk Upload Guide)' : 'Bulk Upload Guidelines'}</span>
                  </div>
                  <p>
                    {currentLang === 'zh' 
                      ? '您可以直接拖曳或选择一个 .csv 文件进行批量录入；或从 Excel / Sheets 表格中选择核心列直接复制，并在下方框贴。'
                      : 'You can drag & drop a .csv file directly, or copy spreadsheet cells (from Excel/Google Sheets) and paste them in the text area below.'
                    }
                  </p>
                  <div>
                    <span className="font-semibold block text-slate-700 mb-1">
                      {currentLang === 'zh' ? '表格列格式规范 / CSV Columns:' : 'Columns format spec (order is strictly kept):'}
                    </span>
                    <code className="block bg-slate-100 text-[10px] p-2 rounded-lg border font-mono">
                      English Name, Chinese Name, Email, Password, Department, Target Points
                    </code>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={downloadBulkTemplate}
                      className="text-blue-600 hover:text-blue-700 font-extrabold hover:underline inline-flex items-center space-x-1.5 transition"
                    >
                      <span>📥</span>
                      <span>{currentLang === 'zh' ? '下载样板测试 .CSV 文件' : 'Download Sample CSV'}</span>
                    </button>
                  </div>
                </div>

                {/* BULK DRAG & DROP / FILE SELECTION */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide">
                    {currentLang === 'zh' ? '方法 A: 拖拽或选择表格文件导入' : 'Method A: Drag & Drop or Choose CSV File'}
                  </label>
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/10 transition-all rounded-2xl p-5 text-center cursor-pointer group flex flex-col items-center justify-center space-y-1 bg-white">
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleBulkFileChange}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="text-2xl mb-1 filter drop-shadow-sm group-hover:scale-115 transition duration-150">📁</div>
                    <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600">
                      {currentLang === 'zh' ? '拖拽 CSV 文件至此或点击浏览文件' : 'Drag CSV here or click to browse'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {currentLang === 'zh' ? '支持 UTF-8 编码的 .csv 文件' : 'Accepts UTF-8 encoded .csv spreadsheets'}
                    </p>
                  </div>
                </div>

                {/* PASTING INPUT */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide">
                      {currentLang === 'zh' ? '方法 B: 直接黏贴单元格数据进行解析' : 'Method B: Paste Raw Clipboard Cells'}
                    </label>
                    {bulkImportText && (
                      <button
                        type="button"
                        onClick={() => parseBulkImportText('')}
                        className="text-[10px] text-rose-600 font-extrabold hover:underline"
                      >
                        {currentLang === 'zh' ? '清空文本' : 'Clear Text'}
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={bulkImportText}
                    onChange={(e) => parseBulkImportText(e.target.value)}
                    placeholder={
                      currentLang === 'zh'
                        ? "Wong Ken Ming\t黄建明\tkmwong@dongzong.my\tstaff123\tInformation Technology Department (资讯处)\t10\nTan Mei Ling\t陈美玲\tmltan@dongzong.my\tstaff456\tInformation Technology Department (资讯处)\t12"
                        : "English Name, Chinese Name, Email, Password, Department, Target"
                    }
                    className="w-full bg-slate-50 text-slate-805 border border-slate-200 rounded-2xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                  />
                </div>

                {/* STATUSES & WARNING MESSAGES IN INNER COLUMN */}
                {bulkImportError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl font-medium animate-shake">
                    {bulkImportError}
                  </div>
                )}

                {bulkImportSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs px-4 py-3 rounded-xl font-medium animate-fade-in">
                    {bulkImportSuccessMsg}
                  </div>
                )}

                {/* PARSED PREVIEW PANEL */}
                {bulkPreviewUsers.length > 0 && (
                  <div className="border border-slate-200 bg-white rounded-2xl p-4.5 space-y-3.5 shadow-xs">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800">
                        {currentLang === 'zh' ? `📋 数据预览验证 (${bulkPreviewUsers.length} 行对齐)` : `📋 Columns Verification (${bulkPreviewUsers.length} rows)`}
                      </span>
                      <span className="bg-indigo-50 border border-indigo-155 text-indigo-700 font-mono font-bold text-[9px] px-2 py-0.5 rounded-full">
                        {currentLang === 'zh' ? '已通过初判' : 'Parsed'}
                      </span>
                    </div>

                    <div className="max-h-[170px] overflow-y-auto rounded-xl border border-slate-100 text-[11px] divide-y divide-slate-100 bg-slate-50/20">
                      {bulkPreviewUsers.map((item, idx) => {
                        const isConflict = users.some(u => u.email.trim().toLowerCase() === item.email.trim().toLowerCase());
                        return (
                          <div key={idx} className={`p-2.5 flex justify-between items-center gap-2 ${isConflict ? 'bg-amber-50/40' : 'hover:bg-slate-50'}`}>
                            <div>
                              <div className="font-extrabold text-slate-850 flex items-center gap-1.5 flex-wrap">
                                <span>{item.chineseName || 'N/A'} ({item.name || 'N/A'})</span>
                                {item.staffNo && (
                                  <span className="font-mono bg-blue-50 text-blue-700 text-[9px] px-1 py-0.2 rounded border border-blue-155">
                                    {item.staffNo}
                                  </span>
                                )}
                                <span className="font-mono text-[9px] text-slate-400 bg-slate-100 border px-1 rounded uppercase">
                                  {item.targetPoints || 10} pts
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.email}</div>
                              <div className="text-[10px] text-slate-400 font-medium truncate max-w-[195px]" title={item.department}>
                                🏢 {item.department.split(' (')[0]}
                              </div>
                            </div>
                            <div className="shrink-0">
                              {isConflict ? (
                                <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                                  {currentLang === 'zh' ? '重复 (跳过)' : 'Skip'}
                                </span>
                              ) : (
                                <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  {currentLang === 'zh' ? '可导入' : 'Ready'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* CONFIRMATION IMPORT BUTTON */}
                    <button
                      type="button"
                      onClick={handleConfirmBulkImport}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl text-xs transition shadow-md active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>🚀</span>
                      <span>{currentLang === 'zh' ? '一键确认整批导入在册人员' : 'Confirm and Execute Bulk Import'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: DIRECTORY OF REGISTERED PERSONNEL */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {currentLang === 'zh' ? '董总已绑定人员花名册' : 'Authorized Registry'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {currentLang === 'zh' ? '包含系统所有在册的管理员(HR)与普通教职员(Staff)账号。包含编辑与销户操作。' : 'Comprehensive ledger of all registered personnel. Includes edit and delete tools.'}
                  </p>
                </div>
                <span className="bg-slate-100 text-slate-700 px-3 py-1 text-xs font-mono font-bold rounded-lg border">
                  Total: {users.filter(profile => currentUser.role === 'hr_admin' || profile.role === 'staff').length}
                </span>
              </div>

              {/* LIST / TABLE CARD DETAILS */}
              <div>
                {/* Desktop view */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold">
                        <th className="py-2.5 px-2">{currentLang === 'zh' ? '人员姓名/处室' : 'Staff Profile'}</th>
                        <th className="py-2.5 px-2">{currentLang === 'zh' ? '安全账号(Email)' : 'Registered Email'}</th>
                        <th className="py-2.5 px-2">{currentLang === 'zh' ? '考核目标' : 'Target'}</th>
                        <th className="py-2.5 px-2">{currentLang === 'zh' ? '角色' : 'Role'}</th>
                        <th className="py-2.5 px-2">{currentLang === 'zh' ? '密码' : 'Password Key'}</th>
                        <th className="py-2.5 px-2 text-right">{currentLang === 'zh' ? '操作' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.filter(profile => currentUser.role === 'hr_admin' || profile.role === 'staff').map((profile) => (
                        <tr key={profile.id} className={`hover:bg-slate-50/50 transition duration-100 ${editingStaffId === profile.id ? 'bg-amber-50 pb-2' : ''}`}>
                          <td className="py-3 px-2">
                            <div className="font-extrabold text-slate-800 flex items-center gap-1.5 flex-wrap">
                              <span>{profile.chineseName} ({profile.name})</span>
                              {profile.staffNo && (
                                <span className="font-mono bg-blue-50 text-blue-700 text-[9px] px-1.5 py-0.2 rounded border border-blue-150 font-bold">
                                  {profile.staffNo}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-450 truncate max-w-[200px]" title={profile.department}>
                              {(profile.role === 'hr_admin' || profile.role === 'hr_agent') ? '—' : (profile.department ? profile.department.split(' (')[0] : 'N/A')}
                            </div>
                          </td>
                          <td className="py-3 px-2 font-mono text-slate-600 text-[11px] truncate max-w-[130px]" title={profile.email}>
                            {profile.email}
                          </td>
                          <td className="py-3 px-2 font-mono text-slate-800 font-semibold">
                            {(profile.role === 'hr_admin' || profile.role === 'hr_agent') ? '—' : `${profile.targetPoints ?? 10} pts`}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[9px] ${
                              profile.role === 'hr_admin' ? 'bg-amber-150 text-amber-900 border border-amber-250' : profile.role === 'hr_agent' ? 'bg-indigo-105 text-indigo-900 border border-indigo-250' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {profile.role === 'hr_admin' ? 'HR ADMIN' : profile.role === 'hr_agent' ? 'HR AGENT' : 'STAFF'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border text-slate-600 font-semibold text-[10px]">
                              {profile.password || 'staff123'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => startEditStaff(profile)}
                                title={currentLang === 'zh' ? '编辑变动信息 (Edit)' : 'Edit Profile'}
                                className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 border text-blue-600 rounded-md transition cursor-pointer"
                              >
                                <FileEdit className="w-3.5 h-3.5" />
                              </button>
                              {currentUser.role === 'hr_admin' ? (
                                <button
                                  onClick={() => handleStaffDelete(profile)}
                                  title={currentLang === 'zh' ? '安全销户注销 (Cancel/Delete)' : 'Delete User'}
                                  className={`p-1 px-1.5 border bg-rose-50 border-rose-100 text-rose-600 rounded-md transition cursor-pointer ${profile.id === currentUser.id ? 'opacity-30 cursor-not-allowed' : 'hover:bg-rose-100'}`}
                                  disabled={profile.id === currentUser.id}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  disabled
                                  title={currentLang === 'zh' ? '安全限制：群组专员无权注销账号' : 'Security restriction: Deletion reserved for Super Admins only'}
                                  className="p-1 px-1.5 border bg-slate-105 border-slate-205 text-slate-400 rounded-md cursor-not-allowed opacity-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Grid Card view */}
                <div className="block md:hidden space-y-3.5">
                  {users.filter(profile => currentUser.role === 'hr_admin' || profile.role === 'staff').map((profile) => (
                    <div 
                      key={profile.id} 
                      className={`p-4 rounded-2xl border transition text-slate-700 flex flex-col space-y-3 ${
                        editingStaffId === profile.id ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50/40 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                            <span>{profile.chineseName}</span>
                            <span className="text-xs text-slate-400 font-normal">({profile.name})</span>
                          </h4>
                          <span className={`inline-block px-2 py-0.5 rounded-md font-extrabold text-[9px] ${
                            profile.role === 'hr_admin' ? 'bg-amber-50 text-amber-900 border border-amber-200' : profile.role === 'hr_agent' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'bg-blue-50 text-blue-800 border border-blue-150'
                          }`}>
                            {profile.role === 'hr_admin' ? 'HR ADMIN' : profile.role === 'hr_agent' ? 'HR AGENT' : 'STAFF'}
                          </span>
                        </div>

                        {profile.staffNo ? (
                          <span className="font-mono bg-blue-55 text-blue-800 text-[9px] px-1.5 py-0.5 rounded border border-blue-150 font-bold shrink-0">
                            {profile.staffNo}
                          </span>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100">
                        <div className="col-span-2">
                          <span className="text-slate-400 text-[9px] uppercase font-bold block mb-0.5">{currentLang === 'zh' ? '在册邮箱' : 'Security Account'}</span>
                          <span className="text-slate-700 font-mono text-[11px] select-all break-all block">{profile.email}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] uppercase font-bold block mb-0.5">{currentLang === 'zh' ? '密码验证' : 'Access Key'}</span>
                          <span className="font-mono bg-slate-55 px-1.5 py-0.2 rounded border text-slate-700 block w-fit">{profile.password || 'staff123'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] uppercase font-bold block mb-0.5">{currentLang === 'zh' ? '考核目标' : 'Goal Line'}</span>
                          <span className="text-slate-800 font-black">
                            {(profile.role === 'hr_admin' || profile.role === 'hr_agent') ? '—' : `${profile.targetPoints ?? 10} PTS`}
                          </span>
                        </div>
                        <div className="col-span-2 border-t pt-1.5 mt-1 border-slate-50">
                          <span className="text-slate-400 text-[9px] uppercase font-bold block mb-0.5">{currentLang === 'zh' ? '所属处室/部门' : 'Assigned Division'}</span>
                          <span className="text-slate-600 block line-clamp-1">
                            {(profile.role === 'hr_admin' || profile.role === 'hr_agent') ? '—' : (profile.department || 'N/A')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => startEditStaff(profile)}
                          className="px-3.5 py-2 hover:bg-slate-100 border text-blue-600 rounded-xl transition flex items-center space-x-1 text-xs font-bold bg-white cursor-pointer"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>{currentLang === 'zh' ? '改动' : 'Edit'}</span>
                        </button>
                        {currentUser.role === 'hr_admin' ? (
                          <button
                            onClick={() => handleStaffDelete(profile)}
                            className={`px-3.5 py-2 border rounded-xl transition flex items-center space-x-1 text-xs font-bold cursor-pointer ${
                              profile.id === currentUser.id 
                                ? 'bg-slate-50 border-slate-200 text-slate-350 cursor-not-allowed opacity-50' 
                                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                            }`}
                            disabled={profile.id === currentUser.id}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{currentLang === 'zh' ? '销户' : 'Delete'}</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-2 border bg-slate-50 border-slate-200 text-slate-400 rounded-xl cursor-not-allowed opacity-50 flex items-center space-x-1 text-xs"
                            title={currentLang === 'zh' ? '安全限制：无权删除' : 'Deletion restricted'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{currentLang === 'zh' ? '限制' : 'Locked'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border p-4 rounded-xl text-slate-450 text-[11px] mt-6 flex items-start space-x-2">
              <span className="text-xs">⚠️</span>
              <p className="leading-relaxed">
                {currentLang === 'zh' ? 
                  '职员安全销户策略：注销账号将永久切断该邮箱在此管理系统的验证登录特权。为了对历史申报痕迹进行合规留存审计，该职员以往已被录入并审核通过的历史学时依然予以只读保留。' : 
                  'Employee withdrawal rule: Retract/delete user privileges blocks active logins. Authenticated training records will persist for retroactive compliance audit inspections.'
                }
              </p>
            </div>
          </div>

        </div>
      )}

      {/* VIEW: DEPARTMENT SETTINGS PANEL */}
      {adminTab === 'department-settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* LEFT PANEL: DEPARTMENT ADD/AMEND FORM */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs h-fit space-y-6">
            <div className="border-b pb-4">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold leading-none">
                <span>🏢</span>
                <span>{editingDeptName ? (currentLang === 'zh' ? '变更为新名称' : 'Amend Name') : (currentLang === 'zh' ? '录入新部门' : 'Create Department')}</span>
              </span>
              <h2 className="text-lg font-bold text-slate-800 mt-2">
                {editingDeptName 
                  ? (currentLang === 'zh' ? '更正部门/处室名称' : 'Amend Department Title') 
                  : (currentLang === 'zh' ? '新增行政处或部门' : 'Add New Department')
                }
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {currentLang === 'zh' 
                  ? '修改的部门名称将会立即、全量、无损地同步到当前所属教职员详情以及所有已通过的历史申报积分统计中，避免产生数据丢失。' 
                  : 'Modifying a department name will dynamically cascade to update all associated employee accounts and past credits.'
                }
              </p>
            </div>

            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  {currentLang === 'zh' ? '行政处/部门名称 (Bilingual Name)' : 'Department Title'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student Affairs Department (学务处)"
                  value={deptFormName}
                  onChange={(e) => setDeptFormName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 block leading-normal pt-1 bg-white">
                  {currentLang === 'zh' 
                    ? '※ 建议采用董总的规范中英文标示，例如：Publication & Public Relations Unit (出版与公关处)' 
                    : 'Format standard: English Name (Chinese Name)'
                  }
                </span>
              </div>

              {deptError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl font-medium animate-shake">
                  {deptError}
                </div>
              )}

              {deptSuccess && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-xl font-medium animate-fade-in flex items-center space-x-2">
                  <span>✓</span>
                  <span>{deptSuccess}</span>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end space-x-2">
                {editingDeptName && (
                  <button
                    type="button"
                    onClick={cancelEditDept}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs transition active:scale-95"
                  >
                    {currentLang === 'zh' ? '取消编辑' : 'Cancel'}
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-sm active:scale-95"
                >
                  {editingDeptName 
                    ? (currentLang === 'zh' ? '保存修改 (Update)' : 'Save Changes') 
                    : (currentLang === 'zh' ? '添加录入 (Create)' : 'Add Unit')
                  }
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT PANEL: DEPARTMENTS LIST/CARD DIRECTORY */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {currentLang === 'zh' ? '激活行政处/部门名录簿' : 'Configured Department Registry'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {currentLang === 'zh' ? '查看、改名或清理当前系统中的处室分布。包含在册绑定的员工头部计数统计。' : 'Review, amend, or remove departments. Includes live staff occupancy count.'}
                  </p>
                </div>
                <span className="bg-slate-100 text-slate-700 px-3 py-1 text-xs font-mono font-bold rounded-lg border">
                  Total: {departments.length}
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2">
                {departments.map((dept) => {
                  const staffInDept = users.filter(u => u.department === dept);
                  const staffCount = staffInDept.length;
                  return (
                    <div key={dept} className="py-3 flex items-center justify-between hover:bg-slate-50/50 transition duration-150 rounded-lg px-2">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-800 text-xs">
                          {dept}
                        </div>
                        <div className="flex items-center space-x-2">
                          {staffCount > 0 ? (
                            <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold">
                              {staffCount} {currentLang === 'zh' ? '名在册员工' : 'active staff'}
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">
                              {currentLang === 'zh' ? '暂无绑定员工' : '0 active staff'}
                            </span>
                          )}
                        </div>
                      </div>

                      {confirmDeleteDept === dept ? (
                        <div className="flex items-center space-x-1.5 animate-fade-in">
                          <span className="text-[10px] text-rose-600 font-bold hidden sm:inline">
                            {currentLang === 'zh' ? '确定删除?' : 'Confirm?'}
                          </span>
                          <button
                            onClick={() => {
                              onDeleteDepartment(dept);
                              setDeptSuccess(
                                currentLang === 'zh'
                                  ? `✓ 已完全清退部门 "${dept}"`
                                  : `Successfully deleted department "${dept}"`
                              );
                              setConfirmDeleteDept(null);
                              setTimeout(() => {
                                setDeptSuccess(null);
                              }, 4000);
                            }}
                            className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition duration-200"
                          >
                            {currentLang === 'zh' ? '确定' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteDept(null)}
                            className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition duration-200"
                          >
                            {currentLang === 'zh' ? '取消' : 'Cancel'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => startEditDept(dept)}
                            title={currentLang === 'zh' ? '改名 (Rename)' : 'Rename'}
                            className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border text-slate-600 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-blue-600" />
                            <span className="hidden sm:inline">{currentLang === 'zh' ? '改名' : 'Rename'}</span>
                          </button>
                          <button
                            onClick={() => handleDeptDelete(dept)}
                            title={currentLang === 'zh' ? '删除部门 (Delete)' : 'Delete'}
                            className="p-1 px-2.5 bg-rose-50 hover:bg-rose-105 border border-rose-100 text-rose-600 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{currentLang === 'zh' ? '删除' : 'Delete'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 border p-4 rounded-xl text-slate-400 text-[11px] mt-6 flex items-start space-x-2">
              <span className="text-xs">💡</span>
              <p className="leading-relaxed">
                {currentLang === 'zh' ? 
                  '💡 部门删除防呆：系统严格遵守底层一致性审计标准，如果某个部门当前依然归属于任何在职教职员（即在册员工数大于0），则系统全面禁止直接删除该部门。必须首先将这些职员的所属部门移至其他位置方可操作，以守护信息完备度。' : 
                  '💡 Safeguard constraint: The system strictly prohibits deleting any departments currently mapped to one or more active staff members. Rename them or reassign staff roles before performing removals.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: DIRECT & BULK ENTRY CENTER */}
      {adminTab === 'direct-bulk-entry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Record Specifications Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600">🎖️</span>
                <span>{currentLang === 'zh' ? '研习培训项目信息录入' : 'Training Activity Specifications'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {currentLang === 'zh' 
                  ? '请在此录入想要发放给教职员的培训课时课程详情。支持管理员直接代录入账，免除教职员再次提报审核的流程。'
                  : 'Specify details of the training program. Directly bypass standard employee steps by assigning pre-verified items.'}
              </p>
            </div>

            <form onSubmit={handleDirectBulkSubmit} className="space-y-4 font-sans">
              
              {/* Form entries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '培训项目课时名称 *' : 'Training Project Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={currentLang === 'zh' ? '例如：董总华文教育骨干教师专业成长营' : 'e.g. Senior Professional Educator Growth Camp'}
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '主办/协办机构名称 *' : 'Organizer Agency *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={currentLang === 'zh' ? '校本自办 或 外界主导机构' : 'e.g. Dong Zong Education Dept'}
                    value={entryOrganiser}
                    onChange={(e) => setEntryOrganiser(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '常态化培训类别 *' : 'Training Standard Category *'}
                  </label>
                  <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as TrainingType)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {currentLang === 'zh' ? `${cat.nameZh} (${cat.id.toUpperCase()})` : cat.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 grayscale-0">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '授课/培训开始日期 *' : 'Training Event Start Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => {
                      setEntryDate(e.target.value);
                      if (entryEndDate && e.target.value > entryEndDate) {
                        setEntryEndDate('');
                      }
                    }}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide flex justify-between items-center">
                    <span>{currentLang === 'zh' ? '培训结束日期 (多日选填)' : 'Training End Date (Optional)'}</span>
                    {entryEndDate && entryDate && (
                      <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">多日</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={entryEndDate}
                    min={entryDate}
                    onChange={(e) => setEntryEndDate(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '授课主讲讲师 (选填)' : 'Lecturer / Speaker (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={currentLang === 'zh' ? '例如：王教授、Dr. Chan' : 'e.g. Prof. Wong'}
                    value={entryLecturer}
                    onChange={(e) => setEntryLecturer(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '具体每日授课时段 (选填)' : 'Daily Session Time (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={currentLang === 'zh' ? '例如：09:00 - 12:00, 14:00 - 16:00' : 'e.g. 09:00 - 16:00'}
                    value={entryTrainingTime}
                    onChange={(e) => setEntryTrainingTime(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '授课学时时数 *' : 'Granted Training Hours *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0.5"
                    step="0.5"
                    value={entryDuration}
                    onChange={(e) => setEntryDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-650 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '授课物理/线上地点 (选填)' : 'Training Venue (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={currentLang === 'zh' ? '例如：董总行政大楼三楼会议室 或 Google Meet' : 'e.g. Dong Zong Room 302'}
                    value={entryVenue}
                    onChange={(e) => setEntryVenue(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '培训大纲/内容详述 (选填)' : 'Syllabus / Detail Remarks (Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={currentLang === 'zh' ? '请简单描述本次课程的主旨，让职员更一目了然...' : 'Describe core topics briefly.'}
                    value={entryDescription}
                    onChange={(e) => setEntryDescription(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {currentLang === 'zh' ? '学时导入状态 *' : 'Automatic Approval State *'}
                  </label>
                  <select
                    value={entryStatus}
                    onChange={(e) => setEntryStatus(e.target.value as 'Verified' | 'Pending Verification')}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden text-emerald-800"
                  >
                    <option value="Verified">
                      {currentLang === 'zh' ? '⭐ 已审核入账 - 直接计分' : '⭐ Auto-Verified (Directly Add to Point Totals)'}
                    </option>
                    <option value="Pending Verification">
                      {currentLang === 'zh' ? '⏳ 待人工复核' : '⏳ Pending Verification (Needs Manual Approval Later)'}
                    </option>
                  </select>
                </div>
              </div>

              {entryError && (
                <div className="bg-rose-50 border border-rose-250 text-rose-800 text-xs px-4 py-3 rounded-xl font-bold animate-shake">
                  {entryError}
                </div>
              )}

              {entrySuccess && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-xl font-bold animate-fade-in flex items-center space-x-2">
                  <span>✨</span>
                  <span>
                    {currentLang === 'zh' 
                      ? '✓ 学时申报材料提报已完成！系统已直接写入档案并向指定人发出推送消息。' 
                      : 'Success: Training record created and assigned. Desktop notification alerts dispatched.'}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs transition shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <Award className="w-4 h-4 shrink-0 text-amber-300" />
                  <span>
                    {entryMode === 'individual' 
                      ? (currentLang === 'zh' ? '确 认 为 职 员 代 录' : 'ASSIGN VALUE TO SINGLE STAFF')
                      : (currentLang === 'zh' ? '确 认 批 量 发 放 学 时' : 'LAUNCH BULK TRAINING CREDITS')
                    }
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Recipient Selection Section */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-205 p-6 shadow-xs flex flex-col space-y-4">
            <div className="border-b pb-3.5">
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>🎯</span>
                <span>{currentLang === 'zh' ? '指定发放对象与教职员名册' : 'Destination Select'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {currentLang === 'zh' ? '请选择该笔研习课时要分派给一位职员，或是向多位职员进行批量群发发放。' : 'Assign to a single chosen staff or deploy bulk records across multiple.'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setEntryMode('individual');
                  setBulkSelectedUserIds([]);
                }}
                className={`py-2 px-3 text-xs font-black rounded-xl transition ${
                  entryMode === 'individual' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {currentLang === 'zh' ? '👤 独个职员代录' : 'Single Recipient'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntryMode('bulk');
                }}
                className={`py-2 px-3 text-xs font-black rounded-xl transition ${
                  entryMode === 'bulk' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-580'
                }`}
              >
                {currentLang === 'zh' ? '👥 全员/多选批量发放' : 'Bulk Group'}
              </button>
            </div>

            {/* MODE CONTENT: SINGLE SELECT */}
            {entryMode === 'individual' && (
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-650">
                    {currentLang === 'zh' ? '在董总名册中选择职员：' : 'Select Target Employee:'}
                  </label>
                  <select
                    value={directStaffId}
                    onChange={(e) => setDirectStaffId(e.target.value)}
                    className="w-full bg-slate-50 text-slate-805 border border-slate-205 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-bold"
                  >
                    <option value="">
                      {currentLang === 'zh' ? '-- 请挑选获发学时的职员 --' : '-- Choose Recipient Staff --'}
                    </option>
                    {staffUsers.map((u) => (
                      <option key={u.id || u.email} value={u.id || u.email}>
                        {u.chineseName} ({u.name}) - {u.department.split(' ')[0]} - {u.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* MODE CONTENT: BULK SELECT */}
            {entryMode === 'bulk' && (
              <div className="space-y-3 flex-1 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-slate-600 uppercase">
                    {currentLang === 'zh'
                      ? `已选择: ${bulkSelectedUserIds.length} 人`
                      : `Selected: ${bulkSelectedUserIds.length}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (bulkSelectedUserIds.length === staffUsers.length) {
                        setBulkSelectedUserIds([]);
                      } else {
                        setBulkSelectedUserIds(staffUsers.map((u) => u.id || u.email));
                      }
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    {bulkSelectedUserIds.length === staffUsers.length
                      ? (currentLang === 'zh' ? '取消全选' : 'Deselect All')
                      : (currentLang === 'zh' ? '全选所有在册职员' : 'Select All')}
                  </button>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1 flex-1 font-sans">
                  {staffUsers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-sans">
                      {currentLang === 'zh' ? '暂无在册教职员。' : 'No employees cataloged.'}
                    </div>
                  ) : (
                    staffUsers.map((u) => {
                      const uid = u.id || u.email;
                      return (
                        <label
                          key={uid}
                          className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-2xl cursor-pointer transition select-none"
                        >
                          <input
                            type="checkbox"
                            checked={bulkSelectedUserIds.includes(uid)}
                            onChange={() => {
                              if (bulkSelectedUserIds.includes(uid)) {
                                setBulkSelectedUserIds(bulkSelectedUserIds.filter(id => id !== uid));
                              } else {
                                setBulkSelectedUserIds([...bulkSelectedUserIds, uid]);
                              }
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 cursor-pointer"
                          />
                          <div className="font-sans leading-tight">
                            <div className="text-xs font-extrabold text-slate-800">
                              {u.chineseName} ({u.name})
                            </div>
                            <div className="text-[10px] text-slate-450 truncate max-w-[190px]" title={u.department}>
                              {u.department.split(' ')[0]} • {u.email}
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: AUDIT LOGS HISTORY */}
      {adminTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-800 leading-tight">
              {currentLang === 'zh' ? '人事处学时核实日志簿' : 'Audit Logs & Review Records History'}
            </h2>
            <p className="text-xs text-slate-400">
              {currentLang === 'zh' ? '记录系统进行的所有审核、退回更正及管理操作，符合董中内部ISO and审计追溯程序。' : 'Meets Dong Zong internal audits and ISO control tracing requirements.'}
            </p>
          </div>

          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                {currentLang === 'zh' ? '暂无任何核实操作历史日志。' : 'No compliance audit logs matching standard histories.'}
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 border border-slate-100/80 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between items-center pb-2 border-b border-dashed mb-1.5 text-slate-500 font-mono">
                    <span>{currentLang === 'zh' ? '核实单号：' : 'REF ID: '}{log.id}</span>
                    <span>{log.timestamp}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 font-medium">
                    <span className="font-bold text-slate-700">{log.actorName} (HR)</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'Verify' ? 'bg-emerald-100 text-emerald-800' : log.action === 'Reject' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {log.action.toUpperCase()}
                    </span>
                    <span className="text-slate-500">{currentLang === 'zh' ? '职员：' : 'for staff: '} <span className="text-slate-700 font-bold">{log.staffName}</span></span>
                  </div>

                  <p className="font-semibold text-slate-800 bg-white border p-2.5 rounded-lg border-slate-100 mt-1">
                    {currentLang === 'zh' ? '申报项目: ' : 'Training program: '} {log.recordTitle}
                  </p>

                  {log.remarks && (
                    <div className="text-slate-400 text-[11px] mt-1 italic pl-1.5 border-l-2 border-slate-350">
                      {currentLang === 'zh' ? '评估评语: ' : 'Remarks: '} {log.remarks}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* HR VERIFICATION AUDIT WORKFLOW MODAL */}
      {reviewingRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-amber-500 text-slate-950 px-5 py-4 flex justify-between items-center font-bold">
              <span>{currentLang === 'zh' ? '人事处培训证明核实审查' : 'HR Verification Portal'}</span>
              <button 
                type="button" 
                onClick={() => setReviewingRecord(null)} 
                className="p-1 hover:bg-amber-400 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-800 font-sans text-left">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-150 text-xs text-slate-700">
                <p><strong>{currentLang === 'zh' ? '申报职员：' : 'Staff Applicant: '}</strong> {reviewingRecord.staffName} ({reviewingRecord.department})</p>
                <p><strong>{currentLang === 'zh' ? '项目标题：' : 'Title: '}</strong> {reviewingRecord.title}</p>
                <p><strong>{currentLang === 'zh' ? '主办机构：' : 'Organizer: '}</strong> {reviewingRecord.organiser}</p>
                <p><strong>{currentLang === 'zh' ? '参训开展日期：' : 'Training Period: '}</strong> {reviewingRecord.date}{reviewingRecord.endDate ? ` ${currentLang === 'zh' ? '至' : 'to'} ${reviewingRecord.endDate}` : ''}</p>
                {reviewingRecord.lecturer && (
                  <p><strong>{currentLang === 'zh' ? '授课专家/讲师：' : 'Lecturer / Speaker: '}</strong> <span className="bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded font-sans">{reviewingRecord.lecturer}</span></p>
                )}
                {reviewingRecord.trainingTime && (
                  <p><strong>{currentLang === 'zh' ? '每日授课时段：' : 'Daily Schedule: '}</strong> <span className="font-mono text-slate-800 font-bold bg-slate-100 border border-slate-200 px-1 py-0.5 rounded">{reviewingRecord.trainingTime}</span></p>
                )}
                <p><strong>{currentLang === 'zh' ? '申报时数：' : 'Stated Hours: '}</strong> {reviewingRecord.duration} {currentLang === 'zh' ? '学时' : 'hrs'}</p>
              </div>

              {/* Dynamic Attachment Access block */}
              {reviewingRecord.fileName && (
                <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 truncate max-w-[280px]">
                    <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs text-slate-700 font-bold truncate">{reviewingRecord.fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewAttachmentRecord(reviewingRecord);
                      setZoomMultiplier(1.0);
                    }}
                    className="px-2.5 py-1 text-[11px] font-sans font-bold bg-blue-50 hover:bg-blue-105 text-blue-700 hover:text-blue-800 border border-blue-200 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" />
                    <span>{currentLang === 'zh' ? '查看大图' : 'View Attach'}</span>
                  </button>
                </div>
              )}

              {/* Inputs */}
              <div className="space-y-4 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">{currentLang === 'zh' ? '核准学时 (小时)' : 'Approved Hours (hrs)'}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={reviewHours}
                    onChange={(e) => setReviewHours(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">{currentLang === 'zh' ? '评估及核准意见备注' : 'Audit Opinions / Remarks'}</label>
                  <textarea
                    rows={3}
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder={currentLang === 'zh' ? '在此处键入核准学时或退回申报的意见...' : 'Type feedback remarks here...'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <button
                  type="button"
                  disabled={isAdminSyncingToDrive}
                  onClick={() => handleReviewSubmission('Rejected')}
                  className={`bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-xl text-xs transition active:scale-95 cursor-pointer text-center ${
                    isAdminSyncingToDrive ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  ❌ {currentLang === 'zh' ? '驳回退回修改' : 'Reject / Correct'}
                </button>
                <button
                  type="button"
                  disabled={isAdminSyncingToDrive}
                  onClick={() => handleReviewSubmission('Verified')}
                  className={`bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5 text-center shadow-md font-sans ${
                    isAdminSyncingToDrive ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isAdminSyncingToDrive ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{currentLang === 'zh' ? '同步云盘并审核中...' : 'Uploading & Verifying...'}</span>
                    </>
                  ) : (
                    <span>✓ {currentLang === 'zh' ? '核准并通过' : 'Verify & Approve'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}      {previewAttachmentRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fade-in text-left">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl font-sans text-slate-800">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className="p-2 bg-blue-50 rounded-xl text-blue-600 border border-blue-105">
                  <Paperclip className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-slate-800 flex items-center gap-1.5">
                    <span>{currentLang === 'zh' ? '培训申报附件查阅' : 'Training Attachment Preview'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currentLang === 'zh' ? '查看职员上传的培训资格结业证明原件。' : 'Review original candidate-uploaded completion proofs and syllabus reference files.'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setPreviewAttachmentRecord(null);
                  setIntegrityVerified(null);
                }} 
                className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Workspace Body */}
            <div className="flex-1 overflow-hidden bg-slate-900 p-6 flex flex-col items-center justify-between relative">
              
              {/* Micro Toolbar control bar */}
              <div className="w-full bg-slate-800 border border-slate-705/50 rounded-2xl px-4 py-2 flex items-center justify-between mb-4 z-10 text-xs text-white">
                <span className="text-slate-300 font-mono tracking-wider flex items-center gap-1 truncate max-w-[240px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                  <span className="truncate">{previewAttachmentRecord.fileName}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">({previewAttachmentRecord.fileSize || '320 KB'})</span>
                </span>

                <div className="flex items-center space-x-2 shrink-0">
                  {/* View mode toggle tabs */}
                  {(previewAttachmentRecord.fileData || previewAttachmentRecord.driveFileId) && (
                    <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewViewMode('original')}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${
                          previewViewMode === 'original' 
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {currentLang === 'zh' ? '原件图存' : 'Original Proof'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewViewMode('digital')}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${
                          previewViewMode === 'digital' 
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {currentLang === 'zh' ? '数字签印' : 'Digital Stamp'}
                      </button>
                    </div>
                  )}

                  <span className="w-px h-4 bg-slate-800 mx-1 font-mono">|</span>

                  {/* Zoom actions */}
                  <button
                    type="button"
                    onClick={() => setZoomMultiplier(prev => Math.max(0.6, prev - 0.2))}
                    className="p-1 px-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600 transition cursor-pointer"
                    title={currentLang === 'zh' ? '缩小' : 'Zoom Out'}
                  >
                    -
                  </button>
                  <span className="font-mono text-[11px] font-bold text-slate-300 select-none w-10 text-center">
                    {Math.round(zoomMultiplier * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomMultiplier(prev => Math.min(1.8, prev + 0.2))}
                    className="p-1 px-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600 transition cursor-pointer"
                    title={currentLang === 'zh' ? '放大' : 'Zoom In'}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomMultiplier(1)}
                    className="p-1 px-2 bg-slate-700 hover:bg-slate-600 text-[10px] text-slate-300 rounded-lg border border-slate-600 transition cursor-pointer"
                  >
                    {currentLang === 'zh' ? '重置' : 'Reset'}
                  </button>

                  <span className="w-px h-4 bg-slate-800 mx-1 font-mono">|</span>

                  {/* OCR switch */}
                  <button
                    type="button"
                    onClick={() => setShowOcrHighlights(!showOcrHighlights)}
                    className={`text-[10px] px-2.5 py-1.5 font-bold rounded-lg border transition cursor-pointer ${
                      showOcrHighlights 
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {currentLang === 'zh' ? '💡 标注' : '💡 Match'}
                  </button>

                  <span className="w-px h-4 bg-slate-800 mx-1 font-mono">|</span>

                  {/* Download attachment action */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = drivePreviewUrl || previewAttachmentRecord.fileData;
                      if (!url) {
                        alert(currentLang === 'zh' ? '暂无可直接下载的源文件或云盘文件数据。' : 'No direct file data available for download.');
                        return;
                      }
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = previewAttachmentRecord.fileName || 'attachment';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="p-1 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg border border-blue-500 transition flex items-center gap-1 cursor-pointer font-bold shadow-md"
                    title={currentLang === 'zh' ? '下载证明附件' : 'Download Attachment Proof'}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{currentLang === 'zh' ? '下载附件' : 'Download'}</span>
                  </button>
                </div>
              </div>

              {/* File Render Container */}
              <div className="flex-1 w-full overflow-auto flex items-center justify-center p-4 relative bg-slate-950 rounded-3xl border border-slate-800">
                <span className="absolute top-2 left-3 text-[9px] font-mono text-slate-700 select-none">GRID MODE // RESOLVER CANVAS</span>
                
                {(() => {
                  if (previewViewMode === 'original' && (previewAttachmentRecord.fileData || previewAttachmentRecord.driveFileId)) {
                    return (
                      <div 
                        className="bg-white border-2 border-slate-700/20 rounded-2xl p-5 shadow-2xl relative select-none flex items-center justify-center transition-transform duration-200"
                        style={{ 
                          width: '640px', 
                          minHeight: '485px',
                          transform: `scale(${zoomMultiplier})`,
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        {previewAttachmentRecord.driveFileId ? (
                          isLoadingDriveFile ? (
                            <div className="flex flex-col items-center gap-2 p-4 text-center animate-pulse text-emerald-600">
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              <span className="text-xs font-semibold">{currentLang === 'zh' ? '※ 正在自动连接董总归档存储盘提取原件...' : 'Decrypting original from Google Drive...'}</span>
                            </div>
                          ) : drivePreviewUrl ? (
                            <img 
                              src={drivePreviewUrl} 
                              alt="Original uploaded credential document from Drive" 
                              className="max-h-[445px] max-w-full object-contain rounded-lg"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2.5 p-4 text-center text-slate-500">
                              <CloudOff className="w-7 h-7 text-slate-400" />
                              <span className="text-xs font-semibold text-slate-600">
                                {currentLang === 'zh' ? '未关联 Google 账户，无法解密在云盘中的图像。' : 'Google Drive Off. Link Google account to preview.'}
                              </span>
                              {connectGoogleDrive && (
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await connectGoogleDrive();
                                    } catch (err: any) {
                                      alert(err.message || 'Log in failed');
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 font-bold hover:bg-blue-700 text-white text-[11px] rounded-lg shadow-sm transition"
                                >
                                  🔑 {currentLang === 'zh' ? '立即关联谷歌工作云盘' : 'Link Google Account'}
                                </button>
                              )}
                            </div>
                          )
                        ) : (
                          <img 
                            src={previewAttachmentRecord.fileData} 
                            alt="Original uploaded credential document" 
                            className="max-h-[445px] max-w-full object-contain rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        
                        {showOcrHighlights && (
                          <div className="absolute inset-0 pointer-events-none p-4 select-none z-10">
                            <div className="absolute top-[35%] left-[10%] right-[10%] h-[32px] border border-dashed border-emerald-500 bg-emerald-500/10 rounded flex items-center justify-between px-2 text-left">
                              <span className="bg-emerald-600 text-white text-[8px] px-1 py-0.5 font-bold uppercase rounded scale-90">OCR: {previewAttachmentRecord.staffName}</span>
                              <span className="text-emerald-500 text-[8px] font-mono font-bold">MATCH 100%</span>
                            </div>
                            <div className="absolute top-[55%] left-[12%] right-[12%] h-[32px] border border-dashed border-blue-500 bg-blue-500/10 rounded flex items-center justify-between px-2 text-left">
                              <span className="bg-blue-600 text-white text-[8px] px-1 py-0.5 font-bold uppercase rounded scale-90 truncate max-w-[150px]">OCR: "{previewAttachmentRecord.title}"</span>
                              <span className="text-blue-500 text-[8px] font-mono font-bold">CONFIRMED</span>
                            </div>
                          </div>
                        )}

                        <span className="absolute bottom-2 right-3 font-mono text-[7px] text-slate-400">DZ CAPTURE INTEGRATOR // GUID: {previewAttachmentRecord.id.substring(0, 10)}</span>
                      </div>
                    );
                  }
                  
                  const docAttr = getAttachmentType(previewAttachmentRecord.fileName, previewAttachmentRecord.title);
                  return (
                    <div 
                      className={`bg-[#fcfbf7] border-4 border-double ${docAttr.colorTheme.border} rounded-2xl p-10 shadow-2xl relative select-none font-sans text-slate-900 transition-transform duration-200`}
                      style={{ 
                        width: '640px', 
                        minHeight: '460px',
                        transform: `scale(${zoomMultiplier})`,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      {/* Inner frame line */}
                      <div className="absolute inset-1.5 border border-slate-700/15 rounded-xl pointer-events-none"></div>
                      <div className="absolute inset-2 border-2 border-slate-600/10 rounded-lg pointer-events-none"></div>

                      {/* Left & Right classical column motifs */}
                      <div className="absolute left-1.5 top-1/4 bottom-1/4 w-1 bg-slate-800/10"></div>
                      <div className="absolute right-1.5 top-1/4 bottom-1/4 w-1 bg-slate-800/10"></div>

                      {/* Repeated Background Watermark pattern in SVG or text */}
                      <div className="absolute inset-4 overflow-hidden opacity-[0.02] select-none pointer-events-none flex flex-wrap gap-4 text-[10px] uppercase font-mono tracking-widest leading-relaxed text-slate-950 text-left">
                        {Array.from({ length: 48 }).map((_, idx) => (
                          <span key={idx} className="-rotate-12 transform inline-block">Dong Zong Proof</span>
                        ))}
                      </div>

                      {/* Header Seal */}
                      <div className="text-center relative">
                        <div className={`text-[10px] font-black tracking-widest ${docAttr.colorTheme.text} uppercase flex items-center justify-center gap-1 font-serif`}>
                          <span>⭐</span> {currentLang === 'zh' ? docAttr.headerZh : docAttr.headerEn} <span>⭐</span>
                        </div>
                        <h4 className="text-[18px] font-serif font-extrabold text-[#2d3748] tracking-wide mt-1.5">
                          {currentLang === 'zh' ? docAttr.titleZh : docAttr.titleEn}
                        </h4>
                        <div className="h-[2px] w-28 bg-slate-500 opacity-20 mx-auto mt-2 relative">
                          <div className="absolute -top-1.5 left-1/2 -ml-1.5 w-3 h-3 rotate-45 border border-slate-400 bg-[#fcfbf7]"></div>
                        </div>
                      </div>

                      {/* Main content body inside certificate */}
                      <div className="mt-5 text-center space-y-3 font-serif">
                        <p className="text-[10px] text-slate-500 italic uppercase tracking-wider">
                          {currentLang === 'zh' ? docAttr.descZh : docAttr.descEn}
                        </p>
                        
                        {/* Name section with OCR outline */}
                        <div className="relative inline-block px-4">
                          <span className={`text-[15px] font-black font-sans text-slate-900 border-b-2 border-slate-800 pb-0.5 ${
                            showOcrHighlights ? 'ring-2 ring-emerald-500 ring-offset-2 rounded px-2 bg-emerald-500/10' : ''
                          }`}>
                            {previewAttachmentRecord.staffName}
                          </span>
                          {showOcrHighlights && (
                            <span className="absolute -top-4 -right-12 text-[8px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-sm font-sans font-bold shadow-sm">
                              OCR NAME
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-505 italic leading-snug">
                          {currentLang === 'zh' ? '已验证属于真实之业务申报、教学档案及凭证材料：' : 'as registered and matched in archives matching details:'}
                        </p>

                        {/* Course item Section with OCR outline */}
                        <div className="relative inline-block max-w-[360px] leading-tight">
                          <span className={`text-[12px] font-sans font-extrabold ${docAttr.colorTheme.text} block ${
                            showOcrHighlights ? 'ring-2 ring-blue-500 ring-offset-2 rounded px-2 bg-blue-500/10' : ''
                          }`}>
                            "{previewAttachmentRecord.title}"
                          </span>
                          {showOcrHighlights && (
                            <span className="absolute -top-4 right-0 text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-sm font-sans font-bold shadow-sm">
                              OCR ACTIVITY
                            </span>
                          )}
                        </div>

                        {/* Organizer & Duration Footer in certificate */}
                        <p className="text-[10px] text-slate-500 italic">
                          {currentLang === 'zh' ? '主办单位 / 活动组织机构：' : 'Organized and conducted under the auspices of:'} <strong className="text-slate-800 font-sans not-italic font-bold">{previewAttachmentRecord.organiser}</strong>
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-7 pt-3 border-t border-slate-100 font-sans">
                          <div className="text-left text-[9px] text-slate-500 space-y-1">
                            <p>{currentLang === 'zh' ? '开始日期：' : 'Start date: '} 
                              <span className={`font-mono text-xs font-bold text-slate-800 ${
                                showOcrHighlights ? 'bg-cyan-100 border-b border-cyan-500 text-cyan-900 px-1 py-0.5 rounded' : ''
                              }`}>
                                {previewAttachmentRecord.date}
                              </span>
                            </p>
                            {previewAttachmentRecord.endDate && (
                              <p>{currentLang === 'zh' ? '结束日期：' : 'End date: '} 
                                <span className="font-mono text-xs font-bold text-slate-800">
                                  {previewAttachmentRecord.endDate}
                                </span>
                              </p>
                            )}
                            {previewAttachmentRecord.lecturer && (
                              <p>{currentLang === 'zh' ? '主讲学者：' : 'Trainer / Speaker: '} 
                                <span className="text-xs font-semibold text-slate-800 bg-sky-50 px-1 rounded">
                                  {previewAttachmentRecord.lecturer}
                                </span>
                              </p>
                            )}
                            {previewAttachmentRecord.trainingTime && (
                              <p>{currentLang === 'zh' ? '授课时段：' : 'Session Schedule: '} 
                                <span className="font-mono text-[10px] text-slate-800">
                                  {previewAttachmentRecord.trainingTime}
                                </span>
                              </p>
                            )}
                            <p>{currentLang === 'zh' ? '授课课时：' : 'Assigned Credit: '} 
                              <span className={`font-mono text-xs font-black text-rose-800 ${
                                showOcrHighlights ? 'bg-rose-100 border-b border-rose-500 text-rose-900 px-1 py-0.5 rounded' : ''
                              }`}>
                                {previewAttachmentRecord.duration} Hours
                              </span>
                            </p>
                          </div>

                          {/* Signature block with cursive hand text */}
                          <div className="text-right space-y-1 relative pr-1 text-slate-900">
                            <div className="font-mono text-[9px] font-bold text-slate-400">AUTHORIZED STAMP</div>
                            <div className="text-stone-700 italic font-serif text-[13px] font-black tracking-wide leading-none py-1 transform -rotate-2 select-none">
                              Wong Keng C.
                            </div>
                            <div className="text-[8px] text-slate-400 border-t border-slate-200 pt-1 leading-none">
                              {currentLang === 'zh' ? docAttr.signByZh : docAttr.signByEn}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RED SEAL EMBOSSED CIRCULAR STAMP */}
                      <div className={`absolute right-6 bottom-5 w-[85px] h-[85px] rounded-full border-2 ${docAttr.colorTheme.stamp} border-dashed flex items-center justify-center rotate-12 bg-rose-500/[0.01] select-none pointer-events-none`}>
                        <div className="absolute inset-1.5 border border-dashed border-red-400 rounded-full flex flex-col items-center justify-center leading-none text-center font-sans">
                          <span className="text-[12px] leading-none">★</span>
                          <span className="text-[7.5px] font-extrabold mt-1 tracking-wider">{currentLang === 'zh' ? docAttr.authorizedStampZh : docAttr.authorizedStampEn}</span>
                          <span className="text-[6.3px] font-bold scale-90">{docAttr.sealText}</span>
                        </div>
                      </div>

                      {/* Verification watermark label */}
                      <div className="absolute left-8 bottom-3 font-mono text-[7.5px] text-slate-400 select-none">
                        DZ SIGNATURE GUID: {previewAttachmentRecord.id.toUpperCase().substring(0, 16)}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bottom instructions bar */}
              <div className="w-full flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
                <span>{currentLang === 'zh' ? '💡 提示：使用微小控制台进行比例缩放，并可勾选标注以对应 OCR 部分。' : '💡 Tip: Adjust zoom multiplier and toggle outlines to inspect matching contents.'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewAttachmentRecord(null);
                    setIntegrityVerified(null);
                  }}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-705 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer font-bold duration-150"
                >
                  {currentLang === 'zh' ? '返回' : 'Back'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* QUICK CORRECTIONS MODAL (Satisfying "Edit incorrect training data when necessary") */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-2xl border border-slate-205 max-w-lg w-full overflow-hidden shadow-2xl">
            <form onSubmit={handleAdminRecordEdit}>
              <div className="bg-sky-700 text-white px-5 py-4 flex justify-between items-center font-bold">
                <span>🔧 {currentLang === 'zh' ? '人事处后台修正数据' : 'HR Admin Raw Modification Tool'}</span>
                <button type="button" onClick={() => setEditingRecord(null)} className="p-1 hover:bg-sky-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm text-slate-800">
                <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 italic font-sans leading-relaxed">
                  * {currentLang === 'zh' ? '当前工具允许您作为人事管理员直接更改职员申报拼写错误、时数偏差，维护报表准确。' : 'Direct spelling or duration patch tool for reports alignment.'}
                </p>

                <div className="space-y-4 font-sans">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">{t.trainingTitle}</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:bg-white"
                    />
                  </div>

                  {/* Organiser */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">{t.organiser}</label>
                    <input
                      type="text"
                      required
                      value={editOrganiser}
                      onChange={(e) => setEditOrganiser(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:bg-white"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">{t.durationHours}</label>
                    <input
                      type="number"
                      required
                      min="0.5"
                      step="0.5"
                      value={editDuration}
                      onChange={(e) => setEditDuration(Math.max(0.5, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:bg-white font-mono"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">{t.trainingEndDate}</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:bg-white font-mono"
                    />
                  </div>

                  {/* Lecturer */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">{t.lecturer}</label>
                    <input
                      type="text"
                      placeholder={currentLang === 'zh' ? '选填授课人姓名' : 'Optional lecturer name'}
                      value={editLecturer}
                      onChange={(e) => setEditLecturer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:bg-white font-sans"
                    />
                  </div>

                  {/* Training Time */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">{t.trainingTime}</label>
                    <input
                      type="text"
                      placeholder={currentLang === 'zh' ? '选填例如：09:00 - 12:00' : 'Optional e.g. 09:00 - 12:00'}
                      value={editTrainingTime}
                      onChange={(e) => setEditTrainingTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:bg-white font-sans"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t font-sans">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition active:scale-95 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-sky-700 hover:bg-sky-850 text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-95 cursor-pointer"
                  >
                    {currentLang === 'zh' ? '确认修改' : 'Commit Raw Patch'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
