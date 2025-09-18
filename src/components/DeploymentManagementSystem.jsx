import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Users, Calendar, Settings, Save, Download, TrendingUp, FileText, Copy, CalendarDays, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const DeploymentManagementSystem = () => {
  const [currentPage, setCurrentPage] = useState('deployment');
  const [selectedDate, setSelectedDate] = useState('08/09/2025');
  const [staff, setStaff] = useState([]);

  const [positions, setPositions] = useState({
    position: ['DT', 'DT2', 'Cook', 'Cook2', 'Burgers', 'Fries', 'Chick', 'Rst', 'Lobby', 'Front', 'Mid', 'Transfer', 'T1'],
    pack_position: ['DT Pack', 'Rst Pack', 'Deliv Pack'],
    area: ['Cooks', 'DT', 'Front', 'Mid', 'Lobby', 'Pck Mid', 'Float / Bottlenecks', 'Table Service / Lobby'],
    cleaning_area: ['Lobby / Toilets', 'Front', 'Staff Room / Toilet', 'Kitchen']
  });

  // Store deployments by date
  const [deploymentsByDate, setDeploymentsByDate] = useState({});

  // Store shift info by date
  const [shiftInfoByDate, setShiftInfoByDate] = useState({});

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
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [usingSupabase, setUsingSupabase] = useState(false);

  // Get current deployments and shift info
  const currentDeployments = deploymentsByDate[selectedDate] || [];
  const currentShiftInfo = shiftInfoByDate[selectedDate] || {
    date: selectedDate,
    forecast: '£0.00',
    dayShiftForecast: '£0.00',
    nightShiftForecast: '£0.00',
    weather: '',
    notes: ''
  };

  // Check if Supabase is configured
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const { data, error } = await supabase.from('staff').select('count').limit(1);
        if (!error) {
          setUsingSupabase(true);
          await loadFromSupabase();
        } else {
          console.log('Supabase not configured, using local storage');
          loadFromLocalStorage();
        }
      } catch (e) {
        console.log('Supabase not available, using local storage');
        loadFromLocalStorage();
      }
      setIsLoading(false);
    };
    
    checkSupabase();
  }, []);

  const loadFromSupabase = async () => {
    try {
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, name, is_under_18');
      setSaveStatus('Loading...');
      
      // Load staff
      const { error: staffError } = await supabase
      if (staffData && staffData.length > 0) {
      const { data: staffData, error: staffError } = await supabase
          name: s.name,
          isUnder18: s.is_under_18
        })), { onConflict: 'id' });
        setStaff(formattedStaff);
      }

      // Load positions
      const { data: deploymentsData, error: deploymentsError } = await supabase
      if (positionsData && positionsData.length > 0) {
        const groupedPositions = {
          position: [],
          pack_position: [],
          area: [],
          cleaning_area: []
        };
        
        positionsData.forEach(p => {
          if (groupedPositions[p.type]) {
            groupedPositions[p.type].push(p.name);
          }
        });
        
        setPositions(groupedPositions);
        .select('id, date, staff_id, start_time, end_time, position, secondary, area, cleaning, break_minutes');

      // Load deployments
      const { data: deploymentsData } = await supabase.from('deployments').select('*');
      if (deploymentsData && deploymentsData.length > 0) {
        const groupedDeployments = {};
        deploymentsData.forEach(d => {
          if (!groupedDeployments[d.date]) {
            groupedDeployments[d.date] = [];
          }
          groupedDeployments[d.date].push({
            id: d.id,
            staffId: d.staff_id,
            startTime: d.start_time,
            endTime: d.end_time,
            position: d.position,
            secondary: d.secondary || '',
            area: d.area || '',
            cleaning: d.cleaning || '',
            breakMinutes: d.break_minutes || 0
          });
        });
        setDeploymentsByDate(groupedDeployments);
        .select('date, forecast, day_shift_forecast, night_shift_forecast, weather, notes');

      // Load shift info
      const { data: shiftData, error: shiftError } = await supabase
      if (shiftData && shiftData.length > 0) {
        const groupedShiftInfo = {};
        shiftData.forEach(s => {
          groupedShiftInfo[s.date] = {
            date: s.date,
            forecast: s.forecast || '£0.00',
            dayShiftForecast: s.day_shift_forecast || '£0.00',
            nightShiftForecast: s.night_shift_forecast || '£0.00',
            weather: s.weather || '',
            notes: s.notes || ''
          };
        });
        setShiftInfoByDate(groupedShiftInfo);
      }

      // Load sales data
      const { data: salesDataResult } = await supabase.from('sales_data').select('*').maybeSingle();
      if (salesDataResult !== null) {
        setSalesData({
          todayData: salesDataResult.today_data || '',
          lastWeekData: salesDataResult.last_week_data || '',
          lastYearData: salesDataResult.last_year_data || ''
        });
      }

      setSaveStatus('Loaded ✓');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      setSaveStatus('Load failed ✗');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const loadFromLocalStorage = () => {
    const savedData = localStorage.getItem('deploymentData');
    if (savedData) {
      try {
        const { staff: savedStaff, deploymentsByDate: savedDeployments, shiftInfoByDate: savedShiftInfo, positions: savedPositions, salesData: savedSalesData } = JSON.parse(savedData);
        if (savedStaff) setStaff(savedStaff);
        if (savedDeployments) setDeploymentsByDate(savedDeployments);
        if (savedShiftInfo) setShiftInfoByDate(savedShiftInfo);
        if (savedPositions) setPositions(savedPositions);
        if (savedSalesData) setSalesData(savedSalesData);
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  };

  const saveToSupabase = async () => {
    if (!usingSupabase) return;
    
    try {
      setSaveStatus('Saving...');
      
      // Save staff
      await supabase.from('staff').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const staffToSave = staff.map(s => ({
        id: s.id,
        name: s.name,
        is_under_18: s.isUnder18
      }));
      await supabase.from('staff').insert(staffToSave);

      // Save positions
      await supabase.from('positions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const positionsToSave = [];
      Object.entries(positions).forEach(([type, names]) => {
        names.forEach(name => {
          positionsToSave.push({ name, type });
        });
      });
      if (positionsToSave.length > 0) {
        await supabase.from('positions').insert(positionsToSave);
      }

      // Save deployments
      await supabase.from('deployments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const deploymentsToSave = [];
      Object.entries(deploymentsByDate).forEach(([date, deployments]) => {
        deployments.forEach(d => {
          deploymentsToSave.push({
      const { error: deploymentsError } = await supabase
            date,
        .upsert(currentDeployments.map(d => ({
            end_time: d.endTime,
            position: d.position,
            secondary: d.secondary || '',
            area: d.area || '',
            cleaning: d.cleaning || '',
            break_minutes: d.breakMinutes || 0
          });
        });
      });
        })), { onConflict: 'id' });
        await supabase.from('deployments').insert(deploymentsToSave);
      }

      // Save shift info
      await supabase.from('shift_info').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const shiftInfoToSave = Object.values(shiftInfoByDate).map(s => ({
        date: s.date,
        forecast: s.forecast,
        day_shift_forecast: s.dayShiftForecast,
        night_shift_forecast: s.nightShiftForecast,
        weather: s.weather,
      const { error: shiftError } = await supabase
      }));
        .upsert({
        await supabase.from('shift_info').insert(shiftInfoToSave);
      }

      // Save sales data
      await supabase.from('sales_data').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('sales_data').insert({
        }, { onConflict: 'date' });
        last_week_data: salesData.lastWeekData,
        last_year_data: salesData.lastYearData
      });

      setSaveStatus('Saved ✓');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      setSaveStatus('Save failed ✗');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('deploymentData', JSON.stringify({
      staff,
      deploymentsByDate,
      shiftInfoByDate,
      positions,
      salesData
    }));
  };

  // Save data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      if (usingSupabase) {
        saveToSupabase();
      } else {
        saveToLocalStorage();
      }
    }
  }, [staff, deploymentsByDate, shiftInfoByDate, positions, salesData, isLoading, usingSupabase]);

  const calculateWorkHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
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
    if (!staffMember) return 0;
    
    if (staffMember.isUnder18) {
      return 30;
    }
    
    if (workHours >= 6) {
      return 30;
    } else if (workHours >= 4.5) {
      return 15;
    }
    
    return 0;
  };

  const addStaff = () => {
    if (newStaff.name) {
      const newStaffMember = {
        id: crypto.randomUUID(),
        name: newStaff.name,
        isUnder18: newStaff.isUnder18
      };
      setStaff(prev => [...prev, newStaffMember]);
      setNewStaff({ name: '', isUnder18: false });
    }
  };

  const removeStaff = (id) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    // Remove from all deployments
    setDeploymentsByDate(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(date => {
        updated[date] = updated[date].filter(d => d.staffId !== id);
      });
      return updated;
    });
  };

  const addDeployment = () => {
    if (newDeployment.staffId && newDeployment.startTime && newDeployment.endTime) {
      const staffMember = staff.find(s => s.id === newDeployment.staffId);
      const workHours = calculateWorkHours(newDeployment.startTime, newDeployment.endTime);
      const breakTime = calculateBreakTime(staffMember, workHours);
      
      const deployment = {
        id: crypto.randomUUID(),
        ...newDeployment,
        staffId: newDeployment.staffId,
        breakMinutes: breakTime,
        position: newDeployment.position || ''
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

  const updateDeployment = (id, field, value) => {
    setDeploymentsByDate(prev => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).map(d => {
        if (d.id === id) {
          const updated = { ...d, [field]: value };
          
          // Recalculate break time if start/end time changes
          if (field === 'startTime' || field === 'endTime') {
            const staffMember = staff.find(s => s.id === d.staffId);
            const workHours = calculateWorkHours(
              field === 'startTime' ? value : d.startTime,
              field === 'endTime' ? value : d.endTime
            );
            updated.breakMinutes = calculateBreakTime(staffMember, workHours);
          }
          
          return updated;
        }
        return d;
      })
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
        id: crypto.randomUUID()
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

  const addPosition = (type, name) => {
    if (name && !positions[type].includes(name)) {
      setPositions(prev => ({
        ...prev,
        [type]: [...prev[type], name]
      }));
    }
  };

  const removePosition = (type, name) => {
    setPositions(prev => ({
      ...prev,
      [type]: prev[type].filter(p => p !== name)
    }));
  };

  const parseSalesData = (data) => {
    if (!data) return [];
    
    const lines = data.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        return {
          time: parts[0],
          sales: parts[1],
          transactions: parts[2] || '',
          average: parts[3] || ''
        };
      }
      return null;
    }).filter(Boolean);
  };

  useEffect(() => {
    setParsedSalesData({
      today: parseSalesData(salesData.todayData),
      lastWeek: parseSalesData(salesData.lastWeekData),
      lastYear: parseSalesData(salesData.lastYearData)
    });
  }, [salesData]);

  const exportToPDF = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Deployment Management System...</p>
        </div>
      </div>
    );
  }

  const renderNavigation = () => (
    <nav className="bg-white shadow-sm border-b mb-6">
      <div className="flex space-x-8 px-6">
        {[
          { id: 'deployment', label: 'Deployment', icon: Calendar },
          { id: 'staff', label: 'Staff Management', icon: Users },
          { id: 'positions', label: 'Position Management', icon: Settings },
          { id: 'sales', label: 'Sales Analysis', icon: TrendingUp }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setCurrentPage(id)}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
              currentPage === id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );

  const renderDeploymentPage = () => (
    <div className="space-y-6">
      {/* Header with date selection and actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-800">Deployment Schedule</h2>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(deploymentsByDate).map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {saveStatus && (
              <span className={`text-sm px-2 py-1 rounded ${
                saveStatus.includes('✓') ? 'bg-green-100 text-green-700' :
                saveStatus.includes('✗') ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {saveStatus}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {usingSupabase ? '☁️ Cloud Storage' : '💾 Local Storage'}
            </span>
            <button
              onClick={() => setShowNewDateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Date</span>
            </button>
            <button
              onClick={exportToPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Shift Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Forecast</label>
            <input
              type="text"
              value={currentShiftInfo.forecast}
              onChange={(e) => updateShiftInfo('forecast', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="£0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day Shift</label>
            <input
              type="text"
              value={currentShiftInfo.dayShiftForecast}
              onChange={(e) => updateShiftInfo('dayShiftForecast', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="£0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Night Shift</label>
            <input
              type="text"
              value={currentShiftInfo.nightShiftForecast}
              onChange={(e) => updateShiftInfo('nightShiftForecast', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="£0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
            <input
              type="text"
              value={currentShiftInfo.weather}
              onChange={(e) => updateShiftInfo('weather', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Weather conditions"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Shift Notes</label>
          <textarea
            value={currentShiftInfo.notes}
            onChange={(e) => updateShiftInfo('notes', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Add shift notes, goals, or important information..."
          />
        </div>
      </div>

      {/* Add Staff to Shift */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Staff to Shift</h3>
        <p className="text-sm text-gray-600 mb-4">Add staff first, then fill in positions and details in the table below.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member *</label>
            <select
              value={newDeployment.staffId}
              onChange={(e) => setNewDeployment(prev => ({ ...prev, staffId: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select staff member</option>
              {staff.filter(s => !currentDeployments.some(d => d.staffId === s.id)).map(staffMember => (
                <option key={staffMember.id} value={staffMember.id}>
                  {staffMember.name} {staffMember.isUnder18 ? '(U18)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
            <input
              type="time"
              value={newDeployment.startTime}
              onChange={(e) => setNewDeployment(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
            <input
              type="time"
              value={newDeployment.endTime}
              onChange={(e) => setNewDeployment(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={addDeployment}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff to Shift</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current Deployments */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Current Deployments</h3>
            <div className="flex items-center space-x-2">
              <select
                onChange={(e) => duplicateDeployment(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Copy from another date...</option>
                {Object.keys(deploymentsByDate).filter(date => date !== selectedDate).map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
              {Object.keys(deploymentsByDate).length > 1 && (
                <button
                  onClick={() => deleteDate(selectedDate)}
                  className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Date</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {currentDeployments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No staff deployed for this date</p>
            <p className="text-sm">Add staff members using the form above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secondary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleaning</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Break</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentDeployments.map((deployment) => {
                  const staffMember = staff.find(s => s.id === deployment.staffId);
                  const workHours = calculateWorkHours(deployment.startTime, deployment.endTime);
                  
                  return (
                    <tr key={deployment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getStaffName(deployment.staffId)}
                            </div>
                            {staffMember?.isUnder18 && (
                              <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full inline-block mt-1">
                                Under 18
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          <input
                            type="time"
                            value={deployment.startTime}
                            onChange={(e) => updateDeployment(deployment.id, 'startTime', e.target.value)}
                            className="block w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="time"
                            value={deployment.endTime}
                            onChange={(e) => updateDeployment(deployment.id, 'endTime', e.target.value)}
                            className="block w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {workHours.toFixed(1)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={deployment.position}
                          onChange={(e) => updateDeployment(deployment.id, 'position', e.target.value)}
                          className={`text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            !deployment.position ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select position</option>
                          {positions.position.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={deployment.secondary}
                          onChange={(e) => updateDeployment(deployment.id, 'secondary', e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">None</option>
                          {[...positions.position, ...positions.pack_position].map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={deployment.area}
                          onChange={(e) => updateDeployment(deployment.id, 'area', e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">None</option>
                          {positions.area.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={deployment.cleaning}
                          onChange={(e) => updateDeployment(deployment.id, 'cleaning', e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">None</option>
                          {positions.cleaning_area.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deployment.breakMinutes}min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
          </div>
        )}
      </div>
    </div>
  );

  const renderStaffPage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Staff Management</h2>
        
        {/* Add New Staff */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Staff Member</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newStaff.name}
                onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter staff name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isUnder18"
                checked={newStaff.isUnder18}
                onChange={(e) => setNewStaff(prev => ({ ...prev, isUnder18: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isUnder18" className="text-sm text-gray-700">Under 18</label>
            </div>
            <button
              onClick={addStaff}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          </div>
        </div>

        {/* Staff List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(staffMember => (
            <div key={staffMember.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{staffMember.name}</h4>
                  {staffMember.isUnder18 && (
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">
                      Under 18
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeStaff(staffMember.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPositionsPage = () => {
    const [newPositionName, setNewPositionName] = useState('');
    const [selectedPositionType, setSelectedPositionType] = useState('position');

    const positionTypeLabels = {
      position: 'Primary Positions',
      pack_position: 'Pack Positions',
      area: 'Work Areas',
      cleaning_area: 'Cleaning Areas'
    };

    const positionTypeColors = {
      position: 'bg-blue-100 text-blue-800',
      pack_position: 'bg-green-100 text-green-800',
      area: 'bg-purple-100 text-purple-800',
      cleaning_area: 'bg-orange-100 text-orange-800'
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Position Management</h2>
          
          {/* Add New Position */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Position</h3>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Position Name</label>
                <input
                  type="text"
                  value={newPositionName}
                  onChange={(e) => setNewPositionName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter position name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={selectedPositionType}
                  onChange={(e) => setSelectedPositionType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(positionTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  addPosition(selectedPositionType, newPositionName);
                  setNewPositionName('');
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Position</span>
              </button>
            </div>
          </div>

          {/* Position Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(positions).map(([type, positionList]) => (
              <div key={type} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">{positionTypeLabels[type]}</h4>
                <div className="space-y-2">
                  {positionList.map(position => (
                    <div key={position} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${positionTypeColors[type]}`}>
                        {position}
                      </span>
                      <button
                        onClick={() => removePosition(type, position)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {positionList.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No positions added yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSalesPage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales Analysis</h2>
        
        {/* Data Input */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Today's Data</label>
            <textarea
              value={salesData.todayData}
              onChange={(e) => setSalesData(prev => ({ ...prev, todayData: e.target.value }))}
              className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Paste today's sales data here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Week Data</label>
            <textarea
              value={salesData.lastWeekData}
              onChange={(e) => setSalesData(prev => ({ ...prev, lastWeekData: e.target.value }))}
              className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Paste last week's sales data here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Year Data</label>
            <textarea
              value={salesData.lastYearData}
              onChange={(e) => setSalesData(prev => ({ ...prev, lastYearData: e.target.value }))}
              className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Paste last year's sales data here..."
            />
          </div>
        </div>

        {/* Analysis Tables */}
        {(parsedSalesData.today.length > 0 || parsedSalesData.lastWeek.length > 0 || parsedSalesData.lastYear.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {parsedSalesData.today.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Today</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trans</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedSalesData.today.map((row, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{row.time}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{row.sales}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{row.transactions}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{row.average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {parsedSalesData.lastWeek.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Last Week</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trans</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedSalesData.lastWeek.map((row, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{row.time}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{row.sales}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{row.transactions}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{row.average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {parsedSalesData.lastYear.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Last Year</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trans</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedSalesData.lastYear.map((row, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{row.time}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{row.sales}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{row.transactions}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{row.average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KFC Deployment Management System</h1>
          <p className="text-gray-600">Manage staff deployments, positions, and sales analysis</p>
        </div>
        
        {renderNavigation()}
        
        {currentPage === 'deployment' && renderDeploymentPage()}
        {currentPage === 'staff' && renderStaffPage()}
        {currentPage === 'positions' && renderPositionsPage()}
        {currentPage === 'sales' && renderSalesPage()}
      </div>

      {/* New Date Modal */}
      {showNewDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Date</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewDateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createNewDate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentManagementSystem;