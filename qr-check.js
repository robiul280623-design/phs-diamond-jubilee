/* =====================================================
   PHS ALUMNI
   QR ATTENDANCE CHECK-IN
   CAMERA + GALLERY
   GRAND REUNION 2027
===================================================== */


/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";

const EVENT_NAME =
    "Grand Reunion 2027";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   ELEMENTS
===================================================== */

const reader =
    document.getElementById("reader");

const qrFile =
    document.getElementById("qrFile");

const statusBox =
    document.getElementById("status");

const resultBox =
    document.getElementById("result");

const photo =
    document.getElementById("photo");

const nameBox =
    document.getElementById("name");

const memberIdBox =
    document.getElementById("memberId");

const sscYearBox =
    document.getElementById("sscYear");

const registrationNoBox =
    document.getElementById("registrationNo");

const professionBox =
    document.getElementById("profession");

const bloodGroupBox =
    document.getElementById("bloodGroup");

const phoneBox =
    document.getElementById("phone");

const alumniStatusBox =
    document.getElementById("alumniStatus");

const paymentStatusBox =
    document.getElementById("paymentStatus");

const checkinBtn =
    document.getElementById("checkinBtn");

const resetBtn =
    document.getElementById("resetBtn");


/* =====================================================
   VARIABLES
===================================================== */

let scanner = null;

let scannerRunning = false;

let selectedAlumni = null;

let processing = false;


/* =====================================================
   STATUS
===================================================== */

