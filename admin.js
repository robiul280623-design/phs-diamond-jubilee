// @ts-nocheck

/* =====================================================
   SUPABASE CONFIG
===================================================== */

const SUPABASE_URL =
    "https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";

const ADMIN_ID =
    "8ba2a77f-71b7-4a60-b45e-857a3d30cb44";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   ALUMNI ELEMENTS
===================================================== */

const table =
    document.getElementById("alumniTable");

const message =
    document.getElementById("message");

const search =
    document.getElementById("search");

const logoutBtn =
    document.getElementById("logoutBtn");

const viewModal =
    document.getElementById("viewModal");

const closeViewBtn =
    document.getElementById("closeViewBtn");

const printBtn =
    document.getElementById("printBtn");

const printIdBtn =
    document.getElementById("printIdBtn");

const details =
    document.getElementById("details");

const idInfo =
    document.getElementById("idInfo");

const qrCode =
    document.getElementById("qrcode");

const profilePhoto =
    document.getElementById("profilePhoto");

const profileNoPhoto =
    document.getElementById("profileNoPhoto");

const idPhoto =
    document.getElementById("idPhoto");

const idNoPhoto =
    document.getElementById("idNoPhoto");


/* =====================================================
   EDIT
===================================================== */

const editModal =
    document.getElementById("editModal");

const editForm =
    document.getElementById("editForm");

const closeEditBtn =
    document.getElementById("closeEditBtn");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

const saveEditBtn =
    document.getElementById("saveEditBtn");

const editMessage =
    document.getElementById("editMessage");

const editName =
    document.getElementById("editName");

const editFatherName =
    document.getElementById("editFatherName");

const editMotherName =
    document.getElementById("editMotherName");

const editSscYear =
    document.getElementById("editSscYear");

const editRoll =
    document.getElementById("editRoll");

const editRegistrationNo =
    document.getElementById("editRegistrationNo");

const editBloodGroup =
    document.getElementById("editBloodGroup");

const editEducation =
    document.getElementById("editEducation");

const editProfession =
    document.getElementById("editProfession");

const editPhone =
    document.getElementById("editPhone");

const editEmail =
    document.getElementById("editEmail");

const editAddress =
    document.getElementById("editAddress");

const editStatus =
    document.getElementById("editStatus");

const editPayment =
    document.getElementById("editPayment");


/* =====================================================
   VARIABLES
===================================================== */

let alumniData = [];

let selectedPerson = null;

let editPersonId = null;


/* =====================================================
   SAFE
===================================================== */

