import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, Award, Zap, Target, AlertTriangle, Trophy } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Employee, getLevelTitle } from '../data/mockData';

interface EmployeeProfileProps {
  employee: Employee;
  onBack: () => void;
}

export default function EmployeeProfile({ employee, onBack }: EmployeeProfileProps) {
  const skillData = [
    { skill: 'Efficiency', value: employee.efficiency },
    { skill: 'Quality', value: employee.quality },
    { skill: 'Attendance', value: employee.attendance },
    { skill: 'Collaboration', value: employee.collaboration },
    { skill: 'Leadership', value: employee.leadershipPotential },
  ];

  const trendData = [
    { month: 'Jan', score: employee.workforceScore - 12 },
    { month: 'Feb', score: employee.workforceScore - 8 },
    { month: 'Mar', score: employee.workforceScore - 4 },
    { month: 'Apr', score: employee.workforceScore - 2 },
    { month: 'May', score: employee.workforceScore },
  ];

  const xpForNextLevel = (employee.level + 1) * 2000;
  const xpProgress = (employee.xp % 2000) / 2000 * 100;

  return (
    <div className="flex-1 overflow-auto p-8 bg-neural-grid relative z-10">
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="size-24 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-5xl neural-glow">
              {employee.avatar}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="mb-2">{employee.name}</h1>
                  <p className="text-muted-foreground mb-1">{employee.role}</p>
                  <p className="text-sm text-muted-foreground">{employee.department}</p>
                </div>

                <div className="text-right">
                  <div className="text-5xl mb-2 gradient-text">{employee.workforceScore}</div>
                  <p className="text-sm text-muted-foreground">Workforce Score</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${
                    employee.performanceTrend === 'up' ? 'bg-green-500' :
                    employee.performanceTrend === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm capitalize">{employee.performanceTrend} Trend</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-yellow-500" />
                  <span className="text-sm">{employee.streak} Day Streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="size-4 text-purple-500" />
                  <span className="text-sm">Level {employee.level} - {getLevelTitle(employee.level)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">XP Progress</span>
              <span className="text-sm">{employee.xp} / {xpForNextLevel} XP</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-primary to-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {employee.badges.map((badge, idx) => (
              <motion.div
                key={badge}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="glass-card rounded-lg p-3 flex items-center gap-2"
              >
                <Award className="size-5 text-primary" />
                <span className="text-sm">{badge}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="mb-4">Skill Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillData}>
                <PolarGrid stroke="rgba(99, 102, 241, 0.2)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="mb-4">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                <XAxis dataKey="month" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(17, 17, 27, 0.9)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                <TrendingUp className="size-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promotion Ready</p>
                <p className="text-2xl">{employee.promotionProbability}%</p>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-500"
                style={{ width: `${employee.promotionProbability}%` }}
              />
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <AlertTriangle className="size-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Burnout Risk</p>
                <p className="text-2xl">{employee.burnoutRisk}%</p>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                style={{ width: `${employee.burnoutRisk}%` }}
              />
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                <Target className="size-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Flight Risk</p>
                <p className="text-2xl">{employee.flightRisk}%</p>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-500"
                style={{ width: `${employee.flightRisk}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="glass-card rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-2">Tasks Completed</p>
            <p className="text-3xl">{employee.tasksCompleted}</p>
          </div>
          <div className="glass-card rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-2">Active Tasks</p>
            <p className="text-3xl">{employee.tasksActive}</p>
          </div>
          <div className="glass-card rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-2">Leadership Potential</p>
            <p className="text-3xl">{employee.leadershipPotential}%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
