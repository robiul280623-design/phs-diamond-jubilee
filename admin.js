/* =========================================================
   PAHARCHANDA HIGH SCHOOL
   ADMIN DASHBOARD - COMPLETE JS
   Compatible with current admin.html

   FEATURES
   ---------------------------------------------------------
   • Dashboard
   • Member Directory
   • Payment Management
   • Batch Management
   • ID Cards
   • Food Tokens
   • Attendance
   • Member Photo Bank
   • Magazine Writing
   • Magazine Photos
   • Batch-wise Magazine Filter
   • Magazine View
   • Magazine Download
   • Magazine Print / PDF
   • Member Photo A4 Print / PDF
   • Reports
   • Dustbin
   ---------------------------------------------------------
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";

const {
    createClient
} = window.supabase;

const db =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
            auth:{
                persistSession:false,
                autoRefreshToken:false,
                detectSessionInUrl:false
            }
        }
    );


/* =========================================================
   GLOBAL DATA
========================================================= */

let alumniData = [];
let magazineData = [];

let filteredIdMembers = [];
let filteredFoodMembers = [];

let currentMagType = "all";

let countdownTimer = null;

let selectedIdMembers = [];
let selectedFoodMembers = [];


/* =========================================================
   BASIC HELPERS
========================================================= */

function $(id){
    return document.getElementById(id);
}


function safe(value){
    if(
        value === null ||
        value === undefined
    ){
        return "";
    }

    return String(value);
}


function safeText(value){
    return safe(value).trim();
}


function normalize(value){
    return safe(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g," ");
}


function sameValue(a,b){

    return normalize(a) ===
           normalize(b);

}


function firstValue(
    obj,
    keys,
    fallback = ""
){

    if(!obj){
        return fallback;
    }

    for(const key of keys){

        const value =
            obj[key];

        if(
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        ){
            return value;
        }

    }

    return fallback;
}


function num(value){

    const n =
        Number(
            String(value ?? "")
                .replace(/[^\d.-]/g,"")
        );

    return Number.isFinite(n)
        ? n
        : 0;
}


function formatMoney(value){

    return "৳" +
        num(value).toLocaleString(
            "en-BD"
        );
}


function formatDate(value){

    if(!value){
        return "-";
    }

    try{

        const d =
            new Date(value);

        if(
            Number.isNaN(
                d.getTime()
            )
        ){
            return safe(value);
        }

        return d.toLocaleString(
            "en-BD",
            {
                year:"numeric",
                month:"short",
                day:"numeric",
                hour:"2-digit",
                minute:"2-digit"
            }
        );

    }catch(error){

        return safe(value);

    }
}


function nowDate(){

    return new Date()
        .toLocaleString(
            "en-BD"
        );

}


function setText(
    id,
    value
){

    const el = $(id);

    if(el){
        el.textContent =
            safe(value);
    }

}


function escapeHTML(value){

    return safe(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


/* =========================================================
   ARRAY / JSON HELPER
========================================================= */

function parseArrayValue(value){

    if(Array.isArray(value)){

        return value
            .filter(Boolean);

    }

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){
        return [];
    }

    if(typeof value === "string"){

        const text =
            value.trim();

        if(!text){
            return [];
        }

        try{

            const parsed =
                JSON.parse(text);

            if(Array.isArray(parsed)){

                return parsed
                    .filter(Boolean);

            }

            if(
                typeof parsed === "string" &&
                parsed.trim()
            ){

                return [
                    parsed.trim()
                ];

            }

        }catch(error){}

        return text
            .split(/\r?\n|,/)
            .map(v => v.trim())
            .filter(Boolean);
    }

    return [value];
}


/* =========================================================
   STORAGE URL HELPERS
========================================================= */

function cleanStoragePath(
    path,
    bucket
){

    if(!path){
        return "";
    }

    let value =
        String(path).trim();

    value =
        value.replace(
            /^["']|["']$/g,
            ""
        );


    if(
        value.startsWith(
            "http://"
        ) ||
        value.startsWith(
            "https://"
        ) ||
        value.startsWith(
            "data:"
        )
    ){

        return value;

    }


    const publicPrefix =
        "/storage/v1/object/public/" +
        bucket +
        "/";


    if(
        value.includes(
            publicPrefix
        )
    ){

        value =
            value.substring(
                value.indexOf(
                    publicPrefix
                ) +
                publicPrefix.length
            );

    }


    const bucketPrefix =
        bucket + "/";


    if(
        value.startsWith(
            bucketPrefix
        )
    ){

        value =
            value.substring(
                bucketPrefix.length
            );

    }


    return value.replace(
        /^\/+/,
        ""
    );

}


function storagePublicUrl(
    bucket,
    path
){

    if(!path){
        return "";
    }

    const cleaned =
        cleanStoragePath(
            path,
            bucket
        );

    if(!cleaned){
        return "";
    }


    if(
        cleaned.startsWith(
            "http://"
        ) ||
        cleaned.startsWith(
            "https://"
        ) ||
        cleaned.startsWith(
            "data:"
        )
    ){

        return cleaned;

    }


    try{

        const result =
            db.storage
                .from(bucket)
                .getPublicUrl(
                    cleaned
                );

        return (
            result &&
            result.data &&
            result.data.publicUrl
        ) || "";

    }catch(error){

        console.error(
            "Storage URL error:",
            error
        );

        return "";

    }

}


/* =========================================================
   MEMBER HELPERS
=============/============================================ */

function memberId(m){

    return firstValue(
        m,
        [
            "member_id",
            "memberId",
            "id"
        ],
        "-"
    );

}


function memberName(m){

    return firstValue(
        m,
        [
            "name",
            "full_name",
            "member_name"
        ],
        "-"
    );

}


function memberFatherName(m){

    return firstValue(
        m,
        [
            "father_name",
            "fatherName",
            "fathers_name",
            "father"
        ],
        "-"
    );

}


function memberMotherName(m){

    return firstValue(
        m,
        [
            "mother_name",
            "motherName",
            "mothers_name",
            "mother"
        ],
        "-"
    );

}


function memberBatch(m){

    return firstValue(
        m,
        [
            "ssc_year",
            "ssc_batch",
            "batch",
            "class",
            "current_class"
        ],
        "-"
    );

}


function memberProfession(m){

    return firstValue(
        m,
        [
            "profession",
            "occupation",
            "job"
        ],
        "-"
    );

}


function memberPhone(m){

    return firstValue(
        m,
        [
            "phone",
            "mobile",
            "phone_number"
        ],
        "-"
    );

}


function memberEmail(m){

    return firstValue(
        m,
        [
            "email",
            "email_address"
        ],
        "-"
    );

}


function memberAddress(m){

    return firstValue(
        m,
        [
            "address",
            "present_address",
            "current_address"
        ],
        "-"
    );

}


function memberGender(m){

    return firstValue(
        m,
        [
            "gender",
            "sex"
        ],
        "-"
    );

}


function rawCategory(m){

    return firstValue(
        m,
        [
            "member_type",
            "category",
            "member_category",
            "type"
        ],
        ""
    );

}

function memberCategory(m){

    const type =
        normalize(
            m.member_type || ""
        );


    if(
        type === "family"
    ){

        return "FAMILY";

    }


    if(
        type === "couple"
    ){

        return "FAMILY";

    }


    if(
        type === "current student"
    ){

        return "CURRENT STUDENT";

    }


    if(
        type === "ex-student"
    ){

        return "EX-STUDENT";

    }


    /* -----------------------------------------
       Fallback for old records
       ----------------------------------------- */

    const raw =
        normalize(
            rawCategory(m)
        );


    if(
        raw.includes("family") ||
        raw.includes("couple")
    ){

        return "FAMILY";

    }


    if(
        raw.includes("current") ||
        raw === "student" ||
        raw.includes("student")
    ){

        return "CURRENT STUDENT";

    }


    if(
        raw.includes("ex") ||
        raw.includes("alumni") ||
        raw.includes("former")
    ){

        return "EX-STUDENT";

    }


    return safe(
        rawCategory(m)
    ) || "-";

}


      
function memberPackage(m){

    return firstValue(
        m,
        [
            "package",
            "registration_package"
        ],
        "-"
    );

}


function paymentMethod(m){

    return firstValue(
        m,
        [
            "payment_method",
            "paymentMethod",
            "method"
        ],
        "-"
    );

}


function paymentAmount(m){

    return firstValue(
        m,
        [
            "payment_amount",
            "amount",
            "total_fee",
            "fee"
        ],
        0
    );

}


function transactionId(m){

    return firstValue(
        m,
        [
            "transaction_id",
            "transactionId",
            "trx_id",
            "trx"
        ],
        "-"
    );

}


function paymentStatus(m){

    return firstValue(
        m,
        [
            "payment_status",
            "status",
            "approval_status"
        ],
        "Pending"
    );

}


function shirtSize(m){

    return firstValue(
        m,
        [
            "shirt_size",
            "tshirt_size",
            "t_shirt_size",
            "size"
        ],
        ""
    );

}


function memberRegistrationNo(m){

    return firstValue(
        m,
        [
            "registration_no",
            "registration_number",
            "registration",
            "reg_no",
            "reg_number",
            "registrationNumber"
        ],
        memberId(m)
    );

}


/* =========================================================
   MEMBER PHOTO URL
========================================================= */

function photoURL(m){

    const direct =
        firstValue(
            m,
            [
                "photo_url",
                "photoURL"
            ],
            ""
        );


    const directValues =
        parseArrayValue(
            direct
        );


    for(
        const value of directValues
    ){

        const url =
            storagePublicUrl(
                "alumni-photos",
                value
            );

        if(url){
            return url;
        }

    }


    const path =
        firstValue(
            m,
            [
                "photo_path",
                "photoPath",
                "photo"
            ],
            ""
        );


    const pathValues =
        parseArrayValue(
            path
        );


    for(
        const value of pathValues
    ){

        const url =
            storagePublicUrl(
                "alumni-photos",
                value
            );

        if(url){
            return url;
        }

    }


    return "";

}


/* =========================================================
   STATUS
========================================================= */

function isApproved(m){

    return normalize(
        paymentStatus(m)
    ) === "approved";

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function toast(message){

    const el =
        $("toast");

    if(!el){
        return;
    }

    el.textContent =
        safe(message);

    el.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                el.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   MODAL
========================================================= */

function closeModal(){

    const modal =
        $("modal");

    if(modal){
        modal.classList.remove(
            "show"
        );
    }

}


function openModal(
    title,
    body,
    actions = ""
){

    setText(
        "modalTitle",
        title
    );

    $("modalBody").innerHTML =
        body || "";

    $("modalActions").innerHTML =
        actions || "";

    $("modal").classList.add(
        "show"
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function showPage(page){

    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.toggle(
                "active",
                section.id ===
                "page-" + page
            );

        });


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page ===
                page
            );

        });


    const titles = {

        dashboard:
            "Admin Dashboard",

        members:
            "Member Directory",

        payments:
            "Payment Management",

        batch:
            "Batch Management",

        idcards:
            "ID Card Management",

        food:
            "Food Token Management",

        attendance:
            "Attendance",

        magazine:
            "Magazine Management",

        reports:
            "Reports",

        dustbin:
            "Dustbin"

    };


    setText(
        "pageTitle",
        titles[page] ||
        "Admin Dashboard"
    );


    $("sidebar")
        ?.classList.remove(
            "open"
        );

}


function setupNavigation(){

    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            if(
                button.id ===
                "logoutBtn"
            ){
                return;
            }


            button.addEventListener(
                "click",
                () => {

                    showPage(
                        button.dataset.page
                    );

                }
            );

        });


    $("mobileMenu")
        ?.addEventListener(
            "click",
            () => {

                $("sidebar")
                    ?.classList.toggle(
                        "open"
                    );

            }
        );


    $("logoutBtn")
        ?.addEventListener(
            "click",
            () => {

                toast(
                    "Admin dashboard is running without login."
                );

            }
        );

}


/* =========================================================
   LOAD DATA
========================================================= */