function safeValue(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){
        return "-";
    }

    return String(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


/* =====================================================
   CHECK ADMIN
===================================================== */

async function checkAdmin(){

    try{

        const result =
            await supabaseClient.auth.getUser();

        if(
            result.error ||
            !result.data ||
            !result.data.user
        ){

            window.location.href =
                "admin-login.html";

            return false;
        }


        if(
            result.data.user.id !==
            ADMIN_ID
        ){

            await supabaseClient.auth.signOut();

            window.location.href =
                "admin-login.html";

            return false;
        }


        return true;

    }catch(error){

        console.error(
            "ADMIN CHECK ERROR:",
            error
        );

        return false;
    }
}


/* =====================================================
   LOAD ALUMNI
===================================================== */

async function loadAlumni(){

    message.textContent =
        "Loading...";


    const result =
        await supabaseClient
            .from("alumni")
            .select("*")
            .order(
                "id",
                {
                    ascending:false
                }
            );


    if(result.error){

        console.error(
            "ALUMNI LOAD ERROR:",
            result.error
        );

        message.textContent =
            "Failed to load alumni: " +
            result.error.message;

        return;
    }


    alumniData =
        result.data || [];


    displayAlumni(
        alumniData
    );
}


/* =====================================================
   PHOTO URL
===================================================== */

function getPhotoUrl(person){

    let photo =

        person.photo_url ||
        person.photo_path ||
        person.photo ||
        person.image_url ||
        person.image ||
        person.profile_photo ||
        person.photoURL ||
        person.imageURL ||
        "";


    if(!photo){
        return "";
    }


    photo =
        String(photo).trim();


    if(
        photo.startsWith("http://") ||
        photo.startsWith("https://")
    ){

        return photo;
    }


    const bucket =
        "alumni-photos";


    if(
        photo.startsWith(
            bucket + "/"
        )
    ){

        photo =
            photo.substring(
                bucket.length + 1
            );
    }


    const result =
        supabaseClient
            .storage
            .from(bucket)
            .getPublicUrl(photo);


    return result.data.publicUrl || "";
}


/* =====================================================
   SET PHOTO
===================================================== */

function setPhoto(
    img,
    noPhoto,
    url
){

    img.style.display =
        "none";

    noPhoto.style.display =
        "none";

    img.removeAttribute("src");


    if(!url){

        noPhoto.style.display =
            "flex";

        return;
    }


    img.onload =
        function(){

            img.style.display =
                "block";

            noPhoto.style.display =
                "none";

        };


    img.onerror =
        function(){

            img.style.display =
                "none";

            noPhoto.style.display =
                "flex";

        };


    img.src =
        url;
}


/* =====================================================
   DISPLAY ALUMNI
===================================================== */

function displayAlumni(data){

    table.innerHTML = "";


    if(!data.length){

        message.textContent =
            "No registration found.";

        return;
    }


    message.textContent =
        "Showing " +
        data.length +
        " alumni.";


    data.forEach(function(person){

        const row =
            document.createElement("tr");


        const status =
            person.status ||
            "Pending";


        const payment =
            person.payment_status ||
            "Pending";


        row.innerHTML =

            "<td>" +
            safeValue(
                person.name
            ) +
            "</td>" +

            "<td>" +
            safeValue(
                person.ssc_year
            ) +
            "</td>" +

            "<td>" +
            safeValue(
                person.phone
            ) +
            "</td>" +

            "<td>" +
            safeValue(
                person.email
            ) +
            "</td>" +

            "<td>" +
            safeValue(
                person.profession
            ) +
            "</td>" +

            "<td>" +

            "<select class='statusSelect' data-id='" +
            safeValue(person.id) +
            "'>" +

            "<option value='Pending' " +
            (status === "Pending"
                ? "selected"
                : "") +
            ">Pending</option>" +

            "<option value='Approved' " +
            (status === "Approved"
                ? "selected"
                : "") +
            ">Approved</option>" +

            "<option value='Rejected' " +
            (status === "Rejected"
                ? "selected"
                : "") +
            ">Rejected</option>" +

            "</select>" +

            "</td>" +

            "<td>" +

            "<select class='paymentSelect' data-id='" +
            safeValue(person.id) +
            "'>" +

            "<option value='Pending' " +
            (payment === "Pending"
                ? "selected"
                : "") +
            ">Pending</option>" +

            "<option value='Paid' " +
            (payment === "Paid"
                ? "selected"
                : "") +
            ">Paid</option>" +

            "<option value='Failed' " +
            (payment === "Failed"
                ? "selected"
                : "") +
            ">Failed</option>" +

            "</select>" +

            "</td>" +

            "<td>" +

            "<button class='viewBtn' data-id='" +
            safeValue(person.id) +
            "'>👁️ View</button>" +

            "<button class='editBtn' data-id='" +
            safeValue(person.id) +
            "'>✏️ Edit</button>" +

            "<button class='deleteBtn' data-id='" +
            safeValue(person.id) +
            "'>🗑️ Delete</button>" +

            "</td>";


        table.appendChild(row);

    });


    activateAlumniButtons();
}


/* =====================================================
   ALUMNI BUTTONS
===================================================== */

function activateAlumniButtons(){

    document
        .querySelectorAll(".statusSelect")
        .forEach(function(select){

            select.addEventListener(
                "change",
                async function(){

                    const id =
                        this.dataset.id;

                    const result =
                        await supabaseClient
                            .from("alumni")
                            .update({
                                status:this.value
                            })
                            .eq(
                                "id",
                                id
                            );


                    if(result.error){

                        alert(
                            result.error.message
                        );

                        return;
                    }


                    const person =
                        alumniData.find(
                            x =>
                                String(x.id) ===
                                String(id)
                        );


                    if(person){
                        person.status =
                            this.value;
                    }

                }
            );

        });


    document
        .querySelectorAll(".paymentSelect")
        .forEach(function(select){

            select.addEventListener(
                "change",
                async function(){

                    const id =
                        this.dataset.id;

                    const result =
                        await supabaseClient
                            .from("alumni")
                            .update({
                                payment_status:
                                    this.value
                            })
                            .eq(
                                "id",
                                id
                            );


                    if(result.error){

                        alert(
                            result.error.message
                        );

                        return;
                    }


                    const person =
                        alumniData.find(
                            x =>
                                String(x.id) ===
                                String(id)
                        );


                    if(person){
                        person.payment_status =
                            this.value;
                    }

                }
            );

        });


    document
        .querySelectorAll(".viewBtn")
        .forEach(function(button){

            button.addEventListener(
                "click",
                function(){

                    const person =
                        alumniData.find(
                            x =>
                                String(x.id) ===
                                String(
                                    this.dataset.id
                                )
                        );

                    if(person){

                        selectedPerson =
                            person;

                        showProfile(person);
                    }

                }
            );

        });


    document
        .querySelectorAll(".editBtn")
        .forEach(function(button){

            button.addEventListener(
                "click",
                function(){

                    const person =
                        alumniData.find(
                            x =>
                                String(x.id) ===
                                String(
                                    this.dataset.id
                                )
                        );

                    if(person){
                        openEditModal(person);
                    }

                }
            );

        });


    document
        .querySelectorAll(".deleteBtn")
        .forEach(function(button){

            button.addEventListener(
                "click",
                function(){

                    deleteAlumni(
                        this.dataset.id
                    );

                }
            );

        });
}


/* =====================================================
   SHOW PROFILE
===================================================== */

function showProfile(person){

    const photoUrl =
        getPhotoUrl(person);


    setPhoto(
        profilePhoto,
        profileNoPhoto,
        photoUrl
    );


    setPhoto(
        idPhoto,
        idNoPhoto,
        photoUrl
    );


    details.innerHTML =

        "<div class='detail-box'><strong>Member ID</strong>" +
        safeValue(person.member_id) +
        "</div>" +

        "<div class='detail-box'><strong>Name</strong>" +
        safeValue(person.name) +
        "</div>" +

        "<div class='detail-box'><strong>Father's Name</strong>" +
        safeValue(person.father_name) +
        "</div>" +

        "<div class='detail-box'><strong>Mother's Name</strong>" +
        safeValue(person.mother_name) +
        "</div>" +

        "<div class='detail-box'><strong>SSC Year</strong>" +
        safeValue(person.ssc_year) +
        "</div>" +

        "<div class='detail-box'><strong>Roll</strong>" +
        safeValue(person.roll) +
        "</div>" +

        "<div class='detail-box'><strong>Registration No</strong>" +
        safeValue(person.registration_no) +
        "</div>" +

        "<div class='detail-box'><strong>Blood Group</strong>" +
        safeValue(person.blood_group) +
        "</div>" +

        "<div class='detail-box'><strong>Education</strong>" +
        safeValue(person.education) +
        "</div>" +

        "<div class='detail-box'><strong>Profession</strong>" +
        safeValue(person.profession) +
        "</div>" +

        "<div class='detail-box'><strong>Phone</strong>" +
        safeValue(person.phone) +
        "</div>" +

        "<div class='detail-box'><strong>Email</strong>" +
        safeValue(person.email) +
        "</div>" +

        "<div class='detail-box'><strong>Address</strong>" +
        safeValue(person.address) +
        "</div>" +

        "<div class='detail-box'><strong>Status</strong>" +
        safeValue(person.status) +
        "</div>";


    idInfo.innerHTML =

        "<p><strong>Name:</strong>" +
        safeValue(person.name) +
        "</p>" +

        "<p><strong>Member ID:</strong>" +
        safeValue(person.member_id) +
        "</p>" +

        "<p><strong>SSC Batch:</strong>" +
        safeValue(person.ssc_year) +
        "</p>" +

        "<p><strong>Profession:</strong>" +
        safeValue(person.profession) +
        "</p>";


    qrCode.innerHTML = "";


    const verifyUrl =
        window.location.origin +
        "/?mode=verify&id=" +
        encodeURIComponent(
            person.member_id || person.id
        );


    new QRCode(
        qrCode,
        {
            text:verifyUrl,
            width:120,
            height:120
        }
    );


    viewModal.style.display =
        "block";

    document.body.style.overflow =
        "hidden";
}


closeViewBtn.onclick =
    function(){

        viewModal.style.display =
            "none";

        document.body.style.overflow =
            "";

    };


printBtn.onclick =
    function(){
        window.print();
    };


printIdBtn.onclick =
    function(){
        window.print();
    };


/* =====================================================
   EDIT
===================================================== */

function openEditModal(person){

    editPersonId =
        person.id;


    editName.value =
        person.name || "";

    editFatherName.value =
        person.father_name || "";

    editMotherName.value =
        person.mother_name || "";

    editSscYear.value =
        person.ssc_year || "";

    editRoll.value =
        person.roll || "";

    editRegistrationNo.value =
        person.registration_no || "";

    editBloodGroup.value =
        person.blood_group || "";

    editEducation.value =
        person.education || "";

    editProfession.value =
        person.profession || "";

    editPhone.value =
        person.phone || "";

    editEmail.value =
        person.email || "";

    editAddress.value =
        person.address || "";

    editStatus.value =
        person.status || "Pending";

    editPayment.value =
        person.payment_status || "Pending";

    editMessage.textContent =
        "";

    editModal.style.display =
        "block";

    document.body.style.overflow =
        "hidden";
}


function closeEdit(){

    editModal.style.display =
        "none";

    document.body.style.overflow =
        "";

    editPersonId =
        null;
}


closeEditBtn.onclick =
    closeEdit;

cancelEditBtn.onclick =
    closeEdit;


editForm.addEventListener(
    "submit",
    async function(e){

        e.preventDefault();


        if(!editPersonId){
            return;
        }


        saveEditBtn.disabled =
            true;

        saveEditBtn.textContent =
            "Saving...";


        const updateData = {

            name:
                editName.value.trim(),

            father_name:
                editFatherName.value.trim(),

            mother_name:
                editMotherName.value.trim(),

            ssc_year:
                editSscYear.value.trim()
                ?
                Number(editSscYear.value.trim())
                :
                null,

            roll:
                editRoll.value.trim(),

            registration_no:
                editRegistrationNo.value.trim(),

            blood_group:
                editBloodGroup.value.trim(),

            education:
                editEducation.value.trim(),

            profession:
                editProfession.value.trim(),

            phone:
                editPhone.value.trim(),

            email:
                editEmail.value.trim(),

            address:
                editAddress.value.trim(),

            status:
                editStatus.value,

            payment_status:
                editPayment.value

        };


        const result =
            await supabaseClient
                .from("alumni")
                .update(updateData)
                .eq(
                    "id",
                    editPersonId
                )
                .select()
                .single();


        if(result.error){

            editMessage.textContent =
                "❌ " +
                result.error.message;

            saveEditBtn.disabled =
                false;

            saveEditBtn.textContent =
                "💾 Save Changes";

            return;
        }


        const index =
            alumniData.findIndex(
                x =>
                    String(x.id) ===
                    String(editPersonId)
            );


        if(index !== -1){

            alumniData[index] = {
                ...alumniData[index],
                ...result.data
            };

        }


        displayAlumni(
            getCurrentDisplayedData()
        );


        editMessage.textContent =
            "✅ Updated successfully.";


        setTimeout(
            closeEdit,
            500
        );


        saveEditBtn.disabled =
            false;

        saveEditBtn.textContent =
            "💾 Save Changes";

    }
);


/* =====================================================
   ALUMNI SEARCH
===================================================== */

function getCurrentDisplayedData(){

    const keyword =
        search.value
            .toLowerCase()
            .trim();


    if(!keyword){
        return alumniData;
    }


    return alumniData.filter(
        function(person){

            return [

                person.member_id,
                person.name,
                person.father_name,
                person.mother_name,
                person.ssc_year,
                person.roll,
                person.registration_no,
                person.blood_group,
                person.education,
                person.profession,
                person.phone,
                person.email,
                person.address

            ].some(
                value =>
                    String(value || "")
                        .toLowerCase()
                        .includes(keyword)
            );

        }
    );
}


search.addEventListener(
    "input",
    function(){

        displayAlumni(
            getCurrentDisplayedData()
        );

    }
);


/* =====================================================
   DELETE ALUMNI
===================================================== */

async function deleteAlumni(id){

    if(
        !confirm(
            "এই Alumni record টি Delete করতে চান?"
        )
    ){
        return;
    }


    const result =
        await supabaseClient
            .from("alumni")
            .delete()
            .eq(
                "id",
                id
            );


    if(result.error){

        alert(
            "❌ Delete failed:\n" +
            result.error.message
        );

        return;
    }


    alumniData =
        alumniData.filter(
            x =>
                String(x.id) !==
                String(id)
        );


    displayAlumni(
        getCurrentDisplayedData()
    );


    alert(
        "✅ Alumni deleted."
    );
}


/* =====================================================
   LOGOUT
===================================================== */

logoutBtn.onclick =
    async function(){

        await supabaseClient
            .auth
            .signOut();

        window.location.href =
            "admin-login.html";
    };


/* =====================================================
   MAGAZINE ADMIN
===================================================== */

const magazineTable =
    document.getElementById(
        "magazineTable"
    );

const magazineSearch =
    document.getElementById(
        "magazineSearch"
    );

const magazineMessage =
    document.getElementById(
        "magazineMessage"
    );

const magazineViewModal =
    document.getElementById(
        "magazineViewModal"
    );

const closeMagazineView =
    document.getElementById(
        "closeMagazineView"
    );

const magazineInfo =
    document.getElementById(
        "magazineInfo"
    );

const magazineContent =
    document.getElementById(
        "magazineContent"
    );

const magazineImages =
    document.getElementById(
        "magazineImages"
    );

const downloadTextBtn =
    document.getElementById(
        "downloadTextBtn"
    );

const downloadAllImagesBtn =
    document.getElementById(
        "downloadAllImagesBtn"
    );


let magazineData = [];

let selectedMagazine = null;


/* =====================================================
   LOAD MAGAZINE
===================================================== */

async function loadMagazineSubmissions(){

    magazineMessage.textContent =
        "Loading Magazine Submissions...";


    const result =
        await supabaseClient
            .from("magazine_submissions")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:false
                }
            );


    if(result.error){

        console.error(
            "MAGAZINE ERROR:",
            result.error
        );

        magazineMessage.textContent =
            "❌ " +
            result.error.message;

        return;
    }


    magazineData =
        result.data || [];


    displayMagazine(
        magazineData
    );
}


