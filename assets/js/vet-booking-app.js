//  AUTH CHECK
async function initializeAdminApp() {
  try {
    const authResult = checkAuth('admin');
    if (!authResult) return; // Will redirect if not authenticated

    // Load data from the backend
    await loadDataFromBackend();

    // Initialize the dashboard
    renderDashboard();
    console.log('Admin app initialized');
  } catch (error) {
    console.error('Error initializing admin app:', error);
  }
}

//  DATA - REST API Integration
let appointments = [];
let patients = [];
let vets = [];
let currentFilter = 'all';
let adminSettings = {
  adminPassword: 'admin123',
  clinicName: 'ARF - Animal Relief Facility',
  clinicPhone: '+63 2 8123 4567'
};

function hasBrokenEncoding(value) {
  return typeof value === 'string' && /[\u00f0\u00c3\u00e2]/.test(value);
}

function patientMark(record = {}) {
  const species = String(record.species || record.emoji || '').toLowerCase();
  if (species.includes('cat') || species.includes('ct')) return 'CT';
  if (species.includes('bird') || species.includes('bd')) return 'BD';
  if (species.includes('rabbit') || species.includes('rb')) return 'RB';
  if (species.includes('dog') || species.includes('dg')) return 'DG';
  return 'PT';
}

function iconImg(src, alt = '') {
  return `<img src="${src}" alt="${alt}"/>`;
}

function patientIcon(record = {}) {
  const mark = patientMark(record);
  const icons = {
    CT: ['assets/icons/cat.png', 'Cat'],
    BD: ['assets/icons/bird.png', 'Bird'],
    RB: ['assets/icons/rabbit.png', 'Rabbit'],
    DG: ['assets/icons/dog-bone.png', 'Dog'],
    PT: ['assets/icons/dog-service.png', 'Pet'],
  };
  return iconImg(...icons[mark]);
}

function staffIcon() {
  return iconImg('assets/icons/veterinarian.png', 'Veterinarian');
}

function getVetOptions(selectedVet = '') {
  const names = vets.map(v => v.name).filter(Boolean);

  if (selectedVet && !names.includes(selectedVet)) {
    names.push(selectedVet);
  }

  return (names.length ? names : ['Any available veterinarian'])
    .map(name => `<option value="${htmlText(name)}"${name === selectedVet ? ' selected' : ''}>${htmlText(name)}</option>`)
    .join('');
}

function refreshVetSelects(selectedVet = '') {
  const newBookingVet = document.getElementById('f-vet');
  const editVet = document.getElementById('edit-vet');

  if (newBookingVet) {
    const currentValue = selectedVet || newBookingVet.value;
    newBookingVet.innerHTML = getVetOptions(currentValue);
  }

  if (editVet) {
    const currentValue = selectedVet || editVet.value;
    editVet.innerHTML = getVetOptions(currentValue);
  }
}

// Load all data from the backend
async function loadDataFromBackend() {
  try {
    appointments = await getAppointmentsFromDB();
    patients = await getPatientsFromDB();
    vets = await getVetsFromDB();
    adminSettings = await getAdminSettingsFromDB() || adminSettings;
    refreshVetSelects();

    // If no data exists, load defaults
    if (appointments.length === 0) {
      await loadDefaultData();
      // Reload after defaults are loaded
      appointments = await getAppointmentsFromDB();
      patients = await getPatientsFromDB();
      vets = await getVetsFromDB();
      refreshVetSelects();
    }
  } catch (error) {
    console.error('Error loading data from backend:', error);
    // Fallback to localStorage if Firebase fails
    loadFallbackData();
  }
}

