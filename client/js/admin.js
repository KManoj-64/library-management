const TOKEN = localStorage.getItem('token');
const API_BASE = 'http://localhost:3000/api';
const bookFilters = {
  q: '',
  sortBy: 'title',
  sortOrder: 'asc',
  page: 1,
  limit: 8,
  pages: 1
};

if (!TOKEN || localStorage.getItem('userRole') !== 'librarian') {
  window.location.href = '/pages/login.html';
}

function getElement(id) {
  return document.getElementById(id);
}

function showLoader(text = 'Loading...') {
  const overlay = getElement('globalLoader');
  const loaderText = getElement('loaderText');
  if (loaderText) loaderText.textContent = text;
  if (overlay) overlay.classList.add('active');
}

function hideLoader() {
  const overlay = getElement('globalLoader');
  if (overlay) overlay.classList.remove('active');
}

function showAlert(message, type = 'success') {
  const container = getElement('alertContainer');
  if (!container) return;

  const alert = document.createElement('div');
  alert.className = `alert ${type}`;
  alert.textContent = message;
  container.prepend(alert);

  setTimeout(() => {
    alert.remove();
  }, 3500);
}

function setFieldError(fieldId, message = '') {
  const field = getElement(`${fieldId}Error`);
  if (field) field.textContent = message;
}

function clearValidation(formType) {
  if (formType === 'book') {
    setFieldError('bookTitle');
    setFieldError('bookAuthor');
    setFieldError('bookCopies');
    setFieldError('bookCoverFile');
  }

  if (formType === 'issue') {
    setFieldError('issueBook');
    setFieldError('issueStudent');
    setFieldError('issueDays');
  }
}

function renderMonthlyBorrowingChart(points = []) {
  const canvas = getElement('monthlyBorrowingChart');
  const emptyState = getElement('chartEmptyState');
  if (!canvas) return;

  const chartPoints = Array.isArray(points) ? points : [];
  const hasData = chartPoints.length > 0;
  if (emptyState) {
    emptyState.style.display = hasData ? 'none' : 'block';
  }

  const context = canvas.getContext('2d');
  if (!context) return;

  const width = canvas.clientWidth || 600;
  const height = canvas.clientHeight || 280;
  canvas.width = width;
  canvas.height = height;

  context.clearRect(0, 0, width, height);
  if (!hasData) return;

  const padding = { top: 20, right: 18, bottom: 42, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...chartPoints.map(item => item.count || 0), 1);
  const barCount = chartPoints.length;
  const gap = 12;
  const barWidth = Math.max(18, (chartWidth - gap * (barCount - 1)) / barCount);

  context.strokeStyle = '#cbd5e1';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(padding.left, padding.top);
  context.lineTo(padding.left, padding.top + chartHeight);
  context.lineTo(padding.left + chartWidth, padding.top + chartHeight);
  context.stroke();

  context.font = '12px Segoe UI';
  context.fillStyle = '#64748b';
  context.textAlign = 'right';
  context.fillText(String(maxValue), padding.left - 8, padding.top + 4);
  context.fillText('0', padding.left - 8, padding.top + chartHeight + 4);

  chartPoints.forEach((item, index) => {
    const value = item.count || 0;
    const x = padding.left + index * (barWidth + gap);
    const barHeight = (value / maxValue) * chartHeight;
    const y = padding.top + chartHeight - barHeight;

    context.fillStyle = '#2563eb';
    context.fillRect(x, y, barWidth, barHeight);

    context.fillStyle = '#1e293b';
    context.textAlign = 'center';
    context.fillText(String(value), x + barWidth / 2, y - 6);

    context.fillStyle = '#475569';
    context.fillText(item.label || '', x + barWidth / 2, padding.top + chartHeight + 18);
  });
}

