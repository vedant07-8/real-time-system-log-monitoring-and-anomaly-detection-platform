import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { mockEmployees, getNodePositions } from '../data/mockData';

interface NeuralNetworkProps {
  onNodeClick: (employeeId: string) => void;
}

export default function NeuralNetwork({ onNodeClick }: NeuralNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const nodePositions = getNodePositions();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      nodePositions.forEach((node1, i) => {
        nodePositions.forEach((node2, j) => {
          if (i < j) {
            const distance = Math.sqrt(
              Math.pow((node2.x - node1.x) * 2, 2) + Math.pow((node2.y - node1.y) * 2, 2)
            );

            if (distance < 250) {
              ctx.beginPath();
              ctx.moveTo(node1.x * 2, node1.y * 2);
              ctx.lineTo(node2.x * 2, node2.y * 2);
              ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - distance / 250)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [nodePositions]);

  const getNodeColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'from-green-500 to-emerald-500';
      case 'yellow':
        return 'from-yellow-500 to-amber-500';
      case 'red':
        return 'from-red-500 to-rose-500';
      case 'purple':
        return 'from-purple-500 to-violet-500';
      default:
        return 'from-blue-500 to-indigo-500';
    }
  };

  return (
    <div className="relative w-full h-[500px] glass-card rounded-xl p-8">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="absolute inset-0 w-full h-full"
      />

      {nodePositions.map((pos, idx) => {
        const employee = mockEmployees[idx];
        return (
          <motion.button
            key={employee.id}
            onClick={() => onNodeClick(employee.id)}
            onMouseEnter={() => setHoveredNode(employee.id)}
            onMouseLeave={() => setHoveredNode(null)}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <div
                className={`size-16 rounded-full bg-gradient-to-br ${getNodeColor(
                  pos.color
                )} flex items-center justify-center shadow-lg cursor-pointer transition-all`}
              >
                <span className="text-2xl">{employee.avatar}</span>
              </div>

              {pos.color === 'purple' && (
                <div className="absolute -top-1 -right-1">
                  <div className="size-4 rounded-full bg-yellow-400 animate-pulse" />
                </div>
              )}

              {pos.color === 'red' && (
                <div className="absolute -top-1 -right-1">
                  <div className="size-4 rounded-full bg-red-500 animate-glow" />
                </div>
              )}

              {hoveredNode === employee.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 glass-card p-3 rounded-lg whitespace-nowrap z-10"
                >
                  <p className="text-sm">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">{employee.role}</p>
                  <p className="text-xs text-primary mt-1">Score: {employee.workforceScore}</p>
                </motion.div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
