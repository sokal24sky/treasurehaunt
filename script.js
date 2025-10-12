// Example "fake" encryption/decryption for demo
function encryptText(text) {
  return btoa(text); // base64 encoding for demo (replace with strong encryption later)
}

function decryptText(encrypted) {
  return atob(encrypted);
}

// Admin Page Logic
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

  keyDisplay.textContent = encryptedKey || 'No key found';

  verifyBtn.addEventListener('click', () => {
    if (!encryptedKey) {
      resultMsg.textContent = "❌ No key to verify!";
      return;
    }

    try {
      const decrypted = decryptText(encryptedKey);
      resultMsg.textContent = `✅ Verified! Your code: ${decrypted}`;

      // 🚨 Here you can call backend API to notify admin
      // fetch('/api/notify', { method: 'POST', body: JSON.stringify({ key: encryptedKey }) })

    } catch (err) {
      resultMsg.textContent = "❌ Invalid key!";
    }
  });
}