async function loadAllData(){

    try{

        toast(
            "Loading dashboard data..."
        );


        const alumniResult =
            await db
                .from("alumni")
                .select("*");


        if(alumniResult.error){

            throw alumniResult.error;

        }


        alumniData =
            Array.isArray(
                alumniResult.data
            )
            ? alumniResult.data
            : [];


        alumniData.sort(
            (a,b) => {

                const da =
                    new Date(
                        firstValue(
                            a,
                            [
                                "created_at",
                                "registered_at",
                                "updated_at"
                            ],
                            0
                        )
                    ).getTime() || 0;


                const dbb =
                    new Date(
                        firstValue(
                            b,
                            [
                                "created_at",
                                "registered_at",
                                "updated_at"
                            ],
                            0
                        )
                    ).getTime() || 0;


                return dbb - da;

            }
        );


        magazineData = [];


        try{

            const magazineResult =
                await db
                    .from(
                        "magazine_submissions"
                    )
                    .select("*");


            if(
                magazineResult.error
            ){

                console.warn(
                    "Magazine loading warning:",
                    magazineResult.error
                );

            }else{

                magazineData =
                    Array.isArray(
                        magazineResult.data
                    )
                    ? magazineResult.data
                    : [];

            }

        }catch(error){

            console.warn(
                "Magazine table unavailable:",
                error
            );

        }


        magazineData.sort(
            (a,b) => {

                const da =
                    new Date(
                        firstValue(
                            a,
                            [
                                "created_at",
                                "submitted_at",
                                "updated_at"
                            ],
                            0
                        )
                    ).getTime() || 0;


                const dbb =
                    new Date(
                        firstValue(
                            b,
                            [
                                "created_at",
                                "submitted_at",
                                "updated_at"
                            ],
                            0
                        )
                    ).getTime() || 0;


                return dbb - da;

            }
        );


        populateAllBatchFilters();

        updateDashboard();

        renderMembers();

        renderPayments();

        renderBatchManagement();

        renderIdCards();

        renderFoodMembers();

        renderAttendance();

        renderMagazine();

        renderMemberPhotoBank();

        renderReports();

        renderDustbin();


        if(
            alumniData.length
        ){

            toast(
                `${alumniData.length} member(s) loaded.`
            );

        }else{

            toast(
                "Connected, but no member records found."
            );

        }


    }catch(error){

        console.error(
            "Dashboard loading error:",
            error
        );


        const message =
            safe(
                error?.message ||
                error
            );


        if(
            /jwt|token|key|auth/i.test(
                message
            )
        ){

            toast(
                "Supabase key/authentication error."
            );

        }else if(
            /rls|permission|policy/i.test(
                message
            )
        ){

            toast(
                "Data loading failed. Check Supabase/RLS settings."
            );

        }else if(
            /relation|table|does not exist/i.test(
                message
            )
        ){

            toast(
                "Required Supabase table was not found."
            );

        }else{

            toast(
                "Data loading failed. Check Supabase/RLS settings."
            );

        }

    }

}


/* =========================================================
   BATCH FILTERS
========================================================= */

function uniqueBatches(){

    const values = [];


    alumniData.forEach(
        m => {

            const value =
                memberBatch(m);

            if(
                value &&
                value !== "-"
            ){

                if(
                    !values.some(
                        v =>
                            sameValue(
                                v,
                                value
                            )
                    )
                ){

                    values.push(
                        value
                    );

                }

            }

        }
    );


    return values.sort(
        (a,b) =>
            String(a).localeCompare(
                String(b),
                undefined,
                {
                    numeric:true
                }
            )
    );

}


function fillSelect(
    id,
    values,
    placeholder
){

    const select =
        $(id);

    if(!select){
        return;
    }


    const current =
        select.value;


    select.innerHTML = "";


    const first =
        document.createElement(
            "option"
        );

    first.value = "";

    first.textContent =
        placeholder;

    select.appendChild(
        first
    );


    values.forEach(
        value => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                safe(value);

            option.textContent =
                safe(value);

            select.appendChild(
                option
            );

        }
    );


    if(
        values.some(
            v =>
                sameValue(
                    v,
                    current
                )
        )
    ){

        select.value =
            current;

    }

}


