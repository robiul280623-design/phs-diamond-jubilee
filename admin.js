// @ts-nocheck

/* =========================================================
   PAHARCHANDA HIGH SCHOOL
   GRAND REUNION 2027
   ADMIN DASHBOARD
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
"https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
"sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   DATABASE / STORAGE
========================================================= */

const ALUMNI_TABLE =
"alumni";

const MAGAZINE_TABLE =
"magazine_submissions";

const MAGAZINE_BUCKET =
"magazine-files";


/* =========================================================
   STATE
========================================================= */

let alumniData = [];

let magazineData = [];

let galleryData = [];

let attendanceData = [];

let foodData = [];


/* =========================================================
   HELPERS
========================================================= */

function value(
    obj,
    ...keys
){

    for(
        const key of keys
    ){

        if(
            obj &&
            obj[key] !== undefined &&
            obj[key] !== null
        ){

            return obj[key];

        }

    }

    return "";

}


function escapeHTML(text){

    return String(
        text ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


function sanitizeFilename(name){

    return String(
        name ||
        "download"
    )
    .replace(
        /[<>:"/\\|?*\x00-\x1F]/g,
        "_"
    )
    .replace(
        /\s+/g,
        "_"
    )
    .substring(
        0,
        80
    );

}


function formatDate(date){

    if(!date){

        return "—";

    }

    try{

        return new Date(
            date
        ).toLocaleString(
            "en-BD"
        );

    }catch{

        return String(date);

    }

}


function formatStatus(status){

    const text =
        String(
            status ||
            "Pending"
        );

    const lower =
        text.toLowerCase();

    let cls =
        "status-pending";


    if(
        lower.includes("approve") ||
        lower === "paid" ||
        lower === "confirmed"
    ){

        cls =
            "status-approved";

    }


    if(
        lower.includes("reject") ||
        lower.includes("cancel")
    ){

        cls =
            "status-rejected";

    }


    return `
        <span class="status ${cls}">
            ${escapeHTML(text)}
        </span>
    `;

}


/* =========================================================
   JSON / STORAGE PARSER
========================================================= */

function parseStorageValue(raw){

    if(!raw){

        return [];

    }


    if(Array.isArray(raw)){

        return raw;

    }


    if(
        typeof raw ===
        "string"
    ){

        const text =
            raw.trim();


        if(!text){

            return [];

        }


        try{

            const parsed =
                JSON.parse(text);


            if(
                Array.isArray(parsed)
            ){

                return parsed;

            }


            if(
                typeof parsed ===
                "string"
            ){

                return [parsed];

            }

        }catch(error){

            // normal text/path

        }


        return [text];

    }


    return [];

}


/* =========================================================
   MAGAZINE STORAGE PATH
========================================================= */

function getMagazinePaths(row){

    const rawValues = [

        ...parseStorageValue(
            row.photo_path
        ),

        ...parseStorageValue(
            row.image_path
        ),

        ...parseStorageValue(
            row.storage_path
        )

    ];


    const paths = [];


    rawValues.forEach(
        item => {

            if(!item){

                return;

            }


            let path =
                String(item).trim();


            if(!path){

                return;

            }


            /*
             * Full Supabase URL
             */

            if(
                /^https?:\/\//i.test(
                    path
                )
            ){

                try{

                    const url =
                        new URL(path);


                    const markers = [

                        `/object/public/${MAGAZINE_BUCKET}/`,

                        `/object/sign/${MAGAZINE_BUCKET}/`,

                        `/object/authenticated/${MAGAZINE_BUCKET}/`

                    ];


                    let found =
                        false;


                    for(
                        const marker
                        of markers
                    ){

                        const index =
                            url.pathname.indexOf(
                                marker
                            );


                        if(
                            index !== -1
                        ){

                            path =
                                url.pathname.substring(
                                    index +
                                    marker.length
                                );

                            found =
                                true;

                            break;

                        }

                    }


                    if(!found){

                        return;

                    }

                }catch(error){

                    return;

                }

            }


            path =
                path.replace(
                    /^\/+/,
                    ""
                );


            const prefix =
                MAGAZINE_BUCKET +
                "/";


            if(
                path.startsWith(
                    prefix
                )
            ){

                path =
                    path.substring(
                        prefix.length
                    );

            }


            if(
                path &&
                !paths.includes(
                    path
                )
            ){

                paths.push(
                    path
                );

            }

        }
    );


    return paths;

}


/* =========================================================
   MAGAZINE IMAGE URLS
========================================================= */

function getMagazineImageUrls(row){

    const urls = [];


    /*
     * Existing URLs
     */

    const storedUrls = [

        ...parseStorageValue(
            row.photo_url
        ),

        ...parseStorageValue(
            row.image_url
        ),

        ...parseStorageValue(
            row.file_url
        )

    ];


    storedUrls.forEach(
        item => {

            if(!item){

                return;

            }


            const url =
                String(item).trim();


            if(
                /^https?:\/\//i.test(
                    url
                ) &&
                !urls.includes(
                    url
                )
            ){

                urls.push(
                    url
                );

            }

        }
    );


    /*
     * Storage paths
     */

    const paths =
        getMagazinePaths(
            row
        );


    paths.forEach(
        path => {

            try{

                const {
                    data
                } =
                    supabaseClient
                        .storage
                        .from(
                            MAGAZINE_BUCKET
                        )
                        .getPublicUrl(
                            path
                        );


                if(
                    data?.publicUrl &&
                    !urls.includes(
                        data.publicUrl
                    )
                ){

                    urls.push(
                        data.publicUrl
                    );

                }

            }catch(error){

                console.error(
                    "Image URL Error:",
                    error
                );

            }

        }
    );


    return urls;

}


/* =========================================================
   AUTH
========================================================= */

async function checkAdmin(){

    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();


        if(error){

            console.error(
                error
            );

            showLogin();

            return;

        }


        if(
            data &&
            data.session
        ){

            showAdmin();

            return;

        }


        showLogin();

    }catch(error){

        console.error(
            "Auth check:",
            error
        );

        showLogin();

    }

}


