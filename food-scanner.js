/* =====================================================
   PHS ALUMNI
   FOOD TOKEN SCANNER
   CAMERA + GALLERY
===================================================== */


/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   ELEMENTS
===================================================== */

const statusBox =
    document.getElementById("status");

const memberInfo =
    document.getElementById("memberInfo");

const memberName =
    document.getElementById("memberName");

const memberId =
    document.getElementById("memberId");

const memberBatch =
    document.getElementById("memberBatch");

const memberPayment =
    document.getElementById("memberPayment");

const qrImageInput =
    document.getElementById("qrImageInput");

const scanAgain =
    document.getElementById("scanAgain");


/* =====================================================
   VARIABLES
===================================================== */

let scanner = null;

let scannerStarted = false;

let processing = false;


/* =====================================================
   STATUS
===================================================== */

function showStatus(text, type) {

    statusBox.textContent =
        text;

    statusBox.className =
        "status " + type;

    statusBox.style.display =
        "block";
}


/* =====================================================
   MEMBER
===================================================== */

function hideMember() {

    memberInfo.style.display =
        "none";
}


function showMember(data) {

    memberName.textContent =
        data.name || "N/A";

    memberId.textContent =
        data.member_id || "N/A";

    memberBatch.textContent =
        data.ssc_year || "N/A";

    memberPayment.textContent =
        "✓ PAID";

    memberInfo.style.display =
        "block";
}


/* =====================================================
   EXTRACT MEMBER ID
===================================================== */

function extractMemberId(qrText) {

    if (
        !qrText ||
        typeof qrText !== "string"
    ) {
        return null;
    }


    const text =
        qrText.trim();


    /*
       If QR contains a URL:
       /verify.html?id=MEM-XXXX
    */

    try {

        const url =
            new URL(text);

        const id =
            url.searchParams.get("id");

        if (id) {

            return id.trim();
        }

    }

    catch(error) {

        /*
           QR is not a URL.
        */

    }


    /*
       Otherwise QR itself is Member ID.
    */

    return text || null;
}


/* =====================================================
   VERIFY FOOD TOKEN
===================================================== */