async function loadDefaultData() {
  const defaultAppointments = [
    { pet:'Buddy', emoji:'DG', owner:'Maria Santos', phone:'0917-123-4567', service:'General Checkup', date:'2026-03-25', time:'9:00 AM', vet:'Dr. Reyes', status:'Confirmed', notes:'', clientEmail: null },
    { pet:'Mochi', emoji:'CT', owner:'Jose Reyes', phone:'0918-234-5678', service:'Vaccination', date:'2026-03-25', time:'10:00 AM', vet:'Dr. Santos', status:'Confirmed', notes:'', clientEmail: null },
  ];

  const defaultPatients = [
    { name:'Buddy', emoji:'DG', species:'Dog', breed:'Labrador', age:'3 yrs', owner:'Maria Santos', phone:'0917-123-4567', lastVisit:'Mar 25, 2026' },
    { name:'Mochi', emoji:'CT', species:'Cat', breed:'Persian', age:'2 yrs', owner:'Jose Reyes', phone:'0918-234-5678', lastVisit:'Mar 25, 2026' },
  ];

  const defaultVets = [
    { name:'Dr. Reyes', emoji:'DR', spec:'General Practice & Surgery', status:'Available', appts:18 },
    { name:'Dr. Santos', emoji:'DR', spec:'Dentistry & Dermatology', status:'Available', appts:14 },
    { name:'Dr. Cruz', emoji:'DR', spec:'Exotic Animals & Birds', status:'On Leave', appts:9 },
    { name:'Dr. Garcia', emoji:'DR', spec:'Orthopedics & Rehabilitation', status:'Available', appts:12 },
  ];

  // Save to backend
  for (const appt of defaultAppointments) {
    await createAppointmentInDB(appt);
  }
  for (const patient of defaultPatients) {
    await createPatientInDB(patient);
  }
  for (const vet of defaultVets) {
    await addVetInDB(vet);
  }
}

function loadFallbackData() {
  appointments = [
    { id:1, pet:'Buddy', emoji:'DG', owner:'Maria Santos', phone:'0917-123-4567', service:'General Checkup', date:'2026-03-25', time:'9:00 AM', vet:'Dr. Reyes', status:'Confirmed', notes:'' },
  ];
  patients = [
    { id:1, name:'Buddy', emoji:'DG', species:'Dog', breed:'Labrador', age:'3 yrs', owner:'Maria Santos', phone:'0917-123-4567', lastVisit:'Mar 25, 2026' },
  ];
  vets = [
    { id:1, name:'Dr. Reyes', emoji:'DR', spec:'General Practice & Surgery', status:'Available', appts:18 },
  ];
}

//  NAVIGATION
const pageTitles = {
  dashboard: ['Dashboard', 'Welcome back, Dr. Admin - ARF'],
  bookings:  ['Appointments', 'Manage all bookings'],
  patients:  ['Patients', 'All registered pets & owners'],
  book:      ['New Booking', 'Schedule an appointment at ARF'],
  vets:      ['Vets & Staff', 'Manage your team'],
  reports:   ['Reports', 'ARF facility performance overview'],
  clients:   ['Client Accounts', 'Manage customer accounts'],
  settings:  ['Settings', 'ARF facility configuration'],
};

function navigate(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const [title, sub] = pageTitles[page] || [page, ''];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-sub').textContent = sub;

  if (page === 'bookings') renderApptTable(appointments);
  if (page === 'patients') renderPatientsTable(patients);
  if (page === 'vets') renderVets();
  if (page === 'reports') renderReports();
  if (page === 'clients') renderClientsPage();
  if (page === 'settings') renderSettings();
  if (page === 'book') {
    refreshVetSelects();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('f-date').value = today;
  }
}

function renderSettings() {
  const clinicNameInput = document.getElementById('settings-clinic-name');
  const clinicPhoneInput = document.getElementById('settings-clinic-phone');
  const adminPasswordInput = document.getElementById('settings-admin-password');

  if (clinicNameInput) clinicNameInput.value = adminSettings.clinicName || 'ARF - Animal Relief Facility';
  if (clinicPhoneInput) clinicPhoneInput.value = adminSettings.clinicPhone || '+63 2 8123 4567';
  if (adminPasswordInput) adminPasswordInput.value = '';
}

async function saveClinicSettings() {
  const clinicName = document.getElementById('settings-clinic-name')?.value.trim();
  const clinicPhone = document.getElementById('settings-clinic-phone')?.value.trim();

  adminSettings = {
    ...adminSettings,
    clinicName: clinicName || 'ARF - Animal Relief Facility',
    clinicPhone: clinicPhone || '+63 2 8123 4567'
  };

  const result = await saveAdminSettingsInDB(adminSettings);
  if (!result.success) {
    showToast(result.message || 'Error saving settings', 'red');
    return;
  }

  showToast('Clinic settings saved!');
}

