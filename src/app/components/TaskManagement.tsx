import { motion } from 'motion/react';
import { Clock, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { mockTasks, mockEmployees } from '../data/mockData';

const statusColumns = [
  { id: 'todo', title: 'To Do', color: 'from-gray-500 to-slate-500' },
  { id: 'in-progress', title: 'In Progress', color: 'from-blue-500 to-indigo-500' },
  { id: 'review', title: 'Review', color: 'from-purple-500 to-violet-500' },
  { id: 'completed', title: 'Completed', color: 'from-green-500 to-emerald-500' },
];

const priorityColors = {
  critical: 'from-red-500 to-rose-500',
  high: 'from-orange-500 to-amber-500',
  medium: 'from-yellow-500 to-yellow-600',
  low: 'from-blue-500 to-cyan-500',
};

export default function TaskManagement() {
  const getEmployeeName = (id: string) => {
    return mockEmployees.find((e) => e.id === id)?.name || 'Unassigned';
  };

  const getEmployeeAvatar = (id: string) => {
    return mockEmployees.find((e) => e.id === id)?.avatar || '👤';
  };

  return (
    <div className="flex-1 overflow-auto p-8 bg-neural-grid relative z-10">
      <div className="mb-8">
        <h1 className="mb-2 gradient-text">Task Management</h1>
        <p className="text-muted-foreground">AI-powered task distribution and tracking</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {statusColumns.map((column, colIdx) => {
          const tasks = mockTasks.filter((t) => t.status === column.id);

          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIdx * 0.1 }}
              className="space-y-4"
            >
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3>{column.title}</h3>
                  <div className={`size-8 rounded-lg bg-gradient-to-br ${column.color} flex items-center justify-center`}>
                    <span className="text-sm text-white">{tasks.length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {tasks.map((task, taskIdx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: colIdx * 0.1 + taskIdx * 0.05 }}
                    className="glass-card glass-card-hover rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${priorityColors[task.priority]} text-xs text-white`}>
                        {task.priority}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="size-3" />
                        {task.aiComplexity.toFixed(1)}
                      </div>
                    </div>

                    <h4 className="mb-2 text-sm">{task.title}</h4>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {task.estimatedHours}h
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Difficulty: {task.difficulty}/10
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-primary/20">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs">
                          {getEmployeeAvatar(task.assignedTo)}
                        </div>
                        <span className="text-xs">{getEmployeeName(task.assignedTo).split(' ')[0]}</span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    {task.status === 'todo' && new Date(task.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
                        <AlertCircle className="size-3" />
                        Due soon
                      </div>
                    )}

                    {task.status === 'completed' && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                        <CheckCircle className="size-3" />
                        Completed
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
