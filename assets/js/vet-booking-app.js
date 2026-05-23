// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  AUTH CHECK
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
async function initializeAdminApp() {
  try {
    const authResult = checkAuth('admin');
    if (!authResult) return; // Will redirect if not authenticated

    // Load data from the backend
    await loadDataFromBackend();

    // Initialize the dashboard
    renderDashboard();
    console.log('âœ… Admin app initialized');
  } catch (error) {
    console.error('âŒ Error initializing admin app:', error);
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  DATA - REST API Integration
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
let appointments = [];
let patients = [];
let vets = [];
let currentFilter = 'all';

// Load all data from the backend
async function loadDataFromBackend() {
  try {
    appointments = await getAppointmentsFromDB();
    patients = await getPatientsFromDB();
    vets = await getVetsFromDB();

    // If no data exists, load defaults
    if (appointments.length === 0) {
      await loadDefaultData();
      // Reload after defaults are loaded
      appointments = await getAppointmentsFromDB();
      patients = await getPatientsFromDB();
      vets = await getVetsFromDB();
    }
  } catch (error) {
    console.error('Error loading data from backend:', error);
    // Fallback to localStorage if Firebase fails
    loadFallbackData();
  }
}

async function loadDefaultData() {
  const defaultAppointments = [
    { pet:'Buddy', emoji:'ðŸ¶', owner:'Maria Santos', phone:'0917-123-4567', service:'General Checkup', date:'2026-03-25', time:'9:00 AM', vet:'Dr. Reyes', status:'Confirmed', notes:'', clientEmail: null },
    { pet:'Mochi', emoji:'ðŸ±', owner:'Jose Reyes', phone:'0918-234-5678', service:'Vaccination', date:'2026-03-25', time:'10:00 AM', vet:'Dr. Santos', status:'Confirmed', notes:'', clientEmail: null },
  ];

  const defaultPatients = [
    { name:'Buddy', emoji:'ðŸ¶', species:'Dog', breed:'Labrador', age:'3 yrs', owner:'Maria Santos', phone:'0917-123-4567', lastVisit:'Mar 25, 2026' },
    { name:'Mochi', emoji:'ðŸ±', species:'Cat', breed:'Persian', age:'2 yrs', owner:'Jose Reyes', phone:'0918-234-5678', lastVisit:'Mar 25, 2026' },
  ];

  const defaultVets = [
    { name:'Dr. Reyes', emoji:'ðŸ‘©â€âš•ï¸', spec:'General Practice & Surgery', status:'Available', appts:18 },
    { name:'Dr. Santos', emoji:'ðŸ‘¨â€âš•ï¸', spec:'Dentistry & Dermatology', status:'Available', appts:14 },
    { name:'Dr. Cruz', emoji:'ðŸ‘©â€âš•ï¸', spec:'Exotic Animals & Birds', status:'On Leave', appts:9 },
    { name:'Dr. Garcia', emoji:'ðŸ‘¨â€âš•ï¸', spec:'Orthopedics & Rehabilitation', status:'Available', appts:12 },
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
    { id:1, pet:'Buddy', emoji:'ðŸ¶', owner:'Maria Santos', phone:'0917-123-4567', service:'General Checkup', date:'2026-03-25', time:'9:00 AM', vet:'Dr. Reyes', status:'Confirmed', notes:'' },
  ];
  patients = [
    { id:1, name:'Buddy', emoji:'ðŸ¶', species:'Dog', breed:'Labrador', age:'3 yrs', owner:'Maria Santos', phone:'0917-123-4567', lastVisit:'Mar 25, 2026' },
  ];
  vets = [
    { id:1, name:'Dr. Reyes', emoji:'ðŸ‘©â€âš•ï¸', spec:'General Practice & Surgery', status:'Available', appts:18 },
  ];
}

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  NAVIGATION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const pageTitles = {
  dashboard: ['Dashboard', 'Welcome back, Dr. Admin â€” ARF ðŸ¾'],
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
  if (page === 'book') {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('f-date').value = today;
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  RENDER DASHBOARD
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function renderDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);

  // Stats
  document.getElementById('stat-today').textContent = todayAppts.length;
  document.getElementById('stat-patients').textContent = patients.length;
  document.getElementById('stat-pending').textContent = appointments.filter(a => a.status === 'Pending').length;

  // Today's schedule
  const sched = document.getElementById('today-schedule');
  if (todayAppts.length === 0) {
    sched.innerHTML = '<div class="empty-state"><div class="emoji">ðŸ—“ï¸</div><p>No appointments today</p></div>';
  } else {
    sched.innerHTML = todayAppts.map(a => `
      <div class="appt-item" style="border-radius:12px; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
        <div class="appt-time-block">
          <div class="appt-time-big" style="color:var(--primary)">${a.time.split(':')[0]}</div>
          <div class="appt-time-sub">${a.time.includes('AM') ? 'AM' : 'PM'}</div>
        </div>
        <div style="font-size:2rem; background:#fff; border-radius:50%; padding:8px; box-shadow:var(--shadow-sm)">${a.emoji}</div>
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  APPOINTMENTS TABLE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function badgeClass(status) {
  return { Confirmed:'badge-green', Pending:'badge-amber', Completed:'badge-blue', Cancelled:'badge-red' }[status] || 'badge-grey';
}

function apptRow(a) {
  return `<tr>
    <td><div class="name-cell" style="display:flex; align-items:center; gap:12px;"><div class="pet-avatar" style="box-shadow: 0 2px 5px rgba(0,0,0,0.1); flex-shrink:0;">${a.emoji}</div><div><div class="name-main" style="font-weight:700">${a.pet}</div></div></div></td>
    <td><div class="name-main" style="font-weight:600">${a.owner}</div><div class="name-sub" style="font-size:0.75rem">${a.phone}</div></td>
    <td>${a.service}</td>
    <td><div class="name-main" style="color:var(--primary); font-weight:600">${formatDate(a.date)}</div><div class="name-sub" style="font-size:0.75rem">${a.time}</div></td>
    <td>${a.vet}</td>
    <td><span class="badge ${badgeClass(a.status)}">${a.status}</span></td>
    <td>
      <div class="action-row">
        <button class="btn btn-outline btn-sm" onclick="openEditModal('${a.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAppt('${a.id}')">âœ•</button>
      </div>
    </td>
  </tr>`;
}

function renderApptTable(list) {
  const tbody = document.getElementById('appt-tbody');
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="emoji">ðŸ“­</div><p>No appointments found</p></div></td></tr>`;
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  PATIENTS TABLE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function renderPatientsTable(list) {
  const tbody = document.getElementById('patients-tbody');
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="emoji">ðŸ¾</div><p>No patients found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(p => `
    <tr>
      <td><div class="name-cell"><div class="pet-avatar">${p.emoji}</div><div class="name-main">${p.name}</div></div></td>
      <td>${p.species} Â· ${p.breed}</td>
      <td>${p.age}</td>
      <td>${p.owner}</td>
      <td>${p.phone}</td>
      <td>${p.lastVisit}</td>
      <td>
        <div class="action-row">
          <button class="btn btn-outline btn-sm" onclick="showToast('ðŸ“‹ Patient record feature coming soon!')">View</button>
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  BOOKING FORM
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
async function submitBooking() {
  const pet = document.getElementById('f-pet').value.trim();
  const owner = document.getElementById('f-owner').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const date = document.getElementById('f-date').value;
  if (!pet || !owner || !phone || !date) {
    showToast('âš ï¸ Please fill in all required fields', 'amber');
    return;
  }
  const emojis = { 'Dog ðŸ¶':'ðŸ¶', 'Cat ðŸ±':'ðŸ±', 'Bird ðŸ¦':'ðŸ¦', 'Rabbit ðŸ°':'ðŸ°', 'Other':'ðŸ¾' };
  const speciesVal = document.getElementById('f-species').value;
  const newAppt = {
    pet, emoji: emojis[speciesVal] || 'ðŸ¾',
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
      await createPatientInDB({ name:pet, emoji: emojis[speciesVal]||'ðŸ¾', species:speciesVal.split(' ')[0], breed:'Unknown', age:'Unknown', owner, phone, lastVisit: formatDate(date) });
    }

    await loadDataFromBackend();
    clearForm();
    showToast(`âœ… Booking confirmed for ${pet}!`);
    renderDashboard();
  } catch (error) {
    showToast('âŒ Error creating booking', 'red');
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  EDIT / DELETE APPOINTMENT (ADMIN)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function openEditModal(id) {
  const a = appointments.find(x => String(x.id) === String(id));
  if (!a) return;
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-status').value = a.status;
  document.getElementById('edit-vet').value = a.vet;
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
      showToast('âœ… Appointment updated!');
    });
  }).catch(error => {
    console.error('Error updating appointment:', error);
    showToast('âŒ Error updating appointment', 'red');
  });
}

function deleteAppt(id) {
  if (!confirm('Delete this appointment?')) return;

  deleteAppointmentFromDB(id).then(() => {
    loadDataFromBackend().then(() => {
      filterAppts(currentFilter, null);
      renderDashboard();
      showToast('ðŸ—‘ï¸ Appointment removed');
    });
  }).catch(error => {
    console.error('Error deleting appointment:', error);
    showToast('âŒ Error deleting appointment', 'red');
  });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  VETS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function renderVets() {
  const statusBadge = { Available:'badge-green', 'On Leave':'badge-amber', Inactive:'badge-red' };
  document.getElementById('vets-list').innerHTML = vets.map(v => `
    <div class="vet-card" style="border-radius:12px; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
      <div class="vet-avatar" style="background:var(--green-light);font-size:2rem; box-shadow:inset 0 2px 4px rgba(0,0,0,0.05)">${v.emoji}</div>
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
        <button class="btn btn-danger btn-sm" onclick="removeVet('${v.id}')">âœ•</button>
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
      showToast(`Updated ${v.name} to ${newStatus}`);
    });
  }).catch(error => {
    console.error('Error updating vet status:', error);
    showToast('âŒ Error updating vet status', 'red');
  });
}

function removeVet(id) {
  if (!confirm('Remove this staff member?')) return;

  deleteVetFromDB(id).then(() => {
    loadDataFromBackend().then(() => {
      renderVets();
      showToast('Staff member removed');
    });
  }).catch(error => {
    console.error('Error removing vet:', error);
    showToast('âŒ Error removing vet', 'red');
  });
}

function openAddVetModal() { openModal('modal-vet'); }

function addVet() {
  const name = document.getElementById('mv-name').value.trim();
  if (!name) { showToast('âš ï¸ Name is required', 'amber'); return; }

  const newVet = {
    name,
    emoji: 'ðŸ§‘â€âš•ï¸',
    spec: document.getElementById('mv-spec').value || 'General Practice',
    status: document.getElementById('mv-status').value,
    appts: 0,
  };

  addVetInDB(newVet).then(() => {
    closeModal('modal-vet');
    loadDataFromBackend().then(() => {
      renderVets();
      showToast(`âœ… ${name} added to staff!`);
    });
    ['mv-name','mv-spec','mv-phone'].forEach(id => document.getElementById(id).value='');
  }).catch(error => {
    console.error('Error adding vet:', error);
    showToast('âŒ Error adding vet', 'red');
  });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  PATIENTS MODAL
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function openAddPatientModal() { openModal('modal-patient'); }

function addPatient() {
  const name = document.getElementById('mp-name').value.trim();
  const owner = document.getElementById('mp-owner').value.trim();
  if (!name || !owner) { showToast('âš ï¸ Pet name & owner required', 'amber'); return; }

  const emojis = { 'Dog ðŸ¶':'ðŸ¶', 'Cat ðŸ±':'ðŸ±', 'Bird ðŸ¦':'ðŸ¦', 'Rabbit ðŸ°':'ðŸ°', 'Other':'ðŸ¾' };
  const sp = document.getElementById('mp-species').value;
  const newPatient = {
    name,
    emoji: emojis[sp]||'ðŸ¾',
    species: sp.split(' ')[0],
    breed: document.getElementById('mp-breed').value || 'Unknown',
    age: document.getElementById('mp-age').value || 'Unknown',
    owner,
    phone: document.getElementById('mp-phone').value || 'â€”',
    lastVisit: 'â€”',
  };

  createPatientInDB(newPatient).then(() => {
    closeModal('modal-patient');
    loadDataFromBackend().then(() => {
      renderPatientsTable(patients);
      document.getElementById('stat-patients').textContent = patients.length;
      showToast(`âœ… ${name} added!`);
    });
    ['mp-name','mp-breed','mp-age','mp-owner','mp-phone'].forEach(id => document.getElementById(id).value='');
  }).catch(error => {
    console.error('Error adding patient:', error);
    showToast('âŒ Error adding patient', 'red');
  });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  REPORTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function renderReports() {
  const services = {};
  appointments.forEach(a => { services[a.service] = (services[a.service]||0)+1; });
  const total = Object.values(services).reduce((s,v)=>s+v,0);
  const colors = ['var(--green)','var(--amber)','var(--blue)','var(--red)','#9b59b6','#1abc9c'];
  let i=0;
  const chartHTML = Object.entries(services).sort((a,b)=>b[1]-a[1]).map(([s,c]) => {
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

  const topHTML = patients.slice(0,5).map((p,idx) => `
    <div style="display:flex;align-items:center;gap:0.8rem;padding:0.65rem 0;border-bottom:1px solid #f0ede8">
      <div style="font-size:1.1rem;font-weight:800;color:var(--muted);width:1.2rem">${idx+1}</div>
      <div style="font-size:1.2rem">${p.emoji}</div>
      <div style="flex:1"><div style="font-weight:700;font-size:0.84rem">${p.name}</div><div style="font-size:0.72rem;color:var(--muted)">${p.owner}</div></div>
      <span class="badge badge-green">${appointments.filter(a=>a.pet===p.name).length} visits</span>
    </div>
  `).join('');
  document.getElementById('top-patients').innerHTML = topHTML;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  UTILS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  CLIENT MANAGEMENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
async function renderClientsPage() {
  await renderClientsList();
}

async function renderClientsList() {
  const clients = await getAllClients();
  const clientsList = document.getElementById('clients-list');

  if (clients.length === 0) {
    clientsList.innerHTML = '<div class="empty-state"><div class="emoji">ðŸ‘¥</div><p>No client accounts yet</p></div>';
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
          <div>ðŸ¾ Pet: ${c.petName}</div>
          <div>ðŸ“ž Phone: ${c.phone}</div>
          <div>ðŸ“… Created: ${c.createdDate}</div>
          ${c.expiryDate ? `<div>â° Expires: ${c.expiryDate}</div>` : '<div>â° No expiry date set</div>'}
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
    showToast('âš ï¸ Please fill in all required fields', 'amber');
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
    showToast(`âœ… Account created for ${owner}!`);
  } else {
    showToast('âŒ ' + result.message, 'amber');
  }
}

async function editClientExpiry(email) {
  const client = await getClientAccount(email);
  if (!client) return;

  const newDate = prompt('Set new expiry date (YYYY-MM-DD):\nLeave empty for no expiry', client.expiryDate || '');
  
  if (newDate !== null) {
    await updateClientAccount(email, { expiryDate: newDate || null });
    await renderClientsList();
    showToast(`âœ… Expiry date updated for ${client.owner}!`);
  }
}

async function deleteClientAccount(email) {
  const client = await getClientAccount(email);
  if (!client || !confirm(`Delete account for ${client.owner}? This cannot be undone.`)) return;

  await deleteClient(email);
  await renderClientsList();
  showToast(`ðŸ—‘ï¸ Account deleted for ${client.owner}`);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  INIT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
initializeAdminApp();
