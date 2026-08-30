/* =====================================================
   PHS ALUMNI DIGITAL MEMBERSHIP CARD
   FINAL JAVASCRIPT
===================================================== */


/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";


/* =====================================================
   SUPABASE CLIENT
===================================================== */

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   ELEMENTS
===================================================== */

const searchBtn =
    document.getElementById("searchBtn");

const memberIdInput =
    document.getElementById("memberId");

const message =
    document.getElementById("message");

const printArea =
    document.getElementById("printArea");

const profilePhoto =
    document.getElementById("profilePhoto");

const alumniName =
    document.getElementById("alumniName");

const displayMemberId =
    document.getElementById("displayMemberId");

const sscYear =
    document.getElementById("sscYear");

const bloodGroup =
    document.getElementById("bloodGroup");

const paymentStatus =
    document.getElementById("paymentStatus");

const qrCode =
    document.getElementById("qrCode");

const foodName =
    document.getElementById("foodName");

const foodMemberId =
    document.getElementById("foodMemberId");

const foodBatch =
    document.getElementById("foodBatch");

const foodQrCode =
    document.getElementById("foodQrCode");

const foodTokenNumber =
    document.getElementById("foodTokenNumber");


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(text, color) {

    message.textContent = text;

    message.style.color =
        color || "#062b3f";
}


/* =====================================================
   HIDE CARD
===================================================== */

function hideCard() {

    printArea.style.display =
        "none";
}


/* =====================================================
   SHOW CARD
===================================================== */

function showCard() {

    printArea.style.display =
        "block";
}


/* =====================================================
   RESET CARD
===================================================== */

function resetCard() {

    hideCard();

    alumniName.textContent = "";

    displayMemberId.textContent = "";

    sscYear.textContent = "";

    bloodGroup.textContent = "";

    foodName.textContent = "";

    foodMemberId.textContent = "";

    foodBatch.textContent = "";

    foodTokenNumber.textContent = "";

    paymentStatus.textContent = "";

    profilePhoto.removeAttribute("src");

    qrCode.removeAttribute("src");

    foodQrCode.removeAttribute("src");
}


/* =====================================================
   LOAD ALUMNI
===================================================== */

async function loadAlumni() {


    /* -------------------------------------------------
       MEMBER ID
    ------------------------------------------------- */

    const memberId =
        memberIdInput.value.trim();


    /* -------------------------------------------------
       EMPTY CHECK
    ------------------------------------------------- */

    if (!memberId) {

        resetCard();

        showMessage(
            "Please enter Member ID.",
            "#b42318"
        );

        memberIdInput.focus();

        return;
    }


    /* -------------------------------------------------
       LOADING
    ------------------------------------------------- */

    searchBtn.disabled =
        true;

    searchBtn.textContent =
        "Loading...";

    resetCard();

    showMessage(
        "Loading Alumni information...",
        "#062b3f"
    );


    try {


        /* =================================================
           DATABASE QUERY
        ================================================= */

        const {
            data,
            error
        } =
        await supabaseClient
            .from("alumni")
            .select(
                "member_id,name,ssc_year,blood_group,photo_url,payment_status"
            )
            .eq(
                "member_id",
                memberId
            )
            .maybeSingle();


        /* =================================================
           DATABASE ERROR
        ================================================= */

        if (error) {

            console.error(
                "SUPABASE ERROR:",
                error
            );

            throw new Error(
                error.message
            );
        }


        /* =================================================
           NOT FOUND
        ================================================= */

        if (!data) {

            showMessage(
                "Alumni not found.",
                "#b42318"
            );

            return;
        }


        console.log(
            "ALUMNI DATA:",
            data
        );


        /* =================================================
           PAYMENT STATUS
        ================================================= */

        const payment =
            String(
                data.payment_status || ""
            )
            .trim()
            .toLowerCase();


        console.log(
            "PAYMENT STATUS:",
            payment
        );


        /* =================================================
           PAYMENT MUST BE PAID
        ================================================= */

        if (payment !== "paid") {

            showMessage(
                "Payment is Pending. ID Card is not available yet.",
                "#b42318"
            );

            return;
        }


        /* =================================================
           NAME
        ================================================= */

        alumniName.textContent =
            data.name || "N/A";


        /* =================================================
           MEMBER ID
        ================================================= */

        displayMemberId.textContent =
            data.member_id || "N/A";


        /* =================================================
           SSC BATCH
        ================================================= */

        sscYear.textContent =
            data.ssc_year || "N/A";


        /* =================================================
           BLOOD GROUP
        ================================================= */

        bloodGroup.textContent =
            data.blood_group || "N/A";


        /* =================================================
           PAYMENT
        ================================================= */

        paymentStatus.textContent =
            "✓ PAID";


        paymentStatus.className =
            "payment-paid";


        /* =================================================
           PROFILE PHOTO
        ================================================= */

        if (
            data.photo_url &&
            typeof data.photo_url === "string" &&
            data.photo_url.trim() !== ""
        ) {

            profilePhoto.src =
                data.photo_url.trim();

        }

        else {

            profilePhoto.src =
                "assets/alumni-logo.png";
        }


        /* -------------------------------------------------
           PHOTO ERROR
        ------------------------------------------------- */

        profilePhoto.onerror =
            function() {

                console.error(
                    "PHOTO LOAD ERROR:",
                    data.photo_url
                );

                this.onerror = null;

                this.src =
                    "assets/alumni-logo.png";
            };


        /* =================================================
           VERIFICATION URL
        ================================================= */

        const verifyURL =
            window.location.origin +
            "/verify.html?id=" +
            encodeURIComponent(
                data.member_id
            );


        /* =================================================
           MAIN QR
        ================================================= */

        qrCode.src =
            "https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=" +
            encodeURIComponent(
                verifyURL
            );


        /* =================================================
           FOOD TOKEN INFORMATION
        ================================================= */

        foodName.textContent =
            data.name || "N/A";

        foodMemberId.textContent =
            data.member_id || "N/A";

        foodBatch.textContent =
            data.ssc_year || "N/A";


        /* =================================================
           FOOD TOKEN NUMBER
        ================================================= */

        foodTokenNumber.textContent =
            "FOOD TOKEN • " +
            (data.member_id || "N/A");


        /* =================================================
           FOOD TOKEN URL
        ================================================= */

        const foodURL =
            window.location.origin +
            "/verify.html?id=" +
            encodeURIComponent(
                data.member_id
            ) +
            "&food=1";


        /* =================================================
           FOOD TOKEN QR
        ================================================= */

        foodQrCode.src =
            "https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=" +
            encodeURIComponent(
                foodURL
            );


        /* =================================================
           SHOW CARD
        ================================================= */

        showCard();


        showMessage(
            "✓ Digital ID Card loaded successfully.",
            "#18723c"
        );


    }

    catch(error) {

        console.error(
            "ID CARD ERROR:",
            error
        );

        resetCard();

        showMessage(
            "Failed to load ID Card: " +
            (
                error.message ||
                "Unknown error"
            ),
            "#b42318"
        );

    }


    finally {

        searchBtn.disabled =
            false;

        searchBtn.textContent =
            "View Digital ID Card";
    }

}


/* =====================================================
   BUTTON
===================================================== */

searchBtn.addEventListener(
    "click",
    loadAlumni
);


/* =====================================================
   ENTER KEY
===================================================== */

memberIdInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            loadAlumni();
        }

    }
);


/* =====================================================
   PAGE LOAD
===================================================== */

console.log(
    "PHS Alumni Digital ID Card JS loaded successfully."
);
