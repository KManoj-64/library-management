const API_BASE = 'http://localhost:3000/api';
const TOKEN = localStorage.getItem('token');
const USER_ID = localStorage.getItem('userId');

// Check if user is logged in
if (!TOKEN || localStorage.getItem('userRole') !== 'student') {
  console.warn('⚠️ Not logged in as student, redirecting to login');
  window.location.href = '/pages/login.html';
}

let currentBook = null;
let currentTransaction = null;
let booksMap = new Map(); // Store books by ID for safe access

function formatDateSafe(value) {
    const parsed = Number(value);
    const date = new Date(Number.isFinite(parsed) ? parsed : value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
}

// ============ MODAL & TAB HELPERS ============
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));
    
    // Show selected tab
    const tab = document.getElementById(tabName);
    if (tab) {
        tab.classList.add('active');
    }
    
    // Mark button as active
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        if (button.getAttribute('onclick')?.includes(`'${tabName}'`)) {
            button.classList.add('active');
        }
    });
    
    // Load data for the tab
    if (tabName === 'browse') loadAllBooks();
    else if (tabName === 'active') loadMyLoans();
    else if (tabName === 'history') loadMyHistory();
}

// ============ BOOK LOADING ============
async function loadAllBooks() {
    try {
        const response = await fetch(`${API_BASE}/books`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const data = await response.json();
        const books = data.books || data;
        booksMap.clear();
        books.forEach(book => booksMap.set(book.id, book));
        displayBooks(books);
    } catch (error) {
        console.error('✗ Error loading books:', error);
        document.getElementById('booksContainer').innerHTML = '<p style="color: red;">❌ Error loading books</p>';
    }
}

async function searchBooks() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        loadAllBooks();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/books/search?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const data = await response.json();
        const books = data.books || [];
        booksMap.clear();
        books.forEach(book => booksMap.set(book.id, book));
        displayBooks(books);
    } catch (error) {
        console.error('✗ Search error:', error);
        document.getElementById('booksContainer').innerHTML = '<p style="color: red;">❌ Search failed</p>';
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    loadAllBooks();
}

