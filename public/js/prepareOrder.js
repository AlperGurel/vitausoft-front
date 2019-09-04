const orderId = $("#orderId").text();

var justOrder = [];
let tableData = [];
let checklist = {};
let dataExist = false;
let data;
async function start() {
    doc = await db.collection("orders").doc(orderId).get();
    // console.log(doc.data())
    firma = await doc.data().firm.get();
    $(".firmName").text(firma.data().name)
    $(".orderNo").text(doc.data().no)
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    $(".orderDate").text(new Date(doc.data().creationDate.seconds * 1000).toLocaleDateString("tr-TR", dateOptions))
    doc.data().files.forEach(file => {
        $("#fileSelector").append(new Option(file.name, file.url))
    })
    let historyDoc = await db.collection("orderData").doc(orderId).get();

    if (!historyDoc.exists) {
        //show file selector
        $(".select-container").show();
    } else {
        //populate and show others
        data = historyDoc.data();
        console.log(data);
        justOrder = data.justOrder;
        tableData = data.tableData;
        checklist = data.checklist;
        dataExist = true;
        $("#confirmChoice").trigger("click")

    }
    $(".loading").fadeOut("slow");
}

start();

$("#fileSelector").change(function () {
    $("#amountSelector").find('option').not(':first').remove();
    $("#columnSelector").find('option').not(':first').remove();
    last = {};
    var re = /(?:\.([^.]+))?$/;
    var url = $("#fileSelector").val()
    var ext = re.exec(url);
    if (ext[1] == "xlsx") {
        let storage = firebase.storage();
        let pref = storage.ref(url);
        pref.getDownloadURL().then(function (remoteUrl) {
                var oReq = new XMLHttpRequest();
                oReq.open("GET", remoteUrl, true);
                oReq.responseType = "arraybuffer";
                oReq.onload = function (oEvent) {
                    var arrayBuffer = oReq.response;
                    var byteArray = new Uint8Array(arrayBuffer)
                    var wb = XLSX.read(byteArray, {
                        type: "array"
                    });
                    // console.log(wb)
                    var htmlstr = XLSX.write(wb, {
                        sheet: wb.SheetNames[0],
                        type: "binary",
                        bookType: "html"
                    })


                    $("#orderPreview").html(htmlstr)
                    $(".table-container").show();

                    let letter = 'A';
                    $("#orderPreview table tr:first-child").children().each(function (index) {
                        $("#columnSelector").append(new Option(letter, index));
                        $("#amountSelector").append(new Option(letter, index));

                        letter = String.fromCharCode(letter.charCodeAt(0) + 1);
                    })
                    $("#orderPreview table tr td").hover(function () {
                        $(this).addClass("hover");

                    }, function () {
                        $(this).removeClass("hover")

                    });
                    let chooseObj = {};
                    $("#orderPreview table tr td").click(function () {
                        if (last["stockIndex"] && last["amountIndex"]) {
                            $(this).addClass("choose");

                            if (chooseObj["first"] >= 0) {

                                chooseObj["second"] = $(this).parent().index()

                                if (chooseObj["second"] < chooseObj["first"]) {
                                    let tmp = chooseObj["first"];
                                    chooseObj["first"] = chooseObj["second"];
                                    chooseObj["second"] = tmp;
                                }
                                $("#orderPreview table tr td").removeClass("choose")
                                $("#orderPreview table tr").removeClass("choose")
                                for (let i = chooseObj["first"] + 1; i < chooseObj["second"] + 2; i++) {
                                    $("#orderPreview table tr:nth-child(" + i + ") td:nth-child(" + last["stockIndex"] + ")").addClass("choose")
                                    $("#orderPreview table tr:nth-child(" + i + ") td:nth-child(" + last["amountIndex"] + ")").addClass("choose")
                                }

                            } else {
                                chooseObj["first"] = $(this).parent().index();
                            }

                        };
                    })
                    $("#orderPreview").contextmenu(function (e) {
                        e.preventDefault();
                        $("#orderPreview table tr td").removeClass("choose")
                        $("#orderPreview table tr").removeClass("choose")
                        chooseObj = {};
                    })

                }
                oReq.send();
            })
            .catch(function (error) {
                console.log(error)
            })
    }
})

