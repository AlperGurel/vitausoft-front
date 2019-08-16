const picker1 = datepicker("#inputOrderDate", {
    formatter: turkishDateFormatter
});
const picker2 = datepicker("#inputDeadline", {
    formatter: turkishDateFormatter
});
const picker3 = datepicker("#inputPaymentDate", {
    formatter: turkishDateFormatter
});
let firmObjectList;

Date.prototype.addDays = function(days){
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}


$(document).ready(() => {
    let companySelector = document.getElementById("firmSelect");
    companySelector.addEventListener("change", function(){
        setDeadline(companySelector.options[this.selectedIndex].value);
        setPaymentDate(companySelector.options[this.selectedIndex].value);
    })


    addOrderOptions();
    addCurrencyOptions();
    getFirmOptions();
    getOrders();

})


function getDateFromForm(){
    let companyElement = document.getElementById("firmSelect");
    let companyId = companyElement.options[companyElement.selectedIndex].value;
    let currencyElement = document.getElementById("inputOrderCurrency");
    let currency = currencyElement.options[currencyElement.selectedIndex].value;
    let orderNumber = document.getElementById("inputOrderNumber").value;
    let statusIndex = document.getElementById("orderSelect").selectedIndex;
    let orderPrice = document.getElementById("inputOrderPrice").value;

    let orderDate = new Date(document.getElementById("inputOrderDate").value);
    
    let deadline = new Date(document.getElementById("inputDeadline").value);
    let paymentDate = new Date(document.getElementById("inputPaymentDate").value);
    
    order = {
        price: orderPrice,
        firm: companyId,
        no: orderNumber,
        creationDate: orderDate,
        deadline: deadline,
        state: statusIndex,
        paymentDate: paymentDate,
        currency: currency,
        detail: ""
    }
    if(companyId && orderNumber && orderDate && deadline && paymentDate){
        $.ajax({
            type: "POST",
            url: "https://vitaus-erp.herokuapp.com/api/order",
            data: order,
            success: (result) => {
                addOrderToView(result);

            }
        })  
    }
   else{
        
    }     
}

let orderData;

function getOrders(){
    $.ajax({
        url: "https://vitaus-erp.herokuapp.com/api/order", 
        success: (result) => {
            orderData = result;
            if(result.length >= 1){
                addOrderToView(orderData);
            }          
    }})
}
let companyAscending = 0;
let orderNumberAscending = 0;
let statusAscending = 0;
let orderDateAscending = 0;
let terminAscending = 0;
let paymentAscending = 0;

function sortByCompany(){
    if(orderData){
        companyAscending = !companyAscending;
        if(companyAscending){
            orderData.sort((a, b) => (a.firm > b.firm) ? 1: -1)
        }
        else{
            orderData.sort((a, b) => (b.firm > a.firm) ? 1: -1)
        }
        addOrderToView(orderData)
    }
}

function sortByOrderNumber(){
    if(orderData){
        orderNumberAscending = !orderNumberAscending;
        if(orderNumberAscending){
            orderData.sort((a, b) => (a.no > b.no) ? 1: -1)
            //orderData.sort((a, b) => (a.no.localeCompare(b.no)) ? 1: -1)
        }
        else{
            orderData.sort((a, b) => (b.no > a.no) ? 1: -1)
            //orderData.sort((a, b) => (b.no.localeCompare(a.no)) ? 1: -1)
        }
        addOrderToView(orderData)
    }
}

function sortByStatus(){
    if(orderData){
        statusAscending = !statusAscending;
        if(statusAscending){
            orderData.sort((a, b) => (a.state > b.state) ? 1: -1)
            //orderData.sort((a, b) => (a.no.localeCompare(b.no)) ? 1: -1)
        }
        else{
            orderData.sort((a, b) => (b.state > a.state) ? 1: -1)
            //orderData.sort((a, b) => (b.no.localeCompare(a.no)) ? 1: -1)
        }
        addOrderToView(orderData)
    }
}

function sortByOrderDate(){
    if(orderData){
        terminAscending = !terminAscending;
        if(terminAscending){
            orderData.sort((a, b) => (new Date(a.creationDate) > new Date(b.creationDate)) ? 1: -1)
            //orderData.sort((a, b) => (a.no.localeCompare(b.no)) ? 1: -1)
        }
        else{
            orderData.sort((a, b) => (new Date(b.creationDate) >  new Date(a.creationDate)) ? 1: -1)
            //orderData.sort((a, b) => (b.no.localeCompare(a.no)) ? 1: -1)
        }
        addOrderToView(orderData)
    }
}

function sortByTermin(){
    if(orderData){
        orderDateAscending = !orderDateAscending;
        if(orderDateAscending){
            orderData.sort((a, b) => (new Date(a.deadline) > new Date(b.deadline)) ? 1: -1)
        }
        else{
            orderData.sort((a, b) => (new Date(b.deadline) >  new Date(a.deadline   )) ? 1: -1)
        }
        addOrderToView(orderData)
    }
}

