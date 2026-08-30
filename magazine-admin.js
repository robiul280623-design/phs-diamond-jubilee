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
   ELEMENTS
===================================================== */

const table =
    document.getElementById("submissionTable");

const message =
    document.getElementById("message");

const search =
    document.getElementById("search");

const logoutBtn =
    document.getElementById("logoutBtn");

const backBtn =
    document.getElementById("backBtn");

const viewModal =
    document.getElementById("viewModal");

const closeModal =
    document.getElementById("closeModal");

const modalClose =
    document.getElementById("modalClose");

const modalApprove =
    document.getElementById("modalApprove");

const modalReject =
    document.getElementById("modalReject");

const modalDelete =
    document.getElementById("modalDelete");

const modalTitle =
    document.getElementById("modalTitle");

const modalInfo =
    document.getElementById("modalInfo");

const modalContent =
    document.getElementById("modalContent");

const photoGrid =
    document.getElementById("photoGrid");


/* =====================================================
   VARIABLES
===================================================== */

let submissions = [];

let selectedSubmission = null;


/* =====================================================
   SAFE HTML
===================================================== */

function escapeHTML(value){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }

    return String(value)

        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


/* =====================================================
   FIND VALUE
===================================================== */

function getValue(
    row,
    keys
){

    for(
        const key of keys
    ){

        if(
            row[key] !== undefined &&
            row[key] !== null &&
            String(row[key]).trim() !== ""
        ){

            return row[key];

        }

    }

    return "";
}


/* =====================================================
   CHECK ADMIN
===================================================== */

async function checkAdmin(){

    try{

        const result =
            await supabaseClient
                .auth
                .getUser();


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

            await supabaseClient
                .auth
                .signOut();

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

        message.textContent =
            "Admin verification failed.";

        return false;
    }
}


/* =====================================================
   LOAD SUBMISSIONS
===================================================== */

async function loadSubmissions(){

    message.textContent =
        "Loading magazine submissions...";


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
            "MAGAZINE LOAD ERROR:",
            result.error
        );

        message.textContent =
            "❌ Load failed: " +
            result.error.message;

        table.innerHTML =
            "<tr><td colspan='7' class='empty'>" +
            escapeHTML(result.error.message) +
            "</td></tr>";

        return;
    }


    submissions =
        result.data || [];


    displaySubmissions(
        submissions
    );
}


/* =====================================================
   STATUS
===================================================== */

function getStatus(row){

    return getValue(
        row,
        [
            "status",
            "approval_status",
            "publish_status",
            "submission_status"
        ]
    ) || "Pending";
}


/* =====================================================
   NAME
===================================================== */

function getAuthor(row){

    return getValue(
        row,
        [
            "name",
            "author_name",
            "full_name",
            "author",
            "submitted_by"
        ]
    ) || "-";
}


/* =====================================================
   TITLE
===================================================== */

function getTitle(row){

    return getValue(
        row,
        [
            "title",
            "article_title",
            "subject",
            "headline"
        ]
    ) || "Untitled Submission";
}


/* =====================================================
   CONTENT
===================================================== */

function getContent(row){

    return getValue(
        row,
        [
            "content",
            "article",
            "description",
            "message",
            "submission_text",
            "text",
            "body"
        ]
    ) || "";
}


/* =====================================================
   PHONE
===================================================== */

function getPhone(row){

    return getValue(
        row,
        [
            "phone",
            "mobile",
            "mobile_number",
            "contact"
        ]
    ) || "-";
}


/* =====================================================
   EMAIL
===================================================== */

function getEmail(row){

    return getValue(
        row,
        [
            "email",
            "author_email"
        ]
    ) || "-";
}


/* =====================================================
   DATE
===================================================== */

function getDate(row){

    const value =
        getValue(
            row,
            [
                "created_at",
                "submitted_at",
                "created",
                "date"
            ]
        );


    if(!value){

        return "-";
    }


    try{

        return new Date(value)
            .toLocaleString(
                "en-GB"
            );

    }catch{

        return String(value);

    }
}


/* =====================================================
   DISPLAY
===================================================== */