async function processFoodToken(qrText) {


    if (processing) {

        return;
    }


    processing =
        true;


    hideMember();


    const id =
        extractMemberId(
            qrText
        );


    if (!id) {

        showStatus(
            "❌ Invalid QR Code.",
            "error"
        );

        processing =
            false;

        return;
    }


    showStatus(
        "Checking Food Token...",
        "warning"
    );


    try {


        /* =================================================
           FIND ALUMNI
        ================================================= */

        const {
            data: alumni,
            error: alumniError
        } =
        await supabaseClient
            .from("alumni")
            .select(
                "member_id,name,ssc_year,payment_status"
            )
            .eq(
                "member_id",
                id
            )
            .maybeSingle();


        if (alumniError) {

            throw alumniError;
        }


        /* =================================================
           NOT FOUND
        ================================================= */

        if (!alumni) {

            showStatus(
                "❌ Alumni not found.",
                "error"
            );

            return;
        }


        /* =================================================
           PAYMENT
        ================================================= */

        const payment =
            String(
                alumni.payment_status || ""
            )
            .trim()
            .toLowerCase();


        if (payment !== "paid") {

            showMember(
                alumni
            );

            memberPayment.textContent =
                "✗ PENDING";


            showStatus(
                "❌ Payment is Pending. Food cannot be issued.",
                "error"
            );

            return;
        }


        /* =================================================
           DISPLAY MEMBER
        ================================================= */

        showMember(
            alumni
        );


        /* =================================================
           USE FOOD TOKEN
        ================================================= */

        const {
            data: result,
            error: tokenError
        } =
        await supabaseClient.rpc(
            "use_food_token",
            {
                p_member_id:
                    alumni.member_id,

                p_used_by:
                    "Food Counter"
            }
        );


        if (tokenError) {

            throw tokenError;
        }


        /* =================================================
           ALREADY USED
        ================================================= */

        if (
            result &&
            result.already_used === true
        ) {

            showStatus(
                "❌ FOOD ALREADY COLLECTED",
                "error"
            );

            return;
        }


        /* =================================================
           FAILED
        ================================================= */

        if (
            !result ||
            result.success !== true
        ) {

            showStatus(
                "❌ " +
                (
                    result?.message ||
                    "Food Token rejected."
                ),
                "error"
            );

            return;
        }


        /* =================================================
           SUCCESS
        ================================================= */

        showStatus(
            "✓ FOOD TOKEN ACCEPTED — FOOD MAY BE ISSUED",
            "success"
        );


        await stopCamera();


        scanAgain.style.display =
            "block";


    }

    catch(error) {

        console.error(
            "FOOD TOKEN ERROR:",
            error
        );


        showStatus(
            "❌ Error: " +
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
   CAMERA SUCCESS
===================================================== */

function cameraSuccess(decodedText) {

    if (
        processing ||
        !scannerStarted
    ) {

        return;
    }


    scannerStarted =
        false;


    processFoodToken(
        decodedText
    );

}


/* =====================================================
   CAMERA ERROR
===================================================== */

function cameraError() {

    /*
       Ignore continuous
       scanning errors.
    */

}


/* =====================================================
   START CAMERA
===================================================== */

async function startCamera() {


    if (scanner) {

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

            cameraSuccess,

            cameraError

        );


        scannerStarted =
            true;


        showStatus(
            "📷 Camera ready — Scan Food QR",
            "warning"
        );


        console.log(
            "Camera started successfully."
        );


    }

    catch(error) {

        console.error(
            "CAMERA ERROR:",
            error
        );


        scanner =
            null;


        showStatus(
            "📷 Camera could not start. Please allow camera permission or use Gallery.",
            "error"
        );

    }

}


/* =====================================================
   STOP CAMERA
===================================================== */

async function stopCamera() {


    if (!scanner) {

        return;
    }


    try {

        if (scannerStarted) {

            await scanner.stop();

        }

    }

    catch(error) {

        console.error(
            "STOP CAMERA ERROR:",
            error
        );

    }

    finally {

        scannerStarted =
            false;

    }

}


/* =====================================================
   GALLERY QR SCAN
===================================================== */

if (qrImageInput) {

    qrImageInput.addEventListener(
        "change",
        async function(event) {


            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {

                return;
            }


            showStatus(
                "🖼️ Reading QR image...",
                "warning"
            );


            try {


                /*
                   Stop live camera
                */

                await stopCamera();


                /*
                   Create temporary
                   image scanner
                */

                const imageScanner =
                    new Html5Qrcode(
                        "reader"
                    );


                /*
                   Read QR from image
                */

                const decodedText =
                    await imageScanner.scanFile(
                        file,
                        true
                    );


                /*
                   Clear image scanner
                */

                try {

                    await imageScanner.clear();

                }

                catch(error) {

                    console.log(
                        "Image scanner clear error:",
                        error
                    );

                }


                /*
                   Verify token
                */

                await processFoodToken(
                    decodedText
                );


            }

            catch(error) {

                console.error(
                    "GALLERY SCAN ERROR:",
                    error
                );


                showStatus(
                    "❌ QR Code was not found in this image. Please select a clear QR image.",
                    "error"
                );

            }


            finally {

                qrImageInput.value =
                    "";

            }

        }
    );

}


/* =====================================================
   SCAN AGAIN
===================================================== */

if (scanAgain) {

    scanAgain.addEventListener(
        "click",
        function() {

            window.location.reload();

        }
    );

}


/* =====================================================
   START CAMERA
===================================================== */

startCamera();


/* =====================================================
   READY
===================================================== */

console.log(
    "PHS Food Token Scanner loaded successfully."
);