async function fetchJson(url, options = {}, loadingText = null) {
  try {
    if (loadingText) showLoader(loadingText);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${TOKEN}`
      }
    });

    let data = null;
    try {
      data = await response.json();
    } catch (parseErr) {
      data = { success: false, message: response.statusText || 'Unexpected server response' };
    }

    if (response.status === 401) {
      showAlert('Session expired. Please login again.', 'error');
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/pages/login.html';
      }, 1200);
      return { ok: false, data: data || { message: 'Unauthorized' } };
    }

    return { ok: response.ok, data };
  } finally {
    if (loadingText) hideLoader();
  }
}

function openModal(id) {
  getElement(id)?.classList.add('active');
}

function closeModal(id) {
  getElement(id)?.classList.remove('active');
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));

  const tab = getElement(tabName);
  if (tab) tab.classList.add('active');

  document.querySelectorAll('.tab-button').forEach(button => {
    if (button.getAttribute('onclick')?.includes(`'${tabName}'`)) {
      button.classList.add('active');
    }
  });

  if (tabName === 'books') loadBooks();
  if (tabName === 'users') loadStudents();
  if (tabName === 'transactions') {
    loadIssuedBooks();
    loadReturnedBooks();
  }
  if (tabName === 'dashboard') refreshDashboard();
}

function openAddBookModal() {
  clearValidation('book');
  getElement('bookId').value = '';
  getElement('bookCoverImage').value = '';
  getElement('bookTitle').value = '';
  getElement('bookAuthor').value = '';
  getElement('bookISBN').value = '';
  getElement('bookCategory').value = '';
  getElement('bookPublisher').value = '';
  getElement('bookYear').value = new Date().getFullYear();
  getElement('bookDescription').value = '';
  getElement('bookCopies').value = 1;
  const coverInput = getElement('bookCoverFile');
  if (coverInput) coverInput.value = '';
  const preview = getElement('bookCoverPreview');
  if (preview) {
    preview.style.display = 'none';
    preview.removeAttribute('src');
  }
  getElement('modalTitle').textContent = 'Add New Book';
  openModal('bookModal');
}

function openIssueModal() {
  clearValidation('issue');
  loadIssueBooks();
  loadIssueStudents();
  getElement('issueDays').value = 14;
  openModal('issueModal');
}

async function loadBooks() {
  const params = new URLSearchParams({
    q: bookFilters.q,
    sortBy: bookFilters.sortBy,
    sortOrder: bookFilters.sortOrder,
    page: String(bookFilters.page),
    limit: String(bookFilters.limit)
  });

  const { ok, data } = await fetchJson(`${API_BASE}/books?${params.toString()}`, {}, 'Loading books...');
  if (!ok) {
    showAlert(data.message || 'Failed to load books', 'error');
    return;
  }

  const books = data.books || [];
  const pagination = data.pagination || { page: 1, pages: 1 };
  bookFilters.page = pagination.page || 1;
  bookFilters.pages = pagination.pages || 1;

  const tbody = getElement('booksTable');

  if (!tbody) return;

  tbody.innerHTML = books.length > 0
    ? books.map(book => `
      <tr>
        <td>${book.coverImage ? `<img class="cover-thumb" src="${book.coverImage}" alt="${book.title}">` : '-'}</td>
        <td><strong>${book.title}</strong></td>
        <td>${book.author}</td>
        <td>${book.isbn || '-'}</td>
        <td>${book.category || '-'}</td>
        <td>${book.copies || 0}</td>
        <td><strong>${book.availableCopies || 0}</strong></td>
        <td>
          <button class="btn-success" onclick="editBook('${book.id}')">Edit</button>
          <button class="btn-danger" onclick="deleteBook('${book.id}')" style="margin-left:6px;">Delete</button>
        </td>
      </tr>
    `).join('')
    : '<tr><td colspan="8" style="text-align:center;color:#94a3b8;">No books found</td></tr>';

  const pageInfo = getElement('bookPageInfo');
  if (pageInfo) {
    pageInfo.textContent = `Page ${bookFilters.page} of ${bookFilters.pages || 1}`;
  }
}

function applyBookFilters() {
  bookFilters.q = (getElement('bookSearchInput')?.value || '').trim();
  bookFilters.sortBy = getElement('bookSortBy')?.value || 'title';
  bookFilters.sortOrder = getElement('bookSortOrder')?.value || 'asc';
  bookFilters.page = 1;
  loadBooks();
}

function changeBookPage(delta) {
  const nextPage = bookFilters.page + delta;
  if (nextPage < 1 || nextPage > (bookFilters.pages || 1)) return;
  bookFilters.page = nextPage;
  loadBooks();
}

async function uploadBookCover() {
  const fileInput = getElement('bookCoverFile');
  const file = fileInput?.files?.[0];
  if (!file) return getElement('bookCoverImage')?.value || '';

  if (!file.type.startsWith('image/')) {
    setFieldError('bookCoverFile', 'Please upload an image file');
    return null;
  }

  const formData = new FormData();
  formData.append('cover', file);

  showLoader('Uploading cover image...');
  try {
    const response = await fetch(`${API_BASE}/books/upload-cover`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: formData
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      setFieldError('bookCoverFile', data.message || 'Failed to upload cover image');
      return null;
    }

    return data.coverImage;
  } finally {
    hideLoader();
  }
}

async function loadIssuedBooks() {
  const { ok, data } = await fetchJson(`${API_BASE}/transactions/issued`, {}, 'Loading issued books...');
  if (!ok) {
    showAlert(data.message || 'Failed to load issued books', 'error');
    return;
  }

  const issued = data.issued || data.transactions || [];
  const tbody = getElement('issuedTable');
  if (!tbody) return;

  tbody.innerHTML = issued.length > 0
    ? issued.map(issue => {
      const issueId = issue.id || '';
      const username = issue.username || 'Unknown User';
      const bookTitle = issue.bookTitle || 'Unknown Book';
      const dueDate = new Date(issue.returnDate);
      const isOverdue = issue.overdue ?? (dueDate < new Date());
      const dueDaysRemaining = typeof issue.dueDaysRemaining === 'number'
        ? issue.dueDaysRemaining
        : Math.ceil((dueDate.getTime() - Date.now()) / (24 * 3600 * 1000));
      const overdueDays = typeof issue.overdueDays === 'number' ? issue.overdueDays : Math.abs(Math.min(dueDaysRemaining, 0));
      const estimatedFine = typeof issue.estimatedFine === 'number' ? issue.estimatedFine : overdueDays * 10;

      const statusText = isOverdue
        ? `⚠️ Overdue (${overdueDays} day${overdueDays === 1 ? '' : 's'})`
        : (dueDaysRemaining <= 3 ? `📅 Due in ${dueDaysRemaining} day${dueDaysRemaining === 1 ? '' : 's'}` : '✅ On Time');

      const fineText = isOverdue ? `<div style="color:#b91c1c; font-size:12px;">Est. fine: ₹${estimatedFine}</div>` : '';

      return `
      <tr>
        <td>${username}</td>
        <td>${bookTitle}</td>
        <td>${new Date(issue.issueDate).toLocaleDateString()}</td>
        <td>${dueDate.toLocaleDateString()}</td>
        <td>${statusText}${fineText}</td>
        <td>${issueId ? `<button class="btn-success" onclick="returnBookModal('${issueId}')">Return</button>` : '<span style="color:#94a3b8;">N/A</span>'}</td>
      </tr>`;
    }).join('')
    : '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">No issued books</td></tr>';
}

async function loadReturnedBooks() {
  const { ok, data } = await fetchJson(`${API_BASE}/transactions/returned`, {}, 'Loading returned books...');
  if (!ok) {
    showAlert(data.message || 'Failed to load returned books', 'error');
    return;
  }

  const returned = data.returned || data.transactions || [];
  const tbody = getElement('returnedTable');
  if (!tbody) return;

  tbody.innerHTML = returned.length > 0
    ? returned.map(issue => `
      <tr>
        <td>${issue.username}</td>
        <td>${issue.bookTitle}</td>
        <td>${new Date(issue.issueDate).toLocaleDateString()}</td>
        <td>${issue.actualReturnDate ? new Date(issue.actualReturnDate).toLocaleDateString() : 'N/A'}</td>
        <td>₹${issue.fine || 0}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No returned books</td></tr>';
}

async function loadStudents() {
  const [usersResult, txResult] = await Promise.all([
    fetchJson(`${API_BASE}/auth/users?role=student`, {}, 'Loading users...'),
    fetchJson(`${API_BASE}/transactions`)
  ]);

  if (!usersResult.ok) {
    showAlert(usersResult.data.message || 'Failed to load users', 'error');
    return;
  }

  const users = usersResult.data.users || [];
  const transactions = txResult.data?.transactions || [];
  const tbody = getElement('studentsTable');
  if (!tbody) return;

  tbody.innerHTML = users.length > 0
    ? users.map(student => {
      const borrowed = transactions.filter(tx => tx.userId === student.id).length;
      const active = transactions.filter(tx => tx.userId === student.id && tx.status === 'Issued').length;
      return `
      <tr>
        <td><strong>${student.username}</strong></td>
        <td>${student.email || '-'}</td>
        <td>${student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}</td>
        <td>${borrowed}</td>
        <td>${active}</td>
      </tr>`;
    }).join('')
    : '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No users found</td></tr>';
}

async function loadIssueBooks() {
  const { ok, data } = await fetchJson(`${API_BASE}/books`);
  if (!ok) return;

  const books = (data.books || []).filter(book => (book.availableCopies || 0) > 0);
  const select = getElement('issueBook');
  if (!select) return;

  select.innerHTML = '<option value="">Choose a book...</option>' +
    books.map(book => `<option value="${book.id}">${book.title} (${book.availableCopies} available)</option>`).join('');
}

async function loadIssueStudents() {
  const { ok, data } = await fetchJson(`${API_BASE}/auth/students`);
  if (!ok) return;

  const students = data.students || [];
  const select = getElement('issueStudent');
  if (!select) return;

  select.innerHTML = '<option value="">Choose a student...</option>' +
    students.map(student => `<option value="${student.id}">${student.username} (${student.email})</option>`).join('');
}

async function loadStats() {
  const { ok, data } = await fetchJson(`${API_BASE}/transactions/analytics`);
  if (!ok || !data.success) {
    showAlert(data?.message || 'Failed to load dashboard analytics', 'error');
    return;
  }

  const stats = data.stats || {};
  if (getElement('totalBooks')) getElement('totalBooks').textContent = stats.totalBooks ?? 0;
  if (getElement('booksIssuedToday')) getElement('booksIssuedToday').textContent = stats.booksIssuedToday ?? 0;
  if (getElement('overdueBooks')) getElement('overdueBooks').textContent = stats.overdueBooks ?? 0;
  if (getElement('activeUsers')) getElement('activeUsers').textContent = stats.activeUsers ?? 0;

  renderMonthlyBorrowingChart(data.monthlyBorrowing || []);
}

async function refreshDashboard() {
  showLoader('Refreshing dashboard...');
  try {
    await Promise.all([loadStats(), loadBooks(), loadStudents(), loadIssuedBooks(), loadReturnedBooks()]);
    showAlert('Dashboard refreshed successfully', 'success');
  } catch (err) {
    showAlert('Failed to refresh dashboard', 'error');
  } finally {
    hideLoader();
  }
}

async function saveBook(event) {
  event.preventDefault();
  clearValidation('book');

  const bookId = getElement('bookId').value;
  const title = getElement('bookTitle').value.trim();
  const author = getElement('bookAuthor').value.trim();
  const copies = parseInt(getElement('bookCopies').value, 10);

  let invalid = false;
  if (!title) {
    setFieldError('bookTitle', 'Title is required');
    invalid = true;
  }
  if (!author) {
    setFieldError('bookAuthor', 'Author is required');
    invalid = true;
  }
  if (!Number.isInteger(copies) || copies < 1) {
    setFieldError('bookCopies', 'Copies must be at least 1');
    invalid = true;
  }
  if (invalid) return;

  const coverImage = await uploadBookCover();
  if (coverImage === null) {
    return;
  }

  const bookData = {
    title,
    author,
    isbn: getElement('bookISBN').value.trim(),
    category: getElement('bookCategory').value.trim(),
    coverImage,
    publisher: getElement('bookPublisher').value.trim(),
    year: parseInt(getElement('bookYear').value, 10) || new Date().getFullYear(),
    description: getElement('bookDescription').value.trim(),
    copies
  };

  const method = bookId ? 'PUT' : 'POST';
  const url = bookId ? `${API_BASE}/books/${bookId}` : `${API_BASE}/books`;

  const { ok, data } = await fetchJson(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData)
  }, bookId ? 'Updating book...' : 'Saving book...');

  if (!ok || !data.success) {
    showAlert(data.message || 'Failed to save book', 'error');
    return;
  }

  closeModal('bookModal');
  await Promise.all([loadBooks(), loadStats()]);
  showAlert(bookId ? 'Book updated successfully' : 'Book added successfully', 'success');
}

