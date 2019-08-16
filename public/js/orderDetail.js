const picker1 = datepicker("#inputOrderDate", {
    onSelect: (instance, date) => {
        enableSave();
    },
    formatter: turkishDateFormatter
});
const picker2 = datepicker("#inputDeadline", {
    onSelect: (instance, data) => {
        enableSave();
    },
    formatter: turkishDateFormatter
});
const picker3 = datepicker("#inputPaymentDate", {
    onSelect: (instance, data) => {
        enableSave();
    },
    formatter: turkishDateFormatter
});
const fileButton = document.getElementById("fileButton");
fileButton.addEventListener("change", function(e){
    uploadFile(e);  

})



let objectId;

var firebaseConfig = {
    apiKey: "AIzaSyAxV0utovHRcYpMcj_txVOf9NZLxaq0Iwg",
    authDomain: "vitaus-erp.firebaseapp.com",
    databaseURL: "https://vitaus-erp.firebaseio.com",
    projectId: "vitaus-erp",
    storageBucket: "vitaus-erp.appspot.com",
    messagingSenderId: "597901040392",
    appId: "1:597901040392:web:b264a25fc443e416"
};
firebase.initializeApp(firebaseConfig);


$(document).ready(() => {
    addCurrencyOptions();
    addOrderOptions();
    getFirmOptions();
    getSingleOrder();

    
});

function getSingleOrder(){
    let orderId = document.getElementById("orderId").textContent;
    let url = "https://vitaus-erp.herokuapp.com/api/order/" + orderId;
    $.ajax({
        url: url,
        success: (result) => {
            objectId = result[0]._id;
            
            addOrderToView(result);
            createFileView(result);
        }
    })
}

function createFileView(result){
    result[0].files.forEach((file) => {
        let p = document.createElement("p");
        let node = document.createTextNode(file.name);
        p.appendChild(node);

        let fileContainer = document.getElementById("fileNames");
        let sref = firebase.storage();
        prefURL = file.path;
        let pref = sref.ref(prefURL);
        pref.getDownloadURL().then(function(url){
            console.log(url);
            p.innerHTML = '<a href=\"'+ url+ '\">'+ file.name + '</a>';

        }).catch(function(error){
            console.log(error);
        })

        fileContainer.appendChild(p);

    })
}

function uploadFile(e){
    if(objectId){
        //get the order id to use it as a url prefix
        //get the file
        var file = e.target.files[0];
        let url = objectId + "/" + file.name;
        console.log(url);
        //make a storage url with filename and orderid
        var storageRef = firebase.storage().ref(url);
        //upload file
        storageRef.put(file).then(function(snapshot){
            data = {
                fileurl: url,
                filename: file.name,
                orderid: objectId
            }
            $.ajax({
                type: "POST",
                url: "https://vitaus-erp.herokuapp.com/api/order/upload",
                data: data,
                success: (result) => {
                    console.log(result);
                    location.reload();
                }
            })
        });
        //save the url in the order filepath


    }
    
}

function addOrderToView(result){
    console.log(result[0]);
    $("#firmSelect option").each(function(index) {
        let x = $(this).val();
        if(x === result[0].firm){
            document.getElementById("firmSelect").selectedIndex = index;
        }
    })

    $("#inputOrderCurrency option").each(function(index) {
        let x = $(this).val();
        if(x === result[0].currency){
            document.getElementById("inputOrderCurrency").selectedIndex = index;
        }
    })
    picker1.setDate(new Date(result[0].creationDate), true);
    picker2.setDate(new Date(result[0].deadline), true);
    picker3.setDate(new Date(result[0].paymentDate), true);
    document.getElementById("orderId").value = result[0].no;
    document.getElementById("orderSelect").selectedIndex = result[0].state;
    document.getElementById("inputOrderPrice").value = result[0].price;
    if(result[0].detail){
        document.getElementById("orderNotes").value = result[0].detail;
    }
}

function enableSave(){
    let saveButton = document.getElementById("saveNew");
    saveButton.disabled = false;
}

function disableSave(){
    let saveButton = document.getElementById("saveNew");
    saveButton.disabled = true;
}
function saveOrder(){
    let companyElement = document.getElementById("firmSelect");
    let companyName = companyElement.options[companyElement.selectedIndex].value;
    let currencyElement = document.getElementById("inputOrderCurrency");
    let currency = currencyElement.options[currencyElement.selectedIndex].value;
    let orderId = document.getElementById("orderId").textContent;
    let status = document.getElementById("orderSelect").selectedIndex;
    let orderDate =new Date(document.getElementById("inputOrderDate").value);
    let deadline = new Date(document.getElementById("inputDeadline").value);
    let paymentDate = new Date(document.getElementById("inputPaymentDate").value);
    let notes = document.getElementById("orderNotes").value;
    let price = document.getElementById("inputOrderPrice").value;

    order = {
        id: objectId,
        firm: companyName,
        no: orderId,
        creationDate: orderDate,
        deadline: deadline,
        state: status,
        paymentDate: paymentDate,
        detail: notes,
        price: price,
        currency: currency
    }
    if(companyName && orderId && orderDate && deadline && paymentDate){
         $.ajax({
             type: "PUT",
             url: "https://vitaus-erp.herokuapp.com/api/order",
             data: order,
             success: (result) => {
                 disableSave();
             }
         })
    }
}

$("#editOrder").change(() => {
    enableSave();
});

function deleteOrder(){
    let url = "https://vitaus-erp.herokuapp.com/api/order/" + orderId;
    $.ajax({
        type: "DELETE",
        url: url,
        data: {},
        success: (result) => {
            // window.open("http://localhost:3001/order/");
            window.location.replace("http://localhost:3001/order/");
        }
    })

}

function addOrderOptions(){
    let orderSelector = document.getElementById("orderSelect");
    $.ajax({
        type: "GET",
        url: "https://vitaus-erp.herokuapp.com/api/order/status",
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

function getFirmOptions(){
    let firmSelector = document.getElementById("firmSelect");
    $.ajax({
        type: "GET",
        url: "https://vitaus-erp.herokuapp.com/api/order/firm",
        data: {},
        success: (result) => {
            result.forEach((element) => {
                let opt = document.createElement("option");
                opt.appendChild(document.createTextNode(element.name));
                opt.value = element.name;
                firmSelector.appendChild(opt);
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

