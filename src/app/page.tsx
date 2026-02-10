'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  LayoutDashboard, RefreshCw, Filter, Search, Download, TrendingUp, TrendingDown,
  Activity, Clock, AlertCircle, CheckCircle
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// Типы данных
interface DataItem {
  id: string;
  title: string;
  value: number;
  category: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
}

interface DashboardStats {
  total: number;
  change: number;
  changePercent: number;
  averageValue: number;
}

// Генерация демо-данных
function generateDemoData(): DataItem[] {
  const categories = ['Категория 1', 'Категория 2', 'Категория 3', 'Категория 4'];
  const items: DataItem[] = [];

  for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    items.push({
      id: `item-${i}`,
      title: `Элемент #${i + 1}`,
      value: Math.floor(Math.random() * 1000) + 100,
      category: categories[Math.floor(Math.random() * categories.length)],
      date: date.toISOString(),
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
    });
  }

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Генерация данных для графиков
function generateChartData() {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      value: Math.floor(Math.random() * 500) + 200,
      previous: Math.floor(Math.random() * 500) + 200,
    });
  }
  return data;
}

// Fetcher для SWR
const fetcher = () => Promise.resolve({
  items: generateDemoData(),
  chartData: generateChartData(),
  lastUpdated: new Date().toISOString(),
});

export default function Home() {
  const [period, setPeriod] = useState('Месяц');
  const [category, setCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Используем SWR для кэширования и автообновления
  const { data, error, mutate } = useSWR('dashboard-data', fetcher, {
    refreshInterval: 60000, // Обновлять каждую минуту
    revalidateOnFocus: true,
  });

  const items = data?.items || [];
  const chartData = data?.chartData || [];
  const lastUpdated = data?.lastUpdated;

  // Фильтрация данных
  const filteredItems = items.filter(item => {
    const matchesCategory = category === 'Все' || item.category === category;
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Расчёт статистики
  const stats: DashboardStats = {
    total: filteredItems.length,
    change: filteredItems.filter(i => i.trend === 'up').length - filteredItems.filter(i => i.trend === 'down').length,
    changePercent: filteredItems.length > 0
      ? Math.round((filteredItems.filter(i => i.trend === 'up').length / filteredItems.length) * 100)
      : 0,
    averageValue: filteredItems.length > 0
      ? Math.round(filteredItems.reduce((sum, i) => sum + i.value, 0) / filteredItems.length)
      : 0,
  };

  // Данные для pie chart
  const categoryData = ['Категория 1', 'Категория 2', 'Категория 3', 'Категория 4'].map(cat => ({
    name: cat,
    value: items.filter(i => i.category === cat).length,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  // Ручное обновление
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await mutate();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Экспорт данных
  const handleExport = () => {
    const csv = [
      'ID,Название,Значение,Категория,Дата,Тренд',
      ...filteredItems.map(i => `${i.id},"${i.title}",${i.value},${i.category},${i.date},${i.trend}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Smart Travel Planning Application Dashboard</h1>
              <p className="text-xs text-slate-400">Дашборд для мониторинга Пользователи испытывают трудности с планированием путешествий, используя множество приложений и инструментов, что приводит к путанице и потере времени.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Обновлено: {new Date(lastUpdated).toLocaleTimeString('ru-RU')}</span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
              title="Обновить"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              title="Экспорт"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option>Сегодня</option>
              <option>Неделя</option>
              <option>Месяц</option>
              <option>Год</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option>Все</option>
              <option>Категория 1</option>
              <option>Категория 2</option>
              <option>Категория 3</option>
              <option>Категория 4</option>
            </select>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Всего записей</p>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Изменение</p>
              {stats.change >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <p className={`text-3xl font-bold mt-2 ${stats.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.change >= 0 ? '+' : ''}{stats.change}
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Рост</p>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold mt-2">{stats.changePercent}%</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-fadeIn" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Среднее значение</p>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold mt-2">{stats.averageValue}</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Динамика</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold mb-4">По категориям</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index] }} />
                  <span className="text-slate-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="font-semibold">Данные ({filteredItems.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Название</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Значение</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Категория</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Дата</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Тренд</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredItems.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm">{item.title}</td>
                    <td className="px-4 py-3 text-sm font-medium">{item.value}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-slate-700 rounded-md text-xs">{item.category}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(item.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                      {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                      {item.trend === 'stable' && <span className="text-slate-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredItems.length > 10 && (
            <div className="p-4 border-t border-slate-700 text-center">
              <p className="text-sm text-slate-400">
                Показано 10 из {filteredItems.length} записей
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>Создано с помощью TrendHunter AI</p>
        </div>
      </footer>
    </main>
  );
}
