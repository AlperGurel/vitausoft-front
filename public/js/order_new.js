$.ajax({
    type: "GET",
    url: "https://vitaus-erp.herokuapp.com/api/order",
    success: (result) => {
        drawOrders(result);
    }
})


function drawOrders(result){

    console.log(result);
}