/* =====================================================
   GET MAGAZINE CONTENT
===================================================== */

function getMagazineContent(item){

    return (

        item.content ||
        item.article ||
        item.writing ||
        item.description ||
        item.text ||
        item.message ||
        item.submission ||
        ""

    );
}


/* =====================================================
   IMAGE URL
===================================================== */

function getMagazineImageUrl(value){

    if(!value){
        return "";
    }


    let url =
        String(value).trim();


    if(
        url.startsWith("http://") ||
        url.startsWith("https://")
    ){

        return url;
    }


    const buckets = [

        "magazine-files",
        "magazine-photos",
        "magazine-images"

    ];


    for(
        const bucket of buckets
    ){

        if(
            url.startsWith(
                bucket + "/"
            )
        ){

            url =
                url.substring(
                    bucket.length + 1
                );

            const result =
                supabaseClient
                    .storage
                    .from(bucket)
                    .getPublicUrl(url);

            return result.data.publicUrl || "";
        }

    }


    const result =
        supabaseClient
            .storage
            .from("magazine-files")
            .getPublicUrl(url);


    return result.data.publicUrl || "";
}


/* =====================================================
   GET ALL IMAGES
===================================================== */

function getMagazineImages(item){

    let raw =

        item.images ||
        item.image_urls ||
        item.image_paths ||
        item.photos ||
        item.photo_urls ||
        item.photo_paths ||
        item.attachments ||
        item.files ||
        item.image_url ||
        item.photo_url ||
        "";


    if(!raw){
        return [];
    }


    if(Array.isArray(raw)){

        return raw
            .map(
                function(x){

                    if(
                        typeof x ===
                        "object" &&
                        x !== null
                    ){

                        return (
                            x.url ||
                            x.path ||
                            x.publicUrl ||
                            x.name ||
                            ""
                        );

                    }

                    return x;

                }
            )
            .filter(Boolean)
            .map(
                getMagazineImageUrl
            )
            .filter(Boolean);
    }


    if(
        typeof raw === "string"
    ){

        const text =
            raw.trim();


        if(
            text.startsWith("[")
        ){

            try{

                const parsed =
                    JSON.parse(text);


                if(
                    Array.isArray(parsed)
                ){

                    return parsed
                        .map(
                            function(x){

                                if(
                                    typeof x ===
                                    "object" &&
                                    x !== null
                                ){

                                    return (
                                        x.url ||
                                        x.path ||
                                        x.publicUrl ||
                                        x.name ||
                                        ""
                                    );

                                }

                                return x;

                            }
                        )
                        .filter(Boolean)
                        .map(
                            getMagazineImageUrl
                        )
                        .filter(Boolean);
                }

            }catch(error){

                console.warn(
                    error
                );
            }

        }


        return text
            .split(/[\n,]+/)
            .map(
                x => x.trim()
            )
            .filter(Boolean)
            .map(
                getMagazineImageUrl
            )
            .filter(Boolean);
    }


    return [];
}