async function saveAdminAccess() {
  const passwordInput = document.getElementById('settings-admin-password');
  const newPassword = passwordInput?.value.trim();

  if (!newPassword) {
    showToast('Enter a new admin password first', 'yellow');
    return;
  }

  adminSettings = {
    ...adminSettings,
    adminPassword: newPassword
  };

  const result = await saveAdminSettingsInDB(adminSettings);
  if (!result.success) {
    showToast(result.message || 'Error updating admin password', 'red');
    return;
  }

  passwordInput.value = '';
  showToast('Admin password updated!');
}

//  RENDER DASHBOARD
function renderDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);

  // Stats
  const activeVets = vets.filter(v => v.status === 'Available');
  const dutyLabel = activeVets.length === vets.length && vets.length > 0
    ? 'All available'
    : `${activeVets.length} of ${vets.length} available`;

  document.getElementById('stat-today').textContent = todayAppts.length;
  document.getElementById('stat-patients').textContent = patients.length;
  document.getElementById('stat-pending').textContent = appointments.filter(a => a.status === 'Pending').length;
  document.getElementById('stat-vets-duty').textContent = activeVets.length;
  document.getElementById('stat-vets-duty-label').textContent = vets.length ? dutyLabel : 'No staff listed';

  // Today's schedule
  const sched = document.getElementById('today-schedule');
  if (todayAppts.length === 0) {
    sched.innerHTML = '<div class="empty-state"><div class="emoji">--</div><p>No appointments today</p></div>';
  } else {
    sched.innerHTML = todayAppts.map(a => `
      <div class="appt-item" style="border-radius:12px; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
        <div class="appt-time-block">
          <div class="appt-time-big" style="color:var(--primary)">${a.time.split(':')[0]}</div>
          <div class="appt-time-sub">${a.time.includes('AM') ? 'AM' : 'PM'}</div>
        </div>
        <div class="pet-avatar" style="box-shadow:var(--shadow-sm)">${patientIcon(a)}</div>
        <div class="appt-info">
          <div class="appt-pet" style="font-weight:800">${a.pet}</div>
          <div class="appt-owner" style="font-size:0.75rem"><span style="opacity:0.6">Owner:</span> ${a.owner}</div>
          <div class="appt-type" style="color:var(--primary); font-size:0.75rem; font-weight:700">${a.service}</div>
        </div>
        <span class="badge ${badgeClass(a.status)}">${a.status}</span>
      </div>
    `).join('');
  }

  // Recent table
  const tbody = document.getElementById('recent-tbody');
  tbody.innerHTML = appointments.slice(-5).reverse().map(a => apptRow(a)).join('');

  // Calendar
  renderCal();
}

function renderCal() {
  const cal = document.getElementById('mini-cal');
  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const apptDays = new Set(
    appointments
      .filter(a => {
        const date = new Date(`${a.date}T00:00:00`);
        return date.getFullYear() === year && date.getMonth() === month;
      })
      .map(a => parseInt(a.date.split('-')[2]))
  );
  let html = days.map(d => `<div class="cal-day-header">${d}</div>`).join('');
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today;
    const hasAppt = apptDays.has(d) && !isToday;
    html += `<div class="cal-day ${isToday ? 'today' : ''} ${hasAppt ? 'has-appt' : ''}">${d}</div>`;
  }
  cal.innerHTML = html;
}

//  APPOINTMENTS TABLE
function badgeClass(status) {
  return { Confirmed:'badge-green', Pending:'badge-amber', Completed:'badge-blue', Cancelled:'badge-red' }[status] || 'badge-grey';
}

function apptRow(a) {
  return `<tr>
    <td><div class="name-cell" style="display:flex; align-items:center; gap:12px;"><div class="pet-avatar" style="box-shadow: 0 2px 5px rgba(0,0,0,0.1); flex-shrink:0;">${patientIcon(a)}</div><div><div class="name-main" style="font-weight:700">${a.pet}</div></div></div></td>
    <td><div class="name-main" style="font-weight:600">${a.owner}</div><div class="name-sub" style="font-size:0.75rem">${a.phone}</div></td>
    <td>${a.service}</td>
    <td><div class="name-main" style="color:var(--primary); font-weight:600">${formatDate(a.date)}</div><div class="name-sub" style="font-size:0.75rem">${a.time}</div></td>
    <td>${a.vet}</td>
    <td><span class="badge ${badgeClass(a.status)}">${a.status}</span></td>
    <td>
      <div class="action-row">
        <button class="btn btn-outline btn-sm" onclick="openEditModal('${a.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAppt('${a.id}')">Delete</button>
      </div>
    </td>
  </tr>`;
}

