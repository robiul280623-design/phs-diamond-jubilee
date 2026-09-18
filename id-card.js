/* =========================================================
   PAHARCHANDA HIGH SCHOOL
   GRAND REUNION 2027

   PUBLIC DIGITAL ID CARD
   + FOOD TOKEN

   FINAL JAVASCRIPT
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
   DOM
========================================================= */

const memberIdInput =
    document.getElementById("memberIdInput");

const searchBtn =
    document.getElementById("searchBtn");

const messageBox =
    document.getElementById("message");

const actions =
    document.getElementById("actions");

const cardsWrapper =
    document.getElementById("cardsWrapper");

const pdfBtn =
    document.getElementById("pdfBtn");

const imageBtn =
    document.getElementById("imageBtn");

const printBtn =
    document.getElementById("printBtn");

const idCard =
    document.getElementById("idCard");

const foodCard =
    document.getElementById("foodCard");


/* =========================================================
   CURRENT MEMBER
========================================================= */

let currentMember = null;


/* =========================================================
   HELPERS
========================================================= */

function safe(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    return String(value);
}


function normalizeMemberId(value) {

    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "");
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getCategory(member) {

    const category =
        member.member_type ||
        member.category ||
        member.registration_type ||
        "";

    return String(category)
        .replace(/_/g, " ")
        .trim()
        .toUpperCase();
}


function getDisplayName(member) {

    if (
        getCategory(member) === "FAMILY" &&
        member.family_member_name
    ) {
        return member.family_member_name;
    }

    return (
        member.name ||
        member.full_name ||
        "Member"
    );
}


function getBatch(member) {

    const category = getCategory(member);

    if (category === "CURRENT STUDENT") {

        return (
            member.current_class ||
            member.class ||
            "-"
        );
    }

    if (category === "FAMILY") {

        if (member.family_student_batch) {

            return String(
                member.family_student_batch
            );
        }

        if (member.ssc_year) {

            return String(
                member.ssc_year
            );
        }

        return "-";
    }

    return (
        member.ssc_year ||
        member.batch ||
        "-"
    );
}


function getProfession(member) {

    return (
        member.profession ||
        member.occupation ||
        "-"
    );
}


function getPhone(member) {

    return (
        member.phone ||
        member.mobile ||
        member.mobile_number ||
        "-"
    );
}


function getTshirt(member) {

    const category = getCategory(member);

    if (category === "FAMILY") {

        return (
            member.tshirt_size ||
            member.family_tshirt_size ||
            "-"
        );
    }

    if (member.tshirt_size) {
        return member.tshirt_size;
    }

    if (member.husband_tshirt_size) {
        return member.husband_tshirt_size;
    }

    return "-";
}


function getPaymentStatus(member) {

    return String(
        member.payment_status ||
        member.status ||
        ""
    )
    .trim()
    .toUpperCase();
}


function isApproved(member) {

    return (
        getPaymentStatus(member) === "APPROVED" ||
        getPaymentStatus(member) === "PAID"
    );
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    text,
    type = "error"
) {

    messageBox.textContent = text;

    messageBox.className =
        "message show " + type;
}


function hideMessage() {

    messageBox.textContent = "";

    messageBox.className =
        "message";
}


/* =========================================================
   BANGLADESH DATE/TIME
========================================================= */

function getBangladeshDateTime() {

    const now = new Date();

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            timeZone: "Asia/Dhaka",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }
    ).format(now);
}


/* =========================================================
   PHOTO URL
========================================================= */

function getPhotoUrl(member) {

    if (member.photo_url) {
        return member.photo_url;
    }

    if (member.photo_path) {

        const {
            data
        } =
            supabaseClient
                .storage
                .from("alumni-photos")
                .getPublicUrl(
                    member.photo_path
                );

        return data?.publicUrl || "";
    }

    return "";
}


/* =========================================================
   VERIFY URL
========================================================= */

function getBaseUrl() {

    return (
        window.location.origin +
        window.location.pathname
            .replace(
                /[^/]*$/,
                ""
            )
    );
}


function getVerifyUrl(memberId) {

    return (
        getBaseUrl() +
        "verify.html?id=" +
        encodeURIComponent(
            memberId
        )
    );
}


function getFoodVerifyUrl(memberId) {

    return (
        getBaseUrl() +
        "verify.html?id=" +
        encodeURIComponent(
            memberId
        ) +
        "&food=1"
    );
}


/* =========================================================
   QR GENERATOR
   Uses Google Chart fallback because qrcodejs
   is not included in current HTML.
========================================================= */

