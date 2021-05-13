// Escopo de funções do Modal
const Modal = {

    open() {

        // Abrir Modal
        // Adicionar a classe active ao modal

        document
            .querySelector(".modal-overlay")
            .classList
            .add("active")



    },

    close() {

        // Fechar modal
        // Remover a classe active do modal
        document.querySelector(".modal-overlay")
            .classList
            .remove("active")

    }

}

const Storage = {
    get(){

        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
        
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions",
         JSON.stringify(transactions))
    }
}
// -----------------------------------------------------------
const Transaction = {
    all: Storage.get(),

    add(transaction) {

        this.all.push(transaction)


        App.reload()

    },

    remove(index){

        this.all.splice(index, 1)

        App.reload()
    },

    // Somar as entradas
    incomes() {

        let income = 0

        this.all.forEach((transaction) => {
            income += transaction.amount > 0 ? transaction.amount : 0

        })

        return income

    },
    expenses() {
        // Somar as saídas
        let expense = 0

        this.all.forEach((transaction) => {
            expense += transaction.amount < 0 ? transaction.amount : 0
        })

        return (expense)
    },
    total() {

        return this.incomes() + this.expenses()
    }
}

// Constante que armazena objetos que manipulam a DOM
const DOM = {

    transactionContainer: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index) {

        const tr = document.createElement("tr")
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)
    },

    // Montando um HTML
    innerHTMLTransaction(transaction, index) {
        

        const transactionColor = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `        
            <td class="description">${transaction.description}</td>
            <td class="${transactionColor}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onClick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remover transação">
            </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById("incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById("expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById("totalDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.total())


    },

    clearTransactions() {
        DOM.transactionContainer.innerHTML = ""
    }
}

const Utils = {

    formatDate(date){

        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`

    },

    formatAmount(value){
        
        value = Number(value) * 100

        return value
    },

    formatCurrency(value) {

        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })

        return signal + value

    }
}

const Form = {

    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues(){
        return (
            {
                description: this.description.value,
                amount: this.amount.value,
                date: this.date.value,
            }
        )
    },

    validateFields(){
        const { description, amount, date} = this.getValues()
        if(
            description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === ""){
                throw new Error("Por favor, preencha todos os campos")
        } 
    },

    formatData(){
        
        let { description, amount, date} = this.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)       
        
        return {description, amount, date}
        
    },

    saveTransaction(transaction){
        Transaction.add(transaction)
    },

    clearFields(){
        this.description.value = ""
        this.amount.value = ""
        this.date.value = ""
    },

    submit(event){
        event.preventDefault()

        try{

        this.validateFields()

        const transactions = this.formatData()

        this.saveTransaction(transactions)

        this.clearFields()

        Modal.close()        

        }catch(e){
        alert(e.message)
        }

        

    }

}

const App = {
    init() {


        // Atualizando transações
        Transaction.all.forEach(DOM.addTransaction)

        // Atualizando balança
        DOM.updateBalance()

        Storage.set(Transaction.all)        

    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}


// Botão de nova transação
document
    .querySelector("#newTransaction")
    .addEventListener("click", Modal.open)

        //Função no botão cancelar da Modal
document
    .querySelector(".cancel")
    .addEventListener("click", Modal.close)

App.init()