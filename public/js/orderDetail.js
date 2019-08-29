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
fileButton.addEventListener("change", function (e) {
    uploadFile(e);
});

let firmData = {};
let stateData = {};
let objectId;

let today = new Date();
let deadlineDate = new Date();
let paymentDate = new Date();

$(document).ready(() => {
    getFirmData();
    getStateData();
    setFirmOptions();
    setStateOptions();
    getSingleOrder();
});

$("select").on("contentChanged", function () {
    $(this).formSelect();
});

async function getSingleOrder() {
    let orderId = document.getElementById("orderId").textContent;
    let doc = await db
        .collection("orders")
        .doc(orderId)
        .get();
    addOrderToView(doc.data());
    createFileView(doc.data());
}

function createFileView(result) {
    let fileContainer = document.getElementById("fileNames");
    fileContainer.innerHTML = ""
    result.files.forEach(file => {
        console.log(file)
        let p = document.createElement("p");
        let node = document.createTextNode(file.name);
        p.appendChild(node);

        let sref = firebase.storage();
        prefURL = file.url;
        let pref = sref.ref(prefURL);
        pref
            .getDownloadURL()
            .then(function (url) {
                console.log(url);
                p.innerHTML = '<a href="' + url + '">' + file.name + "</a>";
            })
            .catch(function (error) {
                console.log(error);
            });

        fileContainer.appendChild(p);
    });

}

function uploadFile(e) {
    let orderId = document.getElementById("orderId").textContent;
    if (orderId) {
        //get the order id to use it as a url prefix
        //get the file
        var file = e.target.files[0];
        let url = orderId + "/" + file.name;
        console.log(url);
        //make a storage url with filename and orderid
        var storageRef = firebase.storage().ref(url);
        //upload file
        storageRef.put(file).then(async function (snapshot) {

            let files = [];
            let tmp = await db.collection("orders").doc(orderId).get();
            files = tmp.data().files;
            newFile = {
                url: url,
                name: file.name
            }
            files.push(newFile)
            let json = {
                files
            }
            db.collection("orders").doc(orderId).update(json);
            let doc = await db
                .collection("orders")
                .doc(orderId)
                .get();
            createFileView(doc.data());

        });
        //save the url in the order filepath

    }
}

async function addOrderToView(result) {

    console.log(result);
    firma = await result.firm.get();
    console.log(firma.data().name);
    $("#firmSelect").val(firma.id);
    $("#firmSelect").formSelect();
    $("#orderNo").val(result.no)
    $("#inputOrderCurrency").val(result.currency);
    $("#inputOrderCurrency").formSelect();
    $("#inputOrderPrice").val(result.price)
    state = await result.state.get();
    $("#orderSelect").val(state.id);
    $("#orderSelect").formSelect();
    picker1.setDate(new Date(result.creationDate.seconds * 1000));
    today = new Date(result.creationDate.seconds * 1000)
    picker2.setDate(new Date(result.deadline.seconds * 1000))
    deadlineDate = new Date(result.deadline.seconds * 1000)
    picker3.setDate(new Date(result.paymentDate.seconds * 1000))
    paymentDate = new Date(result.paymentDate.seconds * 1000)
    $("#orderNotes").val(result.detail);
    $(".loading").fadeOut("slow");
}

function enableSave() {
    $("#saveNew").removeClass("disabled");
}

function disableSave() {
    $("#saveNew").addClass("disabled");

}

function saveOrder() {
    let orderId = document.getElementById("orderId").textContent;
    let obj = {
        creationDate: today,
        currency: $("#inputOrderCurrency").val(),
        deadline: deadlineDate,
        detail: $("#orderNotes").val(),
        files: [],
        firm: db.collection("firms").doc($("#firmSelect").val()),
        no: $("#orderNo").val(),
        paymentDate: paymentDate,
        price: parseInt($("#inputOrderPrice").val()),
        state: db.collection("states").doc($("#orderSelect").val()),
    }
    console.log(obj)
    disableSave();
    db.collection("orders").doc(orderId).update(obj)
}

$("#editOrder").change(() => {
    enableSave();
});

function deleteOrder() {
    let url = "https://vitaus-erp.herokuapp.com/api/order/" + orderId;
    $.ajax({
        type: "DELETE",
        url: url,
        data: {},
        success: result => {
            // window.open("http://localhost:3001/order/");
            window.location.replace("http://localhost:3001/order/");
        }
    });
}

async function getFirmData() {
    let snapshot = await db.collection("firms").get();
    snapshot.docs.forEach(doc => {
        firmData[doc.id] = doc.data();
    });
}

async function getStateData() {
    let snapshot = await db.collection("states").get();
    snapshot.docs.forEach(doc => {
        stateData[doc.id] = doc.data();
    });
}

function setFirmOptions() {
    db.collection("firms")
        .get()
        .then(snapshot => {
            snapshot.docs.forEach(doc => {
                $("#firmSelect").append(new Option(doc.data().name, doc.id));
                $("#firmSelect").trigger("contentChanged");
            });
        });
}

function setStateOptions() {
    db.collection("states")
        .get()
        .then(snapshot => {
            snapshot.docs.forEach(doc => {
                $("#orderSelect").append(new Option(doc.data().name, doc.id));
                $("#orderSelect").trigger("contentChanged");
            });
        });
}

$("#prepareOrderStartButton").click(function () {
    //create a dropdown with files in it
    let orderId = document.getElementById("orderId").textContent;
    window.location.href = "http://localhost:3001/order/prepare/" + orderId;
});