function renderApptTable(list) {
  const tbody = document.getElementById('appt-tbody');
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="emoji">--</div><p>No appointments found</p></div></td></tr>`;
  } else {
    tbody.innerHTML = list.map(apptRow).join('');
  }
}

function filterAppts(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('#page-bookings .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);
  renderApptTable(filtered);
}

//  PATIENTS TABLE
function renderPatientsTable(list) {
  const tbody = document.getElementById('patients-tbody');
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="emoji">--</div><p>No patients found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(p => `
    <tr>
      <td><div class="name-cell"><div class="pet-avatar">${patientIcon(p)}</div><div class="name-main">${p.name}</div></div></td>
      <td>${p.species} - ${p.breed}</td>
      <td>${p.age}</td>
      <td>${p.owner}</td>
      <td>${p.phone}</td>
      <td>${p.lastVisit}</td>
      <td>
        <div class="action-row">
          <button class="btn btn-outline btn-sm" onclick="showToast('Patient record feature coming soon!')">View</button>
          <button class="btn btn-primary btn-sm" onclick="quickBook('${p.name}','${p.owner}','${p.phone}')">Book</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function searchPatients(q) {
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.owner.toLowerCase().includes(q.toLowerCase())
  );
  renderPatientsTable(filtered);
}

//  BOOKING FORM
async function submitBooking() {
  const pet = document.getElementById('f-pet').value.trim();
  const owner = document.getElementById('f-owner').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const date = document.getElementById('f-date').value;
  if (!pet || !owner || !phone || !date) {
    showToast('Please fill in all required fields', 'amber');
    return;
  }
  const emojis = { Dog:'DG', Cat:'CT', Bird:'BD', Rabbit:'RB', Other:'PT' };
  const speciesVal = document.getElementById('f-species').value;
  const newAppt = {
    pet, emoji: emojis[speciesVal] || 'PT',
    owner, phone,
    service: document.getElementById('f-service').value,
    date,
    time: document.getElementById('f-time').value,
    vet: document.getElementById('f-vet').value,
    status: 'Pending',
    notes: document.getElementById('f-notes').value,
    clientEmail: null
  };

  try {
    await createAppointmentInDB(newAppt);
    
    // Add to patients if new (In a real app, this would be managed server-side or via trigger)
    if (!patients.find(p => p.name.toLowerCase() === pet.toLowerCase())) {
      await createPatientInDB({ name:pet, emoji: emojis[speciesVal]||'PT', species:speciesVal.split(' ')[0], breed:'Unknown', age:'Unknown', owner, phone, lastVisit: formatDate(date) });
    }

    await loadDataFromBackend();
    clearForm();
    showToast(`Booking confirmed for ${pet}!`);
    renderDashboard();
  } catch (error) {
    showToast('Error creating booking', 'red');
  }
}

function clearForm() {
  ['f-pet','f-owner','f-phone','f-notes'].forEach(id => document.getElementById(id).value = '');
}

function quickBook(pet, owner, phone) {
  navigate('book', null);
  setTimeout(() => {
    document.getElementById('f-pet').value = pet;
    document.getElementById('f-owner').value = owner;
    document.getElementById('f-phone').value = phone;
  }, 100);
}

//  EDIT / DELETE APPOINTMENT (ADMIN)
function openEditModal(id) {
  const a = appointments.find(x => String(x.id) === String(id));
  if (!a) return;
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-status').value = a.status;
  refreshVetSelects(a.vet);
  document.getElementById('edit-date').value = a.date;
  document.getElementById('edit-time').value = a.time;
  document.getElementById('edit-notes').value = a.notes || '';
  openModal('modal-edit');
}

