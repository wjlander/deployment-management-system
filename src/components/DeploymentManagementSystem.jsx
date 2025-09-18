import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Users, Calendar, Settings, Save, Download, TrendingUp, FileText, Copy, CalendarDays, Edit2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const DeploymentManagementSystem = () => {
  const [currentPage, setCurrentPage] = useState('deployment');
  const [selectedDate, setSelectedDate] = useState('08/09/2025');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  // Core data states
  const [staff, setStaff] = useState([]);
  const [positions, setPositions] = useState([]);
  const [packPositions, setPackPositions] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cleaningAreas, setCleaningAreas] = useState([]);
  const [deploymentsByDate, setDeploymentsByDate] = useState({});
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

  // Position management states
  const [newPosition, setNewPosition] = useState('');
  const [newPackPosition, setNewPackPosition] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newCleaningArea, setNewCleaningArea] = useState('');

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

  const secondaryPositions = [...positions, ...packPositions];

  // Show save status
  const showSaveStatus = (status) => {
    setSaveStatus(status);
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // Load all data from Supabase
  const loadData = async () => {
    try {
      setLoading(true);

      // Load staff
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .order('name');
      
      if (staffData) {
        const formattedStaff = staffData.map(s => ({
          id: s.id,
          name: s.name,
          isUnder18: s.is_under_18
        }));
        setStaff(formattedStaff);
      }

      // Load positions
      const { data: positionsData } = await supabase
        .from('positions')
        .select('*')
        .order('name');
      
      if (positionsData) {
        setPositions(positionsData.filter(p => p.type === 'position').map(p => p.name));
        setPackPositions(positionsData.filter(p => p.type === 'pack_position').map(p => p.name));
        setAreas(positionsData.filter(p => p.type === 'area').map(p => p.name));
        setCleaningAreas(positionsData.filter(p => p.type === 'cleaning_area').map(p => p.name));
      }

      // Load deployments
      const { data: deploymentsData } = await supabase
        .from('deployments')
        .select('*');
      
      if (deploymentsData) {
        const deploymentsByDateFormatted = {};
        deploymentsData.forEach(d => {
          if (!deploymentsByDateFormatted[d.date]) {
            deploymentsByDateFormatted[d.date] = [];
          }
          deploymentsByDateFormatted[d.date].push({
            id: d.id,
            staffId: d.staff_id,
            startTime: d.start_time,
            endTime: d.end_time,
            position: d.position,
            secondary: d.secondary,
            area: d.area,
            cleaning: d.cleaning,
            breakMinutes: d.break_minutes
          });
        });
        setDeploymentsByDate(deploymentsByDateFormatted);
      }

      // Load shift info
      const { data: shiftInfoData } = await supabase
        .from('shift_info')
        .select('*');
      
      if (shiftInfoData) {
        const shiftInfoFormatted = {};
        shiftInfoData.forEach(s => {
          shiftInfoFormatted[s.date] = {
            date: s.date,
            forecast: s.forecast,
            dayShiftForecast: s.day_shift_forecast,
            nightShiftForecast: s.night_shift_forecast,
            weather: s.weather,
            notes: s.notes
          };
        });
        setShiftInfoByDate(shiftInfoFormatted);
      }

      // Load sales data
      const { data: salesDataResult } = await supabase
        .from('sales_data')
        .select('*')
        .limit(1)
        .single();
      
      if (salesDataResult) {
        setSalesData({
          todayData: salesDataResult.today_data || '',
          lastWeekData: salesDataResult.last_week_data || '',
          lastYearData: salesDataResult.last_year_data || ''
        });
      }

    } catch (error) {
      console.error('Error loading data:', error);
      showSaveStatus('Load failed ✗');
    } finally {
      setLoading(false);
    }
  };

  // Save functions
  const saveStaff = async (staffList) => {
    try {
      showSaveStatus('Saving...');
      
      // Delete all existing staff
      await supabase.from('staff').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new staff
      if (staffList.length > 0) {
        const staffToInsert = staffList.map(s => ({
          id: s.id,
          name: s.name,
          is_under_18: s.isUnder18
        }));
        
        await supabase.from('staff').insert(staffToInsert);
      }
      
      showSaveStatus('Saved ✓');
    } catch (error) {
      console.error('Error saving staff:', error);
      showSaveStatus('Save failed ✗');
    }
  };

  const savePositions = async (positions, packPositions, areas, cleaningAreas) => {
    try {
      showSaveStatus('Saving...');
      
      // Delete existing positions
      await supabase.from('positions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new positions
      const allPositions = [
        ...positions.map(p => ({ name: p, type: 'position' })),
        ...packPositions.map(p => ({ name: p, type: 'pack_position' })),
        ...areas.map(p => ({ name: p, type: 'area' })),
        ...cleaningAreas.map(p => ({ name: p, type: 'cleaning_area' }))
      ];
      
      if (allPositions.length > 0) {
        await supabase.from('positions').insert(allPositions);
      }
      
      showSaveStatus('Saved ✓');
    } catch (error) {
      console.error('Error saving positions:', error);
      showSaveStatus('Save failed ✗');
    }
  };

  const saveDeployments = async (deployments) => {
    try {
      showSaveStatus('Saving...');
      
      // Delete existing deployments
      await supabase.from('deployments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new deployments
      const deploymentsToInsert = [];
      Object.keys(deployments).forEach(date => {
        deployments[date].forEach(d => {
          deploymentsToInsert.push({
            id: d.id,
            date: date,
            staff_id: d.staffId,
            start_time: d.startTime,
            end_time: d.endTime,
            position: d.position,
            secondary: d.secondary,
            area: d.area,
            cleaning: d.cleaning,
            break_minutes: d.breakMinutes
          });
        });
      });
      
      if (deploymentsToInsert.length > 0) {
        await supabase.from('deployments').insert(deploymentsToInsert);
      }
      
      showSaveStatus('Saved ✓');
    } catch (error) {
      console.error('Error saving deployments:', error);
      showSaveStatus('Save failed ✗');
    }
  };

  const saveShiftInfo = async (shiftInfo) => {
    try {
      showSaveStatus('Saving...');
      
      // Delete existing shift info
      await supabase.from('shift_info').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new shift info
      const shiftInfoToInsert = Object.keys(shiftInfo).map(date => ({
        date: date,
        forecast: shiftInfo[date].forecast,
        day_shift_forecast: shiftInfo[date].dayShiftForecast,
        night_shift_forecast: shiftInfo[date].nightShiftForecast,
        weather: shiftInfo[date].weather,
        notes: shiftInfo[date].notes
      }));
      
      if (shiftInfoToInsert.length > 0) {
        await supabase.from('shift_info').insert(shiftInfoToInsert);
      }
      
      showSaveStatus('Saved ✓');
    } catch (error) {
      console.error('Error saving shift info:', error);
      showSaveStatus('Save failed ✗');
    }
  };

  const saveSalesData = async (salesData) => {
    try {
      showSaveStatus('Saving...');
      
      // Delete existing sales data
      await supabase.from('sales_data').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new sales data
      await supabase.from('sales_data').insert({
        today_data: salesData.todayData,
        last_week_data: salesData.lastWeekData,
        last_year_data: salesData.lastYearData
      });
      
      showSaveStatus('Saved ✓');
    } catch (error) {
      console.error('Error saving sales data:', error);
      showSaveStatus('Save failed ✗');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (!loading && staff.length >= 0) {
      saveStaff(staff);
    }
  }, [staff, loading]);

  useEffect(() => {
    if (!loading && positions.length >= 0) {
      savePositions(positions, packPositions, areas, cleaningAreas);
    }
  }, [positions, packPositions, areas, cleaningAreas, loading]);

  useEffect(() => {
    if (!loading && Object.keys(deploymentsByDate).length >= 0) {
      saveDeployments(deploymentsByDate);
    }
  }, [deploymentsByDate, loading]);

  useEffect(() => {
    if (!loading && Object.keys(shiftInfoByDate).length >= 0) {
      saveShiftInfo(shiftInfoByDate);
    }
  }, [shiftInfoByDate, loading]);

  useEffect(() => {
    if (!loading && (salesData.todayData || salesData.lastWeekData || salesData.lastYearData)) {
      saveSalesData(salesData);
    }
  }, [salesData, loading]);

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
    if (newDeployment.staffId && newDeployment.startTime && newDeployment.endTime && newDeployment.position) {
      const staffMember = staff.find(s => s.id === newDeployment.staffId);
      const workHours = calculateWorkHours(newDeployment.startTime, newDeployment.endTime);
      const breakTime = calculateBreakTime(staffMember, workHours);
      
      const deployment = {
        id: crypto.randomUUID(),
        ...newDeployment,
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

  // Position management functions
  const addPosition = () => {
    if (newPosition && !positions.includes(newPosition)) {
      setPositions(prev => [...prev, newPosition]);
      setNewPosition('');
    }
  };

  const removePosition = (position) => {
    setPositions(prev => prev.filter(p => p !== position));
  };

  const addPackPosition = () => {
    if (newPackPosition && !packPositions.includes(newPackPosition)) {
      setPackPositions(prev => [...prev, newPackPosition]);
      setNewPackPosition('');
    }
  };

  const removePackPosition = (position) => {
    setPackPositions(prev => prev.filter(p => p !== position));
  };

  const addArea = () => {
    if (newArea && !areas.includes(newArea)) {
      setAreas(prev => [...prev, newArea]);
      setNewArea('');
    }
  };

  const removeArea = (area) => {
    setAreas(prev => prev.filter(a => a !== area));
  };

  const addCleaningArea = () => {
    if (newCleaningArea && !cleaningAreas.includes(newCleaningArea)) {
      setCleaningAreas(prev => [...prev, newCleaningArea]);
      setNewCleaningArea('');
    }
  };

  const removeCleaningArea = (area) => {
    setCleaningAreas(prev => prev.filter(a => a !== area));
  };

  // Sales data parsing
  const parseSalesLine = (line) => {
    const parts = line.split(',').map(part => part.trim());
    if (parts.length >= 4) {
      return {
        time: parts[0] || '',
        sales: parts[1] || '0',
        transactions: parts[2] || '0',
        averageSpend: parts[3] || '0',
        forecastCount: parts[4] || '0',
        actualCount: parts[5] || '0',
        lastYearCount: parts[6] || '0'
      };
    }
    return null;
  };

  useEffect(() => {
    const parseData = (data) => {
      return data.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(parseSalesLine)
        .filter(item => item !== null);
    };

    setParsedSalesData({
      today: parseData(salesData.todayData),
      lastWeek: parseData(salesData.lastWeekData),
      lastYear: parseData(salesData.lastYearData)
    });
  }, [salesData]);

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const deployments = currentDeployments;
    const shiftInfo = currentShiftInfo;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Deployment Sheet - ${selectedDate}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .shift-info { margin-bottom: 20px; }
          .deployment-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .deployment-table th, .deployment-table td { border: 1px solid #000; padding: 8px; text-align: left; }
          .deployment-table th { background-color: #f0f0f0; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KFC Deployment Sheet</h1>
          <h2>Date: ${selectedDate}</h2>
        </div>
        
        <div class="shift-info">
          <p><strong>Forecast:</strong> ${shiftInfo.forecast}</p>
          <p><strong>Day Shift Forecast:</strong> ${shiftInfo.dayShiftForecast}</p>
          <p><strong>Night Shift Forecast:</strong> ${shiftInfo.nightShiftForecast}</p>
          <p><strong>Weather:</strong> ${shiftInfo.weather}</p>
          <p><strong>Notes:</strong> ${shiftInfo.notes}</p>
        </div>
        
        <table class="deployment-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Hours</th>
              <th>Position</th>
              <th>Secondary</th>
              <th>Area</th>
              <th>Cleaning</th>
              <th>Break (mins)</th>
            </tr>
          </thead>
          <tbody>
            ${deployments.map(deployment => {
              const workHours = calculateWorkHours(deployment.startTime, deployment.endTime);
              return `
                <tr>
                  <td>${getStaffName(deployment.staffId)}</td>
                  <td>${deployment.startTime}</td>
                  <td>${deployment.endTime}</td>
                  <td>${workHours.toFixed(1)}</td>
                  <td>${deployment.position}</td>
                  <td>${deployment.secondary}</td>
                  <td>${deployment.area}</td>
                  <td>${deployment.cleaning}</td>
                  <td>${deployment.breakMinutes}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deployment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Save Status */}
      {saveStatus && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2">
          <span className={`text-sm font-medium ${
            saveStatus.includes('✓') ? 'text-green-600' : 
            saveStatus.includes('✗') ? 'text-red-600' : 
            'text-blue-600'
          }`}>
            {saveStatus}
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Deployment Management System</h1>
        
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'deployment', label: 'Deployment', icon: Calendar },
              { id: 'staff', label: 'Staff Management', icon: Users },
              { id: 'positions', label: 'Position Management', icon: Settings },
              { id: 'sales', label: 'Sales Analysis', icon: TrendingUp }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentPage(id)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  currentPage === id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Deployment Page */}
        {currentPage === 'deployment' && (
          <div className="space-y-6">
            {/* Date Selection and Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center space-x-4">
                  <CalendarDays className="w-5 h-5 text-gray-500" />
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(deploymentsByDate).map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowNewDateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Date
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    onChange={(e) => duplicateDeployment(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                  >
                    <option value="">Copy from date...</option>
                    {Object.keys(deploymentsByDate).filter(date => date !== selectedDate).map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                  <button
                    onClick={exportToPDF}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </button>
                  {Object.keys(deploymentsByDate).length > 1 && (
                    <button
                      onClick={() => deleteDate(selectedDate)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Date
                    </button>
                  )}
                </div>
              </div>

              {/* Shift Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forecast</label>
                  <input
                    type="text"
                    value={currentShiftInfo.forecast}
                    onChange={(e) => updateShiftInfo('forecast', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="£0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day Shift Forecast</label>
                  <input
                    type="text"
                    value={currentShiftInfo.dayShiftForecast}
                    onChange={(e) => updateShiftInfo('dayShiftForecast', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="£0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Night Shift Forecast</label>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={currentShiftInfo.notes}
                    onChange={(e) => updateShiftInfo('notes', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Shift notes and instructions"
                  />
                </div>
              </div>
            </div>

            {/* Add New Deployment */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Deployment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member</label>
                  <select
                    value={newDeployment.staffId}
                    onChange={(e) => setNewDeployment(prev => ({ ...prev, staffId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select staff member</option>
                    {staff.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} {member.isUnder18 ? '(U18)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newDeployment.startTime}
                    onChange={(e) => setNewDeployment(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newDeployment.endTime}
                    onChange={(e) => setNewDeployment(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    value={newDeployment.position}
                    onChange={(e) => setNewDeployment(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select position</option>
                    {positions.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary</label>
                  <select
                    value={newDeployment.secondary}
                    onChange={(e) => setNewDeployment(prev => ({ ...prev, secondary: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select secondary</option>
                    {secondaryPositions.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <select
                    value={newDeployment.area}
                    onChange={(e) => setNewDeployment(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select area</option>
                    {areas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cleaning</label>
                  <select
                    value={newDeployment.cleaning}
                    onChange={(e) => setNewDeployment(prev => ({ ...prev, cleaning: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select cleaning area</option>
                    {cleaningAreas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addDeployment}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Deployment
                  </button>
                </div>
              </div>
            </div>

            {/* Deployments Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Deployments for {selectedDate}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
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
                    {currentDeployments.map(deployment => {
                      const workHours = calculateWorkHours(deployment.startTime, deployment.endTime);
                      return (
                        <tr key={deployment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getStaffName(deployment.staffId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {deployment.startTime} - {deployment.endTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {workHours.toFixed(1)}h
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {deployment.position}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {deployment.secondary && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {deployment.secondary}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {deployment.area && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {deployment.area}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {deployment.cleaning && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {deployment.cleaning}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {deployment.breakMinutes}min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => removeDeployment(deployment.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
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
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No deployments</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new deployment above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Staff Management Page */}
        {currentPage === 'staff' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Staff Member</h3>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter staff member name"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isUnder18"
                    checked={newStaff.isUnder18}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, isUnder18: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isUnder18" className="ml-2 block text-sm text-gray-700">
                    Under 18
                  </label>
                </div>
                <button
                  onClick={addStaff}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Staff
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Staff Members</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {member.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.isUnder18 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {member.isUnder18 ? 'Under 18' : 'Over 18'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => removeStaff(member.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {staff.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new staff member above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Position Management Page */}
        {currentPage === 'positions' && (
          <div className="space-y-6">
            {/* Primary Positions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Primary Positions</h3>
              <div className="flex flex-wrap items-end gap-4 mb-4">
                <div className="flex-1 min-w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Position</label>
                  <input
                    type="text"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter position name"
                  />
                </div>
                <button
                  onClick={addPosition}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Position
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {positions.map(position => (
                  <span
                    key={position}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {position}
                    <button
                      onClick={() => removePosition(position)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Pack Positions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Pack Positions</h3>
              <div className="flex flex-wrap items-end gap-4 mb-4">
                <div className="flex-1 min-w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Pack Position</label>
                  <input
                    type="text"
                    value={newPackPosition}
                    onChange={(e) => setNewPackPosition(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter pack position name"
                  />
                </div>
                <button
                  onClick={addPackPosition}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pack Position
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {packPositions.map(position => (
                  <span
                    key={position}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {position}
                    <button
                      onClick={() => removePackPosition(position)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Work Areas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Work Areas</h3>
              <div className="flex flex-wrap items-end gap-4 mb-4">
                <div className="flex-1 min-w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Work Area</label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter work area name"
                  />
                </div>
                <button
                  onClick={addArea}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Area
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {areas.map(area => (
                  <span
                    key={area}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {area}
                    <button
                      onClick={() => removeArea(area)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Cleaning Areas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cleaning Areas</h3>
              <div className="flex flex-wrap items-end gap-4 mb-4">
                <div className="flex-1 min-w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Cleaning Area</label>
                  <input
                    type="text"
                    value={newCleaningArea}
                    onChange={(e) => setNewCleaningArea(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter cleaning area name"
                  />
                </div>
                <button
                  onClick={addCleaningArea}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Cleaning Area
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cleaningAreas.map(area => (
                  <span
                    key={area}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
                  >
                    {area}
                    <button
                      onClick={() => removeCleaningArea(area)}
                      className="ml-2 text-orange-600 hover:text-orange-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sales Analysis Page */}
        {currentPage === 'sales' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Data Input</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Today's Data</label>
                  <textarea
                    value={salesData.todayData}
                    onChange={(e) => setSalesData(prev => ({ ...prev, todayData: e.target.value }))}
                    className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Paste today's sales data here..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Week's Data</label>
                  <textarea
                    value={salesData.lastWeekData}
                    onChange={(e) => setSalesData(prev => ({ ...prev, lastWeekData: e.target.value }))}
                    className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Paste last week's sales data here..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Year's Data</label>
                  <textarea
                    value={salesData.lastYearData}
                    onChange={(e) => setSalesData(prev => ({ ...prev, lastYearData: e.target.value }))}
                    className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Paste last year's sales data here..."
                  />
                </div>
              </div>
            </div>

            {/* Sales Analysis Tables */}
            {(parsedSalesData.today.length > 0 || parsedSalesData.lastWeek.length > 0 || parsedSalesData.lastYear.length > 0) && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Sales Analysis</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today Sales</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Week</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">vs Last Week</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">vs Last Year</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.from(new Set([
                        ...parsedSalesData.today.map(d => d.time),
                        ...parsedSalesData.lastWeek.map(d => d.time),
                        ...parsedSalesData.lastYear.map(d => d.time)
                      ])).sort().map(time => {
                        const todayData = parsedSalesData.today.find(d => d.time === time);
                        const lastWeekData = parsedSalesData.lastWeek.find(d => d.time === time);
                        const lastYearData = parsedSalesData.lastYear.find(d => d.time === time);
                        
                        const todaySales = todayData ? parseFloat(todayData.sales.replace(/[£,]/g, '')) : 0;
                        const lastWeekSales = lastWeekData ? parseFloat(lastWeekData.sales.replace(/[£,]/g, '')) : 0;
                        const lastYearSales = lastYearData ? parseFloat(lastYearData.sales.replace(/[£,]/g, '')) : 0;
                        
                        const vsLastWeek = lastWeekSales > 0 ? ((todaySales - lastWeekSales) / lastWeekSales * 100) : 0;
                        const vsLastYear = lastYearSales > 0 ? ((todaySales - lastYearSales) / lastYearSales * 100) : 0;
                        
                        return (
                          <tr key={time} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {time}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {todayData ? todayData.sales : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {lastWeekData ? lastWeekData.sales : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {lastYearData ? lastYearData.sales : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {lastWeekSales > 0 && todaySales > 0 ? (
                                <span className={`font-medium ${vsLastWeek >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {vsLastWeek >= 0 ? '+' : ''}{vsLastWeek.toFixed(1)}%
                                </span>
                              ) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {lastYearSales > 0 && todaySales > 0 ? (
                                <span className={`font-medium ${vsLastYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {vsLastYear >= 0 ? '+' : ''}{vsLastYear.toFixed(1)}%
                                </span>
                              ) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* New Date Modal */}
        {showNewDateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Date</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date (DD/MM/YYYY)</label>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="08/09/2025"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewDateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Date
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