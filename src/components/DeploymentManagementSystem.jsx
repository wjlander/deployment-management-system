import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Users, Calendar, Settings, Save, Download, TrendingUp, FileText, Copy, CalendarDays, Edit2 } from 'lucide-react';

const DeploymentManagementSystem = () => {
  const [currentPage, setCurrentPage] = useState('deployment');
  const [selectedDate, setSelectedDate] = useState('08/09/2025');
  const [staff, setStaff] = useState([
    { id: 1, name: 'Will Lander', isUnder18: false },
    { id: 2, name: 'Shane Whiteley', isUnder18: false },
    { id: 3, name: 'Craig Lloyd', isUnder18: false },
    { id: 4, name: 'Evan Anderson', isUnder18: true },
    { id: 5, name: 'Max Lloyd', isUnder18: false },
    { id: 6, name: 'Jessica Ford', isUnder18: false },
    { id: 7, name: 'Sam Edwards', isUnder18: false }
  ]);

  const [deploymentsByDate, setDeploymentsByDate] = useState({
    '08/09/2025': [
      { id: 1, staffId: 1, startTime: '15:00', endTime: '00:00', position: 'DT', secondary: 'DT Pack', area: 'Float / Bottlenecks', cleaning: 'Lobby / Toilets', breakMinutes: 30 },
      { id: 2, staffId: 2, startTime: '16:00', endTime: '00:00', position: 'Cook', secondary: 'Transfer', area: 'Cooks', cleaning: '', breakMinutes: 30 },
      { id: 3, staffId: 3, startTime: '17:00', endTime: '00:00', position: 'DT2', secondary: 'Fries', area: 'Cooks', cleaning: '', breakMinutes: 30 },
      { id: 4, staffId: 4, startTime: '17:00', endTime: '23:30', position: 'Burgers', secondary: 'Chick', area: 'Pck Mid', cleaning: '', breakMinutes: 30 },
      { id: 5, staffId: 5, startTime: '17:00', endTime: '21:00', position: 'Rst', secondary: 'Rst Pack', area: 'Table Service / Lobby', cleaning: '', breakMinutes: 15 },
      { id: 6, staffId: 6, startTime: '18:00', endTime: '23:00', position: 'DT', secondary: 'Pres', area: 'Lobby', cleaning: 'Front', breakMinutes: 15 },
      { id: 7, staffId: 7, startTime: '12:00', endTime: '20:00', position: 'Chick', secondary: 'Deliv Pack', area: 'Float / Bottlenecks', cleaning: '', breakMinutes: 30 }
    ]
  });

  const [shiftInfoByDate, setShiftInfoByDate] = useState({
    '08/09/2025': {
      date: '08/09/2025',
      forecast: '£4,100.00',
      dayShiftForecast: '£2,500.00',
      nightShiftForecast: '£1,600.00',
      weather: 'Warm and Dry',
      notes: 'Lets really go for upselling today guys and lets get a fantastic DT Time. Mention the Survey and lets leave the customers with a fantastic experience'
    }
  });

  const [salesData, setSalesData] = useState({
    todayData: '',
    lastWeekData: '',
    lastYearData: ''
  });

  const [parsedSalesData, setParsedSalesData] = useState({
    today: [],
    lastWeek: [],
    lastYear: []
  });

  const [newStaff, setNewStaff] = useState({ name: '', isUnder18: false });
  const [newDeployment, setNewDeployment] = useState({
    staffId: '',
    startTime: '',
    endTime: '',
    position: '',
    secondary: '',
    area: '',
    cleaning: ''
  });

  const [showNewDateModal, setShowNewDateModal] = useState(false);
  const [newDate, setNewDate] = useState('');

  const currentDeployments = deploymentsByDate[selectedDate] || [];
  const currentShiftInfo = shiftInfoByDate[selectedDate] || {
    date: selectedDate,
    forecast: '£0.00',
    dayShiftForecast: '£0.00',
    nightShiftForecast: '£0.00',
    weather: '',
    notes: ''
  };

  const positions = ['DT', 'DT2', 'Cook', 'Cook2', 'Burgers', 'Fries', 'Chick', 'Rst', 'Lobby', 'Front', 'Mid', 'Transfer', 'T1'];
  const packPositions = ['DT Pack', 'Rst Pack', 'Deliv Pack'];
  const secondaryPositions = [...positions, ...packPositions];
  const areas = ['Cooks', 'DT', 'Front', 'Mid', 'Lobby', 'Pck Mid', 'Float / Bottlenecks', 'Table Service / Lobby'];
  const cleaningAreas = ['Lobby / Toilets', 'Front', 'Staff Room / Toilet', 'Kitchen'];

  useEffect(() => {
    const data = {
      staff,
      deploymentsByDate,
      shiftInfoByDate
    };
    localStorage.setItem('deploymentData', JSON.stringify(data));
  }, [staff, deploymentsByDate, shiftInfoByDate]);

  useEffect(() => {
    const savedData = localStorage.getItem('deploymentData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.staff) setStaff(parsed.staff);
        if (parsed.deploymentsByDate) setDeploymentsByDate(parsed.deploymentsByDate);
        if (parsed.shiftInfoByDate) setShiftInfoByDate(parsed.shiftInfoByDate);
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);

  const calculateWorkHours = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let start = startHour + startMin / 60;
    let end = endHour + endMin / 60;
    
    if (end < start) {
      end += 24;
    }
    
    return end - start;
  };

  const calculateBreakTime = (staffMember, workHours) => {
    if (staffMember && staffMember.isUnder18) {
      return 30;
    }
    
    if (workHours >= 6) {
      return 30;
    } else if (workHours >= 4.5) {
      return 15;
    }
    
    return 0;
  };

  const getBreakTimeClass = (breakTime) => {
    if (breakTime === 30) return 'bg-green-100 text-green-800';
    if (breakTime === 15) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const addStaff = () => {
    if (newStaff.name) {
      const newStaffMember = {
        id: Date.now(),
        name: newStaff.name,
        isUnder18: newStaff.isUnder18
      };
      setStaff(prev => [...prev, newStaffMember]);
      setNewStaff({ name: '', isUnder18: false });
    }
  };

  const removeStaff = (id) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    setDeploymentsByDate(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(date => {
        updated[date] = updated[date].filter(d => d.staffId !== id);
      });
      return updated;
    });
  };

  const addDeployment = () => {
    if (newDeployment.staffId && newDeployment.startTime && newDeployment.endTime && newDeployment.position) {
      const staffMember = staff.find(s => s.id === parseInt(newDeployment.staffId));
      const workHours = calculateWorkHours(newDeployment.startTime, newDeployment.endTime);
      const breakTime = calculateBreakTime(staffMember, workHours);
      
      const deployment = {
        id: Date.now(),
        ...newDeployment,
        staffId: parseInt(newDeployment.staffId),
        breakMinutes: breakTime
      };
      
      setDeploymentsByDate(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), deployment]
      }));
      
      setNewDeployment({
        staffId: '',
        startTime: '',
        endTime: '',
        position: '',
        secondary: '',
        area: '',
        cleaning: ''
      });
    }
  };

  const removeDeployment = (id) => {
    setDeploymentsByDate(prev => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter(d => d.id !== id)
    }));
  };

  const updateShiftInfo = (field, value) => {
    setShiftInfoByDate(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [field]: value
      }
    }));
  };

  const createNewDate = () => {
    if (newDate && !deploymentsByDate[newDate]) {
      setDeploymentsByDate(prev => ({
        ...prev,
        [newDate]: []
      }));
      setShiftInfoByDate(prev => ({
        ...prev,
        [newDate]: {
          date: newDate,
          forecast: '£0.00',
          dayShiftForecast: '£0.00',
          nightShiftForecast: '£0.00',
          weather: '',
          notes: ''
        }
      }));
      setSelectedDate(newDate);
      setNewDate('');
      setShowNewDateModal(false);
    }
  };

  const duplicateDeployment = (fromDate) => {
    if (fromDate && fromDate !== selectedDate && deploymentsByDate[fromDate]) {
      const deploymentsToCopy = deploymentsByDate[fromDate].map(d => ({
        ...d,
        id: Date.now() + Math.random()
      }));
      
      setDeploymentsByDate(prev => ({
        ...prev,
        [selectedDate]: deploymentsToCopy
      }));

      if (shiftInfoByDate[fromDate]) {
        const shiftInfoToCopy = {
          ...shiftInfoByDate[fromDate],
          date: selectedDate
        };
        setShiftInfoByDate(prev => ({
          ...prev,
          [selectedDate]: shiftInfoToCopy
        }));
      }
    }
  };

  const deleteDate = (dateToDelete) => {
    if (dateToDelete && Object.keys(deploymentsByDate).length > 1) {
      const newDeployments = { ...deploymentsByDate };
      const newShiftInfo = { ...shiftInfoByDate };
      delete newDeployments[dateToDelete];
      delete newShiftInfo[dateToDelete];
      
      setDeploymentsByDate(newDeployments);
      setShiftInfoByDate(newShiftInfo);
      
      if (selectedDate === dateToDelete) {
        const remainingDates = Object.keys(newDeployments);
        setSelectedDate(remainingDates[0]);
      }
    }
  };

  const getStaffName = (staffId) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? staffMember.name : 'Unknown';
  };

  const parseSalesDataText = (text) => {
    if (!text.trim()) return [];
    
    const lines = text.split('\n').filter(line => line.trim());
    const data = [];
    
    lines.forEach(line => {
      const parts = line.split(/\s+/);
      if (parts.length >= 4 && parts[0].includes(':')) {
        const time = parts[0];
        const forecast = parts[1] || '£0.00';
        const actual = parts[2] || '£0.00';
        const lastYear = parts[3] || '£0.00';
        
        data.push({
          time,
          forecast: forecast.replace('£', ''),
          actual: actual.replace('£', ''),
          lastYear: lastYear.replace('£', '')
        });
      }
    });
    
    return data;
  };

  const handleSalesDataParse = () => {
    setParsedSalesData({
      today: parseSalesDataText(salesData.todayData),
      lastWeek: parseSalesDataText(salesData.lastWeekData),
      lastYear: parseSalesDataText(salesData.lastYearData)
    });
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    
    const deploymentRows = currentDeployments.map(d => {
      const staffMember = staff.find(s => s.id === d.staffId);
      const workHours = calculateWorkHours(d.startTime, d.endTime);
      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">
            ${getStaffName(d.staffId)}${staffMember?.isUnder18 ? ' (U18)' : ''}
          </td>
          <td style="border: 1px solid #ddd; padding: 8px;">
            ${d.startTime} - ${d.endTime}<br>
            <small>${workHours.toFixed(1)}h</small>
          </td>
          <td style="border: 1px solid #ddd; padding: 8px;">${d.position}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${d.secondary}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${d.area}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${d.breakMinutes}min</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${d.cleaning}</td>
        </tr>
      `;
    }).join('');

    const forecastRows = parsedSalesData.today.map((item, index) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 6px;">${item.time}</td>
        <td style="border: 1px solid #ddd; padding: 6px;">£${item.forecast}</td>
        <td style="border: 1px solid #ddd; padding: 6px;">£${item.actual}</td>
        <td style="border: 1px solid #ddd; padding: 6px;">£${parsedSalesData.lastWeek[index]?.forecast || '0.00'}</td>
        <td style="border: 1px solid #ddd; padding: 6px;">£${parsedSalesData.lastYear[index]?.forecast || '0.00'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Deployment Report - ${selectedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
            @media print { body { margin: 0; } .page-break { page-break-before: always; } }
          </style>
        </head>
        <body>
          <div style="page-break-after: always;">
            <h1 style="text-align: center; margin-bottom: 20px;">Daily Deployment - ${selectedDate}</h1>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div><strong>Forecast:</strong> ${currentShiftInfo.forecast}</div>
              <div><strong>Weather:</strong> ${currentShiftInfo.weather}</div>
              <div><strong>Day Shift (10am-4pm):</strong> ${currentShiftInfo.dayShiftForecast}</div>
              <div><strong>Night Shift (4pm-11pm):</strong> ${currentShiftInfo.nightShiftForecast}</div>
            </div>
            <div style="margin-bottom: 20px;"><strong>Notes:</strong> ${currentShiftInfo.notes}</div>
            <table>
              <thead>
                <tr>
                  <th>Staff</th><th>Time</th><th>Position</th><th>Secondary</th><th>Area</th><th>Break</th><th>Cleaning</th>
                </tr>
              </thead>
              <tbody>${deploymentRows}</tbody>
            </table>
          </div>
          <div class="page-break">
            <h1 style="text-align: center; margin-bottom: 20px;">Sales Forecast - ${selectedDate}</h1>
            <table style="font-size: 12px;">
              <thead>
                <tr>
                  <th>Time</th><th>Today Forecast</th><th>Today Actual</th><th>Last Week</th><th>Last Year</th>
                </tr>
              </thead>
              <tbody>${forecastRows}</tbody>
            </table>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const exportData = () => {
    const data = {
      staff,
      deploymentsByDate,
      shiftInfoByDate,
      salesData: parsedSalesData
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-system-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const renderDateSelector = () => {
    const dates = Object.keys(deploymentsByDate).sort();
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Select Date:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {dates.map(date => {
              const isSelected = selectedDate === date;
              const deploymentCount = (deploymentsByDate[date] || []).length;
              const buttonClass = isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
              
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${buttonClass}`}
                >
                  {date}
                  <span className="ml-2 text-xs">
                    ({deploymentCount})
                  </span>
                </button>
              );
            })}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewDateModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Date
            </button>
            
            {dates.length > 1 && (
              <button
                onClick={() => deleteDate(selectedDate)}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
        
        {currentDeployments.length === 0 && dates.filter(d => d !== selectedDate).length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Copy from existing date:</span>
            </div>
            <div className="flex gap-2">
              {dates.filter(date => date !== selectedDate).map(date => (
                <button
                  key={date}
                  onClick={() => duplicateDeployment(date)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Copy from {date} ({(deploymentsByDate[date] || []).length} deployments)
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNavigation = () => (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="flex">
        {[
          { id: 'deployment', label: 'Deployment', icon: Calendar },
          { id: 'staff', label: 'Staff Management', icon: Users },
          { id: 'forecast', label: 'Sales Forecast', icon: TrendingUp }
        ].map(({ id, label, icon: Icon }) => {
          const isActive = currentPage === id;
          const buttonClass = isActive
            ? 'border-blue-500 text-blue-600 bg-blue-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
          
          return (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${buttonClass}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderDeploymentPage = () => (
    <div className="space-y-6">
      {renderDateSelector()}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Deployment for {selectedDate}</h1>
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Backup Data
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Forecast</label>
            <input
              type="text"
              value={currentShiftInfo.forecast}
              onChange={(e) => updateShiftInfo('forecast', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day Shift (10am-4pm)</label>
            <input
              type="text"
              value={currentShiftInfo.dayShiftForecast}
              onChange={(e) => updateShiftInfo('dayShiftForecast', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Night Shift (4pm-11pm)</label>
            <input
              type="text"
              value={currentShiftInfo.nightShiftForecast}
              onChange={(e) => updateShiftInfo('nightShiftForecast', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
            <input
              type="text"
              value={currentShiftInfo.weather}
              onChange={(e) => updateShiftInfo('weather', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shift Notes</label>
          <textarea
            value={currentShiftInfo.notes}
            onChange={(e) => updateShiftInfo('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={2}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Add New Deployment</h2>
        </div>

        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <select
              value={newDeployment.staffId}
              onChange={(e) => setNewDeployment(prev => ({ ...prev, staffId: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Staff</option>
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} {member.isUnder18 ? '(Under 18)' : ''}
                </option>
              ))}
            </select>
            <select
              value={newDeployment.position}
              onChange={(e) => setNewDeployment(prev => ({ ...prev, position: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Position</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            <input
              type="time"
              placeholder="Start Time"
              value={newDeployment.startTime}
              onChange={(e) => setNewDeployment(prev => ({ ...prev, startTime: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="time"
              placeholder="End Time"
              value={newDeployment.endTime}
              onChange={(e) => setNewDeployment(prev => ({ ...prev, endTime: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={newDeployment.secondary}
              onChange={(e) => setNewDeployment(prev => ({ ...prev, secondary: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Secondary Position</option>
              {secondaryPositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            <select
              value={newDeployment.area}
              onChange={(e) => setNewDeployment(prev => ({ ...prev, area: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Area</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <select
              value={newDeployment.cleaning}
              onChange={(e) => setNewDeployment(prev => ({ ...prev, cleaning: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Cleaning Area (Optional)</option>
              {cleaningAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            <button
              onClick={addDeployment}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Add Deployment
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secondary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Break</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleaning</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDeployments.map(deployment => {
                const staffMember = staff.find(s => s.id === deployment.staffId);
                const workHours = calculateWorkHours(deployment.startTime, deployment.endTime);
                const breakTime = deployment.breakMinutes;
                
                return (
                  <tr key={deployment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {getStaffName(deployment.staffId)}
                          {staffMember?.isUnder18 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              U18
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {deployment.startTime} - {deployment.endTime}
                      </div>
                      <div className="text-sm text-gray-500">
                        {workHours.toFixed(1)} hours
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {deployment.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deployment.secondary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deployment.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBreakTimeClass(breakTime)}`}>
                        {breakTime} min
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deployment.cleaning}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeDeployment(deployment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {currentDeployments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No deployments scheduled for this date. Add some deployments above.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStaffPage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Staff Management</h2>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Staff Name"
              value={newStaff.name}
              onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newStaff.isUnder18}
                onChange={(e) => setNewStaff(prev => ({ ...prev, isUnder18: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Under 18</span>
            </label>
            <button
              onClick={addStaff}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Staff
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.isUnder18 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Under 18
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        18+
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => removeStaff(member.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderForecastPage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Sales Forecast Data</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Today's Data</label>
            <textarea
              value={salesData.todayData}
              onChange={(e) => setSalesData(prev => ({ ...prev, todayData: e.target.value }))}
              placeholder="Paste today's hourly data here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Week's Data</label>
            <textarea
              value={salesData.lastWeekData}
              onChange={(e) => setSalesData(prev => ({ ...prev, lastWeekData: e.target.value }))}
              placeholder="Paste last week's hourly data here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Year's Data</label>
            <textarea
              value={salesData.lastYearData}
              onChange={(e) => setSalesData(prev => ({ ...prev, lastYearData: e.target.value }))}
              placeholder="Paste last year's hourly data here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
        </div>

        <button
          onClick={handleSalesDataParse}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Save className="w-4 h-4" />
          Parse Data
        </button>

        {parsedSalesData.today.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today Forecast</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today Actual</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Week</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Year</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedSalesData.today.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.time}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">£{item.forecast}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">£{item.actual}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      £{parsedSalesData.lastWeek[index]?.forecast || '0.00'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      £{parsedSalesData.lastYear[index]?.forecast || '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {renderNavigation()}
        
        {currentPage === 'deployment' && renderDeploymentPage()}
        {currentPage === 'staff' && renderStaffPage()}
        {currentPage === 'forecast' && renderForecastPage()}
        
        {showNewDateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Add New Date</h3>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowNewDateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeploymentManagementSystem;