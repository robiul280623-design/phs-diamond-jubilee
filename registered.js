/* =========================================================
   PAHARCHANDA HIGH SCHOOL
   DIAMOND JUBILEE 1965–2025
   GRAND REUNION 2027

   REGISTERED.JS
   FINAL WORKING VERSION
   PHOTO UPLOAD + REGISTRATION TYPE FIXED
========================================================= */


/* =========================================================
   1. SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";

const supabaseClient =
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


/* =========================================================
   2. CONSTANTS
========================================================= */

const ID_PREFIX = "PHS2A-DJ-";

const FAMILY_MEMBER_FEE = 500;

const PHOTO_BUCKET = "alumni-photos";

const MAX_PHOTO_SIZE =
    10 * 1024 * 1024;

const TARGET_PHOTO_SIZE =
    150 * 1024;

const MAX_PHOTO_WIDTH = 1200;

const MAX_PHOTO_HEIGHT = 1200;


/* =========================================================
   3. DOM
========================================================= */

const form =
    document.getElementById(
        "registrationForm"
    );

const memberType =
    document.getElementById(
        "member_type"
    );

const category =
    document.getElementById(
        "category"
    );

const categoryGroup =
    document.getElementById(
        "categoryGroup"
    );


/* Personal */

const personalSection =
    document.getElementById(
        "personalSection"
    );

const nameInput =
    document.getElementById(
        "name"
    );

const fatherName =
    document.getElementById(
        "father_name"
    );

const motherName =
    document.getElementById(
        "mother_name"
    );


/* Current Student */

const currentStudentBox =
    document.getElementById(
        "currentStudentBox"
    );

const currentClass =
    document.getElementById(
        "current_class"
    );


/* SSC */

const sscYearGroup =
    document.getElementById(
        "sscYearGroup"
    );

const sscYear =
    document.getElementById(
        "ssc_year"
    );


/* Blood */

const normalBloodBox =
    document.getElementById(
        "normalBloodBox"
    );

const bloodGroup =
    document.getElementById(
        "blood_group"
    );


/* T-shirt */

const tshirtBox =
    document.getElementById(
        "tshirtBox"
    );

const tshirtSize =
    document.getElementById(
        "member_tshirt_size"
    );


/* Education */

const educationSection =
    document.getElementById(
        "educationSection"
    );

const education =
    document.getElementById(
        "education"
    );

const profession =
    document.getElementById(
        "profession"
    );


/* Contact */

const contactSection =
    document.getElementById(
        "contactSection"
    );

const phone =
    document.getElementById(
        "phone"
    );

const email =
    document.getElementById(
        "email"
    );

const address =
    document.getElementById(
        "address"
    );


/* Photo */

const photoSection =
    document.getElementById(
        "photoSection"
    );

const photoInput =
    document.getElementById(
        "photo"
    );

const photoPreview =
    document.getElementById(
        "photoPreview"
    );


/* Family */

const familyBox =
    document.getElementById(
        "familyBox"
    );

const familyStudentName =
    document.getElementById(
        "family_of_student"
    );

const familyStudentBatch =
    document.getElementById(
        "family_student_batch"
    );

const familyStudentSerial =
    document.getElementById(
        "family_student_serial"
    );

const familyMembersContainer =
    document.getElementById(
        "familyMembersContainer"
    );

const familyCheckboxes =
    document.querySelectorAll(
        ".family-type"
    );


/* Payment */

const paymentMethod =
    document.getElementById(
        "payment_method"
    );

const paymentAmount =
    document.getElementById(
        "payment_amount"
    );

const transactionId =
    document.getElementById(
        "transaction_id"
    );

const transactionBox =
    document.getElementById(
        "transactionBox"
    );

const cashReceiver =
    document.getElementById(
        "cash_receiver"
    );

const cashReceiverBox =
    document.getElementById(
        "cashReceiverBox"
    );

const paymentConfirmed =
    document.getElementById(
        "payment_confirmed"
    );


/* Fee */

const feeAmount =
    document.getElementById(
        "feeAmount"
    );

const feeNote =
    document.getElementById(
        "feeNote"
    );


/* Button */

const submitBtn =
    document.getElementById(
        "submitBtn"
    );

const message =
    document.getElementById(
        "message"
    );


/* =========================================================
   4. HIDE / SHOW
========================================================= */

function showSection(element) {

    if (!element) return;

    element.classList.remove(
        "hidden"
    );

}


function hideSection(element) {

    if (!element) return;

    element.classList.add(
        "hidden"
    );

}


/* =========================================================
   5. REQUIRED
========================================================= */

function setRequired(
    element,
    required
) {

    if (!element) return;

    element.required =
        required === true;

}


/* =========================================================
   6. MESSAGE
========================================================= */

function hideMessage() {

    if (!message) return;

    message.style.display =
        "none";

    message.innerHTML =
        "";

}


function showProcess(text) {

    if (!message) return;

    message.className =
        "process-box";

    message.innerHTML =
        `<div>${escapeHtml(text)}</div>`;

    message.style.display =
        "block";

}


