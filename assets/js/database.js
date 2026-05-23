const DEFAULT_API_BASE_URL = `${window.location.origin}/api`;
const API_BASE_URL = (window.API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : {};
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

async function createClientInDB(email, password, petName, owner, phone, expiryDate = null) {
  try {
    return await apiRequest('/clients', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        petName,
        owner,
        phone,
        expiryDate,
        status: 'Active'
      })
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return { success: false, message: error.message };
  }
}

async function getClientFromDB(email) {
  try {
    return await apiRequest(`/clients/${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Error fetching client:', error);
    return null;
  }
}

async function getAllClientsFromDB() {
  try {
    return await apiRequest('/clients');
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
}

async function updateClientInDB(email, updates) {
  try {
    return await apiRequest(`/clients/${encodeURIComponent(email)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return { success: false, message: error.message };
  }
}

async function deleteClientFromDB(email) {
  try {
    return await apiRequest(`/clients/${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return { success: false, message: error.message };
  }
}

async function createAppointmentInDB(appointmentData) {
  try {
    return await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false, message: error.message };
  }
}

async function getAppointmentsFromDB() {
  try {
    return await apiRequest('/appointments');
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

async function getClientAppointmentsFromDB(clientEmail) {
  try {
    if (!clientEmail) return [];
    return await apiRequest(`/appointments/client/${encodeURIComponent(clientEmail)}`);
  } catch (error) {
    console.error('Error fetching client appointments:', error);
    return [];
  }
}

async function updateAppointmentInDB(appointmentId, updates) {
  try {
    return await apiRequest(`/appointments/${encodeURIComponent(appointmentId)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return { success: false, message: error.message };
  }
}

async function deleteAppointmentFromDB(appointmentId) {
  try {
    return await apiRequest(`/appointments/${encodeURIComponent(appointmentId)}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return { success: false, message: error.message };
  }
}

async function getVetsFromDB() {
  try {
    return await apiRequest('/vets');
  } catch (error) {
    console.error('Error fetching vets:', error);
    return [];
  }
}

async function updateVetInDB(vetId, updates) {
  try {
    return await apiRequest(`/vets/${encodeURIComponent(vetId)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  } catch (error) {
    console.error('Error updating vet:', error);
    return { success: false, message: error.message };
  }
}

async function addVetInDB(vetData) {
  try {
    return await apiRequest('/vets', {
      method: 'POST',
      body: JSON.stringify(vetData)
    });
  } catch (error) {
    console.error('Error adding vet:', error);
    return { success: false, message: error.message };
  }
}

async function deleteVetFromDB(vetId) {
  try {
    return await apiRequest(`/vets/${encodeURIComponent(vetId)}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting vet:', error);
    return { success: false, message: error.message };
  }
}

async function createPatientInDB(patientData) {
  try {
    return await apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    return { success: false, message: error.message };
  }
}

async function getPatientsFromDB() {
  try {
    return await apiRequest('/patients');
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}

async function updatePatientInDB(patientId, updates) {
  try {
    return await apiRequest(`/patients/${encodeURIComponent(patientId)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    return { success: false, message: error.message };
  }
}

function listenToAppointments(callback) {
  console.warn('Realtime listeners are not available with MySQL REST API.');
  return { unsubscribe: () => {} };
}

function listenToClients(callback) {
  console.warn('Realtime listeners are not available with MySQL REST API.');
  return { unsubscribe: () => {} };
}

async function saveAdminSettingsInDB(settings) {
  try {
    return await apiRequest('/settings/admin', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  } catch (error) {
    console.error('Error saving admin settings:', error);
    return { success: false, message: error.message };
  }
}

async function getAdminSettingsFromDB() {
  try {
    return await apiRequest('/settings');
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return null;
  }
}
