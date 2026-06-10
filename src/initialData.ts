import { User, TrainingRecord, TrainingAnnouncement, PolicySection, PointRule, AuditLog } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'staff-1',
    name: 'Lim Kok Seng',
    chineseName: '林国成',
    email: 'kslim@dongzong.my',
    role: 'staff',
    department: 'Information Technology Department (资讯处)',
    targetPoints: 10,
    password: 'staff123',
    staffNo: 'DZ-2019-035'
  },
  {
    id: 'staff-2',
    name: 'Tan Bee Lian',
    chineseName: '陈美莲',
    email: 'bltan@dongzong.my',
    role: 'staff',
    department: 'Teacher Education Department (教师教育处)',
    targetPoints: 10,
    password: 'staff123',
    staffNo: 'DZ-2021-124'
  },
  {
    id: 'staff-3',
    name: 'Wong Siew Fai',
    chineseName: '黄绍辉',
    email: 'sfwong@dongzong.my',
    role: 'staff',
    department: 'Unified Examination Department (统一考试处)',
    targetPoints: 10,
    password: 'staff123',
    staffNo: 'DZ-2015-007'
  },
  {
    id: 'hr-1',
    name: 'HR Admin',
    chineseName: '人事处处长',
    email: 'ymlow@dongzong.my',
    role: 'hr_admin',
    password: 'admin123',
    staffNo: 'DZ-2010-001'
  },
  {
    id: 'hr-2',
    name: 'HR Agent - Chan',
    chineseName: '曾德华',
    email: 'dhchan@dongzong.my',
    role: 'hr_agent',
    password: 'agent123',
    staffNo: 'DZ-2023-012'
  }
];

export const INITIAL_RECORDS: TrainingRecord[] = [
  {
    id: 'rec-1',
    staffName: 'Lim Kok Seng',
    staffEmail: 'kslim@dongzong.my',
    department: 'Information Technology Department (资讯处)',
    title: 'AWS Certified Cloud Practitioner Bootcamp',
    organiser: 'Amazon Web Services Malaysia',
    type: 'online',
    date: '2026-02-15',
    duration: 8,
    venue: 'Online Self-Paced & Labs',
    description: 'Encircled cloud computing fundamentals, global infrastructure, security, and pricing models to aid in Dong Zong server virtualization.',
    fileName: 'aws_completion_cert.pdf',
    fileSize: '1.2 MB',
    fileData: 'data:application/pdf;base64,JVBERi0xLjQK...', // Placeholder representation
    submissionDate: '2026-02-16',
    status: 'Verified',
    remarks: 'Approved. Relevant to the current server migration planning of internal UEC databases.'
  },
  {
    id: 'rec-2',
    staffName: 'Tan Bee Lian',
    staffEmail: 'bltan@dongzong.my',
    department: 'Teacher Education Department (教师教育处)',
    title: 'Interaction Design in Contemporary Hybrid Classrooms',
    organiser: 'National Institute of Education (NIE) Taiwan',
    type: 'workshop',
    date: '2026-05-10',
    duration: 12,
    venue: 'Zoom Interactive Session',
    description: 'Learned active learning strategies and collaborative online tools (Miro, Slido) to integrate into teacher retraining curricula.',
    fileName: 'nie_attendance_proof.pdf',
    fileSize: '850 KB',
    submissionDate: '2026-05-12',
    status: 'Pending Verification'
  },
  {
    id: 'rec-3',
    staffName: 'Wong Siew Fai',
    staffEmail: 'sfwong@dongzong.my',
    department: 'Unified Examination Department (统一考试处)',
    title: 'Public Speaking & Empathy in Leadership',
    organiser: 'Kuala Lumpur Training Hub',
    type: 'seminar',
    date: '2026-01-20',
    duration: 3,
    venue: 'KLSCC, Kuala Lumpur',
    description: 'Attended full lecture about delivering administrative decisions with conviction.',
    fileName: 'unclear_ticket.png',
    fileSize: '340 KB',
    submissionDate: '2026-01-22',
    status: 'Rejected',
    remarks: 'The submitted ticket upload is blurry and fails to prove active attendance. Please re-submit with the formal Certificate or official Letter of Attendance.'
  },
  {
    id: 'rec-4',
    staffName: 'Wong Siew Fai',
    staffEmail: 'sfwong@dongzong.my',
    department: 'Unified Examination Department (统一考试处)',
    title: '2026 ASEAN Summit on Educational Assessment & UEC Standards',
    organiser: 'ASEAN Exam Boards Consortium',
    type: 'conference',
    date: '2026-03-05',
    duration: 18,
    venue: 'EQ Hotel, Kuala Lumpur',
    description: 'A 3-day deep-dive conference touching on modern statistical moderation, psychometrics, and standards benchmarking.',
    fileName: 'asean_exam_board_cert_wong.pdf',
    fileSize: '3.1 MB',
    submissionDate: '2026-03-09',
    status: 'Verified',
    remarks: 'Highly commendable conference. Provides direct statistical insights for our exam analysts.'
  }
];