function showLogin(){

    document.getElementById(
        "loginScreen"
    ).style.display =
        "flex";


    document.getElementById(
        "adminApp"
    ).style.display =
        "none";

}


function showAdmin(){

    document.getElementById(
        "loginScreen"
    ).style.display =
        "none";


    document.getElementById(
        "adminApp"
    ).style.display =
        "block";


    loadAllData();

}


/* =========================================================
   LOGIN
========================================================= */

document.getElementById(
    "loginBtn"
).addEventListener(
    "click",
    loginAdmin
);


document.getElementById(
    "adminPassword"
).addEventListener(
    "keydown",
    event => {

        if(
            event.key ===
            "Enter"
        ){

            loginAdmin();

        }

    }
);


async function loginAdmin(){

    const email =
        document.getElementById(
            "adminEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "adminPassword"
        ).value;


    const message =
        document.getElementById(
            "loginMessage"
        );


    if(!email){

        message.textContent =
            "Please enter admin email.";

        return;

    }


    if(!password){

        message.textContent =
            "Please enter password.";

        return;

    }


    const btn =
        document.getElementById(
            "loginBtn"
        );


    btn.disabled =
        true;


    btn.textContent =
        "Logging in...";


    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({
                    email,
                    password
                });


        if(error){

            throw error;

        }


        if(
            !data?.session
        ){

            throw new Error(
                "Login session was not created."
            );

        }


        message.textContent =
            "";


        showAdmin();


    }catch(error){

        console.error(
            "Login error:",
            error
        );


        message.textContent =
            error?.message ||
            "Admin login failed.";

    }finally{

        btn.disabled =
            false;

        btn.textContent =
            "Login";

    }

}


/* =========================================================
   LOGOUT
========================================================= */

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    logoutAdmin
);


async function logoutAdmin(){

    try{

        await supabaseClient
            .auth
            .signOut();

    }catch(error){

        console.error(
            error
        );

    }


    showLogin();

}


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(
        ".nav button[data-section]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showSection(
                        button.dataset.section
                    );

                }
            );

        }
    );


function showSection(section){

    document
        .querySelectorAll(
            ".nav button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.section ===
                    section
                );

            }
        );


    document
        .querySelectorAll(
            ".section"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.id ===
                    "section-" +
                    section
                );

            }
        );


    const titles = {

        dashboard:
            "Dashboard",

        alumni:
            "Registered Alumni",

        directory:
            "Alumni Directory",

        payments:
            "Payments",

        magazine:
            "Magazine",

        gallery:
            "Magazine Photos",

        attendance:
            "Attendance",

        food:
            "Food Tokens",

        reports:
            "Reports"

    };


    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[section] ||
        "Admin Dashboard";


    document.getElementById(
        "sidebar"
    ).classList.remove(
        "open"
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

document.getElementById(
    "mobileMenu"
).addEventListener(
    "click",
    () => {

        document.getElementById(
            "sidebar"
        ).classList.toggle(
            "open"
        );

    }
);


/* =========================================================
   LOAD ALL DATA
========================================================= */

async function loadAllData(){

    await Promise.allSettled([

        loadAlumni(),

        loadMagazine(),

        loadAttendance(),

        loadFood()

    ]);

    updateDashboard();

}


/* =========================================================
   ALUMNI
========================================================= */

async function loadAlumni(){

    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    ALUMNI_TABLE
                )
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:false
                    }
                );


        if(error){

            throw error;

        }


        alumniData =
            data || [];


        renderAlumni(
            alumniData
        );


        renderDirectory(
            alumniData
        );


        renderPayments(
            alumniData
        );


        updateDashboard();


    }catch(error){

        console.error(
            "Alumni load error:",
            error
        );


        document.getElementById(
            "alumniTable"
        ).innerHTML = `

            <div class="error-box">

                Unable to load alumni.

                <br>

                ${escapeHTML(
                    error.message
                )}

            </div>

        `;

    }

}


/* =========================================================
   RENDER ALUMNI
========================================================= */

