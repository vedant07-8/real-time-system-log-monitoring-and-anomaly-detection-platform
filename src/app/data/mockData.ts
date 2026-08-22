export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  workforceScore: number;
  performanceTrend: 'up' | 'down' | 'stable';
  tasksCompleted: number;
  tasksActive: number;
  efficiency: number;
  quality: number;
  attendance: number;
  collaboration: number;
  promotionProbability: number;
  burnoutRisk: number;
  flightRisk: number;
  leadershipPotential: number;
  level: number;
  xp: number;
  badges: string[];
  streak: number;
  nodeColor: 'green' | 'yellow' | 'red' | 'purple';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  difficulty: number;
  estimatedHours: number;
  department: string;
  assignedTo: string;
  dueDate: string;
  aiComplexity: number;
}

export interface Alert {
  id: string;
  type: 'burnout' | 'promotion' | 'decline' | 'risk' | 'achievement';
  employeeId: string;
  employeeName: string;
  message: string;
  timestamp: string;
}

const levelTitles = [
  'Intern',
  'Associate',
  'Specialist',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'Executive'
];

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    avatar: '👩‍💻',
    workforceScore: 94,
    performanceTrend: 'up',
    tasksCompleted: 142,
    tasksActive: 5,
    efficiency: 96,
    quality: 98,
    attendance: 99,
    collaboration: 92,
    promotionProbability: 92,
    burnoutRisk: 15,
    flightRisk: 8,
    leadershipPotential: 88,
    level: 5,
    xp: 8750,
    badges: ['Fast Executor', 'Quality Champion', 'Team Player'],
    streak: 45,
    nodeColor: 'purple'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Product Manager',
    department: 'Product',
    avatar: '👨‍💼',
    workforceScore: 88,
    performanceTrend: 'stable',
    tasksCompleted: 98,
    tasksActive: 8,
    efficiency: 85,
    quality: 90,
    attendance: 95,
    collaboration: 94,
    promotionProbability: 75,
    burnoutRisk: 32,
    flightRisk: 12,
    leadershipPotential: 91,
    level: 4,
    xp: 6420,
    badges: ['Strategic Thinker', 'Collaboration Master'],
    streak: 28,
    nodeColor: 'green'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    role: 'UX Designer',
    department: 'Design',
    avatar: '👩‍🎨',
    workforceScore: 91,
    performanceTrend: 'up',
    tasksCompleted: 115,
    tasksActive: 6,
    efficiency: 92,
    quality: 95,
    attendance: 97,
    collaboration: 89,
    promotionProbability: 84,
    burnoutRisk: 18,
    flightRisk: 10,
    leadershipPotential: 78,
    level: 4,
    xp: 7100,
    badges: ['Creative Mind', 'User Champion', 'Fast Executor'],
    streak: 38,
    nodeColor: 'green'
  },
  {
    id: '4',
    name: 'David Park',
    role: 'DevOps Engineer',
    department: 'Engineering',
    avatar: '👨‍🔧',
    workforceScore: 72,
    performanceTrend: 'down',
    tasksCompleted: 64,
    tasksActive: 12,
    efficiency: 68,
    quality: 75,
    attendance: 82,
    collaboration: 70,
    promotionProbability: 28,
    burnoutRisk: 78,
    flightRisk: 65,
    leadershipPotential: 45,
    level: 3,
    xp: 4200,
    badges: ['Problem Solver'],
    streak: 5,
    nodeColor: 'red'
  },
  {
    id: '5',
    name: 'Aisha Patel',
    role: 'Data Scientist',
    department: 'Analytics',
    avatar: '👩‍🔬',
    workforceScore: 96,
    performanceTrend: 'up',
    tasksCompleted: 156,
    tasksActive: 4,
    efficiency: 97,
    quality: 99,
    attendance: 98,
    collaboration: 93,
    promotionProbability: 95,
    burnoutRisk: 12,
    flightRisk: 5,
    leadershipPotential: 92,
    level: 6,
    xp: 9850,
    badges: ['Data Wizard', 'Quality Champion', 'Innovation Leader', 'Fast Executor'],
    streak: 62,
    nodeColor: 'purple'
  },
  {
    id: '6',
    name: 'Tom Wilson',
    role: 'Marketing Manager',
    department: 'Marketing',
    avatar: '👨‍💻',
    workforceScore: 85,
    performanceTrend: 'stable',
    tasksCompleted: 87,
    tasksActive: 7,
    efficiency: 83,
    quality: 88,
    attendance: 92,
    collaboration: 86,
    promotionProbability: 68,
    burnoutRisk: 25,
    flightRisk: 15,
    leadershipPotential: 72,
    level: 4,
    xp: 5900,
    badges: ['Campaign Master', 'Team Player'],
    streak: 22,
    nodeColor: 'yellow'
  },
  {
    id: '7',
    name: 'Lisa Anderson',
    role: 'Sales Director',
    department: 'Sales',
    avatar: '👩‍💼',
    workforceScore: 89,
    performanceTrend: 'up',
    tasksCompleted: 124,
    tasksActive: 9,
    efficiency: 88,
    quality: 91,
    attendance: 96,
    collaboration: 87,
    promotionProbability: 81,
    burnoutRisk: 28,
    flightRisk: 18,
    leadershipPotential: 85,
    level: 5,
    xp: 7650,
    badges: ['Revenue Driver', 'Client Champion', 'Deal Closer'],
    streak: 34,
    nodeColor: 'green'
  },
  {
    id: '8',
    name: 'Kevin Zhang',
    role: 'Junior Developer',
    department: 'Engineering',
    avatar: '👨‍💻',
    workforceScore: 78,
    performanceTrend: 'stable',
    tasksCompleted: 52,
    tasksActive: 6,
    efficiency: 76,
    quality: 80,
    attendance: 88,
    collaboration: 82,
    promotionProbability: 45,
    burnoutRisk: 35,
    flightRisk: 22,
    leadershipPotential: 58,
    level: 2,
    xp: 3100,
    badges: ['Quick Learner'],
    streak: 15,
    nodeColor: 'yellow'
  }
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Implement AI-powered search feature',
    description: 'Build neural search with vector embeddings',
    status: 'in-progress',
    priority: 'critical',
    difficulty: 9,
    estimatedHours: 40,
    department: 'Engineering',
    assignedTo: '1',
    dueDate: '2026-06-10',
    aiComplexity: 8.5
  },
  {
    id: 't2',
    title: 'Q2 Product Roadmap Planning',
    description: 'Define strategic initiatives for Q2',
    status: 'review',
    priority: 'high',
    difficulty: 7,
    estimatedHours: 24,
    department: 'Product',
    assignedTo: '2',
    dueDate: '2026-06-05',
    aiComplexity: 6.2
  },
  {
    id: 't3',
    title: 'Redesign Dashboard UI',
    description: 'Modern glassmorphic interface update',
    status: 'in-progress',
    priority: 'high',
    difficulty: 8,
    estimatedHours: 32,
    department: 'Design',
    assignedTo: '3',
    dueDate: '2026-06-15',
    aiComplexity: 5.8
  },
  {
    id: 't4',
    title: 'Fix production deployment pipeline',
    description: 'CI/CD optimization and bug fixes',
    status: 'todo',
    priority: 'critical',
    difficulty: 8,
    estimatedHours: 20,
    department: 'Engineering',
    assignedTo: '4',
    dueDate: '2026-06-03',
    aiComplexity: 7.1
  },
  {
    id: 't5',
    title: 'Customer churn prediction model',
    description: 'ML model for predicting customer attrition',
    status: 'completed',
    priority: 'high',
    difficulty: 9,
    estimatedHours: 48,
    department: 'Analytics',
    assignedTo: '5',
    dueDate: '2026-05-28',
    aiComplexity: 9.2
  },
  {
    id: 't6',
    title: 'Launch email campaign',
    description: 'Q2 product launch campaign',
    status: 'in-progress',
    priority: 'medium',
    difficulty: 5,
    estimatedHours: 16,
    department: 'Marketing',
    assignedTo: '6',
    dueDate: '2026-06-08',
    aiComplexity: 4.5
  },
  {
    id: 't7',
    title: 'Enterprise client onboarding',
    description: 'Onboard Fortune 500 client',
    status: 'in-progress',
    priority: 'critical',
    difficulty: 7,
    estimatedHours: 30,
    department: 'Sales',
    assignedTo: '7',
    dueDate: '2026-06-12',
    aiComplexity: 6.8
  },
  {
    id: 't8',
    title: 'Update API documentation',
    description: 'Document all REST endpoints',
    status: 'todo',
    priority: 'low',
    difficulty: 4,
    estimatedHours: 12,
    department: 'Engineering',
    assignedTo: '8',
    dueDate: '2026-06-20',
    aiComplexity: 3.2
  }
];