export const INITIAL_ANNOUNCEMENTS: TrainingAnnouncement[] = [
  {
    id: 'ann-1',
    title: '2026 Educational Data Security & Privacy Protection Seminar',
    date: '2026-06-20',
    time: '09:00 - 13:00',
    venue: 'Dong Zong Administration Building, Hall A / Online Hybrid',
    organiser: 'Dong Zong IT Unit x Cyber Security Malaysia',
    targetParticipants: 'All administrative officers and unit heads handling student databases',
    category: 'Internal Training',
    deadline: '2026-06-15',
    registrationLink: 'https://forms.dongzong.my/security-2026',
    contactPerson: 'Mr. Lim (Ext 244) / IT Unit',
    description: 'A mandatory annual seminar focusing on PDPA regulations, phishing avoidance, secure student record management, and cloud safety protocols.',
    fileName: 'data_security_brochure.pdf',
    isArchived: false
  },
  {
    id: 'ann-2',
    title: 'Pedagogical Shift: ChatGPT & Generative AI Workshop in Secondary Curriculum',
    date: '2026-07-05',
    time: '14:00 - 17:30',
    venue: 'Zoom Webinar',
    organiser: 'Teacher Education Unit, Dong Zong',
    targetParticipants: 'Curriculum Developers, Subject Specialists, and Independent High School Teachers',
    category: 'Workshop / Working Group',
    deadline: '2026-06-30',
    registrationLink: 'https://forms.dongzong.my/ai-curriculum-2026',
    contactPerson: 'Ms. Tan (Ext 115) / Teacher Education',
    description: 'Learn the ethical guidelines, prompting tricks, and assignment designing techniques to embrace AI responsibly in standard syllabus development.',
    fileName: 'ai_curriculum_agenda.pdf',
    isArchived: false
  }
];

export const INITIAL_POI_RULES: PointRule = {
  hoursPerPoint: 2,
  maxPointsPerYear: 10
};