function renderAlumni(data){

    const container =
        document.getElementById(
            "alumniTable"
        );


    if(!data.length){

        container.innerHTML =
            `<div class="empty">
                No alumni found.
            </div>`;

        return;

    }


    container.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>Member ID</th>

                    <th>Name</th>

                    <th>SSC Year</th>

                    <th>Phone</th>

                    <th>Package</th>

                    <th>Payment</th>

                    <th>Status</th>

                    <th>Action</th>

                </tr>

            </thead>

            <tbody>

                ${data.map(
                    x => `

                    <tr>

                        <td>
                            ${escapeHTML(
                                value(
                                    x,
                                    "member_id"
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                value(
                                    x,
                                    "name"
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                value(
                                    x,
                                    "ssc_year"
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                value(
                                    x,
                                    "phone"
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                value(
                                    x,
                                    "package",
                                    "package_name"
                                )
                            )}
                        </td>

                        <td>
                            ${formatStatus(
                                value(
                                    x,
                                    "payment_status"
                                )
                            )}
                        </td>

                        <td>
                            ${formatStatus(
                                value(
                                    x,
                                    "status"
                                )
                            )}
                        </td>

                        <td>

                            <button
                                class="btn btn-primary btn-small"
                                onclick="viewProfile('${x.id}')"
                            >
                                View
                            </button>

                            <button
                                class="btn btn-success btn-small"
                                onclick="approveAlumni('${x.id}')"
                            >
                                ✓ Approve
                            </button>

                        </td>

                    </tr>

                `
                ).join("")}

            </tbody>

        </table>

    `;

}


/* =========================================================
   ALUMNI APPROVE
========================================================= */

async function approveAlumni(id){

    const item =
        alumniData.find(
            x =>
                String(x.id) ===
                String(id)
        );


    if(!item){

        alert(
            "Alumni record not found."
        );

        return;

    }


    const name =
        value(
            item,
            "name"
        ) ||
        "this alumni";


    if(
        !confirm(
            `Are you sure you want to approve ${name}?`
        )
    ){

        return;

    }


    try{

        const {
            error
        } =
            await supabaseClient
                .from(
                    ALUMNI_TABLE
                )
                .update({
                    status: "Approved"
                })
                .eq(
                    "id",
                    id
                );


        if(error){

            throw error;

        }


        /*
         * Update local data
         */

        item.status =
            "Approved";


        /*
         * Refresh all related views
         */

        renderAlumni(
            alumniData
        );


        renderDirectory(
            alumniData
        );


        renderPayments(
            alumniData
        );


        updateDashboard();


        /*
         * Refresh profile modal
         */

        const profileModal =
            document.getElementById(
                "profileModal"
            );


        if(
            profileModal &&
            profileModal.classList.contains(
                "show"
            )
        ){

            viewProfile(
                id
            );

        }


        alert(
            "Alumni approved successfully."
        );


    }catch(error){

        console.error(
            "Alumni approve error:",
            error
        );


        alert(
            "Alumni approval failed:\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );

    }

}


/* =========================================================
   ALUMNI SEARCH
========================================================= */

document.getElementById(
    "alumniSearch"
).addEventListener(
    "input",
    function(){

        const q =
            this.value
                .trim()
                .toLowerCase();


        if(!q){

            renderAlumni(
                alumniData
            );

            return;

        }


        const filtered =
            alumniData.filter(
                x => {

                    return [

                        x.member_id,

                        x.name,

                        x.phone,

                        x.email,

                        x.ssc_year,

                        x.package,

                        x.profession

                    ]
                    .join(" ")
                    .toLowerCase()
                    .includes(q);

                }
            );


        renderAlumni(
            filtered
        );

    }
);


/* =========================================================
   DIRECTORY
========================================================= */

function renderDirectory(data){

    const container =
        document.getElementById(
            "directoryGrid"
        );


    if(!data.length){

        container.innerHTML =
            `<div class="empty">
                No alumni found.
            </div>`;

        return;

    }


    container.innerHTML =
        data.map(
            x => {

                const photo =
                    value(
                        x,
                        "photo_url",
                        "photo_path"
                    );


                return `

                    <div class="card">

                        <div
                            style="
                                display:flex;
                                gap:15px;
                                align-items:center;
                            "
                        >

                            ${
                                photo

                                ?

                                `<img
                                    src="${escapeHTML(photo)}"
                                    style="
                                        width:75px;
                                        height:75px;
                                        border-radius:50%;
                                        object-fit:cover;
                                    "
                                >`

                                :

                                `<div
                                    style="
                                        width:75px;
                                        height:75px;
                                        border-radius:50%;
                                        background:#e2e8f0;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        font-weight:900;
                                        color:#64748b;
                                    "
                                >
                                    PHS
                                </div>`
                            }


                            <div>

                                <div
                                    style="
                                        font-weight:900;
                                    "
                                >
                                    ${escapeHTML(
                                        value(
                                            x,
                                            "name"
                                        )
                                    )}
                                </div>

                                <div
                                    style="
                                        font-size:12px;
                                        color:#64748b;
                                        margin-top:4px;
                                    "
                                >
                                    SSC:
                                    ${escapeHTML(
                                        value(
                                            x,
                                            "ssc_year"
                                        )
                                    )}
                                </div>

                                <button
                                    class="btn btn-primary btn-small"
                                    style="margin-top:8px"
                                    onclick="viewProfile('${x.id}')"
                                >
                                    View Profile
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


document.getElementById(
    "directorySearch"
).addEventListener(
    "input",
    function(){

        const q =
            this.value
                .trim()
                .toLowerCase();


        const filtered =
            alumniData.filter(
                x =>
                    [
                        x.name,
                        x.member_id,
                        x.ssc_year,
                        x.phone,
                        x.profession
                    ]
                    .join(" ")
                    .toLowerCase()
                    .includes(q)
            );


        renderDirectory(
            filtered
        );

    }
);


/* =========================================================
   PROFILE
========================================================= */

function viewProfile(id){

    const x =
        alumniData.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if(!x){

        return;

    }


    const photo =
        value(
            x,
            "photo_url"
        );


    document.getElementById(
        "profileContent"
    ).innerHTML = `

        <div
            style="
                display:flex;
                gap:20px;
                flex-wrap:wrap;
                margin-bottom:20px;
            "
        >

            ${
                photo

                ?

                `<img
                    src="${escapeHTML(photo)}"
                    style="
                        width:120px;
                        height:120px;
                        object-fit:cover;
                        border-radius:14px;
                    "
                >`

                :

                ""
            }


            <div>

                <h2 style="margin:0 0 7px">

                    ${escapeHTML(
                        value(
                            x,
                            "name"
                        )
                    )}

                </h2>


                <div>

                    Member ID:

                    <strong>

                        ${escapeHTML(
                            value(
                                x,
                                "member_id"
                            )
                        )}

                    </strong>

                </div>


                <div>

                    SSC:

                    ${escapeHTML(
                        value(
                            x,
                            "ssc_year"
                        )
                    )}

                </div>

            </div>

        </div>


        <div class="table-wrap">

            <table>

                <tbody>

                    <tr>

                        <th>
                            Father's Name
                        </th>

                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "father_name"
                                )
                            )}

                        </td>

                    </tr>


                    <tr>

                        <th>
                            Mother's Name
                        </th>

                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "mother_name"
                                )
                            )}

                        </td>

                    </tr>


                    <tr>

                        <th>
                            Phone
                        </th>

                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "phone"
                                )
                            )}

                        </td>

                    </tr>


                    <tr>

                        <th>
                            Email
                        </th>

                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "email"
                                )
                            )}

                        </td>

                    </tr>


                    <tr>

                        <th>
                            Profession
                        </th>

                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "profession"
                                )
                            )}

                        </td>

                    </tr>


                    <tr>

                        <th>
                            Address
                        </th>

                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "address"
                                )
                            )}

                        </td>

                    </tr>


                    <tr>

                        <th>
                            Package
                        </th>

                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "package"
                                )
                            )}

                        </td>

                    </tr>


                    <tr>

                        <th>
                            Payment Method
                        </th>

                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "payment_method"
                                )
                            )}

                        </td>

                    </tr>


                    <tr>

                        <th>
                            Payment Status
                        </th>

                        <td>

                            ${formatStatus(
                                value(
                                    x,
                                    "payment_status"
                                )
                            )}

                        </td>

                    </tr>


                    <tr>

                        <th>
                            Registration Status
                        </th>

                        <td>

                            ${formatStatus(
                                value(
                                    x,
                                    "status"
                                )
                            )}

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>


        <div
            style="
                display:flex;
                gap:8px;
                margin-top:15px;
                flex-wrap:wrap;
            "
        >

            <button
                class="btn btn-success"
                onclick="approveAlumni('${x.id}')"
            >
                ✓ Approve Alumni
            </button>


            <button
                class="btn btn-primary"
                onclick="printProfile('${x.id}')"
            >
                🖨 Print Profile
            </button>


            <button
                class="btn btn-danger"
                onclick="deleteAlumni('${x.id}')"
            >
                🗑 Delete
            </button>

        </div>

    `;


    openModal(
        "profileModal"
    );

}


/* =========================================================
   DELETE ALUMNI
========================================================= */

async function deleteAlumni(id){

    if(
        !confirm(
            "Are you sure you want to delete this alumni record?"
        )
    ){

        return;

    }


    try{

        const {
            error
        } =
            await supabaseClient
                .from(
                    ALUMNI_TABLE
                )
                .delete()
                .eq(
                    "id",
                    id
                );


        if(error){

            throw error;

        }


        alumniData =
            alumniData.filter(
                x =>
                    String(x.id) !==
                    String(id)
            );


        renderAlumni(
            alumniData
        );


        renderDirectory(
            alumniData
        );


        renderPayments(
            alumniData
        );


        updateDashboard();


        closeModal(
            "profileModal"
        );


        alert(
            "Alumni deleted successfully."
        );


    }catch(error){

        alert(
            "Delete failed: " +
            error.message
        );

    }

}


/* =========================================================
   PAYMENTS
========================================================= */

function renderPayments(data){

    const container =
        document.getElementById(
            "paymentTable"
        );


    if(!data.length){

        container.innerHTML =
            `<div class="empty">
                No payment records.
            </div>`;

        return;

    }


    container.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>Member ID</th>

                    <th>Name</th>

                    <th>Package</th>

                    <th>Method</th>

                    <th>Status</th>

                    <th>Action</th>

                </tr>

            </thead>

            <tbody>

                ${data.map(
                    x => `

                    <tr>

                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "member_id"
                                )
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "name"
                                )
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "package"
                                )
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "payment_method"
                                )
                            )}

                        </td>


                        <td>

                            ${formatStatus(
                                value(
                                    x,
                                    "payment_status"
                                )
                            )}

                        </td>


                        <td>

                            <button
                                class="btn btn-success btn-small"
                                onclick="approvePayment('${x.id}')"
                            >
                                Approve
                            </button>


                            <button
                                class="btn btn-danger btn-small"
                                onclick="rejectPayment('${x.id}')"
                            >
                                Reject
                            </button>

                        </td>

                    </tr>

                `
                ).join("")}

            </tbody>

        </table>

    `;

}


/* =========================================================
   PAYMENT SEARCH
========================================================= */

document.getElementById(
    "paymentSearch"
).addEventListener(
    "input",
    function(){

        const q =
            this.value
                .trim()
                .toLowerCase();


        const filtered =
            alumniData.filter(
                x =>
                    [
                        x.name,
                        x.member_id,
                        x.phone,
                        x.package,
                        x.payment_method
                    ]
                    .join(" ")
                    .toLowerCase()
                    .includes(q)
            );


        renderPayments(
            filtered
        );

    }
);


/* =========================================================
   PAYMENT APPROVE
========================================================= */

async function approvePayment(id){

    await updatePaymentStatus(
        id,
        "Approved"
    );

}


/* =========================================================
   PAYMENT REJECT
========================================================= */

async function rejectPayment(id){

    await updatePaymentStatus(
        id,
        "Rejected"
    );

}


/* =========================================================
   PAYMENT UPDATE
========================================================= */

async function updatePaymentStatus(
    id,
    status
){

    try{

        const {
            error
        } =
            await supabaseClient
                .from(
                    ALUMNI_TABLE
                )
                .update({
                    payment_status:
                        status
                })
                .eq(
                    "id",
                    id
                );


        if(error){

            throw error;

        }


        const item =
            alumniData.find(
                x =>
                    String(x.id) ===
                    String(id)
            );


        if(item){

            item.payment_status =
                status;

        }


        renderPayments(
            alumniData
        );


        renderAlumni(
            alumniData
        );


        updateDashboard();


        alert(
            `Payment ${status.toLowerCase()} successfully.`
        );


    }catch(error){

        alert(
            "Payment update failed: " +
            error.message
        );

    }

}


/* =========================================================
   MAGAZINE LOAD
========================================================= */

async function loadMagazine(){

    try{

        document.getElementById(
            "articleContent"
        ).innerHTML = `

            <div class="loading">
                Loading magazine submissions...
            </div>

        `;


        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    MAGAZINE_TABLE
                )
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:false
                    }
                );


        if(error){

            throw error;

        }


        magazineData =
            data || [];


        galleryData =
            magazineData.filter(
                isPhotoSubmission
            );


        renderMagazineArticles();


        renderMagazinePhotos();


        populateMagazineBatches();


        updateDashboard();


    }catch(error){

        console.error(
            "Magazine loading error:",
            error
        );


        document.getElementById(
            "articleContent"
        ).innerHTML = `

            <div class="error-box">

                Unable to load magazine submissions.

                <br><br>

                ${escapeHTML(
                    error.message
                )}

            </div>

        `;

    }

}


/* =========================================================
   MAGAZINE TYPE
========================================================= */

function isPhotoSubmission(row){

    const type =
        String(
            value(
                row,
                "submission_type",
                "type",
                "content_type",
                "category"
            )
        )
        .toLowerCase();


    if(
        type === "photo"
    ){

        return true;

    }


    if(
        parseStorageValue(
            row.photo_path
        ).length > 0
    ){

        return true;

    }


    if(
        parseStorageValue(
            row.photo_url
        ).length > 0
    ){

        return true;

    }


    return false;

}


/* =========================================================
   MAGAZINE ARTICLES
========================================================= */

function renderMagazineArticles(){

    const container =
        document.getElementById(
            "articleContent"
        );


    const search =
        document.getElementById(
            "magazineSearch"
        )
        ?.value
        ?.trim()
        ?.toLowerCase() ||
        "";


    const articles =
        magazineData.filter(
            x =>
                !isPhotoSubmission(x)
        )
        .filter(
            x => {

                if(!search){

                    return true;

                }


                return [

                    x.name,

                    x.ssc_year,

                    x.title,

                    x.description,

                    x.content

                ]
                .join(" ")
                .toLowerCase()
                .includes(search);

            }
        );


    if(!articles.length){

        container.innerHTML =
            `<div class="empty">
                No writings found.
            </div>`;

        return;

    }


    container.innerHTML = `

        <div class="magazine-grid">

            ${articles.map(
                x => `

                <div class="magazine-card">

                    <div class="magazine-card-body">

                        <div class="magazine-title">

                            ${escapeHTML(
                                value(
                                    x,
                                    "title"
                                ) ||
                                "Untitled"
                            )}

                        </div>


                        <div class="magazine-meta">

                            By:
                            ${escapeHTML(
                                value(
                                    x,
                                    "name"
                                )
                            )}

                            &nbsp; • &nbsp;

                            SSC:
                            ${escapeHTML(
                                value(
                                    x,
                                    "ssc_year"
                                )
                            )}

                            &nbsp; • &nbsp;

                            Category:
                            ${escapeHTML(
                                value(
                                    x,
                                    "description"
                                )
                            )}

                        </div>


                        <div class="magazine-content">

                            ${escapeHTML(
                                value(
                                    x,
                                    "content"
                                )
                            )}

                        </div>


                        <div class="magazine-actions">

                            <button
                                class="btn btn-primary btn-small"
                                onclick="viewArticle('${x.id}')"
                            >
                                👁 View
                            </button>


                            <button
                                class="btn btn-success btn-small"
                                onclick="downloadArticle('${x.id}')"
                            >
                                ⬇ Download
                            </button>


                            <button
                                class="btn btn-danger btn-small"
                                onclick="deleteMagazine('${x.id}')"
                            >
                                🗑 Delete
                            </button>

                        </div>

                    </div>

                </div>

            `
            ).join("")}

        </div>

    `;

}


/* =========================================================
   MAGAZINE SEARCH
========================================================= */

document.getElementById(
    "magazineSearch"
).addEventListener(
    "input",
    renderMagazineArticles
);


/* =========================================================
   ARTICLE VIEW
========================================================= */

function viewArticle(id){

    const x =
        magazineData.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if(!x){

        return;

    }


    document.getElementById(
        "articleModalTitle"
    ).textContent =
        value(
            x,
            "title"
        ) ||
        "Magazine Writing";


    document.getElementById(
        "articleModalMeta"
    ).innerHTML = `

        By:

        <strong>

            ${escapeHTML(
                value(
                    x,
                    "name"
                )
            )}

        </strong>

        &nbsp; • &nbsp;

        SSC:

        ${escapeHTML(
            value(
                x,
                "ssc_year"
            )
        )}

        &nbsp; • &nbsp;

        Category:

        ${escapeHTML(
            value(
                x,
                "description"
            )
        )}

    `;


    document.getElementById(
        "articleModalContent"
    ).textContent =
        value(
            x,
            "content"
        );


    openModal(
        "articleModal"
    );

}


/* =========================================================
   ARTICLE DOWNLOAD
========================================================= */

function downloadArticle(id){

    const x =
        magazineData.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if(!x){

        return;

    }


    const title =
        sanitizeFilename(
            value(
                x,
                "title"
            ) ||
            "magazine-writing"
        );


    const author =
        sanitizeFilename(
            value(
                x,
                "name"
            ) ||
            "alumni"
        );


    const text = [

        value(
            x,
            "title"
        ),

        "",

        "Author: " +
            value(
                x,
                "name"
            ),

        "SSC Batch: " +
            value(
                x,
                "ssc_year"
            ),

        "Category: " +
            value(
                x,
                "description"
            ),

        "",

        value(
            x,
            "content"
        )

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
        `${title}-${author}.txt`;


    document.body.appendChild(a);


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
   MAGAZINE PHOTO RENDER
========================================================= */

function renderMagazinePhotos(){

    const container =
        document.getElementById(
            "photoGallery"
        );


    if(!container){

        return;

    }


    let data =
        galleryData.slice();


    const search =
        document.getElementById(
            "gallerySearch"
        )
        ?.value
        ?.trim()
        ?.toLowerCase() ||
        "";


    const batch =
        document.getElementById(
            "galleryBatch"
        )
        ?.value ||
        "";


    data =
        data.filter(
            x => {

                const name =
                    value(
                        x,
                        "name"
                    );


                const year =
                    value(
                        x,
                        "ssc_year"
                    );


                const description =
                    value(
                        x,
                        "description"
                    );


                const matchesSearch =
                    !search ||
                    [
                        name,
                        year,
                        description
                    ]
                    .join(" ")
                    .toLowerCase()
                    .includes(search);


                const matchesBatch =
                    !batch ||
                    String(year) ===
                    String(batch);


                return (
                    matchesSearch &&
                    matchesBatch
                );

            }
        );


    if(!data.length){

        container.innerHTML =
            `<div class="empty">
                No photos found.
            </div>`;

        return;

    }


    container.innerHTML =
        data.map(
            renderPhotoCard
        ).join("");

}


/* =========================================================
   PHOTO CARD
========================================================= */

function renderPhotoCard(x){

    const images =
        getMagazineImageUrls(
            x
        );


    const name =
        value(
            x,
            "name",
            "member_name"
        ) ||
        "Unknown Member";


    const batch =
        value(
            x,
            "ssc_year",
            "ssc_batch",
            "batch"
        ) ||
        "N/A";


    const description =
        value(
            x,
            "description",
            "photo_description"
        ) ||
        "No description";


    const firstImage =
        images.length
            ? images[0]
            : "";


    return `

        <div class="gallery-card">

            <div class="gallery-image-wrap">

                ${
                    firstImage

                    ?

                    `

                    <img
                        src="${escapeHTML(firstImage)}"
                        class="gallery-image"
                        loading="lazy"
                        alt="${escapeHTML(name)}"

                        onerror="
                            this.style.display='none';
                            this.nextElementSibling.style.display='flex';
                        "
                    >

                    <div
                        class="gallery-placeholder"
                        style="display:none"
                    >
                        Image unavailable
                    </div>

                    `

                    :

                    `

                    <div
                        class="gallery-placeholder"
                    >
                        Image unavailable
                    </div>

                    `
                }


                ${
                    images.length > 1

                    ?

                    `

                    <span
                        style="
                            position:absolute;
                            top:10px;
                            right:10px;
                            background:rgba(0,0,0,.75);
                            color:#fff;
                            padding:5px 10px;
                            border-radius:20px;
                            font-size:12px;
                            font-weight:800;
                        "
                    >
                        ${images.length}
                        Photos
                    </span>

                    `

                    :

                    ""

                }

            </div>


            <div class="gallery-info">

                <div class="gallery-name">

                    ${escapeHTML(name)}

                </div>


                <div class="gallery-batch">

                    SSC Batch:
                    ${escapeHTML(batch)}

                </div>


                <div class="gallery-description">

                    ${escapeHTML(description)}

                </div>


                <div class="gallery-actions">

                    <button
                        class="btn btn-primary btn-small"
                        onclick="viewPhoto('${x.id}')"
                    >
                        👁 View
                    </button>


                    <button
                        class="btn btn-success btn-small"
                        onclick="downloadPhoto('${x.id}')"
                    >
                        ⬇ Download
                    </button>


                    <button
                        class="btn btn-danger btn-small"
                        onclick="deleteMagazine('${x.id}')"
                    >
                        🗑 Delete
                    </button>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   GALLERY SEARCH
========================================================= */

document.getElementById(
    "gallerySearch"
).addEventListener(
    "input",
    renderMagazinePhotos
);


document.getElementById(
    "galleryBatch"
).addEventListener(
    "change",
    renderMagazinePhotos
);


/* =========================================================
   BATCH FILTER
========================================================= */

function populateMagazineBatches(){

    const select =
        document.getElementById(
            "galleryBatch"
        );


    if(!select){

        return;

    }


    const batches =
        [
            ...new Set(
                galleryData
                    .map(
                        x =>
                            value(
                                x,
                                "ssc_year"
                            )
                    )
                    .filter(Boolean)
                    .map(String)
            )
        ]
        .sort(
            (a,b) =>
                Number(a) -
                Number(b)
        );


    select.innerHTML = `

        <option value="">
            All Batches
        </option>

        ${batches.map(
            year => `

            <option value="${escapeHTML(year)}">
                ${escapeHTML(year)}
            </option>

        `
        ).join("")}

    `;

}


/* =========================================================
   VIEW PHOTO
========================================================= */

function viewPhoto(id){

    const item =
        magazineData.find(
            x =>
                String(x.id) ===
                String(id)
        );


    if(!item){

        alert(
            "Magazine submission not found."
        );

        return;

    }


    const images =
        getMagazineImageUrls(
            item
        );


    const name =
        value(
            item,
            "name",
            "member_name"
        ) ||
        "Unknown Member";


    const batch =
        value(
            item,
            "ssc_year",
            "ssc_batch",
            "batch"
        ) ||
        "N/A";


    const description =
        value(
            item,
            "description",
            "photo_description"
        ) ||
        "";


    document.getElementById(
        "photoModalTitle"
    ).textContent =
        name;


    document.getElementById(
        "photoModalMeta"
    ).innerHTML = `

        Member:

        <strong>
            ${escapeHTML(name)}
        </strong>

        &nbsp; • &nbsp;

        SSC Batch:

        <strong>
            ${escapeHTML(batch)}
        </strong>

        &nbsp; • &nbsp;

        Photos:

        <strong>
            ${images.length}
        </strong>

    `;


    const mainImage =
        document.getElementById(
            "photoModalImage"
        );


    if(images.length){

        mainImage.src =
            images[0];

        mainImage.style.display =
            "block";

    }else{

        mainImage.src =
            "";

        mainImage.style.display =
            "none";

    }


    document.getElementById(
        "photoModalDescription"
    ).textContent =
        description;


    const gallery =
        document.getElementById(
            "photoModalGallery"
        );


    gallery.innerHTML =
        "";


    images.forEach(
        (url,index) => {

            const img =
                document.createElement(
                    "img"
                );


            img.src =
                url;


            img.alt =
                "Photo " +
                (index + 1);


            img.style.cssText = `

                width:100px;

                height:80px;

                object-fit:cover;

                border-radius:8px;

                cursor:pointer;

                border:2px solid transparent;

            `;


            img.onclick =
                () => {

                    mainImage.src =
                        url;

                };


            gallery.appendChild(
                img
            );

        }
    );


    openModal(
        "photoModal"
    );

}


/* =========================================================
   DOWNLOAD PHOTO
========================================================= */

async function downloadPhoto(id){

    const item =
        magazineData.find(
            x =>
                String(x.id) ===
                String(id)
        );


    if(!item){

        alert(
            "Magazine submission not found."
        );

        return;

    }


    const paths =
        getMagazinePaths(
            item
        );


    const urls =
        getMagazineImageUrls(
            item
        );


    if(
        !paths.length &&
        !urls.length
    ){

        alert(
            "No photo found."
        );

        return;

    }


    /*
     * First attempt:
     * download directly from Storage.
     */

    if(paths.length){

        try{

            const {
                data,
                error
            } =
                await supabaseClient
                    .storage
                    .from(
                        MAGAZINE_BUCKET
                    )
                    .download(
                        paths[0]
                    );


            if(
                !error &&
                data
            ){

                const blobUrl =
                    URL.createObjectURL(
                        data
                    );


                const name =
                    sanitizeFilename(
                        value(
                            item,
                            "name"
                        ) ||
                        "magazine-photo"
                    );


                const a =
                    document.createElement(
                        "a"
                    );


                a.href =
                    blobUrl;


                a.download =
                    `${name}-magazine-photo.jpg`;


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
                    1000
                );


                return;

            }

        }catch(error){

            console.warn(
                "Storage download failed:",
                error
            );

        }

    }


    /*
     * Public URL fallback
     */

    if(urls.length){

        try{

            const response =
                await fetch(
                    urls[0]
                );


            if(
                response.ok
            ){

                const blob =
                    await response.blob();


                const blobUrl =
                    URL.createObjectURL(
                        blob
                    );


                const name =
                    sanitizeFilename(
                        value(
                            item,
                            "name"
                        ) ||
                        "magazine-photo"
                    );


                const a =
                    document.createElement(
                        "a"
                    );


                a.href =
                    blobUrl;


                a.download =
                    `${name}-magazine-photo.jpg`;


                document.body.appendChild(a);


                a.click();


                a.remove();


                setTimeout(
                    () =>
                        URL.revokeObjectURL(
                            blobUrl
                        ),
                    1000
                );


                return;

            }

        }catch(error){

            console.warn(
                "Public download failed:",
                error
            );

        }


        window.open(
            urls[0],
            "_blank"
        );

    }

}


/* =========================================================
   DELETE MAGAZINE
========================================================= */

async function deleteMagazine(id){

    const item =
        magazineData.find(
            x =>
                String(x.id) ===
                String(id)
        );


    if(!item){

        alert(
            "Magazine submission not found."
        );

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to permanently delete this submission and its photos?"
        );


    if(!confirmed){

        return;

    }


    try{

        /*
         * Delete Storage files
         */

        const paths =
            getMagazinePaths(
                item
            );


        if(paths.length){

            const {
                error:
                    storageError
            } =
                await supabaseClient
                    .storage
                    .from(
                        MAGAZINE_BUCKET
                    )
                    .remove(
                        paths
                    );


            if(storageError){

                console.warn(
                    "Storage delete warning:",
                    storageError
                );

            }

        }


        /*
         * Delete database row
         */

        const {
            error
        } =
            await supabaseClient
                .from(
                    MAGAZINE_TABLE
                )
                .delete()
                .eq(
                    "id",
                    id
                );


        if(error){

            throw error;

        }


        magazineData =
            magazineData.filter(
                x =>
                    String(x.id) !==
                    String(id)
            );


        galleryData =
            magazineData.filter(
                isPhotoSubmission
            );


        renderMagazineArticles();


        renderMagazinePhotos();


        populateMagazineBatches();


        updateDashboard();


        alert(
            "Magazine submission deleted successfully."
        );


    }catch(error){

        console.error(
            "Magazine delete error:",
            error
        );


        alert(
            "Delete failed: " +
            (
                error?.message ||
                "Unknown error"
            )
        );

    }

}


/* =========================================================
   ATTENDANCE
========================================================= */

async function loadAttendance(){

    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "attendance"
                )
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:false
                    }
                );


        if(error){

            throw error;

        }


        attendanceData =
            data || [];


        renderAttendance();


        updateDashboard();


    }catch(error){

        console.warn(
            "Attendance load:",
            error.message
        );


        attendanceData =
            [];


        document.getElementById(
            "attendanceTable"
        ).innerHTML = `

            <div class="empty">

                Attendance table is empty
                or unavailable.

                <br>

                <small>

                    ${escapeHTML(
                        error.message
                    )}

                </small>

            </div>

        `;

    }

}


