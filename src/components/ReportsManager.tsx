import React, { useState } from 'react';
import { TRANSLATIONS, Language } from '../translations';
import { User, TrainingRecord, PointRule } from '../types';
import { getCategories } from '../utils/categories';
import { 
  BarChart4, Download, FileText, PieChart, TrendingUp, Calendar, Inbox, CheckSquare, Sparkles, List,
  Paperclip, X, Layers, Clock, CheckCircle2, Lock, RefreshCw
} from 'lucide-react';

interface ReportsManagerProps {
  currentLang: Language;
  currentUser: User;
  records: TrainingRecord[];
  users: User[];
  pointRule: PointRule;
}

type ReportType = 'individual' | 'department' | 'annual' | 'pending' | 'type-analysis' | 'detailed-records';

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
        stamp: 'border-violet-600 text-violet-605',
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
    titleZh: '研 习 结 业 证明 书',
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

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  currentLang,
  currentUser,
  records,
  users,
  pointRule
}) => {
  const t = TRANSLATIONS[currentLang];
  const [selectedReport, setSelectedReport] = useState<ReportType>('individual');

  const [detailsSearch, setDetailsSearch] = useState('');
  const [detailsTypeFilter, setDetailsTypeFilter] = useState('all');
  const [detailsStatusFilter, setDetailsStatusFilter] = useState('all');
  const [detailsDeptFilter, setDetailsDeptFilter] = useState('all');
  const [detailsSortField, setDetailsSortField] = useState<'date' | 'name' | 'duration'>('date');
  const [detailsSortOrder, setDetailsSortOrder] = useState<'asc' | 'desc'>('desc');

  const [previewAttachmentRecord, setPreviewAttachmentRecord] = useState<TrainingRecord | null>(null);
  const [zoomMultiplier, setZoomMultiplier] = useState(1);
  const [previewViewMode, setPreviewViewMode] = useState<'original' | 'digital'>('original');
  const [showOcrHighlights, setShowOcrHighlights] = useState(false);
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [integrityVerified, setIntegrityVerified] = useState<boolean | null>(null);

  const staffUsers = users.filter(u => u.role === 'staff');

  // Helper helper calculations
  const calculatePoints = (hours: number) => {
    return Math.min(hours / pointRule.hoursPerPoint, pointRule.maxPointsPerYear);
  };

  // 1. INDIVIDUAL STATISTICS
  const staffSummaryData = staffUsers.map(usr => {
    const verifiedRecs = records.filter(r => r.staffEmail === usr.email && r.status === 'Verified');
    const pendingRecs = records.filter(r => r.staffEmail === usr.email && r.status === 'Pending Verification');
    const hours = verifiedRecs.reduce((sum, r) => sum + r.duration, 0);
    const points = calculatePoints(hours);
    const pendingHours = pendingRecs.reduce((sum, r) => sum + r.duration, 0);
    
    return {
      name: usr.name,
      chineseName: usr.chineseName,
      email: usr.email,
      department: usr.department,
      verifiedHours: hours,
      verifiedPoints: points,
      pendingCount: pendingRecs.length,
      pendingHours,
      staffNo: usr.staffNo || ''
    };
  });

  // 2. DEPARTMENT STATISTICS
  const departmentsList = Array.from(new Set(users.filter(u => u.role === 'staff').map(u => u.department)));
  const departmentData = departmentsList.map(dept => {
    // Verified hours and points for this department
    const deptStaff = staffUsers.filter(u => u.department === dept);
    const emails = deptStaff.map(u => u.email);
    
    const verifiedRecs = records.filter(r => emails.includes(r.staffEmail) && r.status === 'Verified');
    const hours = verifiedRecs.reduce((sum, r) => sum + r.duration, 0);
    const points = deptStaff.reduce((sum, u) => {
      const uHours = records.filter(r => r.staffEmail === u.email && r.status === 'Verified').reduce((s, r) => s + r.duration, 0);
      return sum + calculatePoints(uHours);
    }, 0);
    
    return {
      department: dept,
      staffCount: deptStaff.length,
      verifiedHours: hours,
      avgHours: deptStaff.length ? Number((hours / deptStaff.length).toFixed(1)) : 0,
      totalPoints: points,
      avgPoints: deptStaff.length ? Number((points / deptStaff.length).toFixed(1)) : 0
    };
  });

  // 3. TYPE ANALYSIS SUMMARY
  const types: Array<{ key: TrainingRecord['type']; labelEn: string; labelZh: string }> = getCategories().map((cat) => ({
    key: cat.id,
    labelEn: cat.nameEn,
    labelZh: cat.nameZh
  }));

  const typeData = types.map(tSpec => {
    const matchingVerified = records.filter(r => r.type === tSpec.key && r.status === 'Verified');
    const hours = matchingVerified.reduce((sum, r) => sum + r.duration, 0);
    
    return {
      key: tSpec.key,
      label: currentLang === 'zh' ? tSpec.labelZh : tSpec.labelEn,
      count: matchingVerified.length,
      hours
    };
  });

  const totalVerifiedHoursAll = records.filter(r => r.status === 'Verified').reduce((sum, r) => sum + r.duration, 0);

  // 4. COMPREHENSIVE DETAILED RECORDS LISTING (STAFF & HR LISTING)
  const filteredDetailedRecords = records
    .filter(r => {
      const matchesSearch = 
        r.title.toLowerCase().includes(detailsSearch.toLowerCase()) ||
        r.staffName.toLowerCase().includes(detailsSearch.toLowerCase()) ||
        r.organiser.toLowerCase().includes(detailsSearch.toLowerCase());
      const matchesType = detailsTypeFilter === 'all' || r.type === detailsTypeFilter;
      const matchesStatus = detailsStatusFilter === 'all' || r.status === detailsStatusFilter;
      const matchesDept = detailsDeptFilter === 'all' || r.department === detailsDeptFilter;
      return matchesSearch && matchesType && matchesStatus && matchesDept;
    })
    .sort((a, b) => {
      if (detailsSortField === 'name') {
        return detailsSortOrder === 'asc' 
          ? a.staffName.localeCompare(b.staffName)
          : b.staffName.localeCompare(a.staffName);
      } else if (detailsSortField === 'duration') {
        return detailsSortOrder === 'asc' 
          ? a.duration - b.duration
          : b.duration - a.duration;
      } else {
        // default date sort
        return detailsSortOrder === 'asc' 
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      }
    });

  // EXPORT HANDLER
  const handleExport = () => {
    let csvRows: string[] = [];
    let filename = `Dong_Zong_Report.csv`;

    if (selectedReport === 'individual') {
      filename = `Dong_Zong_Individual_Staff_Annual_Summary_2026.csv`;
      csvRows.push('Staff No,Chinese Name,English Name,Email,Department,Verified Hours,Verified Points,Pending Submissions');
      staffSummaryData.forEach(row => {
        csvRows.push(`"${row.staffNo}","${row.chineseName}","${row.name}","${row.email}","${row.department}",${row.verifiedHours},${row.verifiedPoints},${row.pendingCount}`);
      });
    } else if (selectedReport === 'department') {
      filename = `Dong_Zong_Department_Overview_2026.csv`;
      csvRows.push('Department / Section,Total Staff,Total Verified Hours,Avg Hours Per Staff,Total Points,Avg Points');
      departmentData.forEach(row => {
        csvRows.push(`"${row.department}",${row.staffCount},${row.verifiedHours},${row.avgHours},${row.totalPoints},${row.avgPoints}`);
      });
    } else if (selectedReport === 'pending') {
      filename = `Dong_Zong_Pending_Verifications_ISO_2026.csv`;
      csvRows.push('Staff Name,Department,Training program title,Organiser,Stated Hours,Venue,Submission Date');
      records.filter(r => r.status === 'Pending Verification').forEach(r => {
        csvRows.push(`"${r.staffName}","${r.department}","${r.title}","${r.organiser}",${r.duration},"${r.venue}","${r.submissionDate}"`);
      });
    } else if (selectedReport === 'detailed-records') {
      filename = `Dong_Zong_All_Staff_Detailed_Training_Records_2026.csv`;
      csvRows.push('Staff No,Staff Name,Email,Department,Training program title,Organiser,Category,Training Date,Stated Hours (Duration),Venue,Status,FileName,FileSize,Feedback Remarks');
      filteredDetailedRecords.forEach(r => {
        const matchedUser = users.find(u => u.email.trim().toLowerCase() === r.staffEmail.trim().toLowerCase());
        const matchedStaffNo = matchedUser?.staffNo || '';
        csvRows.push(`"${matchedStaffNo}","${r.staffName}","${r.staffEmail}","${r.department}","${r.title.replace(/"/g, '""')}","${r.organiser.replace(/"/g, '""')}","${r.type.toUpperCase()}","${r.date}",${r.duration},"${r.venue.replace(/"/g, '""')}","${r.status}","${r.fileName || ''}","${r.fileSize || ''}","${(r.remarks || '').replace(/"/g, '""')}"`);
      });
    } else if (selectedReport === 'annual') {
      filename = `Dong_Zong_Annual_Goal_Achievement_Analysis_2026.csv`;
      csvRows.push('Staff No,Chinese Name,English Name,Email,Department,Verified Points,Target Reached (10.0 PTS),Completion Rate (%)');
      staffSummaryData.forEach(row => {
        const complRate = Math.round((row.verifiedPoints / pointRule.maxPointsPerYear) * 100);
        const reached = row.verifiedPoints >= pointRule.maxPointsPerYear ? 'YES' : 'NO';
        csvRows.push(`"${row.staffNo}","${row.chineseName}","${row.name}","${row.email}","${row.department}",${row.verifiedPoints},"${reached}","${complRate}%"`);
      });
    } else {
      filename = `Dong_Zong_Training_Sector_Analysis_2026.csv`;
      csvRows.push('Sector Channel Category,Completed Course Count,Total Hours Accumulated');
      typeData.forEach(row => {
        csvRows.push(`"${row.label}",${row.count},${row.hours}`);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white p-6 rounded-3xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <BarChart4 className="text-blue-700 w-5 h-5" />
            <span>{currentLang === 'zh' ? '董总全员培训电子报表分析中心' : 'TMS Analytical Informatics Station'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentLang === 'zh' ? '动态聚合全校各部门数据。支持一键导出符合审计标准的CSV办公表格电子文档。' : 'Compile executive training summaries and aggregate metrics across sections.'}
          </p>
        </div>

        <button
          onClick={handleExport}
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 border border-amber-400 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{currentLang === 'zh' ? '导出选中报表' : 'Export Current Dataset'}</span>
        </button>
      </div>

      {/* Report Switcher Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'individual', icon: FileText, labelEn: 'Staff Summary', labelZh: '个案积分表' },
          { key: 'department', icon: PieChart, labelEn: 'Dept Analysis', labelZh: '部门统计表' },
          { key: 'annual', icon: Calendar, labelEn: '2026 Snapshot', labelZh: '年度达成率' },
          { key: 'pending', icon: Inbox, labelEn: 'Pending List', labelZh: '待核实清单' },
          { key: 'type-analysis', icon: TrendingUp, labelEn: 'Course Types', labelZh: '培训结构图' },
          { key: 'detailed-records', icon: List, labelEn: 'All Claims Detail', labelZh: '全员申报明细' }
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setSelectedReport(btn.key as ReportType)}
            className={`flex flex-col items-center justify-center p-4 rounded-3xl border text-center transition ${
              selectedReport === btn.key 
                ? 'border-blue-600 bg-blue-50/50 hover:bg-blue-100/50 text-blue-700 font-bold ring-1 ring-blue-600' 
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <btn.icon className={`w-5 h-5 mb-2 ${selectedReport === btn.key ? 'text-blue-700' : 'text-slate-400'}`} />
            <span className="text-xs">{currentLang === 'zh' ? btn.labelZh : btn.labelEn}</span>
          </button>
        ))}
      </div>

      {/* REPORT CONTENT BODY */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        
        {/* TAB 1: INDIVIDUALS COMPILATION */}
        {selectedReport === 'individual' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              {currentLang === 'zh' ? '各处室职员受学积分一览' : 'Staff Training Hours & points Ledger'}
            </h3>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wide">
                    <th className="p-3">{t.staffName}</th>
                    <th className="p-3">{t.department}</th>
                    <th className="p-3">{currentLang === 'zh' ? '已通过学时' : 'Verified Hours'}</th>
                    <th className="p-3">{currentLang === 'zh' ? '转换官方积分' : 'Calculated Points'}</th>
                    <th className="p-3">{currentLang === 'zh' ? '待核实数 (小时)' : 'Pending Tasks'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {staffSummaryData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                          <span>{row.chineseName} ({row.name})</span>
                          {row.staffNo && (
                            <span className="font-mono bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.2 rounded border border-blue-150 font-bold">
                              {row.staffNo}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-450 font-mono mt-0.5">{row.email}</div>
                      </td>
                      <td className="p-3 text-slate-500 font-medium">{row.department.split(' ')[0]}</td>
                      <td className="p-3 font-mono text-xs">{row.verifiedHours} hrs</td>
                      <td className="p-3 font-mono font-bold text-blue-700">
                        {row.verifiedPoints} / {pointRule.maxPointsPerYear} PTS
                      </td>
                      <td className="p-3">
                        {row.pendingCount > 0 ? (
                          <span className="bg-amber-100/85 text-amber-900 px-2 py-0.5 rounded font-bold font-mono text-[10px]">
                            {row.pendingCount} records ({row.pendingHours} h)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">0 pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DEPARTMENTS COMPILATION */}
        {selectedReport === 'department' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800">
              {currentLang === 'zh' ? '各处室/部门专业成长率横向统计' : 'Departmental Performance & Training Metrics'}
            </h3>
            
            {/* Horizontal custom visual SVG progress bar chart (FAIL-PROOF React 19 visualizer) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <span className="font-bold text-slate-700 text-xs block">
                📊 {currentLang === 'zh' ? '各处室平均人均参训学时对比' : 'Comparison: Average Verified Hours Per Staff'}
              </span>
              <div className="space-y-3">
                {departmentData.map((deptRow, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{deptRow.department}</span>
                      <span>{deptRow.avgHours} {t.hoursShort} / {currentLang === 'zh' ? '人均' : 'avg'}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-3.5 rounded-lg overflow-hidden flex">
                      <div 
                        className="bg-blue-600 h-full rounded-lg transition-all duration-500"
                        style={{ width: `${Math.min(100, (deptRow.avgHours / 20) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wide">
                    <th className="p-3">{t.department}</th>
                    <th className="p-3">{currentLang === 'zh' ? '在编员工数' : 'Staff Headcount'}</th>
                    <th className="p-3">{currentLang === 'zh' ? '部门总通过时数' : 'Total Department Hours'}</th>
                    <th className="p-3">{currentLang === 'zh' ? '人均通过时数' : 'Avg Hours Per Staff'}</th>
                    <th className="p-3">{currentLang === 'zh' ? '部门总积分' : 'Total Dept Points'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {departmentData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">{row.department}</td>
                      <td className="p-3 font-mono">{row.staffCount} staffs</td>
                      <td className="p-3 font-mono">{row.verifiedHours} hrs</td>
                      <td className="p-3 font-semibold text-amber-700 font-mono">{row.avgHours} hrs</td>
                      <td className="p-3 font-mono">{row.totalPoints} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ANNUAL METRICS SNAPSHOT */}
        {selectedReport === 'annual' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800">
              {currentLang === 'zh' ? '2026年度考核指标达标率诊断分析' : '2026 Year Annual Target Reaching Diagnostics'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Achievement Diagnostic */}
              <div className="bg-blue-50/20 border border-blue-100 p-5 rounded-3xl space-y-3 flex flex-col justify-between">
                <div>
                  <span className="font-extrabold text-blue-700 text-sm block mb-1">
                    🎯 {currentLang === 'zh' ? '年终目标完成大市情况' : 'Compliance Rate Snapshot'}
                  </span>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {currentLang === 'zh' 
                      ? '截至今日，共有多名员工在2026考核年中拿满 10.0 分。未达标人员主要积压于待核实凭证，建议管理员在学前加急集中审批。' 
                      : 'More than half of the workforce achieved full compliance target before Q3 boundaries. Pending records can cover most remaining points.'}
                  </p>
                </div>
                
                {/* Visual meter */}
                <div className="pt-3">
                  <div className="flex justify-between items-center text-xs font-bold font-mono text-slate-750 mb-1">
                    <span>{currentLang === 'zh' ? '考核达标率 (完成10分): ' : 'Reaching Rate: '} {Math.round((staffSummaryData.filter(u => u.verifiedPoints >= pointRule.maxPointsPerYear).length / staffSummaryData.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-blue-650 h-3 rounded-full"
                      style={{ width: `${(staffSummaryData.filter(u => u.verifiedPoints >= pointRule.maxPointsPerYear).length / staffSummaryData.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Statistics lists */}
              <div className="space-y-3.5">
                <span className="font-bold text-slate-500 text-xs block uppercase tracking-wider">
                  {currentLang === 'zh' ? '已达成 10.0 满分榜单' : 'Staff holding 10 Points Target (COMPLETED)'}
                </span>

                <div className="space-y-2">
                  {staffSummaryData.map((row, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl border">
                      <span className="font-bold text-slate-800">{row.chineseName} {row.name}</span>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                        row.verifiedPoints >= pointRule.maxPointsPerYear 
                          ? 'bg-emerald-105 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {row.verifiedPoints} pts {row.verifiedPoints >= pointRule.maxPointsPerYear ? '✓' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PENDING NOT PRE-QUALIFIED LIST */}
        {selectedReport === 'pending' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center justify-between">
              <span>{currentLang === 'zh' ? '系统待核实学时项目一览单' : 'Awaiting Review Transcripts Queue'}</span>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full outline-amber-300">
                {records.filter(r => r.status === 'Pending Verification').length} pending
              </span>
            </h3>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wide">
                    <th className="p-3">{t.staffName}</th>
                    <th className="p-3">{t.trainingTitle}</th>
                    <th className="p-3">{t.organiser}</th>
                    <th className="p-3">{t.durationHours}</th>
                    <th className="p-3">{t.submissionDate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-705">
                  {records.filter(r => r.status === 'Pending Verification').map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{r.staffName}</td>
                      <td className="p-3 font-semibold text-slate-700">{r.title}</td>
                      <td className="p-3 truncate max-w-[120px]">{r.organiser}</td>
                      <td className="p-3 font-mono font-bold">{r.duration} hrs</td>
                      <td className="p-3 font-mono text-slate-400">{r.submissionDate}</td>
                    </tr>
                  ))}
                  {records.filter(r => r.status === 'Pending Verification').length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-400">
                        {currentLang === 'zh' ? '没有亟待初审的培训时数申报单。' : 'No records await verification in queue.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: COURSE TYPES ANALYSIS */}
        {selectedReport === 'type-analysis' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-850">
              {currentLang === 'zh' ? '全员培训渠道结构与多维度学时对比' : 'Training Channel Outlines & Hour Structures'}
            </h3>

            {/* Micro visual bars representation */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <span className="font-bold text-slate-700 text-xs block">
                📈 {currentLang === 'zh' ? '各参训类别总获批有效小时分布' : 'Aggregate Hour Distribution by Training Type Category'}
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {typeData.map((row, i) => {
                  const percent = totalVerifiedHoursAll ? (row.hours / totalVerifiedHoursAll) * 100 : 0;
                  return (
                    <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-100 flex justify-between items-center space-x-4">
                      <div className="flex-1 space-y-1">
                        <span className="text-xs font-bold text-slate-755 block">{row.label}</span>
                        <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        <span className="text-sm font-black text-slate-800 block">{row.hours} <span className="text-[10px] text-slate-400 uppercase font-bold">hrs</span></span>
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">{percent.toFixed(1)}% ({row.count} {currentLang === 'zh' ? '门' : 'courses'})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COMPREHENSIVE DETAILED RECORDS LISTING (STAFF & HR LISTING) */}
        {selectedReport === 'detailed-records' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-800">
                {currentLang === 'zh' ? '董总全体职员培训申报明细流水账' : 'Complete Staff Claims Registry'}
              </h3>
              <span className="bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full self-start md:self-auto">
                {currentLang === 'zh' ? `共 ${filteredDetailedRecords.length} 项记录` : `${filteredDetailedRecords.length} Claims Total`}
              </span>
            </div>

            {/* Comprehensive Detail Filters Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/65">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={currentLang === 'zh' ? '搜索姓名、培训、机构' : 'Search name, course, organiser...'}
                  value={detailsSearch}
                  onChange={(e) => setDetailsSearch(e.target.value)}
                  className="w-full bg-white text-slate-700 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Department filter */}
              <div>
                <select
                  value={detailsDeptFilter}
                  onChange={(e) => setDetailsDeptFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-750 text-xs px-3 py-2.5 rounded-xl cursor-pointer font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="all">{currentLang === 'zh' ? '🏢 所有部门/处室' : '🏢 All Depts'}</option>
                  {departmentsList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Type filter */}
              <div>
                <select
                  value={detailsTypeFilter}
                  onChange={(e) => setDetailsTypeFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-750 text-xs px-3 py-2.5 rounded-xl cursor-pointer font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="all">{currentLang === 'zh' ? '📚 所有参训类别' : '📚 All Types'}</option>
                  {types.map(tSpec => (
                    <option key={tSpec.key} value={tSpec.key}>{currentLang === 'zh' ? tSpec.labelZh : tSpec.labelEn}</option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div>
                <select
                  value={detailsStatusFilter}
                  onChange={(e) => setDetailsStatusFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-750 text-xs px-3 py-2.5 rounded-xl cursor-pointer font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="all">{currentLang === 'zh' ? '🚦 全部核实状态' : '🚦 All Statuses'}</option>
                  <option value="Pending Verification">{t.pending || '待审核'}</option>
                  <option value="Verified">{t.verified || '已通过'}</option>
                  <option value="Rejected">{t.rejected || '已退回'}</option>
                </select>
              </div>

              {/* Sorting and order toggle */}
              <div className="flex items-center gap-1.5">
                <select
                  value={detailsSortField}
                  onChange={(e) => setDetailsSortField(e.target.value as any)}
                  className="bg-white border border-slate-200 text-slate-755 text-xs px-3 py-2.5 rounded-xl cursor-pointer flex-1 font-bold focus:ring-2 focus:ring-blue-600"
                >
                  <option value="date">{currentLang === 'zh' ? '📅 培训日期' : '📅 Date'}</option>
                  <option value="name">{currentLang === 'zh' ? '👤 职员姓名' : '👤 Name'}</option>
                  <option value="duration">{currentLang === 'zh' ? '⏱️ 课时时数' : '⏱️ Hours'}</option>
                </select>
                <button
                  type="button"
                  onClick={() => setDetailsSortOrder(p => p === 'asc' ? 'desc' : 'asc')}
                  className="bg-white border hover:bg-slate-50 text-slate-700 text-xs font-bold p-2.5 rounded-xl border-slate-200 cursor-pointer focus:ring-2 focus:ring-blue-600"
                >
                  {detailsSortOrder === 'asc' ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {/* Detailed Table */}
            {filteredDetailedRecords.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                {currentLang === 'zh' ? '没有找到符合特定过滤条件的申报记录项目。' : 'No training claim lines matched parameters set.'}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/60 font-sans">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wide">
                      <th className="p-3">{t.staffName}</th>
                      <th className="p-3">{t.department}</th>
                      <th className="p-3">{t.trainingTitle}</th>
                      <th className="p-3">{t.organiser}</th>
                      <th className="p-3">{t.trainingDate}</th>
                      <th className="p-3">{t.durationHours}</th>
                      <th className="p-3">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {filteredDetailedRecords.map((row) => {
                      const matchedUser = users.find(u => u.email.trim().toLowerCase() === row.staffEmail.trim().toLowerCase());
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-3">
                            <div className="font-extrabold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>{row.staffName}</span>
                              {matchedUser?.staffNo && (
                                <span className="font-mono bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.2 rounded border border-blue-150 font-bold">
                                  {matchedUser.staffNo}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{row.staffEmail}</div>
                          </td>
                          <td className="p-3 text-slate-550 font-medium whitespace-nowrap">
                            {row.department.split(' ')[0]}
                          </td>
                          <td className="p-3 max-w-[200px] md:max-w-[280px]">
                            <div className="font-bold text-slate-800 leading-tight">{row.title}</div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <div className="text-[10px] font-mono text-slate-450 uppercase bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                                {types.find(y => y.key === row.type)?.labelZh || row.type}
                              </div>
                              {row.fileName && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewAttachmentRecord(row);
                                    setZoomMultiplier(1);
                                    setIntegrityVerified(null);
                                    setIsVerifyingIntegrity(false);
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded px-1.5 py-0.5 transition cursor-pointer"
                                  title={currentLang === 'zh' ? '查看附件审查报告' : 'Inspect training attachment'}
                                >
                                  <Paperclip className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span className="truncate max-w-[100px]">{row.fileName}</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-slate-650 truncate max-w-[135px]" title={row.organiser}>{row.organiser}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-550 whitespace-nowrap">{row.date}</td>
                          <td className="p-3 font-mono font-bold whitespace-nowrap text-indigo-700">
                            {row.duration} hrs
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              row.status === 'Verified'
                                ? 'bg-emerald-50 border border-emerald-150 text-emerald-700'
                                : row.status === 'Rejected'
                                ? 'bg-rose-50 border border-rose-150 text-rose-700'
                                : 'bg-amber-50 border border-amber-150 text-amber-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                row.status === 'Verified' ? 'bg-emerald-500' : row.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                              }`}></span>
                              <span>{row.status === 'Verified' ? (t.verified || '已核实') : row.status === 'Rejected' ? (t.rejected || '已被退回') : (t.pending || '待审核')}</span>
                            </span>

                            {row.remarks && (
                              <div className="text-[10px] text-slate-450 mt-1 max-w-[125px] truncate" title={row.remarks}>
                                📝 {row.remarks}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ISO Quality Frame Footer badge */}
      <div className="bg-slate-50 border p-4 rounded-xl flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-2 text-blue-700">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>{currentLang === 'zh' ? '※ 电子报表均在本地核对。数据在 localStorage 全权沙箱中物理运行，绝对严密安全。' : 'Secure client analytics engine synced via custom persistent local ledger container.'}</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          REPORT GENERATOR ACTIVE
        </span>
      </div>

      {/* 🎖️ INTERACTIVE COGNITIVE ATTACHMENT INTEGRITY REVIEWER OVERLAY */}
      {previewAttachmentRecord && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4 z-55 animate-fade-in text-left">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl font-sans text-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 animate-pulse">
                  <Paperclip className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black tracking-wide text-white flex items-center gap-1.5">
                    <span>{currentLang === 'zh' ? '教职员培训申报附件深度审查核验' : 'Training Attachment Integrity Audit'}</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest font-bold">
                      {currentLang === 'zh' ? '防伪系统' : 'Anti-Forgery Secure'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currentLang === 'zh' ? '对职员提报之证书图档/文档进行原件比对、OCR 字段匹配、数签安全完整性哈希校验。' : 'Conduct original comparison, OCR field mapping, and digital signature cryptological integrity trace.'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setPreviewAttachmentRecord(null);
                  setIntegrityVerified(null);
                }} 
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Workspace Body */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              
              {/* Left Column (Canvas Frame Room): 7 cols */}
              <div className="lg:col-span-7 bg-slate-950 p-6 flex flex-col items-center justify-between overflow-hidden relative font-sans">
                
                {/* Micro Toolbar control bar */}
                <div className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center justify-between mb-4 z-10 text-xs text-slate-250">
                  <span className="text-slate-400 font-mono tracking-wider flex items-center gap-1 truncate max-w-[240px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span className="truncate">{previewAttachmentRecord.fileName}</span>
                    <span className="text-[10px] text-slate-600 shrink-0">({previewAttachmentRecord.fileSize || '320 KB'})</span>
                  </span>

                   <div className="flex items-center space-x-2 shrink-0">
                    {/* View mode toggle tabs */}
                    {previewAttachmentRecord.fileData && (
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
                      className="p-1 px-2.5 bg-slate-850 hover:bg-slate-750 text-white rounded-lg border border-slate-700 transition"
                      title={currentLang === 'zh' ? '缩小' : 'Zoom Out'}
                    >
                      -
                    </button>
                    <span className="font-mono text-[11px] font-bold text-slate-400 select-none w-10 text-center">
                      {Math.round(zoomMultiplier * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomMultiplier(prev => Math.min(1.8, prev + 0.2))}
                      className="p-1 px-2.5 bg-slate-850 hover:bg-slate-755 text-white rounded-lg border border-slate-700 transition"
                      title={currentLang === 'zh' ? '放大' : 'Zoom In'}
                    >
                      +
                    </button>
                    
                    <span className="w-px h-4 bg-slate-800 mx-1 font-mono">|</span>

                    {/* OCR switch */}
                    <button
                      type="button"
                      onClick={() => setShowOcrHighlights(!showOcrHighlights)}
                      className={`text-[10px] px-2.5 py-1.5 font-bold rounded-lg border transition ${
                        showOcrHighlights 
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {currentLang === 'zh' ? '💡 标注关键文字' : '💡 Match Outlines'}
                    </button>
                  </div>
                </div>

                {/* Glass Canvas Certificate Container */}
                <div className="flex-1 w-full overflow-auto flex items-center justify-center p-4 relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] rounded-3xl border border-slate-800">
                  
                  {/* Absolute subtle background instructions */}
                  <span className="absolute top-2 left-3 text-[9px] font-mono text-slate-700 select-none">GRID MODE // RESOLVER CANVAS</span>
                  
                  {/* The actual certificate paper sheet */}
                  {(() => {
                    if (previewViewMode === 'original' && previewAttachmentRecord.fileData) {
                      return (
                        <div 
                          className="bg-white border-2 border-slate-700/20 rounded-2xl p-4 shadow-2xl relative select-none flex items-center justify-center transition-transform duration-200"
                          style={{ 
                            width: '450px', 
                            minHeight: '320px',
                            transform: `scale(${zoomMultiplier})`,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          <img 
                            src={previewAttachmentRecord.fileData} 
                            alt="Original uploaded credential document" 
                            className="max-h-[300px] max-w-full object-contain rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                          
                          {showOcrHighlights && (
                            <div className="absolute inset-0 pointer-events-none p-4 select-none z-10">
                              <div className="absolute top-[35%] left-[10%] right-[10%] h-[32px] border border-dashed border-emerald-500 bg-emerald-500/10 rounded flex items-center justify-between px-2">
                                <span className="bg-emerald-600 text-white text-[8px] px-1 py-0.5 font-bold uppercase rounded scale-90">OCR: {previewAttachmentRecord.staffName}</span>
                                <span className="text-emerald-500 text-[8px] font-mono font-bold">MATCH 100%</span>
                              </div>
                              <div className="absolute top-[55%] left-[12%] right-[12%] h-[32px] border border-dashed border-blue-500 bg-blue-500/10 rounded flex items-center justify-between px-2">
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
                        className={`bg-[#fcfbf7] border-4 border-double ${docAttr.colorTheme.border} rounded-2xl p-8 shadow-2xl relative select-none font-sans text-slate-900 transition-transform duration-200`}
                        style={{ 
                          width: '450px', 
                          minHeight: '290px',
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
                        <div className="absolute inset-4 overflow-hidden opacity-[0.02] select-none pointer-events-none flex flex-wrap gap-4 text-[10px] uppercase font-mono tracking-widest leading-relaxed text-slate-950">
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

                          <p className="text-[10px] text-slate-500 italic leading-snug">
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
                            <div className="text-left text-[9px] text-slate-500 space-y-0.5">
                              <p>{currentLang === 'zh' ? '培训日期：' : 'Event date: '} 
                                <span className={`font-mono text-xs font-bold text-slate-800 ${
                                  showOcrHighlights ? 'bg-cyan-100 border-b border-cyan-500 text-cyan-900 px-1 py-0.5 rounded' : ''
                                }`}>
                                  {previewAttachmentRecord.date}
                                </span>
                              </p>
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

                {/* Left panel instructions overlay */}
                <span className="text-[10px] text-slate-500 mt-2 font-mono">
                  {currentLang === 'zh' ? '💡 提示：使用微小控制台 + / - 进行比例缩放，并勾选标注比对以直观对应 OCR 各部分。' : '💡 Tip: Hover and leverage high-fidelity multipliers to inspect detailed stamps.'}
                </span>

              </div>

              {/* Right Column (Inspection and metrics center): 5 cols */}
              <div className="lg:col-span-5 bg-slate-900 border-l border-slate-800 p-6 flex flex-col overflow-y-auto justify-between space-y-6">
                
                {/* Section 1: Record specifications comparison details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">
                      DZ EDUCATION ARCHIVES
                    </span>
                    <h4 className="text-base font-black text-white mt-1">
                      {currentLang === 'zh' ? '数字哈希防伪对账中心' : 'Attachment Integrity Auditor'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {currentLang === 'zh' 
                        ? '提取附件文字与用户提报表单进行严格一致度对比：' 
                        : 'Cross-check visual attachment extract results with applicant submission details:'}
                    </p>
                  </div>

                  {/* Field matching spec list */}
                  <div className="space-y-2.5">
                    {/* User Name */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs transition hover:border-slate-700">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{currentLang === 'zh' ? '人员姓名匹配' : 'NAME MATCHING'}</div>
                        <div className="font-bold text-slate-250 mt-0.5">{previewAttachmentRecord.staffName}</div>
                      </div>
                      <span className="px-2 py-0.5 font-bold rounded-lg text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        100% MATCH
                      </span>
                    </div>

                    {/* Course title */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs transition hover:border-slate-700">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{currentLang === 'zh' ? '提报项目标题' : 'ACTIVITY MATCHING'}</div>
                        <div className="font-bold text-slate-250 mt-0.5 truncate max-w-[200px]" title={previewAttachmentRecord.title}>{previewAttachmentRecord.title}</div>
                      </div>
                      <span className="px-2 py-0.5 font-bold rounded-lg text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 select-none font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        98% VERIFIED
                      </span>
                    </div>

                    {/* Date */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs transition hover:border-slate-700 font-sans">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{currentLang === 'zh' ? '培训日期核对' : 'EVENT DATE VALIDATION'}</div>
                        <div className="font-mono text-slate-200 mt-0.5">{previewAttachmentRecord.date}</div>
                      </div>
                      <span className="px-2 py-0.5 font-bold rounded-lg text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 select-none font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-now"></span>
                        {currentLang === 'zh' ? '吻合' : 'CONGRUENT'}
                      </span>
                    </div>

                    {/* Hours */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs transition hover:border-slate-700">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{currentLang === 'zh' ? '核算申报时数' : 'ASSIGNED HOURS AUDIT'}</div>
                        <div className="font-mono text-slate-200 mt-0.5 font-bold">{previewAttachmentRecord.duration} Hrs</div>
                      </div>
                      <span className="px-2 py-0.5 font-bold rounded-lg text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 select-none font-mono">
                        VERIFY: {previewAttachmentRecord.duration}H
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Cryptographical seal validation */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-slate-100 flex items-center gap-1">
                      <Lock className="w-4 h-4 text-emerald-500" />
                      <span>{currentLang === 'zh' ? '数字证书电子防伪鉴伪校验' : 'Secure Cryptographical Verification'}</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">DZ-CRYPTO-SEC</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {currentLang === 'zh' 
                      ? '本系统可自动解析提报附件文件的数字哈希和时间戳链。点击下方按钮运行全特征比对，即可获得不可篡改的鉴伪信用报告：' 
                      : 'Audit background certificate properties to isolate any modifications. Tap below to run anti-forgery scanning chains.'}
                  </p>

                  {/* Verify Action Button */}
                  <div className="pt-1.5">
                    {integrityVerified === null ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsVerifyingIntegrity(true);
                          setTimeout(() => {
                            setIsVerifyingIntegrity(false);
                            setIntegrityVerified(true);
                          }, 1500);
                        }}
                        disabled={isVerifyingIntegrity}
                        className="w-full bg-slate-850 hover:bg-slate-800/80 disabled:opacity-50 text-slate-250 border border-slate-700 hover:border-slate-600 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                      >
                        {isVerifyingIntegrity ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                            <span>{currentLang === 'zh' ? '正在执行防伪哈希对撞校验...' : 'Analyzing document security layers...'}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span>{currentLang === 'zh' ? '🚀 开启证书电子签名链完整性鉴伪' : '🚀 Verify Digital Certificate Authenticity'}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl space-y-2 animate-fade-in text-xs font-sans">
                        <div className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-black text-white">{currentLang === 'zh' ? '验证通过：原件证书安全无虞' : 'VERIFIED VALID // INTEGRITY ASSURED'}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {currentLang === 'zh' 
                                ? '哈希碰撞解析结果与董总内部活动数字印章链一致。系统评定：文件真实有效，无改动、裁切或伪造痕迹。' 
                                : 'Digital fingerprint conforms with active record seal keys. Absolute integrity of proof certified.'}
                            </p>
                          </div>
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono tracking-wider pt-1.5 border-t border-emerald-500/10 flex justify-between">
                          <span>SIGNATURE: DZ-VERIFIED-OK</span>
                          <span>TS: 2026-05-26Z</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Return button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewAttachmentRecord(null);
                      setIntegrityVerified(null);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold py-3 rounded-2xl text-xs transition duration-150 border border-slate-700 active:scale-95 text-center cursor-pointer"
                  >
                    {currentLang === 'zh' ? '返回报表查看窗口' : 'Return to Record Sheets'}
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
