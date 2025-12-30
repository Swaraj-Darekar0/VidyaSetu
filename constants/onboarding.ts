export const OnboardingPalette = {
  background: '#050505',
  surface: '#111111',
  card: '#181818',
  elevated: '#1F1F1F',
  accent: '#D7FF5F',
  accentMuted: '#9CC04A',
  textPrimary: '#F5F5F5',
  textSecondary: '#B4B6B9',
  outline: '#2A2A2A',
  muted: '#5E5E5E',
};

export type ClassOption = {
  id: string;
  label: string;
  subtitle: string;
};

export const classOptions: ClassOption[] = [
  { id: '5', label: 'Class 5', subtitle: 'Build strong basics' },
  { id: '6', label: 'Class 6', subtitle: 'Discover new topics' },
  { id: '7', label: 'Class 7', subtitle: 'Strengthen core skills' },
  { id: '8', label: 'Class 8', subtitle: 'Dive into projects' },
  { id: '9', label: 'Class 9', subtitle: 'Prepare for boards' },
  { id: '10', label: 'Class 10', subtitle: 'Master fundamentals' },
  { id: '11', label: 'Class 11', subtitle: 'Specialise for streams' },
  { id: '12', label: 'Class 12', subtitle: 'Get exam ready' },
];

export type SubjectOption = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export const subjectLibrary: Record<string, SubjectOption> = {
  english: {
    id: 'english',
    title: 'English',
    description: 'Grow reading & speaking skills',
    icon: 'book-outline',
  },
  marathi_hindi: {
    id: 'marathi_hindi',
    title: 'Marathi / Hindi',
    description: 'Stay confident in native languages',
    icon: 'chatbubble-ellipses-outline',
  },
  hindi: {
    id: 'hindi',
    title: 'Hindi',
    description: 'Improve Hindi fluency',
    icon: 'create-outline',
  },
  hindi_sanskrit: {
    id: 'hindi_sanskrit',
    title: 'Hindi / Sanskrit',
    description: 'Blend classical and modern language skills',
    icon: 'school-outline',
  },
  math: {
    id: 'math',
    title: 'Mathematics',
    description: 'Problem solving & logic',
    icon: 'calculator-outline',
  },
  evs: {
    id: 'evs',
    title: 'EVS',
    description: 'Environmental awareness & basics',
    icon: 'leaf-outline',
  },
  science_computer: {
    id: 'science_computer',
    title: 'Science & Computers',
    description: 'Introduction to science and computer skills',
    icon: 'desktop-outline',
  },
  science: {
    id: 'science',
    title: 'Science',
    description: 'Physics, chemistry & biology fundamentals',
    icon: 'flask-outline',
  },
  history: {
    id: 'history',
    title: 'History',
    description: 'Civilisations & events',
    icon: 'time-outline',
  },
  civics: {
    id: 'civics',
    title: 'Civics',
    description: 'Citizenship & social structure',
    icon: 'people-outline',
  },
  geography: {
    id: 'geography',
    title: 'Geography',
    description: 'Maps, earth systems & resources',
    icon: 'earth-outline',
  },
  history_ps: {
    id: 'history_ps',
    title: 'History + Political Science',
    description: 'Modern history & civics combined',
    icon: 'library-outline',
  },
  economics: {
    id: 'economics',
    title: 'Economics',
    description: 'Money, trade & decision making',
    icon: 'cash-outline',
  },
  disaster_management: {
    id: 'disaster_management',
    title: 'Disaster Management',
    description: 'Plan, prepare and stay safe',
    icon: 'warning-outline',
  },
};

export const classSubjectMap: Record<string, string[]> = {
  '5': ['english', 'marathi_hindi', 'hindi', 'math', 'evs', 'science_computer'],
  '6': ['english', 'marathi_hindi', 'hindi_sanskrit', 'math', 'science', 'history', 'civics', 'geography'],
  '7': ['english', 'marathi_hindi', 'hindi_sanskrit', 'math', 'science', 'history', 'civics', 'geography'],
  '8': ['english', 'marathi_hindi', 'hindi_sanskrit', 'math', 'science', 'history', 'civics', 'geography'],
  '9': ['english', 'marathi_hindi', 'math', 'science', 'geography', 'history_ps', 'economics', 'disaster_management'],
  '10': ['english', 'marathi_hindi', 'math', 'science', 'geography', 'history_ps', 'economics', 'disaster_management'],
};

export const getSubjectsForClass = (classId: string): SubjectOption[] => {
  const subjectIds = classSubjectMap[classId];
  if (!subjectIds) {
    return Object.values(subjectLibrary);
  }
  return subjectIds.map((id) => subjectLibrary[id]).filter(Boolean);
};

export const getSubjectDefinition = (subjectId: string) => subjectLibrary[subjectId];

export type DownloadStatus = 'done' | 'downloading' | 'queued';

export type DownloadItem = {
  id: string;
  title: string;
  size: string;
  status: DownloadStatus;
  progress: number;
  icon: string;
};

export const downloadQueue: DownloadItem[] = [
  {
    id: 'neural',
    title: 'Neural Networks',
    size: '120 MB',
    status: 'done',
    progress: 1,
    icon: 'scan-circle-outline',
  },
  {
    id: 'data-science',
    title: 'Data Science Fundamentals',
    size: '95 MB',
    status: 'done',
    progress: 1,
    icon: 'analytics-outline',
  },
  {
    id: 'python-ai',
    title: 'Python for AI',
    size: '210 MB',
    status: 'downloading',
    progress: 0.55,
    icon: 'code-slash-outline',
  },
  {
    id: 'algorithms',
    title: 'Advanced Algorithms',
    size: '150 MB',
    status: 'queued',
    progress: 0,
    icon: 'git-network-outline',
  },
  {
    id: 'robotics',
    title: 'Robotics Basics',
    size: '85 MB',
    status: 'queued',
    progress: 0,
    icon: 'hardware-chip-outline',
  },
];
