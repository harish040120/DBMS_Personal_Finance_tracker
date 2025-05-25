import React, { useState, useEffect } from 'react';
import { Download, Calendar, ChevronDown, PieChart, BarChart3, LineChart, Table } from 'lucide-react';
import { format } from 'date-fns';
import { 
  BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend 
} from 'recharts';
import { fetchReportData, ReportData } from '../services/api';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('spending');
  const [timeRange, setTimeRange] = useState('month');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'table'>('bar');
  
  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchReportData(reportType, timeRange);
        setReportData(data);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportData();
  }, [reportType, timeRange]);

  const handleExport = () => {
    // In a real app, this would download a CSV or PDF
    alert('Exporting report...');
  };

  const COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#64D2FF'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <button 
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <Download size={16} className="mr-1" /> Export
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <label htmlFor="report-type" className="block text-xs font-medium text-gray-500 mb-1">
              Report Type
            </label>
            <select
              id="report-type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="appearance-none block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition duration-150 ease-in-out"
            >
              <option value="spending">Spending Overview</option>
              <option value="income">Income Analysis</option>
              <option value="categories">Category Breakdown</option>
              <option value="balance">Balance Trends</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500" style={{top: '20px'}}>
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="time-range" className="block text-xs font-medium text-gray-500 mb-1">
              Time Range
            </label>
            <select
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition duration-150 ease-in-out"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 3 months</option>
              <option value="year">Last 12 months</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500" style={{top: '20px'}}>
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="ml-auto flex items-end space-x-2">
            <button 
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <BarChart3 size={18} />
            </button>
            <button 
              onClick={() => setChartType('line')}
              className={`p-2 rounded-md ${chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <LineChart size={18} />
            </button>
            <button 
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-md ${chartType === 'pie' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <PieChart size={18} />
            </button>
            <button 
              onClick={() => setChartType('table')}
              className={`p-2 rounded-md ${chartType === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Table size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Report Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {reportType === 'spending' && 'Spending Overview'}
          {reportType === 'income' && 'Income Analysis'}
          {reportType === 'categories' && 'Category Breakdown'}
          {reportType === 'balance' && 'Balance Trends'}
        </h2>

        <div className="h-96">
          {!reportData ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">No data available for the selected period.</p>
            </div>
          ) : chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Amount']}
                  contentStyle={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                />
                <Legend />
                {reportData.series.map((serie, index) => (
                  <Bar key={serie} dataKey={serie} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : chartType === 'line' ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={reportData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Amount']}
                  contentStyle={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                />
                <Legend />
                {reportData.series.map((serie, index) => (
                  <Line 
                    key={serie} 
                    type="monotone" 
                    dataKey={serie} 
                    stroke={COLORS[index % COLORS.length]} 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : chartType === 'pie' ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Legend />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Pie
                  data={reportData.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {reportData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="overflow-x-auto h-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.categoryData.map((category, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          ></div>
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${category.value.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {((category.value / reportData.categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ${reportData.categoryData.reduce((sum, cat) => sum + cat.value, 0).toFixed(2)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      100%
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {reportData?.summary.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">${item.value.toFixed(2)}</p>
              <p className={`text-xs flex items-center mt-1 ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.change >= 0 ? '+' : ''}{item.change}% from previous period
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;