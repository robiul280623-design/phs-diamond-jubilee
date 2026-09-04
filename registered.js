// @ts-nocheck

/* =========================================================
   PAHARCHANDA HIGH SCHOOL
   GRAND REUNION 2027
   ALUMNI REGISTRATION
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";

let supabaseClient = null;

try {

    if (!window.supabase) {
        throw new Error(
            "Supabase library is not loaded."
        );
    }

    /*
     * PUBLIC REGISTRATION CLIENT
     *
     * Important:
     * Do not reuse an existing Admin session.
     */

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        );

    console.log(
        "Supabase initialized successfully."
    );

} catch (error) {

    console.error(
        "SUPABASE ERROR:",
        error
    );

}


/* =========================================================
   ELEMENTS
========================================================= */

const form =
    document.getElementById(
        "registrationForm"
    );

const message =
    document.getElementById(
        "message"
    );

const submitBtn =
    document.getElementById(
        "submitBtn"
    );

const photoInput =
    document.getElementById(
        "photo"
    );

const photoPreview =
    document.getElementById(
        "photoPreview"
    );

const memberType =
    document.getElementById(
        "member_type"
    );

const category =
    document.getElementById(
        "category"
    );

const currentStudentBox =
    document.getElementById(
        "currentStudentBox"
    );

const currentClass =
    document.getElementById(
        "current_class"
    );

const coupleBox =
    document.getElementById(
        "coupleBox"
    );

const wifeName =
    document.getElementById(
        "wife_name"
    );

const childrenCount =
    document.getElementById(
        "children_count"
    );

const coupleTshirtArea =
    document.getElementById(
        "coupleTshirtArea"
    );

const childrenTshirtArea =
    document.getElementById(
        "childrenTshirtArea"
    );

const memberTshirtSize =
    document.getElementById(
        "member_tshirt_size"
    );

const husbandTshirtSize =
    document.getElementById(
        "husband_tshirt_size"
    );

const wifeTshirtSize =
    document.getElementById(
        "wife_tshirt_size"
    );

const feeAmount =
    document.getElementById(
        "feeAmount"
    );

const feeNote =
    document.getElementById(
        "feeNote"
    );

const paymentAmount =
    document.getElementById(
        "payment_amount"
    );

const sscYearInput =
    document.getElementById(
        "ssc_year"
    );


/* =========================================================
   PAYMENT ELEMENTS
========================================================= */

const paymentMethodInput =
    document.getElementById(
        "payment_method"
    );

const transactionIDInput =
    document.getElementById(
        "transaction_id"
    );

const transactionBox =
    document.getElementById(
        "transactionBox"
    );

const cashReceiverBox =
    document.getElementById(
        "cashReceiverBox"
    );

const cashReceiverInput =
    document.getElementById(
        "cash_receiver"
    );


/* =========================================================
   CONSTANTS
========================================================= */

const BUCKET_NAME =
    "alumni-photos";

const MAX_FILE_SIZE =
    10 * 1024 * 1024;

const MAX_UPLOAD_SIZE =
    150 * 1024;

const MAX_WIDTH =
    1200;

const MAX_HEIGHT =
    1200;


/* =========================================================
   PHOTO PREVIEW URL
========================================================= */

let currentPreviewURL = null;


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   CLEAR PHOTO PREVIEW
========================================================= */

function clearPhotoPreview() {

    if (currentPreviewURL) {

        try {

            URL.revokeObjectURL(
                currentPreviewURL
            );

        } catch (e) {

            console.warn(
                "Preview URL cleanup failed:",
                e
            );

        }

        currentPreviewURL = null;

    }


    if (photoPreview) {

        photoPreview.style.display =
            "none";

        photoPreview.style.backgroundImage =
            "";

    }

}


/* =========================================================
   MESSAGE
========================================================= */

function showProcess(text) {

    if (!message) return;

    message.innerHTML = `
        <div class="process-box">
            ⏳ ${escapeHtml(text)}
        </div>
    `;

}


