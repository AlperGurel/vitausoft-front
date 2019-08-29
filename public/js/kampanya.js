let campaignData = [{
        firm: "vivre",
        type: "halı",
        startDate: "2019-08-11T09:21:02.060Z",
        endDate: "2019-08-11T09:21:02.060Z",
        notes: "This is a beautiful test",
        attachments: [{
            url: "5d30bf18681fb9001767cad4/test2.xlsx",
            filename: "test2.xlsx"
        }]
    },
    {
        firm: "vivre",
        type: "halı",
        startDate: "2019-08-11T09:21:02.060Z",
        endDate: "2019-08-11T09:21:02.060Z",
        notes: "This is a beautiful test",
        attachments: [{
            url: "5d30bf18681fb9001767cad4/test2.xlsx",
            filename: "test2.xlsx"
        }]
    },
    {
        firm: "vivre",
        type: "halı",
        startDate: "2019-08-11T09:21:02.060Z",
        endDate: "2019-08-11T09:21:02.060Z",
        notes: "This is a beautiful test",
        attachments: [{
            url: "5d30bf18681fb9001767cad4/test2.xlsx",
            filename: "test2.xlsx"
        }]
    },
    {
        firm: "vivre",
        type: "halı",
        startDate: "2019-08-11T09:21:02.060Z",
        endDate: "2019-08-11T09:21:02.060Z",
        notes: "This is a beautiful test",
        attachments: [{
            url: "5d30bf18681fb9001767cad4/test2.xlsx",
            filename: "test2.xlsx"
        }]
    },
    {
        firm: "vivre",
        type: "halı",
        startDate: "2019-08-11T09:21:02.060Z",
        endDate: "2019-08-11T09:21:02.060Z",
        notes: "This is a beautiful test",
        attachments: [{
            url: "5d30bf18681fb9001767cad4/test2.xlsx",
            filename: "test2.xlsx"
        }]
    }
]

let startdate;
let enddate;
let attachmentFileName;
let attachmentFile;

$.ajax({
    type: "get",
    url: "https://vitaus-erp.herokuapp.com/api/campaign",
    success: (result) => {
        campaignData = result;
        console.log(campaignData)
        loadTable(campaignData);
    }
})



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

function loadTable(campaignData) {
    let html = ""
    $("#tableData").html("");
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    campaignData.forEach(element => {
        let startdate = new Date(element.startDate).toLocaleDateString("tr-TR", dateOptions);
        let enddate = new Date(element.endDate).toLocaleDateString("tr-TR", dateOptions);
        html += `<tr><td>${element.firm}</td><td>${element.type}</td><td>${startdate}</td><td>${enddate}</td>`
    })
    $("#tableData").html(html)

    $("tr").on("click", function () {
        console.log(campaignData[this.rowIndex - 1]["_id"])
        let url = "http://localhost:3001/kampanya/" + campaignData[this.rowIndex - 1]["_id"];
        window.location = url;
    })
}


const picker1 = datepicker("#startdate", {
    formatter: turkishDateFormatter,
    onSelect: (instance, data) => {
        startdate = data;
    }
});
const picker2 = datepicker("#enddate", {
    formatter: turkishDateFormatter,
    onSelect: (instance, data) => {
        enddate = data
    }
});

function loadFirmaSelect() {
    if (firmalar) {
        firmalar.forEach(element => {
            $("#firma").append(new Option(element.name, element.name))
        })
        return true;
    }
    return false;
}

function loadTypeSelect() {
    if (türler) {
        türler.forEach(element => {
            $("#type").append(new Option(element, element))
        })
    }
}

$("#campaignForm button").click((e) => {
    e.preventDefault();
    createFormJson();
    $("#campaignForm").trigger("reset")
    startdate = undefined;
    enddate = undefined;
    attachmentFile = undefined;
    attachmentFileName = undefined;
})

let createFormJson = function () {
    let json = {
        tid: new Date().toJSON(),
        firm: $("#firma option:checked").val(),
        type: $("#type option:checked").val(),
        startDate: new Date(startdate),
        endDate: new Date(enddate),
        notes: $("#notes").val(),
        attachments: [{
            url: "",
            filename: attachmentFileName
        }]
    }
    console.log(attachmentFileName);
    //no validation for now
    if (json.attachments[0].filename) {
        let storageurl = "/campaingAttachments/" + json.tid + "/" + json.attachments[0].filename;
        json["attachments"][0].url = storageurl;
        var storageRef = firebase.storage().ref(storageurl);
        storageRef.put(attachmentFile).then(function (snapshot) {
            $.ajax({
                type: "post",
                url: "https://vitaus-erp.herokuapp.com/api/campaign",
                data: {
                    campaign: json
                },
                success: (result) => {
                    console.log(result)
                    campaignData.push(result);
                    loadTable(campaignData);
                }
            })
        });
    } else {
        $.ajax({
            type: "post",
            url: "https://vitaus-erp.herokuapp.com/api/campaign",
            data: {
                campaign: json
            },
            success: (result) => {
                console.log(result);
                campaignData.push(result);
                loadTable(campaignData);
            }
        })
    }
}

$("#ekler").change(function (e) {
    attachmentFileName = e.target.files[0].name;
    attachmentFile = e.target.files[0];
})

loadTypeSelect();
repeatFunction(loadFirmaSelect);



// loadTable(campaignData);