/* =========================================================
   ATTENDANCE RENDER
========================================================= */

function renderAttendance(){

    const container =
        document.getElementById(
            "attendanceTable"
        );


    if(!attendanceData.length){

        container.innerHTML =
            `<div class="empty">
                No attendance records.
            </div>`;

        return;

    }


    container.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>Member ID</th>

                    <th>Alumni ID</th>

                    <th>Check-in</th>

                    <th>Created</th>

                </tr>

            </thead>

            <tbody>

                ${attendanceData.map(
                    x => `

                    <tr>

                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "member_id"
                                )
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "alumni_id"
                                )
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "check_in",
                                    "checked_in",
                                    "attendance_time"
                                )
                            )}

                        </td>


                        <td>

                            ${formatDate(
                                value(
                                    x,
                                    "created_at"
                                )
                            )}

                        </td>

                    </tr>

                `
                ).join("")}

            </tbody>

        </table>

    `;

}


/* =========================================================
   FOOD TOKEN
========================================================= */

async function loadFood(){

    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "food_tokens"
                )
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:false
                    }
                );


        if(error){

            throw error;

        }


        foodData =
            data || [];


        renderFood();


        updateDashboard();


    }catch(error){

        console.warn(
            "Food load:",
            error.message
        );


        foodData =
            [];


        document.getElementById(
            "foodTable"
        ).innerHTML = `

            <div class="empty">

                Food token table is empty
                or unavailable.

                <br>

                <small>

                    ${escapeHTML(
                        error.message
                    )}

                </small>

            </div>

        `;

    }

}


/* =========================================================
   FOOD RENDER
========================================================= */

function renderFood(){

    const container =
        document.getElementById(
            "foodTable"
        );


    if(!foodData.length){

        container.innerHTML =
            `<div class="empty">
                No food token records.
            </div>`;

        return;

    }


    container.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>Member ID</th>

                    <th>Token</th>

                    <th>Collected</th>

                    <th>Created</th>

                </tr>

            </thead>

            <tbody>

                ${foodData.map(
                    x => `

                    <tr>

                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "member_id"
                                )
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                value(
                                    x,
                                    "token",
                                    "token_id",
                                    "food_token"
                                )
                            )}

                        </td>


                        <td>

                            ${formatStatus(
                                value(
                                    x,
                                    "status",
                                    "collected"
                                )
                            )}

                        </td>


                        <td>

                            ${formatDate(
                                value(
                                    x,
                                    "created_at"
                                )
                            )}

                        </td>

                    </tr>

                `
                ).join("")}

            </tbody>

        </table>

    `;

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard(){

    const total =
        alumniData.length;


    document.getElementById(
        "totalAlumni"
    ).textContent =
        total;


    /*
     * Payment approval count
     * This remains separate from
     * Alumni approval.
     */

    const approved =
        alumniData.filter(
            x =>
                String(
                    value(
                        x,
                        "payment_status"
                    )
                )
                .toLowerCase()
                .includes(
                    "approve"
                )
        ).length;


    document.getElementById(
        "approvedPayments"
    ).textContent =
        approved;


    document.getElementById(
        "totalMagazine"
    ).textContent =
        magazineData.length;


    document.getElementById(
        "totalPhotos"
    ).textContent =
        galleryData.length;


    /*
     * Gender
     */

    const male =
        alumniData.filter(
            x =>
                String(
                    value(
                        x,
                        "gender",
                        "sex"
                    )
                )
                .toLowerCase()
                .startsWith("m")
        ).length;


    const female =
        alumniData.filter(
            x =>
                String(
                    value(
                        x,
                        "gender",
                        "sex"
                    )
                )
                .toLowerCase()
                .startsWith("f")
        ).length;


    document.getElementById(
        "maleCount"
    ).textContent =
        male;


    document.getElementById(
        "femaleCount"
    ).textContent =
        female;


    document.getElementById(
        "attendanceCount"
    ).textContent =
        attendanceData.length;


    document.getElementById(
        "foodCount"
    ).textContent =
        foodData.length;


    renderPackageSummary();

}


