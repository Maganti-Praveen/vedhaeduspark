import { motion } from 'framer-motion';

export const SkeletonCard = () => (
  <div className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
    <div className="skeleton h-4 w-24 mb-4"></div>
    <div className="skeleton h-6 w-3/4 mb-3"></div>
    <div className="skeleton h-4 w-full mb-2"></div>
    <div className="skeleton h-4 w-2/3 mb-6"></div>
    <div className="flex gap-2 mb-4">
      <div className="skeleton h-6 w-16 rounded-full"></div>
      <div className="skeleton h-6 w-16 rounded-full"></div>
      <div className="skeleton h-6 w-16 rounded-full"></div>
    </div>
    <div className="skeleton h-10 w-28 rounded-full"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white rounded-[16px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'var(--gray-50)' }}>
          <div className="skeleton w-5 h-5 rounded-full"></div>
          <div className="skeleton h-4 flex-1"></div>
          <div className="skeleton h-5 w-16 rounded-full"></div>
          <div className="skeleton h-4 w-20"></div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonIDE = () => (
  <div className="grid lg:grid-cols-2 gap-4 animate-pulse">
    <div className="bg-white rounded-[16px] p-6 shadow-sm space-y-4" style={{ border: '1px solid var(--gray-200)' }}>
      <div className="skeleton h-8 w-3/4"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-2/3"></div>
      <div className="skeleton h-32 w-full"></div>
    </div>
    <div className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
      <div className="skeleton h-full min-h-[400px] w-full"></div>
    </div>
  </div>
);
