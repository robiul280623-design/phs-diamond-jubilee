/* =========================================================
   PAHARCHANDA HIGH SCHOOL
   GRAND REUNION 2027

   DIGITAL ID CARD
   + FOOD TOKEN

   FINAL VERSION
========================================================= */


/* =========================================================
   SUPABASE CONFIG
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

const searchBtn =
    document.getElementById("searchBtn");

const memberIdInput =
    document.getElementById("memberId");

const message =
    document.getElementById("message");

const printArea =
    document.getElementById("printArea");

const combinedCard =
    document.getElementById("combinedCard");


/* =========================================================
   ID CARD DOM
========================================================= */

const profilePhoto =
    document.getElementById("profilePhoto");

const alumniName =
    document.getElementById("alumniName");

const displayMemberId =
    document.getElementById("displayMemberId");

const registrationType =
    document.getElementById("registrationType");

const batchClassLabel =
    document.getElementById("batchClassLabel");

const sscYear =
    document.getElementById("sscYear");

const bloodGroup =
    document.getElementById("bloodGroup");

const paymentStatus =
    document.getElementById("paymentStatus");

const spouseBox =
    document.getElementById("spouseBox");

const spouseName =
    document.getElementById("spouseName");

const childrenBox =
    document.getElementById("childrenBox");

const childrenCount =
    document.getElementById("childrenCount");

const totalMembers =
    document.getElementById("totalMembers");

const qrCode =
    document.getElementById("qrCode");


/* =========================================================
   FOOD TOKEN DOM
========================================================= */

const foodToken =
    document.getElementById("foodToken");

const foodName =
    document.getElementById("foodName");

const foodMemberId =
    document.getElementById("foodMemberId");

const foodRegistrationType =
    document.getElementById("foodRegistrationType");

const foodBatchLabel =
    document.getElementById("foodBatchLabel");

const foodBatch =
    document.getElementById("foodBatch");

const foodSpouseBox =
    document.getElementById("foodSpouseBox");

const foodSpouseName =
    document.getElementById("foodSpouseName");

const foodChildrenBox =
    document.getElementById("foodChildrenBox");

const foodChildrenCount =
    document.getElementById("foodChildrenCount");

const foodTotalMembers =
    document.getElementById("foodTotalMembers");

const foodQrCode =
    document.getElementById("foodQrCode");

const foodTokenNumber =
    document.getElementById("foodTokenNumber");


/* =========================================================
   DEFAULT PHOTO
   NO LOGO
========================================================= */

const DEFAULT_PHOTO =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`

        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="400"
            height="500"
            viewBox="0 0 400 500">

            <rect
                width="400"
                height="500"
                fill="#eef2f5"/>

            <circle
                cx="200"
                cy="180"
                r="75"
                fill="#cbd5e1"/>

            <path
                d="
                    M75 430
                    C90 335
                    145 290
                    200 290
                    C255 290
                    310 335
                    325 430
                    Z
                "
                fill="#cbd5e1"/>

            <text
                x="200"
                y="470"
                text-anchor="middle"
                font-family="Arial"
                font-size="24"
                fill="#64748b">

                PHOTO

            </text>

        </svg>

    `);


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    text,
    color
){

    message.textContent =
        text || "";

    message.style.color =
        color || "#062b3f";
}


/* =========================================================
   NORMALIZE MEMBER TYPE
========================================================= */

function normalizeMemberType(
    value
){

    const type =
        String(value || "")
            .trim()
            .toUpperCase()
            .replace(
                /[\s-]+/g,
                "_"
            );


    if(
        type === "COUPLE"
    ){

        return "COUPLE";

    }


    if(
        type === "CURRENT_STUDENT"
    ){

        return "CURRENT_STUDENT";

    }


    if(
        type === "EX_STUDENT" ||
        type === "EXSTUDENT"
    ){

        return "EX_STUDENT";

    }


    return type;
}