$(".orderNo").click(function () {
    window.location.href = "http://localhost:3001/order/single/" + orderId;
})

last = {
    selectedByStock: undefined,
    selectedByAmount: undefined,
    stockIndex: undefined,
    amountIndex: undefined
};

$("#columnSelector").change(function () {
    let index = $(this).val()
    index = parseInt(index);
    index += 1
    $("#orderPreview table tr td:nth-child(" + index + ")").css("border", "3px solid #ffb9a8")
    if (last && last["selectedByStock"]) {
        $("#orderPreview table tr td:nth-child(" + last["stockIndex"] + ")").css("border", " 1px solid grey")
    }
    last["stockIndex"] = index;
    last["selectedByStock"] = true;


})

$("#amountSelector").change(function () {
    let index = $(this).val()
    index = parseInt(index)
    index += 1
    $("#orderPreview table tr td:nth-child(" + index + ")").css("border", "3px solid #63a7ff")
    if (last && last["selectedByAmount"]) {
        $("#orderPreview table tr td:nth-child(" + last["amountIndex"] + ")").css("border", "1px solid grey")

    }
    last["amountIndex"] = index;
    last["selectedByAmount"] = true;
})


$("#confirmChoice").click(function () {
    if (!dataExist) {
        $("#orderPreview table tr").each(function (trIndex) {
            let obj = {};
            $(this).children().each(function (tdIndex) {
                if ($(this).hasClass("choose")) {
                    if (!obj["stock"]) {
                        obj["stock"] = $(this).text();
                    } else {
                        obj["amount"] = parseInt($(this).text());
                    }
                }
            })
            if (obj["stock"] && obj["amount"]) {

                justOrder.push(obj);
            }
        })
    }

    if (justOrder.length > 0) {
        // console.log(justOrder)
        $(".barcodeTables").show(300);
        $(".select-container").hide(300);
        let justOrderHtml = "<table><tr><td>Stok Kodu</td><td>Adet</td></tr>";
        let anotherHtml = ""
        justOrder.forEach(order => {
            let h = `<tr><td>${order.stock}</td><td class="amount">${order.amount}</td></tr>`
            let g = `<tr><td>${order.stock}</td><td class="amount">${order.amount * -1}</td></tr>`
            anotherHtml += g;
            justOrderHtml += h;
        })
        justOrderHtml += "</table>"
        $("#orderPreview").html(justOrderHtml)
        //////
        let checklistHtml = $(".itemCountTable table").html();
        checklistHtml += anotherHtml;
        $(".itemCountTable table").html(checklistHtml)

        colorizeChecklist();
        $("#secimToggle").show();
        if (dataExist) {
            console.log(tableData)
            // let html = $(".first-row").html();
            drawTableData(tableData);
        }
        update();

    } else {
        alert("Seçim yapmadınız")
    }


})

$("#secimToggle").click(function () {
    $(".table-container").toggle(300);
})

$(document).on('keypress', function (e) {
    if (e.which == 13 && $(".barcodeEntry .barcode").is(":focus")) {
        $(".barcodeEntry .miktar").focus();
        e.preventDefault();

    } else if (e.which == 13 && $(".miktar").is(":focus")) {
        e.preventDefault();
        $(".barcodeEntry .koli").focus();
        $(".barcodeEntry .miktar").blur(updateJustData);

    } else if (e.which == 13 && $(".koli").is(":focus")) {
        e.preventDefault();
        let firstHtml = $(".barcodeEntry table tbody").html();
        let html = `<tr><td contenteditable="true" class="barcode"></td><td class="stockcode" contenteditable="true"></td><td contenteditable="true" class="miktar"></td><td contenteditable="true" class="koli"></td></tr>`;
        firstHtml += html;
        $(".barcodeEntry table tbody").html(firstHtml)
        $(".barcodeEntry .barcode").last().focus();
        $(".barcodeEntry .barcode").blur(tableFunction)
        $("[contenteditable='true']").blur(function () {
            update();
        })
    }
});
$(".barcodeEntry .miktar").blur(updateJustData);

