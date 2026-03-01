'use client';

interface ProgressCircleProps {
  percentage: number;
}

export default function ProgressCircle({ percentage }: ProgressCircleProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        {/* Percentage Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">{percentage}%</p>
            <p className="text-xs text-gray-600 mt-1">Selesai</p>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-4 text-center">
        Progres keseluruhan pesanan Anda
      </p>
    </div>
  );
}
