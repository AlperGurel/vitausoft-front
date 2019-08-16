$.ajax({
    type: "GET",
    url:"https://vitaus-erp.herokuapp.com/api/order/status",
    success: (result) => {
        console.log(result)
    }
})
console.log("sadfsadf");