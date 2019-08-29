const picker1 = datepicker("#inputOrderDate", {
    formatter: turkishDateFormatter,
    onSelect: (instance, date) => {
        today = date;
    }
});
const picker2 = datepicker("#inputDeadline", {
    formatter: turkishDateFormatter,
    onSelect: (instance, date) => {
        deadlineDate = date;
    }
});
const picker3 = datepicker("#inputPaymentDate", {
    formatter: turkishDateFormatter,
    onSelect: (instance, date) => {
        paymentDate = date
    }
});

let today = new Date();
let deadlineDate = new Date();
let paymentDate = new Date();


let firmData = {};
let stateData = {};
let deletePending;
// let firmObjectList;
// let gOrderDate;
// let gDeadline;
// let gPaymentDate;

Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}


$(document).ready(() => {
    $("#firmSelect").change(function () {
        console.log($(this).val());
        let deadline = firmData[$(this).val()]["deadline"];
        let payment = firmData[$(this).val()]["payment"];
        deadlineDate = deadlineDate.addDays(deadline);
        picker2.setDate(deadlineDate, true);
        paymentDate = paymentDate.addDays(payment);
        picker3.setDate(paymentDate, true);
        picker1.setDate(today, true);
    })

    // addOrderOptions();
    // addCurrencyOptions();
    getFirmData();
    getStateData();
    setFirmOptions();
    setStateOptions();
    //getOrders();

})

function saveOrder() {

}

$("#saveNew").click(async (e) => {
    let obj = {
        creationDate: today,
        currency: $("#inputOrderCurrency").val(),
        deadline: deadlineDate,
        detail: "",
        files: [],
        firm: db.collection("firms").doc($("#firmSelect").val()),
        no: $("#inputOrderNumber").val(),
        paymentDate: paymentDate,
        price: parseInt($("#inputOrderPrice").val()),
        state: db.collection("states").doc($("#orderSelect").val()),
    }
    console.log(obj)
    db.collection("orders").add(obj)

})


// let companyAscending = 0;
// let orderNumberAscending = 0;
// let statusAscending = 0;
// let orderDateAscending = 0;
// let terminAscending = 0;
// let paymentAscending = 0;

// function sortByCompany(){
//     if(orderData){
//         companyAscending = !companyAscending;
//         if(companyAscending){
//             orderData.sort((a, b) => (a.firm > b.firm) ? 1: -1)
//         }
//         else{
//             orderData.sort((a, b) => (b.firm > a.firm) ? 1: -1)
//         }
//         addOrderToView(orderData)
//     }
// }

// function sortByOrderNumber(){
//     if(orderData){
//         orderNumberAscending = !orderNumberAscending;
//         if(orderNumberAscending){
//             orderData.sort((a, b) => (a.no > b.no) ? 1: -1)
//             //orderData.sort((a, b) => (a.no.localeCompare(b.no)) ? 1: -1)
//         }
//         else{
//             orderData.sort((a, b) => (b.no > a.no) ? 1: -1)
//             //orderData.sort((a, b) => (b.no.localeCompare(a.no)) ? 1: -1)
//         }
//         addOrderToView(orderData)
//     }
// }

// function sortByStatus(){
//     if(orderData){
//         statusAscending = !statusAscending;
//         if(statusAscending){
//             orderData.sort((a, b) => (a.state > b.state) ? 1: -1)
//             //orderData.sort((a, b) => (a.no.localeCompare(b.no)) ? 1: -1)
//         }
//         else{
//             orderData.sort((a, b) => (b.state > a.state) ? 1: -1)
//             //orderData.sort((a, b) => (b.no.localeCompare(a.no)) ? 1: -1)
//         }
//         addOrderToView(orderData)
//     }
// }

// function sortByOrderDate(){
//     if(orderData){
//         terminAscending = !terminAscending;
//         if(terminAscending){
//             orderData.sort((a, b) => (new Date(a.creationDate) > new Date(b.creationDate)) ? 1: -1)
//             //orderData.sort((a, b) => (a.no.localeCompare(b.no)) ? 1: -1)
//         }
//         else{
//             orderData.sort((a, b) => (new Date(b.creationDate) >  new Date(a.creationDate)) ? 1: -1)
//             //orderData.sort((a, b) => (b.no.localeCompare(a.no)) ? 1: -1)
//         }
//         addOrderToView(orderData)
//     }
// }

// function sortByTermin(){
//     if(orderData){
//         orderDateAscending = !orderDateAscending;
//         if(orderDateAscending){
//             orderData.sort((a, b) => (new Date(a.deadline) > new Date(b.deadline)) ? 1: -1)
//         }
//         else{
//             orderData.sort((a, b) => (new Date(b.deadline) >  new Date(a.deadline   )) ? 1: -1)
//         }
//         addOrderToView(orderData)
//     }
// }

// function sortByPaymentDate(){
//     if(orderData){
//         paymentAscending = !paymentAscending;
//         if(orderDateAscending){
//             orderData.sort((a, b) => (new Date(a.paymendDate) > new Date(b.paymendDate)) ? 1: -1)
//             //orderData.sort((a, b) => (a.no.localeCompare(b.no)) ? 1: -1)
//         }
//         else{
//             orderData.sort((a, b) => (new Date(b.paymendDate) >  new Date(a.paymendDate)) ? 1: -1)
//             //orderData.sort((a, b) => (b.no.localeCompare(a.no)) ? 1: -1)
//         }
//         addOrderToView(orderData)
//     }
// }


function clearCache() {
    $("#firmSelect").val(null);
    $("#inputOrderNumber").val(null);
    $("#inputOrderDate").val(null);
    $("#inputDeadline").val(null);
    $("#inputPaymentDate").val(null);
}


