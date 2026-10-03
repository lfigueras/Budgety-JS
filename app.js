class Record {
    constructor(sign, amount, description, category, date, id) {
        this.id = id;
        this.sign = sign;
        this.amount = amount;
        this.description = description;
        this.category = category;
        this.date = date;
    }
}

const db = window.localStorage;
const categories = ['Salary', 'Freelance', 'Housing', 'Food', 'Transport', 'Utilities', 'Health', 'Shopping', 'Entertainment', 'Other'];
const supportedCurrencies = ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
const date = document.querySelector('#date');
const balance = document.querySelector('#balance');
const income = document.querySelector('#income');
const expenses = document.querySelector('#expenses');
const currencySelect = document.querySelector('#currency');
const sign = document.querySelector('#sign');
const description = document.querySelector('#description');
const amount = document.querySelector('#amount');
const enter = document.querySelector('#enter');
const category = document.querySelector('#category');
const entryDate = document.querySelector('#entry-date');
const entryForm = document.querySelector('#entry-form');
const cancelEdit = document.querySelector('#cancel-edit');
const incomeList = document.querySelector('#income-list');
const expenseList = document.querySelector('#expense-list');
const incomePercentage = document.querySelector('#income-percentage');
const expensesPercentage = document.querySelector('#expenses-percentage');
const categoryFilter = document.querySelector('#category-filter');
const dateFrom = document.querySelector('#date-from');
const dateTo = document.querySelector('#date-to');
const clearFilters = document.querySelector('#clear-filters');
const ledgerGrid = document.querySelector('.ledger-grid');

const today = new Date();
const savedCurrency = db.getItem('currency');
currencySelect.value = supportedCurrencies.includes(savedCurrency) ? savedCurrency : 'PHP';

const toDateInputValue = (value) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const readRecords = (key, recordSign) => {
    try {
        const savedRecords = JSON.parse(db.getItem(key) || '[]');
        if (!Array.isArray(savedRecords)) return [];
        return savedRecords.map((item) => new Record(
            recordSign,
            Number.parseFloat(item.amount) || 0,
            String(item.description || ''),
            categories.includes(item.category) ? item.category : 'Other',
            /^\d{4}-\d{2}-\d{2}$/.test(item.date || '') ? item.date : '',
            item.id || createId()
        ));
    } catch {
        return [];
    }
};

let incomeArr = readRecords('income', '+');
let expensesArr = readRecords('expenses', '-');
let editingId = null;

categories.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    category.append(option);

    const filterOption = option.cloneNode(true);
    categoryFilter.append(filterOption);
});

const allRecords = () => [...incomeArr, ...expensesArr];

const saveToDb = () => {
    db.setItem('income', JSON.stringify(incomeArr));
    db.setItem('expenses', JSON.stringify(expensesArr));
};

const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
});
let numberFormatter;
const updateNumberFormatter = () => {
    numberFormatter = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: currencySelect.value,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};
updateNumberFormatter();
const formatAmount = (value) => numberFormatter.format(value);

const getVisibleRecords = () => {
    const hasDateFilter = dateFrom.value || dateTo.value;
    return allRecords()
        .filter((item) => !categoryFilter.value || item.category === categoryFilter.value)
        .filter((item) => {
            if (!hasDateFilter) return true;
            if (!item.date) return false;
            return (!dateFrom.value || item.date >= dateFrom.value)
                && (!dateTo.value || item.date <= dateTo.value);
        })
        .sort((first, second) => second.date.localeCompare(first.date));
};

const createTransactionNode = (item) => {
    const listItem = document.createElement('li');
    listItem.className = 'item';

    const transactionCopy = document.createElement('div');
    transactionCopy.className = 'transaction-copy';

    const transactionDescription = document.createElement('span');
    transactionDescription.className = 'transaction-description';
    transactionDescription.textContent = item.description;

    const transactionMeta = document.createElement('span');
    transactionMeta.className = 'transaction-meta';
    transactionMeta.textContent = `${item.category} · ${item.date ? formatDate(item.date) : 'Date not recorded'}`;
    transactionCopy.append(transactionDescription, transactionMeta);

    const transactionAmount = document.createElement('span');
    transactionAmount.className = `transaction-amount ${item.sign === '+' ? 'positive' : 'negative'}`;
    transactionAmount.textContent = `${item.sign}${formatAmount(item.amount)}`;

    const actions = document.createElement('div');
    actions.className = 'transaction-actions';

    const editButton = document.createElement('button');
    editButton.className = 'transaction-action';
    editButton.type = 'button';
    editButton.dataset.action = 'edit';
    editButton.dataset.id = item.id;
    editButton.setAttribute('aria-label', `Edit ${item.description}`);
    editButton.textContent = 'Edit';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'transaction-action delete';
    deleteButton.type = 'button';
    deleteButton.dataset.action = 'delete';
    deleteButton.dataset.id = item.id;
    deleteButton.setAttribute('aria-label', `Delete ${item.description}`);
    deleteButton.textContent = 'Delete';
    actions.append(editButton, deleteButton);

    listItem.append(transactionCopy, transactionAmount, actions);
    return listItem;
};

