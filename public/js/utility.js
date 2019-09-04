let turkishDateFormatter = function (input, date, instance) {
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    const value = date.toLocaleDateString("tr-TR", dateOptions);
    input.value = value;
}

let turkishDays = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
let turkishMonths = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos",
    "Eylül", "Ekim", "Kasım", "Aralık"
]

let türler = ["halı", "kilim", "nevresim"]
let repeatFunction = function (fn) {

    let inter = setInterval(function () {
        if (fn()) {
            clearInterval(inter);
        }
    }, 300);
}

let firmalar;
$.ajax({
    type: "GET",
    url: "https://vitaus-erp.herokuapp.com/api/order/firm",
    success: (result) => {
        firmalar = result;
    }
})


let home_ip = "http://localhost:3001"