export const INITIAL_POLICIES: PolicySection[] = [
  {
    id: 'pol-1',
    titleEn: '1. Annual Training Requirements & Point System',
    titleZh: '1. 年度培训要求与积分制度',
    contentEn: 'To support continuous professional development, Dong Zong requires each staff member to achieve a minimum of 10 Training Points (the equivalent of 20 verified training hours) per calendar year. New employees starting after July 1st are required to complete a pro-rated 5 points.',
    contentZh: '为支持员工的持续专业发展，董总要求每位员工在每个日历年内获得至少 10 个培训积分（等同于 20 个经审核的培训小时）。7月1日之后入职的新员工，其年度积分目标按比例调整为 5 个积分。'
  },
  {
    id: 'pol-2',
    titleEn: '2. Standard Point Calculation Method',
    titleZh: '2. 积分计算标准与换算公式',
    contentEn: '• Training Points are calculated strictly on verified training hours.\n• 2 Training Hours = 1 Training Point.\n• Minimum claim is 0.5 hours (0.25 points).\n• Maximum claimable points per year is capped at 10 Points (20 verified hours). Points accumulated beyond 10 are recorded for development history but will not count toward additional annual bonus compliance.',
    contentZh: '• 培训积分严格根据经审核的培训小时进行计算。\n• 每 2 个培训小时 = 1 个培训积分。\n• 最低申报时长为 0.5 小时（可换算 0.25 积分）。\n• 每人每年可申报并计入考核的上限为 10 个积分（即 20 个培训小时）。超出 10 个积分的记录将记录于个人专业成长简历，但不累加年度考核富余积分。'
  },
  {
    id: 'pol-3',
    titleEn: '3. Eligible Training Categories',
    titleZh: '3. 认可培训类别一览',
    contentEn: '• Internal Training: Organised directly by Dong Zong Secretariat or sections.\n• External Training: Courses organized by external universities, corporations, or official agencies.\n• Seminar/Conference: National or international symposiums on pedagogy, administration, or Chinese education.\n• Workshop: Practical training or coordination labs with clear agendas.\n• Online Course: Self-paced modules with certificate proofs (e.g., Coursera, Udemy, EdX).',
    contentZh: '• 内部培训：由董总行政处或各部门直接组织的内部技能/素质培训。\n• 外部培训：由校外大专、专业培训机构或政府机构举办的课程。\n• 研讨会与学术会议：国内外关于教育、独中课程、行政管理的学术论坛、研讨会。\n• 工作坊：含有实际实操性质或协调会议性质的专业培训班。\n• 线上课程：包含自学式且有结业证书的数字平台课程（如 Coursera、Udemy、EdX等）。'
  },
  {
    id: 'pol-4',
    titleEn: '4. Claim Procedure & Support Documents',
    titleZh: '4. 培训积分申报与证明文件要求',
    contentEn: '• Staff must submit claims within 30 days of completing any training using this online system.\n• Submissions must include clear digital supporting documents. Acceptable documents include:\n  1. Certificate of Completion / Attendance;\n  2. Digital Attendance logs or formal invitation schedule letters with registration validation;\n  3. Official payment receipt paired with syllabus approval.\n• HR Admin will review plans, with statuses updating to Certified, Rejected, or Correction Requested.',
    contentZh: '• 员工必须在完成培训后 30 天内通过本在线系统提交积分申报。\n• 每次申报必须上传清晰的数字化证明文件。可接受的证明包括：\n  1. 结业证书 (Certificate of Completion) / 出席证明证书 (Certificate of Attendance)；\n  2. 含有官方印章的代表邀请函、会议手册或签到表记录；\n  3. 经主管批准的付款收据和课程大纲。\n• 人事处（HR）将在14个工作日内进行审核。结果将转为 “已审核” (Verified)、“已驳回” (Rejected) 或 “要求更正” (Correction Requested)。'
  },
  {
    id: 'pol-5',
    titleEn: '5. Frequently Asked Questions (FAQ)',
    titleZh: '5. 常见问题解答 (FAQ)',
    contentEn: 'Q: What if I attend a training that spans over two calendar years?\nA: The points will be distributed or awarded based on the completion date of the certificate.\n\nQ: Can external school visits or exchange programmes count?\nA: Yes, but they must have a prior section recommendation form uploaded together with a detailed reflection report summarizing hours of constructive meeting minutes.\n\nQ: Are points transferable to the next year?\nA: No. Training points must be completed and accounted for in the current year to ensure ongoing continuous training.',
    contentZh: '问：如果我参加的培训跨越两个日历年，该如何计算积分？\n答：积分原则上将根据结业证书/签到表上的实际完成日期发放计入该年份。\n\n问：学校参访、独中校际交流活动能够折算培训分吗？\n答：可以，但必须将经主管审批的推荐表以及包含详细具体研讨内容的考察报告一并打包上传，并根据汇报会议时长申报。\n\n问：当年多出来的积分能转给下一年吗？\n答：不能。所有培训积分仅限当年有效，不结转至下一年度，以鼓励大家坚持做到每年持续学习。'
  }
];

export const DEPARTMENTS: string[] = [
  'Leadership & Secretariat (秘书处/领导层)',
  'Information Technology Department (资讯处)',
  'Unified Examination Department (统一考试处)',
  'Teacher Education Department (教师教育处)',
  'Student Affairs Department (学务处)',
  'Curriculum Unit (课程局)',
  'Human Resources Unit (人力资源部)',
  'Publication & Public Relations Unit (出版与公关处)',
  'General Affairs Unit (总务处)'
];
