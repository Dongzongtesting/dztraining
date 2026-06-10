import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StaffDashboard } from './components/StaffDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AnnouncementManager } from './components/AnnouncementManager';
import { PolicyManager } from './components/PolicyManager';
import { ReportsManager } from './components/ReportsManager';
import { Login } from './components/Login';
import { 
  initGoogleAuth, subscribeToGoogleAuth, connectGoogleDrive, disconnectGoogleDrive 
} from './lib/googleDrive';

import { Language, TRANSLATIONS } from './translations';
import { 
  User, TrainingRecord, TrainingAnnouncement, PolicySection, PointRule, AuditLog, AppNotification 
} from './types';

import { 
  INITIAL_USERS, INITIAL_RECORDS, INITIAL_ANNOUNCEMENTS, 
  INITIAL_POLICIES, INITIAL_POI_RULES, DEPARTMENTS
} from './initialData';

import { 
  Award, Clock, CheckCircle, HelpCircle, Layers, 
  BookOpen, Megaphone, BarChart4, ClipboardList 
} from 'lucide-react';

export default function App() {
  // Locale Languages and impersonator active user states
  const [currentLang, setLang] = useState<Language>('zh'); // Bilingual Chinese default for Dong Zong
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Start on Login Gate
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [departments, setDepartments] = useState<string[]>([]);

  // Security and access gates state values
  const [adminPassword, setAdminPassword] = useState<string>('admin123');
  const [pendingSwitchUser, setPendingSwitchUser] = useState<User | null>(null);
  const [enteredGatePassword, setEnteredGatePassword] = useState<string>('');
  const [gateError, setGateError] = useState<string | null>(null);

  // Core synchronized persistent database states
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [announcements, setAnnouncements] = useState<TrainingAnnouncement[]>([]);
  const [policies, setPolicies] = useState<PolicySection[]>([]);
  const [pointRule, setPointRule] = useState<PointRule>(INITIAL_POI_RULES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Navigation state (Default active sub-tab)
  const [activeNav, setActiveNav] = useState<'dashboard' | 'announcements' | 'policy' | 'reports'>('dashboard');

  // Google OAuth Drive Integration states
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Initialize and subscribe to Google Authentication
  useEffect(() => {
    const unsubscribeAuth = initGoogleAuth();
    const unsubscribeSub = subscribeToGoogleAuth((user, token) => {
      setGoogleUser(user);
      setGoogleToken(token);
    });
    return () => {
      unsubscribeAuth();
      unsubscribeSub();
    };
  }, []);

  // Load from LocalStorage or fallback to INITIALS on Mount
  useEffect(() => {
    try {
      const cachedRecords = localStorage.getItem('dz_records');
      const cachedAnnouncements = localStorage.getItem('dz_announcements');
      const cachedPolicies = localStorage.getItem('dz_policies');
      const cachedRule = localStorage.getItem('dz_rule');
      const cachedLogs = localStorage.getItem('dz_logs');
      const cachedPassword = localStorage.getItem('dz_admin_password');
      const cachedUsers = localStorage.getItem('dz_users');
      const cachedActiveUser = sessionStorage.getItem('dz_active_user') || localStorage.getItem('dz_active_user');

      if (cachedRecords) setRecords(JSON.parse(cachedRecords));
      else setRecords(INITIAL_RECORDS);

      if (cachedAnnouncements) setAnnouncements(JSON.parse(cachedAnnouncements));
      else setAnnouncements(INITIAL_ANNOUNCEMENTS);

      if (cachedPolicies) setPolicies(JSON.parse(cachedPolicies));
      else setPolicies(INITIAL_POLICIES);

      if (cachedRule) setPointRule(JSON.parse(cachedRule));
      else setPointRule(INITIAL_POI_RULES);

      if (cachedLogs) setAuditLogs(JSON.parse(cachedLogs));
      else setAuditLogs([]);

      const cachedNotifications = localStorage.getItem('dz_notifications');
      if (cachedNotifications) setNotifications(JSON.parse(cachedNotifications));
      else setNotifications([]);

      if (cachedPassword) setAdminPassword(cachedPassword);
      else setAdminPassword('admin123');

      let finalUsers: User[] = [];
      if (cachedUsers) {
        const parsed: User[] = JSON.parse(cachedUsers);
        // Map legacy role 'hr' -> 'hr_admin' or correct details
        const corrected = parsed.map(u => {
          let updated = { ...u };
          // If the role is the obsolete 'hr' string, upgrade to hr_admin
          if (updated.role === 'hr' as any) {
            updated.role = 'hr_admin';
          }
          if (updated.id === 'hr-1') {
            updated.role = 'hr_admin';
            updated.name = 'HR Admin';
            updated.chineseName = '人事处处长';
            updated.email = 'ymlow@dongzong.my';
            updated.password = 'admin123';
          }
          return updated;
        });

        // Ensure all INITIAL_USERS are present (including new hr-2 agent/validator)
        INITIAL_USERS.forEach(initU => {
          if (!corrected.some(u => u.id === initU.id)) {
            corrected.push(initU);
          }
        });

        finalUsers = corrected;
        setUsers(corrected);
        localStorage.setItem('dz_users', JSON.stringify(corrected));
      } else {
        finalUsers = INITIAL_USERS;
        setUsers(INITIAL_USERS);
      }

      const cachedDepts = localStorage.getItem('dz_departments');
      if (cachedDepts) setDepartments(JSON.parse(cachedDepts));
      else {
        setDepartments(DEPARTMENTS);
        localStorage.setItem('dz_departments', JSON.stringify(DEPARTMENTS));
      }

      if (cachedActiveUser) {
        let active = JSON.parse(cachedActiveUser);
        // Correct the active user details
        if (active.role === 'hr' as any) {
          active.role = 'hr_admin';
        }
        if (active.id === 'hr-1') {
          active.role = 'hr_admin';
          active.name = 'HR Admin';
          active.chineseName = '人事处处长';
          active.email = 'ymlow@dongzong.my';
        } else if (active.id === 'hr-2') {
          active.role = 'hr_agent';
          active.name = 'HR Agent - Chan';
          active.chineseName = '曾德华';
          active.email = 'dhchan@dongzong.my';
        }

        // Align active session details with the migrated user registry record
        const matchingDbUser = finalUsers.find(u => u.id === active.id);
        if (matchingDbUser) {
          active = { ...matchingDbUser };
        }

        sessionStorage.setItem('dz_active_user', JSON.stringify(active));
        localStorage.setItem('dz_active_user', JSON.stringify(active));
        setCurrentUser(active);
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      console.warn("Could not load stored data:", e);
      // fallback
      setRecords(INITIAL_RECORDS);
      setAnnouncements(INITIAL_ANNOUNCEMENTS);
      setPolicies(INITIAL_POLICIES);
      setPointRule(INITIAL_POI_RULES);
      setDepartments(DEPARTMENTS);
      setAuditLogs([]);
      setAdminPassword('admin123');
      setUsers(INITIAL_USERS);
      setCurrentUser(null);
    }
  }, []);

  // Listen for storage events to synchronize database state in real-time across concurrent browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      try {
        if (e.key === 'dz_records' && e.newValue) {
          setRecords(JSON.parse(e.newValue));
        }
        else if (e.key === 'dz_users' && e.newValue) {
          const parsedUsers = JSON.parse(e.newValue);
          setUsers(parsedUsers);
          // If our current user's profile got updated in another tab, refresh it
          if (currentUser) {
            const upToDate = parsedUsers.find((u: User) => u.id === currentUser.id);
            if (upToDate && JSON.stringify(upToDate) !== JSON.stringify(currentUser)) {
              setCurrentUser(upToDate);
              sessionStorage.setItem('dz_active_user', JSON.stringify(upToDate));
            }
          }
        }
        else if (e.key === 'dz_departments' && e.newValue) {
          setDepartments(JSON.parse(e.newValue));
        }
        else if (e.key === 'dz_announcements' && e.newValue) {
          setAnnouncements(JSON.parse(e.newValue));
        }
        else if (e.key === 'dz_policies' && e.newValue) {
          setPolicies(JSON.parse(e.newValue));
        }
        else if (e.key === 'dz_rule' && e.newValue) {
          setPointRule(JSON.parse(e.newValue));
        }
        else if (e.key === 'dz_logs' && e.newValue) {
          setAuditLogs(JSON.parse(e.newValue));
        }
        else if (e.key === 'dz_notifications' && e.newValue) {
          setNotifications(JSON.parse(e.newValue));
        }
        else if (e.key === 'dz_admin_password' && e.newValue) {
          setAdminPassword(e.newValue);
        }
      } catch (err) {
        console.warn("Storage sync failed:", err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser]);

  // Save to LocalStorage/SessionStorage whenever state modifies
  const saveState = (key: string, data: any) => {
    try {
      if (key === 'dz_active_user') {
        sessionStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem(key, JSON.stringify(data));
      } else {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.error(`Save to storage failed for ${key}:`, e);
    }
  };

  // Switcher callback for testing multiple profiles
  const handleChangeUser = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      if (selectedUser.role === 'hr_admin' || selectedUser.role === 'hr_agent') {
        if (currentUser && currentUser.id === selectedUser.id) return;
        setPendingSwitchUser(selectedUser);
        setEnteredGatePassword('');
        setGateError(null);
      } else {
        setCurrentUser(selectedUser);
        saveState('dz_active_user', selectedUser);
        if (activeNav === 'reports') {
          setActiveNav('dashboard');
        }
      }
    }
  };

  const handleVerifyGatePassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (enteredGatePassword === adminPassword) {
      if (pendingSwitchUser) {
        setCurrentUser(pendingSwitchUser);
        saveState('dz_active_user', pendingSwitchUser);
        setPendingSwitchUser(null);
        setEnteredGatePassword('');
        setGateError(null);
      }
    } else {
      setGateError(currentLang === 'zh' ? '※ 管理员验证密码不正确，请重试或向人事主管查询！' : 'Invalid administrator passcode. Please try again or consult with your unit head.');
    }
  };

  const handleUpdateAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    saveState('dz_admin_password', newPass);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveState('dz_active_user', user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dz_active_user');
    sessionStorage.removeItem('dz_active_user');
  };

  const handleAddStaffAccount = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveState('dz_users', updatedUsers);
  };

  const handleUpdateStaffAccount = (id: string, updatedUser: User) => {
    const updated = users.map(u => u.id === id ? updatedUser : u);
    setUsers(updated);
    saveState('dz_users', updated);

    // If current logged-in user is updated, refresh their state
    if (currentUser && currentUser.id === id) {
      setCurrentUser(updatedUser);
      saveState('dz_active_user', updatedUser);
    }
  };

  const handleDeleteStaffAccount = (id: string) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    saveState('dz_users', updated);
  };

  const handleAddDepartment = (newDept: string) => {
    const updated = [...departments, newDept];
    setDepartments(updated);
    saveState('dz_departments', updated);

    // Audit Log for creating a department
    const log: AuditLog = {
      id: `audit-dept-add-${Date.now()}`,
      recordId: 'N/A',
      recordTitle: `Created: ${newDept}`,
      staffName: 'System Core',
      action: 'Manage Departments' as any,
      actorName: currentUser?.name || 'HR Admin',
      timestamp: new Date().toLocaleString(),
      remarks: `New administrative unit entered: "${newDept}"`
    };
    const updatedLogs = [log, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveState('dz_logs', updatedLogs);
  };

  const handleUpdateDepartment = (oldDeptName: string, newDeptName: string) => {
    const updated = departments.map(d => d === oldDeptName ? newDeptName : d);
    setDepartments(updated);
    saveState('dz_departments', updated);

    // Dynamic cascade updates to user rosters
    const updatedUsers = users.map(u => u.department === oldDeptName ? { ...u, department: newDeptName } : u);
    setUsers(updatedUsers);
    saveState('dz_users', updatedUsers);

    // Dynamic cascade updates to history records
    const updatedRecords = records.map(r => r.department === oldDeptName ? { ...r, department: newDeptName } : r);
    setRecords(updatedRecords);
    saveState('dz_records', updatedRecords);

    // Hot session reload if current session is part of this department
    if (currentUser && currentUser.department === oldDeptName) {
      const updatedCurr = { ...currentUser, department: newDeptName };
      setCurrentUser(updatedCurr);
      saveState('dz_active_user', updatedCurr);
    }

    // Audit Log for renaming a department
    const log: AuditLog = {
      id: `audit-dept-edit-${Date.now()}`,
      recordId: 'N/A',
      recordTitle: `Renamed: ${oldDeptName} -> ${newDeptName}`,
      staffName: 'System Core',
      action: 'Manage Departments' as any,
      actorName: currentUser?.name || 'HR Admin',
      timestamp: new Date().toLocaleString(),
      remarks: `Averaged department re-tagged. Successfully updated related user logins and prior verified entries.`
    };
    const updatedLogs = [log, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveState('dz_logs', updatedLogs);
  };

  const handleDeleteDepartment = (deptName: string) => {
    const updated = departments.filter(d => d !== deptName);
    setDepartments(updated);
    saveState('dz_departments', updated);

    // Audit Log for removing a department
    const log: AuditLog = {
      id: `audit-dept-del-${Date.now()}`,
      recordId: 'N/A',
      recordTitle: `Deleted: ${deptName}`,
      staffName: 'System Core',
      action: 'Manage Departments' as any,
      actorName: currentUser?.name || 'HR Admin',
      timestamp: new Date().toLocaleString(),
      remarks: `Department unit permanently cleared from HR active directory registries.`
    };
    const updatedLogs = [log, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveState('dz_logs', updatedLogs);
  };

  // --- ACTIONS: STAFF ---
  const handleAddOrEditRecord = (
    newRecord: Omit<TrainingRecord, 'id' | 'staffName' | 'staffEmail' | 'department' | 'submissionDate'> & { id?: string; driveFileId?: string; driveFileUrl?: string }
  ) => {
    if (newRecord.id) {
      // EDIT existing
      const updated = records.map(r => {
        if (r.id === newRecord.id) {
          return {
            ...r,
            title: newRecord.title,
            organiser: newRecord.organiser,
            type: newRecord.type,
            date: newRecord.date,
            endDate: newRecord.endDate,
            duration: newRecord.duration,
            venue: newRecord.venue,
            description: newRecord.description,
            lecturer: newRecord.lecturer,
            trainingTime: newRecord.trainingTime,
            fileName: newRecord.fileName || r.fileName,
            fileSize: newRecord.fileSize || r.fileSize,
            fileData: newRecord.fileData !== undefined ? newRecord.fileData : r.fileData,
            driveFileId: newRecord.driveFileId !== undefined ? newRecord.driveFileId : r.driveFileId,
            driveFileUrl: newRecord.driveFileUrl !== undefined ? newRecord.driveFileUrl : r.driveFileUrl,
            status: 'Pending Verification' as const // reset to pending on any update
          };
        }
        return r;
      });
      setRecords(updated);
      saveState('dz_records', updated);
    } else {
      // CREATE brand new
      const recordToAdd: TrainingRecord = {
        id: `rec-${Date.now()}`,
        staffName: currentUser.name,
        staffEmail: currentUser.email,
        department: currentUser.department,
        title: newRecord.title,
        organiser: newRecord.organiser,
        type: newRecord.type,
        date: newRecord.date,
        endDate: newRecord.endDate,
        duration: newRecord.duration,
        venue: newRecord.venue,
        description: newRecord.description,
        lecturer: newRecord.lecturer,
        trainingTime: newRecord.trainingTime,
        fileName: newRecord.fileName || 'credential_certificate.pdf',
        fileSize: newRecord.fileSize || '380 KB',
        fileData: newRecord.fileData,
        driveFileId: newRecord.driveFileId,
        driveFileUrl: newRecord.driveFileUrl,
        submissionDate: new Date().toISOString().split('T')[0],
        status: 'Pending Verification'
      };
      const updated = [recordToAdd, ...records];
      setRecords(updated);
      saveState('dz_records', updated);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const filtered = records.filter(r => r.id !== id);
    setRecords(filtered);
    saveState('dz_records', filtered);
  };

  // --- ACTIONS: HR ADMIN VERIFICATION ---
  const handleVerifyRecord = (
    id: string, 
    status: 'Verified' | 'Rejected', 
    remarks: string,
    adjustedHours?: number,
    driveFileId?: string,
    driveFileUrl?: string
  ) => {
    // Audit actions
    const oldRecord = records.find(r => r.id === id);
    if (!oldRecord) return;

    const actionText = status === 'Verified' ? 'Verify' : 'Reject';

    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      recordId: id,
      recordTitle: oldRecord.title,
      staffName: oldRecord.staffName,
      action: actionText as any,
      actorName: currentUser.name,
      timestamp: new Date().toLocaleString(),
      remarks
    };

    const updatedLogs = [log, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveState('dz_logs', updatedLogs);

    // Create an AppNotification to instantly alert the staff member
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userEmail: oldRecord.staffEmail,
      titleZh: status === 'Rejected' ? '❌ 申报审核未通过（学时申请已退回）' : '✅ 申报学时已被通过入账！',
      titleEn: status === 'Rejected' ? '❌ Submission Rejected (Returned for Correction)' : '✅ Submission Approved and Verified!',
      messageZh: status === 'Rejected' 
        ? `您的培训学时申请《${oldRecord.title}》已被管理员退回。审查意见：${remarks || '无，请核对信息重新提报。'}`
        : `您的培训学时申请《${oldRecord.title}》已被管理员审核通过。`,
      messageEn: status === 'Rejected' 
        ? `Your claim for "${oldRecord.title}" was returned by the HR Admin. Remarks: "${remarks || 'None. Please check description.'}"`
        : `Your claim for "${oldRecord.title}" was verified and approved by the HR Admin.`,
      recordId: id,
      recordTitle: oldRecord.title,
      timestamp: new Date().toLocaleString(),
      isRead: false,
      type: status === 'Rejected' ? 'rejected' : 'verified'
    };

    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);
    saveState('dz_notifications', updatedNotifications);

    const updatedRecords = records.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: status === 'Verified' ? 'Verified' as const : 'Rejected' as const,
          remarks,
          duration: adjustedHours !== undefined ? adjustedHours : r.duration,
          driveFileId: driveFileId !== undefined ? driveFileId : r.driveFileId,
          driveFileUrl: driveFileUrl !== undefined ? driveFileUrl : r.driveFileUrl
        };
      }
      return r;
    });

    setRecords(updatedRecords);
    saveState('dz_records', updatedRecords);
  };

  const handleMarkNotificationsRead = (email: string) => {
    const updated = notifications.map(n => n.userEmail.toLowerCase() === email.toLowerCase() ? { ...n, isRead: true } : n);
    setNotifications(updated);
    saveState('dz_notifications', updated);
  };

  const handleClearNotifications = (email: string) => {
    const updated = notifications.filter(n => n.userEmail.toLowerCase() !== email.toLowerCase());
    setNotifications(updated);
    saveState('dz_notifications', updated);
  };

  // Direct edit incorrect training data by Admin when necessary
  const handleEditRecordByAdmin = (id: string, updatedFields: Partial<TrainingRecord>) => {
    const oldRecord = records.find(r => r.id === id);
    if (!oldRecord) return;

    const log: AuditLog = {
      id: `audit-edit-${Date.now()}`,
      recordId: id,
      recordTitle: updatedFields.title || oldRecord.title,
      staffName: oldRecord.staffName,
      action: 'Edit Data',
      actorName: currentUser.currentUser?.name || currentUser.name,
      timestamp: new Date().toLocaleString(),
      remarks: `Direct data correction: Duration altered to ${updatedFields.duration}h`
    };

    const updatedLogs = [log, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveState('dz_logs', updatedLogs);

    const updated = records.map(r => {
      if (r.id === id) {
        return {
          ...r,
          ...updatedFields
        };
      }
      return r;
    });
    setRecords(updated);
    saveState('dz_records', updated);
  };

  const handleAddRecordsByAdmin = (newRecords: TrainingRecord[]) => {
    const updated = [...newRecords, ...records];
    setRecords(updated);
    saveState('dz_records', updated);

    // Create audit logs for each record
    let updatedLogs = [...auditLogs];
    newRecords.forEach(rec => {
      const log: AuditLog = {
        id: `audit-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        recordId: rec.id,
        recordTitle: rec.title,
        staffName: rec.staffName,
        action: 'Verify',
        actorName: currentUser?.name || 'HR Admin',
        timestamp: new Date().toLocaleString(),
        remarks: 'Admin Direct Entry / Bulk Entry'
      };
      updatedLogs.unshift(log);
    });
    setAuditLogs(updatedLogs);
    saveState('dz_logs', updatedLogs);

    // Create notification alerts for each record
    let updatedNotifs = [...notifications];
    newRecords.forEach(rec => {
      const notif: AppNotification = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        userEmail: rec.staffEmail,
        titleZh: '📢 管理员直录学时入账',
        titleEn: '📢 Direct Credit by Admin',
        messageZh: `管理员为您录入了学时项目《${rec.title}》（${rec.duration}学时，状态：${rec.status === 'Verified' ? '已核实' : '待核实'}）。`,
        messageEn: `The administrator added training record "${rec.title}" (${rec.duration} hrs, status: ${rec.status === 'Verified' ? 'Verified' : 'Pending'}).`,
        recordId: rec.id,
        recordTitle: rec.title,
        timestamp: new Date().toLocaleString(),
        isRead: false,
        type: 'verified'
      };
      updatedNotifs.unshift(notif);
    });
    setNotifications(updatedNotifs);
    saveState('dz_notifications', updatedNotifs);
  };

  // Rule configuration updates
  const handleUpdatePointRule = (rule: PointRule) => {
    setPointRule(rule);
    saveState('dz_rule', rule);
  };

  // --- ACTIONS: ANNOUNCEMENTS ---
  const handleAddOrEditAnnouncement = (
    newAnn: Omit<TrainingAnnouncement, 'id'> & { id?: string }
  ) => {
    if (newAnn.id) {
      const updated = announcements.map(a => {
        if (a.id === newAnn.id) {
          return {
            ...a,
            title: newAnn.title,
            date: newAnn.date,
            time: newAnn.time,
            venue: newAnn.venue,
            organiser: newAnn.organiser,
            targetParticipants: newAnn.targetParticipants,
            category: newAnn.category,
            deadline: newAnn.deadline,
            registrationLink: newAnn.registrationLink,
            contactPerson: newAnn.contactPerson,
            description: newAnn.description
          };
        }
        return a;
      });
      setAnnouncements(updated);
      saveState('dz_announcements', updated);
    } else {
      const annToAdd: TrainingAnnouncement = {
        ...newAnn,
        id: `ann-${Date.now()}`
      };
      const updated = [annToAdd, ...announcements];
      setAnnouncements(updated);
      saveState('dz_announcements', updated);
    }
  };

  const handleArchiveAnnouncement = (id: string) => {
    const updated = announcements.map(a => {
      if (a.id === id) {
        return { ...a, isArchived: !a.isArchived };
      }
      return a;
    });
    setAnnouncements(updated);
    saveState('dz_announcements', updated);
  };

  const handleDeleteAnnouncement = (id: string) => {
    const filtered = announcements.filter(a => a.id !== id);
    setAnnouncements(filtered);
    saveState('dz_announcements', filtered);
  };

  const handleRegisterAnnouncement = (annId: string, user: User, isRegistering: boolean) => {
    const updated = announcements.map(a => {
      if (a.id === annId) {
        const currentStaffList = a.registeredStaff || [];
        let newStaffList;
        if (isRegistering) {
          if (currentStaffList.some(s => s.email.toLowerCase() === user.email.toLowerCase())) {
            return a;
          }
          newStaffList = [
            ...currentStaffList,
            {
              email: user.email,
              name: user.name,
              chineseName: user.chineseName,
              department: user.department,
              timestamp: new Date().toLocaleString()
            }
          ];
        } else {
          newStaffList = currentStaffList.filter(s => s.email.toLowerCase() !== user.email.toLowerCase());
        }
        return {
          ...a,
          registeredStaff: newStaffList
        };
      }
      return a;
    });
    setAnnouncements(updated);
    saveState('dz_announcements', updated);
  };

  // --- ACTIONS: POLICIES ---
  const handleUpdatePolicy = (id: string, updatedFields: Partial<PolicySection>) => {
    const updated = policies.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updatedFields
        };
      }
      return p;
    });
    setPolicies(updated);
    saveState('dz_policies', updated);
  };

  const t = TRANSLATIONS[currentLang];

  if (!currentUser) {
    return (
      <Login 
        currentLang={currentLang}
        onLogin={handleLogin}
        usersList={users}
        adminPassword={adminPassword}
        onLangChange={setLang}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased flex flex-col justify-between">
      <div>
        {/* Bilingual Navbar & impersonation controller */}
        <Navbar 
          currentLang={currentLang}
          setLang={setLang}
          currentUser={currentUser}
          usersList={users}
          onChangeUser={handleChangeUser}
          onLogout={handleLogout}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Primary View Switcher Navigation Tab bar - Styled in Bento Grid aesthetic */}
          <div className="flex bg-slate-100 p-1.5 rounded-3xl border border-slate-200/80 overflow-x-auto">
            <button
              onClick={() => setActiveNav('dashboard')}
              className={`flex-1 py-3 px-4 rounded-2xl text-center text-xs md:text-sm font-bold tracking-wide transition duration-150 flex items-center justify-center space-x-2 whitespace-nowrap ${
                activeNav === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{(currentUser.role === 'hr_admin' || currentUser.role === 'hr_agent') ? (currentLang === 'zh' ? '核实工作台' : 'Verification Desk') : t.dashboard}</span>
            </button>
            <button
              onClick={() => setActiveNav('announcements')}
              className={`flex-1 py-3 px-4 rounded-2xl text-center text-xs md:text-sm font-bold tracking-wide transition duration-150 flex items-center justify-center space-x-2 whitespace-nowrap ${
                activeNav === 'announcements'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>{t.upcomingTraining}</span>
            </button>
            <button
              onClick={() => setActiveNav('policy')}
              className={`flex-1 py-3 px-4 rounded-2xl text-center text-xs md:text-sm font-bold tracking-wide transition duration-150 flex items-center justify-center space-x-2 whitespace-nowrap ${
                activeNav === 'policy'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t.trainingPolicy}</span>
            </button>
            {(currentUser.role === 'hr_admin' || currentUser.role === 'hr_agent') && (
              <button
                onClick={() => setActiveNav('reports')}
                className={`flex-1 py-3 px-4 rounded-2xl text-center text-xs md:text-sm font-bold tracking-wide transition duration-150 flex items-center justify-center space-x-2 whitespace-nowrap ${
                  activeNav === 'reports'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-white'
                }`}
              >
                <BarChart4 className="w-4 h-4" />
                <span>{currentLang === 'zh' ? '统计报表中心' : t.generateReports}</span>
              </button>
            )}
          </div>

          {activeNav === 'dashboard' && (
            (currentUser.role === 'hr_admin' || currentUser.role === 'hr_agent') ? (
              <AdminDashboard 
                currentLang={currentLang}
                currentUser={currentUser}
                records={records}
                users={users}
                pointRule={pointRule}
                onUpdatePointRule={handleUpdatePointRule}
                onVerifyRecord={handleVerifyRecord}
                onEditRecordByAdmin={handleEditRecordByAdmin}
                onAddRecordsByAdmin={handleAddRecordsByAdmin}
                auditLogs={auditLogs}
                adminPassword={adminPassword}
                onUpdateAdminPassword={handleUpdateAdminPassword}
                onAddStaffAccount={handleAddStaffAccount}
                onUpdateStaffAccount={handleUpdateStaffAccount}
                onDeleteStaffAccount={handleDeleteStaffAccount}
                departments={departments}
                onAddDepartment={handleAddDepartment}
                onUpdateDepartment={handleUpdateDepartment}
                onDeleteDepartment={handleDeleteDepartment}
                googleUser={googleUser}
                googleToken={googleToken}
                connectGoogleDrive={connectGoogleDrive}
                disconnectGoogleDrive={disconnectGoogleDrive}
              />
            ) : (
              <StaffDashboard 
                currentLang={currentLang}
                currentUser={currentUser}
                records={records}
                pointRule={pointRule}
                onSubmitRecord={handleAddOrEditRecord}
                onDeleteRecord={handleDeleteRecord}
                notifications={notifications}
                onMarkNotificationsRead={handleMarkNotificationsRead}
                onClearNotifications={handleClearNotifications}
                googleUser={googleUser}
                googleToken={googleToken}
                connectGoogleDrive={connectGoogleDrive}
                disconnectGoogleDrive={disconnectGoogleDrive}
              />
            )
          )}

          {activeNav === 'announcements' && (
            <AnnouncementManager 
              currentLang={currentLang}
              currentUser={currentUser}
              announcements={announcements}
              onAddAnnouncement={handleAddOrEditAnnouncement}
              onArchiveAnnouncement={handleArchiveAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              onRegisterAnnouncement={handleRegisterAnnouncement}
            />
          )}

          {activeNav === 'policy' && (
            <PolicyManager 
              currentLang={currentLang}
              currentUser={currentUser}
              policies={policies}
              onUpdatePolicy={handleUpdatePolicy}
            />
          )}

          {activeNav === 'reports' && (currentUser.role === 'hr_admin' || currentUser.role === 'hr_agent') && (
            <ReportsManager 
              currentLang={currentLang}
              currentUser={currentUser}
              records={records}
              users={users}
              pointRule={pointRule}
            />
          )}

        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-bold text-slate-100 uppercase tracking-wider text-[10px] mb-1">
              {t.appName}
            </p>
            <p className="text-slate-500 font-mono">
              © 2026 United Chinese School Committees' Association of Malaysia (Dong Zong 董总). All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-5 font-mono text-[10px] uppercase">
            <span>ISO 9001 COMPLIANT</span>
            <span>•</span>
            <span>DATA ENCRYPTED</span>
            <span>•</span>
            <span className="text-blue-700 font-extrabold bg-white rounded px-2 py-0.5">DZ-TMS-V2</span>
          </div>
        </div>
      </footer>

      {/* SECURITY ACCESS PASSWORD GATE MODAL */}
      {pendingSwitchUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden transform transition duration-300 scale-100">
            {/* Header branding */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="text-xl">🔒</span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    {currentLang === 'zh' ? '安全身份验证' : 'Identity Verification Gate'}
                  </h3>
                  <p className="text-[10px] text-blue-200 font-medium">
                    {currentLang === 'zh' ? '必须配置的管理员认证权限' : 'Requires security credential access authorization'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setPendingSwitchUser(null); setEnteredGatePassword(''); setGateError(null); }}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Input body field */}
            <form onSubmit={handleVerifyGatePassword} className="p-6 space-y-4">
              <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p>
                  {currentLang === 'zh' ? '您正在尝试切换进入具有管理及审核权限的账号：' : 'You are attempting to grant credentials for a restricted Administrator session:'}
                </p>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center space-x-2.5 my-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                    {pendingSwitchUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">
                      {pendingSwitchUser.chineseName} ({pendingSwitchUser.name})
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono font-bold">
                      {pendingSwitchUser.email} • {currentLang === 'zh' ? '人事处管理员' : 'HR Unit Admin'}
                    </div>
                  </div>
                </div>
                <p>
                  {currentLang === 'zh' ? '请输入管理员专用控制密码以允许访问。' : 'Please authenticate with the security system passcode to allow authorized session access.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  {currentLang === 'zh' ? '管理员审核密码' : 'HR Admin Access Passcode'}
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder={currentLang === 'zh' ? '输入密码（默认：admin123）' : 'Enter passcode (default: admin123)'}
                  value={enteredGatePassword}
                  onChange={(e) => setEnteredGatePassword(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition font-mono"
                />
              </div>

              {gateError && (
                <div className="bg-rose-50 border border-rose-250 text-rose-800 text-[11px] font-semibold p-3 rounded-xl animate-shake">
                  {gateError}
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setPendingSwitchUser(null); setEnteredGatePassword(''); setGateError(null); }}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-50 hover:text-slate-800 transition"
                >
                  {currentLang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md active:scale-95"
                >
                  {currentLang === 'zh' ? '验证登录' : 'Verify Authorization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