function showError(text) {

    if (!message) return;

    message.className =
        "error-box";

    message.innerHTML =
        `<strong>Error:</strong><br>${escapeHtml(text)}`;

    message.style.display =
        "block";

    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function showSuccess(html) {

    if (!message) return;

    message.className =
        "success-box";

    message.innerHTML =
        html;

    message.style.display =
        "block";

    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   7. ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
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


/* =========================================================
   8. RESET NORMAL FIELDS
========================================================= */

function clearNormalFields() {

    if (nameInput)
        nameInput.value = "";

    if (fatherName)
        fatherName.value = "";

    if (motherName)
        motherName.value = "";

    if (sscYear)
        sscYear.value = "";

    if (currentClass)
        currentClass.value = "";

    if (bloodGroup)
        bloodGroup.value = "";

    if (tshirtSize)
        tshirtSize.value = "";

    if (education)
        education.value = "";

    if (profession)
        profession.value = "";

    if (phone)
        phone.value = "";

    if (email)
        email.value = "";

    if (address)
        address.value = "";

    if (photoInput)
        photoInput.value = "";

    clearPhotoPreview();

}


/* =========================================================
   9. RESET FAMILY
========================================================= */

function clearFamilyFields() {

    if (familyStudentName)
        familyStudentName.value = "";

    if (familyStudentBatch)
        familyStudentBatch.value = "";

    if (familyStudentSerial)
        familyStudentSerial.value = "";


    familyCheckboxes.forEach(
        checkbox => {

            checkbox.checked =
                false;

        }
    );


    if (familyMembersContainer) {

        familyMembersContainer.innerHTML =
            "";

    }

}


/* =========================================================
   10. PHOTO PREVIEW
========================================================= */

function clearPhotoPreview() {

    if (!photoPreview) return;

    photoPreview.innerHTML =
        "";

    photoPreview.style.display =
        "none";

}


function previewPhoto(file) {

    if (!photoPreview) return;


    if (!file) {

        clearPhotoPreview();

        return;

    }


    /*
       Object URL is more reliable on mobile.
    */

    const objectUrl =
        URL.createObjectURL(file);


    photoPreview.innerHTML = `
        <img
            src="${objectUrl}"
            alt="Photo Preview"
            style="
                width:100%;
                height:100%;
                object-fit:cover;
                border-radius:6px;
            "
        >
    `;


    photoPreview.style.display =
        "block";


    /*
       Release object URL after image loads.
    */

    const previewImage =
        photoPreview.querySelector(
            "img"
        );


    if (previewImage) {

        previewImage.onload =
            function() {

                URL.revokeObjectURL(
                    objectUrl
                );

            };

    }

}


/* =========================================================
   11. IMAGE LOAD - FIXED
========================================================= */

function loadImage(file) {

    return new Promise(
        (resolve, reject) => {

            if (!file) {

                reject(
                    new Error(
                        "No photo selected."
                    )
                );

                return;

            }


            /*
               Object URL is used instead of
               FileReader for better mobile
               browser compatibility.
            */

            let objectUrl = "";

            try {

                objectUrl =
                    URL.createObjectURL(
                        file
                    );

            }

            catch (error) {

                reject(
                    new Error(
                        "Unable to access selected photo."
                    )
                );

                return;

            }


            const img =
                new Image();


            img.onload =
                function() {

                    URL.revokeObjectURL(
                        objectUrl
                    );


                    const width =
                        img.naturalWidth ||
                        img.width;

                    const height =
                        img.naturalHeight ||
                        img.height;


                    if (
                        !width ||
                        !height
                    ) {

                        reject(
                            new Error(
                                "Invalid or unreadable photo."
                            )
                        );

                        return;

                    }


                    resolve(img);

                };


            img.onerror =
                function() {

                    URL.revokeObjectURL(
                        objectUrl
                    );


                    reject(
                        new Error(
                            "Unable to read photo. Please select a valid JPG, PNG or WEBP image."
                        )
                    );

                };


            img.src =
                objectUrl;

        }
    );

}


/* =========================================================
   12. CANVAS TO BLOB - FIXED
========================================================= */

function canvasToBlob(
    canvas,
    quality
) {

    return new Promise(
        (resolve, reject) => {

            if (!canvas) {

                reject(
                    new Error(
                        "Photo processing failed."
                    )
                );

                return;

            }


            if (
                typeof canvas.toBlob !==
                "function"
            ) {

                reject(
                    new Error(
                        "Your browser does not support photo compression."
                    )
                );

                return;

            }


            canvas.toBlob(
                function(blob) {

                    if (!blob) {

                        reject(
                            new Error(
                                "Unable to compress photo."
                            )
                        );

                        return;

                    }


                    resolve(blob);

                },
                "image/jpeg",
                quality
            );

        }
    );

}


/* =========================================================
   13. PHOTO COMPRESSION - FIXED
========================================================= */

async function compressPhoto(file) {

    if (!file) {

        throw new Error(
            "Please select a profile photo."
        );

    }


    /*
       Maximum original size = 10 MB
    */

    if (
        file.size >
        MAX_PHOTO_SIZE
    ) {

        throw new Error(
            "Photo size cannot be more than 10 MB."
        );

    }


    /*
       Allowed image types
    */

    const allowedTypes = [

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp"

    ];


    const fileType =
        String(
            file.type || ""
        ).toLowerCase();


    if (
        !allowedTypes.includes(
            fileType
        )
    ) {

        /*
           Some mobile browsers may return
           an empty MIME type.
           In that case check the filename.
        */

        const fileName =
            String(
                file.name || ""
            ).toLowerCase();


        const validExtension =
            /\.(jpg|jpeg|png|webp)$/i
                .test(fileName);


        if (!validExtension) {

            throw new Error(
                "Please select a JPG, PNG or WEBP photo."
            );

        }

    }


    /*
       Load image
    */

    const img =
        await loadImage(file);


    let width =
        img.naturalWidth ||
        img.width;

    let height =
        img.naturalHeight ||
        img.height;


    if (
        !width ||
        !height
    ) {

        throw new Error(
            "Unable to determine photo dimensions."
        );

    }


    /*
       Resize to maximum 1200 × 1200
    */

    if (
        width > MAX_PHOTO_WIDTH ||
        height > MAX_PHOTO_HEIGHT
    ) {

        const ratio =
            Math.min(
                MAX_PHOTO_WIDTH /
                    width,

                MAX_PHOTO_HEIGHT /
                    height
            );


        width =
            Math.max(
                1,
                Math.round(
                    width * ratio
                )
            );


        height =
            Math.max(
                1,
                Math.round(
                    height * ratio
                )
            );

    }


    /*
       Create canvas
    */

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


    if (!ctx) {

        throw new Error(
            "Photo processing is not supported by this browser."
        );

    }


    /*
       White background for transparent PNG
       before converting to JPEG.
    */

    ctx.fillStyle =
        "#ffffff";


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
       Draw photo
    */

    ctx.drawImage(
        img,
        0,
        0,
        width,
        height
    );


    /*
       Initial JPEG quality
    */

    let quality =
        0.85;


    let blob =
        await canvasToBlob(
            canvas,
            quality
        );


    /*
       Compress toward 150 KB
    */

    while (
        blob &&
        blob.size >
            TARGET_PHOTO_SIZE &&
        quality > 0.25
    ) {

        quality -= 0.08;


        blob =
            await canvasToBlob(
                canvas,
                quality
            );

    }


    if (!blob) {

        throw new Error(
            "Photo compression failed."
        );

    }


    /*
       Final JPEG File
    */

    return new File(
        [blob],
        "profile.jpg",
        {
            type:
                "image/jpeg",

            lastModified:
                Date.now()
        }
    );

}


/* =========================================================
   14. CATEGORY OPTIONS
========================================================= */

function setCategoryOptions(
    options
) {

    if (!category) return;


    category.innerHTML = `
        <option value="">
            Select Category
        </option>
    `;


    options.forEach(
        item => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item.value;


            option.textContent =
                item.label;


            category.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   15. UPDATE REGISTRATION FORM
========================================================= */

function updateRegistrationFields() {

    const type =
        memberType?.value || "";


    /*
       HIDE ALL
    */

    hideSection(
        categoryGroup
    );

    hideSection(
        personalSection
    );

    hideSection(
        currentStudentBox
    );

    hideSection(
        sscYearGroup
    );

    hideSection(
        normalBloodBox
    );

    hideSection(
        tshirtBox
    );

    hideSection(
        educationSection
    );

    hideSection(
        contactSection
    );

    hideSection(
        photoSection
    );

    hideSection(
        familyBox
    );


    /*
       RESET REQUIRED
    */

    setRequired(
        category,
        false
    );

    setRequired(
        nameInput,
        false
    );

    setRequired(
        fatherName,
        false
    );

    setRequired(
        motherName,
        false
    );

    setRequired(
        sscYear,
        false
    );

    setRequired(
        currentClass,
        false
    );

    setRequired(
        phone,
        false
    );

    setRequired(
        photoInput,
        false
    );

    setRequired(
        tshirtSize,
        false
    );

    setRequired(
        familyStudentName,
        false
    );

    setRequired(
        familyStudentBatch,
        false
    );

    setRequired(
        familyStudentSerial,
        false
    );


    /* =====================================================
       EX-STUDENT
    ===================================================== */

    if (
        type === "EX-STUDENT"
    ) {

        showSection(
            categoryGroup
        );

        showSection(
            personalSection
        );

        showSection(
            sscYearGroup
        );

        showSection(
            normalBloodBox
        );

        showSection(
            tshirtBox
        );

        showSection(
            educationSection
        );

        showSection(
            contactSection
        );

        showSection(
            photoSection
        );


        setCategoryOptions([

            {
                value:
                    "EX_1986_2023",

                label:
                    "Ex-Student — SSC 1986–2023 — ৳1000"
            },

            {
                value:
                    "EX_2024_2026",

                label:
                    "Ex-Student — SSC 2024–2026 — ৳700"
            }

        ]);


        setRequired(
            category,
            true
        );

        setRequired(
            nameInput,
            true
        );

        setRequired(
            fatherName,
            true
        );

        setRequired(
            motherName,
            true
        );

        setRequired(
            sscYear,
            true
        );

        setRequired(
            phone,
            true
        );

        setRequired(
            photoInput,
            true
        );

        setRequired(
            tshirtSize,
            true
        );


        if (feeNote) {

            feeNote.textContent =
                "SSC 1986–2023: ৳1000 | SSC 2024–2026: ৳700";

        }

    }


    /* =====================================================
       CURRENT STUDENT
    ===================================================== */

    else if (
        type === "CURRENT STUDENT"
    ) {

        showSection(
            categoryGroup
        );

        showSection(
            personalSection
        );

        showSection(
            currentStudentBox
        );

        showSection(
            normalBloodBox
        );

        showSection(
            tshirtBox
        );

        showSection(
            educationSection
        );

        showSection(
            contactSection
        );

        showSection(
            photoSection
        );


        setCategoryOptions([

            {
                value:
                    "CLASS_6_7",

                label:
                    "Current Student — Class 6–7 — ৳300"
            },

            {
                value:
                    "CLASS_8",

                label:
                    "Current Student — Class 8 — ৳400"
            },

            {
                value:
                    "CLASS_9_10",

                label:
                    "Current Student — Class 9–10 — ৳500"
            }

        ]);


        setRequired(
            category,
            true
        );

        setRequired(
            nameInput,
            true
        );

        setRequired(
            fatherName,
            true
        );

        setRequired(
            motherName,
            true
        );

        setRequired(
            currentClass,
            true
        );

        setRequired(
            phone,
            true
        );

        setRequired(
            photoInput,
            true
        );

        setRequired(
            tshirtSize,
            true
        );


        if (feeNote) {

            feeNote.textContent =
                "Class 6–7: ৳300 | Class 8: ৳400 | Class 9–10: ৳500";

        }

    }


    /* =====================================================
       FAMILY
    ===================================================== */

    else if (
        type === "FAMILY"
    ) {

        showSection(
            familyBox
        );


        setCategoryOptions([]);


        if (category) {

            category.value =
                "FAMILY";

        }


        setRequired(
            familyStudentName,
            true
        );

        setRequired(
            familyStudentBatch,
            true
        );

        setRequired(
            familyStudentSerial,
            true
        );


        if (feeNote) {

            feeNote.textContent =
                "Family Fee: ৳500 per selected family member.";

        }


        /*
           Clear normal fields
        */

        clearNormalFields();

    }


    /* =====================================================
       NOTHING SELECTED
    ===================================================== */

    else {

        setCategoryOptions([]);


        if (category) {

            category.value =
                "";

        }


        clearNormalFields();

    }


    calculateFee();

    updatePaymentFields();

}


/* =========================================================
   16. FAMILY MEMBERS
========================================================= */

function getSelectedFamilyTypes() {

    return Array.from(
        familyCheckboxes
    )
    .filter(
        checkbox =>
            checkbox.checked
    )
    .map(
        checkbox =>
            checkbox.value
    );

}


/* =========================================================
   FAMILY LABEL
========================================================= */

function familyLabel(
    type
) {

    const labels = {

        HUSBAND:
            "Husband",

        WIFE:
            "Wife",

        SON:
            "Son",

        DAUGHTER:
            "Daughter",

        OTHER:
            "Other"

    };


    return (
        labels[type] ||
        type
    );

}


/* =========================================================
   RENDER FAMILY MEMBERS
========================================================= */

function renderFamilyMembers() {

    if (!familyMembersContainer)
        return;


    const selected =
        getSelectedFamilyTypes();


    familyMembersContainer.innerHTML =
        "";


    selected.forEach(
        (type, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "family-member-card";


            card.innerHTML = `

                <div class="family-member-title">
                    Family Member ${index + 1}
                    — ${escapeHtml(
                        familyLabel(type)
                    )}
                </div>


                <div class="form-group">

                    <label>
                        Name
                        <span class="required">*</span>
                    </label>

                    <input
                        type="text"
                        class="family-member-name"
                        data-index="${index}"
                        placeholder="Enter name"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Mobile Number
                        <span class="required">*</span>
                    </label>

                    <input
                        type="tel"
                        class="family-member-phone"
                        data-index="${index}"
                        placeholder="01XXXXXXXXX"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Blood Group
                    </label>

                    <select
                        class="family-member-blood"
                        data-index="${index}"
                    >

                        <option value="">
                            Select Blood Group
                        </option>

                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>

                    </select>

                </div>


                ${
                    type === "OTHER"
                    ? `

                    <div class="form-group">

                        <label>
                            Relationship
                            <span class="required">*</span>
                        </label>

                        <input
                            type="text"
                            class="family-other-relation"
                            data-index="${index}"
                            placeholder="Example: Brother / Sister"
                        >

                    </div>

                    `
                    : ""
                }

            `;


            familyMembersContainer
                .appendChild(
                    card
                );

        }
    );

}


/* =========================================================
   COLLECT FAMILY
========================================================= */

function collectFamilyMembers() {

    const selected =
        getSelectedFamilyTypes();


    const members = [];


    selected.forEach(
        (type, index) => {

            const nameElement =
                document.querySelector(
                    `.family-member-name[data-index="${index}"]`
                );


            const phoneElement =
                document.querySelector(
                    `.family-member-phone[data-index="${index}"]`
                );


            const bloodElement =
                document.querySelector(
                    `.family-member-blood[data-index="${index}"]`
                );


            const relationElement =
                document.querySelector(
                    `.family-other-relation[data-index="${index}"]`
                );


            const name =
                nameElement
                    ? nameElement.value.trim()
                    : "";


            const memberPhone =
                phoneElement
                    ? phoneElement.value.trim()
                    : "";


            const blood =
                bloodElement
                    ? bloodElement.value
                    : "";


            const relation =
                relationElement
                    ? relationElement.value.trim()
                    : "";


            if (!name) {

                throw new Error(
                    `Please enter name for Family Member ${index + 1}.`
                );

            }


            if (!memberPhone) {

                throw new Error(
                    `Please enter mobile number for Family Member ${index + 1}.`
                );

            }


            if (
                !/^01[3-9]\d{8}$/.test(
                    memberPhone
                )
            ) {

                throw new Error(
                    `Invalid mobile number for Family Member ${index + 1}.`
                );

            }


            if (
                type === "OTHER" &&
                !relation
            ) {

                throw new Error(
                    "Please enter relationship for Other family member."
                );

            }


            members.push({

                type:
                    type,

                name:
                    name,

                phone:
                    memberPhone,

                blood_group:
                    blood || null,

                relation:
                    relation || null

            });

        }
    );


    return members;

}


/* =========================================================
   17. FEE
========================================================= */

function calculateFee() {

    let fee = 0;


    const type =
        memberType?.value || "";


    const cat =
        category?.value || "";


    if (
        type === "FAMILY"
    ) {

        const count =
            getSelectedFamilyTypes()
                .length;


        fee =
            count *
            FAMILY_MEMBER_FEE;

    }


    else if (
        type === "EX-STUDENT"
    ) {

        if (
            cat === "EX_1986_2023"
        ) {

            fee = 1000;

        }


        else if (
            cat === "EX_2024_2026"
        ) {

            fee = 700;

        }

    }


    else if (
        type === "CURRENT STUDENT"
    ) {

        if (
            cat === "CLASS_6_7"
        ) {

            fee = 300;

        }


        else if (
            cat === "CLASS_8"
        ) {

            fee = 400;

        }


        else if (
            cat === "CLASS_9_10"
        ) {

            fee = 500;

        }

    }


    if (feeAmount) {

        feeAmount.textContent =
            `৳${fee}`;

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
   18. PAYMENT UI
========================================================= */

function updatePaymentFields() {

    const method =
        paymentMethod?.value || "";


    if (
        method === "Cash"
    ) {

        hideSection(
            transactionBox
        );


        showSection(
            cashReceiverBox
        );


        setRequired(
            transactionId,
            false
        );


        setRequired(
            cashReceiver,
            true
        );


        if (transactionId)
            transactionId.value = "";

    }


    else if (method) {

        showSection(
            transactionBox
        );


        hideSection(
            cashReceiverBox
        );


        setRequired(
            transactionId,
            true
        );


        setRequired(
            cashReceiver,
            false
        );


        if (cashReceiver)
            cashReceiver.value = "";

    }


    else {

        showSection(
            transactionBox
        );


        hideSection(
            cashReceiverBox
        );


        setRequired(
            transactionId,
            false
        );


        setRequired(
            cashReceiver,
            false
        );

    }

}


/* =========================================================
   19. VALIDATE EX STUDENT
========================================================= */

function validateExStudent() {

    const cat =
        category?.value || "";


    const year =
        Number(
            sscYear?.value || 0
        );


    if (!cat) {

        throw new Error(
            "Please select Registration Category."
        );

    }


    if (!year) {

        throw new Error(
            "Please enter SSC Batch / Year."
        );

    }


    if (
        cat === "EX_1986_2023"
    ) {

        if (
            year < 1986 ||
            year > 2023
        ) {

            throw new Error(
                "SSC year must be between 1986 and 2023 for this category."
            );

        }

    }


    if (
        cat === "EX_2024_2026"
    ) {

        if (
            year < 2024 ||
            year > 2026
        ) {

            throw new Error(
                "SSC year must be between 2024 and 2026 for this category."
            );

        }

    }

}


/* =========================================================
   20. VALIDATE CURRENT STUDENT
========================================================= */

function validateCurrentStudent() {

    const cat =
        category?.value || "";


    const cls =
        currentClass?.value || "";


    if (!cat) {

        throw new Error(
            "Please select Registration Category."
        );

    }


    if (!cls) {

        throw new Error(
            "Please select Current Class."
        );

    }


    if (
        cat === "CLASS_6_7"
    ) {

        if (
            cls !== "6th" &&
            cls !== "7th"
        ) {

            throw new Error(
                "Please select Class 6th or 7th."
            );

        }

    }


    else if (
        cat === "CLASS_8"
    ) {

        if (
            cls !== "8th"
        ) {

            throw new Error(
                "Please select Class 8th."
            );

        }

    }


    else if (
        cat === "CLASS_9_10"
    ) {

        if (
            cls !== "9th" &&
            cls !== "10th"
        ) {

            throw new Error(
                "Please select Class 9th or 10th."
            );

        }

    }

}


/* =========================================================
   21. PAYMENT VALIDATION
========================================================= */

function validatePayment(
    expectedFee
) {

    const method =
        paymentMethod?.value || "";


    if (!method) {

        throw new Error(
            "Please select Payment Method."
        );

    }


    if (
        method === "Cash"
    ) {

        if (
            !cashReceiver?.value.trim()
        ) {

            throw new Error(
                "Please enter Cash Receiver name."
            );

        }

    }


    else {

        if (
            !transactionId?.value.trim()
        ) {

            throw new Error(
                "Please enter Transaction / Reference ID."
            );

        }

    }


    const amount =
        Number(
            paymentAmount?.value || 0
        );


    if (
        amount !== expectedFee
    ) {

        throw new Error(
            `Payment amount must be exactly ৳${expectedFee}.`
        );

    }


    if (
        !paymentConfirmed?.checked
    ) {

        throw new Error(
            "Please confirm the payment information."
        );

    }

}


/* =========================================================
   22. GET NEXT SERIAL
========================================================= */

async function getNextSerial(
    prefix
) {

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
            )
            .limit(5000);


    if (error) {

        throw error;

    }


    let max = 0;


    (data || []).forEach(
        row => {

            const id =
                row.member_id || "";


            if (
                !id.startsWith(prefix)
            ) {

                return;

            }


            const number =
                parseInt(
                    id.substring(
                        prefix.length
                    ),
                    10
                );


            if (
                Number.isFinite(number) &&
                number > max
            ) {

                max = number;

            }

        }
    );


    return max + 1;

}


/* =========================================================
   23. NORMAL MEMBER ID
========================================================= */

async function generateMemberId(
    type,
    year
) {

    let prefix;


    if (
        type === "CURRENT STUDENT"
    ) {

        prefix =
            `${ID_PREFIX}CURRENT-`;

    }

    else {

        prefix =
            `${ID_PREFIX}${year}-`;

    }


    const serial =
        await getNextSerial(
            prefix
        );


    return (
        prefix +
        String(serial)
            .padStart(3, "0")
    );

}


/* =========================================================
   24. FAMILY SERIAL
========================================================= */

async function getNextFamilySerial(
    batch,
    studentSerial
) {

    const prefix =
        `${ID_PREFIX}FMLY-${batch}-${studentSerial}-`;


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
            )
            .limit(5000);


    if (error) {

        throw error;

    }


    let max = 0;


    (data || []).forEach(
        row => {

            const id =
                row.member_id || "";


            if (
                !id.startsWith(prefix)
            ) {

                return;

            }


            const number =
                parseInt(
                    id.substring(
                        prefix.length
                    ),
                    10
                );


            if (
                Number.isFinite(number) &&
                number > max
            ) {

                max = number;

            }

        }
    );


    return max + 1;

}


/* =========================================================
   25. FAMILY ID
========================================================= */

function createFamilyId(
    batch,
    studentSerial,
    serial
) {

    return (
        `${ID_PREFIX}FMLY-` +
        `${batch}-` +
        `${studentSerial}-` +
        String(serial)
            .padStart(2, "0")
    );

}


/* =========================================================
   26. PHOTO UPLOAD
========================================================= */

async function uploadPhoto(
    file,
    memberId
) {

    /*
       Compress photo first
    */

    const compressed =
        await compressPhoto(
            file
        );


    /*
       Safe member ID for storage path
    */

    const safeId =
        memberId.replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        );


    const filePath =
        `${safeId}/${Date.now()}.jpg`;


    /*
       Upload
    */

    const {
        error
    } =
        await supabaseClient
            .storage
            .from(PHOTO_BUCKET)
            .upload(
                filePath,
                compressed,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        "image/jpeg"
                }
            );


    if (error) {

        throw error;

    }


    /*
       Public URL
    */

    const {
        data
    } =
        supabaseClient
            .storage
            .from(PHOTO_BUCKET)
            .getPublicUrl(
                filePath
            );


    return {

        photo_path:
            filePath,

        photo_url:
            data?.publicUrl ||
            ""

    };

}


/* =========================================================
   27. DELETE PHOTO
========================================================= */

async function deletePhoto(
    path
) {

    if (!path) return;


    try {

        await supabaseClient
            .storage
            .from(PHOTO_BUCKET)
            .remove([
                path
            ]);

    }

    catch (error) {

        console.warn(
            "Photo cleanup error:",
            error
        );

    }

}


/* =========================================================
   28. FAMILY CHECKBOX EVENTS
========================================================= */

familyCheckboxes.forEach(
    checkbox => {

        checkbox.addEventListener(
            "change",
            function() {

                renderFamilyMembers();

                calculateFee();

            }
        );

    }
);


/* =========================================================
   29. MEMBER TYPE
========================================================= */

if (memberType) {

    memberType.addEventListener(
        "change",
        function() {

            hideMessage();

            updateRegistrationFields();

        }
    );

}


/* =========================================================
   30. CATEGORY
========================================================= */

if (category) {

    category.addEventListener(
        "change",
        function() {

            hideMessage();

            calculateFee();

        }
    );

}


/* =========================================================
   31. CURRENT CLASS
========================================================= */

if (currentClass) {

    currentClass.addEventListener(
        "change",
        function() {

            hideMessage();

            calculateFee();

        }
    );

}


/* =========================================================
   32. PAYMENT METHOD
========================================================= */

if (paymentMethod) {

    paymentMethod.addEventListener(
        "change",
        function() {

            hideMessage();

            updatePaymentFields();

        }
    );

}


/* =========================================================
   33. PHOTO
========================================================= */

if (photoInput) {

    photoInput.addEventListener(
        "change",
        function() {

            const file =
                this.files?.[0];


            if (!file) {

                clearPhotoPreview();

                return;

            }


            /*
               Maximum 10 MB
            */

            if (
                file.size >
                MAX_PHOTO_SIZE
            ) {

                this.value =
                    "";

                clearPhotoPreview();

                showError(
                    "Photo size cannot be more than 10 MB."
                );

                return;

            }


            /*
               Validate extension / MIME
            */

            const allowedTypes = [

                "image/jpeg",

                "image/jpg",

                "image/png",

                "image/webp"

            ];


            const fileType =
                String(
                    file.type || ""
                ).toLowerCase();


            const fileName =
                String(
                    file.name || ""
                ).toLowerCase();


            const validType =
                allowedTypes.includes(
                    fileType
                );


            const validExtension =
                /\.(jpg|jpeg|png|webp)$/i
                    .test(fileName);


            if (
                !validType &&
                !validExtension
            ) {

                this.value =
                    "";

                clearPhotoPreview();

                showError(
                    "Please select a JPG, PNG or WEBP photo."
                );

                return;

            }


            /*
               Preview
            */

            previewPhoto(file);

        }
    );

}


/* =========================================================
   34. PAYMENT AMOUNT
========================================================= */

if (paymentAmount) {

    paymentAmount.addEventListener(
        "input",
        function() {

            const expected =
                calculateFee();


            const entered =
                Number(
                    this.value || 0
                );


            if (
                expected > 0 &&
                entered !== expected
            ) {

                this.style.borderColor =
                    "#dc2626";

            }

            else {

                this.style.borderColor =
                    "";

            }

        }
    );

}


/* =========================================================
   35. SUBMIT
========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            hideMessage();


            if (submitBtn) {

                submitBtn.disabled =
                    true;

                submitBtn.textContent =
                    "Processing...";

            }


            let uploadedPhotoPath =
                null;


            try {

                const type =
                    memberType?.value || "";


                if (!type) {

                    throw new Error(
                        "Please select Member Type."
                    );

                }


                /* =================================================
                   FAMILY
                ================================================= */

                if (
                    type === "FAMILY"
                ) {

                    const studentName =
                        familyStudentName
                            ?.value
                            .trim() ||
                        "";


                    const studentBatch =
                        familyStudentBatch
                            ?.value
                            .trim() ||
                        "";


                    const studentSerial =
                        familyStudentSerial
                            ?.value
                            .trim() ||
                        "";


                    if (!studentName) {

                        throw new Error(
                            "Please enter Student Name."
                        );

                    }


                    if (!studentBatch) {

                        throw new Error(
                            "Please enter Student SSC Batch / Year."
                        );

                    }


                    if (!studentSerial) {

                        throw new Error(
                            "Please enter Student Registration Serial Number."
                        );

                    }


                    const familyMembers =
                        collectFamilyMembers();


                    if (
                        familyMembers.length === 0
                    ) {

                        throw new Error(
                            "Please select at least one Family Member."
                        );

                    }


                    const fee =
                        familyMembers.length *
                        FAMILY_MEMBER_FEE;


                    validatePayment(
                        fee
                    );


                    showProcess(
                        "Generating Family Member IDs..."
                    );


                    let serial =
                        await getNextFamilySerial(
                            studentBatch,
                            studentSerial
                        );


                    const rows = [];


                    familyMembers.forEach(
                        member => {

                            const id =
                                createFamilyId(
                                    studentBatch,
                                    studentSerial,
                                    serial
                                );


                            rows.push({

                                member_id:
                                    id,

                                name:
                                    member.name,

                                phone:
                                    member.phone,

                                blood_group:
                                    member.blood_group,

                                member_type:
                                    "FAMILY",

                                category:
                                    "FAMILY",

                                family_of_student:
                                    studentName,

                                family_student_batch:
                                    studentBatch,

                                family_student_serial:
                                    studentSerial,

                                family_member_type:
                                    member.type,

                                family_member_name:
                                    member.name,

                                family_member_serial:
                                    serial,

                                family_other_relation:
                                    member.relation,

                                payment_method:
                                    paymentMethod.value,

                                transaction_id:
                                    transactionId?.value.trim() ||
                                    null,

                                cash_receiver:
                                    cashReceiver?.value.trim() ||
                                    null,

                                /*
                                   Store total family fee
                                   only on first family row.
                                */

                                payment_amount:
                                    rows.length === 0
                                        ? fee
                                        : 0,

                                payment_confirmed:
                                    paymentConfirmed.checked,

                                payment_status:
                                    "Pending",

                                status:
                                    "Pending",

                                /*
                                   IMPORTANT:
                                   Database now uses Family,
                                   not FAMILY or Couple.
                                */

                                registration_type:
                                    "Family",

                                total_members:
                                    familyMembers.length

                            });


                            serial++;

                        }
                    );


                    showProcess(
                        "Saving Family Registration..."
                    );


                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from("alumni")
                            .insert(rows)
                            .select();


                    if (error) {

                        throw error;

                    }


                    const ids =
                        rows
                            .map(
                                row =>
                                    row.member_id
                            )
                            .join(", ");


                    showSuccess(`

                        <div style="
                            font-size:23px;
                            font-weight:bold;
                            margin-bottom:12px;
                        ">
                            Registration Successful!
                        </div>

                        <div>
                            Family Members:
                            <strong>
                                ${familyMembers.length}
                            </strong>
                        </div>

                        <div style="
                            margin-top:8px;
                        ">
                            Total Fee:
                            <strong>
                                ৳${fee}
                            </strong>
                        </div>

                        <div style="
                            margin-top:10px;
                            word-break:break-word;
                        ">
                            Family Member IDs:
                            <br>
                            <strong>
                                ${escapeHtml(ids)}
                            </strong>
                        </div>

                        <div style="
                            margin-top:10px;
                        ">
                            Payment Status:
                            <strong>
                                Pending Approval
                            </strong>
                        </div>

                    `);


                    form.reset();

                    clearFamilyFields();

                    clearNormalFields();

                    updateRegistrationFields();

                    updatePaymentFields();


                    return;

                }


                /* =================================================
                   NORMAL
                ================================================= */

                if (
                    type === "EX-STUDENT"
                ) {

                    validateExStudent();

                }


                if (
                    type === "CURRENT STUDENT"
                ) {

                    validateCurrentStudent();

                }


                /*
                   Browser required validation
                */

                if (
                    !form.checkValidity()
                ) {

                    form.reportValidity();

                    throw new Error(
                        "Please complete all required information."
                    );

                }


                const fee =
                    calculateFee();


                if (fee <= 0) {

                    throw new Error(
                        "Unable to calculate Registration Fee."
                    );

                }


                validatePayment(
                    fee
                );


                const selectedPhoto =
                    photoInput
                        ?.files?.[0];


                if (!selectedPhoto) {

                    throw new Error(
                        "Please select Profile Photo."
                    );

                }


                showProcess(
                    "Generating Member ID..."
                );


                const year =
                    type === "EX-STUDENT"
                        ? sscYear.value.trim()
                        : null;


                const memberId =
                    await generateMemberId(
                        type,
                        year
                    );


                showProcess(
                    "Uploading Profile Photo..."
                );


                const photo =
                    await uploadPhoto(
                        selectedPhoto,
                        memberId
                    );


                uploadedPhotoPath =
                    photo.photo_path;


                showProcess(
                    "Saving Registration..."
                );


                const row = {

                    member_id:
                        memberId,

                    name:
                        nameInput.value.trim(),

                    father_name:
                        fatherName.value.trim(),

                    mother_name:
                        motherName.value.trim(),

                    ssc_year:
                        type === "EX-STUDENT"
                            ? sscYear.value.trim()
                            : null,

                    current_class:
                        type === "CURRENT STUDENT"
                            ? currentClass.value
                            : null,

                    blood_group:
                        bloodGroup.value ||
                        null,

                    tshirt_size:
                        tshirtSize.value ||
                        null,

                    education:
                        education.value.trim() ||
                        null,

                    profession:
                        profession.value.trim() ||
                        null,

                    phone:
                        phone.value.trim(),

                    email:
                        email.value.trim() ||
                        null,

                    address:
                        address.value.trim() ||
                        null,

                    photo_path:
                        photo.photo_path,

                    photo_url:
                        photo.photo_url,

                    member_type:
                        type,

                    category:
                        category.value,

                    payment_method:
                        paymentMethod.value,

                    transaction_id:
                        transactionId?.value.trim() ||
                        null,

                    cash_receiver:
                        cashReceiver?.value.trim() ||
                        null,

                    payment_amount:
                        fee,

                    payment_confirmed:
                        paymentConfirmed.checked,

                    payment_status:
                        "Pending",

                    status:
                        "Pending",

                    /*
                       IMPORTANT:
                       Do NOT use "NORMAL".
                       Database accepts Alumni / Student / Family.
                    */

                    registration_type:
                        type === "EX-STUDENT"
                            ? "Alumni"
                            : "Student",

                    total_members:
                        1

                };


                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from("alumni")
                        .insert(row)
                        .select()
                        .single();


                if (error) {

                    throw error;

                }


                const finalId =
                    data?.member_id ||
                    memberId;


                showSuccess(`

                    <div style="
                        font-size:24px;
                        font-weight:bold;
                        margin-bottom:12px;
                    ">
                        Registration Successful!
                    </div>

                    <div>
                        Your Member ID
                    </div>

                    <div style="
                        margin:10px 0;
                        padding:13px;
                        background:#fff;
                        border:2px solid #168447;
                        border-radius:8px;
                        font-size:23px;
                        font-weight:bold;
                        letter-spacing:1px;
                    ">
                        ${escapeHtml(finalId)}
                    </div>

                    <div>
                        Registration Fee:
                        <strong>
                            ৳${fee}
                        </strong>
                    </div>

                    <div style="
                        margin-top:8px;
                    ">
                        Payment Status:
                        <strong>
                            Pending Approval
                        </strong>
                    </div>

                `);


                form.reset();

                clearFamilyFields();

                clearNormalFields();

                updateRegistrationFields();

                updatePaymentFields();


            }

            catch (error) {

                console.error(
                    "Registration Error:",
                    error
                );


                /*
                   If photo was uploaded but database
                   insertion failed, remove the photo.
                */

                if (
                    uploadedPhotoPath
                ) {

                    await deletePhoto(
                        uploadedPhotoPath
                    );

                }


                let text =
                    error?.message ||
                    "Registration failed. Please try again.";


                /*
                   Duplicate ID
                */

                if (
                    error?.code === "23505"
                ) {

                    text =
                        "This Member ID already exists. Please try again.";

                }


                /*
                   RLS / Permission
                */

                if (
                    error?.code === "42501"
                ) {

                    text =
                        "Database permission denied. Please check Supabase RLS policies.";

                }


                /*
                   Foreign key
                */

                if (
                    error?.code === "23503"
                ) {

                    text =
                        "Database relation error. Please check your Supabase table configuration.";

                }


                /*
                   Check constraint
                */

                if (
                    error?.code === "23514"
                ) {

                    text =
                        "Registration data does not match the database rules. Please check registration type settings.";

                }


                showError(
                    text
                );

            }

            finally {

                if (submitBtn) {

                    submitBtn.disabled =
                        false;

                    submitBtn.textContent =
                        "Submit Registration";

                }

            }

        }
    );

}


/* =========================================================
   36. INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           Initially hide dynamic sections
        */

        hideSection(
            categoryGroup
        );

        hideSection(
            personalSection
        );

        hideSection(
            currentStudentBox
        );

        hideSection(
            sscYearGroup
        );

        hideSection(
            normalBloodBox
        );

        hideSection(
            tshirtBox
        );

        hideSection(
            educationSection
        );

        hideSection(
            contactSection
        );

        hideSection(
            photoSection
        );

        hideSection(
            familyBox
        );


        hideSection(
            cashReceiverBox
        );


        updatePaymentFields();

        calculateFee();

        clearPhotoPreview();


        /*
           If Member Type already has a value,
           immediately show corresponding fields.
        */

        if (
            memberType?.value
        ) {

            updateRegistrationFields();

        }

    }
);


/* =========================================================
   END
========================================================= */