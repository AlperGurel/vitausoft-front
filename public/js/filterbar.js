$.ajax({
    type: "GET",
    url: "https://vitaus-erp.herokuapp.com/api/order/firm",
    success: (result) => {
        result.forEach(element => {
            $("#filtercompany").append(new Option(element.name, element.name))
        })
    }
})

$.ajax({
    type: "GET",
    url: "https://vitaus-erp.herokuapp.com/api/order/status",
    success: (result) => {
        result.forEach(element => {
            $("#filterstatus").append(new Option(element, element))
        })
    }
})
