import React from 'react';
import { Users, Code, Calendar, Award } from 'lucide-react';
import { ImpactMetric } from '../types';

interface ImpactMetricsProps {
  metrics: ImpactMetric[];
}

export const ImpactMetrics: React.FC<ImpactMetricsProps> = ({ metrics }) => {
  const getIconAndColor = (index: number) => {
    switch (index % 4) {
      case 0:
        return {
          icon: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          valueColor: 'text-blue-600 dark:text-blue-400',
          bgIcon: 'bg-blue-50 dark:bg-blue-950/50'
        };
      case 1:
        return {
          icon: <Code className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          valueColor: 'text-emerald-600 dark:text-emerald-400',
          bgIcon: 'bg-emerald-50 dark:bg-emerald-950/50'
        };
      case 2:
        return {
          icon: <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
          valueColor: 'text-purple-600 dark:text-purple-400',
          bgIcon: 'bg-purple-50 dark:bg-purple-950/50'
        };
      case 3:
      default:
        return {
          icon: <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          valueColor: 'text-amber-600 dark:text-amber-400',
          bgIcon: 'bg-amber-50 dark:bg-amber-950/50'
        };
    }
  };

  return (
    <section className="py-6 sm:py-8 bg-white dark:bg-[#0c142c] border-b border-slate-200 dark:border-slate-800 shadow-sm" aria-label="Key Highlights">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((metric, i) => {
            const style = getIconAndColor(i);
            return (
              <div 
                key={i} 
                className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className={`w-11 h-11 rounded-lg ${style.bgIcon} flex items-center justify-center shrink-0`}>
                  {style.icon}
                </div>
                <div className="min-w-0">
                  <div className={`font-display text-2xl sm:text-3xl font-bold ${style.valueColor} tracking-tight leading-none mb-1`}>
                    {metric.value}
                  </div>
                  <div className="font-medium text-slate-700 dark:text-slate-300 text-xs sm:text-sm truncate">
                    {metric.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
