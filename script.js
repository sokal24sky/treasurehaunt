// Example "fake" encryption/decryption for demo
function encryptText(text) {
  return btoa(text); // base64 encoding for demo (replace with strong encryption later)
}

function decryptText(encrypted) {
  return atob(encrypted);
}

// Admin Password Protection
const ADMIN_PASSWORD = 'Hi123456'; // Change this to your desired password
const SESSION_KEY = 'admin_authenticated';

// Check if user is already authenticated
function checkAuth() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

// Show admin panel and hide password form
function showAdminPanel() {
  document.getElementById('passwordForm').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
}

// Show password form and hide admin panel
function showPasswordForm() {
  document.getElementById('passwordForm').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('passwordInput').value = '';
  document.getElementById('errorMsg').textContent = '';
}

// Handle login
function handleLogin() {
  const passwordInput = document.getElementById('passwordInput');
  const errorMsg = document.getElementById('errorMsg');
  const password = passwordInput.value.trim();

  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    showAdminPanel();
  } else {
    errorMsg.textContent = '❌ Invalid password!';
    passwordInput.value = '';
    passwordInput.focus();
  }
}

// Handle logout
function handleLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  showPasswordForm();
}

// Initialize admin page
if (document.getElementById('passwordForm')) {
  // Check if already authenticated
  if (checkAuth()) {
    showAdminPanel();
  } else {
    showPasswordForm();
  }

  // Add event listeners
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('passwordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Admin Panel Logic (QR Code Generation)
if (document.getElementById('generateBtn')) {
  const input = document.getElementById('encryptInput');
  const btn = document.getElementById('generateBtn');
  const qrContainer = document.getElementById('qrContainer');

  btn.addEventListener('click', () => {
    const encrypted = encryptText(input.value.trim());
    const url = `${window.location.origin}/index.html?key=${encrypted}`;
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, url);
  });
}

// User Page Logic
if (document.getElementById('verifyBtn')) {
  const params = new URLSearchParams(window.location.search);
  const encryptedKey = params.get('key');
  const keyDisplay = document.getElementById('keyDisplay');
  const resultMsg = document.getElementById('resultMsg');
  const verifyBtn = document.getElementById('verifyBtn');
  const userForm = document.getElementById('userForm');
  const formMsg = document.getElementById('formMsg');

  keyDisplay.textContent = encryptedKey || 'No key found';

  verifyBtn.addEventListener('click', () => {
    if (!encryptedKey) {
      resultMsg.textContent = "❌ No key to verify!";
      return;
    }

    try {
      const decrypted = decryptText(encryptedKey);
      resultMsg.textContent = `✅ Verified! Your code: ${decrypted}`;

      // reveal form after successful verification
      if (userForm) {
        userForm.style.display = 'block';
      }

      // 🚨 Here you can call backend API to notify admin
      // fetch('/api/notify', { method: 'POST', body: JSON.stringify({ key: encryptedKey }) })

      // Save to local history
      try {
        const raw = localStorage.getItem('scan_history');
        const list = raw ? JSON.parse(raw) : [];
        list.push({ value: decrypted, encrypted: encryptedKey, timestamp: Date.now() });
        localStorage.setItem('scan_history', JSON.stringify(list));
      } catch (e) {
        // ignore storage errors
      }

    } catch (err) {
      resultMsg.textContent = "❌ Invalid key!";
    }
  });

  // Handle user form submission
  if (userForm) {
    userForm.addEventListener('submit', (e) => {
      e.preventDefault();
      formMsg.textContent = '';

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const bkashNumber = document.getElementById('bkashNumber').value.trim();
      const location = document.getElementById('location').value.trim();

      // Basic validation
      if (!firstName || !lastName || !bkashNumber || !location) {
        formMsg.textContent = '❌ Please fill in all fields.';
        return;
      }
      if (!/^\d{6,15}$/.test(bkashNumber)) { // generic number length check
        formMsg.textContent = '❌ Please enter a valid Bkash number.';
        return;
      }

      // Save to localStorage
      try {
        const raw = localStorage.getItem('user_submissions');
        const list = raw ? JSON.parse(raw) : [];
        list.push({ firstName, lastName, bkashNumber, location, submittedAt: Date.now() });
        localStorage.setItem('user_submissions', JSON.stringify(list));
      } catch (e) {
        // ignore storage errors
      }

      // success UI
      formMsg.style.color = '#22c55e';
      formMsg.textContent = '✅ Submitted successfully!';
      userForm.reset();
    });
  }
}
