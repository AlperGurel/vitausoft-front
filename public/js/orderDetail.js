const picker1 = datepicker("#inputOrderDate", {
    onSelect: (instance, date) => {
        today = date;
        enableSave();
    },
    formatter: turkishDateFormatter,
    customDays: turkishDays,
    customMonths: turkishMonths
});
const picker2 = datepicker("#inputDeadline", {
    onSelect: (instance, date) => {
        deadlineDate = date;
        enableSave();
    },
    formatter: turkishDateFormatter,
    customDays: turkishDays,
    customMonths: turkishMonths
});
const picker3 = datepicker("#inputPaymentDate", {
    onSelect: (instance, date) => {
        paymentDate = date;
        enableSave();
    },
    formatter: turkishDateFormatter,
    customDays: turkishDays,
    customMonths: turkishMonths

});


$("#file-select").change(function (e) {
    $("#submit-file").removeClass("disabled")
})
$("#submit-file").click(function (e) {
    console.log($("#file-select").prop("files")[0]);
    uploadFile($("#file-select").prop("files")[0]);
})
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
                p.innerHTML = '<a class="filename" id="' + file.name.replace(/[()\s]/g, '') + '" href="' + url + '">' + file.name + "</a><a class='red-text' onclick='deleteFile(this)'><i class='material-icons right'>delete</i></a>";
            })
            .catch(function (error) {
                console.log(error);
            });

        fileContainer.appendChild(p);
    });

}
let op = document.getElementById("orderId").textContent;

function deleteFile(element) {
    let orderId = document.getElementById("orderId").textContent;
    let filename = $(element).parent().children(".filename").text();
    $(element).parent().remove();
    let path = orderId + "/" + filename;
    let storageRef = firebase.storage().ref(path);
    storageRef.delete().then(function () {

    }).catch(function (error) {

    })
    //delete from object
    db.collection("orders").doc(orderId).get().then(function (doc) {
        let data = doc.data();
        let newFiles = data.files.filter(element => {
            return element.url != path;
        })
        data.files = newFiles;
        db.collection("orders").doc(orderId).update(data).then(async function () {
            // let doc = await db
            //     .collection("orders")
            //     .doc(orderId)
            //     .get();
            // createFileView(doc.data());
        });


    }).catch(function (error) {
        console.log(error);
    })
    //redraw

}

function uploadFile(file) {
    let orderId = document.getElementById("orderId").textContent;
    if (orderId) {
        //get the order id to use it as a url prefix
        //get the file
        let url = orderId + "/" + file.name;
        $("#fileNames").append("<p><a class='filename' id='" + file.name.replace(/[()\s]/g, '') + "'>" + file.name + "</a><a class='red-text onclick='deleteFile(this)'><i class='material-icons right'>delete</i></a></p>")
        //make a storage url with filename and orderid
        var storageRef = firebase.storage().ref(url);
        //upload file
        storageRef.put(file).then(async function (snapshot) {
            snapshot.ref.getDownloadURL().then(function (donwloadURL) {

                console.log($("#" + file.name.replace(/[()\s]/g, '')));
                let tmp = file.name.replace(/[()\s]/g, '')
                $('#' + tmp).attr("href", donwloadURL);
                $("#" + tmp).click(function (e) {
                    console.log(e);
                })
            })
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
            // let doc = await db
            //     .collection("orders")
            //     .doc(orderId)
            //     .get();
            // createFileView(doc.data());

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

async function deleteOrder() {
    let orderId = document.getElementById("orderId").textContent;
    //delete files
    //delete prepare order data
    let filepathArray = await db.collection("orders").doc(orderId).get();
    filepathArray = filepathArray.data();
    filepathArray = filepathArray["files"];
    filepathArray.forEach(element => {
        let storageRef = firebase.storage().ref(element.url);
        storageRef.delete().then(function () {

        }).catch(function (error) {

        })
    })
    db.collection("orderData").doc(orderId).delete().then(function () {

    }).catch(function (error) {
        console.log("There is no such document")
    });
    db.collection("orders").doc(orderId).delete().then(function () {
        window.location.href = "http://localhost:3001/order/"
    });
    console.log(filepathArray);
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