function displayBooks(books) {
    const container = document.getElementById('booksContainer');
    
    if (!books || books.length === 0) {
        container.innerHTML = '<p style="color: #64748b; padding: 20px; text-align: center;">📭 No books found</p>';
        return;
    }
    
    container.innerHTML = books.map(book => `
        <div class="book-card">
            <h3>${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Category:</strong> ${book.category || 'N/A'}</p>
            ${book.description ? `<p><strong>Description:</strong> ${book.description.substring(0, 100)}...</p>` : ''}
            ${book.isbn ? `<p><strong>ISBN:</strong> ${book.isbn}</p>` : ''}
            <div class="details">
                <span class="badge ${book.availableCopies > 0 ? 'badge-available' : 'badge-unavailable'}">
                    ${book.availableCopies > 0 ? `✅ ${book.availableCopies} Available` : '❌ Out of Stock'}
                </span>
                <button class="btn-primary" onclick="viewBookDetails('${book.id}')">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

function viewBookDetails(bookId) {
    const book = booksMap.get(bookId);
    if (!book) {
        console.error('✗ Book not found:', bookId);
        alert('❌ Book not found');
        return;
    }
    
    currentBook = book;
    const modal = document.getElementById('bookModal');
    
    document.getElementById('modalTitle').textContent = book.title;
    
    const detailsHtml = `
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Category:</strong> ${book.category || 'N/A'}</p>
        ${book.isbn ? `<p><strong>ISBN:</strong> ${book.isbn}</p>` : ''}
        ${book.publisher ? `<p><strong>Publisher:</strong> ${book.publisher}</p>` : ''}
        ${book.year ? `<p><strong>Year:</strong> ${book.year}</p>` : ''}
        ${book.description ? `<p><strong>Description:</strong> ${book.description}</p>` : ''}
        <p><strong>Total Copies:</strong> ${book.copies || 0}</p>
        <p><strong>Available Copies:</strong> <span style="color: ${book.availableCopies > 0 ? '#10b981' : '#ef4444'}; font-weight: bold;">
            ${book.availableCopies || 0}/${book.copies || 0}
        </span></p>
    `;
    
    document.getElementById('bookDetails').innerHTML = detailsHtml;
    
    const borrowBtn = document.getElementById('borrowBtn');
    if (book.availableCopies > 0) {
        borrowBtn.disabled = false;
        borrowBtn.textContent = '📚 Borrow This Book';
    } else {
        borrowBtn.disabled = true;
        borrowBtn.textContent = '❌ Out of Stock';
    }
    
    openModal('bookModal');
}

// ============ BORROW FUNCTIONALITY ============
function openBorrowModal() {
    if (!currentBook) return;
    
    closeModal('bookModal');
    
    const bookTitle = currentBook.title;
    const authorName = currentBook.author;
    const msg = `Are you sure you want to borrow <strong>"${bookTitle}"</strong> by ${authorName}?<br><br><em>This book will be due in 14 days.</em>`;
    
    document.getElementById('borrowConfirmMsg').innerHTML = msg;
    openModal('borrowConfirmModal');
}

async function confirmBorrow() {
    if (!currentBook) {
        alert('❌ No book selected');
        return;
    }
    
    // Verify book is still available
    if (currentBook.availableCopies <= 0) {
        alert('❌ Sorry! This book is no longer available');
        loadAllBooks();
        closeModal('borrowConfirmModal');
        return;
    }
    
    try {
        console.log('📚 Borrowing book:', {
            bookId: currentBook.id,
            bookTitle: currentBook.title,
            userId: USER_ID
        });
        
        const response = await fetch(`${API_BASE}/transactions/borrow`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookId: currentBook.id,
                userId: USER_ID,
                dueDays: 14
            })
        });
        
        const data = await response.json();
        console.log('✓ Borrow response:', data);
        
        if (response.ok && data.success) {
            const dueDate = data.returnDate 
                ? new Date(data.returnDate).toLocaleDateString()
                : new Date(Date.now() + 14*24*60*60*1000).toLocaleDateString();
            
            alert(`✅ Book borrowed successfully!\n\nDue Date: ${dueDate}\n\nYou will receive a confirmation email.`);
            closeModal('borrowConfirmModal');
            currentBook = null;
            await loadAllBooks();
            await loadMyLoans();
            await loadStats();
        } else {
            alert('❌ Error: ' + (data.message || 'Failed to borrow book'));
            console.error('✗ Borrow failed:', data);
        }
    } catch (error) {
        console.error('✗ Error borrowing book:', error);
        alert('❌ Error: ' + error.message);
    }
}

// ============ ACTIVE LOANS ============
async function loadMyLoans() {
    try {
        const response = await fetch(`${API_BASE}/transactions/my/loans`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        
        const data = await response.json();
        const loans = data.loans || data.transactions || [];
        
        const tbody = document.getElementById('activeLoansTable');
        
        if (loans.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 20px;">You have no active loans</td></tr>';
            return;
        }
        
        tbody.innerHTML = loans.map(loan => {
            const issueDate = formatDateSafe(loan.issueDate);
            const returnDate = formatDateSafe(loan.returnDate);
            const today = new Date();
            const dueDay = new Date(loan.returnDate);
            const isOverdue = today > dueDay;
            const daysUntilDue = Math.ceil((dueDay - today) / (1000 * 60 * 60 * 24));
            const dueDaysRemaining = typeof loan.dueDaysRemaining === 'number' ? loan.dueDaysRemaining : daysUntilDue;
            const overdueDays = typeof loan.overdueDays === 'number' ? loan.overdueDays : (isOverdue ? Math.abs(daysUntilDue) : 0);
            const estimatedFine = typeof loan.estimatedFine === 'number' ? loan.estimatedFine : (overdueDays > 0 ? overdueDays * 10 : 0);

            const statusText = isOverdue
                ? `⚠️ OVERDUE by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`
                : (dueDaysRemaining <= 3 ? `📅 Due in ${dueDaysRemaining} day${dueDaysRemaining === 1 ? '' : 's'}` : `✅ ${dueDaysRemaining} days left`);

            const warningText = isOverdue
                ? `<div style="color:#b91c1c; font-size:12px; margin-top:4px;">Estimated fine: ₹${estimatedFine}</div>`
                : '';
            
            return `<tr>
                <td>${loan.bookTitle || 'N/A'}</td>
                <td>${loan.bookAuthor || 'Unknown'}</td>
                <td>${issueDate}</td>
                <td>${returnDate}</td>
                <td>
                    <span class="badge ${isOverdue ? 'badge-overdue' : 'badge-available'}">
                        ${statusText}
                    </span>
                    ${warningText}
                </td>
                <td>
                    <button class="btn-warning" onclick="openReturnModal('${loan.id}', '${loan.bookTitle}')">
                        🔄 Return
                    </button>
                </td>
            </tr>`;
        }).join('');
    } catch (error) {
        console.error('Error loading loans:', error);
        document.getElementById('activeLoansTable').innerHTML = '<tr><td colspan="6" style="color: red; padding: 20px;">Error loading loans</td></tr>';
    }
}

// ============ RETURN FUNCTIONALITY ============
function openReturnModal(transactionId, bookTitle) {
    currentTransaction = transactionId;
    const msg = `Are you sure you want to return <strong>"${bookTitle}"</strong>?<br><br><em>Make sure the book is in good condition.</em>`;
    
    document.getElementById('returnConfirmMsg').innerHTML = msg;
    openModal('returnConfirmModal');
}

async function confirmReturn() {
    if (!currentTransaction) {
        alert('❌ No issue selected');
        return;
    }
    
    try {
        console.log('📖 Returning issue:', currentTransaction);
        
        const response = await fetch(`${API_BASE}/transactions/return`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                issueId: currentTransaction  // Changed from transactionId
            })
        });
        
        const data = await response.json();
        console.log('✓ Return response:', data);
        
        if (data.success) {
            const fineMsg = data.fine > 0 ? `\nFine: ₹${data.fine}` : '\nNo fines charged.';
            alert('✅ Book returned successfully!' + fineMsg);
            closeModal('returnConfirmModal');
            currentTransaction = null;
            await loadMyLoans();
            await loadMyHistory();
            await loadStats();
        } else {
            alert('❌ Error: ' + (data.message || 'Failed to return book'));
        }
    } catch (error) {
        console.error('✗ Error returning book:', error);
        alert('❌ Error returning book: ' + error.message);
    }
}

// ============ HISTORY ============
async function loadMyHistory() {
    try {
        const response = await fetch(`${API_BASE}/transactions/my/history`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        
        const data = await response.json();
        const history = data.history || data.transactions || [];
        
        const tbody = document.getElementById('historyTable');
        
        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 20px;">No borrowing history</td></tr>';
            return;
        }
        
        tbody.innerHTML = history.map(record => {
            const issueDate = formatDateSafe(record.issueDate);
            const returnedDate = record.actualReturnDate ? formatDateSafe(record.actualReturnDate) : 'Not returned';
            const status = record.status || (record.actualReturnDate ? 'Returned' : 'Issued');
            
            return `<tr>
                <td>${record.bookTitle || 'N/A'}</td>
                <td>${record.bookAuthor || 'Unknown'}</td>
                <td>${issueDate}</td>
                <td>${returnedDate}</td>
                <td>₹ ${record.fine || 0}</td>
                <td>
                    <span class="badge ${record.fine > 0 ? 'badge-overdue' : 'badge-available'}">
                        ${status}
                    </span>
                </td>
            </tr>`;
        }).join('');
    } catch (error) {
        console.error('Error loading history:', error);
        document.getElementById('historyTable').innerHTML = '<tr><td colspan="6" style="color: red; padding: 20px;">Error loading history</td></tr>';
    }
}

// ============ STATISTICS ============
async function loadStats() {
    try {
        const [loansRes, historyRes, booksRes] = await Promise.all([
            fetch(`${API_BASE}/transactions/my/loans`, {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            }),
            fetch(`${API_BASE}/transactions/my/history`, {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            }),
            fetch(`${API_BASE}/books`, {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            })
        ]);
        
        const loansData = await loansRes.json();
        const historyData = await historyRes.json();
        const booksData = await booksRes.json();
        
        const loans = loansData.loans || loansData.transactions || [];
        const history = historyData.transactions || [];
        const books = booksData.books || booksData;
        
        // Count active loans
        const activeLoans = loans.length;
        
        // Count total borrowed (from history + active)
        const totalBorrowedSet = new Set();
        [...loans, ...history].forEach(record => {
            if (record.id) totalBorrowedSet.add(record.id);
        });
        const totalBorrowed = totalBorrowedSet.size;
        
        // Count overdue - Issue model uses 'returnDate' field, not 'dueAt'
        const today = new Date();
        const overdue = loans.filter(loan => new Date(loan.returnDate) < today).length;
        
        // Count available books
        const totalAvailable = books.reduce((sum, book) => sum + (book.availableCopies || 0), 0);
        
        // Update statistics
        document.getElementById('activeLoans').textContent = activeLoans;
        document.getElementById('totalBorrowed').textContent = totalBorrowed;
        document.getElementById('overdueCount').textContent = overdue;
        document.getElementById('totalAvailable').textContent = totalAvailable;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ============ INITIALIZATION ============
function initializeDashboard() {
    console.log('📚 Initializing student dashboard...');
    
    // Set username in header
    const username = localStorage.getItem('username') || 'Student';
    const userDisplay = document.getElementById('studentUsername');
    if (userDisplay) {
        userDisplay.textContent = username;
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🚪 Logging out...');
            localStorage.clear();
            window.location.href = '/pages/login.html';
        });
    }
    
    // Setup search Enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchBooks();
            }
        });
    }
    
    // Load initial data
    loadAllBooks();
    loadStats();
    
    console.log('✓ Dashboard initialized');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}
