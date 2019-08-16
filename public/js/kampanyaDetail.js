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
let startdate;
let enddate;
let campaignData;



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


function getSingleCampaign(){
    let id = document.getElementById("id").textContent;
    let url = "https://vitaus-erp.herokuapp.com/api/campaign/" + id;
    $.ajax({
        url: url,
        success: (result) => {
            campaignData = result;
            console.log(result)
        }
    })
}

getSingleCampaign();

checkData = setInterval(() => {
    if(campaignData && firmalar){
        clearInterval(checkData)
        addDatatoForm();
        addAttachments();
    }
}, 300);


function addDatatoForm(){
    //add firmalar to options
    firmalar.forEach(element => {
        $("#firma").append(new Option(element.name, element.name))
    })
    $("#firma").val(campaignData["firm"])
    türler.forEach(element => {
        $("#type").append(new Option(element, element))
    })
    $("#type").val(campaignData["type"])
    picker1.setDate(new Date(campaignData["startDate"]), true);
    picker2.setDate(new Date(campaignData["endDate"]), true);
    $("#notes").val(campaignData["notes"])
}



function addAttachments(){
    let id = document.getElementById("id").textContent;
    let html = "";
    $(".ekler .content").html(html);
    campaignData["attachments"].forEach((attachment, index) => {
        if(attachment.url){
            let sref = firebase.storage();
            let prefurl = attachment.url;
            let pref = sref.ref(prefurl);
            pref.getDownloadURL().then(function(url){

                html += `<div class="linkcontainer" > <button id="${attachment.filename}"  onclick="deleteAttachment(this)" class="deletefile" >Sil</button><a href= ${url}>${attachment.filename}</a></div>`;
                $(".ekler .content").html(html);
            }).catch(function(error){
                console.log(error)
            })
        }
    })
    
}
let attachmentFile;
let attachmentFileName;

function deleteAttachment(obj){
    let id = document.getElementById("id").textContent;
    campaignData["attachments"].forEach((attachment, index) => {
        if(attachment.filename == obj.id){
            let sref = firebase.storage();
            let prefurl  = attachment.url;
            let pref = sref.ref(prefurl);
            pref.delete().then(function(){
                //delete attachment from database
                campaignData["attachments"].splice(index, 1);
                $.ajax({
                    type: "put", 
                    url: "https://vitaus-erp.herokuapp.com/api/campaign/" + id,
                    data: {
                        campaignData: campaignData
                    },
                    success: (result) => {
                        console.log(result)
                    }
                })
                addAttachments();
            }).catch(function(error){
                console.log(error)
            })
        }
    })
}

$("#appendfile").change(function(e){
    attachmentFileName = e.target.files[0].name;
    attachmentFile = e.target.files[0];
})

$("#appendfile-bt").click(function(e){
    if(attachmentFile){
        let id = document.getElementById("id").textContent;
        let storageurl = "/campaingAttachments/" + new Date().toJSON() + "/" + attachmentFileName;
        var storageRef = firebase.storage().ref(storageurl);
        storageRef.put(attachmentFile).then(function(snapshot){
            let newfile = {
                filename: attachmentFileName,
                url: storageurl
            };
            campaignData.attachments.push(newfile);
            $.ajax({
                type: "PUT",
                url: "https://vitaus-erp.herokuapp.com/api/campaign/" + id,
                data: {
                    campaignData: campaignData
                },
                success: (result) => {
                    console.log(result)
                    addAttachments();
                }
            })
            
        })

    }
    else{
        alert("Dosya Seçilmedi")
    }
})