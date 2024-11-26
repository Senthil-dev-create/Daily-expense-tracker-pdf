let expenses = [];

// Load expenses from LocalStorage
function loadFromLocalStorage() {
  const data = localStorage.getItem('expenses');
  if (data) {
    expenses = JSON.parse(data);
  }
}

// Save expenses to LocalStorage
function saveToLocalStorage() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Initialize the application
function initializeApp() {
  loadFromLocalStorage();
  updateAllPages();
}

// Update all pages with the latest data
function updateAllPages() {
  updateSummaryTable();
  updateSearchResults();
}

// Format Date as DD-mm-yyyy
function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
}

// Navigate between pages
function navigateTo(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => (page.style.display = 'none'));
  document.getElementById(pageId).style.display = 'block';
}

// Show messages for actions
function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = type === 'success' ? 'green' : 'red';
  setTimeout(() => (element.textContent = ''), 3000);
}

/* Add Expense */
document.getElementById('addExpenseBtn').addEventListener('click', function () {
  const date = document.getElementById('date').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value;

  if (!date || isNaN(amount) || !description) {
    showMessage('addMessage', 'Please fill out all fields!', 'error');
    return;
  }

  const expense = { date, amount, description };
  expenses.push(expense);
  saveToLocalStorage();
  updateAllPages();
  showMessage('addMessage', 'Expense added successfully!', 'success');
});

/* Summary Page */
function updateSummaryTable() {
  const tableBody = document.querySelector('#summaryTable tbody');
  tableBody.innerHTML = '';

  const sortedExpenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  sortedExpenses.forEach((expense, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" class="deleteCheckbox" data-index="${index}"></td>
      <td>${formatDate(expense.date)}</td>
      <td>${expense.amount.toFixed(2)}</td>
      <td>${expense.description}</td>
    `;
    tableBody.appendChild(row);
  });
}

document.getElementById('deleteSelectedBtn').addEventListener('click', function () {
  const checkboxes = document.querySelectorAll('.deleteCheckbox:checked');
  const indicesToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
  indicesToDelete.sort((a, b) => b - a); // Sort indices in descending order

  indicesToDelete.forEach(index => expenses.splice(index, 1));
  saveToLocalStorage();
  updateAllPages();
  showMessage('summaryMessage', 'Selected expenses deleted successfully!', 'success');
});

/* Search Page */
document.getElementById('searchBtn').addEventListener('click', function () {
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  const results = expenses.filter(
    expense =>
      expense.description.toLowerCase().includes(searchQuery) ||
      formatDate(expense.date).includes(searchQuery)
  );

  const tableBody = document.querySelector('#searchResultsTable tbody');
  tableBody.innerHTML = ''; // Clear previous results

  if (results.length === 0) {
    showMessage('searchMessage', 'No matching expenses found!', 'error');
  } else {
    results.forEach(expense => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatDate(expense.date)}</td>
        <td>${expense.amount.toFixed(2)}</td>
        <td>${expense.description}</td>
      `;
      tableBody.appendChild(row);
    });
    showMessage('searchMessage', `${results.length} results found.`, 'success');
  }
});

/* PDF Download */
document.getElementById('generatePDF').addEventListener('click', function () {
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;

  if (!fromDate || !toDate) {
    showMessage('downloadMessage', 'Please select a valid date range!', 'error');
    return;
  }

  const filteredExpenses = expenses.filter(
    expense => new Date(expense.date) >= new Date(fromDate) && new Date(expense.date) <= new Date(toDate)
  );

  if (filteredExpenses.length === 0) {
    showMessage('downloadMessage', 'No expenses found in the selected date range.', 'error');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text('Expense Report', 10, 10);
  doc.autoTable({
    head: [['Date', 'Amount', 'Description']],
    body: filteredExpenses.map(expense => [
      formatDate(expense.date),
      expense.amount.toFixed(2),
      expense.description,
    ]),
  });

  doc.save('Expense_Report.pdf', { autoBom: true });
  showMessage('downloadMessage', 'PDF downloaded successfully!', 'success');
});

/* Initialize App */
initializeApp();
