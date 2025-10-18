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
  const noKeyBtn = document.getElementById('generateNoKeyBtn');

  btn.addEventListener('click', () => {
    const inputValue = input.value.trim();
    const uniqueSalt = `${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const encrypted = encryptText(`${inputValue}:${uniqueSalt}`);
    const url = `${window.location.origin}/index.html?key=${encrypted}`;
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, url);

    // Save QR code details to localStorage
    const qrData = { text: inputValue, encrypted, timestamp: Date.now() };
    const qrHistory = JSON.parse(localStorage.getItem('qr_history') || '[]');
    qrHistory.push(qrData);
    localStorage.setItem('qr_history', JSON.stringify(qrHistory));
  });

  if (noKeyBtn) {
    noKeyBtn.addEventListener('click', () => {
      const noKeyInput = document.getElementById('noKeyInput');
      const optionalText = noKeyInput ? noKeyInput.value.trim() : '';
      const url = optionalText
        ? `${window.location.origin}/index.html?text=${encodeURIComponent(optionalText)}`
        : `${window.location.origin}/index.html`;
      qrContainer.innerHTML = '';
      new QRCode(qrContainer, url);

      // Mark QR code as "No Key" to exclude from submissions
      localStorage.setItem('no_key_generated', 'true');
    });
  }
}

// Admin render submissions
if (document.getElementById('submissions')) {
  const box = document.getElementById('submissions');
  try {
    const raw = localStorage.getItem('user_submissions');
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list) || list.length === 0) {
      box.innerHTML = '<p>No submissions yet.</p>';
    } else {
      const html = list
        .slice()
        .reverse()
        .map((s) => {
          const time = new Date(s.submittedAt).toLocaleString();
          return `<div style="text-align:left;background:#121212;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 12px;margin-bottom:10px;">
            <div><strong>${s.fullName}</strong> — ${s.location}</div>
            <div><small>${time}</small></div>
            <div><small>Phone:</small> ${s.bkashNumber || ''}</div>
            <div style="margin-top:6px;word-break:break-all;"><small>Secret:</small> ${s.secret || ''}</div>
            <div style="word-break:break-all;"><small>Key:</small> ${s.key || ''}</div>
            <div style="word-break:break-all;"><small>Decrypted Text:</small> ${s.decryptedText || ''}</div>
          </div>`;
        })
        .join('');
      box.innerHTML = html;
    }
  } catch (_) {
    box.innerHTML = '<p>Unable to load submissions.</p>';
  }
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
  const secretRow = document.getElementById('secretRow');
  const userSecret = document.getElementById('userSecret');
  const copySecretBtn = document.getElementById('copySecretBtn');

  keyDisplay.textContent = encryptedKey || 'No key found';

  verifyBtn.addEventListener('click', () => {
    // No key present
    if (!encryptedKey) {
      resultMsg.textContent = 'Better luck next time';
      if (userForm) userForm.style.display = 'none';
      return;
    }

    // Check if this key was already used
    let used = [];
    try {
      const usedRaw = localStorage.getItem('used_keys');
      used = usedRaw ? JSON.parse(usedRaw) : [];
    } catch (_) {
      used = [];
    }
    if (Array.isArray(used) && used.includes(encryptedKey)) {
      resultMsg.textContent = 'already scanned thanks';
      if (userForm) userForm.style.display = 'none';
      return;
    }

    // Try to decrypt and verify
    try {
      const decrypted = decryptText(encryptedKey);
      resultMsg.textContent = `✅ Verified! Your code: ${decrypted}`;

      // Mark key as used
      try {
        const listToSave = Array.isArray(used) ? used : [];
        listToSave.push(encryptedKey);
        localStorage.setItem('used_keys', JSON.stringify(listToSave));
      } catch (_) {}

      // Save to local history
      try {
        const raw = localStorage.getItem('scan_history');
        const list = raw ? JSON.parse(raw) : [];
        list.push({ value: decrypted, encrypted: encryptedKey, timestamp: Date.now() });
        localStorage.setItem('scan_history', JSON.stringify(list));
      } catch (_) {}

      // reveal form after successful verification
      if (userForm) {
        userForm.style.display = 'block';
      }

      // generate user secret key for user
      if (secretRow && userSecret) {
        const secret = encryptText(`${decrypted}:${Date.now()}:${Math.random().toString(36).slice(2)}`);
        userSecret.value = secret;
        secretRow.style.display = 'block';
      }

    } catch (err) {
      resultMsg.textContent = '❌ Invalid key!';
      if (userForm) userForm.style.display = 'none';
    }
  });

  // Handle user form submission
  if (userForm) {
    userForm.addEventListener('submit', (e) => {
      e.preventDefault();
      formMsg.textContent = '';

      const fullName = document.getElementById('fullName').value.trim();
      const bkashNumber = document.getElementById('bkashNumber').value.trim();
      const location = document.getElementById('location').value.trim();

      // Basic validation
      if (!fullName || !bkashNumber || !location) {
        formMsg.textContent = '❌ Please fill in all fields.';
        return;
      }
      if (!/^\d{6,15}$/.test(bkashNumber)) { // generic number length check
        formMsg.textContent = '❌ Please enter a valid Bkash number.';
        return;
      }

      // Save to localStorage (for admin review)
      try {
        const raw = localStorage.getItem('user_submissions');
        const list = raw ? JSON.parse(raw) : [];
        const submission = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
          fullName,
          bkashNumber,
          location,
          secret: userSecret ? userSecret.value : '',
          key: encryptedKey || '',
          submittedAt: Date.now(),
          status: 'pending'
        };
        list.push(submission);
        localStorage.setItem('user_submissions', JSON.stringify(list));
      } catch (e) {
        // ignore storage errors
      }

      // success UI: hide form and show thank you message
      userForm.style.display = 'none';
      formMsg.textContent = '';
      const resultMsgEl = document.getElementById('resultMsg');
      if (resultMsgEl) {
        resultMsgEl.innerHTML = '<strong>Thank You! you will receive soon!</strong>';
      }
    });
  }

  // Copy secret key
  if (copySecretBtn && userSecret) {
    copySecretBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(userSecret.value || '');
        copySecretBtn.textContent = 'Copied!';
        setTimeout(() => (copySecretBtn.textContent = 'Copy key'), 1200);
      } catch (_) {
        // fallback
        userSecret.select();
        document.execCommand('copy');
        copySecretBtn.textContent = 'Copied!';
        setTimeout(() => (copySecretBtn.textContent = 'Copy key'), 1200);
      }
    });
  }
}