async function editBook(id) {
  const { ok, data } = await fetchJson(`${API_BASE}/books/${id}`, {}, 'Loading book details...');
  if (!ok || !data.book) {
    showAlert(data.message || 'Failed to load book details', 'error');
    return;
  }

  const book = data.book;
  getElement('bookId').value = book.id;
  getElement('bookCoverImage').value = book.coverImage || '';
  getElement('bookTitle').value = book.title || '';
  getElement('bookAuthor').value = book.author || '';
  getElement('bookISBN').value = book.isbn || '';
  getElement('bookCategory').value = book.category || '';
  getElement('bookPublisher').value = book.publisher || '';
  getElement('bookYear').value = book.year || new Date().getFullYear();
  getElement('bookDescription').value = book.description || '';
  getElement('bookCopies').value = book.copies || 1;
  const coverInput = getElement('bookCoverFile');
  if (coverInput) coverInput.value = '';
  const preview = getElement('bookCoverPreview');
  if (preview && book.coverImage) {
    preview.src = book.coverImage;
    preview.style.display = 'block';
  } else if (preview) {
    preview.style.display = 'none';
    preview.removeAttribute('src');
  }
  getElement('modalTitle').textContent = 'Edit Book';
  clearValidation('book');
  openModal('bookModal');
}

