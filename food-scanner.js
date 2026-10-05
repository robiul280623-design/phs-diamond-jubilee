/* =====================================================
   PHS ALUMNI
   FOOD TOKEN SCANNER
   CAMERA + GALLERY
   GRAND REUNION 2027

   APPROVAL RULE:

   alumni.status = "approved"
   AND
   alumni.payment_status = "approved"

   ONLY APPROVED PAYMENT IS ACCEPTED.
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

function showStatus(
    text,
    type
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
   HIDE MEMBER
===================================================== */

function hideMember() {

    if (!memberInfo) {
        return;
    }


    memberInfo.style.display =
        "none";
}


/* =====================================================
   SHOW MEMBER
===================================================== */

function showMember(data) {

    if (!data) {
        return;
    }


    if (memberName) {

        memberName.textContent =
            data.name || "N/A";

    }


    if (memberId) {

        memberId.textContent =
            data.member_id || "N/A";

    }


    if (memberBatch) {

        memberBatch.textContent =
            data.ssc_year || "N/A";

    }


    if (memberPayment) {

        const paymentStatus =
            String(
                data.payment_status || ""
            )
            .trim()
            .toLowerCase();


        if (
            paymentStatus ===
            "approved"
        ) {

            memberPayment.textContent =
                "✓ APPROVED";

        }

        else {

            memberPayment.textContent =
                "✗ NOT APPROVED";

        }

    }


    if (memberInfo) {

        memberInfo.style.display =
            "block";

    }

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


    if (!text) {

        return null;

    }


    /*
       QR may contain:

       https://example.com/verify.html?id=PHS2A-DJ-2018-001
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
       QR itself is Member ID.
    */

    return text;

}


/* =====================================================
   PROCESS FOOD TOKEN
===================================================== */

async function processFoodToken(
    qrText
) {


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
                "id,member_id,name,ssc_year,payment_status,status"
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
           ALUMNI NOT FOUND
        ================================================= */

        if (!alumni) {

            showStatus(
                "❌ Alumni not found.",
                "error"
            );


            return;

        }


        /* =================================================
           DEBUG
        ================================================= */

        console.log(
            "--------------------------------"
        );

        console.log(
            "FOOD TOKEN CHECK"
        );

        console.log(
            "Member ID:",
            alumni.member_id
        );

        console.log(
            "Alumni Status:",
            alumni.status
        );

        console.log(
            "Payment Status:",
            alumni.payment_status
        );

        console.log(
            "--------------------------------"
        );


        /* =================================================
           ALUMNI STATUS
           MUST BE APPROVED
        ================================================= */

        const alumniStatus =
            String(
                alumni.status || ""
            )
            .trim()
            .toLowerCase();


        if (
            alumniStatus !==
            "approved"
        ) {

            showMember(
                alumni
            );


            showStatus(
                "❌ Alumni registration is not approved. Food cannot be issued.",
                "error"
            );


            return;

        }


        /* =================================================
           PAYMENT STATUS
           
           ONLY APPROVED IS ACCEPTED
        ================================================= */

        const paymentStatus =
            String(
                alumni.payment_status || ""
            )
            .trim()
            .toLowerCase();


        /*
           IMPORTANT:

           The only accepted value is:

           approved
        */

        if (
            paymentStatus !==
            "approved"
        ) {

            showMember(
                alumni
            );


            if (memberPayment) {

                memberPayment.textContent =
                    "✗ NOT APPROVED";

            }


            showStatus(
                "❌ Payment is not approved. Food cannot be issued.",
                "error"
            );


            return;

        }


        /* =================================================
           BOTH APPROVED
        ================================================= */

        showMember(
            alumni
        );


        if (memberPayment) {

            memberPayment.textContent =
                "✓ APPROVED";

        }


        showStatus(
            "Payment approved. Checking Food Token...",
            "warning"
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


        console.log(
            "Food Token RPC Result:",
            result
        );


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


            await stopCamera();


            if (scanAgain) {

                scanAgain.style.display =
                    "block";

            }


            return;

        }


        /* =================================================
           RPC FAILED
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


        if (scanAgain) {

            scanAgain.style.display =
                "block";

        }


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

function cameraSuccess(
    decodedText
) {

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
       QR scanning errors.
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
   GALLERY QR SCANNER
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


                /* Stop live camera */

                await stopCamera();


                /* Create temporary scanner */

                const imageScanner =
                    new Html5Qrcode(
                        "reader"
                    );


                /* Scan QR */

                const decodedText =
                    await imageScanner.scanFile(
                        file,
                        true
                    );


                /* Clear scanner */

                try {

                    await imageScanner.clear();

                }

                catch(error) {

                    console.log(
                        "Image scanner clear error:",
                        error
                    );

                }


                /* Process */

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
        async function() {

            await stopCamera();

            window.location.reload();

        }
    );

}


/* =====================================================
   START APPLICATION
===================================================== */

startCamera();


/* =====================================================
   READY
===================================================== */

console.log(
    "PHS Food Token Scanner loaded successfully."
);

console.log(
    "FOOD TOKEN RULE: payment_status must be approved."
);