function updateJustData(e) {
    // console.log("update data triggering")
    // let amount = $(this).text().trim();
    // amount = parseInt(amount);
    // let stockcode = $(this).siblings(".stockcode").text().trim();
    // // if (stockcode.length > 0) {
    // //     checkListOrder.forEach(order => {
    // //         if (order.stock == stockcode) {
    // //             order.amount = order.amount + amount;
    // //         }
    // //     })
    // //     let html = "";
    // //     checkListOrder.forEach(order => {
    // //         let h = `<tr><td>${order.stock}</td><td class="amount">${order.amount}</td></tr>`;
    // //         html += h
    // //     })
    // //     $(".itemCountTable table").html(html)

    // // }

    // colorizeChecklist();
}

var tableFunction = function (e) {
    let barcode = $(this).text().trim();

    if (barcode.length > 0) {
        barcode = parseInt(barcode);
        let stockCodeElem = $(this).siblings(".stockcode")
        db.collection("products").where("barcode", "==", barcode).get().then(function (querySnapshot) {
            querySnapshot.forEach(doc => {

                let data = doc.data();

                stockCodeElem.text(data.stockCode);

            })
            if (querySnapshot.size == 0) {
                stockCodeElem.text("Barkod veritabanında bulunamadı");

            }
        }).catch(function (error) {
            console.log(error)
        })

    }
}

$(".barcodeEntry .barcode").blur(tableFunction)


function colorizeChecklist() {
    $(".itemCountTable .amount").each(function () {
        $(this).removeClass("green blue red")
        if (parseInt($(this).text()) > 0) {
            $(this).addClass("green")
        }
        if (parseInt($(this).text()) == 0) {
            $(this).addClass("blue")
        }
        if (parseInt($(this).text()) < 0) {
            $(this).addClass("red")
        }

    })
}

var changeHappened = function () {
    changeHappend = false;
    if (data) {
        if (JSON.stringify(data.tableData) != JSON.stringify(tableData)) {
            changeHappend = true;
        }
    }
    return changeHappend;
}

function update() {

    //transfer data from view to object
    tableData = [];
    $(".barcodeEntry table tr").not(".barcode-header").each(function (index) {
        let obj;
        let barcode = jQuery(this).children(".barcode").text().trim();
        if (barcode.length > 0) {
            barcode = parseInt(barcode);
        }
        let stockcode = jQuery(this).children(".stockcode").text().trim();
        let quantity = jQuery(this).children(".miktar").text().trim();
        if (quantity.length > 0) {
            quantity = parseInt(quantity);
        } else {
            quantity = 0;
        }
        let koli = jQuery(this).children(".koli").text().trim();
        //set titles
        jQuery(this).children(".barcode").attr("title", barcode);
        jQuery(this).children(".stockcode").attr("title", stockcode);
        obj = {
            barcode: barcode,
            koli: koli,
            quantity: quantity,
            stockcode: stockcode
        }
        tableData.push(obj);

    })
    // console.log("tabledata", tableData);
    // //create table mini
    let tablemini = {};
    tableData.forEach(element => {
        if (!tablemini[element.stockcode]) {
            tablemini[element.stockcode] = element.quantity;
        } else {
            tablemini[element.stockcode] += element.quantity;
        }
    })
    // console.log("tablemini", tablemini)

    // //update checklist object based on tablemini and orderdata
    checklist = {};
    justOrder.forEach(element => {
        if (tablemini[element.stock]) {
            checklist[element.stock] = tablemini[element.stock] - element.amount;
        } else {
            checklist[element.stock] = 0 - element.amount;
        }
    })
    // console.log("just order", justOrder)
    // console.log("checklist", checklist);
    //draw checklist table based on checlist object
    let html = "";
    Object.keys(checklist).forEach(function (stockcode, index) {
        html += `<tr><td>${stockcode}</td><td class="amount">${checklist[stockcode]}</td></tr>`
    })
    let checklistHtml = $(".itemCountTable table").html();
    checklistHtml += html;
    $(".itemCountTable table").html(html);
    //colorize
    colorizeChecklist();
    if (changeHappened() || data == undefined) {
        console.log("Change Happened")
        db.collection("orderData").doc(orderId).set({
            tableData: tableData,
            checklist: checklist,
            justOrder: justOrder
        }).then(function () {

        }).catch(function (error) {
            console.log(error)
        })
        $(".barcodeEntry .barcode").blur(tableFunction)
        $("[contenteditable='true']").blur(function () {
            update();
        })
        if (data) {

            data.tableData = tableData;
        }

    }

}





