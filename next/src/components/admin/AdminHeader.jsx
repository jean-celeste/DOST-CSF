import React, { useState, useEffect } from 'react';

function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const day = date.toLocaleString('en-US', { weekday: 'long' });
  const month = date.toLocaleString('en-US', { month: '2-digit' });
  const dayNum = date.toLocaleString('en-US', { day: '2-digit' });
  const year = date.getFullYear();
  const time = date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  return {
    datePart: `${day}, ${month}/${dayNum}/${year}`,
    timePart: time
  };
}

export default function AdminHeader({ headerTitle }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { datePart, timePart } = formatDate(time);

  return (
    <div className="w-full flex justify-center bg-transparent">
      <header className="max-w-7xl w-full mx-auto mt-4 rounded-lg bg-white border-b shadow-sm flex items-center justify-between px-8 h-16">
        <h1 className="text-lg font-bold text-gray-800">{headerTitle}</h1>
        <div className="text-sm text-gray-500 font-mono select-none">
          {datePart}
          <span className="text-gray-400 font-normal ml-1">{timePart}</span>
        </div>
      </header>
    </div>
  );
} 