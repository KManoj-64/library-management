const TOKEN = localStorage.getItem('token');
const API_BASE = 'http://localhost:3000/api';

if (!TOKEN) {
  window.location.href = '/pages/login.html';
}

function goBack() {
  const role = localStorage.getItem('userRole');
  if (role === 'librarian') {
    window.location.href = '/pages/admin-dashboard.html';
  } else {
    window.location.href = '/pages/student-dashboard.html';
  }
}

async function loadTransactionHistory() {
  const search = (document.getElementById('historySearch')?.value || '').trim().toLowerCase();
  const status = document.getElementById('statusFilter')?.value || 'all';

  try {
    const response = await fetch(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const data = await response.json();
    const all = data.transactions || [];

    const rows = all
      .filter(item => status === 'all' ? true : item.status === status)
      .filter(item => {
        if (!search) return true;
        return (item.username || '').toLowerCase().includes(search) || (item.bookTitle || '').toLowerCase().includes(search);
      })
      .sort((a, b) => (b.issueDate || 0) - (a.issueDate || 0));

    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94a3b8;">No transaction records found</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(item => {
      const dueDate = item.returnDate ? new Date(item.returnDate) : null;
      const isOverdue = item.status === 'Issued' && dueDate && dueDate.getTime() < Date.now();
      const statusClass = item.status === 'Returned' ? 'badge-returned' : (isOverdue ? 'badge-overdue' : 'badge-issued');

      return `
      <tr>
        <td>${item.username || '-'}</td>
        <td>${item.bookTitle || '-'}</td>
        <td>${item.issueDate ? new Date(item.issueDate).toLocaleDateString() : '-'}</td>
        <td>${item.returnDate ? new Date(item.returnDate).toLocaleDateString() : '-'}</td>
        <td>${item.actualReturnDate ? new Date(item.actualReturnDate).toLocaleDateString() : '-'}</td>
        <td>₹${item.fine || 0}</td>
        <td><span class="badge ${statusClass}">${isOverdue ? 'Overdue' : (item.status || 'Issued')}</span></td>
      </tr>`;
    }).join('');
  } catch (err) {
    const tbody = document.getElementById('historyTableBody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#b91c1c;">Failed to load transaction history</td></tr>';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadTransactionHistory);
} else {
  loadTransactionHistory();
}
