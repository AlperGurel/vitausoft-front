let turkishDateFormatter = function(input, date, instance){
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const value = date.toLocaleDateString("tr-TR", dateOptions);
    input.value = value;
}
let türler = ["halı", "kilim", "nevresim"]
let repeatFunction = function(fn){

    let inter = setInterval(function(){
        if(fn()){
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
