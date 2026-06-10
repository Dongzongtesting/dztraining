export type TrainingType = string;

export interface User {
  id: string;
  name: string;
  chineseName: string;
  email: string;
  role: 'hr_admin' | 'hr_agent' | 'staff';
  department?: string;
  targetPoints?: number;
  password?: string;
  staffNo?: string;
}

export interface TrainingRecord {
  id: string;
  staffName: string;
  staffEmail: string;
  department: string;
  title: string;
  organiser: string;
  type: TrainingType;
  date: string;
  endDate?: string; // Multi-day supportive ending date string
  duration: number; // in hours
  venue: string;
  description: string;
  lecturer?: string; // Instructor/Trainer/Speaker identity string
  trainingTime?: string; // Course duration structure description e.g., "09:00 - 12:00, 14:00 - 17:00"
  fileName?: string;
  fileSize?: string;
  fileData?: string; // simulation of file preview
  driveFileId?: string; // Real Google Drive file ID
  driveFileUrl?: string; // Real Google Drive file viewing link
  submissionDate: string;
  status: 'Pending Verification' | 'Verified' | 'Rejected';
  remarks?: string;
}

export interface TrainingAnnouncement {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  organiser: string;
  targetParticipants: string;
  category: string;
  deadline: string;
  registrationLink: string;
  contactPerson: string;
  description: string;
  fileName?: string;
  isArchived: boolean;
  registeredStaff?: { email: string; name: string; chineseName?: string; department: string; timestamp: string }[];
}

export interface PolicySection {
  id: string;
  titleEn: string;
  titleZh: string;
  contentEn: string;
  contentZh: string;
}

export interface PointRule {
  hoursPerPoint: number;
  maxPointsPerYear: number;
}

export interface AuditLog {
  id: string;
  recordId: string;
  recordTitle: string;
  staffName: string;
  action: 'Verify' | 'Reject' | 'Request Correction' | 'Edit Data';
  actorName: string;
  timestamp: string;
  remarks: string;
}

export interface AppNotification {
  id: string;
  userEmail: string;
  titleZh: string;
  titleEn: string;
  messageZh: string;
  messageEn: string;
  recordId: string;
  recordTitle: string;
  timestamp: string;
  isRead: boolean;
  type: 'rejected' | 'verified' | 'general';
}