/* =====================================================
   DISPLAY MAGAZINE
===================================================== */

function displayMagazine(data){

    magazineTable.innerHTML = "";


    if(!data.length){

        magazineMessage.textContent =
            "No Magazine Submission Found.";

        return;
    }


    magazineMessage.textContent =
        "Showing " +
        data.length +
        " submission(s).";


    data.forEach(function(item){

        const row =
            document.createElement("tr");


        const id =
            item.id || "-";


        const name =
            item.name ||
            item.full_name ||
            item.author_name ||
            "-";


        const type =
            item.type ||
            item.category ||
            item.submission_type ||
            "-";


        const content =
            getMagazineContent(
                item
            );


        const date =
            item.created_at ||
            item.submitted_at ||
            item.date ||
            "";


        let formattedDate =
            "-";


        if(date){

            try{

                formattedDate =
                    new Date(date)
                        .toLocaleString(
                            "en-GB"
                        );

            }catch(e){

                formattedDate =
                    date;
            }

        }


        const status =
            item.status ||
            "Pending";


        row.innerHTML =

            "<td>" +
            magazineSafe(id) +
            "</td>" +

            "<td>" +
            magazineSafe(name) +
            "</td>" +

            "<td>" +
            magazineSafe(type) +
            "</td>" +

            "<td>" +
            magazineSafe(
                content
                    ? content.substring(
                        0,
                        70
                    ) + "..."
                    : "-"
            ) +
            "</td>" +

            "<td>" +
            magazineSafe(
                formattedDate
            ) +
            "</td>" +

            "<td>" +
            magazineSafe(status) +
            "</td>" +

            "<td>" +

            "<button class='magazine-action magazine-view' data-id='" +
            magazineSafe(id) +
            "'>" +
            "👁️ View" +
            "</button>" +

            "<button class='magazine-action magazine-approve' data-id='" +
            magazineSafe(id) +
            "'>" +
            "✅ Approve" +
            "</button>" +

            "<button class='magazine-action magazine-reject' data-id='" +
            magazineSafe(id) +
            "'>" +
            "❌ Reject" +
            "</button>" +

            "<button class='magazine-action magazine-delete' data-id='" +
            magazineSafe(id) +
            "'>" +
            "🗑️ Delete" +
            "</button>" +

            "</td>";


        magazineTable.appendChild(row);

    });


    activateMagazineButtons();
}


