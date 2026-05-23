// ═══════════════════════════════════════════
//  AUTH SYSTEM - REST API Integration
// ═══════════════════════════════════════════

// Initialize data from the API or defaults
async function initAuthData() {
  try {
    // Check if admin settings exist in the backend
    const adminSettings = await getAdminSettingsFromDB();
    if (!adminSettings) {
      // Initialize default admin settings
      await saveAdminSettingsInDB({
        adminPassword: 'admin123',
        clinicName: 'ARF — Animal Relief Facility',
        clinicPhone: '+63 2 8123 4567'
      });
    }
  } catch (error) {
    console.warn('⚠️ Backend API not ready yet:', error);
  }
}

function showAlert(msg, type = 'error') {
  const alert = document.getElementById('alert');
  if (!alert) return; // Alert element may not exist on all pages
  alert.textContent = msg;
  alert.className = 'alert show alert-' + type;
  setTimeout(() => alert.classList.remove('show'), 4000);
}

// ═══════════════════════════════════════════
//  CLIENT LOGIN
// ═══════════════════════════════════════════
async function clientLogin() {
  const email = document.getElementById('client-email').value.trim();
  const password = document.getElementById('client-password').value;

  if (!email || !password) {
    showAlert('Please fill in email and password');
    return;
  }

  try {
    const client = await getClientFromDB(email);

    if (!client || client.password !== password) {
      showAlert('❌ Invalid email or password');
      return;
    }

    // Check if account is expired
    if (client.expiryDate) {
      const today = new Date().toISOString().split('T')[0];
      if (today > client.expiryDate) {
        showAlert('❌ Your account has expired. Please contact ARF Clinic.');
        return;
      }
    }

    // Login successful
    sessionStorage.setItem('current_user', JSON.stringify(client));
    sessionStorage.setItem('user_role', 'client');
    showAlert('✅ Login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'client-dashboard.html';
    }, 1000);
  } catch (error) {
    console.error('Login error:', error);
    showAlert('❌ An error occurred. Please try again.');
  }
}

// ═══════════════════════════════════════════
//  ADMIN LOGIN
// ═══════════════════════════════════════════
async function adminLogin(password) {
  const pwd = password ?? document.getElementById('admin-password')?.value ?? document.getElementById('unified-password')?.value;

  if (!pwd) {
    showAlert('Please enter admin password');
    return false;
  }

  try {
    const settings = await getAdminSettingsFromDB();
    const adminPassword = settings?.adminPassword || 'admin123';

    if (pwd !== adminPassword) {
      showAlert('❌ Invalid admin password');
      return false;
    }

    sessionStorage.setItem('user_role', 'admin');
    showAlert('✅ Admin login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'vet-booking-app.html';
    }, 1000);
    return true;
  } catch (error) {
    console.error('Admin login error:', error);
    showAlert('❌ An error occurred. Please try again.');
    return false;
  }
}

async function unifiedLogin() {
  const email = document.getElementById('unified-email').value.trim().toLowerCase();
  const password = document.getElementById('unified-password').value;

  if (!email || !password) {
    showAlert('Please fill in email and password');
    return;
  }

  const adminIdentifiers = ['admin', 'admin@arfclinic.com', 'administrator'];

  if (adminIdentifiers.includes(email)) {
    const adminOK = await adminLogin(password);
    if (adminOK) return;
  }

  // attempt client login (if not admin or admin credentials failed)
  try {
    const client = await getClientFromDB(email);

    if (!client || client.password !== password) {
      if (adminIdentifiers.includes(email)) {
        // admin email + wrong admin password already handled above
        showAlert('❌ Invalid admin credentials');
      } else {
        showAlert('❌ Invalid email or password');
      }
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (client.expiryDate && today > client.expiryDate) {
      showAlert('❌ Your account has expired. Please contact ARF Clinic.');
      return;
    }

    sessionStorage.setItem('current_user', JSON.stringify(client));
    sessionStorage.setItem('user_role', 'client');
    showAlert('✅ Login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'client-dashboard.html';
    }, 1000);
  } catch (error) {
    console.error('Login error:', error);
    showAlert('❌ An error occurred. Please try again.');
  }
}