function drawTableData(tableData) {
    // let html = $(".barcodeEntry table .barcode-header").html();
    let tmp = $(".barcode-header").html();
    console.log(tmp)
    // html = "<tr>" + html + "</tr>"
    html = ""
    console.log(html)
    tableData.forEach(element => {
        html += `<tr><td contenteditable="true" class="barcode">${element.barcode}</td><td class="stockcode" contenteditable="true">${element.stockcode}</td><td contenteditable="true" class="miktar">${element.quantity}</td><td contenteditable="true" class="koli">${element.koli}</td></tr>`;
    })
    $(".barcodeEntry table tbody").html(html);
    // $(".barcodeEntry table tbody").prepend("<tr>" + tmp + `</tr>`);
    $(".barcodeEntry .barcode").blur(tableFunction)
    $("[contenteditable='true']").blur(function () {
        update();
    })

}

$(".barcodeEntry").contextmenu(function (e) {
    $("#delete-line").unbind();
    $(".barcodeEntry tr").removeClass("red");
    e.preventDefault();
    let row = e.target.parentNode;
    $(row).addClass("red");
    $("#delete-line").click(function () {
        console.log(row);
        $(this).unbind();
        //delete line from view
        //update
        $(row).hide(300);

        // row.remove();
        setTimeout(function () {
            row.remove();
            update();
        }, 300)


    });
    $(document).click(function () {
        $(".custom-context").hide();
        $(row).removeClass("red");
        $(this).unbind()
    })

    $(".custom-context").css("left", e.clientX + 10);
    $(".custom-context").css("top", e.clientY + 10);
    $(".custom-context").show();
})


// $(document).not(".custom-context").click(function () {
//     $(".custom-context").hide();
// })


$("[contenteditable='true']").blur(function () {
    update();
})

$(".download-excel").click(function () {

    var wb = XLSX.utils.book_new();
    var ws_name = "Sheet 1";

    /* make worksheet */
    var ws_data = [
        ["Barkod", "Stok Kodu", "Adet", "Koli"]
    ];
    tableData.forEach(element => {
        row = [element.barcode.toString(), element.stockcode, element.quantity, element.koli];
        ws_data.push(row);
    })
    var ws = XLSX.utils.aoa_to_sheet(ws_data);

    /* Add the worksheet to the workbook */
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    XLSX.writeFile(wb, 'order.xlsb');
})


// $("#products").change(function (e) {
//     var reader = new FileReader();
//     reader.readAsArrayBuffer(e.target.files[0]);
//     reader.onload = function (e) {
//         var data = new Uint8Array(reader.result);
//         var wb = XLSX.read(data, {
//             type: "array"
//         });
//         var worksheet = wb.Sheets["Halılar"];

//         let i = 1;
//         while (worksheet["A" + i]) {
//             let stockno = worksheet["A" + i].v;
//             let barcodeno = worksheet["H" + i].v;
//             db.collection("products").add({
//                 stockCode: stockno,
//                 barcode: barcodeno
//             })
//             i++;
//         }
//     }
// })