export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    type: 'burnout',
    employeeId: '4',
    employeeName: 'David Park',
    message: 'High burnout risk detected - 78% probability',
    timestamp: '2 hours ago'
  },
  {
    id: 'a2',
    type: 'promotion',
    employeeId: '5',
    employeeName: 'Aisha Patel',
    message: 'Promotion candidate identified - 95% ready',
    timestamp: '5 hours ago'
  },
  {
    id: 'a3',
    type: 'risk',
    employeeId: '4',
    employeeName: 'David Park',
    message: 'Flight risk alert - 65% probability of resignation',
    timestamp: '1 day ago'
  },
  {
    id: 'a4',
    type: 'achievement',
    employeeId: '5',
    employeeName: 'Aisha Patel',
    message: 'Achieved 60-day streak - Performance excellence',
    timestamp: '1 day ago'
  },
  {
    id: 'a5',
    type: 'decline',
    employeeId: '4',
    employeeName: 'David Park',
    message: 'Productivity decline - 15% drop over 2 weeks',
    timestamp: '2 days ago'
  }
];

export const getLevelTitle = (level: number): string => {
  return levelTitles[level - 1] || 'Unknown';
};

export const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-400';
  if (score >= 75) return 'text-yellow-400';
  return 'text-red-400';
};

export const getNodePositions = () => {
  return mockEmployees.map((emp, index) => {
    const angle = (index / mockEmployees.length) * 2 * Math.PI;
    const radius = 180;
    return {
      id: emp.id,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
      color: emp.nodeColor
    };
  });
};
