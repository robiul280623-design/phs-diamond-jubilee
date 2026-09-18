// @ts-nocheck

/* =========================================================
   PAHARCHANDA HIGH SCHOOL
   ALUMNI MAGAZINE SUBMISSION
   GRAND REUNION 2027

   FIXED VERSION
   - Correct bucket: magazine-photos
   - Reliable image preview
   - Reliable image loading
   - Photo path + URL saved correctly
   - Multiple photo upload
   - 200 KB target compression
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";


/* =========================================================
   DATABASE / STORAGE
========================================================= */

const TABLE_NAME =
    "magazine_submissions";

/*
   IMPORTANT:
   Magazine photos must use magazine-photos bucket.
*/
const BUCKET_NAME =
    "magazine-photos";


/* =========================================================
   PHOTO SETTINGS
========================================================= */

const MAX_ORIGINAL_SIZE =
    5 * 1024 * 1024;

const TARGET_SIZE =
    200 * 1024;

const MAX_WIDTH =
    1600;

const MAX_HEIGHT =
    1600;


/* =========================================================
   SUPABASE CLIENT
========================================================= */

const {
    createClient
} = window.supabase;

const supabaseClient =
    createClient(
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
   STATE
========================================================= */

let submissionType =
    "Writing";

let selectedCategory =
    "গল্প";

let selectedFiles =
    [];


/* =========================================================
   DOM
========================================================= */

const message =
    document.getElementById("message");

const nameInput =
    document.getElementById("name");

const sscYearInput =
    document.getElementById("sscYear");

const titleInput =
    document.getElementById("title");

const contentInput =
    document.getElementById("content");

const photoFile =
    document.getElementById("photoFile");

const photoDescription =
    document.getElementById("photoDescription");

const previewGrid =
    document.getElementById("previewGrid");

const reviewBox =
    document.getElementById("reviewBox");

const reviewCount =
    document.getElementById("reviewCount");

const addMoreBtn =
    document.getElementById("addMoreBtn");

const submitBtn =
    document.getElementById("submitBtn");

const writingSection =
    document.getElementById("writingSection");

const photoSection =
    document.getElementById("photoSection");

const writingTypeCard =
    document.getElementById("writingTypeCard");

const photoTypeCard =
    document.getElementById("photoTypeCard");

const progressWrap =
    document.getElementById("progressWrap");

const progressFill =
    document.getElementById("progressFill");

const progressText =
    document.getElementById("progressText");

const progressPercent =
    document.getElementById("progressPercent");


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    text,
    type = "error"
) {

    if (!message) return;

    message.textContent =
        text;

    message.className =
        "message show " + type;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function clearMessage() {

    if (!message) return;

    message.textContent =
        "";

    message.className =
        "message";
}


/* =========================================================
   PROGRESS
========================================================= */

function setProgress(
    percent,
    text
) {

    if (!progressWrap) return;

    percent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );

    progressWrap.classList.add(
        "show"
    );

    progressFill.style.width =
        percent + "%";

    progressPercent.textContent =
        Math.round(percent) + "%";

    progressText.textContent =
        text ||
        "প্রস্তুত হচ্ছে...";
}


function hideProgress() {

    if (!progressWrap) return;

    progressWrap.classList.remove(
        "show"
    );

    progressFill.style.width =
        "0%";
}


/* =========================================================
   SUBMISSION TYPE
========================================================= */

function setSubmissionType(
    type
) {

    submissionType =
        type;

    const isWriting =
        type === "Writing";

    writingSection.classList.toggle(
        "hidden",
        !isWriting
    );

    photoSection.classList.toggle(
        "hidden",
        isWriting
    );

    writingTypeCard.classList.toggle(
        "active",
        isWriting
    );

    photoTypeCard.classList.toggle(
        "active",
        !isWriting
    );

    updateFinalReview();
}


/* =========================================================
   TYPE EVENTS
========================================================= */

document
    .querySelectorAll(
        'input[name="submissionType"]'
    )
    .forEach(
        radio => {

            radio.addEventListener(
                "change",
                function() {

                    setSubmissionType(
                        this.value
                    );

                }
            );

        }
    );


/* =========================================================
   CATEGORY
========================================================= */