function makeQRUrl(text, size = 300) {

    return (
        "https://quickchart.io/qr" +
        "?text=" +
        encodeURIComponent(text) +
        "&size=" +
        size +
        "&margin=1"
    );
}


/* =========================================================
   RESET CARD
========================================================= */

function resetCards() {

    cardsWrapper.style.display =
        "none";

    actions.style.display =
        "none";

    currentMember = null;
}


/* =========================================================
   LOAD MEMBER
========================================================= */

async function loadMember() {

    const memberId =
        normalizeMemberId(
            memberIdInput.value
        );

    if (!memberId) {

        showMessage(
            "Please enter your Member ID."
        );

        return;
    }

    hideMessage();

    searchBtn.disabled = true;

    searchBtn.textContent =
        "Searching...";

    resetCards();

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("alumni")
                .select("*")
                .eq(
                    "member_id",
                    memberId
                )
                .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {

            showMessage(
                "Member ID not found."
            );

            return;
        }

        if (!isApproved(data)) {

            showMessage(
                "Your payment has not been approved yet. ID Card and Food Token will be available after approval."
            );

            return;
        }

        currentMember = data;

        renderCards(data);

        cardsWrapper.style.display =
            "flex";

        actions.style.display =
            "flex";

        showMessage(
            "ID Card and Food Token are ready.",
            "success"
        );

    } catch (error) {

        console.error(
            "Member search error:",
            error
        );

        showMessage(
            "Unable to load member information. Please try again."
        );

    } finally {

        searchBtn.disabled = false;

        searchBtn.textContent =
            "Search";
    }
}


/* =========================================================
   RENDER BOTH CARDS
========================================================= */

function renderCards(member) {

    const memberId =
        safe(member.member_id);

    const name =
        getDisplayName(member);

    const category =
        getCategory(member);

    const batch =
        getBatch(member);

    const profession =
        getProfession(member);

    const phone =
        getPhone(member);

    const tshirt =
        getTshirt(member);

    const photoUrl =
        getPhotoUrl(member);

    const verifiedDate =
        getBangladeshDateTime();


    /* =====================================================
       ID CARD
    ===================================================== */

    document.getElementById(
        "idName"
    ).textContent = name;

    document.getElementById(
        "idMemberId"
    ).textContent = memberId;

    document.getElementById(
        "idCategory"
    ).textContent =
        category || "-";

    document.getElementById(
        "idBatch"
    ).textContent =
        batch || "-";

    document.getElementById(
        "idProfession"
    ).textContent =
        profession;

    document.getElementById(
        "idPhone"
    ).textContent =
        phone;

    document.getElementById(
        "idTshirt"
    ).textContent =
        tshirt;

    document.getElementById(
        "idPayment"
    ).textContent =
        "APPROVED";


    const idPhoto =
        document.getElementById(
            "idPhoto"
        );

    if (photoUrl) {

        idPhoto.src =
            photoUrl;

    } else {

        idPhoto.removeAttribute(
            "src"
        );

        idPhoto.alt =
            "No Photo";
    }


    document.getElementById(
        "idQR"
    ).src =
        makeQRUrl(
            getVerifyUrl(
                memberId
            ),
            320
        );


    document.getElementById(
        "idVerifiedDate"
    ).textContent =
        "Verified: " +
        verifiedDate;


    /* =====================================================
       FOOD TOKEN
    ===================================================== */

    document.getElementById(
        "foodName"
    ).textContent =
        name;

    document.getElementById(
        "foodMemberId"
    ).textContent =
        memberId;

    document.getElementById(
        "foodCategory"
    ).textContent =
        category || "-";

    document.getElementById(
        "foodBatch"
    ).textContent =
        batch || "-";


    document.getElementById(
        "foodQR"
    ).src =
        makeQRUrl(
            getFoodVerifyUrl(
                memberId
            ),
            320
        );


    document.getElementById(
        "foodVerifiedDate"
    ).textContent =
        "Verified: " +
        verifiedDate;
}


/* =========================================================
   IMAGE LOAD HELPER
========================================================= */

function waitForImage(img) {

    return new Promise(
        resolve => {

            if (
                img.complete &&
                img.naturalWidth > 0
            ) {
                resolve();
                return;
            }

            img.onload =
                () => resolve();

            img.onerror =
                () => resolve();
        }
    );
}


async function waitForCards() {

    const images =
        Array.from(
            document.querySelectorAll(
                "#idCard img, #foodCard img"
            )
        );

    await Promise.all(
        images.map(
            img =>
                waitForImage(img)
        )
    );

    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                400
            )
    );
}