function sortByPaymentDate(){
    if(orderData){
        paymentAscending = !paymentAscending;
        if(orderDateAscending){
            orderData.sort((a, b) => (new Date(a.paymendDate) > new Date(b.paymendDate)) ? 1: -1)
            //orderData.sort((a, b) => (a.no.localeCompare(b.no)) ? 1: -1)
        }
        else{
            orderData.sort((a, b) => (new Date(b.paymendDate) >  new Date(a.paymendDate)) ? 1: -1)
            //orderData.sort((a, b) => (b.no.localeCompare(a.no)) ? 1: -1)
        }
        addOrderToView(orderData)
    }
}


function addOrderToView(orders){
    //clear table every time
    $("tr").not("#tableHead").remove()
    console.log(orders);
    let table = document.getElementById("orders");
    if(Array.isArray(orders)){
      orders.forEach((element, index) => {
        let row = table.insertRow(index+1);
        $("tr").not("#tableHead").addClass("clickable-row");
        let companyCell = row.insertCell(0);
        let orderNumberCell = row.insertCell(1);
        let statusCell = row.insertCell(2);
        let orderDateCell = row.insertCell(3);
        let deadline = row.insertCell(4);
        let paymentDate = row.insertCell(5);
        let state = document.getElementById("orderSelect").options[element.state].value;
        companyCell.innerHTML = element.firm;
        orderNumberCell.innerHTML = element.no;
        statusCell.innerHTML = state;
        orderDateCell.innerHTML = new Date(element.creationDate).toLocaleDateString("tr-TR", {weekday: "long", year:"numeric", month:"long",day:"numeric"})
        deadline.innerHTML = new Date(element.deadline).toLocaleDateString("tr-TR", {weekday: "long", year:"numeric", month:"long",day:"numeric"})
        paymentDate.innerHTML = new Date(element.paymentDate).toLocaleDateString("tr-TR", {weekday: "long", year:"numeric", month:"long",day:"numeric"})

    });  
    }
    else{
        
        let row = table.insertRow(1);
        $("tr").not("#tableHead").addClass("clickable-row");
        let companyCell = row.insertCell(0);    
        let orderNumberCell = row.insertCell(1);
        let statusCell = row.insertCell(2);
        let orderDateCell = row.insertCell(3);
        let deadline = row.insertCell(4);
        let paymentDate = row.insertCell(5);
        let state = document.getElementById("orderSelect").options[orders.state].value;
        orderDateCell.innerHTML = new Date(element.creationDate).toLocaleDateString("tr-TR", {weekday: "long", year:"numeric", month:"long",day:"numeric"})
        deadline.innerHTML = new Date(element.deadline).toLocaleDateString("tr-TR", {weekday: "long", year:"numeric", month:"long",day:"numeric"})
        paymentDate.innerHTML = new Date(element.paymentDate).toLocaleDateString("tr-TR", {weekday: "long", year:"numeric", month:"long",day:"numeric"})
    }
    $(".clickable-row").click(function() {
        let orderId = this.childNodes[1].textContent;
        let url = "http://localhost:3001/order/" + orderId;
        window.location = url;
    });
    
}


function clearCache(){
    $("#firmSelect").val(null);
    $("#inputOrderNumber").val(null);
    $("#inputOrderDate").val(null);
    $("#inputDeadline").val(null);
    $("#inputPaymentDate").val(null);
}


function addOrderOptions(){
    let orderSelector = document.getElementById("orderSelect");
    $.ajax({
        type: "GET",
        url: "https://vitaus-erp.herokuapp.com/api/order/status",
        data: {},
        success: (result) => {  
            result.forEach((element) => {
                let opt = document.createElement("option");
                opt.appendChild(document.createTextNode(element));
                opt.value = element;
                orderSelector.appendChild(opt);
            })
        }
    })
}

function addCurrencyOptions(){
    let currencySelector = document.getElementById("inputOrderCurrency");
    $.ajax({
        type: "GET",
        url: "https://vitaus-erp.herokuapp.com/api/order/currency",
        data: {},
        success: (result) => {
            result.forEach((element) => {
                let opt = document.createElement("option");
                opt.appendChild(document.createTextNode(element));
                opt.value = element;
                currencySelector.appendChild(opt);
            })
        }
    })
}

function getFirmOptions(){
    let firmSelector = document.getElementById("firmSelect");
    $.ajax({
        type: "GET",
        url: "https://vitaus-erp.herokuapp.com/api/order/firm",
        data: {},
        success: (result) => {
            firmObjectList = result;
            result.forEach((element) => {
                let opt = document.createElement("option");
                opt.appendChild(document.createTextNode(element.name));
                opt.value = element.name;
                firmSelector.appendChild(opt);
            })
        }
    })
}

function setCreationDate(){
    picker1.setDate(new Date(), true);
}

function setDeadline(firmName){
    if(firmObjectList){
        let deadlinetime;
        firmObjectList.forEach(element => {
            if(firmName === element.name){
                deadlinetime = element.deadline;
            }
        })
        if(deadlinetime){
            const datetime = new Date();

            const setDeadline = datetime.addDays(deadlinetime);
            picker2.setDate(new Date(setDeadline), true); 
        }
        
    }

}


function setPaymentDate(firmName){
    if(firmObjectList){
        let paymenttime;
        firmObjectList.forEach(element => {
            if(firmName === element.name){
                paymenttime = element.payment;
            }
        })
        if(paymenttime){
            const datetime = new Date();
            const setPayment = datetime.addDays(paymenttime);
            picker3.setDate(new Date(setPayment), true);
        }
    }
}