/* =========================================================
   MEMBER TYPE LABEL
========================================================= */

function getMemberTypeLabel(
    type
){

    if(
        type === "EX_STUDENT"
    ){

        return "EX-Student";

    }


    if(
        type === "COUPLE"
    ){

        return "Couple";

    }


    if(
        type === "CURRENT_STUDENT"
    ){

        return "Current Student";

    }


    return "Member";
}


/* =========================================================
   RESET CARD
========================================================= */

function resetCard(){

    printArea.style.display =
        "none";


    alumniName.textContent =
        "";

    displayMemberId.textContent =
        "";

    registrationType.textContent =
        "";

    batchClassLabel.textContent =
        "SSC BATCH";

    sscYear.textContent =
        "";

    bloodGroup.textContent =
        "";

    paymentStatus.textContent =
        "";

    spouseName.textContent =
        "";

    childrenCount.textContent =
        "";

    totalMembers.textContent =
        "";


    spouseBox.classList.add(
        "hidden"
    );

    childrenBox.classList.add(
        "hidden"
    );


    foodName.textContent =
        "";

    foodMemberId.textContent =
        "";

    foodRegistrationType.textContent =
        "";

    foodBatchLabel.textContent =
        "SSC BATCH";

    foodBatch.textContent =
        "";

    foodSpouseName.textContent =
        "";

    foodChildrenCount.textContent =
        "";

    foodTotalMembers.textContent =
        "";

    foodTokenNumber.textContent =
        "";


    foodSpouseBox.classList.add(
        "hidden"
    );

    foodChildrenBox.classList.add(
        "hidden"
    );


    profilePhoto.src =
        DEFAULT_PHOTO;


    qrCode.removeAttribute(
        "src"
    );


    foodQrCode.removeAttribute(
        "src"
    );

}


/* =========================================================
   LOAD ALUMNI
========================================================= */