/* =========================================================
   DOWNLOAD PDF
   4 × 6 INCH PORTRAIT
   ID CARD 4×3
   FOOD TOKEN 4×3
========================================================= */

async function downloadPDF() {

    if (!currentMember) {
        return;
    }

    const oldText =
        pdfBtn.textContent;

    pdfBtn.disabled = true;

    pdfBtn.textContent =
        "Preparing PDF...";

    try {

        await waitForCards();

        const {
            jsPDF
        } =
            window.jspdf;


        const pdf =
            new jsPDF({
                orientation: "portrait",
                unit: "in",
                format: [
                    4,
                    6
                ],
                compress: true
            });


        const idCanvas =
            await html2canvas(
                idCard,
                {
                    scale: 3,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor:
                        "#ffffff"
                }
            );


        const foodCanvas =
            await html2canvas(
                foodCard,
                {
                    scale: 3,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor:
                        "#ffffff"
                }
            );


        const idImage =
            idCanvas.toDataURL(
                "image/jpeg",
                0.95
            );

        const foodImage =
            foodCanvas.toDataURL(
                "image/jpeg",
                0.95
            );


        pdf.addImage(
            idImage,
            "JPEG",
            0,
            0,
            4,
            3
        );


        pdf.addImage(
            foodImage,
            "JPEG",
            0,
            3,
            4,
            3
        );


        const fileName =
            (
                currentMember.member_id ||
                "member"
            )
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
            );


        pdf.save(
            fileName +
            "_ID_Food_Token.pdf"
        );

    } catch (error) {

        console.error(
            "PDF error:",
            error
        );

        showMessage(
            "PDF could not be created."
        );

    } finally {

        pdfBtn.disabled = false;

        pdfBtn.textContent =
            oldText;
    }
}


/* =========================================================
   DOWNLOAD IMAGE
   COMBINED 4 × 6
========================================================= */

async function downloadImage() {

    if (!currentMember) {
        return;
    }

    const oldText =
        imageBtn.textContent;

    imageBtn.disabled = true;

    imageBtn.textContent =
        "Preparing Image...";

    try {

        await waitForCards();


        const combined =
            document.createElement(
                "canvas"
            );

        const scale = 3;

        const width =
            Math.round(
                4 * 96 * scale
            );

        const height =
            Math.round(
                6 * 96 * scale
            );

        combined.width =
            width;

        combined.height =
            height;


        const ctx =
            combined.getContext(
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


        const idCanvas =
            await html2canvas(
                idCard,
                {
                    scale: scale,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor:
                        "#ffffff"
                }
            );


        const foodCanvas =
            await html2canvas(
                foodCard,
                {
                    scale: scale,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor:
                        "#ffffff"
                }
            );


        const targetWidth =
            width;

        const targetHeight =
            Math.round(
                height / 2
            );


        ctx.drawImage(
            idCanvas,
            0,
            0,
            targetWidth,
            targetHeight
        );


        ctx.drawImage(
            foodCanvas,
            0,
            targetHeight,
            targetWidth,
            targetHeight
        );


        const link =
            document.createElement(
                "a"
            );


        const fileName =
            (
                currentMember.member_id ||
                "member"
            )
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
            );


        link.download =
            fileName +
            "_ID_Food_Token.jpg";


        link.href =
            combined.toDataURL(
                "image/jpeg",
                0.95
            );


        link.click();

    } catch (error) {

        console.error(
            "Image error:",
            error
        );

        showMessage(
            "Image could not be created."
        );

    } finally {

        imageBtn.disabled = false;

        imageBtn.textContent =
            oldText;
    }
}


/* =========================================================
   PRINT
========================================================= */

function printCards() {

    if (!currentMember) {
        return;
    }

    window.print();
}


/* =========================================================
   EVENTS
========================================================= */

searchBtn.addEventListener(
    "click",
    loadMember
);


memberIdInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            loadMember();
        }
    }
);


pdfBtn.addEventListener(
    "click",
    downloadPDF
);


imageBtn.addEventListener(
    "click",
    downloadImage
);


printBtn.addEventListener(
    "click",
    printCards
);


/* =========================================================
   AUTO UPPERCASE
========================================================= */

memberIdInput.addEventListener(
    "input",
    function() {

        this.value =
            this.value.toUpperCase();
    }
);


/* =========================================================
   INITIAL STATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        cardsWrapper.style.display =
            "none";

        actions.style.display =
            "none";
    }
);