/* =========================================================
   PACKAGE SUMMARY
========================================================= */

function renderPackageSummary(){

    const container =
        document.getElementById(
            "packageSummary"
        );


    const packages = {};


    alumniData.forEach(
        x => {

            const p =
                value(
                    x,
                    "package",
                    "package_name"
                ) ||
                "Not specified";


            packages[p] =
                (
                    packages[p] ||
                    0
                ) + 1;

        }
    );


    const rows =
        Object.entries(
            packages
        );


    if(!rows.length){

        container.innerHTML =
            `<div class="empty">
                No package data.
            </div>`;

        return;

    }


    container.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>Package</th>

                    <th>Members</th>

                </tr>

            </thead>

            <tbody>

                ${rows.map(
                    ([name,count]) => `

                    <tr>

                        <td>

                            ${escapeHTML(name)}

                        </td>

                        <td>

                            <strong>
                                ${count}
                            </strong>

                        </td>

                    </tr>

                `
                ).join("")}

            </tbody>

        </table>

    `;

}


/* =========================================================
   MODAL
========================================================= */

function openModal(id){

    const modal =
        document.getElementById(
            id
        );


    if(modal){

        modal.classList.add(
            "show"
        );

    }

}


function closeModal(id){

    const modal =
        document.getElementById(
            id
        );


    if(modal){

        modal.classList.remove(
            "show"
        );

    }

}


document
    .querySelectorAll(
        ".modal"
    )
    .forEach(
        modal => {

            modal.addEventListener(
                "click",
                function(event){

                    if(
                        event.target ===
                        modal
                    ){

                        modal.classList.remove(
                            "show"
                        );

                    }

                }
            );

        }
    );


/* =========================================================
   PRINT PROFILE
========================================================= */

function printProfile(id){

    const x =
        alumniData.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if(!x){

        return;

    }


    const html = `

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Alumni Profile
            </title>

            <style>

                body{
                    font-family:Arial;
                    padding:30px;
                }

                h1{
                    margin-bottom:5px;
                }

                table{
                    width:100%;
                    border-collapse:collapse;
                    margin-top:20px;
                }

                th,
                td{
                    border:1px solid #ddd;
                    padding:10px;
                    text-align:left;
                }

                th{
                    width:30%;
                    background:#f5f5f5;
                }

            </style>

        </head>

        <body>

            <h1>
                Paharchanda High School
            </h1>

            <h2>
                Alumni Profile
            </h2>

            <h3>

                ${escapeHTML(
                    value(
                        x,
                        "name"
                    )
                )}

            </h3>


            <table>

                ${Object.entries(x)
                    .filter(
                        ([key]) =>
                            ![
                                "photo_path",
                                "photo_url"
                            ].includes(key)
                    )
                    .map(
                        ([key,val]) => `

                        <tr>

                            <th>

                                ${escapeHTML(key)}

                            </th>

                            <td>

                                ${escapeHTML(
                                    val
                                )}

                            </td>

                        </tr>

                    `
                    )
                    .join("")}

            </table>

        </body>

        </html>

    `;


    const win =
        window.open(
            "",
            "_blank"
        );


    win.document.write(
        html
    );


    win.document.close();


    win.focus();


    win.print();

}


/* =========================================================
   PRINT ALUMNI
========================================================= */

function printAlumni(){

    window.print();

}


/* =========================================================
   PRINT MAGAZINE
========================================================= */

function printMagazine(){

    window.print();

}


/* =========================================================
   CSV
========================================================= */

function downloadCSV(
    rows,
    filename
){

    if(!rows.length){

        alert(
            "No data available."
        );

        return;

    }


    const headers =
        Object.keys(
            rows[0]
        );


    const csv = [

        headers.join(","),

        ...rows.map(
            row =>
                headers
                    .map(
                        key =>
                            `"${String(
                                row[key] ??
                                ""
                            )
                            .replace(
                                /"/g,
                                '""'
                            )}"`
                    )
                    .join(",")
        )

    ].join("\n");


    const blob =
        new Blob(
            [
                "\ufeff" +
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8"
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


    document.body.appendChild(a);


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
   ALUMNI CSV
========================================================= */

function downloadAlumniCSV(){

    downloadCSV(
        alumniData,
        "paharchanda-alumni.csv"
    );

}


/* =========================================================
   MAGAZINE CSV
========================================================= */

function downloadMagazineCSV(){

    downloadCSV(
        magazineData,
        "paharchanda-magazine-submissions.csv"
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkAdmin();

    }
);


console.log(
    "Paharchanda High School Admin Dashboard initialized."
);


console.log(
    "Magazine bucket:",
    MAGAZINE_BUCKET
);