function displaySubmissions(data){

    table.innerHTML = "";


    if(!data.length){

        message.textContent =
            "কোনো Magazine Submission পাওয়া যায়নি.";

        table.innerHTML =
            "<tr><td colspan='7' class='empty'>" +
            "📰 কোনো submission নেই।" +
            "</td></tr>";

        return;
    }


    message.textContent =
        "Showing " +
        data.length +
        " submission(s).";


    data.forEach(
        function(row){

            const tr =
                document.createElement("tr");


            const status =
                getStatus(row);


            let statusClass =
                "pending";


            if(
                status.toLowerCase()
                    === "approved"
            ){

                statusClass =
                    "approved";

            }else if(
                status.toLowerCase()
                    === "rejected"
            ){

                statusClass =
                    "rejected";

            }


            const id =
                row.id || "";


            tr.innerHTML =

                "<td>" +
                escapeHTML(
                    String(id)
                    .substring(0,8)
                ) +
                "..." +
                "</td>" +

                "<td>" +
                escapeHTML(
                    getAuthor(row)
                ) +
                "</td>" +

                "<td>" +
                escapeHTML(
                    getTitle(row)
                ) +
                "</td>" +

                "<td>" +
                escapeHTML(
                    getPhone(row)
                ) +
                "</td>" +

                "<td>" +
                escapeHTML(
                    getDate(row)
                ) +
                "</td>" +

                "<td>" +

                "<span class='status " +
                statusClass +
                "'>" +

                escapeHTML(status) +

                "</span>" +

                "</td>" +

                "<td>" +

                "<button " +
                "class='action viewBtn' " +
                "data-id='" +
                escapeHTML(id) +
                "'>" +
                "👁️ View" +
                "</button>" +

                "<button " +
                "class='action approveBtn' " +
                "data-id='" +
                escapeHTML(id) +
                "'>" +
                "✅ Approve" +
                "</button>" +

                "<button " +
                "class='action rejectBtn' " +
                "data-id='" +
                escapeHTML(id) +
                "'>" +
                "❌ Reject" +
                "</button>" +

                "<button " +
                "class='action deleteBtn' " +
                "data-id='" +
                escapeHTML(id) +
                "'>" +
                "🗑️ Delete" +
                "</button>" +

                "</td>";


            table.appendChild(tr);

        }
    );


    activateButtons();
}


/* =====================================================
   FIND SUBMISSION
===================================================== */

function findSubmission(id){

    return submissions.find(
        function(row){

            return String(row.id) ===
                   String(id);

        }
    );
}


/* =====================================================
   BUTTONS
===================================================== */

function activateButtons(){

    document
        .querySelectorAll(".viewBtn")
        .forEach(
            function(button){

                button.onclick =
                    function(){

                        const row =
                            findSubmission(
                                this.dataset.id
                            );


                        if(row){

                            selectedSubmission =
                                row;

                            openSubmission(row);

                        }

                    };

            }
        );


    document
        .querySelectorAll(".approveBtn")
        .forEach(
            function(button){

                button.onclick =
                    function(){

                        approveSubmission(
                            this.dataset.id
                        );

                    };

            }
        );


    document
        .querySelectorAll(".rejectBtn")
        .forEach(
            function(button){

                button.onclick =
                    function(){

                        rejectSubmission(
                            this.dataset.id
                        );

                    };

            }
        );


    document
        .querySelectorAll(".deleteBtn")
        .forEach(
            function(button){

                button.onclick =
                    function(){

                        deleteSubmission(
                            this.dataset.id
                        );

                    };

            }
        );
}


/* =====================================================
   OPEN SUBMISSION
===================================================== */

function openSubmission(row){

    modalTitle.textContent =
        getTitle(row);


    modalInfo.innerHTML =

        "<div class='info-box'>" +
        "<strong>Author</strong>" +
        escapeHTML(
            getAuthor(row)
        ) +
        "</div>" +

        "<div class='info-box'>" +
        "<strong>Phone</strong>" +
        escapeHTML(
            getPhone(row)
        ) +
        "</div>" +

        "<div class='info-box'>" +
        "<strong>Email</strong>" +
        escapeHTML(
            getEmail(row)
        ) +
        "</div>" +

        "<div class='info-box'>" +
        "<strong>Submission ID</strong>" +
        escapeHTML(
            row.id || "-"
        ) +
        "</div>" +

        "<div class='info-box'>" +
        "<strong>Status</strong>" +
        escapeHTML(
            getStatus(row)
        ) +
        "</div>" +

        "<div class='info-box'>" +
        "<strong>Submitted</strong>" +
        escapeHTML(
            getDate(row)
        ) +
        "</div>";


    modalContent.textContent =
        getContent(row) ||
        "কোনো লেখা পাওয়া যায়নি।";


    showPhotos(row);


    viewModal.style.display =
        "block";


    document.body.style.overflow =
        "hidden";
}