async function loadAlumni(){

    const memberId =
        memberIdInput.value.trim();


    if(
        !memberId
    ){

        resetCard();

        showMessage(
            "Please enter Member ID.",
            "#b42318"
        );

        return;
    }


    searchBtn.disabled =
        true;

    searchBtn.textContent =
        "Loading...";


    resetCard();


    showMessage(
        "Loading Alumni information...",
        "#062b3f"
    );


    try{

        const {
            data,
            error
        } =

        await supabaseClient

            .from("alumni")

            .select(`
                member_id,
                name,
                ssc_year,
                blood_group,
                photo_url,
                payment_status,
                member_type,
                registration_type,
                current_class,
                wife_name,
                children_count,
                total_members
            `)

            .eq(
                "member_id",
                memberId
            )

            .maybeSingle();


        if(error){

            console.error(
                "SUPABASE ERROR:",
                error
            );

            throw error;
        }


        if(!data){

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
           PAYMENT CHECK
        ================================================= */

        const payment =
            String(
                data.payment_status || ""
            )
            .trim()
            .toLowerCase();


        if(
            payment !== "approved"
        ){

            showMessage(
                "Payment is Pending. ID Card is not available yet.",
                "#b42318"
            );

            return;
        }


        /* =================================================
           MEMBER TYPE
        ================================================= */

        const type =
            normalizeMemberType(
                data.member_type ||
                data.registration_type
            );


        const typeLabel =
            getMemberTypeLabel(
                type
            );


        /* =================================================
           BASIC INFORMATION
        ================================================= */

        alumniName.textContent =
            data.name ||
            "N/A";


        displayMemberId.textContent =
            data.member_id ||
            memberId;


        registrationType.textContent =
            typeLabel;


        bloodGroup.textContent =
            data.blood_group ||
            "N/A";


        paymentStatus.textContent =
            "✓ PAID";


        paymentStatus.className =
            "payment-paid";


        /* =================================================
           TYPE SPECIFIC
        ================================================= */

        let batchLabel =
            "SSC BATCH";

        let batchValue =
            "N/A";

        let memberTotal =
            1;


        /* =================================================
           EX-STUDENT
        ================================================= */

        if(
            type === "EX_STUDENT"
        ){

            batchLabel =
                "SSC BATCH";


            batchValue =
                data.ssc_year ||
                "N/A";


            memberTotal =
                1;

        }


        /* =================================================
           CURRENT STUDENT
        ================================================= */

        else if(
            type === "CURRENT_STUDENT"
        ){

            batchLabel =
                "CURRENT CLASS";


            batchValue =
                data.current_class ||
                "N/A";


            memberTotal =
                1;

        }


        /* =================================================
           COUPLE
        ================================================= */

        else if(
            type === "COUPLE"
        ){

            batchLabel =
                "SSC BATCH";


            batchValue =
                data.ssc_year ||
                "N/A";


            const wife =
                String(
                    data.wife_name || ""
                ).trim();


            const childCount =
                parseInt(
                    data.children_count,
                    10
                ) || 0;


            const dbTotal =
                parseInt(
                    data.total_members,
                    10
                );


            memberTotal =
                dbTotal > 0
                    ? dbTotal
                    : 2 + childCount;


            /* SPOUSE */

            spouseName.textContent =
                wife ||
                "N/A";


            spouseBox.classList.remove(
                "hidden"
            );


            /* CHILDREN */

            childrenCount.textContent =
                childCount +
                (
                    childCount === 1
                        ? " Child"
                        : " Children"
                );


            childrenBox.classList.remove(
                "hidden"
            );

        }


        /* =================================================
           APPLY BATCH / CLASS
        ================================================= */

        batchClassLabel.textContent =
            batchLabel;


        sscYear.textContent =
            batchValue;


        totalMembers.textContent =
            memberTotal;


        /* =================================================
           FOOD TOKEN
        ================================================= */

        foodName.textContent =
            data.name ||
            "N/A";


        foodMemberId.textContent =
            data.member_id ||
            memberId;


        foodRegistrationType.textContent =
            typeLabel;


        foodBatchLabel.textContent =
            batchLabel;


        foodBatch.textContent =
            batchValue;


        foodTotalMembers.textContent =
            memberTotal;


        if(
            type === "COUPLE"
        ){

            const wife =
                String(
                    data.wife_name || ""
                ).trim();


            const childCount =
                parseInt(
                    data.children_count,
                    10
                ) || 0;


            foodSpouseName.textContent =
                wife ||
                "N/A";


            foodSpouseBox.classList.remove(
                "hidden"
            );


            foodChildrenCount.textContent =
                childCount +
                (
                    childCount === 1
                        ? " Child"
                        : " Children"
                );


            foodChildrenBox.classList.remove(
                "hidden"
            );

        }


        /* =================================================
           PHOTO
        ================================================= */

        if(
            data.photo_url &&
            String(
                data.photo_url
            ).trim()
        ){

            profilePhoto.src =
                String(
                    data.photo_url
                ).trim();

        }

        else{

            profilePhoto.src =
                DEFAULT_PHOTO;

        }


        profilePhoto.onerror =
            function(){

                this.onerror =
                    null;

                this.src =
                    DEFAULT_PHOTO;

            };


        /* =================================================
           VERIFICATION QR
        ================================================= */

        const verifyURL =
            window.location.origin +
            "/verify.html?id=" +
            encodeURIComponent(
                data.member_id ||
                memberId
            );


        qrCode.src =
            "https://api.qrserver.com/v1/create-qr-code/" +
            "?size=250x250" +
            "&margin=10" +
            "&data=" +
            encodeURIComponent(
                verifyURL
            );


        /* =================================================
           FOOD QR
        ================================================= */

        const foodURL =
            window.location.origin +
            "/verify.html?id=" +
            encodeURIComponent(
                data.member_id ||
                memberId
            ) +
            "&food=1";


        foodQrCode.src =
            "https://api.qrserver.com/v1/create-qr-code/" +
            "?size=250x250" +
            "&margin=10" +
            "&data=" +
            encodeURIComponent(
                foodURL
            );


        /* =================================================
           FOOD TOKEN NUMBER
        ================================================= */

        foodTokenNumber.textContent =
            "FOOD TOKEN • " +
            (
                data.member_id ||
                memberId
            );


        /* =================================================
           SHOW
        ================================================= */

        showCard();


        showMessage(
            "✓ Digital ID Card loaded successfully.",
            "#18723c"
        );

    }


    catch(error){

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


    finally{

        searchBtn.disabled =
            false;

        searchBtn.textContent =
            "View Digital ID Card";

    }

}


/* =========================================================
   SHOW CARD
========================================================= */

function showCard(){

    printArea.style.display =
        "block";

}


/* =========================================================
   PRINT
========================================================= */

function printBadge(){

    if(
        printArea.style.display ===
        "none"
    ){

        alert(
            "Please search a Member ID first."
        );

        return;
    }


    window.print();

}


/* =========================================================
   DOWNLOAD COMBINED ID + FOOD TOKEN
========================================================= */

async function downloadCombinedCard(){

    if(
        printArea.style.display ===
        "none"
    ){

        alert(
            "Please search a Member ID first."
        );

        return;
    }


    try{

        showMessage(
            "Preparing ID Card + Food Token...",
            "#062b3f"
        );


        const canvas =
            await html2canvas(
                combinedCard,
                {
                    scale:3,
                    useCORS:true,
                    allowTaint:false,
                    backgroundColor:"#ffffff",
                    logging:false
                }
            );


        const link =
            document.createElement(
                "a"
            );


        const id =
            displayMemberId.textContent
                .trim()
                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    "_"
                );


        link.download =
            "PHS-ID-Card-Food-Token-" +
            (
                id ||
                "Member"
            ) +
            ".png";


        link.href =
            canvas.toDataURL(
                "image/png"
            );


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        showMessage(
            "✓ ID Card + Food Token downloaded successfully.",
            "#18723c"
        );

    }


    catch(error){

        console.error(
            "COMBINED DOWNLOAD ERROR:",
            error
        );


        showMessage(
            "Download failed.",
            "#b42318"
        );

    }

}


/* =========================================================
   DOWNLOAD FOOD TOKEN ONLY
========================================================= */

async function downloadFoodToken(){

    if(
        printArea.style.display ===
        "none"
    ){

        alert(
            "Please search a Member ID first."
        );

        return;
    }


    try{

        showMessage(
            "Preparing Food Token...",
            "#062b3f"
        );


        const canvas =
            await html2canvas(
                foodToken,
                {
                    scale:4,
                    useCORS:true,
                    allowTaint:false,
                    backgroundColor:"#ffffff",
                    logging:false
                }
            );


        const link =
            document.createElement(
                "a"
            );


        const id =
            foodMemberId.textContent
                .trim()
                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    "_"
                );


        link.download =
            "PHS-Food-Token-" +
            (
                id ||
                "Member"
            ) +
            ".png";


        link.href =
            canvas.toDataURL(
                "image/png"
            );


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        showMessage(
            "✓ Food Token downloaded successfully.",
            "#18723c"
        );

    }


    catch(error){

        console.error(
            "FOOD TOKEN DOWNLOAD ERROR:",
            error
        );


        showMessage(
            "Food Token download failed.",
            "#b42318"
        );

    }

}


/* =========================================================
   EVENTS
========================================================= */

searchBtn.addEventListener(
    "click",
    loadAlumni
);


memberIdInput.addEventListener(
    "keydown",
    function(event){

        if(
            event.key === "Enter"
        ){

            event.preventDefault();

            loadAlumni();

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

resetCard();


console.log(
    "PHS Grand Reunion 2027 - Final ID Card JS Loaded."
);