async function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) return;

  const { ok, data } = await fetchJson(`${API_BASE}/books/${id}`, {
    method: 'DELETE'
  }, 'Deleting book...');

  if (!ok || !data.success) {
    showAlert(data.message || 'Failed to delete book', 'error');
    return;
  }

  await Promise.all([loadBooks(), loadStats()]);
  showAlert('Book deleted successfully', 'success');
}

async function issueBook(event) {
  event.preventDefault();
  clearValidation('issue');

  const bookId = getElement('issueBook').value;
  const userId = getElement('issueStudent').value;
  const dueDays = parseInt(getElement('issueDays').value, 10);

  let invalid = false;
  if (!bookId) {
    setFieldError('issueBook', 'Please select a book');
    invalid = true;
  }
  if (!userId) {
    setFieldError('issueStudent', 'Please select a user');
    invalid = true;
  }
  if (!Number.isInteger(dueDays) || dueDays < 1 || dueDays > 90) {
    setFieldError('issueDays', 'Due days must be between 1 and 90');
    invalid = true;
  }
  if (invalid) return;

  const { ok, data } = await fetchJson(`${API_BASE}/transactions/borrow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId, userId, dueDays })
  }, 'Issuing book...');

  if (!ok || !data.success) {
    showAlert(data.message || 'Failed to issue book', 'error');
    return;
  }

  closeModal('issueModal');
  await Promise.all([loadIssuedBooks(), loadBooks(), loadStats(), loadStudents()]);
  showAlert('Book issued successfully', 'success');
}

async function returnBookModal(issueId) {
  if (!issueId || issueId === 'undefined') {
    showAlert('Cannot return this record: issue id is missing.', 'error');
    return;
  }

  if (!confirm('Confirm book return?')) return;

  const { ok, data } = await fetchJson(`${API_BASE}/transactions/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ issueId })
  }, 'Returning book...');

  if (!ok || !data.success) {
    showAlert(data.message || 'Failed to return book', 'error');
    return;
  }

  await Promise.all([loadIssuedBooks(), loadReturnedBooks(), loadBooks(), loadStats(), loadStudents()]);
  const fineText = data.fine > 0 ? ` Fine: ₹${data.fine}` : '';
  showAlert(`Book returned successfully.${fineText}`, 'success');
}

function initAdmin() {
  const username = localStorage.getItem('username') || 'Admin';
  if (getElement('adminUsername')) getElement('adminUsername').textContent = username;

  const logoutBtn = getElement('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = '/pages/login.html';
    });
  }

  const coverInput = getElement('bookCoverFile');
  if (coverInput) {
    coverInput.addEventListener('change', () => {
      setFieldError('bookCoverFile', '');
      const file = coverInput.files?.[0];
      const preview = getElement('bookCoverPreview');
      if (!preview) return;
      if (!file) {
        const existing = getElement('bookCoverImage')?.value;
        if (existing) {
          preview.src = existing;
          preview.style.display = 'block';
        } else {
          preview.style.display = 'none';
          preview.removeAttribute('src');
        }
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      preview.src = objectUrl;
      preview.style.display = 'block';
    });
  }

  refreshDashboard();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