function handleForgotPassword() {
  const email = document.getElementById('unified-email').value.trim();
  if (!email || email.toLowerCase() === 'admin') {
    showAlert('Please enter your registered email address first.');
    return;
  }
  // Since this app currently uses custom password tracking in Firestore,
  // we direct the user to the clinic staff for verification.
  showAlert('Please contact ARF Clinic at +63 2 8123 4567 to verify your identity and request a password reset.', 'success');
}

// ═══════════════════════════════════════════
//  PROTECT PAGES
// ═══════════════════════════════════════════
function checkAuth(requiredRole = null) {
  const userRole = sessionStorage.getItem('user_role');
  const currentUser = sessionStorage.getItem('current_user');
  const redirectPath = window.location.pathname.startsWith('/pages/') ? '../index.html' : 'index.html';

  if (!userRole) {
    window.location.href = redirectPath;
    return null;
  }

  if (requiredRole && userRole !== requiredRole) {
    window.location.href = redirectPath;
    return null;
  }

  if (userRole === 'client' && currentUser) {
    return JSON.parse(currentUser);
  }

  return { role: userRole };
}

function logout() {
  sessionStorage.clear();
  const redirectPath = window.location.pathname.startsWith('/pages/') ? '../index.html' : 'index.html';
  window.location.href = redirectPath;
}

// ═══════════════════════════════════════════
//  CLIENT ACCOUNT MANAGEMENT - REST API
// ═══════════════════════════════════════════
async function createClientAccount(email, password, petName, owner, phone, expiryDate = null) {
  try {
    return await createClientInDB(email, password, petName, owner, phone, expiryDate);
  } catch (error) {
    console.error('Error creating client account:', error);
    return { success: false, message: error.message };
  }
}

async function getClientAccount(email) {
  try {
    return await getClientFromDB(email);
  } catch (error) {
    console.error('Error fetching client account:', error);
    return null;
  }
}

async function updateClientAccount(email, updates) {
  try {
    const result = await updateClientInDB(email, updates);
    return result.success;
  } catch (error) {
    console.error('Error updating client account:', error);
    return false;
  }
}

async function getAllClients() {
  try {
    return await getAllClientsFromDB();
  } catch (error) {
    console.error('Error fetching all clients:', error);
    return [];
  }
}

async function deleteClient(email) {
  try {
    await deleteClientFromDB(email);
  } catch (error) {
    console.error('Error deleting client:', error);
  }
}

// ═══════════════════════════════════════════
//  APPOINTMENTS - REST API
// ═══════════════════════════════════════════
async function getClientBookings(clientEmail) {
  try {
    return await getClientAppointmentsFromDB(clientEmail);
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    return [];
  }
}

async function initAppointmentsData() {
  try {
    const appointments = await getAppointmentsFromDB();
    if (appointments.length === 0) {
      await loadDefaultAppointments();
    }
  } catch (error) {
    console.warn('⚠️ Could not initialize appointments:', error);
  }
}

async function loadDefaultAppointments() {
  const defaultAppointments = [
    { pet:'Buddy', emoji:'🐶', owner:'Maria Santos', phone:'0917-123-4567', service:'General Checkup', date:'2026-03-25', time:'9:00 AM', vet:'Dr. Reyes', status:'Confirmed', notes:'', clientEmail: null },
    { pet:'Mochi', emoji:'🐱', owner:'Jose Reyes', phone:'0918-234-5678', service:'Vaccination', date:'2026-03-25', time:'10:00 AM', vet:'Dr. Santos', status:'Confirmed', notes:'', clientEmail: null },
  ];
  
  for (const appt of defaultAppointments) {
    await createAppointmentInDB(appt);
  }
}

// ═══════════════════════════════════════════
//  AUTO EXPIRY CHECK - REST API
// ═══════════════════════════════════════════
async function checkAccountExpiry() {
  try {
    const clients = await getAllClientsFromDB();
    const today = new Date().toISOString().split('T')[0];

    for (const client of clients) {
      if (client.expiryDate && today > client.expiryDate && client.status === 'Active') {
        await updateClientInDB(client.email, { status: 'Expired' });
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not check account expiry:', error);
  }
}

// Optional bootstrap for pages that explicitly need background maintenance.
async function initializeApp() {
  try {
    await initAuthData();
    await initAppointmentsData();
    await checkAccountExpiry();
    console.log('✅ ARF App initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing app:', error);
  }
}