const renderList = (list, records, recordSign) => {
    list.replaceChildren();
    const matchingRecords = records.filter((item) => item.sign === recordSign);

    if (matchingRecords.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'empty-state';
        emptyItem.textContent = 'No transactions to show.';
        list.append(emptyItem);
        return;
    }

    matchingRecords.forEach((item) => list.append(createTransactionNode(item)));
};

const render = () => {
    const visibleRecords = getVisibleRecords();
    const incomeTotal = visibleRecords
        .filter((item) => item.sign === '+')
        .reduce((total, item) => total + item.amount, 0);
    const expensesTotal = visibleRecords
        .filter((item) => item.sign === '-')
        .reduce((total, item) => total + item.amount, 0);
    const balanceTotal = incomeTotal - expensesTotal;

    balance.textContent = `${balanceTotal > 0 ? '+' : ''}${formatAmount(balanceTotal)}`;
    income.textContent = formatAmount(incomeTotal);
    expenses.textContent = formatAmount(expensesTotal > 0 ? -expensesTotal : 0);
    expensesPercentage.textContent = incomeTotal > 0
        ? `${((expensesTotal / incomeTotal) * 100).toFixed(2)}%`
        : '';

    renderList(incomeList, visibleRecords, '+');
    renderList(expenseList, visibleRecords, '-');
};

const resetEntryForm = () => {
    entryForm.reset();
    sign.value = '+';
    category.value = 'Other';
    entryDate.value = toDateInputValue(new Date());
    editingId = null;
    enter.textContent = 'Add entry';
    cancelEdit.hidden = true;
};

const beginEditing = (item) => {
    editingId = item.id;
    sign.value = item.sign;
    description.value = item.description;
    amount.value = item.amount;
    category.value = item.category;
    entryDate.value = item.date;
    enter.textContent = 'Save changes';
    cancelEdit.hidden = false;
    description.focus();
};

date.textContent = today.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
});
category.value = 'Other';
entryDate.value = toDateInputValue(today);

entryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    description.setCustomValidity(description.value.trim() ? '' : 'Enter a description.');
    amount.setCustomValidity(Number(amount.value) > 0 ? '' : 'Enter an amount greater than zero.');
    if (!entryForm.reportValidity()) return;

    const item = new Record(
        sign.value,
        Number(amount.value),
        description.value.trim(),
        category.value,
        entryDate.value,
        editingId || createId()
    );

    if (editingId) {
        incomeArr = incomeArr.filter((record) => record.id !== editingId);
        expensesArr = expensesArr.filter((record) => record.id !== editingId);
    }

    if (item.sign === '+') {
        incomeArr.push(item);
    } else {
        expensesArr.push(item);
    }

    saveToDb();
    resetEntryForm();
    render();
});

ledgerGrid.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const item = allRecords().find((record) => record.id === button.dataset.id);
    if (!item) return;

    if (button.dataset.action === 'edit') {
        beginEditing(item);
        return;
    }

    incomeArr = incomeArr.filter((record) => record.id !== item.id);
    expensesArr = expensesArr.filter((record) => record.id !== item.id);
    if (editingId === item.id) resetEntryForm();
    saveToDb();
    render();
});

cancelEdit.addEventListener('click', resetEntryForm);
categoryFilter.addEventListener('change', render);
dateFrom.addEventListener('input', render);
dateTo.addEventListener('input', render);
clearFilters.addEventListener('click', () => {
    categoryFilter.value = '';
    dateFrom.value = '';
    dateTo.value = '';
    render();
});
currencySelect.addEventListener('change', () => {
    updateNumberFormatter();
    db.setItem('currency', currencySelect.value);
    render();
});

render();