/* =====================================================
   GET PHOTOS
===================================================== */

function getPhotos(row){

    const value =
        getValue(
            row,
            [
                "images",
                "photos",
                "image_urls",
                "photo_urls",
                "photo_paths",
                "image_paths",
                "files",
                "attachments",
                "photo_url",
                "image_url"
            ]
        );


    if(!value){

        return [];
    }


    if(
        Array.isArray(value)
    ){

        return value;

    }


    if(
        typeof value === "object"
    ){

        return Object.values(value);

    }


    let text =
        String(value).trim();


    /* JSON ARRAY */

    if(
        text.startsWith("[") &&
        text.endsWith("]")
    ){

        try{

            const parsed =
                JSON.parse(text);


            if(
                Array.isArray(parsed)
            ){

                return parsed;

            }

        }catch(error){

            console.warn(
                "Photo JSON parse failed",
                error
            );

        }

    }


    /* COMMA / NEWLINE */

    return text
        .split(/[\n,]+/)
        .map(
            item =>
                item.trim()
        )
        .filter(Boolean);
}


/* =====================================================
   PHOTO URL
===================================================== */

function makePhotoUrl(value){

    if(
        !value
    ){

        return "";
    }


    if(
        typeof value === "object"
    ){

        value =
            value.url ||
            value.publicUrl ||
            value.path ||
            value.name ||
            "";

    }


    let photo =
        String(value).trim();


    if(!photo){

        return "";
    }


    if(
        photo.startsWith(
            "http://"
        ) ||
        photo.startsWith(
            "https://"
        )
    ){

        return photo;

    }


    /* Try common magazine buckets */

    const buckets = [

        "magazine-photos",
        "magazine-images",
        "alumni-photos"

    ];


    for(
        const bucket of buckets
    ){

        let path =
            photo;


        if(
            path.startsWith(
                bucket + "/"
            )
        ){

            path =
                path.substring(
                    bucket.length + 1
                );

        }


        const result =
            supabaseClient
                .storage
                .from(bucket)
                .getPublicUrl(path);


        if(
            result &&
            result.data &&
            result.data.publicUrl
        ){

            return result.data.publicUrl;

        }

    }


    return photo;
}


/* =====================================================
   SHOW PHOTOS
===================================================== */

function showPhotos(row){

    photoGrid.innerHTML = "";


    const photos =
        getPhotos(row);


    if(!photos.length){

        photoGrid.innerHTML =
            "<div class='info-box'>" +
            "🖼️ কোনো ছবি পাওয়া যায়নি।" +
            "</div>";

        return;
    }


    photos.forEach(
        function(photo,index){

            const url =
                makePhotoUrl(photo);


            if(!url){

                return;
            }


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "photo-item";


            div.innerHTML =

                "<img " +
                "src='" +
                escapeHTML(url) +
                "' " +
                "alt='Magazine Photo " +
                (index + 1) +
                "' " +

                "onerror=\"this.style.display='none';\">" +

                "<a " +
                "href='" +
                escapeHTML(url) +
                "' " +
                "target='_blank'>" +

                "🔗 Open Image" +

                "</a>";


            photoGrid.appendChild(
                div
            );

        }
    );
}


/* =====================================================
   UPDATE STATUS
===================================================== */

async function updateStatus(
    id,
    status
){

    if(!id){

        return false;
    }


    message.textContent =
        "Updating status...";


    /*
      প্রথমে status column ব্যবহার করা হবে।
    */

    const result =
        await supabaseClient
            .from("magazine_submissions")
            .update({
                status:status
            })
            .eq(
                "id",
                id
            );


    if(result.error){

        console.error(
            "STATUS UPDATE ERROR:",
            result.error
        );


        alert(
            "❌ Status update failed:\n\n" +
            result.error.message
        );


        return false;
    }


    const row =
        findSubmission(id);


    if(row){

        row.status =
            status;

    }


    displaySubmissions(
        getCurrentDisplayedData()
    );


    if(
        selectedSubmission &&
        String(selectedSubmission.id)
        ===
        String(id)
    ){

        selectedSubmission.status =
            status;

        openSubmission(
            selectedSubmission
        );

    }


    message.textContent =
        "✅ Status updated successfully.";


    return true;
}


/* =====================================================
   APPROVE
===================================================== */