/* =====================================================
   MAGAZINE SAFE
===================================================== */

function magazineSafe(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){
        return "-";
    }


    return String(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


/* =====================================================
   MAGAZINE BUTTONS
===================================================== */

function activateMagazineButtons(){

    document
        .querySelectorAll(
            ".magazine-view"
        )
        .forEach(function(button){

            button.onclick =
                function(){

                    const item =
                        magazineData.find(
                            x =>
                                String(x.id) ===
                                String(
                                    this.dataset.id
                                )
                        );


                    if(item){

                        selectedMagazine =
                            item;

                        showMagazine(item);
                    }

                };

        });


    document
        .querySelectorAll(
            ".magazine-approve"
        )
        .forEach(function(button){

            button.onclick =
                function(){

                    updateMagazineStatus(
                        this.dataset.id,
                        "Approved"
                    );

                };

        });


    document
        .querySelectorAll(
            ".magazine-reject"
        )
        .forEach(function(button){

            button.onclick =
                function(){

                    updateMagazineStatus(
                        this.dataset.id,
                        "Rejected"
                    );

                };

        });


    document
        .querySelectorAll(
            ".magazine-delete"
        )
        .forEach(function(button){

            button.onclick =
                function(){

                    deleteMagazine(
                        this.dataset.id
                    );

                };

        });
}


/* =====================================================
   SHOW MAGAZINE
===================================================== */

function showMagazine(item){

    const name =
        item.name ||
        item.full_name ||
        item.author_name ||
        "-";


    const type =
        item.type ||
        item.category ||
        item.submission_type ||
        "-";


    magazineInfo.innerHTML =

        "<b>Submission ID:</b> " +
        magazineSafe(item.id) +

        "<br>" +

        "<b>নাম:</b> " +
        magazineSafe(name) +

        "<br>" +

        "<b>ধরন:</b> " +
        magazineSafe(type) +

        "<br>" +

        "<b>Status:</b> " +
        magazineSafe(
            item.status ||
            "Pending"
        );


    const content =
        getMagazineContent(
            item
        );


    magazineContent.textContent =
        content ||
        "কোনো লেখা পাওয়া যায়নি।";


    magazineImages.innerHTML =
        "";


    const images =
        getMagazineImages(
            item
        );


    if(!images.length){

        magazineImages.innerHTML =
            "<div class='no-images'>" +
            "কোনো ছবি পাওয়া যায়নি।" +
            "</div>";

    }else{

        images.forEach(
            function(url,index){

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "magazine-image-card";


                const img =
                    document.createElement(
                        "img"
                    );


                img.src =
                    url;


                img.alt =
                    "Magazine Image " +
                    (index + 1);


                img.onerror =
                    function(){

                        img.style.display =
                            "none";

                    };


                const button =
                    document.createElement(
                        "button"
                    );


                button.className =
                    "download-image-btn";


                button.textContent =
                    "📥 Download ছবি " +
                    (index + 1);


                button.onclick =
                    function(){

                        downloadImage(
                            url,
                            index + 1
                        );

                    };


                card.appendChild(
                    img
                );

                card.appendChild(
                    button
                );


                magazineImages.appendChild(
                    card
                );

            }
        );

    }


    magazineViewModal.style.display =
        "block";


    document.body.style.overflow =
        "hidden";
}


/* =====================================================
   CLOSE MAGAZINE
===================================================== */

closeMagazineView.onclick =
    function(){

        magazineViewModal.style.display =
            "none";

        document.body.style.overflow =
            "";

    };


/* =====================================================
   DOWNLOAD TEXT
===================================================== */

downloadTextBtn.onclick =
    function(){

        if(!selectedMagazine){
            return;
        }


        const name =
            selectedMagazine.name ||
            selectedMagazine.full_name ||
            selectedMagazine.author_name ||
            "Unknown";


        const type =
            selectedMagazine.type ||
            selectedMagazine.category ||
            selectedMagazine.submission_type ||
            "Magazine";


        const content =
            getMagazineContent(
                selectedMagazine
            );


        const text =

            "PAHARCHANDA HIGH SCHOOL\n" +
            "ALUMNI MAGAZINE\n" +
            "====================================\n\n" +

            "Submission ID: " +
            (selectedMagazine.id || "-") +
            "\n" +

            "Name: " +
            name +
            "\n" +

            "Type: " +
            type +
            "\n\n" +

            "------------------------------------\n\n" +

            content;


        const blob =
            new Blob(
                [text],
                {
                    type:
                    "text/plain;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const a =
            document.createElement(
                "a"
            );


        a.href =
            url;

        a.download =
            "magazine-" +
            (selectedMagazine.id ||
                "submission") +
            ".txt";


        document.body.appendChild(a);

        a.click();

        a.remove();


        URL.revokeObjectURL(
            url
        );
    };


/* =====================================================
   DOWNLOAD SINGLE IMAGE
===================================================== */

async function downloadImage(
    url,
    number
){

    try{

        const response =
            await fetch(url);


        if(!response.ok){

            throw new Error(
                "Download failed"
            );
        }


        const blob =
            await response.blob();


        const blobUrl =
            URL.createObjectURL(
                blob
            );


        const a =
            document.createElement(
                "a"
            );


        a.href =
            blobUrl;


        a.download =
            "magazine-image-" +
            number +
            ".jpg";


        document.body.appendChild(a);

        a.click();

        a.remove();


        URL.revokeObjectURL(
            blobUrl
        );


    }catch(error){

        console.error(
            "IMAGE DOWNLOAD ERROR:",
            error
        );


        window.open(
            url,
            "_blank"
        );
    }
}


/* =====================================================
   DOWNLOAD ALL IMAGES ZIP
===================================================== */

downloadAllImagesBtn.onclick =
    async function(){

        if(!selectedMagazine){

            return;
        }


        const images =
            getMagazineImages(
                selectedMagazine
            );


        if(!images.length){

            alert(
                "কোনো ছবি পাওয়া যায়নি।"
            );

            return;
        }


        downloadAllImagesBtn.disabled =
            true;

        downloadAllImagesBtn.textContent =
            "⏳ Preparing ZIP...";


        try{

            const zip =
                new JSZip();


            for(
                let i = 0;
                i < images.length;
                i++
            ){

                const response =
                    await fetch(
                        images[i]
                    );


                if(!response.ok){
                    continue;
                }


                const blob =
                    await response.blob();


                zip.file(
                    "magazine-image-" +
                    (i + 1) +
                    ".jpg",
                    blob
                );

            }


            const zipBlob =
                await zip.generateAsync(
                    {
                        type:"blob"
                    }
                );


            const url =
                URL.createObjectURL(
                    zipBlob
                );


            const a =
                document.createElement(
                    "a"
                );


            a.href =
                url;


            a.download =
                "magazine-images-" +
                (
                    selectedMagazine.id ||
                    "submission"
                ) +
                ".zip";


            document.body.appendChild(a);

            a.click();

            a.remove();


            URL.revokeObjectURL(
                url
            );


        }catch(error){

            console.error(
                "ZIP ERROR:",
                error
            );


            alert(
                "❌ সব ছবি Download করা যায়নি।"
            );

        }


        downloadAllImagesBtn.disabled =
            false;

        downloadAllImagesBtn.textContent =
            "📦 সব ছবি Download";
    };


/* =====================================================
   APPROVE / REJECT
===================================================== */

async function updateMagazineStatus(
    id,
    status
){

    const action =
        status === "Approved"
            ? "Approve"
            : "Reject";


    if(
        !confirm(
            "এই submission টি " +
            action +
            " করতে চান?"
        )
    ){

        return;
    }


    magazineMessage.textContent =
        "Updating...";


    const result =
        await supabaseClient
            .from(
                "magazine_submissions"
            )
            .update({
                status:status
            })
            .eq(
                "id",
                id
            );


    if(result.error){

        console.error(
            result.error
        );


        alert(
            "❌ Status update failed:\n" +
            result.error.message
        );

        return;
    }


    const item =
        magazineData.find(
            x =>
                String(x.id) ===
                String(id)
        );


    if(item){

        item.status =
            status;
    }


    displayMagazine(
        getMagazineDisplayedData()
    );


    magazineMessage.textContent =
        "✅ Submission " +
        status +
        " হয়েছে।";
}


/* =====================================================
   DELETE MAGAZINE
===================================================== */

async function deleteMagazine(id){

    if(
        !confirm(
            "এই Magazine Submission স্থায়ীভাবে Delete করতে চান?"
        )
    ){

        return;
    }


    const result =
        await supabaseClient
            .from(
                "magazine_submissions"
            )
            .delete()
            .eq(
                "id",
                id
            );


    if(result.error){

        alert(
            "❌ Delete failed:\n" +
            result.error.message
        );

        return;
    }


    magazineData =
        magazineData.filter(
            x =>
                String(x.id) !==
                String(id)
        );


    displayMagazine(
        getMagazineDisplayedData()
    );


    alert(
        "✅ Submission deleted."
    );
}


/* =====================================================
   MAGAZINE SEARCH
===================================================== */

function getMagazineDisplayedData(){

    const keyword =
        magazineSearch.value
            .toLowerCase()
            .trim();


    if(!keyword){

        return magazineData;
    }


    return magazineData.filter(
        function(item){

            return [

                item.id,
                item.name,
                item.full_name,
                item.author_name,
                item.type,
                item.category,
                item.submission_type,
                item.status,
                getMagazineContent(item)

            ].some(
                value =>
                    String(value || "")
                        .toLowerCase()
                        .includes(keyword)
            );

        }
    );
}


magazineSearch.addEventListener(
    "input",
    function(){

        displayMagazine(
            getMagazineDisplayedData()
        );

    }
);


/* =====================================================
   START
===================================================== */

async function startAdmin(){

    const isAdmin =
        await checkAdmin();


    if(!isAdmin){
        return;
    }


    await loadAlumni();

    await loadMagazineSubmissions();
}


startAdmin();