function populateAllBatchFilters(){

    const batches =
        uniqueBatches();


    fillSelect(
        "memberBatchFilter",
        batches,
        "All Batch / Class"
    );


    fillSelect(
        "paymentBatchFilter",
        batches,
        "All Batch"
    );


    fillSelect(
        "idBatch",
        batches,
        "All Batch / Class"
    );


    fillSelect(
        "foodBatch",
        batches,
        "All Batch / Class"
    );


    fillSelect(
        "magBatch",
        uniqueMagazineBatches(),
        "All Batches"
    );


    fillSelect(
        "memberPhotoBankBatch",
        batches,
        "All Batch / Class"
    );

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard(){

    const total =
        alumniData.length;


    const approved =
        alumniData.filter(
            isApproved
        ).length;


    const pending =
        alumniData.filter(
            m =>
                normalize(
                    paymentStatus(m)
                ) === "pending"
        ).length;


    const rejected =
        alumniData.filter(
            m =>
                normalize(
                    paymentStatus(m)
                ) === "rejected"
        ).length;


    const male =
        alumniData.filter(
            m =>
                normalize(
                    memberGender(m)
                ) === "male"
        ).length;


    const female =
        alumniData.filter(
            m =>
                normalize(
                    memberGender(m)
                ) === "female"
        ).length;


    const ex =
        alumniData.filter(
            m =>
                memberCategory(m) ===
                "EX-STUDENT"
        ).length;


    const current =
        alumniData.filter(
            m =>
                memberCategory(m) ===
                "CURRENT STUDENT"
        ).length;


    const family =
        alumniData.filter(
            m =>
                memberCategory(m) ===
                "FAMILY"
        ).length;


    const amount =
        alumniData.reduce(
            (sum,m) =>
                sum +
                num(
                    paymentAmount(m)
                ),
            0
        );


    const writings =
        magazineData.filter(
            m =>
                magazineType(m) ===
                "writing"
        ).length;


    const photos =
        magazineData.filter(
            m =>
                magazineType(m) ===
                "photo"
        ).length;


    setText(
        "totalMembers",
        total
    );

    setText(
        "approvedMembers",
        approved
    );

    setText(
        "pendingMembers",
        pending
    );

    setText(
        "rejectedMembers",
        rejected
    );

    setText(
        "maleMembers",
        male
    );

    setText(
        "femaleMembers",
        female
    );

    setText(
        "exStudents",
        ex
    );

    setText(
        "currentStudents",
        current
    );

    setText(
        "familyMembers",
        family
    );

    setText(
        "totalAmount",
        formatMoney(amount)
    );

    setText(
        "writingCount",
        writings
    );

    setText(
        "photoCount",
        photos
    );


    updateShirtCounts();

}


/* =========================================================
   COUNTDOWN
========================================================= */

function startCountdown(){

    clearInterval(
        countdownTimer
    );


    const target =
        new Date(
            "2027-03-13T07:30:00+06:00"
        ).getTime();


    function update(){

        const now =
            Date.now();


        let distance =
            target - now;


        if(distance < 0){
            distance = 0;
        }


        const days =
            Math.floor(
                distance /
                (1000 * 60 * 60 * 24)
            );


        const hours =
            Math.floor(
                (
                    distance %
                    (1000 * 60 * 60 * 24)
                ) /
                (1000 * 60 * 60)
            );


        const minutes =
            Math.floor(
                (
                    distance %
                    (1000 * 60 * 60)
                ) /
                (1000 * 60)
            );


        const seconds =
            Math.floor(
                (
                    distance %
                    (1000 * 60)
                ) /
                1000
            );


        setText(
            "days",
            days
        );

        setText(
            "hours",
            hours
        );

        setText(
            "minutes",
            minutes
        );

        setText(
            "seconds",
            seconds
        );

    }


    update();


    countdownTimer =
        setInterval(
            update,
            1000
        );

}


/* =========================================================
   SHIRT COUNTS
========================================================= */

function updateShirtCounts(){

    const sizes = {
        S:0,
        M:0,
        L:0,
        XL:0,
        XXL:0,
        XXXL:0
    };


    alumniData.forEach(
        m => {

            const category =
                memberCategory(m);


            if(
                category !==
                    "EX-STUDENT" &&
                category !==
                    "CURRENT STUDENT"
            ){
                return;
            }


            const size =
                safe(
                    shirtSize(m)
                )
                .trim()
                .toUpperCase();


            if(
                Object.prototype.hasOwnProperty.call(
                    sizes,
                    size
                )
            ){

                sizes[size]++;

            }

        }
    );


    setText(
        "shirtS",
        sizes.S
    );

    setText(
        "shirtM",
        sizes.M
    );

    setText(
        "shirtL",
        sizes.L
    );

    setText(
        "shirtXL",
        sizes.XL
    );

    setText(
        "shirtXXL",
        sizes.XXL
    );

    setText(
        "shirtXXXL",
        sizes.XXXL
    );

}


/* =========================================================
   MEMBER/ DIRECTORY
========================================================= */

function getFilteredMembers(){

    const category =
        $("memberCategoryFilter")
        ?.value || "";


    const batch =
        $("memberBatchFilter")
        ?.value || "";


    const status =
        $("memberStatusFilter")
        ?.value || "";


    const search =
        normalize(
            $("memberSearch")
            ?.value || ""
        );


    return alumniData.filter(
        m => {

            if(
                category &&
                memberCategory(m) !==
                category
            ){
                return false;
            }


            if(
                batch &&
                !sameValue(
                    memberBatch(m),
                    batch
                )
            ){
                return false;
            }


            if(
                status &&
                !sameValue(
                    paymentStatus(m),
                    status
                )
            ){
                return false;
            }


            if(search){

                const haystack = [

                    memberName(m),
                    memberId(m),
                    memberPhone(m),
                    memberProfession(m),
                    memberBatch(m)

                ]
                .map(v => safe(v))
                .join(" ")
                .toLowerCase();


                if(
                    !haystack.includes(
                        search
                    )
                ){
                    return false;
                }

            }


            return true;

        }
    );

}


function renderMembers(){

    const tbody =
        $("memberTable");

    if(!tbody){
        return;
    }


    const data =
        getFilteredMembers();


    if(!data.length){

        tbody.innerHTML = `

            <tr>
                <td colspan="12">
                    <div class="empty">
                        <i class="fa-solid fa-users"></i>
                        No members found.
                    </div>
                </td>
            </tr>

        `;

        return;
    }


    tbody.innerHTML =
        data.map(
            m => {

                const status =
                    paymentStatus(m);


                const statusClass =
                    normalize(
                        status
                    );


                const originalIndex =
                    alumniData.indexOf(m);


                return `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    memberName(m)
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                                memberId(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                memberBatch(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                memberProfession(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                memberPhone(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                memberCategory(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                memberPackage(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                paymentMethod(m)
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                paymentAmount(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                transactionId(m)
                            )}
                        </td>

                        <td>
                            <span class="status ${escapeHTML(
                                statusClass
                            )}">
                                ${escapeHTML(
                                    status
                                )}
                            </span>
                        </td>

                        <td>

                            <div class="action-row">

                                <button
                                    class="btn btn-blue"
                                    onclick="
                                        viewMember(
                                            ${originalIndex}
                                        )
                                    "
                                >
                                    <i class="fa-solid fa-eye"></i>
                                    View
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


function resetMemberFilter(){

    if($("memberCategoryFilter"))
        $("memberCategoryFilter").value = "";

    if($("memberBatchFilter"))
        $("memberBatchFilter").value = "";

    if($("memberStatusFilter"))
        $("memberStatusFilter").value = "";

    if($("memberSearch"))
        $("memberSearch").value = "";


    renderMembers();

}


/* =========================================================
   MEMBER VIEW
========================================================= */

function viewMember(index){

    const m =
        alumniData[index];


    if(!m){

        toast(
            "Member not found."
        );

        return;
    }


    const photo =
        photoURL(m);


    const photoHTML =
        photo
        ? `
            <img
                class="member-photo"
                src="${escapeHTML(photo)}"
                alt="${escapeHTML(
                    memberName(m)
                )}"
            >
        `
        : `
            <div
                class="member-photo"
                style="
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    color:#94a3b8;
                "
            >
                <i class="fa-solid fa-user"></i>
            </div>
        `;


    const body = `

        <div class="member-profile">

            <div>
                ${photoHTML}
            </div>

            <div class="info-grid">

                <div class="info-item">
                    <small>Name</small>
                    <strong>
                        ${escapeHTML(
                            memberName(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Member ID</small>
                    <strong>
                        ${escapeHTML(
                            memberId(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Father's Name</small>
                    <strong>
                        ${escapeHTML(
                            memberFatherName(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Mother's Name</small>
                    <strong>
                        ${escapeHTML(
                            memberMotherName(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Batch / Class</small>
                    <strong>
                        ${escapeHTML(
                            memberBatch(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Category</small>
                    <strong>
                        ${escapeHTML(
                            memberCategory(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Profession</small>
                    <strong>
                        ${escapeHTML(
                            memberProfession(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Mobile</small>
                    <strong>
                        ${escapeHTML(
                            memberPhone(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Email</small>
                    <strong>
                        ${escapeHTML(
                            memberEmail(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Payment Method</small>
                    <strong>
                        ${escapeHTML(
                            paymentMethod(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Payment Amount</small>
                    <strong>
                        ${formatMoney(
                            paymentAmount(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Transaction ID</small>
                    <strong>
                        ${escapeHTML(
                            transactionId(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Payment Status</small>
                    <strong>
                        ${escapeHTML(
                            paymentStatus(m)
                        )}
                    </strong>
                </div>

                <div class="info-item">
                    <small>Registration No.</small>
                    <strong>
                        ${escapeHTML(
                            memberRegistrationNo(m)
                        )}
                    </strong>
                </div>

            </div>

        </div>

    `;


    const actions = `

        <button
            class="btn btn-gold"
            onclick="
                printSingleIdCard(
                    ${index}
                )
            "
        >
            <i class="fa-solid fa-id-card"></i>
            Print ID Card
        </button>

        <button
            class="btn btn-gray"
            onclick="closeModal()"
        >
            Close
        </button>

    `;


    openModal(
        "Member Details",
        body,
        actions
    );

}


/* =========================================================
   PAYMENTS
========================================================= */

function getFilteredPayments(){

    const status =
        $("paymentStatusFilter")
        ?.value || "";


    const method =
        $("paymentMethodFilter")
        ?.value || "";


    const batch =
        $("paymentBatchFilter")
        ?.value || "";


    const search =
        normalize(
            $("paymentSearch")
            ?.value || ""
        );


    return alumniData.filter(
        m => {

            if(
                status &&
                !sameValue(
                    paymentStatus(m),
                    status
                )
            ){
                return false;
            }


            if(
                method &&
                !sameValue(
                    paymentMethod(m),
                    method
                )
            ){
                return false;
            }


            if(
                batch &&
                !sameValue(
                    memberBatch(m),
                    batch
                )
            ){
                return false;
            }


            if(search){

                const haystack = [

                    memberName(m),
                    memberId(m),
                    transactionId(m),
                    memberPhone(m),
                    memberBatch(m)

                ]
                .map(v => safe(v))
                .join(" ")
                .toLowerCase();


                if(
                    !haystack.includes(
                        search
                    )
                ){
                    return false;
                }

            }


            return true;

        }
    );

}


function renderPayments(){

    const tbody =
        $("paymentTable");

    if(!tbody){
        return;
    }


    const data =
        getFilteredPayments();


    if(!data.length){

        tbody.innerHTML = `

            <tr>
                <td colspan="10">
                    <div class="empty">
                        <i class="fa-solid fa-credit-card"></i>
                        No payment records found.
                    </div>
                </td>
            </tr>

        `;

        return;
    }


    tbody.innerHTML =
        data.map(
            m => {

                const index =
                    alumniData.indexOf(m);


                const status =
                    paymentStatus(m);


                const statusClass =
                    normalize(status);


                return `

                    <tr>

                        <td>
                            ${escapeHTML(
                                memberName(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                memberId(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                memberBatch(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                memberCategory(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                paymentMethod(m)
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                paymentAmount(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                transactionId(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                memberPhone(m)
                            )}
                        </td>

                        <td>

                            <span
                                class="status ${escapeHTML(
                                    statusClass
                                )}"
                            >
                                ${escapeHTML(
                                    status
                                )}
                            </span>

                        </td>

                        <td>

                            <div class="action-row">

                                <button
                                    class="btn btn-blue"
                                    onclick="
                                        viewMember(
                                            ${index}
                                        )
                                    "
                                >
                                    <i class="fa-solid fa-eye"></i>
                                </button>

                                ${
                                    normalize(
                                        status
                                    ) !==
                                    "approved"
                                    ? `
                                        <button
                                            class="btn btn-green"
                                            onclick="
                                                approvePayment(
                                                    ${index}
                                                )
                                            "
                                        >
                                            <i class="fa-solid fa-check"></i>
                                        </button>
                                    `
                                    : ""
                                }

                                ${
                                    normalize(
                                        status
                                    ) !==
                                    "rejected"
                                    ? `
                                        <button
                                            class="btn btn-red"
                                            onclick="
                                                rejectPayment(
                                                    ${index}
                                                )
                                            "
                                        >
                                            <i class="fa-solid fa-xmark"></i>
                                        </button>
                                    `
                                    : ""
                                }

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


async function updatePaymentStatus(
    index,
    status
){

    const m =
        alumniData[index];


    if(!m){
        return;
    }


    const id =
        firstValue(
            m,
            [
                "id",
                "member_id"
            ],
            ""
        );


    if(!id){

        toast(
            "Member record ID not found."
        );

        return;
    }


    const updates = {

        payment_status:
            status,

        status:
            status,

        payment_confirmed:
            status === "Approved"

    };


    try{

        const result =
            await db
                .from("alumni")
                .update(updates)
                .eq(
                    "id",
                    id
                );


        if(result.error){

            throw result.error;

        }


        Object.assign(
            m,
            updates
        );


        renderPayments();

        updateDashboard();

        renderMembers();

        renderIdCards();

        renderFoodMembers();

        renderAttendance();

        toast(
            `Payment ${status.toLowerCase()}.`
        );


    }catch(error){

        console.error(
            error
        );

        toast(
            "Could not update payment."
        );

    }

}


function approvePayment(index){

    updatePaymentStatus(
        index,
        "Approved"
    );

}


function rejectPayment(index){

    updatePaymentStatus(
        index,
        "Rejected"
    );

}


/* =========================================================
   MASTER ID CARD CSS
   DO NOT CHANGE DESIGN
========================================================= */

const MASTER_CARD_CSS = `

*{
    box-sizing:border-box;
}

.id-card{
    width:101.6mm;
    height:76.2mm;
    border:1px solid #bd9a34;
    border-radius:4mm;
    overflow:hidden;
    background:#fff;
    position:relative;
    font-family:Arial,sans-serif;
    box-sizing:border-box;
}

.id-header{
    height:17mm;
    background:linear-gradient(
        135deg,
        #071d3a,
        #123b69
    );
    color:#fff;
    text-align:center;
    padding:3mm 2mm 1mm;
}

.id-header strong{
    font-size:10px;
    display:block;
}

.id-header span{
    display:block;
    font-size:6px;
    margin-top:1px;
}

.id-body{
    height:50mm;
    display:grid;
    grid-template-columns:
        25mm 1fr 25mm;
    gap:2mm;
    padding:3mm;
}

.id-photo{
    width:23mm;
    height:29mm;
    object-fit:cover;
    border:1px solid #d6aa35;
    border-radius:2mm;
}

.id-info{
    font-size:6.5px;
    line-height:1.5;
}

.id-info h4{
    font-size:9px;
    margin:0 0 2px;
}

.id-qr{
    width:21mm;
    height:21mm;
    display:flex;
    align-items:center;
    justify-content:center;
}

.id-qr img,
.id-qr canvas{
    width:21mm!important;
    height:21mm!important;
}

.verify-seal{
    position:absolute;
    left:50%;
    bottom:5mm;
    transform:translateX(-50%);
    border:1px solid #168044;
    color:#168044;
    width:19mm;
    height:9mm;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    font-size:5px;
    font-weight:800;
}

.id-footer{
    position:absolute;
    left:0;
    right:0;
    bottom:1.5mm;
    text-align:center;
    font-size:4.5px;
    color:#68778a;
}

.food-token{
    width:101.6mm;
    height:76.2mm;
}

`;


/* =========================================================
   ID CARD HTML
========================================================= */

function buildIdCardHTML(m){

    const photo =
        photoURL(m);


    const photoHTML =
        photo
        ? `
            <img
                class="id-photo"
                src="${escapeHTML(photo)}"
                crossorigin="anonymous"
            >
        `
        : `
            <div
                class="id-photo"
                style="
                    display:flex;
                    align-items:center;
                    justify-content:center;
                "
            >
                <i class="fa-solid fa-user"></i>
            </div>
        `;


    const qrId =
        "qr-" +
        Math.random()
            .toString(36)
            .substring(2,10);


    const id =
        memberId(m);


    const name =
        memberName(m);


    const batch =
        memberBatch(m);


    const category =
        memberCategory(m);


    const regNo =
        memberRegistrationNo(m);


    return `

        <div
            class="id-card"
            data-member-id="${escapeHTML(id)}"
        >

            <div class="id-header">

                <strong>
                    PAHARCHANDA HIGH SCHOOL
                </strong>

                <span>
                    DIAMOND JUBILEE 1965–2025
                    | GRAND REUNION 2027
                </span>

            </div>


            <div class="id-body">

                <div>

                    ${photoHTML}

                </div>


                <div class="id-info">

                    <h4>
                        ${escapeHTML(name)}
                    </h4>

                    <div>
                        <b>ID:</b>
                        ${escapeHTML(id)}
                    </div>

                    <div>
                        <b>Reg:</b>
                        ${escapeHTML(regNo)}
                    </div>

                    <div>
                        <b>Batch:</b>
                        ${escapeHTML(batch)}
                    </div>

                    <div>
                        <b>Category:</b>
                        ${escapeHTML(category)}
                    </div>

                    <div>
                        <b>Profession:</b>
                        ${escapeHTML(
                            memberProfession(m)
                        )}
                    </div>

                    <div>
                        <b>Mobile:</b>
                        ${escapeHTML(
                            memberPhone(m)
                        )}
                    </div>

                </div>


                <div
                    class="id-qr"
                    id="${qrId}"
                    data-qr="${escapeHTML(
                        id
                    )}"
                ></div>

            </div>


            <div class="verify-seal">
                VERIFIED
                <br>
                PHS
            </div>


            <div class="id-footer">

                Grand Reunion 2027
                • Paharchanda High School

            </div>

        </div>

    `;

}


/* =========================================================
   FOOD TOKEN HTML
========================================================= */

function buildFoodTokenHTML(m){

    const photo =
        photoURL(m);


    const photoHTML =
        photo
        ? `
            <img
                class="id-photo"
                src="${escapeHTML(photo)}"
                crossorigin="anonymous"
            >
        `
        : `
            <div
                class="id-photo"
                style="
                    display:flex;
                    align-items:center;
                    justify-content:center;
                "
            >
                <i class="fa-solid fa-user"></i>
            </div>
        `;


    const qrId =
        "food-qr-" +
        Math.random()
            .toString(36)
            .substring(2,10);


    return `

        <div
            class="id-card food-token"
        >

            <div class="id-header">

                <strong>
                    PAHARCHANDA HIGH SCHOOL
                </strong>

                <span>
                    GRAND REUNION 2027
                    • FOOD TOKEN
                </span>

            </div>


            <div class="id-body">

                <div>

                    ${photoHTML}

                </div>


                <div class="id-info">

                    <h4>
                        ${escapeHTML(
                            memberName(m)
                        )}
                    </h4>

                    <div>
                        <b>ID:</b>
                        ${escapeHTML(
                            memberId(m)
                        )}
                    </div>

                    <div>
                        <b>Batch:</b>
                        ${escapeHTML(
                            memberBatch(m)
                        )}
                    </div>

                    <div>
                        <b>Category:</b>
                        ${escapeHTML(
                            memberCategory(m)
                        )}
                    </div>

                    <div>
                        <b>Food:</b>
                        Eligible
                    </div>

                </div>


                <div
                    class="id-qr"
                    id="${qrId}"
                    data-qr="${escapeHTML(
                        "FOOD|" +
                        memberId(m)
                    )}"
                ></div>

            </div>


            <div class="verify-seal">
                FOOD
                <br>
                TOKEN
            </div>


            <div class="id-footer">

                Grand Reunion 2027
                • Paharchanda High School

            </div>

        </div>

    `;

}


/* =========================================================
   QR
========================================================= */

function makeQRCode(
    container,
    text
){

    if(!container){
        return;
    }


    container.innerHTML = "";


    if(
        typeof QRCode ===
        "undefined"
    ){

        container.textContent =
            text;

        return;

    }


    try{

        new QRCode(
            container,
            {
                text:String(text),
                width:80,
                height:80,
                correctLevel:
                    QRCode.CorrectLevel.M
            }
        );

    }catch(error){

        console.error(
            "QR error:",
            error
        );

        container.textContent =
            text;

    }

}


function wait(ms){

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


async function prepareCardQR(
    root
){

    if(!root){
        return;
    }


    root
        .querySelectorAll(
            "[data-qr]"
        )
        .forEach(
            container => {

                makeQRCode(
                    container,
                    container.dataset.qr
                );

            }
        );


    await wait(250);

}


/* =========================================================
   ID CARD FILTER
========================================================= */

function getFilteredIdMembers(){

    const category =
        $("idCategory")
        ?.value || "";


    const batch =
        $("idBatch")
        ?.value || "";


    const search =
        normalize(
            $("idSearch")
            ?.value || ""
        );


    return alumniData.filter(
        m => {

            if(
                !isApproved(m)
            ){
                return false;
            }


            if(
                category &&
                memberCategory(m) !==
                category
            ){
                return false;
            }


            if(
                batch &&
                !sameValue(
                    memberBatch(m),
                    batch
                )
            ){
                return false;
            }


            if(search){

                const haystack = [

                    memberName(m),
                    memberId(m),
                    memberBatch(m)

                ]
                .map(v => safe(v))
                .join(" ")
                .toLowerCase();


                if(
                    !haystack.includes(
                        search
                    )
                ){
                    return false;
                }

            }


            return true;

        }
    );

}


function renderIdCards(){

    const container =
        $("idCardList");

    if(!container){
        return;
    }


    filteredIdMembers =
        getFilteredIdMembers();


    setText(
        "idCountLabel",
        filteredIdMembers.length +
        " members"
    );


    if(
        !filteredIdMembers.length
    ){

        container.innerHTML = `

            <div class="empty">

                <i class="fa-solid fa-id-card"></i>

                No approved members found.

            </div>

        `;

        return;
    }


    container.innerHTML = `

        <div class="table-wrap">

            <table>

                <thead>

                    <tr>

                        <th>Name</th>
                        <th>Member ID</th>
                        <th>Batch</th>
                        <th>Category</th>
                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    ${
                        filteredIdMembers
                        .map(
                            m => {

                                const index =
                                    alumniData.indexOf(m);


                                return `

                                    <tr>

                                        <td>
                                            ${escapeHTML(
                                                memberName(m)
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHTML(
                                                memberId(m)
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHTML(
                                                memberBatch(m)
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHTML(
                                                memberCategory(m)
                                            )}
                                        </td>

                                        <td>

                                            <button
                                                class="btn btn-blue"
                                                onclick="
                                                    printSingleIdCard(
                                                        ${index}
                                                    )
                                                "
                                            >
                                                <i class="fa-solid fa-print"></i>
                                                Print
                                            </button>

                                        </td>

                                    </tr>

                                `;

                            }
                        )
                        .join("")

                    }

                </tbody>

            </table>

        </div>

    `;

}


/* =========================================================
   SINGLE ID CARD PRINT
========================================================= */

async function printSingleIdCard(
    index
){

    const m =
        alumniData[index];


    if(!m){
        return;
    }


    const html =
        buildIdCardHTML(m);


    const win =
        window.open(
            "",
            "_blank"
        );


    if(!win){

        toast(
            "Please allow pop-ups."
        );

        return;
    }


    win.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                ID Card
            </title>

            <style>

                @page{
                    size:101.6mm 76.2mm;
                    margin:0;
                }

                body{
                    margin:0;
                    background:#fff;
                }

                .print-wrap{
                    width:101.6mm;
                    height:76.2mm;
                }

                ${MASTER_CARD_CSS}

            </style>

        </head>

        <body>

            <div
                class="print-wrap"
                id="root"
            >

                ${html}

            </div>

            <script>

                window.onload = async function(){

                    const root =
                        document.getElementById(
                            "root"
                        );

                    const qr =
                        root.querySelectorAll(
                            "[data-qr]"
                        );

                    qr.forEach(el => {

                        if(
                            typeof QRCode !==
                            "undefined"
                        ){

                            new QRCode(
                                el,
                                {
                                    text:
                                        el.dataset.qr,
                                    width:80,
                                    height:80
                                }
                            );

                        }

                    });

                    setTimeout(
                        () => window.print(),
                        500
                    );

                };

            <\/script>

        </body>

        </html>

    `);


    win.document.close();

}


async function quickPrintId(
    index
){

    await printSingleIdCard(
        index
    );

}


async function downloadIdCard(
    index
){

    await printSingleIdCard(
        index
    );

}


/* =========================================================
   ID A4 PREVIEW - 6 CARDS
========================================================= */

async function previewSelectedIdCards(){

    const data =
        filteredIdMembers.length
        ? filteredIdMembers
        : getFilteredIdMembers();


    if(!data.length){

        toast(
            "No approved members available."
        );

        return;
    }


    const cards =
        data.map(
            m =>
                buildIdCardHTML(m)
        ).join("");


    const html = `

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                ID Cards
            </title>

            <style>

                @page{
                    size:A4;
                    margin:0;
                }

                body{
                    margin:0;
                    background:#fff;
                }

                .id-sheet{
                    width:208mm;
                    margin:0 auto;
                    display:grid;
                    grid-template-columns:
                        repeat(2,101.6mm);
                    column-gap:4.8mm;
                    row-gap:5mm;
                    padding:7mm 0 25mm;
                }

                ${MASTER_CARD_CSS}

                .id-card{
                    break-inside:avoid;
                    page-break-inside:avoid;
                }

            </style>

        </head>

        <body>

            <div class="id-sheet">

                ${cards}

            </div>


            <script>

                window.onload = function(){

                    const qr =
                        document.querySelectorAll(
                            "[data-qr]"
                        );

                    qr.forEach(el => {

                        if(
                            typeof QRCode !==
                            "undefined"
                        ){

                            new QRCode(
                                el,
                                {
                                    text:
                                        el.dataset.qr,
                                    width:80,
                                    height:80
                                }
                            );

                        }

                    });


                    setTimeout(
                        () => window.print(),
                        700
                    );

                };

            <\/script>

        </body>

        </html>

    `;


    const win =
        window.open(
            "",
            "_blank"
        );


    if(!win){

        toast(
            "Please allow pop-ups."
        );

        return;
    }


    win.document.open();

    win.document.write(
        html
    );

    win.document.close();

}


/* =========================================================
   FOOD FILTER
========================================================= */

function getFilteredFoodMembers(){

    const category =
        $("foodCategory")
        ?.value || "";


    const batch =
        $("foodBatch")
        ?.value || "";


    const search =
        normalize(
            $("foodSearch")
            ?.value || ""
        );


    return alumniData.filter(
        m => {

            if(
                !isApproved(m)
            ){
                return false;
            }


            if(
                category &&
                memberCategory(m) !==
                category
            ){
                return false;
            }


            if(
                batch &&
                !sameValue(
                    memberBatch(m),
                    batch
                )
            ){
                return false;
            }


            if(search){

                const haystack = [

                    memberName(m),
                    memberId(m),
                    memberBatch(m)

                ]
                .map(v => safe(v))
                .join(" ")
                .toLowerCase();


                if(
                    !haystack.includes(
                        search
                    )
                ){
                    return false;
                }

            }


            return true;

        }
    );

}


function renderFoodMembers(){

    const tbody =
        $("foodTable");

    if(!tbody){
        return;
    }


    filteredFoodMembers =
        getFilteredFoodMembers();


    if(
        !filteredFoodMembers.length
    ){

        tbody.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="empty">

                        <i class="fa-solid fa-utensils"></i>

                        No approved members found.

                    </div>

                </td>

            </tr>

        `;

        return;
    }


    tbody.innerHTML =
        filteredFoodMembers
        .map(
            m => {

                const index =
                    alumniData.indexOf(m);


                return `

                    <tr>

                        <td>
                            <input
                                type="checkbox"
                                class="food-check"
                                data-index="${index}"
                            >
                        </td>

                        <td>
                            ${escapeHTML(
                                memberName(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                memberId(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                memberBatch(m)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                memberCategory(m)
                            )}
                        </td>

                        <td>
                            <span class="status approved">
                                Approved
                            </span>
                        </td>

                        <td>

                            <button
                                class="btn btn-blue"
                                onclick="
                                    quickPrintFood(
                                        ${index}
                                    )
                                "
                            >
                                <i class="fa-solid fa-print"></i>
                                Print
                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


/* =========================================================
   FOOD SINGLE PRINT
========================================================= */

async function quickPrintFood(
    index
){

    const m =
        alumniData[index];


    if(!m){
        return;
    }


    const html =
        buildFoodTokenHTML(m);


    const win =
        window.open(
            "",
            "_blank"
        );


    if(!win){

        toast(
            "Please allow pop-ups."
        );

        return;
    }


    win.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                Food Token
            </title>

            <style>

                @page{
                    size:101.6mm 76.2mm;
                    margin:0;
                }

                body{
                    margin:0;
                }

                ${MASTER_CARD_CSS}

            </style>

        </head>

        <body>

            ${html}

            <script>

                window.onload = function(){

                    document
                        .querySelectorAll(
                            "[data-qr]"
                        )
                        .forEach(el => {

                            if(
                                typeof QRCode !==
                                "undefined"
                            ){

                                new QRCode(
                                    el,
                                    {
                                        text:
                                            el.dataset.qr,
                                        width:80,
                                        height:80
                                    }
                                );

                            }

                        });


                    setTimeout(
                        () => window.print(),
                        600
                    );

                };

            <\/script>

        </body>

        </html>

    `);


    win.document.close();

}


/* =========================================================
   FOOD LEGAL PREVIEW
========================================================= */

async function previewFoodTokens(){

    const data =
        filteredFoodMembers.length
        ? filteredFoodMembers
        : getFilteredFoodMembers();


    if(!data.length){

        toast(
            "No approved members available."
        );

        return;
    }


    const cards =
        data.map(
            m =>
                buildFoodTokenHTML(m)
        ).join("");


    const html = `

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                Food Tokens
            </title>

            <style>

                @page{
                    size:legal landscape;
                    margin:8mm;
                }

                body{
                    margin:0;
                    background:#fff;
                }

                .food-sheet{
                    display:grid;
                    grid-template-columns:
                        repeat(2,101.6mm);
                    gap:8mm;
                    justify-content:center;
                }

                ${MASTER_CARD_CSS}

            </style>

        </head>

        <body>

            <div class="food-sheet">

                ${cards}

            </div>

            <script>

                window.onload = function(){

                    document
                        .querySelectorAll(
                            "[data-qr]"
                        )
                        .forEach(el => {

                            if(
                                typeof QRCode !==
                                "undefined"
                            ){

                                new QRCode(
                                    el,
                                    {
                                        text:
                                            el.dataset.qr,
                                        width:80,
                                        height:80
                                    }
                                );

                            }

                        });


                    setTimeout(
                        () => window.print(),
                        700
                    );

                };

            <\/script>

        </body>

        </html>

    `;


    const win =
        window.open(
            "",
            "_blank"
        );


    if(!win){

        toast(
            "Please allow pop-ups."
        );

        return;
    }


    win.document.open();

    win.document.write(
        html
    );

    win.document.close();

}


/* =========================================================
   BATCH MANAGEMENT
========================================================= */

function renderBatchManagement(){

    const container =
        $("batchContainer");

    if(!container){
        return;
    }


    const groups = {};


    alumniData.forEach(
        m => {

            const category =
                memberCategory(m);

            const batch =
                memberBatch(m);


            if(
                !groups[category]
            ){

                groups[category] = {};

            }


            if(
                !groups[category][batch]
            ){

                groups[category][batch] =
                    [];

            }


            groups[category][batch]
                .push(m);

        }
    );


    const categories =
        Object.keys(groups);


    if(!categories.length){

        container.innerHTML = `

            <div class="empty">

                <i class="fa-solid fa-layer-group"></i>

                No batch data found.

            </div>

        `;

        return;
    }


    container.innerHTML =
        categories
        .map(
            category => {

                const batches =
                    groups[category];


                return `

                    <div
                        class="category-block"
                    >

                        <div
                            class="category-title"
                        >

                            <i
                                class="fa-solid fa-layer-group"
                            ></i>

                            ${escapeHTML(
                                category
                            )}

                        </div>


                        <div
                            class="batch-grid"
                        >

                            ${
                                Object.keys(
                                    batches
                                )
                                .map(
                                    batch => `

                                        <div
                                            class="batch-card"
                                            onclick="
                                                openBatchMembers(
                                                    '${encodeURIComponent(
                                                        category
                                                    )}',
                                                    '${encodeURIComponent(
                                                        batch
                                                    )}'
                                                )
                                            "
                                        >

                                            <div
                                                class="batch-icon"
                                            >

                                                <i
                                                    class="fa-solid fa-users"
                                                ></i>

                                            </div>

                                            <strong>
                                                ${escapeHTML(
                                                    batch
                                                )}
                                            </strong>

                                            <small>
                                                ${
                                                    batches[
                                                        batch
                                                    ].length
                                                } member(s)
                                            </small>

                                        </div>

                                    `
                                )
                                .join("")
                            }

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


function openBatchMembers(
    encodedCategory,
    encodedBatch
){

    const category =
        decodeURIComponent(
            encodedCategory
        );


    const batch =
        decodeURIComponent(
            encodedBatch
        );


    const members =
        alumniData.filter(
            m =>
                memberCategory(m) ===
                category &&
                sameValue(
                    memberBatch(m),
                    batch
                )
        );


    const rows =
        members.map(
            m => `

                <tr>

                    <td>
                        ${escapeHTML(
                            memberName(m)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            memberId(m)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            memberPhone(m)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            paymentStatus(m)
                        )}
                    </td>

                </tr>

            `
        ).join("");


    openModal(
        `Batch ${batch}`,
        `

            <p>
                <strong>Category:</strong>
                ${escapeHTML(category)}
            </p>

            <p>
                <strong>Total:</strong>
                ${members.length}
            </p>

            <div class="table-wrap">

                <table>

                    <thead>

                        <tr>
                            <th>Name</th>
                            <th>Member ID</th>
                            <th>Mobile</th>
                            <th>Status</th>
                        </tr>

                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

            </div>

        `,
        `
            <button
                class="btn btn-gray"
                onclick="closeModal()"
            >
                Close
            </button>
        `
    );

}


/* =========================================================
   ATTENDANCE
========================================================= */

function renderAttendance(){

    const approved =
        alumniData.filter(
            isApproved
        );


    const male =
        approved.filter(
            m =>
                normalize(
                    memberGender(m)
                ) === "male"
        ).length;


    const female =
        approved.filter(
            m =>
                normalize(
                    memberGender(m)
                ) === "female"
        ).length;


    setText(
        "attTotal",
        approved.length
    );


    setText(
        "foodIssued",
        approved.length
    );


    setText(
        "attMale",
        male
    );


    setText(
        "attFemale",
        female
    );

}


/* =========================================================
   MAGAZINE HELPERS
========================================================= */

function magazineType(m){

    const value =
        firstValue(
            m,
            [
                "submission_type",
                "content_type",
                "type"
            ],
            ""
        );


    const normalized =
        normalize(value);


    if(
        normalized.includes(
            "photo"
        )
    ){

        return "photo";

    }


    if(
        normalized.includes(
            "writing"
        )
    ){

        return "writing";

    }


    return normalized;

}


function magazineTitle(m){

    return firstValue(
        m,
        [
            "title",
            "subject",
            "heading"
        ],
        "Untitled"
    );

}


function magazineSender(m){

    return firstValue(
        m,
        [
            "member_name",
            "sender_name",
            "name",
            "submitted_by",
            "full_name"
        ],
        "-"
    );

}


function magazineMemberId(m){

    return firstValue(
        m,
        [
            "member_id",
            "memberId",
            "registration_no",
            "registration_number",
            "reg_no"
        ],
        "-"
    );

}


function magazineBatch(m){

    return firstValue(
        m,
        [
            "ssc_year",
            "ssc_batch",
            "batch",
            "year"
        ],
        "-"
    );

}


function magazineStatus(m){

    return firstValue(
        m,
        [
            "status",
            "approval_status"
        ],
        "Pending"
    );

}


function magazineContent(m){

    return firstValue(
        m,
        [
            "content",
            "writing",
            "text",
            "body",
            "article"
        ],
        ""
    );

}


function magazineDescription(m){

    return firstValue(
        m,
        [
            "description",
            "photo_description",
            "caption",
            "details"
        ],
        ""
    );

}


function magazineCategory(m){

    return firstValue(
        m,
        [
            "category"
        ],
        ""
    );

}


/* =========================================================
   MAGAZINE IMAGE URLS
========================================================= */

function magazineImageUrls(m){

    const urls = [];


    const directFields = [

        "photo_url",
        "image_url",
        "file_url",
        "photo",
        "image"

    ];


    const pathFields = [

        "photo_path",
        "image_path",
        "file_path",
        "storage_path"

    ];


    directFields.forEach(
        field => {

            parseArrayValue(
                m?.[field]
            )
            .forEach(
                value => {

                    const url =
                        storagePublicUrl(
                            "magazine-photos",
                            value
                        );


                    if(
                        url &&
                        !urls.includes(url)
                    ){

                        urls.push(url);

                    }

                }
            );

        }
    );


    pathFields.forEach(
        field => {

            parseArrayValue(
                m?.[field]
            )
            .forEach(
                value => {

                    const url =
                        storagePublicUrl(
                            "magazine-photos",
                            value
                        );


                    if(
                        url &&
                        !urls.includes(url)
                    ){

                        urls.push(url);

                    }

                }
            );

        }
    );


    return urls;

}


function magazineImage(m){

    return (
        magazineImageUrls(m)[0]
        || ""
    );

}


/* =========================================================
   MAGAZINE BATCHES
========================================================= */

function uniqueMagazineBatches(){

    const values = [];


    magazineData.forEach(
        m => {

            const value =
                magazineBatch(m);


            if(
                value &&
                value !== "-"
            ){

                if(
                    !values.some(
                        v =>
                            sameValue(
                                v,
                                value
                            )
                    )
                ){

                    values.push(
                        value
                    );

                }

            }

        }
    );


    return values.sort(
        (a,b) =>
            String(a).localeCompare(
                String(b),
                undefined,
                {
                    numeric:true
                }
            )
    );

}


/* =========================================================
   MAGAZINE FILTER
========================================================= */

function getFilteredMagazineData(){

    const batch =
        $("magBatch")
        ?.value || "";


    const status =
        $("magStatus")
        ?.value || "";


    const search =
        normalize(
            $("magSearch")
            ?.value || ""
        );


    return magazineData.filter(
        m => {

            const type =
                magazineType(m);


            if(
                currentMagType !==
                "all" &&
                type !==
                currentMagType
            ){

                return false;

            }


            if(
                batch &&
                !sameValue(
                    magazineBatch(m),
                    batch
                )
            ){

                return false;

            }


            if(
                status &&
                !sameValue(
                    magazineStatus(m),
                    status
                )
            ){

                return false;

            }


            if(search){

                const haystack = [

                    magazineSender(m),
                    magazineMemberId(m),
                    magazineBatch(m),
                    magazineTitle(m),
                    magazineDescription(m),
                    magazineContent(m),
                    magazineCategory(m)

                ]
                .map(
                    v => safe(v)
                )
                .join(" ")
                .toLowerCase();


                if(
                    !haystack.includes(
                        search
                    )
                ){

                    return false;

                }

            }


            return true;

        }
    );

}


/* =========================================================
   MAGAZINE RENDER
========================================================= */

function renderMagazine(){

    const container =
        $("magazineContainer");

    if(!container){
        return;
    }


    const data =
        getFilteredMagazineData();


    if(!data.length){

        container.innerHTML = `

            <div class="empty">

                <i
                    class="fa-solid fa-book-open"
                ></i>

                No magazine submissions found.

            </div>

        `;

        return;
    }


    container.innerHTML =
        data.map(
            m => {

                const type =
                    magazineType(m);


                const isPhoto =
                    type === "photo";


                const images =
                    isPhoto
                    ? magazineImageUrls(m)
                    : [];


                const title =
                    magazineTitle(m);


                const sender =
                    magazineSender(m);


                const batch =
                    magazineBatch(m);


                const status =
                    magazineStatus(m);


                const description =
                    magazineDescription(m);


                const content =
                    magazineContent(m);


                const category =
                    magazineCategory(m);


                const originalIndex =
                    magazineData.indexOf(m);


                let mediaHTML = "";


                if(isPhoto){

                    if(images.length){

                        mediaHTML = `

                            <div
                                style="
                                    display:grid;
                                    gap:8px;
                                "
                            >

                                ${
                                    images
                                    .map(
                                        (
                                            url,
                                            i
                                        ) => `

                                            <img
                                                class="mag-photo"
                                                src="${escapeHTML(
                                                    url
                                                )}"
                                                alt="
                                                    Magazine Photo ${
                                                        i + 1
                                                    }
                                                "
                                                loading="lazy"
                                            >

                                        `
                                    )
                                    .join("")
                                }

                            </div>

                        `;

                    }else{

                        mediaHTML = `

                            <div
                                class="mag-photo"
                                style="
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    color:#94a3b8;
                                "
                            >

                                <i
                                    class="
                                        fa-solid
                                        fa-image
                                    "
                                    style="
                                        font-size:35px;
                                    "
                                ></i>

                            </div>

                        `;

                    }

                }else{

                    mediaHTML = `

                        <div
                            class="mag-photo"
                            style="
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                color:#1769aa;
                            "
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-pen-nib
                                "
                                style="
                                    font-size:35px;
                                "
                            ></i>

                        </div>

                    `;

                }


                const excerpt =
                    isPhoto
                    ? description
                    : content;


                return `

                    <div
                        class="mag-card"
                    >

                        ${mediaHTML}


                        <div
                            class="mag-title"
                        >

                            ${escapeHTML(
                                title
                            )}

                        </div>


                        <div
                            class="mag-meta"
                        >

                            <div>
                                <strong>
                                    Type:
                                </strong>

                                ${escapeHTML(
                                    type
                                )}
                            </div>


                            <div>
                                <strong>
                                    Sender:
                                </strong>

                                ${escapeHTML(
                                    sender
                                )}
                            </div>


                            <div>
                                <strong>
                                    Batch:
                                </strong>

                                ${escapeHTML(
                                    batch
                                )}
                            </div>


                            <div>
                                <strong>
                                    Registration No:
                                </strong>

                                ${escapeHTML(
                                    magazineMemberId(m)
                                )}
                            </div>


                            ${
                                category
                                ? `
                                    <div>
                                        <strong>
                                            Category:
                                        </strong>

                                        ${escapeHTML(
                                            category
                                        )}
                                    </div>
                                `
                                : ""
                            }


                            <div>
                                <strong>
                                    Status:
                                </strong>

                                ${escapeHTML(
                                    status
                                )}
                            </div>

                        </div>


                        ${
                            excerpt
                            ? `
                                <div
                                    class="mag-excerpt"
                                >
                                    ${escapeHTML(
                                        excerpt
                                    )}
                                </div>
                            `
                            : ""
                        }


                        <div
                            class="mag-actions"
                        >

                            <button
                                class="btn btn-blue"
                                onclick="
                                    viewMagazineSubmission(
                                        '${encodeURIComponent(
                                            String(
                                                originalIndex
                                            )
                                        )}'
                                    )
                                "
                            >

                                <i
                                    class="
                                        fa-solid
                                        fa-eye
                                    "
                                ></i>

                                View

                            </button>


                            <button
                                class="btn btn-gold"
                                onclick="
                                    downloadMagazineSubmission(
                                        '${encodeURIComponent(
                                            String(
                                                originalIndex
                                            )
                                        )}'
                                    )
                                "
                            >

                                <i
                                    class="
                                        fa-solid
                                        fa-download
                                    "
                                ></i>

                                Download

                            </button>


                            <button
                                class="btn btn-gray"
                                onclick="
                                    printSingleMagazine(
                                        '${encodeURIComponent(
                                            String(
                                                originalIndex
                                            )
                                        )}'
                                    )
                                "
                            >

                                <i
                                    class="
                                        fa-solid
                                        fa-print
                                    "
                                ></i>

                                Print

                            </button>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


/* =========================================================
   MAGAZINE VIEW
========================================================= */

function viewMagazineSubmission(
    encodedIndex
){

    const index =
        Number(
            decodeURIComponent(
                encodedIndex
            )
        );


    const m =
        magazineData[index];


    if(!m){

        toast(
            "Magazine submission not found."
        );

        return;
    }


    const type =
        magazineType(m);


    const isPhoto =
        type === "photo";


    const title =
        magazineTitle(m);


    const sender =
        magazineSender(m);


    const batch =
        magazineBatch(m);


    const member =
        magazineMemberId(m);


    const status =
        magazineStatus(m);


    const description =
        magazineDescription(m);


    const content =
        magazineContent(m);


    const images =
        isPhoto
        ? magazineImageUrls(m)
        : [];


    let body = "";


    if(isPhoto){

        body += `

            ${
                images.length
                ? `
                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(
                                        180px,
                                        1fr
                                    )
                                );
                            gap:12px;
                            margin-bottom:18px;
                        "
                    >

                        ${
                            images
                            .map(
                                url => `

                                    <img
                                        src="${escapeHTML(
                                            url
                                        )}"
                                        style="
                                            width:100%;
                                            max-height:350px;
                                            object-fit:contain;
                                            background:#f1f5f9;
                                            border-radius:9px;
                                        "
                                    >

                                `
                            )
                            .join("")
                        }

                    </div>

                `
                : `

                    <div
                        class="empty"
                    >

                        <i
                            class="
                                fa-solid
                                fa-image
                            "
                        ></i>

                        No image available.

                    </div>

                `
            }

        `;

    }


    body += `

        <div class="info-grid">

            <div class="info-item">

                <small>
                    Type
                </small>

                <strong>
                    ${escapeHTML(
                        type || "-"
                    )}
                </strong>

            </div>


            <div class="info-item">

                <small>
                    Status
                </small>

                <strong>
                    ${escapeHTML(
                        status
                    )}
                </strong>

            </div>


            <div class="info-item">

                <small>
                    Title
                </small>

                <strong>
                    ${escapeHTML(
                        title
                    )}
                </strong>

            </div>


            <div class="info-item">

                <small>
                    Sender
                </small>

                <strong>
                    ${escapeHTML(
                        sender
                    )}
                </strong>

            </div>


            <div class="info-item">

                <small>
                    SSC Batch
                </small>

                <strong>
                    ${escapeHTML(
                        batch
                    )}
                </strong>

            </div>


            <div class="info-item">

                <small>
                    Registration No.
                </small>

                <strong>
                    ${escapeHTML(
                        member
                    )}
                </strong>

            </div>

        </div>

    `;


    if(description){

        body += `

            <div
                style="
                    margin-top:15px;
                "
            >

                <strong>
                    ${
                        isPhoto
                        ? "Photo Description"
                        : "Category"
                    }
                </strong>


                <div
                    class="mag-excerpt"
                    style="
                        max-height:none;
                        white-space:pre-wrap;
                    "
                >

                    ${escapeHTML(
                        description
                    )}

                </div>

            </div>

        `;

    }


    if(content){

        body += `

            <div
                style="
                    margin-top:15px;
                "
            >

                <strong>
                    Writing Content
                </strong>


                <div
                    class="mag-excerpt"
                    style="
                        max-height:none;
                        white-space:pre-wrap;
                    "
                >

                    ${escapeHTML(
                        content
                    )}

                </div>

            </div>

        `;

    }


    const actions = `

        <button
            class="btn btn-gold"
            onclick="
                downloadMagazineSubmission(
                    '${encodeURIComponent(
                        String(index)
                    )}'
                )
            "
        >

            <i
                class="
                    fa-solid
                    fa-download
                "
            ></i>

            Download

        </button>


        <button
            class="btn btn-blue"
            onclick="
                printSingleMagazine(
                    '${encodeURIComponent(
                        String(index)
                    )}'
                )
            "
        >

            <i
                class="
                    fa-solid
                    fa-print
                "
            ></i>

            Print / Save PDF

        </button>


        <button
            class="btn btn-gray"
            onclick="closeModal()"
        >

            Close

        </button>

    `;


    openModal(
        "Magazine Submission",
        body,
        actions
    );

}


/* =========================================================
   WAIT FOR IMAGES
========================================================= */

function waitForImages(
    doc
){

    const images =
        Array.from(
            doc.images || []
        );


    return Promise.all(
        images.map(
            img => {

                if(
                    img.complete
                ){

                    return Promise.resolve();

                }


                return new Promise(
                    resolve => {

                        img.onload =
                            resolve;

                        img.onerror =
                            resolve;

                    }
                );

            }
        )
    );

}


/* =========================================================
   SINGLE MAGAZINE PRINT
========================================================= */

async function printSingleMagazine(
    encodedIndex
){

    const index =
        Number(
            decodeURIComponent(
                encodedIndex
            )
        );


    const m =
        magazineData[index];


    if(!m){

        toast(
            "Magazine submission not found."
        );

        return;
    }


    const type =
        magazineType(m);


    const isPhoto =
        type === "photo";


    const images =
        isPhoto
        ? magazineImageUrls(m)
        : [];


    const title =
        magazineTitle(m);


    const sender =
        magazineSender(m);


    const batch =
        magazineBatch(m);


    const description =
        magazineDescription(m);


    const content =
        magazineContent(m);


    let imageHTML = "";


    if(isPhoto){

        imageHTML =
            images
            .map(
                url => `

                    <img
                        class="mag-print-photo"
                        src="${escapeHTML(
                            url
                        )}"
                    >

                `
            )
            .join("");

    }


    const html = `

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                Magazine Submission
            </title>

            <style>

                @page{
                    size:A4;
                    margin:0;
                }

                body{
                    margin:0;
                    background:#fff;
                    font-family:Arial,sans-serif;
                }

                .mag-print-sheet{
                    width:210mm;
                    min-height:297mm;
                    padding:10mm;
                    margin:auto;
                }

                .mag-print-header{
                    text-align:center;
                    border-bottom:
                        1px solid #d6aa35;
                    padding-bottom:5mm;
                    margin-bottom:7mm;
                }

                .mag-print-header h1{
                    margin:0;
                    font-size:18px;
                    color:#071d3a;
                }

                .mag-print-header p{
                    margin:3px 0 0;
                    font-size:9px;
                    color:#64748b;
                }

                .mag-print-item{
                    break-inside:avoid;
                    page-break-inside:avoid;
                }

                .mag-print-photo{
                    max-width:100%;
                    max-height:120mm;
                    width:auto;
                    height:auto;
                    object-fit:contain;
                    display:block;
                    margin:0 auto 6mm;
                }

                .mag-print-title{
                    font-size:17px;
                    font-weight:800;
                    color:#071d3a;
                    margin-bottom:4mm;
                }

                .mag-print-meta{
                    font-size:10px;
                    line-height:1.8;
                    color:#64748b;
                    margin-bottom:5mm;
                }

                .mag-print-description{
                    font-size:11px;
                    line-height:1.8;
                    white-space:pre-wrap;
                }

                .mag-print-writing{
                    font-size:12px;
                    line-height:1.9;
                    white-space:pre-wrap;
                }

                .photo-gallery{
                    display:grid;
                    gap:6mm;
                }

            </style>

        </head>

        <body>

            <div
                class="mag-print-sheet"
            >

                <div
                    class="mag-print-header"
                >

                    <h1>
                        PAHARCHANDA HIGH SCHOOL
                    </h1>

                    <p>
                        MAGAZINE • GRAND REUNION 2027
                    </p>

                </div>


                <div
                    class="mag-print-item"
                >

                    ${
                        isPhoto
                        ? `
                            <div
                                class="photo-gallery"
                            >
                                ${imageHTML}
                            </div>
                        `
                        : ""
                    }


                    <div
                        class="mag-print-title"
                    >

                        ${escapeHTML(
                            title
                        )}

                    </div>


                    <div
                        class="mag-print-meta"
                    >

                        <div>
                            <b>Sender:</b>
                            ${escapeHTML(
                                sender
                            )}
                        </div>

                        <div>
                            <b>SSC Batch:</b>
                            ${escapeHTML(
                                batch
                            )}
                        </div>

                        <div>
                            <b>Registration No:</b>
                            ${escapeHTML(
                                magazineMemberId(m)
                            )}
                        </div>

                        <div>
                            <b>Type:</b>
                            ${escapeHTML(
                                type
                            )}
                        </div>

                        <div>
                            <b>Status:</b>
                            ${escapeHTML(
                                magazineStatus(m)
                            )}
                        </div>

                    </div>


                    ${
                        isPhoto
                        ? `
                            <div
                                class="
                                    mag-print-description
                                "
                            >
                                ${escapeHTML(
                                    description
                                )}
                            </div>
                        `
                        : `
                            <div
                                class="
                                    mag-print-writing
                                "
                            >
                                ${escapeHTML(
                                    content
                                )}
                            </div>
                        `
                    }

                </div>

            </div>


            <script>

                window.onload = function(){

                    const images =
                        Array.from(
                            document.images
                        );


                    Promise.all(
                        images.map(img => {

                            if(
                                img.complete
                            ){

                                return Promise.resolve();

                            }


                            return new Promise(
                                resolve => {

                                    img.onload =
                                        resolve;

                                    img.onerror =
                                        resolve;

                                }
                            );

                        })
                    ).then(() => {

                        setTimeout(
                            () => window.print(),
                            400
                        );

                    });

                };

            <\/script>

        </body>

        </html>

    `;


    const win =
        window.open(
            "",
            "_blank"
        );


    if(!win){

        toast(
            "Please allow pop-ups."
        );

        return;
    }


    win.document.open();

    win.document.write(
        html
    );

    win.document.close();

}


/* =========================================================
   MAGAZINE BATCH / CATEGORY PREVIEW
========================================================= */

function previewMagazineFiltered(){

    printMagazineBatch();

}


function printMagazineBatch(){

    const data =
        getFilteredMagazineData();


    if(!data.length){

        toast(
            "No magazine submissions found."
        );

        return;
    }


    const batch =
        $("magBatch")
        ?.value || "";


    const typeTitle =
        currentMagType ===
        "all"
        ? "All"
        : currentMagType ===
          "photo"
          ? "Photos"
          : "Writing";


    const items =
        data.map(
            m => {

                const type =
                    magazineType(m);


                const isPhoto =
                    type === "photo";


                const images =
                    isPhoto
                    ? magazineImageUrls(m)
                    : [];


                const photoHTML =
                    images
                    .map(
                        url => `

                            <img
                                class="mag-print-photo"
                                src="${escapeHTML(
                                    url
                                )}"
                            >

                        `
                    )
                    .join("");


                return `

                    <div
                        class="mag-print-item"
                    >

                        ${
                            isPhoto
                            ? `
                                <div
                                    class="
                                        photo-gallery
                                    "
                                >

                                    ${photoHTML}

                                </div>
                            `
                            : ""
                        }


                        <div
                            class="
                                mag-print-title
                            "
                        >

                            ${escapeHTML(
                                magazineTitle(m)
                            )}

                        </div>


                        <div
                            class="
                                mag-print-meta
                            "
                        >

                            <div>
                                <b>Sender:</b>
                                ${escapeHTML(
                                    magazineSender(m)
                                )}
                            </div>

                            <div>
                                <b>SSC Batch:</b>
                                ${escapeHTML(
                                    magazineBatch(m)
                                )}
                            </div>

                            <div>
                                <b>Registration No:</b>
                                ${escapeHTML(
                                    magazineMemberId(m)
                                )}
                            </div>

                            <div>
                                <b>Type:</b>
                                ${escapeHTML(
                                    type
                                )}
                            </div>

                            <div>
                                <b>Status:</b>
                                ${escapeHTML(
                                    magazineStatus(m)
                                )}
                            </div>

                        </div>


                        ${
                            isPhoto
                            ? `
                                <div
                                    class="
                                        mag-print-description
                                    "
                                >
                                    ${escapeHTML(
                                        magazineDescription(m)
                                    )}
                                </div>
                            `
                            : `
                                <div
                                    class="
                                        mag-print-writing
                                    "
                                >
                                    ${escapeHTML(
                                        magazineContent(m)
                                    )}
                                </div>
                            `
                        }

                    </div>

                `;

            }
        ).join("");


    const heading =
        batch
        ? `Magazine - ${batch}`
        : `Magazine - ${typeTitle}`;


    const html = `

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                ${escapeHTML(heading)}
            </title>

            <style>

                @page{
                    size:A4;
                    margin:0;
                }

                body{
                    margin:0;
                    background:#fff;
                    font-family:Arial,sans-serif;
                }

                .mag-print-sheet{
                    width:210mm;
                    min-height:297mm;
                    padding:10mm;
                    margin:auto;
                }

                .mag-print-header{
                    text-align:center;
                    border-bottom:
                        1px solid #d6aa35;
                    padding-bottom:5mm;
                    margin-bottom:7mm;
                }

                .mag-print-header h1{
                    margin:0;
                    font-size:18px;
                    color:#071d3a;
                }

                .mag-print-header p{
                    margin:3px 0 0;
                    font-size:9px;
                    color:#64748b;
                }

                .mag-print-item{
                    break-inside:avoid;
                    page-break-inside:avoid;
                    border-bottom:
                        1px solid #dbe3ec;
                    padding-bottom:8mm;
                    margin-bottom:8mm;
                }

                .mag-print-photo{
                    max-width:100%;
                    max-height:120mm;
                    width:auto;
                    height:auto;
                    object-fit:contain;
                    display:block;
                    margin:0 auto 5mm;
                }

                .photo-gallery{
                    display:grid;
                    gap:6mm;
                }

                .mag-print-title{
                    font-size:15px;
                    font-weight:800;
                    color:#071d3a;
                    margin-bottom:4mm;
                }

                .mag-print-meta{
                    font-size:9px;
                    line-height:1.7;
                    color:#64748b;
                    margin-bottom:4mm;
                }

                .mag-print-description{
                    font-size:10px;
                    line-height:1.7;
                    white-space:pre-wrap;
                }

                .mag-print-writing{
                    font-size:11px;
                    line-height:1.8;
                    white-space:pre-wrap;
                }

            </style>

        </head>

        <body>

            <div
                class="mag-print-sheet"
            >

                <div
                    class="
                        mag-print-header
                    "
                >

                    <h1>
                        PAHARCHANDA HIGH SCHOOL
                    </h1>

                    <p>
                        ${escapeHTML(
                            heading
                        )}
                        • GRAND REUNION 2027
                    </p>

                </div>


                ${items}

            </div>


            <script>

                window.onload = function(){

                    const images =
                        Array.from(
                            document.images
                        );


                    Promise.all(
                        images.map(img => {

                            if(
                                img.complete
                            ){

                                return Promise.resolve();

                            }


                            return new Promise(
                                resolve => {

                                    img.onload =
                                        resolve;

                                    img.onerror =
                                        resolve;

                                }
                            );

                        })
                    ).then(() => {

                        setTimeout(
                            () => window.print(),
                            500
                        );

                    });

                };

            <\/script>

        </body>

        </html>

    `;


    const win =
        window.open(
            "",
            "_blank"
        );


    if(!win){

        toast(
            "Please allow pop-ups."
        );

        return;
    }


    win.document.open();

    win.document.write(
        html
    );

    win.document.close();

}


/* =========================================================
   MAGAZINE DOWNLOAD
========================================================= */

function safeFileName(value){

    return String(
        value || "file"
    )
    .replace(
        /[\\/:*?"<>|]+/g,
        "_"
    )
    .replace(
        /\s+/g,
        " "
    )
    .trim()
    .substring(
        0,
        100
    );

}


async function downloadBlobUrl(
    url,
    filename
){

    try{

        const response =
            await fetch(
                url,
                {
                    mode:"cors"
                }
            );


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
            filename;


        document.body.appendChild(
            a
        );


        a.click();


        a.remove();


        setTimeout(
            () =>
                URL.revokeObjectURL(
                    blobUrl
                ),
            2000
        );


        return true;

    }catch(error){

        console.error(
            error
        );

        return false;

    }

}


async function downloadMagazineSubmission(
    encodedIndex
){

    const index =
        Number(
            decodeURIComponent(
                encodedIndex
            )
        );


    const m =
        magazineData[index];


    if(!m){

        toast(
            "Magazine submission not found."
        );

        return;
    }


    const type =
        magazineType(m);


    const sender =
        safeFileName(
            magazineSender(m)
        );


    const batch =
        safeFileName(
            magazineBatch(m)
        );


    if(type === "photo"){

        const images =
            magazineImageUrls(m);


        if(!images.length){

            toast(
                "No magazine photo found."
            );

            return;
        }


        let successCount = 0;


        for(
            let i = 0;
            i < images.length;
            i++
        ){

            const success =
                await downloadBlobUrl(
                    images[i],
                    `Magazine-${batch}-${sender}-${i+1}.jpg`
                );


            if(success){

                successCount++;

            }

        }


        if(successCount){

            toast(
                `${successCount} photo(s) downloaded.`
            );

        }else{

            toast(
                "Direct download blocked. Use Print / Save PDF."
            );

        }


        return;

    }


    const text = [

        "PAHARCHANDA HIGH SCHOOL",

        "MAGAZINE SUBMISSION",

        "",

        `Title: ${magazineTitle(m)}`,

        `Sender: ${magazineSender(m)}`,

        `SSC Batch: ${magazineBatch(m)}`,

        `Registration No: ${magazineMemberId(m)}`,

        `Category: ${magazineCategory(m)}`,

        `Status: ${magazineStatus(m)}`,

        "",

        "CONTENT",

        magazineContent(m) || ""

    ].join("\n");


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
        `Magazine-Writing-${batch}-${sender}.txt`;


    document.body.appendChild(
        a
    );


    a.click();


    a.remove();


    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        1000
    );


    toast(
        "Writing downloaded."
    );

}


/* =========================================================
   MAGAZINE CSV
========================================================= */

function downloadMagazineCSV(){

    const data =
        getFilteredMagazineData();


    const rows = [

        [
            "Type",
            "Title",
            "Sender",
            "Registration No",
            "SSC Batch",
            "Category",
            "Description",
            "Status",
            "Photo Count"
        ]

    ];


    data.forEach(
        m => {

            rows.push(
                [

                    magazineType(m),

                    magazineTitle(m),

                    magazineSender(m),

                    magazineMemberId(m),

                    magazineBatch(m),

                    magazineCategory(m),

                    magazineDescription(m),

                    magazineStatus(m),

                    magazineImageUrls(m)
                        .length

                ]
            );

        }
    );


    downloadCSV(
        rows,
        "magazine-submissions.csv"
    );

}


/* =========================================================
   MEMBER PHOTO BANK
   SOURCE = alumniData ONLY
========================================================= */

function getMemberPhotoBankData(){

    const batch =
        $("memberPhotoBankBatch")
        ?.value || "";


    const search =
        normalize(
            $("memberPhotoBankSearch")
            ?.value || ""
        );


    return alumniData.filter(
        m => {

            const photo =
                photoURL(m);


            if(!photo){

                return false;

            }


            if(
                batch &&
                !sameValue(
                    memberBatch(m),
                    batch
                )
            ){

                return false;

            }


            if(search){

                const haystack = [

                    memberName(m),

                    memberId(m),

                    memberRegistrationNo(m),

                    memberFatherName(m),

                    memberMotherName(m),

                    memberBatch(m)

                ]
                .map(
                    v => safe(v)
                )
                .join(" ")
                .toLowerCase();


                if(
                    !haystack.includes(
                        search
                    )
                ){

                    return false;

                }

            }


            return true;

        }
    );

}


function renderMemberPhotoBank(){

    const container =
        $("memberPhotoBankContainer");


    const count =
        $("memberPhotoBankCount");


    if(!container){

        return;

    }


    const data =
        getMemberPhotoBankData();


    if(count){

        count.textContent =
            data.length +
            (
                data.length === 1
                ? " photo"
                : " photos"
            );

    }


    if(!data.length){

        container.innerHTML = `

            <div class="empty">

                <i
                    class="fa-solid fa-images"
                ></i>

                No registration photos found.

            </div>

        `;

        return;

    }


    container.innerHTML =
        data.map(
            m => {

                const photo =
                    photoURL(m);


                return `

                    <div
                        class="photo-bank-card"
                    >

                        <img
                            class="
                                photo-bank-photo
                            "
                            src="${escapeHTML(
                                photo
                            )}"
                            alt="${escapeHTML(
                                memberName(m)
                            )}"
                            loading="lazy"
                            onerror="
                                this.style.display='none';
                            "
                        >


                        <div
                            class="
                                photo-bank-name
                            "
                        >

                            ${escapeHTML(
                                memberName(m)
                            )}

                        </div>


                        <div
                            class="
                                photo-bank-info
                            "
                        >

                            <div>
                                <strong>
                                    Father:
                                </strong>

                                ${escapeHTML(
                                    memberFatherName(m)
                                )}
                            </div>


                            <div>
                                <strong>
                                    Mother:
                                </strong>

                                ${escapeHTML(
                                    memberMotherName(m)
                                )}
                            </div>


                            <div>
                                <strong>
                                    SSC Batch:
                                </strong>

                                ${escapeHTML(
                                    memberBatch(m)
                                )}
                            </div>


                            <div>
                                <strong>
                                    Registration No:
                                </strong>

                                ${escapeHTML(
                                    memberRegistrationNo(m)
                                )}
                            </div>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


/* =========================================================
   MEMBER PHOTO BANK PREVIEW
========================================================= */

function previewMemberPhotoBank(){

    const data =
        getMemberPhotoBankData();


    if(!data.length){

        toast(
            "No member photos available."
        );

        return;
    }


    const batch =
        $("memberPhotoBankBatch")
        ?.value || "";


    const heading =
        batch
        ? `Member Photo Bank - ${batch}`
        : "Member Photo Bank";


    const items =
        data.map(
            m => {

                const photo =
                    photoURL(m);


                return `

                    <div
                        class="photo-sheet-item"
                    >

                        <img
                            src="${escapeHTML(
                                photo
                            )}"
                            alt="${escapeHTML(
                                memberName(m)
                            )}"
                        >


                        <div
                            class="
                                photo-sheet-caption
                            "
                        >

                            <strong>
                                ${escapeHTML(
                                    memberName(m)
                                )}
                            </strong>

                            <br>

                            Father:
                            ${escapeHTML(
                                memberFatherName(m)
                            )}

                            <br>

                            Mother:
                            ${escapeHTML(
                                memberMotherName(m)
                            )}

                            <br>

                            SSC Batch:
                            <span
                                class="
                                    photo-sheet-batch
                                "
                            >
                                ${escapeHTML(
                                    memberBatch(m)
                                )}
                            </span>

                            <br>

                            Registration No:
                            ${escapeHTML(
                                memberRegistrationNo(m)
                            )}

                        </div>

                    </div>

                `;

            }
        ).join("");


    const html = `

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                ${escapeHTML(
                    heading
                )}
            </title>

            <style>

                @page{
                    size:A4;
                    margin:0;
                }

                body{
                    margin:0;
                    background:#fff;
                    font-family:Arial,sans-serif;
                }

                .photo-sheet{
                    width:210mm;
                    min-height:297mm;
                    margin:auto;
                    padding:8mm;
                    background:#fff;
                }

                .photo-sheet-header{
                    text-align:center;
                    margin-bottom:6mm;
                    border-bottom:
                        1px solid #d6aa35;
                    padding-bottom:4mm;
                }

                .photo-sheet-header h1{
                    margin:0;
                    font-size:18px;
                    color:#071d3a;
                }

                .photo-sheet-header p{
                    margin:3px 0 0;
                    font-size:10px;
                    color:#64748b;
                }

                .photo-sheet-grid{
                    display:grid;
                    grid-template-columns:
                        repeat(4,45mm);
                    gap:7mm 3mm;
                    justify-content:center;
                    align-items:start;
                }

                .photo-sheet-item{
                    width:45mm;
                    text-align:center;
                    break-inside:avoid;
                    page-break-inside:avoid;
                }

                .photo-sheet-item img{
                    width:35mm;
                    height:45mm;
                    object-fit:cover;
                    display:block;
                    margin:0 auto 2.5mm;
                    border:
                        1px solid #b89531;
                }

                .photo-sheet-caption{
                    font-size:7.5px;
                    line-height:1.4;
                    color:#172033;
                    word-break:break-word;
                }

                .photo-sheet-caption strong{
                    font-size:8px;
                }

                .photo-sheet-batch{
                    font-weight:800;
                    color:#071d3a;
                }

            </style>

        </head>

        <body>

            <div
                class="photo-sheet"
            >

                <div
                    class="
                        photo-sheet-header
                    "
                >

                    <h1>
                        PAHARCHANDA HIGH SCHOOL
                    </h1>

                    <p>
                        ${escapeHTML(
                            heading
                        )}
                        • GRAND REUNION 2027
                    </p>

                </div>


                <div
                    class="
                        photo-sheet-grid
                    "
                >

                    ${items}

                </div>

            </div>


            <script>

                window.onload = function(){

                    const images =
                        Array.from(
                            document.images
                        );


                    Promise.all(
                        images.map(img => {

                            if(
                                img.complete
                            ){

                                return Promise.resolve();

                            }


                            return new Promise(
                                resolve => {

                                    img.onload =
                                        resolve;

                                    img.onerror =
                                        resolve;

                                }
                            );

                        })
                    ).then(() => {

                        setTimeout(
                            () => window.print(),
                            400
                        );

                    });

                };

            <\/script>

        </body>

        </html>

    `;


    const win =
        window.open(
            "",
            "_blank"
        );


    if(!win){

        toast(
            "Please allow pop-ups."
        );

        return;
    }


    win.document.open();

    win.document.write(
        html
    );

    win.document.close();

}


/* =========================================================
   MEMBER PHOTO BANK PDF
========================================================= */

async function downloadMemberPhotoBank(){

    const data =
        getMemberPhotoBankData();


    if(!data.length){

        toast(
            "No member photos available."
        );

        return;
    }


    if(
        typeof html2canvas ===
        "undefined" ||
        !window.jspdf
    ){

        toast(
            "PDF library is not available."
        );

        return;
    }


    const batch =
        $("memberPhotoBankBatch")
        ?.value || "";


    const sheet =
        document.createElement(
            "div"
        );


    sheet.style.position =
        "fixed";

    sheet.style.left =
        "-100000px";

    sheet.style.top =
        "0";

    sheet.style.width =
        "210mm";

    sheet.style.minHeight =
        "297mm";

    sheet.style.padding =
        "8mm";

    sheet.style.background =
        "#fff";

    sheet.innerHTML = `

        <div
            class="photo-sheet-header"
            style="
                text-align:center;
                margin-bottom:6mm;
                border-bottom:
                    1px solid #d6aa35;
                padding-bottom:4mm;
            "
        >

            <h1
                style="
                    margin:0;
                    font-size:18px;
                    color:#071d3a;
                "
            >
                PAHARCHANDA HIGH SCHOOL
            </h1>

            <p
                style="
                    margin:3px 0 0;
                    font-size:10px;
                    color:#64748b;
                "
            >
                ${
                    batch
                    ? "Member Photo Bank - " +
                      escapeHTML(batch)
                    : "Member Photo Bank"
                }
            </p>

        </div>


        <div
            style="
                display:grid;
                grid-template-columns:
                    repeat(4,45mm);
                gap:7mm 3mm;
                justify-content:center;
                align-items:start;
            "
        >

            ${
                data.map(
                    m => `

                        <div
                            style="
                                width:45mm;
                                text-align:center;
                                break-inside:avoid;
                            "
                        >

                            <img
                                src="${escapeHTML(
                                    photoURL(m)
                                )}"
                                style="
                                    width:35mm;
                                    height:45mm;
                                    object-fit:cover;
                                    display:block;
                                    margin:0 auto 2.5mm;
                                    border:
                                        1px solid #b89531;
                                "
                            >

                            <div
                                style="
                                    font-size:7.5px;
                                    line-height:1.4;
                                    color:#172033;
                                    word-break:break-word;
                                "
                            >

                                <strong>
                                    ${escapeHTML(
                                        memberName(m)
                                    )}
                                </strong>

                                <br>

                                Father:
                                ${escapeHTML(
                                    memberFatherName(m)
                                )}

                                <br>

                                Mother:
                                ${escapeHTML(
                                    memberMotherName(m)
                                )}

                                <br>

                                SSC Batch:
                                ${escapeHTML(
                                    memberBatch(m)
                                )}

                                <br>

                                Registration No:
                                ${escapeHTML(
                                    memberRegistrationNo(m)
                                )}

                            </div>

                        </div>

                    `
                ).join("")
            }

        </div>

    `;


    document.body.appendChild(
        sheet
    );


    try{

        const images =
            Array.from(
                sheet.querySelectorAll(
                    "img"
                )
            );


        await Promise.all(
            images.map(
                img => {

                    if(
                        img.complete
                    ){

                        return Promise.resolve();

                    }


                    return new Promise(
                        resolve => {

                            img.onload =
                                resolve;

                            img.onerror =
                                resolve;

                        }
                    );

                }
            )
        );


        const canvas =
            await html2canvas(
                sheet,
                {
                    scale:2,
                    useCORS:true,
                    backgroundColor:"#ffffff"
                }
            );


        const {
            jsPDF
        } =
            window.jspdf;


        const pdf =
            new jsPDF(
                "p",
                "mm",
                "a4"
            );


        const width =
            210;


        const height =
            canvas.height *
            width /
            canvas.width;


        pdf.addImage(
            canvas.toDataURL(
                "image/jpeg",
                0.95
            ),
            "JPEG",
            0,
            0,
            width,
            height
        );


        pdf.save(
            batch
            ? `Member-Photo-Bank-${safeFileName(batch)}.pdf`
            : "Member-Photo-Bank.pdf"
        );


        toast(
            "PDF saved successfully."
        );


    }catch(error){

        console.error(
            "Photo Bank PDF error:",
            error
        );


        toast(
            "Could not create PDF."
        );

    }finally{

        sheet.remove();

    }

}


/* =========================================================
   REPORTS
========================================================= */

function renderReports(){

    const methods = {

        bKash:0,
        Nagad:0,
        Rocket:0,
        Bank:0,
        Cash:0

    };


    alumniData.forEach(
        m => {

            const method =
                normalize(
                    paymentMethod(m)
                );


            const amount =
                num(
                    paymentAmount(m)
                );


            if(
                method.includes(
                    "bkash"
                )
            ){

                methods.bKash += amount;

            }else if(
                method.includes(
                    "nagad"
                )
            ){

                methods.Nagad += amount;

            }else if(
                method.includes(
                    "rocket"
                )
            ){

                methods.Rocket += amount;

            }else if(
                method.includes(
                    "bank"
                )
            ){

                methods.Bank += amount;

            }else if(
                method.includes(
                    "cash"
                )
            ){

                methods.Cash += amount;

            }

        }
    );


    setText(
        "bkashTotal",
        formatMoney(
            methods.bKash
        )
    );


    setText(
        "nagadTotal",
        formatMoney(
            methods.Nagad
        )
    );


    setText(
        "rocketTotal",
        formatMoney(
            methods.Rocket
        )
    );


    setText(
        "bankTotal",
        formatMoney(
            methods.Bank
        )
    );


    updateReportShirts();

    renderBatchReport();

}


function updateReportShirts(){

    const sizes = {

        S:0,
        M:0,
        L:0,
        XL:0,
        XXL:0,
        XXXL:0

    };


    alumniData.forEach(
        m => {

            const category =
                memberCategory(m);


            if(
                category !==
                    "EX-STUDENT" &&
                category !==
                    "CURRENT STUDENT"
            ){

                return;

            }


            const size =
                safe(
                    shirtSize(m)
                )
                .trim()
                .toUpperCase();


            if(
                sizes[size] !==
                undefined
            ){

                sizes[size]++;

            }

        }
    );


    setText(
        "reportS",
        sizes.S
    );

    setText(
        "reportM",
        sizes.M
    );

    setText(
        "reportL",
        sizes.L
    );

    setText(
        "reportXL",
        sizes.XL
    );

    setText(
        "reportXXL",
        sizes.XXL
    );

    setText(
        "reportXXXL",
        sizes.XXXL
    );

}


function renderBatchReport(){

    const tbody =
        $("reportBatchTable");

    if(!tbody){
        return;
    }


    const groups = {};


    alumniData.forEach(
        m => {

            const category =
                memberCategory(m);


            const batch =
                memberBatch(m);


            const key =
                category +
                "||" +
                batch;


            if(!groups[key]){

                groups[key] = {

                    category,
                    batch,
                    total:0,
                    approved:0,
                    pending:0,
                    rejected:0,
                    amount:0

                };

            }


            groups[key].total++;


            const status =
                normalize(
                    paymentStatus(m)
                );


            if(status === "approved")
                groups[key].approved++;


            if(status === "pending")
                groups[key].pending++;


            if(status === "rejected")
                groups[key].rejected++;


            groups[key].amount +=
                num(
                    paymentAmount(m)
                );

        }
    );


    const rows =
        Object.values(groups)
        .sort(
            (a,b) =>
                String(
                    a.batch
                ).localeCompare(
                    String(
                        b.batch
                    ),
                    undefined,
                    {
                        numeric:true
                    }
                )
        );


    if(!rows.length){

        tbody.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="empty">

                        No report data found.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        rows.map(
            r => `

                <tr>

                    <td>
                        ${escapeHTML(
                            r.category
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            r.batch
                        )}
                    </td>

                    <td>
                        ${r.total}
                    </td>

                    <td>
                        ${r.approved}
                    </td>

                    <td>
                        ${r.pending}
                    </td>

                    <td>
                        ${r.rejected}
                    </td>

                    <td>
                        ${formatMoney(
                            r.amount
                        )}
                    </td>

                </tr>

            `
        )
        .join("");

}


/* =========================================================
   DUSTBIN
========================================================= */

function renderDustbin(){

    const trash =
        $("trashTable");


    const magTrash =
        $("magTrashTable");


    if(trash){

        trash.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="empty">

                        <i
                            class="
                                fa-solid
                                fa-trash-can
                            "
                        ></i>

                        No deleted members.

                    </div>

                </td>

            </tr>

        `;

    }


    if(magTrash){

        magTrash.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="empty">

                        <i
                            class="
                                fa-solid
                                fa-trash-can
                            "
                        ></i>

                        No deleted magazine submissions.

                    </div>

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   CSV HELPER
========================================================= */

function csvEscape(value){

    const text =
        safe(value);


    if(
        /[",\n]/.test(
            text
        )
    ){

        return '"' +
            text.replace(
                /"/g,
                '""'
            ) +
            '"';

    }


    return text;

}


function downloadCSV(
    rows,
    filename
){

    const csv =
        "\uFEFF" +
        rows
            .map(
                row =>
                    row
                    .map(csvEscape)
                    .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
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
        filename;


    document.body.appendChild(
        a
    );


    a.click();


    a.remove();


    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        1000
    );

}


/* =========================================================
   MEMBER CSV
========================================================= */

function downloadMembersCSV(){

    const data =
        getFilteredMembers();


    const rows = [

        [
            "Name",
            "Member ID",
            "Registration No",
            "Father Name",
            "Mother Name",
            "Batch/Class",
            "Profession",
            "Mobile",
            "Email",
            "Address",
            "Category",
            "Package",
            "Payment Method",
            "Amount",
            "Transaction ID",
            "Payment Status"
        ]

    ];


    data.forEach(
        m => {

            rows.push(
                [

                    memberName(m),

                    memberId(m),

                    memberRegistrationNo(m),

                    memberFatherName(m),

                    memberMotherName(m),

                    memberBatch(m),

                    memberProfession(m),

                    memberPhone(m),

                    memberEmail(m),

                    memberAddress(m),

                    memberCategory(m),

                    memberPackage(m),

                    paymentMethod(m),

                    paymentAmount(m),

                    transactionId(m),

                    paymentStatus(m)

                ]
            );

        }
    );


    downloadCSV(
        rows,
        "members.csv"
    );

}


/* =========================================================
   PAYMENT CSV
========================================================= */

function downloadPaymentsCSV(){

    const data =
        getFilteredPayments();


    const rows = [

        [
            "Name",
            "Member ID",
            "Batch",
            "Category",
            "Payment Method",
            "Amount",
            "Transaction ID",
            "Mobile",
            "Status"
        ]

    ];


    data.forEach(
        m => {

            rows.push(
                [

                    memberName(m),

                    memberId(m),

                    memberBatch(m),

                    memberCategory(m),

                    paymentMethod(m),

                    paymentAmount(m),

                    transactionId(m),

                    memberPhone(m),

                    paymentStatus(m)

                ]
            );

        }
    );


    downloadCSV(
        rows,
        "payments.csv"
    );

}


/* =========================================================
   REPORT CSV
========================================================= */

function downloadReportCSV(){

    const rows = [

        [
            "Category",
            "Batch/Class",
            "Total",
            "Approved",
            "Pending",
            "Rejected",
            "Total Amount"
        ]

    ];


    const groups = {};


    alumniData.forEach(
        m => {

            const category =
                memberCategory(m);


            const batch =
                memberBatch(m);


            const key =
                category +
                "||" +
                batch;


            if(!groups[key]){

                groups[key] = {

                    category,
                    batch,
                    total:0,
                    approved:0,
                    pending:0,
                    rejected:0,
                    amount:0

                };

            }


            groups[key].total++;


            const status =
                normalize(
                    paymentStatus(m)
                );


            if(status === "approved")
                groups[key].approved++;


            if(status === "pending")
                groups[key].pending++;


            if(status === "rejected")
                groups[key].rejected++;


            groups[key].amount +=
                num(
                    paymentAmount(m)
                );

        }
    );


    Object.values(groups)
        .forEach(
            r => {

                rows.push(
                    [

                        r.category,

                        r.batch,

                        r.total,

                        r.approved,

                        r.pending,

                        r.rejected,

                        r.amount

                    ]
                );

            }
        );


    downloadCSV(
        rows,
        "report.csv"
    );

}


/* =========================================================
   MAGAZINE TABS
========================================================= */

function setupMagazineTabs(){

    document
        .querySelectorAll(
            ".mag-tab"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".mag-tab"
                            )
                            .forEach(
                                b =>
                                    b.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        currentMagType =
                            normalize(
                                button.dataset.mag ||
                                "all"
                            );


                        renderMagazine();

                    }
                );

            }
        );

}


/* =========================================================
   FILTER EVENTS
========================================================= */

function setupFilters(){

    const inputRenderMap = {

        memberSearch:
            renderMembers,

        paymentSearch:
            renderPayments,

        idSearch:
            renderIdCards,

        foodSearch:
            renderFoodMembers,

        magSearch:
            renderMagazine,

        memberPhotoBankSearch:
            renderMemberPhotoBank

    };


    Object.keys(
        inputRenderMap
    ).forEach(
        id => {

            const el =
                $(id);


            if(!el){
                return;
            }


            el.addEventListener(
                "input",
                inputRenderMap[id]
            );

        }
    );


    const selectRenderMap = {

        memberCategoryFilter:
            renderMembers,

        memberBatchFilter:
            renderMembers,

        memberStatusFilter:
            renderMembers,

        paymentStatusFilter:
            renderPayments,

        paymentMethodFilter:
            renderPayments,

        paymentBatchFilter:
            renderPayments,

        idCategory:
            renderIdCards,

        idBatch:
            renderIdCards,

        foodCategory:
            renderFoodMembers,

        foodBatch:
            renderFoodMembers,

        magBatch:
            renderMagazine,

        magStatus:
            renderMagazine,

        memberPhotoBankBatch:
            renderMemberPhotoBank

    };


    Object.keys(
        selectRenderMap
    ).forEach(
        id => {

            const el =
                $(id);


            if(!el){
                return;
            }


            el.addEventListener(
                "change",
                selectRenderMap[id]
            );

        }
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents(){

    setupNavigation();

    setupMagazineTabs();

    setupFilters();


    $("memberPhotoBankRefreshBtn")
        ?.addEventListener(
            "click",
            renderMemberPhotoBank
        );


    $("memberPhotoPrintBtn")
        ?.addEventListener(
            "click",
            previewMemberPhotoBank
        );


    $("magazinePrintBtn")
        ?.addEventListener(
            "click",
            printMagazineBatch
        );


    $("modal")
        ?.addEventListener(
            "click",
            event => {

                if(
                    event.target ===
                    $("modal")
                ){

                    closeModal();

                }

            }
        );

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.showPage =
    showPage;

window.loadAllData =
    loadAllData;

window.renderMembers =
    renderMembers;

window.resetMemberFilter =
    resetMemberFilter;

window.renderPayments =
    renderPayments;

window.approvePayment =
    approvePayment;

window.rejectPayment =
    rejectPayment;

window.viewMember =
    viewMember;

window.renderBatchManagement =
    renderBatchManagement;

window.openBatchMembers =
    openBatchMembers;

window.renderIdCards =
    renderIdCards;

window.previewSelectedIdCards =
    previewSelectedIdCards;

window.quickPrintId =
    quickPrintId;

window.downloadIdCard =
    downloadIdCard;

window.printSingleIdCard =
    printSingleIdCard;

window.renderFoodMembers =
    renderFoodMembers;

window.previewFoodTokens =
    previewFoodTokens;

window.quickPrintFood =
    quickPrintFood;

window.renderAttendance =
    renderAttendance;

window.renderMagazine =
    renderMagazine;

window.viewMagazineSubmission =
    viewMagazineSubmission;

window.printSingleMagazine =
    printSingleMagazine;

window.printMagazineBatch =
    printMagazineBatch;

window.previewMagazineFiltered =
    previewMagazineFiltered;

window.downloadMagazineSubmission =
    downloadMagazineSubmission;

window.renderMemberPhotoBank =
    renderMemberPhotoBank;

window.previewMemberPhotoBank =
    previewMemberPhotoBank;

window.downloadMemberPhotoBank =
    downloadMemberPhotoBank;

window.renderReports =
    renderReports;

window.renderDustbin =
    renderDustbin;

window.downloadMembersCSV =
    downloadMembersCSV;

window.downloadPaymentsCSV =
    downloadPaymentsCSV;

window.downloadMagazineCSV =
    downloadMagazineCSV;

window.downloadReportCSV =
    downloadReportCSV;

window.closeModal =
    closeModal;


/* =========================================================
   OPTIONAL GLOBAL HELPERS
========================================================= */

window.refreshMemberPhotoBank =
    function(){

        renderMemberPhotoBank();

    };


window.printMagazine =
    function(){

        printMagazineBatch();

    };


/* =========================================================
   INIT
========================================================= */

function initAdminDashboard(){

    setupEvents();

    showPage(
        "dashboard"
    );

    startCountdown();

    loadAllData();

}


if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        initAdminDashboard
    );

}else{

    initAdminDashboard();

}