async function approveSubmission(id){

    const row =
        findSubmission(id);


    if(!row){

        return;
    }


    const title =
        getTitle(row);


    if(
        !confirm(
            "এই submission-টি Approve করতে চান?\n\n" +
            title
        )
    ){

        return;
    }


    await updateStatus(
        id,
        "Approved"
    );
}


/* =====================================================
   REJECT
===================================================== */

async function rejectSubmission(id){

    const row =
        findSubmission(id);


    if(!row){

        return;
    }


    const title =
        getTitle(row);


    if(
        !confirm(
            "এই submission-টি Reject করতে চান?\n\n" +
            title
        )
    ){

        return;
    }


    await updateStatus(
        id,
        "Rejected"
    );
}


/* =====================================================
   DELETE
===================================================== */

async function deleteSubmission(id){

    const row =
        findSubmission(id);


    if(!row){

        return;
    }


    if(
        !confirm(
            "⚠️ এই submission স্থায়ীভাবে Delete করতে চান?\n\n" +
            getTitle(row) +
            "\n\nএই কাজ Undo করা যাবে না।"
        )
    ){

        return;
    }


    message.textContent =
        "Deleting...";


    const result =
        await supabaseClient
            .from("magazine_submissions")
            .delete()
            .eq(
                "id",
                id
            );


    if(result.error){

        console.error(
            "DELETE ERROR:",
            result.error
        );


        alert(
            "❌ Delete failed:\n\n" +
            result.error.message
        );


        return;
    }


    submissions =
        submissions.filter(
            function(item){

                return String(item.id) !==
                       String(id);

            }
        );


    selectedSubmission =
        null;


    displaySubmissions(
        getCurrentDisplayedData()
    );


    viewModal.style.display =
        "none";


    message.textContent =
        "✅ Submission deleted successfully.";
}


/* =====================================================
   SEARCH
===================================================== */

function getCurrentDisplayedData(){

    const keyword =
        search.value
            .toLowerCase()
            .trim();


    if(!keyword){

        return submissions;
    }


    return submissions.filter(
        function(row){

            return [

                row.id,

                getAuthor(row),

                getTitle(row),

                getPhone(row),

                getEmail(row),

                getContent(row),

                getStatus(row)

            ].some(
                function(value){

                    return String(
                        value || ""
                    )
                    .toLowerCase()
                    .includes(
                        keyword
                    );

                }
            );

        }
    );
}


search.addEventListener(
    "input",
    function(){

        displaySubmissions(
            getCurrentDisplayedData()
        );

    }
);


/* =====================================================
   MODAL CLOSE
===================================================== */

function closeSubmissionModal(){

    viewModal.style.display =
        "none";

    document.body.style.overflow =
        "";

    selectedSubmission =
        null;
}


closeModal.addEventListener(
    "click",
    closeSubmissionModal
);


modalClose.addEventListener(
    "click",
    closeSubmissionModal
);


viewModal.addEventListener(
    "click",
    function(event){

        if(
            event.target ===
            viewModal
        ){

            closeSubmissionModal();

        }

    }
);


/* =====================================================
   MODAL APPROVE
===================================================== */

modalApprove.addEventListener(
    "click",
    async function(){

        if(
            selectedSubmission
        ){

            await approveSubmission(
                selectedSubmission.id
            );

        }

    }
);


/* =====================================================
   MODAL REJECT
===================================================== */

modalReject.addEventListener(
    "click",
    async function(){

        if(
            selectedSubmission
        ){

            await rejectSubmission(
                selectedSubmission.id
            );

        }

    }
);


/* =====================================================
   MODAL DELETE
===================================================== */

modalDelete.addEventListener(
    "click",
    async function(){

        if(
            selectedSubmission
        ){

            await deleteSubmission(
                selectedSubmission.id
            );

        }

    }
);


/* =====================================================
   LOGOUT
===================================================== */

logoutBtn.addEventListener(
    "click",
    async function(){

        await supabaseClient
            .auth
            .signOut();

        window.location.href =
            "admin-login.html";

    }
);


/* =====================================================
   BACK TO ALUMNI ADMIN
===================================================== */

backBtn.addEventListener(
    "click",
    function(){

        window.location.href =
            "admin.html";

    }
);


/* =====================================================
   START
===================================================== */

(async function(){

    const isAdmin =
        await checkAdmin();


    if(!isAdmin){

        return;
    }


    await loadSubmissions();

})();