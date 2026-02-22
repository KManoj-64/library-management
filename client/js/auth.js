document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role')?.value || 'student';
  const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
  const json = await res.json();
  if (json.success) {
    // store token and user info
    localStorage.setItem('token', json.token);
    localStorage.setItem('userRole', json.user.role);
    localStorage.setItem('username', json.user.username);
    localStorage.setItem('userId', json.user.id);
    if (json.user.role === 'librarian') window.location = '/pages/admin-dashboard.html';
    else window.location = '/pages/student-dashboard.html';
  } else {
    alert(json.message || 'Login failed');
  }
});

// Register handler
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username')?.value;
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  const confirm = document.getElementById('confirmPassword')?.value;
  const role = document.getElementById('role')?.value || 'student';

  if (!username || !email || !password) return alert('Please fill all required fields');
  if (password !== confirm) return alert('Passwords do not match');

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role, email })
    });
    const json = await res.json();
    if (json.success) {
      // registration successful — redirect to login
      alert('Registration successful — please login');
      window.location = '/pages/login.html';
    } else {
      alert(json.message || 'Registration failed');
    }
  } catch (err) {
    console.error('Register error', err);
    alert('Registration error');
  }
});