function showStatus(
    text,
    type = "info"
) {

    if (!statusBox) {
        return;
    }

    statusBox.textContent =
        text;

    statusBox.className =
        "status " + type;

    statusBox.style.display =
        "block";
}


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(value) {

    return String(
        value ?? ""
    )
    .trim()
    .toLowerCase();

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
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


/* =====================================================
   EXTRACT MEMBER ID
===================================================== */

function extractMemberId(
    qrText
) {

    if (
        !qrText ||
        typeof qrText !== "string"
    ) {

        return null;

    }

    const text =
        qrText.trim();

    if (!text) {

        return null;

    }


    /* URL QR */

    try {

        const url =
            new URL(text);

        const params =
            url.searchParams;

        const id =
            params.get("id") ||
            params.get("member_id") ||
            params.get("memberId");

        if (id) {

            return id.trim();

        }

    }

    catch(error) {

        /* Not a URL */

    }


    /* JSON QR */

    try {

        const json =
            JSON.parse(text);

        const id =
            json.member_id ||
            json.memberId ||
            json.id;

        if (id) {

            return String(id).trim();

        }

    }

    catch(error) {

        /* Not JSON */

    }


    /* PHS Member ID */

    const match =
        text.match(
            /PHS[A-Z0-9-]+/i
        );

    if (match) {

        return match[0].trim();

    }


    return text;

}


/* =====================================================
   GET PHOTO URL
===================================================== */

function getPhotoUrl(
    person
) {

    if (!person) {
        return "";
    }

    if (person.photo_url) {

        return person.photo_url;

    }

    if (person.photo) {

        return person.photo;

    }

    if (person.photo_path) {

        const {
            data
        } =
        supabaseClient
            .storage
            .from("alumni-photos")
            .getPublicUrl(
                person.photo_path
            );

        return data?.publicUrl || "";

    }

    return "";

}


/* =====================================================
   CHECK DUPLICATE
===================================================== */

async function checkAlreadyCheckedIn(
    alumniId
) {

    const {
        data,
        error
    } =
    await supabaseClient
        .from("attendance")
        .select("id")
        .eq(
            "alumni_id",
            alumniId
        )
        .eq(
            "event_name",
            EVENT_NAME
        )
        .eq(
            "status",
            "Present"
        )
        .limit(1);

    if (error) {

        throw error;

    }

    return (
        Array.isArray(data) &&
        data.length > 0
    );

}


/* =====================================================
   SHOW ALUMNI
===================================================== */

async function showAlumni(
    person
) {

    selectedAlumni =
        person;

    if (!person) {
        return;
    }


    if (nameBox) {

        nameBox.textContent =
            person.name || "N/A";

    }

    if (memberIdBox) {

        memberIdBox.textContent =
            person.member_id || "N/A";

    }

    if (sscYearBox) {

        sscYearBox.textContent =
            person.ssc_year || "N/A";

    }

    if (registrationNoBox) {

        registrationNoBox.textContent =
            person.registration_no || "N/A";

    }

    if (professionBox) {

        professionBox.textContent =
            person.profession || "N/A";

    }

    if (bloodGroupBox) {

        bloodGroupBox.textContent =
            person.blood_group || "N/A";

    }

    if (phoneBox) {

        phoneBox.textContent =
            person.phone || "N/A";

    }

    if (alumniStatusBox) {

        alumniStatusBox.textContent =
            person.status || "N/A";

    }

    if (paymentStatusBox) {

        paymentStatusBox.textContent =
            person.payment_status || "N/A";

    }


    const photoUrl =
        getPhotoUrl(person);

    if (photo && photoUrl) {

        photo.src =
            photoUrl;

        photo.style.display =
            "block";

    }


    if (resultBox) {

        resultBox.style.display =
            "block";

    }


    const alumniStatus =
        normalize(
            person.status
        );

    const paymentStatus =
        normalize(
            person.payment_status
        );


    if (
        alumniStatus !==
        "approved"
    ) {

        showStatus(
            "❌ Alumni registration is not approved.",
            "error"
        );

        if (checkinBtn) {
            checkinBtn.disabled = true;
        }

        return;

    }


    if (
        paymentStatus !==
        "approved"
    ) {

        showStatus(
            "❌ Payment is not approved.",
            "error"
        );

        if (checkinBtn) {
            checkinBtn.disabled = true;
        }

        return;

    }


    showStatus(
        "Checking attendance...",
        "warning"
    );


    try {

        const alreadyChecked =
            await checkAlreadyCheckedIn(
                person.id
            );


        if (alreadyChecked) {

            showStatus(
                "✓ ATTENDANCE ALREADY CHECKED IN",
                "error"
            );

            if (checkinBtn) {
                checkinBtn.disabled = true;
            }

            return;

        }


        showStatus(
            "✓ Approved — Ready for Check-In",
            "success"
        );

        if (checkinBtn) {

            checkinBtn.disabled =
                false;

        }

    }

    catch(error) {

        console.error(
            "DUPLICATE CHECK ERROR:",
            error
        );

        showStatus(
            "❌ Could not verify attendance.",
            "error"
        );

        if (checkinBtn) {
            checkinBtn.disabled = true;
        }

    }

}


/* =====================================================
   FIND ALUMNI
===================================================== */

async function findAlumni(
    memberId
) {

    let result =
        await supabaseClient
            .from("alumni")
            .select("*")
            .eq(
                "member_id",
                memberId
            )
            .maybeSingle();


    if (
        result.error
    ) {

        throw result.error;

    }


    if (result.data) {

        return result.data;

    }


    /* Numeric database ID fallback */

    if (
        /^\d+$/.test(
            String(memberId)
        )
    ) {

        result =
            await supabaseClient
                .from("alumni")
                .select("*")
                .eq(
                    "id",
                    Number(memberId)
                )
                .maybeSingle();


        if (result.error) {

            throw result.error;

        }

        return result.data;

    }


    return null;

}


/* =====================================================
   PROCESS QR
===================================================== */

async function processQR(
    decodedText
) {

    if (processing) {
        return;
    }

    processing =
        true;


    showStatus(
        "🔎 Reading Member QR...",
        "warning"
    );


    try {

        const memberId =
            extractMemberId(
                decodedText
            );


        if (!memberId) {

            throw new Error(
                "Invalid QR Code."
            );

        }


        const person =
            await findAlumni(
                memberId
            );


        if (!person) {

            showStatus(
                "❌ Alumni not found.",
                "error"
            );

            return;

        }


        await stopScanner();

        await showAlumni(
            person
        );

    }

    catch(error) {

        console.error(
            "QR ERROR:",
            error
        );

        showStatus(
            "❌ " +
            (
                error.message ||
                "Verification failed."
            ),
            "error"
        );

    }

    finally {

        processing =
            false;

    }

}


/* =====================================================
   CHECK-IN
===================================================== */

if (checkinBtn) {

    checkinBtn.addEventListener(
        "click",
        async function() {

            if (
                !selectedAlumni ||
                processing
            ) {

                return;

            }


            processing =
                true;

            checkinBtn.disabled =
                true;


            try {

                const alumniStatus =
                    normalize(
                        selectedAlumni.status
                    );

                const paymentStatus =
                    normalize(
                        selectedAlumni.payment_status
                    );


                if (
                    alumniStatus !==
                    "approved"
                ) {

                    throw new Error(
                        "Alumni registration is not approved."
                    );

                }


                if (
                    paymentStatus !==
                    "approved"
                ) {

                    throw new Error(
                        "Payment is not approved."
                    );

                }


                /* FINAL DUPLICATE CHECK */

                const duplicate =
                    await checkAlreadyCheckedIn(
                        selectedAlumni.id
                    );


                if (duplicate) {

                    showStatus(
                        "✓ ATTENDANCE ALREADY CHECKED IN",
                        "error"
                    );

                    return;

                }


                /* INSERT ATTENDANCE */

                const {
                    error
                } =
                await supabaseClient
                    .from("attendance")
                    .insert({

                        alumni_id:
                            selectedAlumni.id,

                        event_name:
                            EVENT_NAME,

                        check_in_time:
                            new Date().toISOString(),

                        status:
                            "Present"

                    });


                if (error) {

                    if (
                        error.code ===
                        "23505"
                    ) {

                        showStatus(
                            "✓ ATTENDANCE ALREADY CHECKED IN",
                            "error"
                        );

                        return;

                    }

                    throw error;

                }


                showStatus(
                    "✓ ATTENDANCE CHECK-IN SUCCESSFUL",
                    "success"
                );


            }

            catch(error) {

                console.error(
                    "CHECK-IN ERROR:",
                    error
                );

                showStatus(
                    "❌ " +
                    (
                        error.message ||
                        "Check-In failed."
                    ),
                    "error"
                );

            }

            finally {

                processing =
                    false;

            }

        }
    );

}


/* =====================================================
   STOP SCANNER
===================================================== */

async function stopScanner() {

    if (!scanner) {
        return;
    }

    try {

        if (scannerRunning) {

            await scanner.stop();

        }

        try {

            await scanner.clear();

        }

        catch(error) {}

    }

    catch(error) {

        console.error(
            "STOP SCANNER:",
            error
        );

    }

    finally {

        scannerRunning =
            false;

        scanner =
            null;

    }

}


/* =====================================================
   START SCANNER
===================================================== */

async function startScanner() {

    if (
        scanner ||
        scannerRunning
    ) {

        return;

    }


    try {

        scanner =
            new Html5Qrcode(
                "reader"
            );


        await scanner.start(

            {
                facingMode:
                    "environment"
            },

            {
                fps: 10,

                qrbox: {
                    width: 250,
                    height: 250
                },

                aspectRatio: 1.0

            },

            function(decodedText) {

                if (
                    processing ||
                    !scannerRunning
                ) {

                    return;

                }

                scannerRunning =
                    false;

                processQR(
                    decodedText
                );

            },

            function(errorMessage) {

                /* Ignore continuous scan errors */

            }

        );


        scannerRunning =
            true;


        showStatus(
            "📷 Camera ready — Scan Alumni QR",
            "warning"
        );

    }

    catch(error) {

        console.error(
            "CAMERA ERROR:",
            error
        );

        scanner =
            null;

        scannerRunning =
            false;

        showStatus(
            "📷 Camera could not start. Please use Gallery.",
            "error"
        );

    }

}


/* =====================================================
   GALLERY
===================================================== */

if (qrFile) {

    qrFile.addEventListener(
        "change",
        async function(event) {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {
                return;
            }


            try {

                await stopScanner();


                showStatus(
                    "🖼️ Reading QR image...",
                    "warning"
                );


                const imageScanner =
                    new Html5Qrcode(
                        "reader"
                    );


                const decodedText =
                    await imageScanner.scanFile(
                        file,
                        true
                    );


                try {

                    await imageScanner.clear();

                }

                catch(error) {}


                await processQR(
                    decodedText
                );

            }

            catch(error) {

                console.error(
                    "GALLERY ERROR:",
                    error
                );

                showStatus(
                    "❌ QR Code was not found in this image.",
                    "error"
                );

            }

            finally {

                qrFile.value =
                    "";

            }

        }
    );

}


/* =====================================================
   RESET
===================================================== */

if (resetBtn) {

    resetBtn.addEventListener(
        "click",
        async function() {

            selectedAlumni =
                null;

            processing =
                false;

            if (checkinBtn) {
                checkinBtn.disabled = true;
            }

            if (resultBox) {
                resultBox.style.display = "none";
            }

            await stopScanner();

            startScanner();

        }
    );

}


/* =====================================================
   START
===================================================== */

startScanner();


console.log(
    "PHS QR Attendance loaded."
);

console.log(
    "Attendance Event:",
    EVENT_NAME
);