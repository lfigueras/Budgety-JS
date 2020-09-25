let db = window.localStorage;
// db.setItem('income', '[]');
// db.setItem('expenses', '[]');

// if (db.getItem('income') != null) {
//     console.log(db.getItem('income'))
// }
// if (db.getItem('expenses') != null) {
//     console.log(db.getItem('expenses'))
// }
// let incomeArr = [];
// let expensesArr = [];

console.log(JSON.parse(db.getItem('income')))
console.log(JSON.parse(db.getItem('expenses')))

// db.setItem('records', JSON.stringify([{}, {} ]))

//          key      value
// db.setItem('budget', JSON.stringify({
//     sign: '+',
//     description: 'keme',
//     amount: 2534
// }));

// JSON


class Record {
    constructor(sign, amount, description) {
        this.sign = sign;
        this.amount = amount;
        this.description = description;
    }
}

// let x = new Record('+', 'for food', 1000);
// console.log(x);
// console.log(JSON.stringify(x));

// Query DOM
const date = document.querySelector('#date');
const balance = document.querySelector('#balance');
const income = document.querySelector('#income');
const expenses = document.querySelector('#expenses');
const sign = document.querySelector('#sign');
const description = document.querySelector('#description');
const amount = document.querySelector('#amount');
const enter = document.querySelector('#enter');
const incomeList = document.querySelector('#income-list');
const expenseList = document.querySelector('#expense-list');
const save = document.querySelector('#save');
const incomePercentage = document.querySelector('#income-percentage');
const expensesPercentage = document.querySelector('#expenses-percentage');

// Setting the date today
let d = new Date()
date.innerHTML = d;
balance.innerHTML = 0;

let incomeArr = JSON.parse(db.getItem('income')) != null ? JSON.parse(db.getItem('income')) : [];
let expensesArr = JSON.parse(db.getItem('expenses')) != null ? JSON.parse(db.getItem('expenses')) : [];
// let incomeArr = db.getItem('income') != '' ? JSON.parse(db.getItem('income')) : [];
// let expensesArr = db.getItem('expenses') != '' ? JSON.parse(db.getItem('expenses')) : [];

let deleteMe = (e) => {
    console.log(e.parentNode);
    let li = e.parentNode;
    let tokens = e.parentNode.innerHTML.split(' | ');
    let amountUpdate = parseFloat(tokens[0] + tokens[1]);
    console.log(amountUpdate);
    balance.innerHTML = parseFloat(balance.innerHTML) - amountUpdate;
    if (amountUpdate > 0) {
        income.innerHTML = (parseFloat(income.innerHTML) - amountUpdate).toFixed(2);
    } else {
        expenses.innerHTML = (parseFloat(expenses.innerHTML) - amountUpdate).toFixed(2);
    }
    li.parentNode.removeChild(li);
    saveToDb();
    updateExpPercentage();
}

let createListNode = (item) => {
    let liTemplate = '<li class="item">' + item.sign + ' | ' + parseFloat(item.amount) + ' | ' + item.description + ' | ' + '<button class="delete" onclick="deleteMe(this)">x</button>' +  '</li>';

    let addedAmount = parseFloat(item.sign + item.amount);
    // update balance text
    let balanceVal = (parseFloat(balance.innerHTML) + addedAmount).toFixed(2);
    if(balanceVal > 0) {
        balanceVal = '+' + balanceVal;
    } 
    balance.innerHTML = balanceVal;

    // append to HTML
    // update income and expenses text         
    if (item.sign === '+') {
        incomeList.innerHTML += liTemplate;
        income.innerHTML = (parseFloat(income.innerHTML) + addedAmount).toFixed(2);
    } else {
        expenseList.innerHTML += liTemplate;
        expenses.innerHTML = (parseFloat(expenses.innerHTML) + addedAmount).toFixed(2);
    }
}

let updateExpPercentage = () => {
    // expensesPercentageVal = ( expenses / income ) * 100
    let expensesPercentageVal = parseFloat(expenses.innerHTML) /  parseFloat(income.innerHTML) * 100;
    if(expensesPercentageVal != Number.NEGATIVE_INFINITY) {
        expensesPercentage.innerHTML = (expensesPercentageVal).toFixed(2) + '%';    
    } else {
        expensesPercentage.innerHTML = '';
    }
}

// load to UI
for (let i = 0; i < incomeArr.length; i++) {
    createListNode(incomeArr[i]);
}

for (let i = 0; i < expensesArr.length; i++) {
    createListNode(expensesArr[i]);
}

updateExpPercentage();

// console.log(incomeArr);
// console.log(expensesArr);


// Handle submission of values
enter.addEventListener('click', () => {
    if(!isNaN(parseFloat(amount.value))) {
        if (description.value !== '' && amount.value !== '') {
            let tempItem = new Record(sign.value, amount.value, description.value);

            createListNode(tempItem);
            updateExpPercentage();

            // clear input fields
            description.value = '';
            amount.value = '';
            
            // calculate percentage
            // expPercentage = exp / balance 

            saveToDb();
        } else {
            alert("Sorry, you can't leave any input field empty.")
        }
    } else {
        alert("Your amount input was invalid. :(\nMake sure it's a number.")
    }    
});

let saveToDb = () => {
    let listItems = document.querySelectorAll('.item');

    console.log(listItems);
    console.log('length :' + listItems.length);
    let newIncomeArr = [];
    let newExpensesArr = [];
    for (let i = 0; i < listItems.length; i++) {
        // delimiter = ' '
        let tokens = listItems[i].innerHTML.split(' | ');
        // 0: sign
        // 1: amount
        // 2: description
        

        let newRecord = new Record(tokens[0], tokens[1], tokens[2]);

        if (tokens[0] === '+') {
            newIncomeArr.push(newRecord);
        } else {
            newExpensesArr.push(newRecord);
        }
    }

    // write new value to localStorage
    db.setItem('income', JSON.stringify(newIncomeArr));
    db.setItem('expenses', JSON.stringify(newExpensesArr));
    console.log(db.getItem('income'));
    console.log(db.getItem('expenses'));
}

save.addEventListener('click', saveToDb);

// upon page load -> load data from localStorage, put to HTML
// HTML -> input, save to localStorage
//

