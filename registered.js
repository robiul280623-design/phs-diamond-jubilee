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

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
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
   CONSTANTS
========================================================= */

const BUCKET_NAME =
    "alumni-photos";

const MAX_FILE_SIZE =
    10 * 1024 * 1024;

const MAX_UPLOAD_SIZE =
    150 * 1024;


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

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
                ">

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


/* =========================================================
   DATABASE REGISTRATION TYPE
=========================================================

   IMPORTANT:

   Database CHECK constraint allows ONLY:

   Alumni
   Student
   Couple

   Therefore:

   EX-STUDENT      → Alumni
   CURRENT STUDENT → Student
   COUPLE          → Couple
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
        memberType.value;

    const selectedCategory =
        category.value;

    let fee = 0;

    let note = "";


    /* =====================================================
       COUPLE
    ===================================================== */

    if (type === "COUPLE") {

        const count =
            Number(
                childrenCount.value || 0
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
        type === "CURRENT STUDENT"
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
========================================================= */

function updateSSCYearField() {

    if (!sscYearInput) return;

    const sscGroup =
        sscYearInput.closest(
            ".form-group"
        );


    if (
        memberType.value ===
        "CURRENT STUDENT"
    ) {

        if (sscGroup) {

            sscGroup.classList.add(
                "hidden"
            );

        }

        sscYearInput.required =
            false;

        sscYearInput.disabled =
            true;

        sscYearInput.value =
            "";

    }

    else {

        if (sscGroup) {

            sscGroup.classList.remove(
                "hidden"
            );

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
        memberType.value;


    /* RESET */

    currentStudentBox.classList.add(
        "hidden"
    );

    coupleBox.classList.add(
        "hidden"
    );

    coupleTshirtArea.classList.add(
        "hidden"
    );

    memberTshirtSize.classList.remove(
        "hidden"
    );


    /* SSC YEAR */

    updateSSCYearField();


    /* =====================================================
       EX-STUDENT
    ===================================================== */

    if (type === "EX-STUDENT") {

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
        type === "CURRENT STUDENT"
    ) {

        currentStudentBox.classList.remove(
            "hidden"
        );

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

    }


    /* =====================================================
       COUPLE
    ===================================================== */

    else if (
        type === "COUPLE"
    ) {

        coupleBox.classList.remove(
            "hidden"
        );

        category.disabled =
            false;

        category.innerHTML = `

            <option value="COUPLE">
                Couple
            </option>

        `;

        category.value =
            "COUPLE";


        memberTshirtSize.classList.add(
            "hidden"
        );

        coupleTshirtArea.classList.remove(
            "hidden"
        );

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

}


/* =========================================================
   CHILD T-SHIRT SIZE
========================================================= */

function updateChildrenTshirts() {

    if (
        memberType.value !==
        "COUPLE"
    ) {

        childrenTshirtArea.innerHTML =
            "";

        return;

    }


    const count =
        Number(
            childrenCount.value || 0
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
                required>

                <option value="">
                    Select Size
                </option>

                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>

            </select>

        `;


        childrenTshirtArea.appendChild(
            div
        );

    }


    calculateFee();

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

if (memberType) {

    memberType.addEventListener(
        "change",
        updateRegistrationFields
    );

}


if (category) {

    category.addEventListener(
        "change",
        calculateFee
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

}


/* =========================================================
   PHOTO PREVIEW
========================================================= */

if (photoInput) {

    photoInput.addEventListener(
        "change",
        function () {

            const file =
                this.files &&
                this.files[0];


            if (!file) {

                photoPreview.style.display =
                    "none";

                photoPreview.style.backgroundImage =
                    "";

                return;

            }


            const allowedTypes = [

                "image/jpeg",
                "image/png",
                "image/webp"

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "JPG, JPEG, PNG or WEBP photo only."
                );

                this.value =
                    "";

                return;

            }


            if (
                file.size >
                MAX_FILE_SIZE
            ) {

                alert(
                    "Photo size must be 10 MB or less."
                );

                this.value =
                    "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    photoPreview.style.backgroundImage =
                        `url("${event.target.result}")`;

                    photoPreview.style.display =
                        "block";

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   COMPRESS IMAGE
========================================================= */

async function compressImage(file) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const img =
                        new Image();


                    img.onload =
                        function () {

                            let width =
                                img.width;

                            let height =
                                img.height;


                            const MAX_WIDTH =
                                1000;

                            const MAX_HEIGHT =
                                1200;


                            if (
                                width >
                                    MAX_WIDTH ||
                                height >
                                    MAX_HEIGHT
                            ) {

                                const ratio =
                                    Math.min(
                                        MAX_WIDTH /
                                            width,
                                        MAX_HEIGHT /
                                            height
                                    );


                                width =
                                    Math.round(
                                        width *
                                            ratio
                                    );

                                height =
                                    Math.round(
                                        height *
                                            ratio
                                    );

                            }


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


                            ctx.fillStyle =
                                "#ffffff";

                            ctx.fillRect(
                                0,
                                0,
                                width,
                                height
                            );


                            ctx.drawImage(
                                img,
                                0,
                                0,
                                width,
                                height
                            );


                            let quality =
                                0.85;


                            function convert() {

                                canvas.toBlob(
                                    function (blob) {

                                        if (!blob) {

                                            reject(
                                                new Error(
                                                    "Image compression failed."
                                                )
                                            );

                                            return;

                                        }


                                        if (
                                            blob.size >
                                                MAX_UPLOAD_SIZE &&
                                            quality >
                                                0.20
                                        ) {

                                            quality -=
                                                0.07;

                                            convert();

                                            return;

                                        }


                                        resolve(
                                            blob
                                        );

                                    },
                                    "image/jpeg",
                                    quality
                                );

                            }


                            convert();

                        };


                    img.onerror =
                        function () {

                            reject(
                                new Error(
                                    "Invalid image."
                                )
                            );

                        };


                    img.src =
                        event.target.result;

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Could not read image."
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   CREATE MEMBER ID
========================================================= */

async function createMemberID(
    year,
    type
) {

    let prefix = "";


    /* CURRENT STUDENT */

    if (
        type ===
        "CURRENT STUDENT"
    ) {

        prefix =
            "PHS2A-DJ-CURRENT-";

    }

    else {

        const batchYear =
            String(year).trim();


        if (
            !/^\d{4}$/.test(
                batchYear
            )
        ) {

            throw new Error(
                "Invalid SSC Batch / Year."
            );

        }


        prefix =
            `PHS2A-DJ-${batchYear}-`;

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
            "Member ID check failed: " +
            error.message
        );

    }


    let highest =
        0;


    if (
        Array.isArray(data)
    ) {

        data.forEach(
            row => {

                if (!row.member_id)
                    return;


                const id =
                    String(
                        row.member_id
                    );


                const serial =
                    parseInt(
                        id.substring(
                            prefix.length
                        ),
                        10
                    );


                if (
                    !isNaN(serial) &&
                    serial > highest
                ) {

                    highest =
                        serial;

                }

            }
        );

    }


    return (
        prefix +
        String(
            highest + 1
        ).padStart(
            3,
            "0"
        )
    );

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
                submitBtn.disabled
            ) {

                return;

            }


            submitBtn.disabled =
                true;

            submitBtn.innerHTML =
                "⏳ Processing...";


            let uploadedFile =
                null;


            try {

                /* DATABASE */

                await testDatabase();


                /* BASIC VALIDATION */

                if (
                    !form.checkValidity()
                ) {

                    form.reportValidity();

                    throw new Error(
                        "Please complete all required fields."
                    );

                }


                /* =================================================
                   BASIC VALUES
                ================================================= */

                const name =
                    document
                        .getElementById(
                            "name"
                        )
                        .value
                        .trim();


                const fatherName =
                    document
                        .getElementById(
                            "father_name"
                        )
                        .value
                        .trim();


                const motherName =
                    document
                        .getElementById(
                            "mother_name"
                        )
                        .value
                        .trim();


                const type =
                    memberType.value;


                const selectedCategory =
                    category.value;


                /* =================================================
                   SSC YEAR
                ================================================= */

                let sscYear =
                    null;


                if (
                    type !==
                    "CURRENT STUDENT"
                ) {

                    sscYear =
                        sscYearInput.value.trim();

                }


                /* =================================================
                   OTHER VALUES
                ================================================= */

                const bloodGroup =
                    document
                        .getElementById(
                            "blood_group"
                        )
                        .value;


                const education =
                    document
                        .getElementById(
                            "education"
                        )
                        .value
                        .trim();


                const profession =
                    document
                        .getElementById(
                            "profession"
                        )
                        .value
                        .trim();


                const phone =
                    document
                        .getElementById(
                            "phone"
                        )
                        .value
                        .trim();


                const email =
                    document
                        .getElementById(
                            "email"
                        )
                        .value
                        .trim();


                const address =
                    document
                        .getElementById(
                            "address"
                        )
                        .value
                        .trim();


                /* =================================================
                   FEE
                ================================================= */

                const calculatedFee =
                    calculateFee();


                /* =================================================
                   MEMBER TYPE
                ================================================= */

                if (!type) {

                    throw new Error(
                        "Please select Member Type."
                    );

                }


                /* =================================================
                   REGISTRATION TYPE
                ================================================= */

                const registrationType =
                    getRegistrationType(
                        type
                    );


                if (
                    !registrationType
                ) {

                    throw new Error(
                        "Invalid registration type."
                    );

                }


                /* =================================================
                   CATEGORY
                ================================================= */

                if (!selectedCategory) {

                    throw new Error(
                        "Please select Registration Category."
                    );

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

                    selectedCurrentClass =
                        currentClass.value;


                    if (
                        !selectedCurrentClass
                    ) {

                        throw new Error(
                            "Please select Current Class."
                        );

                    }

                }


                /* =================================================
                   SSC YEAR VALIDATION
                ================================================= */

                if (
                    type !==
                    "CURRENT STUDENT"
                ) {

                    if (!sscYear) {

                        throw new Error(
                            "SSC Batch / Year is required."
                        );

                    }


                    if (
                        !/^\d{4}$/.test(
                            sscYear
                        )
                    ) {

                        throw new Error(
                            "Please enter a valid 4-digit SSC year."
                        );

                    }

                }


                /* =================================================
                   FEE VALIDATION
                ================================================= */

                if (
                    calculatedFee <= 0
                ) {

                    throw new Error(
                        "Registration Fee could not be calculated."
                    );

                }


                /* =================================================
                   PAYMENT AMOUNT
                ================================================= */

                const enteredAmount =
                    Number(
                        paymentAmount.value
                    );


                if (
                    enteredAmount !==
                    calculatedFee
                ) {

                    throw new Error(
                        `Required Registration Fee is ৳${calculatedFee}.`
                    );

                }


                /* =================================================
                   COUPLE
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
                        wifeName.value.trim();


                    if (!wife) {

                        throw new Error(
                            "Wife's name is required for Couple registration."
                        );

                    }


                    childCount =
                        Number(
                            childrenCount.value
                        );


                    husbandSize =
                        husbandTshirtSize.value;


                    wifeSize =
                        wifeTshirtSize.value;


                    if (!husbandSize) {

                        throw new Error(
                            "Please select Husband T-shirt Size."
                        );

                    }


                    if (!wifeSize) {

                        throw new Error(
                            "Please select Wife T-shirt Size."
                        );

                    }


                    const childInputs =
                        document.querySelectorAll(
                            ".child-tshirt-size"
                        );


                    childInputs.forEach(
                        input => {

                            childSizes.push(
                                input.value
                            );

                        }
                    );


                    if (
                        childSizes.length !==
                        childCount
                    ) {

                        throw new Error(
                            "Please select T-shirt size for every child."
                        );

                    }


                    if (
                        childSizes.some(
                            size => !size
                        )
                    ) {

                        throw new Error(
                            "Please select T-shirt size for every child."
                        );

                    }

                }


                /* =================================================
                   NON COUPLE
                ================================================= */

                let ownSize =
                    null;


                if (
                    type !==
                    "COUPLE"
                ) {

                    ownSize =
                        memberTshirtSize.value;


                    if (!ownSize) {

                        throw new Error(
                            "Please select your T-shirt Size."
                        );

                    }

                }


                /* =================================================
                   TOTAL MEMBERS
                ================================================= */

                const totalMembers =
                    type === "COUPLE"
                        ? 2 + childCount
                        : 1;


                /* =================================================
                   PHOTO
                ================================================= */

                const photo =
                    photoInput.files &&
                    photoInput.files[0];


                if (!photo) {

                    throw new Error(
                        "Please upload your profile photo."
                    );

                }


                if (
                    photo.size >
                    MAX_FILE_SIZE
                ) {

                    throw new Error(
                        "Photo size must be 10 MB or less."
                    );

                }


                /* =================================================
                   PAYMENT
                ================================================= */

                const paymentMethod =
                    document
                        .getElementById(
                            "payment_method"
                        )
                        .value;


                const transactionID =
                    document
                        .getElementById(
                            "transaction_id"
                        )
                        .value
                        .trim();


                const paymentConfirmed =
                    document
                        .getElementById(
                            "payment_confirmed"
                        )
                        .checked;


                if (!paymentMethod) {

                    throw new Error(
                        "Please select Payment Method."
                    );

                }


                if (!transactionID) {

                    throw new Error(
                        "Transaction ID is required."
                    );

                }


                if (!paymentConfirmed) {

                    throw new Error(
                        "Please confirm payment information."
                    );

                }


                /* =================================================
                   PHOTO COMPRESSION
                ================================================= */

                showProcess(
                    "📷 Preparing your photo..."
                );


                const compressedPhoto =
                    await compressImage(
                        photo
                    );


                /* =================================================
                   MEMBER ID
                ================================================= */

                showProcess(
                    "🆔 Creating your Member ID..."
                );


                const memberID =
                    await createMemberID(
                        sscYear,
                        type
                    );


                /* =================================================
                   FILE NAME
                ================================================= */

                const fileName =
                    `${memberID}_${Date.now()}.jpg`;


                uploadedFile =
                    fileName;


                /* =================================================
                   PHOTO UPLOAD
                ================================================= */

                showProcess(
                    "📤 Uploading your photo..."
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
                            fileName,
                            compressedPhoto,
                            {
                                contentType:
                                    "image/jpeg",

                                cacheControl:
                                    "3600",

                                upsert:
                                    false
                            }
                        );


                if (uploadError) {

                    throw new Error(
                        "Photo upload failed: " +
                        uploadError.message
                    );

                }


                /* =================================================
                   PHOTO URL
                ================================================= */

                const {
                    data:
                        urlData
                } =
                    supabaseClient
                        .storage
                        .from(
                            BUCKET_NAME
                        )
                        .getPublicUrl(
                            fileName
                        );


                const photoURL =
                    urlData.publicUrl;


                /* =================================================
                   DATABASE ROW
                ================================================= */

                const row = {

                    member_id:
                        memberID,

                    name:
                        name,

                    ssc_year:
                        sscYear
                            ? Number(
                                sscYear
                            )
                            : null,

                    phone:
                        phone || null,

                    email:
                        email || null,

                    profession:
                        profession || null,

                    address:
                        address || null,

                    photo_path:
                        fileName,

                    payment_method:
                        paymentMethod,

                    transaction_id:
                        transactionID,

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

                    /*
                       Keep existing registration workflow.
                    */

                    status:
                        "Pending",

                    payment_status:
                        "Pending",

                    /*
                       Original UI value.
                    */

                    member_type:
                        type,

                    category:
                        selectedCategory,

                    /*
                       Couple data
                    */

                    wife_name:
                        wife,

                    children_count:
                        childCount,

                    /*
                       T-Shirt data
                    */

                    tshirt_size:
                        ownSize,

                    husband_tshirt_size:
                        husbandSize,

                    wife_tshirt_size:
                        wifeSize,

                    child_tshirt_sizes:
                        childSizes,

                    /*
                       Current Student
                    */

                    current_class:
                        selectedCurrentClass,

                    /*
                       IMPORTANT:
                       Database accepts only:

                       Alumni
                       Student
                       Couple
                    */

                    registration_type:
                        registrationType,

                    total_members:
                        totalMembers

                };


                console.log(
                    "Registration type:",
                    registrationType
                );

                console.log(
                    "Database row:",
                    row
                );


                /* =================================================
                   INSERT
                ================================================= */

                showProcess(
                    "💾 Saving your registration..."
                );


                const {
                    data:
                        saved,
                    error:
                        insertError
                } =
                    await supabaseClient
                        .from("alumni")
                        .insert(
                            row
                        )
                        .select()
                        .single();


                if (insertError) {

                    throw new Error(
                        "Database insert failed: " +
                        insertError.message
                    );

                }


                /* =================================================
                   SUCCESS
                ================================================= */

                message.innerHTML = `

                    <div class="success-box">

                        <div class="success-title">

                            ✅ Registration Successful!

                        </div>


                        <div>

                            Thank you,
                            <strong>
                                ${escapeHtml(name)}
                            </strong>

                        </div>


                        <div
                            style="
                                margin-top:8px;
                            ">

                            Registration Type:
                            <strong>
                                ${escapeHtml(
                                    registrationType
                                )}
                            </strong>

                        </div>


                        ${
                            type === "COUPLE"
                            ? `
                                <div
                                    style="
                                        margin-top:5px;
                                    ">

                                    Spouse Name:
                                    <strong>
                                        ${escapeHtml(
                                            wife
                                        )}
                                    </strong>

                                </div>

                                <div
                                    style="
                                        margin-top:5px;
                                    ">

                                    Total Members:
                                    <strong>
                                        ${totalMembers}
                                    </strong>

                                </div>
                            `
                            : ""
                        }


                        ${
                            type === "CURRENT STUDENT"
                            ? `
                                <div
                                    style="
                                        margin-top:5px;
                                    ">

                                    Current Class:
                                    <strong>
                                        ${escapeHtml(
                                            selectedCurrentClass
                                        )}
                                    </strong>

                                </div>
                            `
                            : ""
                        }


                        <div
                            style="
                                margin-top:5px;
                            ">

                            Registration Fee:
                            <strong>
                                ৳${calculatedFee}
                            </strong>

                        </div>


                        <div class="member-id-label">

                            Your Alumni Member ID:

                        </div>


                        <div class="member-id">

                            ${escapeHtml(
                                memberID
                            )}

                        </div>


                        <div
                            style="
                                margin-top:12px;
                                line-height:1.7;
                            ">

                            Your registration has been
                            successfully submitted.

                            <br>

                            Please save your Member ID.

                        </div>


                        <img
                            src="${escapeHtml(
                                photoURL
                            )}"
                            class="success-photo"
                            alt="Profile Photo"
                            onerror="
                                this.style.display='none'
                            "
                        >


                        <br>


                        <button
                            type="button"
                            onclick="window.print()"
                            style="
                                margin-top:18px;
                                background:#082d63;
                                color:white;
                                border:0;
                                padding:12px 22px;
                                border-radius:7px;
                                font-weight:bold;
                                cursor:pointer;
                            "
                        >

                            🖨 Print

                        </button>

                    </div>

                `;


                submitBtn.style.display =
                    "none";


                message.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


            } catch (error) {

                console.error(
                    "REGISTRATION ERROR:",
                    error
                );


                /* =================================================
                   CLEANUP UPLOADED PHOTO
                ================================================= */

                if (
                    uploadedFile &&
                    supabaseClient
                ) {

                    try {

                        await supabaseClient
                            .storage
                            .from(
                                BUCKET_NAME
                            )
                            .remove(
                                [
                                    uploadedFile
                                ]
                            );

                    } catch (
                        cleanupError
                    ) {

                        console.error(
                            "Cleanup error:",
                            cleanupError
                        );

                    }

                }


                showError(
                    error.message ||
                    "Unknown error occurred."
                );


                submitBtn.disabled =
                    false;

                submitBtn.style.display =
                    "block";

                submitBtn.innerHTML =
                    "Submit Registration";

            }

        }
    );

}


/* =========================================================
   INITIAL
========================================================= */

updateRegistrationFields();

calculateFee();


console.log(
    "REGISTERED.JS LOADED SUCCESSFULLY"
);

console.log(
    "Automatic Fee System: ACTIVE"
);

console.log(
    "Couple Child Fee: ৳500 per child"
);

console.log(
    "Current Student SSC Year: HIDDEN"
);

console.log(
    "Registration Type System: ACTIVE"
);

console.log(
    "Database Registration Type Mapping:"
);

console.log(
    "EX-STUDENT → Alumni"
);

console.log(
    "CURRENT STUDENT → Student"
);

console.log(
    "COUPLE → Couple"
);

console.log(
    "Total Members System: ACTIVE"
);

console.log(
    "T-Shirt Sizes: S,M,L,XL,XXL,XXXL"
);