function showError(text) {

    if (!message) return;

    message.innerHTML = `
        <div class="error-box">

            <strong
                style="
                    display:block;
                    font-size:20px;
                    margin-bottom:8px;
                "
            >
                ❌ Registration Failed
            </strong>

            ${escapeHtml(text)}

        </div>
    `;

    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function showSuccess(memberID, fee) {

    if (!message) return;

    message.innerHTML = `
        <div
            class="success-box"
            style="
                text-align:center;
                padding:25px;
            "
        >

            <div
                style="
                    font-size:42px;
                    margin-bottom:10px;
                "
            >
                ✅
            </div>

            <h2>
                Registration Successful
            </h2>

            <p>
                Your alumni registration has been
                submitted successfully.
            </p>

            <div
                style="
                    margin:20px 0;
                    padding:18px;
                    border-radius:12px;
                    background:#f4f7fb;
                "
            >

                <strong>
                    Membership ID
                </strong>

                <div
                    style="
                        font-size:24px;
                        font-weight:700;
                        margin-top:8px;
                    "
                >
                    ${escapeHtml(memberID)}
                </div>

            </div>

            <p>
                Registration Fee:
                <strong>৳${Number(fee || 0)}</strong>
            </p>

        </div>
    `;

    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   DATABASE REGISTRATION TYPE
========================================================= */

function getRegistrationType(type) {

    if (type === "EX-STUDENT") {
        return "Alumni";
    }

    if (type === "CURRENT STUDENT") {
        return "Student";
    }

    if (type === "COUPLE") {
        return "Couple";
    }

    return null;

}


/* =========================================================
   TOTAL MEMBER COUNT
========================================================= */

function getTotalMembers(type) {

    if (type === "COUPLE") {

        const children =
            Number(
                childrenCount?.value || 0
            );

        return 2 + children;

    }

    return 1;

}


/* =========================================================
   FEE CALCULATION
========================================================= */

function calculateFee() {

    const type =
        memberType?.value || "";

    const selectedCategory =
        category?.value || "";

    let fee = 0;
    let note = "";


    /* =====================================================
       COUPLE
    ===================================================== */

    if (type === "COUPLE") {

        const count =
            Number(
                childrenCount?.value || 0
            );

        fee =
            1800 +
            (count * 500);

        note =
            `Couple ৳1800 + ${count} সন্তান × ৳500`;

    }


    /* =====================================================
       EX-STUDENT
    ===================================================== */

    else if (type === "EX-STUDENT") {

        if (
            selectedCategory ===
            "EX_1986_2023"
        ) {

            fee = 1000;

            note =
                "SSC 1986–2023 → ৳1000";

        }

        else if (
            selectedCategory ===
            "EX_2024_2026"
        ) {

            fee = 700;

            note =
                "SSC 2024–2026 → ৳700";

        }

    }


    /* =====================================================
       CURRENT STUDENT
    ===================================================== */

    else if (
        type ===
        "CURRENT STUDENT"
    ) {

        if (
            selectedCategory ===
            "CLASS_6_7"
        ) {

            fee = 300;

            note =
                "Class 6th–7th → ৳300";

        }

        else if (
            selectedCategory ===
            "CLASS_8"
        ) {

            fee = 400;

            note =
                "Class 8th → ৳400";

        }

        else if (
            selectedCategory ===
            "CLASS_9_10"
        ) {

            fee = 500;

            note =
                "Class 9th–10th → ৳500";

        }

    }


    if (feeAmount) {

        feeAmount.textContent =
            `৳${fee}`;

    }


    if (feeNote) {

        feeNote.textContent =
            note ||
            "সদস্য ধরণ ও ক্যাটাগরি নির্বাচন করুন।";

    }


    if (paymentAmount) {

        paymentAmount.value =
            fee > 0
                ? fee
                : "";

    }


    return fee;

}


/* =========================================================
   SSC YEAR FIELD CONTROL
   IMPORTANT FIX
========================================================= */

function updateSSCYearField() {

    if (!sscYearInput) {
        return;
    }


    const type =
        String(
            memberType?.value || ""
        )
        .trim()
        .toUpperCase();


    /*
     * First try exact wrapper ID.
     * If not found, find the closest form group.
     */

    let sscGroup =
        document.getElementById(
            "sscYearGroup"
        );


    if (!sscGroup) {

        sscGroup =
            sscYearInput.closest(
                ".form-group"
            );

    }


    /* =====================================================
       CURRENT STUDENT
       SSC YEAR MUST BE COMPLETELY HIDDEN
    ===================================================== */

    if (
        type ===
        "CURRENT STUDENT"
    ) {

        if (sscGroup) {

            sscGroup.classList.add(
                "hidden"
            );

            sscGroup.style.display =
                "none";

        }


        sscYearInput.required =
            false;

        sscYearInput.disabled =
            true;

        sscYearInput.value =
            "";

    }


    /* =====================================================
       EX-STUDENT / COUPLE
    ===================================================== */

    else {

        if (sscGroup) {

            sscGroup.classList.remove(
                "hidden"
            );

            sscGroup.style.display =
                "";

        }


        sscYearInput.disabled =
            false;

        sscYearInput.required =
            true;

    }

}


/* =========================================================
   MEMBER TYPE / CATEGORY CONTROL
========================================================= */

function updateRegistrationFields() {

    const type =
        String(
            memberType?.value || ""
        )
        .trim()
        .toUpperCase();


    /* =====================================================
       RESET
    ===================================================== */

    if (currentStudentBox) {

        currentStudentBox.classList.add(
            "hidden"
        );

    }


    if (coupleBox) {

        coupleBox.classList.add(
            "hidden"
        );

    }


    if (coupleTshirtArea) {

        coupleTshirtArea.classList.add(
            "hidden"
        );

    }


    if (memberTshirtSize) {

        memberTshirtSize.classList.remove(
            "hidden"
        );

    }


    /* =====================================================
       SSC CONTROL
    ===================================================== */

    updateSSCYearField();


    /* =====================================================
       EX-STUDENT
    ===================================================== */

    if (
        type ===
        "EX-STUDENT"
    ) {

        category.disabled =
            false;

        category.innerHTML = `

            <option value="">
                Select Category
            </option>

            <option value="EX_1986_2023">
                SSC 1986 – 2023
            </option>

            <option value="EX_2024_2026">
                SSC 2024 – 2026
            </option>

        `;

    }


    /* =====================================================
       CURRENT STUDENT
    ===================================================== */

    else if (
        type ===
        "CURRENT STUDENT"
    ) {

        if (currentStudentBox) {

            currentStudentBox.classList.remove(
                "hidden"
            );

        }


        category.disabled =
            false;

        category.innerHTML = `

            <option value="">
                Select Category
            </option>

            <option value="CLASS_6_7">
                Class 6th – 7th
            </option>

            <option value="CLASS_8">
                Class 8th
            </option>

            <option value="CLASS_9_10">
                Class 9th – 10th
            </option>

        `;


        /*
         * Extra protection:
         * Current student কখনো SSC Year রাখবে না।
         */

        if (sscYearInput) {

            sscYearInput.value = "";

            sscYearInput.disabled =
                true;

            sscYearInput.required =
                false;

        }

    }


    /* =====================================================
       COUPLE
    ===================================================== */

    else if (
        type ===
        "COUPLE"
    ) {

        if (coupleBox) {

            coupleBox.classList.remove(
                "hidden"
            );

        }


        category.disabled =
            false;

        category.innerHTML = `

            <option value="COUPLE">
                Couple
            </option>

        `;

        category.value =
            "COUPLE";


        if (memberTshirtSize) {

            memberTshirtSize.classList.add(
                "hidden"
            );

        }


        if (coupleTshirtArea) {

            coupleTshirtArea.classList.remove(
                "hidden"
            );

        }

    }


    /* =====================================================
       NONE
    ===================================================== */

    else {

        category.disabled =
            false;

        category.innerHTML = `

            <option value="">
                Select Category
            </option>

        `;

    }


    calculateFee();

    updateChildrenTshirts();

    /*
     * Run again after all UI changes.
     * This guarantees SSC Year stays hidden.
     */

    updateSSCYearField();

}


/* =========================================================
   CHILD T-SHIRT SIZE
========================================================= */

function updateChildrenTshirts() {

    if (!childrenTshirtArea) {
        return;
    }


    if (
        memberType?.value !==
        "COUPLE"
    ) {

        childrenTshirtArea.innerHTML =
            "";

        return;

    }


    const count =
        Number(
            childrenCount?.value || 0
        );


    childrenTshirtArea.innerHTML =
        "";


    for (
        let i = 1;
        i <= count;
        i++
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "tshirt-person";


        div.innerHTML = `

            <div class="tshirt-person-title">
                Child ${i} T-Shirt Size
            </div>

            <select
                class="child-tshirt-size"
                data-child="${i}"
                required
            >

                <option value="">
                    Select Size
                </option>

                <option value="S">
                    S
                </option>

                <option value="M">
                    M
                </option>

                <option value="L">
                    L
                </option>

                <option value="XL">
                    XL
                </option>

                <option value="XXL">
                    XXL
                </option>

                <option value="XXXL">
                    XXXL
                </option>

            </select>

        `;


        childrenTshirtArea.appendChild(
            div
        );

    }


    calculateFee();

}


/* =========================================================
   CASH / DIGITAL PAYMENT FIELD CONTROL
========================================================= */

function updatePaymentMethodFields() {

    if (!paymentMethodInput) {
        return;
    }


    const method =
        paymentMethodInput.value;


    /* =====================================================
       CASH
    ===================================================== */

    if (
        method ===
        "Cash"
    ) {

        if (cashReceiverBox) {

            cashReceiverBox.classList.remove(
                "hidden"
            );

        }


        if (cashReceiverInput) {

            cashReceiverInput.required =
                true;

        }


        if (transactionBox) {

            transactionBox.classList.add(
                "hidden"
            );

        }


        if (transactionIDInput) {

            transactionIDInput.required =
                false;

            transactionIDInput.value =
                "";

        }

    }


    /* =====================================================
       DIGITAL
    ===================================================== */

    else {

        if (cashReceiverBox) {

            cashReceiverBox.classList.add(
                "hidden"
            );

        }


        if (cashReceiverInput) {

            cashReceiverInput.required =
                false;

            cashReceiverInput.value =
                "";

        }


        if (transactionBox) {

            transactionBox.classList.remove(
                "hidden"
            );

        }


        if (transactionIDInput) {

            transactionIDInput.required =
                (
                    method === "bKash" ||
                    method === "Nagad" ||
                    method === "Rocket"
                );

        }

    }

}


/* =========================================================
   DATABASE TEST
========================================================= */

async function testDatabase() {

    if (!supabaseClient) {

        throw new Error(
            "Supabase is not initialized."
        );

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("alumni")
            .select("id")
            .limit(1);


    if (error) {

        throw new Error(
            "Database connection failed: " +
            error.message
        );

    }


    return true;

}


/* =========================================================
   PHOTO VALIDATION
========================================================= */

function validatePhoto(file) {

    if (!file) {

        throw new Error(
            "Please select a photo."
        );

    }


    if (
        file.size >
        MAX_FILE_SIZE
    ) {

        throw new Error(
            "Photo size must be 10MB or less."
        );

    }


    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];


    const extension =
        file.name
            .split(".")
            .pop()
            ?.toLowerCase();


    const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "webp"
    ];


    if (
        !allowedTypes.includes(
            file.type
        ) &&
        !allowedExtensions.includes(
            extension
        )
    ) {

        throw new Error(
            "Only JPG, JPEG, PNG or WEBP photos are allowed."
        );

    }

}


/* =========================================================
   SAFE IMAGE LOADER
========================================================= */

async function createSafeImageBitmap(file) {

    try {

        return await createImageBitmap(
            file,
            {
                imageOrientation:
                    "from-image"
            }
        );

    } catch (e1) {

        try {

            return await createImageBitmap(
                file
            );

        } catch (e2) {

            throw new Error(
                "Could not read image."
            );

        }

    }

}


/* =========================================================
   PHOTO PREVIEW
========================================================= */

async function showPhotoPreview(file) {

    clearPhotoPreview();


    if (!file || !photoPreview) {
        return;
    }


    try {

        const bitmap =
            await createSafeImageBitmap(
                file
            );


        const maxPreview =
            700;


        let width =
            bitmap.width;

        let height =
            bitmap.height;


        const scale =
            Math.min(
                1,
                maxPreview / Math.max(
                    width,
                    height
                )
            );


        width =
            Math.round(
                width * scale
            );

        height =
            Math.round(
                height * scale
            );


        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            width;

        canvas.height =
            height;


        const ctx =
            canvas.getContext(
                "2d"
            );


        ctx.drawImage(
            bitmap,
            0,
            0,
            width,
            height
        );


        const blob =
            await new Promise(
                resolve =>
                    canvas.toBlob(
                        resolve,
                        "image/jpeg",
                        0.85
                    )
            );


        if (!blob) {

            bitmap.close();

            return;

        }


        currentPreviewURL =
            URL.createObjectURL(
                blob
            );


        photoPreview.style.backgroundImage =
            `url("${currentPreviewURL}")`;

        photoPreview.style.backgroundSize =
            "cover";

        photoPreview.style.backgroundPosition =
            "center";

        photoPreview.style.display =
            "block";


        bitmap.close();

    } catch (error) {

        console.error(
            "Preview error:",
            error
        );

        clearPhotoPreview();

    }

}


/* =========================================================
   COMPRESS IMAGE
========================================================= */

async function compressImage(file) {

    validatePhoto(file);


    const bitmap =
        await createSafeImageBitmap(
            file
        );


    try {

        let width =
            bitmap.width;

        let height =
            bitmap.height;


        const scale =
            Math.min(
                1,
                MAX_WIDTH / width,
                MAX_HEIGHT / height
            );


        width =
            Math.max(
                1,
                Math.round(
                    width * scale
                )
            );


        height =
            Math.max(
                1,
                Math.round(
                    height * scale
                )
            );


        const canvas =
            document.createElement(
                "canvas"
            );


        const ctx =
            canvas.getContext(
                "2d"
            );


        let quality =
            0.90;


        for (
            let attempt = 0;
            attempt < 20;
            attempt++
        ) {

            canvas.width =
                width;

            canvas.height =
                height;


            ctx.clearRect(
                0,
                0,
                width,
                height
            );


            ctx.drawImage(
                bitmap,
                0,
                0,
                width,
                height
            );


            const blob =
                await new Promise(
                    resolve =>
                        canvas.toBlob(
                            resolve,
                            "image/jpeg",
                            quality
                        )
                );


            if (!blob) {

                throw new Error(
                    "Image compression failed."
                );

            }


            if (
                blob.size <=
                MAX_UPLOAD_SIZE
            ) {

                return blob;

            }


            if (
                quality >
                0.45
            ) {

                quality -=
                    0.06;

            }

            else {

                width =
                    Math.max(
                        400,
                        Math.round(
                            width * 0.85
                        )
                    );

                height =
                    Math.max(
                        400,
                        Math.round(
                            height * 0.85
                        )
                    );

                quality =
                    0.75;

            }

        }


        throw new Error(
            "Unable to compress photo below 150KB."
        );

    } finally {

        try {

            bitmap.close();

        } catch (e) {}

    }

}


/* =========================================================
   MEMBER ID
========================================================= */

async function createMemberID(
    year,
    type
) {

    let prefix;


    if (
        type ===
        "CURRENT STUDENT"
    ) {

        prefix =
            "PHS2A-DJ-CURRENT-";

    }

    else {

        prefix =
            `PHS2A-DJ-${year}-`;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("alumni")
            .select("member_id")
            .like(
                "member_id",
                `${prefix}%`
            );


    if (error) {

        throw new Error(
            "Could not generate Member ID: " +
            error.message
        );

    }


    let maxSerial =
        0;


    (data || []).forEach(
        row => {

            const id =
                String(
                    row.member_id ||
                    ""
                );


            if (
                !id.startsWith(
                    prefix
                )
            ) {

                return;

            }


            const serial =
                Number(
                    id
                        .substring(
                            prefix.length
                        )
                        .replace(
                            /\D/g,
                            ""
                        )
                );


            if (
                Number.isFinite(
                    serial
                ) &&
                serial > maxSerial
            ) {

                maxSerial =
                    serial;

            }

        }
    );


    const next =
        maxSerial + 1;


    return (
        prefix +
        String(next).padStart(
            3,
            "0"
        )
    );

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

if (memberType) {

    memberType.addEventListener(
        "change",
        function () {

            updateRegistrationFields();

            /*
             * Extra SSC protection
             */
            updateSSCYearField();

        }
    );

}


if (category) {

    category.addEventListener(
        "change",
        function () {

            calculateFee();

        }
    );

}


if (childrenCount) {

    childrenCount.addEventListener(
        "change",
        function () {

            updateChildrenTshirts();

            calculateFee();

        }
    );

    childrenCount.addEventListener(
        "input",
        function () {

            updateChildrenTshirts();

            calculateFee();

        }
    );

}


if (paymentMethodInput) {

    paymentMethodInput.addEventListener(
        "change",
        updatePaymentMethodFields
    );

}


if (photoInput) {

    photoInput.addEventListener(
        "change",
        async function () {

            clearPhotoPreview();


            const file =
                photoInput.files?.[0];


            if (!file) {
                return;
            }


            try {

                validatePhoto(file);

                await showPhotoPreview(
                    file
                );

            } catch (error) {

                photoInput.value =
                    "";

                clearPhotoPreview();

                showError(
                    error.message
                );

            }

        }
    );

}


/* =========================================================
   FORM SUBMIT
========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (
                !supabaseClient
            ) {

                showError(
                    "Supabase is not initialized."
                );

                return;

            }


            if (
                submitBtn
            ) {

                submitBtn.disabled =
                    true;

            }


            let uploadedFileName =
                null;


            try {

                /* =================================================
                   DATABASE
                ================================================= */

                showProcess(
                    "Checking database connection..."
                );


                await testDatabase();


                /* =================================================
                   HTML VALIDATION
                ================================================= */

                if (
                    !form.checkValidity()
                ) {

                    form.reportValidity();

                    throw new Error(
                        "Please complete all required fields."
                    );

                }


                /* =================================================
                   BASIC DATA
                ================================================= */

                const name =
                    document.getElementById(
                        "name"
                    )?.value.trim() ||
                    "";

                const fatherName =
                    document.getElementById(
                        "father_name"
                    )?.value.trim() ||
                    "";

                const motherName =
                    document.getElementById(
                        "mother_name"
                    )?.value.trim() ||
                    "";

                const phone =
                    document.getElementById(
                        "phone"
                    )?.value.trim() ||
                    "";

                const email =
                    document.getElementById(
                        "email"
                    )?.value.trim() ||
                    "";

                const profession =
                    document.getElementById(
                        "profession"
                    )?.value.trim() ||
                    "";

                const address =
                    document.getElementById(
                        "address"
                    )?.value.trim() ||
                    "";

                const bloodGroup =
                    document.getElementById(
                        "blood_group"
                    )?.value ||
                    "";

                const education =
                    document.getElementById(
                        "education"
                    )?.value.trim() ||
                    "";

                const type =
                    String(
                        memberType?.value ||
                        ""
                    )
                    .trim()
                    .toUpperCase();


                /* =================================================
                   CATEGORY
                ================================================= */

                const selectedCategory =
                    category?.value ||
                    "";


                /* =================================================
                   SSC YEAR
                ================================================= */

                let sscYear =
                    "";


                /*
                 * CURRENT STUDENT:
                 * SSC Year MUST ALWAYS BE NULL.
                 */

                if (
                    type ===
                    "CURRENT STUDENT"
                ) {

                    sscYear =
                        null;

                }

                else {

                    sscYear =
                        sscYearInput?.value.trim() ||
                        "";

                }


                /* =================================================
                   CURRENT CLASS
                ================================================= */

                let selectedCurrentClass =
                    null;


                if (
                    type ===
                    "CURRENT STUDENT"
                ) {

                    /*
                     * IMPORTANT:
                     * Keep "6th", "7th", "8th", etc.
                     * as TEXT.
                     */

                    selectedCurrentClass =
                        String(
                            currentClass?.value ||
                            ""
                        ).trim();


                    if (
                        !selectedCurrentClass
                    ) {

                        throw new Error(
                            "Please select Current Class."
                        );

                    }

                }


                /* =================================================
                   TYPE VALIDATION
                ================================================= */

                if (
                    ![
                        "EX-STUDENT",
                        "CURRENT STUDENT",
                        "COUPLE"
                    ].includes(type)
                ) {

                    throw new Error(
                        "Please select Member Type."
                    );

                }


                /* =================================================
                   CATEGORY VALIDATION
                ================================================= */

                if (
                    !selectedCategory
                ) {

                    throw new Error(
                        "Please select Category."
                    );

                }


                /* =================================================
                   SSC VALIDATION
                ================================================= */

                if (
                    type !==
                    "CURRENT STUDENT"
                ) {

                    const year =
                        Number(
                            sscYear
                        );


                    if (
                        !Number.isInteger(
                            year
                        ) ||
                        year < 1965 ||
                        year > 2026
                    ) {

                        throw new Error(
                            "Please enter a valid SSC Year."
                        );

                    }

                }


                /* =================================================
                   COUPLE DATA
                ================================================= */

                let wife =
                    null;

                let childCount =
                    0;

                let husbandSize =
                    null;

                let wifeSize =
                    null;

                let childSizes =
                    [];


                if (
                    type ===
                    "COUPLE"
                ) {

                    wife =
                        wifeName?.value.trim() ||
                        "";


                    if (!wife) {

                        throw new Error(
                            "Please enter Wife Name."
                        );

                    }


                    childCount =
                        Number(
                            childrenCount?.value ||
                            0
                        );


                    if (
                        !Number.isInteger(
                            childCount
                        ) ||
                        childCount < 0
                    ) {

                        throw new Error(
                            "Invalid children count."
                        );

                    }


                    husbandSize =
                        husbandTshirtSize?.value ||
                        "";

                    wifeSize =
                        wifeTshirtSize?.value ||
                        "";


                    if (
                        !husbandSize ||
                        !wifeSize
                    ) {

                        throw new Error(
                            "Please select Husband and Wife T-Shirt sizes."
                        );

                    }


                    const childSelects =
                        document.querySelectorAll(
                            ".child-tshirt-size"
                        );


                    childSizes =
                        Array.from(
                            childSelects
                        ).map(
                            select =>
                                select.value
                        );


                    if (
                        childSizes.length !==
                        childCount
                    ) {

                        throw new Error(
                            "Please select all child T-Shirt sizes."
                        );

                    }


                    if (
                        childSizes.some(
                            size => !size
                        )
                    ) {

                        throw new Error(
                            "Please select all child T-Shirt sizes."
                        );

                    }

                }


                /* =================================================
                   NORMAL MEMBER T-SHIRT
                ================================================= */

                let ownSize =
                    null;


                if (
                    type !==
                    "COUPLE"
                ) {

                    ownSize =
                        memberTshirtSize?.value ||
                        "";


                    if (!ownSize) {

                        throw new Error(
                            "Please select T-Shirt size."
                        );

                    }

                }


                /* =================================================
                   FEE
                ================================================= */

                const calculatedFee =
                    calculateFee();


                if (
                    !calculatedFee ||
                    calculatedFee <= 0
                ) {

                    throw new Error(
                        "Please select a valid category."
                    );

                }


                /* =================================================
                   PAYMENT
                ================================================= */

                const paymentMethod =
                    paymentMethodInput?.value ||
                    "";

                let transactionID =
                    null;

                let cashReceiver =
                    null;


                if (!paymentMethod) {

                    throw new Error(
                        "Please select Payment Method."
                    );

                }


                if (
                    paymentMethod ===
                    "Cash"
                ) {

                    cashReceiver =
                        cashReceiverInput?.value.trim() ||
                        "";


                    if (!cashReceiver) {

                        throw new Error(
                            "Please enter Cash Receiver Name."
                        );

                    }


                    transactionID =
                        null;

                }

                else {

                    transactionID =
                        transactionIDInput?.value.trim() ||
                        "";


                    if (
                        paymentMethod === "bKash" ||
                        paymentMethod === "Nagad" ||
                        paymentMethod === "Rocket"
                    ) {

                        if (!transactionID) {

                            throw new Error(
                                "Please enter Transaction ID."
                            );

                        }

                    }


                    cashReceiver =
                        null;

                }


                /* =================================================
                   PAYMENT CONFIRMATION
                ================================================= */

                const paymentConfirmedInput =
                    document.getElementById(
                        "payment_confirmed"
                    );


                const paymentConfirmed =
                    paymentConfirmedInput
                        ? (
                            paymentConfirmedInput.checked ||
                            paymentConfirmedInput.value === "true"
                        )
                        : false;


                if (
                    !paymentConfirmed
                ) {

                    throw new Error(
                        "Please confirm the payment information."
                    );

                }


                /* =================================================
                   PHOTO
                ================================================= */

                const originalFile =
                    photoInput?.files?.[0];


                validatePhoto(
                    originalFile
                );


                /* =================================================
                   COMPRESS
                ================================================= */

                showProcess(
                    "Optimizing photo..."
                );


                const compressedBlob =
                    await compressImage(
                        originalFile
                    );


                /* =================================================
                   MEMBER ID
                ================================================= */

                showProcess(
                    "Generating Membership ID..."
                );


                const memberID =
                    await createMemberID(
                        sscYear,
                        type
                    );


                /* =================================================
                   FILE NAME
                ================================================= */

                uploadedFileName =
                    `${memberID}_${Date.now()}.jpg`;


                /* =================================================
                   PHOTO UPLOAD
                ================================================= */

                showProcess(
                    "Uploading photo..."
                );


                const {
                    error:
                        uploadError
                } =
                    await supabaseClient
                        .storage
                        .from(
                            BUCKET_NAME
                        )
                        .upload(
                            uploadedFileName,
                            compressedBlob,
                            {
                                contentType:
                                    "image/jpeg",
                                upsert:
                                    false
                            }
                        );


                if (
                    uploadError
                ) {

                    throw new Error(
                        "Photo Upload Error: " +
                        uploadError.message
                    );

                }


                /* =================================================
                   PHOTO URL
                ================================================= */

                const {
                    data:
                        publicURLData
                } =
                    supabaseClient
                        .storage
                        .from(
                            BUCKET_NAME
                        )
                        .getPublicUrl(
                            uploadedFileName
                        );


                const photoURL =
                    publicURLData?.publicUrl ||
                    null;


                /* =================================================
                   REGISTRATION TYPE
                ================================================= */

                const registrationType =
                    getRegistrationType(
                        type
                    );


                const totalMembers =
                    getTotalMembers(
                        type
                    );


                /* =================================================
                   DATABASE ROW
                ================================================= */

                const row = {

                    member_id:
                        memberID,

                    name:
                        name,

                    /*
                     * CURRENT STUDENT = NULL
                     */
                    ssc_year:
                        type === "CURRENT STUDENT"
                            ? null
                            : Number(sscYear),

                    phone:
                        phone || null,

                    email:
                        email || null,

                    profession:
                        profession || null,

                    address:
                        address || null,

                    photo_path:
                        uploadedFileName,

                    payment_method:
                        paymentMethod,

                    transaction_id:
                        transactionID,

                    cash_receiver:
                        cashReceiver,

                    payment_amount:
                        calculatedFee,

                    father_name:
                        fatherName,

                    mother_name:
                        motherName,

                    blood_group:
                        bloodGroup || null,

                    education:
                        education || null,

                    payment_confirmed:
                        paymentConfirmed,

                    photo_url:
                        photoURL,

                    status:
                        "Pending",

                    payment_status:
                        "Pending",

                    member_type:
                        type,

                    category:
                        selectedCategory,

                    wife_name:
                        wife,

                    children_count:
                        childCount,

                    tshirt_size:
                        ownSize,

                    husband_tshirt_size:
                        husbandSize,

                    wife_tshirt_size:
                        wifeSize,

                    child_tshirt_sizes:
                        childSizes,

                    /*
                     * CURRENT STUDENT CLASS
                     * Stored as TEXT
                     */
                    current_class:
                        selectedCurrentClass,

                    registration_type:
                        registrationType,

                    total_members:
                        totalMembers

                };


                /* =================================================
                   INSERT DATABASE
                ================================================= */

                showProcess(
                    "Saving registration..."
                );


                const {
                    data: saved,
                    error: insertError
                } =
                    await supabaseClient
                        .from(
                            "alumni"
                        )
                        .insert(
                            row
                        )
                        .select()
                        .single();


                if (
                    insertError
                ) {

                    throw new Error(
                        "Database insert failed: " +
                        insertError.message
                    );

                }


                /* =================================================
                   SUCCESS
                ================================================= */

                showSuccess(
                    saved?.member_id ||
                    memberID,
                    calculatedFee
                );


                /* =================================================
                   RESET
                ================================================= */

                form.reset();

                clearPhotoPreview();

                updateRegistrationFields();

                updatePaymentMethodFields();

                calculateFee();


            } catch (error) {

                console.error(
                    "REGISTRATION ERROR:",
                    error
                );


                /* =================================================
                   REMOVE UPLOADED PHOTO
                   IF DATABASE INSERT FAILED
                ================================================= */

                if (
                    uploadedFileName
                ) {

                    try {

                        await supabaseClient
                            .storage
                            .from(
                                BUCKET_NAME
                            )
                            .remove([
                                uploadedFileName
                            ]);

                    } catch (
                        cleanupError
                    ) {

                        console.error(
                            "Photo cleanup failed:",
                            cleanupError
                        );

                    }

                }


                showError(
                    error?.message ||
                    "Something went wrong."
                );

            }

            finally {

                if (
                    submitBtn
                ) {

                    submitBtn.disabled =
                        false;

                }

            }

        }
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

updateRegistrationFields();

updateSSCYearField();

updatePaymentMethodFields();

calculateFee();

clearPhotoPreview();


/* =========================================================
   EXTRA SAFETY
   If page loads with CURRENT STUDENT already selected
========================================================= */

setTimeout(
    function () {

        updateRegistrationFields();

        updateSSCYearField();

    },
    50
);