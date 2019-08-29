
let stokData = [
    {
        barcode: "asdf32sz",
        stockcode: "adfaas2weq",
        amount: 23
    },
    {
        barcode: "adfsdcx4t3tf",
        stockcode: "dsafvcx3",
        amount: 34
    }
]

function getStokData(){
    $.ajax({
        type: "get",
        url: "https://vitaus-erp.herokuapp.com/api/stock",
        success: result => {
            if(result){
                stokData = result;
                loadTable(stokData)
            }
        }
    })
}

function loadTable(stokData){
    let html = "";
    $("#tableData").html("");
    stokData.forEach(element => {
        html += `<tr><td>${element.barcode}</td><td>${element.stockcode}</td><td>${element.quantity}</td></tr>`
    })
    $("#tableData").html(html);
    // $("td").on("click", function(){
    //     console.log($(this).text());
    //     let val = $(this).text();
    //     let cellHtml = `<input type="text" value=${val} name="stock-amount" id="stock-amount">`;
    //     this.innerHTML = cellHtml;
    //     $(this).unbind();
    //     let newValue = $("input", this).val();
    //     console.log(newValue)
    //     $("input",this).blur(function(){    
    //         console.log("blurring")         
            
    //         this.innerHTML = newValue;
    //         $(this).unbind();
    //     })
    // })
}

function addStock(){
    let barcode = $("#barcode-input").val();
    let stockcode = $("#stockcode-input").val();
    let amount = $("#stock-amount").val();

    if(barcode && stockcode && amount){
        let json = {
            barcode: barcode,
            stockcode: stockcode,
            quantity: amount
        }
        $.ajax({
            type: "post",
            url: "https://vitaus-erp.herokuapp.com/api/stock",
            data: {
                stock: json
            },
            success: (result) => {
                console.log(result);
                getStokData();
            }
        })
    }
    else{
        alert("Tüm bilgileri giriniz.")
    }
}

$("#submit-product").click(function(e){
    e.preventDefault();
    addStock();
})

getStokData();