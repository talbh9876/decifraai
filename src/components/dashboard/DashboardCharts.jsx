import React, { useMemo } from "react";
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, PieChart as PieIcon, AlertTriangle } from "lucide-react";

export default function DashboardCharts({ documents }) {
  // Calculate trend data - documents over time
  const trendData = useMemo(() => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' });
      
      const count = documents.filter(doc => {
        const docDate = new Date(doc.created_date);
        return docDate.toDateString() === date.toDateString();
      }).length;
      
      last7Days.push({ date: dateStr, count });
    }
    
    return last7Days;
  }, [documents]);

  // Calculate document type distribution
  const typeData = useMemo(() => {
    const typeCounts = {};
    const typeLabels = {
      employment_contract: "חוזה עבודה",
      rental_agreement: "שכירות",
      pay_slip: "תלוש שכר",
      insurance_policy: "ביטוח",
      loan_agreement: "הלוואה",
      purchase_agreement: "רכישה",
      other: "אחר"
    };
    
    documents.forEach(doc => {
      const type = doc.document_type || "other";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: typeLabels[type] || type,
      value: count
    }));
  }, [documents]);

  // Calculate risk scores
  const riskData = useMemo(() => {
    const riskLevels = { low: 0, medium: 0, high: 0 };
    
    documents.forEach(doc => {
      const risks = doc.ai_analysis?.risk_factors?.length || 0;
      if (risks === 0) riskLevels.low++;
      else if (risks <= 2) riskLevels.medium++;
      else riskLevels.high++;
    });
    
    return [
      { name: "סיכון נמוך", value: riskLevels.low, color: "#10B981" },
      { name: "סיכון בינוני", value: riskLevels.medium, color: "#F59E0B" },
      { name: "סיכון גבוה", value: riskLevels.high, color: "#EF4444" }
    ];
  }, [documents]);

  const COLORS = ['#2E6BDE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Trend Chart */}
      <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#2E6BDE]" />
          <h3 className="font-bold text-[#1A1F36]">מגמת העלאות (7 ימים אחרונים)</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EB" />
            <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #E3E6EB',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Line type="monotone" dataKey="count" stroke="#2E6BDE" strokeWidth={2} dot={{ fill: '#2E6BDE' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Document Type Distribution */}
      <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PieIcon className="w-5 h-5 text-[#10B981]" />
          <h3 className="font-bold text-[#1A1F36]">התפלגות סוגי מסמכים</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={typeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {typeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #E3E6EB',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Distribution */}
      <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 shadow-sm lg:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="font-bold text-[#1A1F36]">התפלגות רמות סיכון</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={riskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EB" />
            <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #E3E6EB',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {riskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}