function saveEdit() {
  const id = document.getElementById('edit-id').value;
  const a = appointments.find(x => String(x.id) === String(id));
  if (!a) return;

  const updatedAppt = {
    ...a,
    status: document.getElementById('edit-status').value,
    vet: document.getElementById('edit-vet').value,
    date: document.getElementById('edit-date').value,
    time: document.getElementById('edit-time').value,
    notes: document.getElementById('edit-notes').value,
  };

  updateAppointmentInDB(id, updatedAppt).then(() => {
    closeModal('modal-edit');
    loadDataFromBackend().then(() => {
      filterAppts(currentFilter, null);
      renderDashboard();
      showToast('Appointment updated!');
    });
  }).catch(error => {
    console.error('Error updating appointment:', error);
    showToast('Error updating appointment', 'red');
  });
}

function deleteAppt(id) {
  if (!confirm('Delete this appointment?')) return;

  deleteAppointmentFromDB(id).then(() => {
    loadDataFromBackend().then(() => {
      filterAppts(currentFilter, null);
      renderDashboard();
      showToast('Appointment removed');
    });
  }).catch(error => {
    console.error('Error deleting appointment:', error);
    showToast('Error deleting appointment', 'red');
  });
}

//  VETS
function renderVets() {
  const statusBadge = { Available:'badge-green', 'On Leave':'badge-amber', Inactive:'badge-red' };
  document.getElementById('vets-list').innerHTML = vets.map(v => `
    <div class="vet-card" style="border-radius:12px; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
      <div class="vet-avatar" style="background:var(--green-light); box-shadow:inset 0 2px 4px rgba(0,0,0,0.05)">${staffIcon(v)}</div>
      <div style="flex:1">
        <div class="vet-name" style="font-weight:800; color:var(--text)">${v.name}</div>
        <div class="vet-spec" style="font-size:0.75rem; color:var(--muted)">${v.spec}</div>
        <div style="margin-top:0.3rem"><span class="badge ${statusBadge[v.status]||'badge-grey'}">${v.status}</span></div>
      </div>
      <div style="text-align:center;min-width:70px">
        <div style="font-size:1.4rem;font-weight:800;color:var(--green)">${v.appts}</div>
        <div style="font-size:0.68rem;color:var(--muted)">Appts</div>
      </div>
      <div class="action-row">
        <button class="btn btn-outline btn-sm" onclick="toggleVetStatus('${v.id}')">Toggle Status</button>
        <button class="btn btn-danger btn-sm" onclick="removeVet('${v.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function toggleVetStatus(id) {
  const v = vets.find(x => String(x.id) === String(id));
  if (!v) return;
  const cycle = { Available:'On Leave', 'On Leave':'Inactive', Inactive:'Available' };
  const newStatus = cycle[v.status];

  updateVetInDB(id, { ...v, status: newStatus }).then(() => {
    loadDataFromBackend().then(() => {
      renderVets();
      renderDashboard();
      showToast(`Updated ${v.name} to ${newStatus}`);
    });
  }).catch(error => {
    console.error('Error updating vet status:', error);
    showToast('Error updating vet status', 'red');
  });
}

function removeVet(id) {
  if (!confirm('Remove this staff member?')) return;

  deleteVetFromDB(id).then(() => {
    loadDataFromBackend().then(() => {
      renderVets();
      renderDashboard();
      showToast('Staff member removed');
    });
  }).catch(error => {
    console.error('Error removing vet:', error);
    showToast('Error removing vet', 'red');
  });
}

function openAddVetModal() { openModal('modal-vet'); }

function addVet() {
  const name = document.getElementById('mv-name').value.trim();
  if (!name) { showToast('Name is required', 'amber'); return; }

  const newVet = {
    name,
    emoji: 'DR',
    spec: document.getElementById('mv-spec').value || 'General Practice',
    status: document.getElementById('mv-status').value,
    appts: 0,
  };

  addVetInDB(newVet).then(() => {
    closeModal('modal-vet');
    loadDataFromBackend().then(() => {
      renderVets();
      refreshVetSelects(name);
      renderDashboard();
      showToast(`${name} added to staff!`);
    });
    ['mv-name','mv-spec','mv-phone'].forEach(id => document.getElementById(id).value='');
  }).catch(error => {
    console.error('Error adding vet:', error);
    showToast('Error adding vet', 'red');
  });
}

//  PATIENTS MODAL
function openAddPatientModal() { openModal('modal-patient'); }

function addPatient() {
  const name = document.getElementById('mp-name').value.trim();
  const owner = document.getElementById('mp-owner').value.trim();
  if (!name || !owner) { showToast('Pet name & owner required', 'amber'); return; }

  const emojis = { Dog:'DG', Cat:'CT', Bird:'BD', Rabbit:'RB', Other:'PT' };
  const sp = document.getElementById('mp-species').value;
  const newPatient = {
    name,
    emoji: emojis[sp]||'PT',
    species: sp.split(' ')[0],
    breed: document.getElementById('mp-breed').value || 'Unknown',
    age: document.getElementById('mp-age').value || 'Unknown',
    owner,
    phone: document.getElementById('mp-phone').value || '-',
    lastVisit: '-',
  };

  createPatientInDB(newPatient).then(() => {
    closeModal('modal-patient');
    loadDataFromBackend().then(() => {
      renderPatientsTable(patients);
      document.getElementById('stat-patients').textContent = patients.length;
      showToast(`${name} added!`);
    });
    ['mp-name','mp-breed','mp-age','mp-owner','mp-phone'].forEach(id => document.getElementById(id).value='');
  }).catch(error => {
    console.error('Error adding patient:', error);
    showToast('Error adding patient', 'red');
  });
}

//  REPORTS
function renderReports() {
  document.getElementById('r-monthly').textContent = appointments.length;
  document.getElementById('r-patients').textContent = patients.length;
  document.getElementById('r-pending').textContent = appointments.filter(a => a.status === 'Pending').length;
  document.getElementById('r-completed').textContent = appointments.filter(a => a.status === 'Completed').length;

  const services = {};
  appointments.forEach(a => { services[a.service] = (services[a.service]||0)+1; });
  const total = Object.values(services).reduce((s,v)=>s+v,0);
  const colors = ['var(--green)','var(--amber)','var(--blue)','var(--red)','#9b59b6','#1abc9c'];
  let i=0;
  const chartHTML = total === 0 ? '<div class="empty-state"><div class="emoji">--</div><p>No report data yet</p></div>' : Object.entries(services).sort((a,b)=>b[1]-a[1]).map(([s,c]) => {
    const pct = Math.round(c/total*100);
    return `<div style="margin-bottom:0.9rem">
      <div style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:700;margin-bottom:4px">
        <span>${s}</span><span>${c} (${pct}%)</span>
      </div>
      <div style="height:8px;background:#f0ede8;border-radius:99px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${colors[i++%colors.length]};border-radius:99px;transition:width 0.6s ease"></div>
      </div>
    </div>`;
  }).join('');
  document.getElementById('services-chart').innerHTML = chartHTML;

  const topHTML = patients.length === 0 ? '<div class="empty-state"><div class="emoji">--</div><p>No patient data yet</p></div>' : patients.slice(0,5).map((p,idx) => `
    <div style="display:flex;align-items:center;gap:0.8rem;padding:0.65rem 0;border-bottom:1px solid #f0ede8">
      <div style="font-size:1.1rem;font-weight:800;color:var(--muted);width:1.2rem">${idx+1}</div>
      <div class="pet-avatar">${patientIcon(p)}</div>
      <div style="flex:1"><div style="font-weight:700;font-size:0.84rem">${p.name}</div><div style="font-size:0.72rem;color:var(--muted)">${p.owner}</div></div>
      <span class="badge badge-green">${appointments.filter(a=>a.pet===p.name).length} visits</span>
    </div>
  `).join('');
  document.getElementById('top-patients').innerHTML = topHTML;
}

function csvCell(value) {
  const text = String(value ?? '').replace(/\r?\n/g, ' ');
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadTextFile(filename, content, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function htmlText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function exportReportsCSV() {
  const generatedAt = new Date().toLocaleString();
  const statusCounts = appointments.reduce((acc, item) => {
    const status = item.status || 'Unspecified';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const serviceCounts = appointments.reduce((acc, item) => {
    const service = item.service || 'Unspecified';
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {});

  const lines = [
    ['ARF Portal Report'],
    ['Generated At', generatedAt],
    [],
    ['Summary'],
    ['Metric', 'Value'],
    ['Total Appointments', appointments.length],
    ['Total Patients', patients.length],
    ['Total Staff', vets.length],
    ['Pending Requests', statusCounts.Pending || 0],
    ['Confirmed Appointments', statusCounts.Confirmed || 0],
    ['Completed Visits', statusCounts.Completed || 0],
    ['Cancelled Appointments', statusCounts.Cancelled || 0],
    [],
    ['Service Breakdown'],
    ['Service', 'Appointments'],
    ...Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]),
    [],
    ['Appointment Details'],
    ['ID', 'Pet', 'Owner', 'Phone', 'Service', 'Date', 'Time', 'Veterinarian', 'Status', 'Notes'],
    ...appointments.map(a => [
      a.id, a.pet, a.owner, a.phone, a.service, a.date, a.time, a.vet, a.status, a.notes || ''
    ]),
    [],
    ['Patient Records'],
    ['ID', 'Name', 'Species', 'Breed', 'Age', 'Owner', 'Phone', 'Last Visit'],
    ...patients.map(p => [
      p.id, p.name, p.species, p.breed, p.age, p.owner, p.phone, p.lastVisit
    ]),
  ];

  const csv = lines.map(row => row.map(csvCell).join(',')).join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);
  downloadTextFile(`arf-report-${stamp}.csv`, csv);
  showToast('Report CSV exported');
}

function printReports() {
  const serviceRows = Object.entries(appointments.reduce((acc, item) => {
    const service = item.service || 'Unspecified';
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]).map(([service, count]) =>
    `<tr><td>${htmlText(service)}</td><td>${count}</td></tr>`
  ).join('');

  const appointmentRows = appointments.map(a => `
    <tr>
      <td>${htmlText(a.pet)}</td>
      <td>${htmlText(a.owner)}</td>
      <td>${htmlText(a.service)}</td>
      <td>${htmlText(`${a.date || ''} ${a.time || ''}`.trim())}</td>
      <td>${htmlText(a.vet)}</td>
      <td>${htmlText(a.status)}</td>
    </tr>
  `).join('');

  const reportWindow = window.open('', '_blank');
  if (!reportWindow) {
    showToast('Please allow pop-ups to print reports', 'amber');
    return;
  }
  reportWindow.document.write(`
    <!doctype html>
    <html>
    <head>
      <title>ARF Portal Report</title>
      <style>
        body{font-family:Arial,sans-serif;color:#1e2a22;margin:32px}
        h1{margin:0 0 4px;font-size:24px}
        h2{margin-top:28px;font-size:16px;color:#3d6b4f}
        p{color:#637569}
        table{width:100%;border-collapse:collapse;margin-top:10px;font-size:12px}
        th,td{border:1px solid #dde7e0;padding:8px;text-align:left}
        th{background:#e8f2eb}
        .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:20px 0}
        .card{border:1px solid #dde7e0;border-radius:8px;padding:12px}
        .value{font-size:22px;font-weight:700;color:#3d6b4f}
        @media print{button{display:none}}
      </style>
    </head>
    <body>
      <button onclick="window.print()">Print or Save as PDF</button>
      <h1>ARF Portal Management Report</h1>
      <p>Generated ${new Date().toLocaleString()}</p>
      <div class="summary">
        <div class="card"><div>Total Appointments</div><div class="value">${appointments.length}</div></div>
        <div class="card"><div>Total Patients</div><div class="value">${patients.length}</div></div>
        <div class="card"><div>Total Staff</div><div class="value">${vets.length}</div></div>
        <div class="card"><div>Pending Requests</div><div class="value">${appointments.filter(a => a.status === 'Pending').length}</div></div>
      </div>
      <h2>Service Breakdown</h2>
      <table><thead><tr><th>Service</th><th>Appointments</th></tr></thead><tbody>${serviceRows || '<tr><td colspan="2">No data yet</td></tr>'}</tbody></table>
      <h2>Appointment Details</h2>
      <table><thead><tr><th>Pet</th><th>Owner</th><th>Service</th><th>Schedule</th><th>Veterinarian</th><th>Status</th></tr></thead><tbody>${appointmentRows || '<tr><td colspan="6">No appointments yet</td></tr>'}</tbody></table>
    </body>
    </html>
  `);
  reportWindow.document.close();
  reportWindow.focus();
}

//  UTILS
function formatDate(d) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const parts = d.split('-');
  return `${months[parseInt(parts[1])-1]} ${parseInt(parts[2])}, ${parts[0]}`;
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = type === 'amber' ? 'var(--amber)' : 'var(--green)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function globalSearch(q) {
  if (!q) return;
  const p = patients.filter(x =>
    x.name.toLowerCase().includes(q.toLowerCase()) ||
    x.owner.toLowerCase().includes(q.toLowerCase())
  );
  if (p.length > 0) {
    navigate('patients', null);
    renderPatientsTable(p);
  }
}

// Close modal on backdrop click
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

//  CLIENT MANAGEMENT
async function renderClientsPage() {
  await renderClientsList();
}

async function renderClientsList() {
  const clients = await getAllClients();
  const clientsList = document.getElementById('clients-list');

  if (clients.length === 0) {
    clientsList.innerHTML = '<div class="empty-state"><div class="emoji">--</div><p>No client accounts yet</p></div>';
    return;
  }

  clientsList.innerHTML = clients.map(c => {
    const today = new Date().toISOString().split('T')[0];
    const isExpired = c.expiryDate && today > c.expiryDate;
    const daysLeft = c.expiryDate ? Math.ceil((new Date(c.expiryDate) - new Date(today)) / (1000 * 60 * 60 * 24)) : null;
    
    return `
      <div style="border:1px solid #ddd;border-radius:6px;padding:1rem;margin-bottom:0.8rem;background:#fafafa">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.8rem">
          <div>
            <div style="font-weight:700;color:var(--text)">${c.owner}</div>
            <div style="font-size:0.85rem;color:var(--muted)">${c.email}</div>
          </div>
          <span class="badge ${isExpired ? 'badge-red' : daysLeft && daysLeft <= 7 ? 'badge-amber' : 'badge-green'}">
            ${isExpired ? 'EXPIRED' : daysLeft ? daysLeft + ' days' : 'Active'}
          </span>
        </div>
        <div style="font-size:0.85rem;color:var(--muted);margin-bottom:0.8rem">
          <div>Pet: ${c.petName}</div>
          <div>Phone: ${c.phone}</div>
          <div>Created: ${c.createdDate}</div>
          ${c.expiryDate ? `<div>Expires: ${c.expiryDate}</div>` : '<div>No expiry date set</div>'}
        </div>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-outline btn-sm" onclick="editClientExpiry('${c.email}')">Set Expiry</button>
          <button class="btn btn-danger btn-sm" onclick="deleteClientAccount('${c.email}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

async function createNewClient() {
  const email = document.getElementById('new-client-email').value.trim();
  const password = document.getElementById('new-client-password').value;
  const petName = document.getElementById('new-client-pet').value.trim();
  const owner = document.getElementById('new-client-owner').value.trim();
  const phone = document.getElementById('new-client-phone').value.trim();
  const expiryDate = document.getElementById('new-client-expiry').value || null;

  if (!email || !password || !petName || !owner) {
    showToast('Please fill in all required fields', 'amber');
    return;
  }

  const result = await createClientAccount(email, password, petName, owner, phone, expiryDate);

  if (result.success) {
    document.getElementById('new-client-email').value = '';
    document.getElementById('new-client-password').value = '';
    document.getElementById('new-client-pet').value = '';
    document.getElementById('new-client-owner').value = '';
    document.getElementById('new-client-phone').value = '';
    document.getElementById('new-client-expiry').value = '';
    
    await renderClientsList();
    showToast(`Account created for ${owner}!`);
  } else {
    showToast(result.message, 'amber');
  }
}

async function editClientExpiry(email) {
  const client = await getClientAccount(email);
  if (!client) return;

  const newDate = prompt('Set new expiry date (YYYY-MM-DD):\nLeave empty for no expiry', client.expiryDate || '');
  
  if (newDate !== null) {
    await updateClientAccount(email, { expiryDate: newDate || null });
    await renderClientsList();
    showToast(`Expiry date updated for ${client.owner}!`);
  }
}

async function deleteClientAccount(email) {
  const client = await getClientAccount(email);
  if (!client || !confirm(`Delete account for ${client.owner}? This cannot be undone.`)) return;

  await deleteClient(email);
  await renderClientsList();
  showToast(`Account deleted for ${client.owner}`);
}

//  INIT
initializeAdminApp();
