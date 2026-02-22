// Admin Dashboard - Full Functionality

const TOKEN = localStorage.getItem('token');
const API_BASE = 'http://localhost:3000/api';

// Modal Functions
function openAddBookModal() {
  document.getElementById('bookId').value = '';
  document.getElementById('bookTitle').value = '';
  document.getElementById('bookAuthor').value = '';
  document.getElementById('bookISBN').value = '';
  document.getElementById('bookCategory').value = '';
  document.getElementById('bookPublisher').value = '';
  document.getElementById('bookYear').value = new Date().getFullYear();
  document.getElementById('bookDescription').value = '';
  document.getElementById('bookCopies').value = 1;
  document.getElementById('modalTitle').textContent = 'Add New Book';
  openModal('bookModal');
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function openIssueModal() {
  loadIssueBooks();
  loadIssueStudents();
  document.getElementById('issueDays').value = 14;
  openModal('issueModal');
}

// Load Functions
async function loadBooks() {
  try {
    const response = await fetch(`${API_BASE}/books`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await response.json();
    const books = data.books || [];
    
    const tbody = document.getElementById('booksTable');
    tbody.innerHTML = books.length > 0 ? books.map(book => `
      <tr>
        <td><strong>${book.title}</strong></td>
        <td>${book.author}</td>
        <td>${book.isbn || '-'}</td>
        <td>${book.category || '-'}</td>
        <td>${book.copies || 0}</td>
        <td><strong>${book.availableCopies || 0}</strong></td>
        <td>
          <button class="btn-success" onclick="editBook('${book.id}')" style="padding: 5px 10px; font-size: 12px;">✏️ Edit</button>
          <button class="btn-danger" onclick="deleteBook('${book.id}')" style="padding: 5px 10px; font-size: 12px; margin-left: 5px;">🗑️ Delete</button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="7" style="text-align: center; color: #9ca3af;">No books found</td></tr>';
    
    document.getElementById('totalBooks').textContent = books.length;
  } catch (err) {
    console.error('Error loading books:', err);
    alert('Failed to load books');
  }
}

async function loadIssuedBooks() {
  try {
    const response = await fetch(`${API_BASE}/transactions/issued`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await response.json();
    const issued = data.issued || data.transactions || [];
    
    const tbody = document.getElementById('issuedTable');
    tbody.innerHTML = issued.length > 0 ? issued.map(issue => {
      const dueDate = new Date(issue.returnDate);
      const today = new Date();
      const isOverdue = dueDate < today;
      
      return `
        <tr>
          <td>${issue.username}</td>
          <td>${issue.bookTitle}</td>
          <td>${new Date(issue.issueDate).toLocaleDateString()}</td>
          <td style="color: ${isOverdue ? '#ef4444' : '#10b981'};"><strong>${dueDate.toLocaleDateString()}</strong></td>
          <td>${isOverdue ? '⚠️ OVERDUE' : '✅ On Time'}</td>
          <td>
            <button class="btn-success" onclick="returnBookModal('${issue.id}')" style="padding: 5px 10px; font-size: 12px;">✅ Return</button>
          </td>
        </tr>
      `;
    }).join('') : '<tr><td colspan="6" style="text-align: center; color: #9ca3af;">No issued books</td></tr>';
    
    document.getElementById('issuedCount').textContent = issued.length;
  } catch (err) {
    console.error('✗ Error loading issued books:', err);
  }
}

async function loadReturnedBooks() {
  try {
    const response = await fetch(`${API_BASE}/transactions/returned`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await response.json();
    const returned = data.returned || data.transactions || [];
    
    const tbody = document.getElementById('returnedTable');
    tbody.innerHTML = returned.length > 0 ? returned.map(issue => `
      <tr>
        <td>${issue.username}</td>
        <td>${issue.bookTitle}</td>
        <td>${new Date(issue.issueDate).toLocaleDateString()}</td>
        <td>${issue.actualReturnDate ? new Date(issue.actualReturnDate).toLocaleDateString() : 'N/A'}</td>
        <td style="color: ${issue.fine > 0 ? '#ef4444' : '#10b981'};"><strong>₹${issue.fine || 0}</strong></td>
      </tr>
    `).join('') : '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">No returned books</td></tr>';
    
    document.getElementById('returnedCount').textContent = returned.length;
  } catch (err) {
    console.error('✗ Error loading returned books:', err);
  }
}

async function loadStudents() {
  try {
    const response = await fetch(`${API_BASE}/auth/users?role=student`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    let users = [];
    
    // Fallback: get all users and filter by role
    try {
      const usersResponse = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      if (usersResponse.ok) {
        const userData = await usersResponse.json();
        users = (userData.users || []).filter(u => u.role === 'student');
      }
    } catch (e) {
      console.log('Users endpoint not available');
    }

    // Get transaction counts
    const txResponse = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const txData = await txResponse.json();
    const transactions = txData.transactions || [];
    
    const tbody = document.getElementById('studentsTable');
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">No students found</td></tr>';
      document.getElementById('totalStudents').textContent = 0;
      return;
    }
    
    tbody.innerHTML = users.map(student => {
      const borrowed = transactions.filter(tx => tx.userId === student.id).length;
      const active = transactions.filter(tx => tx.userId === student.id && !tx.returnedAt).length;
      
      return `
        <tr>
          <td><strong>${student.username}</strong></td>
          <td>${student.email}</td>
          <td>${new Date(student.createdAt).toLocaleDateString()}</td>
          <td>${borrowed}</td>
          <td>${active}</td>
        </tr>
      `;
    }).join('');
    
    document.getElementById('totalStudents').textContent = users.length;
  } catch (err) {
    console.error('Error loading students:', err);
  }
}

async function loadIssueBooks() {
  try {
    const response = await fetch(`${API_BASE}/books`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await response.json();
    const books = (data.books || []).filter(b => (b.availableCopies || 0) > 0);
    
    const select = document.getElementById('issueBook');
    select.innerHTML = '<option value="">Choose a book...</option>' + 
      books.map(b => `<option value="${b.id}">${b.title} (${b.availableCopies} available)</option>`).join('');
  } catch (err) {
    console.error('Error loading books for issue:', err);
  }
}

async function loadIssueStudents() {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    let students = [];
    
    // Try custom endpoint first
    try {
      const stdResponse = await fetch(`${API_BASE}/auth/students`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      if (stdResponse.ok) {
        const stdData = await stdResponse.json();
        students = stdData.students || [];
      }
    } catch (e) {
      // Fallback to fetching all users and filtering
      if (response.ok) {
        const data = await response.json();
        students = (data.users || []).filter(u => u.role === 'student');
      }
    }
    
    const select = document.getElementById('issueStudent');
    select.innerHTML = '<option value="">Choose a student...</option>' + 
      students.map(s => `<option value="${s.id}">${s.username} (${s.email})</option>`).join('');
  } catch (err) {
    console.error('Error loading students for issue:', err);
  }
}

async function loadStats() {
  try {
    // Load books count
    const booksRes = await fetch(`${API_BASE}/books`);
    if (booksRes.ok) {
      const booksData = await booksRes.json();
      document.getElementById('totalBooks').textContent = (booksData.books || []).length;
    }
    
    // Load transaction stats
    const txRes = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    if (txRes.ok) {
      const txData = await txRes.json();
      const all = txData.transactions || [];
      document.getElementById('issuedCount').textContent = all.filter(t => !t.returnedAt).length;
      document.getElementById('returnedCount').textContent = all.filter(t => t.returnedAt).length;
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// Save/Edit Functions
async function saveBook(event) {
  event.preventDefault();
  
  const bookId = document.getElementById('bookId').value;
  const bookData = {
    title: document.getElementById('bookTitle').value,
    author: document.getElementById('bookAuthor').value,
    isbn: document.getElementById('bookISBN').value,
    category: document.getElementById('bookCategory').value,
    publisher: document.getElementById('bookPublisher').value,
    year: parseInt(document.getElementById('bookYear').value) || new Date().getFullYear(),
    description: document.getElementById('bookDescription').value,
    copies: parseInt(document.getElementById('bookCopies').value)
  };
  
  try {
    const method = bookId ? 'PUT' : 'POST';
    const url = bookId ? `${API_BASE}/books/${bookId}` : `${API_BASE}/books`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(bookData)
    });
    
    const result = await response.json();
    if (result.success) {
      alert(bookId ? '✅ Book updated successfully' : '✅ Book added successfully');
      closeModal('bookModal');
      loadBooks();
    } else {
      alert('❌ ' + (result.message || 'Failed to save book'));
    }
  } catch (err) {
    console.error('Error saving book:', err);
    alert('❌ Error saving book');
  }
}

async function editBook(id) {
  try {
    const response = await fetch(`${API_BASE}/books/${id}`);
    const data = await response.json();
    const book = data.book;
    
    document.getElementById('bookId').value = book.id;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookISBN').value = book.isbn || '';
    document.getElementById('bookCategory').value = book.category || '';
    document.getElementById('bookPublisher').value = book.publisher || '';
    document.getElementById('bookYear').value = book.year || new Date().getFullYear();
    document.getElementById('bookDescription').value = book.description || '';
    document.getElementById('bookCopies').value = book.copies || 1;
    
    document.getElementById('modalTitle').textContent = 'Edit Book';
    openModal('bookModal');
  } catch (err) {
    console.error('Error loading book:', err);
    alert('Failed to load book details');
  }
}

async function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    
    const result = await response.json();
    if (result.success) {
      alert('✅ Book deleted successfully');
      loadBooks();
    } else {
      alert('❌ Failed to delete book');
    }
  } catch (err) {
    console.error('Error deleting book:', err);
    alert('Error deleting book');
  }
}

async function issueBook(event) {
  event.preventDefault();
  
  const bookId = document.getElementById('issueBook').value;
  const userId = document.getElementById('issueStudent').value;
  const dueDays = parseInt(document.getElementById('issueDays').value);
  
  if (!bookId || !userId) {
    alert('⚠️ Please select both a book and a student');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/transactions/borrow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ bookId, userId, dueDays })
    });
    
    const result = await response.json();
    if (result.success) {
      alert('✅ Book issued successfully!');
      closeModal('issueModal');
      loadIssuedBooks();
      loadBooks();
    } else {
      alert('❌ ' + (result.message || 'Failed to issue book'));
    }
  } catch (err) {
    console.error('Error issuing book:', err);
    alert('Error issuing book');
  }
}

async function returnBookModal(issueId) {
  if (!confirm('Confirm book return?')) return;
  
  try {
    console.log('📖 Returning issue:', issueId);
    
    const response = await fetch(`${API_BASE}/transactions/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ issueId })
    });
    
    const result = await response.json();
    console.log('✓ Return response:', result);
    
    if (result.success) {
      const fine = result.fine || 0;
      alert(`✅ Book returned successfully${fine > 0 ? `\nFine: ₹${fine}` : ''}`);
      loadIssuedBooks();
      loadReturnedBooks();
      loadBooks();
    } else {
      alert('❌ ' + (result.message || 'Failed to return book'));
    }
  } catch (err) {
    console.error('✗ Error returning book:', err);
    alert('Error returning book');
  }
}

// Settings
function saveSettings() {
  const issueDuration = document.getElementById('issueDuration').value;
  const finePerDay = document.getElementById('finePerDay').value;
  
  localStorage.setItem('issueDuration', issueDuration);
  localStorage.setItem('finePerDay', finePerDay);
  
  alert('✅ Settings saved successfully!');
}

// Initialize
window.addEventListener('load', () => {
  // Verify admin is logged in
  if (localStorage.getItem('userRole') !== 'librarian') {
    window.location = '/pages/login.html';
  }
});