$("select").on("contentChanged", function () {
    $(this).formSelect();
})

function setFirmOptions() {
    db.collection("firms").get().then((snapshot) => {
        snapshot.docs.forEach(doc => {
            $("#firmSelect").append(new Option(doc.data().name, doc.id))
            $("#firmSelect").trigger("contentChanged");
        })
    })
}

function setStateOptions() {
    db.collection("states").get().then((snapshot) => {
        snapshot.docs.forEach(doc => {
            $("#orderSelect").append(new Option(doc.data().name, doc.id))
            $("#orderSelect").trigger("contentChanged");
        })
    })
}


const orderList = document.querySelector("#order-list");

//create element and render order
async function renderOrder(doc) {
    let li = document.createElement("li");
    li.setAttribute("data-id", doc.id)

    let firma = document.createElement("div");
    firma.classList.add("col", "flow-text", "white-text");
    let firmaName = await doc.data().firm.get();
    firma.textContent = firmaName.data().name

    let no = document.createElement("div");
    no.classList.add("col")
    let nospan1 = document.createElement("span");
    let nospan2 = document.createElement("span");
    nospan2.classList.add("white-text")
    nospan1.textContent = "Sipariş No:";
    nospan2.textContent = doc.data().no;
    no.appendChild(nospan1);
    no.appendChild(nospan2);

    let creationDate = document.createElement("div");
    creationDate.classList.add("col");
    let creationSpan1 = document.createElement("span");
    let creationSpan2 = document.createElement("span");
    creationSpan1.textContent = "Sipariş Tarihi:";
    creationSpan2.classList.add("white-text");
    creationSpan2.textContent = new Date(doc.data().creationDate.seconds * 1000).toLocaleDateString("tr-TR");
    creationDate.appendChild(creationSpan1);
    creationDate.appendChild(creationSpan2);

    let deadline = document.createElement("div");
    deadline.classList.add("col");
    let deadlineSpan1 = document.createElement("span");
    let deadlineSpan2 = document.createElement("span");
    deadlineSpan1.textContent = "Termin Tarihi:";
    deadlineSpan2.classList.add("white-text");
    deadlineSpan2.textContent = new Date(doc.data().deadline.seconds * 1000).toLocaleDateString("tr-TR");
    deadline.appendChild(deadlineSpan1);
    deadline.appendChild(deadlineSpan2);

    currency = doc.data().currency;

    let price = document.createElement("div");
    price.classList.add("col");
    let priceSpan1 = document.createElement("span");
    let priceSpan2 = document.createElement("span");
    priceSpan1.textContent = "Sipariş Tutarı:";
    priceSpan2.classList.add("white-text");
    priceSpan2.textContent = currency + doc.data().price;
    price.appendChild(priceSpan1);
    price.appendChild(priceSpan2);

    let paymentDate = document.createElement("div");
    paymentDate.classList.add("col");
    let paymentSpan1 = document.createElement("span");
    let paymentSpan2 = document.createElement("span");
    paymentSpan1.textContent = "Ödeme Tarihi:";
    paymentSpan2.classList.add("white-text");
    paymentSpan2.textContent = new Date(doc.data().paymentDate.seconds * 1000).toLocaleDateString("tr-TR");
    paymentDate.appendChild(paymentSpan1);
    paymentDate.appendChild(paymentSpan2);

    let status = document.createElement("div");
    status.classList.add("col");
    let statusSpan1 = document.createElement("span");
    let statusSpan2 = document.createElement("span");
    s = await doc.data().state.get();
    statusSpan1.textContent = "Sipariş Durumu:";
    statusSpan2.classList.add("white-text");
    statusSpan2.textContent = s.data().name;
    statusSpan2.style.color = s.data().color;
    status.appendChild(statusSpan1);
    status.appendChild(statusSpan2);

    let crossa = document.createElement("a");
    crossa.setAttribute("href", "#delete");
    crossa.classList.add("modal-trigger")

    let cross = document.createElement("i");
    cross.textContent = "delete";
    cross.classList.add("material-icons", "right")
    crossa.appendChild(cross)
    crossa.addEventListener("click", function (e) {
        deletePending = e.target.parentNode.parentNode.getAttribute("data-id");
    })

    li.appendChild(firma);
    li.appendChild(no);
    li.appendChild(creationDate)
    li.appendChild(deadline);
    li.appendChild(price)
    li.appendChild(paymentDate)
    li.appendChild(status)
    li.appendChild(crossa);

    li.classList.add("card-panel", "grey", "darken-4", "grey-text", "text-lighten-1", "row")
    orderList.appendChild(li)

    li.addEventListener("mouseover", function () {
        li.classList.add("z-depth-3")
    });
    li.addEventListener("mouseout", function () {
        li.classList.remove("z-depth-3")
    })
    li.addEventListener("click", function () {
        let id = this.getAttribute("data-id");
        window.location.href = "http://localhost:3001/order/single/" + id;
    })
    $(".loading").fadeOut("slow");

}

//delete
$("#deleteConfirm").click(function () {
    console.log(deletePending)
    if (deletePending) {
        db.collection("orders").doc(deletePending).delete();
    }
    deletePending = undefined;
})


//real time
db.collection("orders").onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if (change.type == "added") {
            renderOrder(change.doc)
        } else if (change.type == "removed") {
            let li = orderList.querySelector('[data-id= ' + change.doc.id + ']')
            orderList.removeChild(li)
        }
    })
})


async function getFirmData() {
    let snapshot = await db.collection("firms").get();
    snapshot.docs.forEach(doc => {
        firmData[doc.id] = doc.data();
    })

}

async function getStateData() {
    let snapshot = await db.collection("states").get();
    snapshot.docs.forEach(doc => {
        stateData[doc.id] = doc.data();
    })
}