document
    .querySelectorAll(
        ".category"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function() {

                    document
                        .querySelectorAll(
                            ".category"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );

                    this.classList.add(
                        "active"
                    );

                    selectedCategory =
                        this.textContent.trim();

                    updateFinalReview();

                }
            );

        }
    );


/* =========================================================
   FILE INPUT
========================================================= */

if (photoFile) {

    photoFile.addEventListener(
        "change",
        function() {

            if (
                !this.files ||
                this.files.length === 0
            ) {
                return;
            }

            addNewPhotos(
                Array.from(
                    this.files
                )
            );

        }
    );

}


/* =========================================================
   ADD MORE
========================================================= */

if (addMoreBtn) {

    addMoreBtn.addEventListener(
        "click",
        function() {

            photoFile.click();

        }
    );

}


/* =========================================================
   VALID IMAGE
========================================================= */

function isValidImage(
    file
) {

    if (!file) {
        return false;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    const type =
        String(
            file.type || ""
        ).toLowerCase();

    if (
        allowedTypes.includes(
            type
        )
    ) {
        return true;
    }

    const name =
        String(
            file.name || ""
        ).toLowerCase();

    return /\.(jpg|jpeg|png|webp)$/i
        .test(name);
}


/* =========================================================
   ADD PHOTOS
========================================================= */

function addNewPhotos(
    files
) {

    clearMessage();

    let added = 0;

    for (
        const file of files
    ) {

        if (
            !isValidImage(file)
        ) {

            showMessage(
                `${file.name} একটি বৈধ ছবি নয়। JPG, PNG অথবা WebP ব্যবহার করুন।`
            );

            continue;
        }


        if (
            file.size >
            MAX_ORIGINAL_SIZE
        ) {

            showMessage(
                `${file.name} ৫ MB-এর বেশি।`
            );

            continue;
        }


        const duplicate =
            selectedFiles.some(
                item =>
                    item.name ===
                        file.name &&
                    item.size ===
                        file.size &&
                    item.lastModified ===
                        file.lastModified
            );


        if (duplicate) {
            continue;
        }


        selectedFiles.push(
            file
        );

        added++;

    }


    photoFile.value =
        "";


    renderPhotoReview();

    updateFinalReview();


    if (added > 0) {
        clearMessage();
    }

}


/* =========================================================
   PHOTO PREVIEW
   Object URL is more reliable than FileReader
========================================================= */

function renderPhotoReview() {

    if (!previewGrid) return;

    previewGrid.innerHTML =
        "";

    reviewCount.textContent =
        `${selectedFiles.length} টি ছবি`;

    reviewBox.classList.toggle(
        "show",
        selectedFiles.length > 0
    );


    selectedFiles.forEach(
        (
            file,
            index
        ) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "photo-card";


            const img =
                document.createElement(
                    "img"
                );

            img.alt =
                file.name;


            const remove =
                document.createElement(
                    "button"
                );

            remove.type =
                "button";

            remove.className =
                "remove-photo";

            remove.textContent =
                "×";

            remove.title =
                "ছবি বাদ দিন";


            const objectUrl =
                URL.createObjectURL(
                    file
                );

            img.src =
                objectUrl;


            img.onload =
                function() {

                    URL.revokeObjectURL(
                        objectUrl
                    );

                };


            img.onerror =
                function() {

                    URL.revokeObjectURL(
                        objectUrl
                    );

                    img.alt =
                        "ছবি দেখা যাচ্ছে না";

                };


            remove.addEventListener(
                "click",
                function() {

                    selectedFiles.splice(
                        index,
                        1
                    );

                    renderPhotoReview();

                    updateFinalReview();

                }
            );


            card.appendChild(
                img
            );

            card.appendChild(
                remove
            );

            previewGrid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   IMAGE LOAD
   Object URL based
========================================================= */

function loadImageFromFile(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (!file) {

                reject(
                    new Error(
                        "কোনো ছবি পাওয়া যায়নি।"
                    )
                );

                return;
            }


            let objectUrl;

            try {

                objectUrl =
                    URL.createObjectURL(
                        file
                    );

            }
            catch (error) {

                reject(
                    new Error(
                        "ছবিটি access করা যাচ্ছে না।"
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

                    resolve(img);

                };


            img.onerror =
                function() {

                    URL.revokeObjectURL(
                        objectUrl
                    );

                    reject(
                        new Error(
                            "ছবিটি পড়া যাচ্ছে না। একটি valid JPG, PNG অথবা WebP দিন।"
                        )
                    );

                };


            img.src =
                objectUrl;

        }
    );

}


/* =========================================================
   CANVAS TO BLOB
========================================================= */

function canvasToBlob(
    canvas,
    quality
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (
                !canvas ||
                typeof canvas.toBlob !==
                    "function"
            ) {

                reject(
                    new Error(
                        "আপনার browser photo compression support করছে না।"
                    )
                );

                return;
            }


            canvas.toBlob(
                blob => {

                    if (!blob) {

                        reject(
                            new Error(
                                "ছবি compress করা যায়নি।"
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
   COMPRESS IMAGE
========================================================= */

async function compressImage(
    file
) {

    const img =
        await loadImageFromFile(
            file
        );


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
            "ছবির dimension পাওয়া যাচ্ছে না।"
        );

    }


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


    const qualities = [
        0.85,
        0.78,
        0.70,
        0.62,
        0.54,
        0.46,
        0.38,
        0.30,
        0.22,
        0.18
    ];


    for (
        let dimensionTry = 0;
        dimensionTry < 8;
        dimensionTry++
    ) {

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
                "2d",
                {
                    alpha: false
                }
            );


        if (!ctx) {

            throw new Error(
                "Photo processing unavailable."
            );

        }


        /*
           White background prevents
           transparent PNG background
           problems after JPEG conversion.
        */

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


        for (
            const quality of qualities
        ) {

            const blob =
                await canvasToBlob(
                    canvas,
                    quality
                );


            if (
                blob.size <=
                TARGET_SIZE
            ) {

                return new File(
                    [blob],
                    `magazine_${Date.now()}.jpg`,
                    {
                        type:
                            "image/jpeg",
                        lastModified:
                            Date.now()
                    }
                );

            }

        }


        width =
            Math.max(
                400,
                Math.round(
                    width * 0.82
                )
            );

        height =
            Math.max(
                400,
                Math.round(
                    height * 0.82
                )
            );

    }


    /* =====================================================
       FINAL FALLBACK
    ===================================================== */

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


    const blob =
        await canvasToBlob(
            canvas,
            0.15
        );


    if (!blob) {

        throw new Error(
            "ছবি compress করা যায়নি।"
        );

    }


    return new File(
        [blob],
        `magazine_${Date.now()}.jpg`,
        {
            type:
                "image/jpeg",
            lastModified:
                Date.now()
        }
    );

}


/* =========================================================
   UPLOAD PHOTO
========================================================= */

async function uploadPhoto(
    file,
    index,
    total
) {

    setProgress(
        35 +
        (
            index /
            total
        ) * 45,
        `ছবি ${index + 1}/${total} প্রস্তুত ও আপলোড হচ্ছে...`
    );


    const compressed =
        await compressImage(
            file
        );


    if (
        compressed.size >
        TARGET_SIZE
    ) {

        throw new Error(
            `${file.name} ২০০ KB-এর মধ্যে compress করা যায়নি।`
        );

    }


    const randomPart =
        Math.random()
            .toString(36)
            .substring(2, 9);


    /*
       Stable and easy-to-find path.
    */

    const path =
        `submissions/${Date.now()}_${randomPart}_${index}.jpg`;


    const {
        error
    } =
        await supabaseClient
            .storage
            .from(
                BUCKET_NAME
            )
            .upload(
                path,
                compressed,
                {
                    cacheControl:
                        "31536000",

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
       Public URL.
       The bucket must be PUBLIC.
    */

    const {
        data
    } =
        supabaseClient
            .storage
            .from(
                BUCKET_NAME
            )
            .getPublicUrl(
                path
            );


    const publicUrl =
        data?.publicUrl || "";


    if (!publicUrl) {

        throw new Error(
            "ছবির Public URL তৈরি করা যায়নি।"
        );

    }


    return {

        path:
            path,

        url:
            publicUrl

    };

}


/* =========================================================
   VALIDATE FORM
========================================================= */

function validateForm() {

    const name =
        nameInput.value.trim();

    const year =
        Number(
            sscYearInput.value
        );


    if (!name) {

        showMessage(
            "দয়া করে আপনার পূর্ণ নাম লিখুন।"
        );

        nameInput.focus();

        return false;

    }


    if (
        !year ||
        year < 1965 ||
        year > 2035
    ) {

        showMessage(
            "দয়া করে সঠিক SSC / সমমানের বছর দিন।"
        );

        sscYearInput.focus();

        return false;

    }


    if (
        submissionType ===
        "Writing"
    ) {

        const title =
            titleInput.value.trim();

        const content =
            contentInput.value.trim();


        if (!title) {

            showMessage(
                "দয়া করে লেখার শিরোনাম দিন।"
            );

            titleInput.focus();

            return false;

        }


        if (!content) {

            showMessage(
                "দয়া করে আপনার লেখা লিখুন।"
            );

            contentInput.focus();

            return false;

        }

    }


    if (
        submissionType ===
        "Photo" &&
        selectedFiles.length === 0
    ) {

        showMessage(
            "দয়া করে অন্তত একটি ছবি নির্বাচন করুন।"
        );

        return false;

    }


    return true;

}


/* =========================================================
   FINAL REVIEW
========================================================= */

function updateFinalReview() {

    document.getElementById(
        "reviewName"
    ).textContent =
        nameInput.value.trim() ||
        "—";


    document.getElementById(
        "reviewYear"
    ).textContent =
        sscYearInput.value ||
        "—";


    document.getElementById(
        "reviewType"
    ).textContent =
        submissionType;


    document.getElementById(
        "reviewCategory"
    ).textContent =
        submissionType ===
            "Writing"
            ? selectedCategory
            : "—";


    document.getElementById(
        "reviewTitle"
    ).textContent =
        submissionType ===
            "Writing"
            ? (
                titleInput.value.trim() ||
                "—"
            )
            : "—";


    document.getElementById(
        "reviewPhotos"
    ).textContent =
        `${selectedFiles.length} টি`;

}


/* =========================================================
   LIVE REVIEW
========================================================= */

[
    nameInput,
    sscYearInput,
    titleInput
].forEach(
    element => {

        if (!element) return;

        element.addEventListener(
            "input",
            updateFinalReview
        );

    }
);


/* =========================================================
   SUBMIT
========================================================= */

submitBtn.addEventListener(
    "click",
    submitForm
);


async function submitForm() {

    clearMessage();


    if (!validateForm()) {
        return;
    }


    submitBtn.disabled =
        true;


    setProgress(
        5,
        "তথ্য যাচাই হচ্ছে..."
    );


    let uploadedPaths = [];


    try {

        const name =
            nameInput.value.trim();

        const year =
            Number(
                sscYearInput.value
            );


        /* =================================================
           WRITING
        ================================================= */

        if (
            submissionType ===
            "Writing"
        ) {

            setProgress(
                30,
                "লেখা জমা দেওয়া হচ্ছে..."
            );


            const {
                error
            } =
                await supabaseClient
                    .from(
                        TABLE_NAME
                    )
                    .insert([
                        {

                            name:
                                name,

                            ssc_year:
                                year,

                            submission_type:
                                "Writing",

                            title:
                                titleInput
                                    .value
                                    .trim(),

                            content:
                                contentInput
                                    .value
                                    .trim(),

                            description:
                                selectedCategory,

                            photo_path:
                                JSON.stringify(
                                    []
                                ),

                            photo_url:
                                JSON.stringify(
                                    []
                                ),

                            file_url:
                                JSON.stringify(
                                    []
                                ),

                            status:
                                "Pending"

                        }
                    ]);


            if (error) {
                throw error;
            }


            setProgress(
                100,
                "সফলভাবে জমা হয়েছে"
            );


            showMessage(
                "🎉 আপনার লেখা সফলভাবে জমা হয়েছে। ম্যাগাজিন কমিটি যাচাই করার পর প্রকাশের জন্য বিবেচনা করবে।",
                "success"
            );


            resetForm();

            return;

        }


        /* =================================================
           PHOTO SUBMISSION
        ================================================= */

        setProgress(
            10,
            "ছবি প্রস্তুত হচ্ছে..."
        );


        const uploadedUrls =
            [];


        for (
            let i = 0;
            i < selectedFiles.length;
            i++
        ) {

            const result =
                await uploadPhoto(
                    selectedFiles[i],
                    i,
                    selectedFiles.length
                );


            uploadedPaths.push(
                result.path
            );

            uploadedUrls.push(
                result.url
            );

        }


        setProgress(
            85,
            "ছবির তথ্য সংরক্ষণ হচ্ছে..."
        );


        /*
           Save BOTH:
           photo_path = Storage paths
           photo_url  = public URLs
           file_url   = public URLs

           Admin can use either one.
        */

        const {
            error
        } =
            await supabaseClient
                .from(
                    TABLE_NAME
                )
                .insert([
                    {

                        name:
                            name,

                        ssc_year:
                            year,

                        submission_type:
                            "Photo",

                        title:
                            null,

                        content:
                            null,

                        description:
                            photoDescription
                                .value
                                .trim() ||
                            null,

                        photo_path:
                            JSON.stringify(
                                uploadedPaths
                            ),

                        photo_url:
                            JSON.stringify(
                                uploadedUrls
                            ),

                        file_url:
                            JSON.stringify(
                                uploadedUrls
                            ),

                        status:
                            "Pending"

                    }
                ]);


        if (error) {
            throw error;
        }


        setProgress(
            100,
            "সফলভাবে জমা হয়েছে"
        );


        showMessage(
            "🎉 আপনার ছবিগুলো সফলভাবে জমা হয়েছে। ধন্যবাদ!",
            "success"
        );


        resetForm();

    }
    catch (error) {

        console.error(
            "MAGAZINE SUBMISSION ERROR:",
            error
        );


        /* =================================================
           CLEANUP
        ================================================= */

        if (
            uploadedPaths.length > 0
        ) {

            try {

                await supabaseClient
                    .storage
                    .from(
                        BUCKET_NAME
                    )
                    .remove(
                        uploadedPaths
                    );

            }
            catch (
                cleanupError
            ) {

                console.error(
                    "Cleanup error:",
                    cleanupError
                );

            }

        }


        let errorText =
            error?.message ||
            "Submission failed.";


        if (
            /bucket.*not found|not found/i
                .test(
                    errorText
                )
        ) {

            errorText =
                "magazine-photos Storage bucket পাওয়া যাচ্ছে না। Supabase Storage-এ bucketটির নাম magazine-photos আছে কিনা দেখুন।";

        }

        else if (
            /row-level security|permission denied/i
                .test(
                    errorText
                )
        ) {

            errorText =
                "Database RLS policy submission অনুমতি দিচ্ছে না।";

        }

        else if (
            /storage.objects|new row violates row-level security/i
                .test(
                    errorText
                )
        ) {

            errorText =
                "magazine-photos Storage policy upload অনুমতি দিচ্ছে না।";

        }

        else if (
            /compact jws|jwt|invalid api key/i
                .test(
                    errorText
                )
        ) {

            errorText =
                "Supabase authentication error। Project URL এবং Publishable Key পরীক্ষা করুন।";

        }


        showMessage(
            "❌ Submission ব্যর্থ হয়েছে: " +
            errorText
        );


        hideProgress();

    }
    finally {

        submitBtn.disabled =
            false;

    }

}


/* =========================================================
   RESET
========================================================= */

function resetForm() {

    nameInput.value =
        "";

    sscYearInput.value =
        "";

    titleInput.value =
        "";

    contentInput.value =
        "";

    photoDescription.value =
        "";

    selectedFiles =
        [];


    photoFile.value =
        "";


    renderPhotoReview();


    selectedCategory =
        "গল্প";


    document
        .querySelectorAll(
            ".category"
        )
        .forEach(
            (
                item,
                index
            ) => {

                item.classList.toggle(
                    "active",
                    index === 0
                );

            }
        );


    const writingRadio =
        document.querySelector(
            'input[name="submissionType"][value="Writing"]'
        );


    if (writingRadio) {

        writingRadio.checked =
            true;

    }


    setSubmissionType(
        "Writing"
    );


    updateFinalReview();


    setTimeout(
        () =>
            hideProgress(),
        1500
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

setSubmissionType(
    "Writing"
);

updateFinalReview();


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "Paharchanda Alumni Magazine initialized."
);

console.log(
    "Supabase URL:",
    SUPABASE_URL
);

console.log(
    "Magazine table:",
    TABLE_NAME
);

console.log(
    "Magazine photo bucket:",
    BUCKET_NAME
);

console.log(
    "Publishable key detected:",
    SUPABASE_KEY.startsWith(
        "sb_publishable_"
    )
);