 // @ts-nocheck

/* =====================================================
   PAHARCHANDA HIGH SCHOOL
   ALUMNI QR VERIFICATION & ATTENDANCE
===================================================== */


/* =====================================================
   SUPABASE CONFIG
===================================================== */

const SUPABASE_URL =
    "https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   EVENT
===================================================== */

const EVENT_NAME =
    "Grand Reunion 2027";


/* =====================================================
   ELEMENTS
===================================================== */

const reader =
    document.getElementById("reader");

const statusBox =
    document.getElementById("status");

const resultBox =
    document.getElementById("result");

const qrFile =
    document.getElementById("qrFile");

const checkinBtn =
    document.getElementById("checkinBtn");

const resetBtn =
    document.getElementById("resetBtn");

const photo =
    document.getElementById("photo");

const noPhoto =
    document.getElementById("noPhoto");

const nameEl =
    document.getElementById("name");

const memberIdEl =
    document.getElementById("memberId");

const sscYearEl =
    document.getElementById("sscYear");

const registrationNoEl =
    document.getElementById("registrationNo");

const professionEl =
    document.getElementById("profession");

const bloodGroupEl =
    document.getElementById("bloodGroup");

const phoneEl =
    document.getElementById("phone");

const alumniStatusEl =
    document.getElementById("alumniStatus");

const paymentStatusEl =
    document.getElementById("paymentStatus");


/* =====================================================
   VARIABLES
===================================================== */

let scanner = null;

let scannerRunning = false;

let selectedAlumni = null;

let processingQR = false;


/* =====================================================
   SAFE VALUE
===================================================== */

function safeValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    return String(value);
}


/* =====================================================
   STATUS
===================================================== */

function setStatus(text, type = "") {

    if (!statusBox) {
        return;
    }

    statusBox.textContent = text;

    statusBox.className = "";

    statusBox.id = "status";

    if (type) {

        statusBox.classList.add(
            "status-" + type
        );

    }
}


/* =====================================================
   EXTRACT MEMBER ID FROM QR
===================================================== */

function extractMemberId(qrText) {

    if (!qrText) {
        return null;
    }

    let value =
        String(qrText).trim();

    console.log(
        "QR RAW DATA:",
        value
    );


    /*
       -----------------------------------------
       CASE 1
       QR contains URL

       Example:
       https://site.com/qr-check.html?id=PHS2A-DJ-2018-006
       -----------------------------------------
    */

    try {

        const url =
            new URL(value);

        const id =
            url.searchParams.get("id");

        const memberId =
            url.searchParams.get("member_id") ||
            url.searchParams.get("memberId");

        if (memberId) {

            console.log(
                "QR MEMBER ID:",
                memberId
            );

            return memberId.trim();
        }

        /*
           If id is numeric database ID,
           return it separately.
        */

        if (id) {

            console.log(
                "QR ID:",
                id
            );

            return id.trim();
        }

    } catch (error) {

        /*
           QR data is not a URL.
        */

    }


    /*
       -----------------------------------------
       CASE 2
       QR contains JSON

       Example:
       {"member_id":"PHS2A-DJ-2018-006"}
       -----------------------------------------
    */

    try {

        const json =
            JSON.parse(value);

        if (json.member_id) {

            return String(
                json.member_id
            ).trim();

        }

        if (json.memberId) {

            return String(
                json.memberId
            ).trim();

        }

        if (json.id) {

            return String(
                json.id
            ).trim();

        }

    } catch (error) {

        /*
           Not JSON.
        */

    }


    /*
       -----------------------------------------
       CASE 3
       QR contains text

       Example:
       Member ID: PHS2A-DJ-2018-006
       -----------------------------------------
    */

    const memberMatch =
        value.match(
            /PHS[A-Z0-9-]+/i
        );

    if (memberMatch) {

        console.log(
            "EXTRACTED MEMBER ID:",
            memberMatch[0]
        );

        return memberMatch[0].trim();
    }


    /*
       -----------------------------------------
       CASE 4
       QR directly contains Member ID
       -----------------------------------------
    */

    return value;
}


/* =====================================================
   FIND BY DATABASE ID
===================================================== */

async function findById(id) {

    const value =
        String(id).trim();

    if (!/^\d+$/.test(value)) {

        return {
            data: null,
            error: null
        };

    }


    return await supabaseClient

        .from("alumni")

        .select("*")

        .eq(
            "id",
            value
        )

        .maybeSingle();
}


/* =====================================================
   FIND BY MEMBER ID
===================================================== */

async function findByMemberId(
    memberId
) {

    const value =
        String(memberId).trim();

    if (!value) {

        return {
            data: null,
            error: null
        };

    }


    console.log(
        "SEARCHING MEMBER ID:",
        value
    );


    return await supabaseClient

        .from("alumni")

        .select("*")

        .eq(
            "member_id",
            value
        )

        .maybeSingle();
}


/* =====================================================
   FIND ALUMNI
===================================================== */

async function findAlumni(
    qrData
) {

    setStatus(
        "🔎 Alumni information যাচাই করা হচ্ছে...",
        "warning"
    );


    const rawValue =
        String(qrData || "").trim();


    if (!rawValue) {

        return null;

    }


    /*
       Extract ID
    */

    const extracted =
        extractMemberId(
            rawValue
        );


    if (!extracted) {

        return null;

    }


    console.log(
        "FINAL QR VALUE:",
        extracted
    );


    /*
       -----------------------------------------
       If extracted value is numeric,
       first try database ID.
       -----------------------------------------
    */

    if (
        /^\d+$/.test(extracted)
    ) {

        const idResponse =
            await findById(
                extracted
            );


        if (idResponse.error) {

            console.error(
                "DATABASE ID ERROR:",
                idResponse.error
            );

        }


        if (idResponse.data) {

            return idResponse.data;

        }

    }


    /*
       -----------------------------------------
       Main search:
       Member ID
       -----------------------------------------
    */

    const memberResponse =
        await findByMemberId(
            extracted
        );


    if (memberResponse.error) {

        console.error(
            "MEMBER ID SEARCH ERROR:",
            memberResponse.error
        );


        setStatus(
            "❌ Supabase Error: " +
            memberResponse.error.message,
            "error"
        );


        return null;
    }


    if (memberResponse.data) {

        return memberResponse.data;

    }


    /*
       -----------------------------------------
       Last attempt:
       Search original QR value as Member ID
       -----------------------------------------
    */

    if (
        rawValue !== extracted
    ) {

        const secondResponse =
            await findByMemberId(
                rawValue
            );


        if (
            secondResponse.data
        ) {

            return secondResponse.data;

        }

    }


    return null;
}


/* =====================================================
   PHOTO URL
===================================================== */

function getPhotoUrl(person) {

    let photoPath =

        person.photo_url ||

        person.photo_path ||

        person.photo ||

        person.image_url ||

        person.image ||

        person.profile_photo ||

        person.photoURL ||

        person.imageURL ||

        "";


    if (
        !photoPath ||
        photoPath === "null" ||
        photoPath === "undefined"
    ) {

        return "";

    }


    photoPath =
        String(photoPath).trim();


    /*
       Already URL
    */

    if (
        photoPath.startsWith("http://") ||
        photoPath.startsWith("https://")
    ) {

        return photoPath;

    }


    /*
       Supabase Storage
    */

    const bucket =
        "alumni-photos";


    if (
        photoPath.startsWith(
            bucket + "/"
        )
    ) {

        photoPath =
            photoPath.substring(
                bucket.length + 1
            );

    }


    const result =
        supabaseClient
            .storage
            .from(bucket)
            .getPublicUrl(
                photoPath
            );


    if (
        result &&
        result.data &&
        result.data.publicUrl
    ) {

        return result.data.publicUrl;

    }


    return "";
}


/* =====================================================
   SHOW PHOTO
===================================================== */

function showPhoto(person) {

    if (!photo || !noPhoto) {
        return;
    }


    const url =
        getPhotoUrl(person);


    photo.style.display =
        "none";

    noPhoto.style.display =
        "none";

    photo.removeAttribute("src");


    if (!url) {

        noPhoto.style.display =
            "flex";

        return;

    }


    photo.onload =
        function () {

            photo.style.display =
                "block";

            noPhoto.style.display =
                "none";

        };


    photo.onerror =
        function () {

            console.warn(
                "PHOTO LOAD FAILED:",
                url
            );

            photo.style.display =
                "none";

            noPhoto.style.display =
                "flex";

        };


    photo.src =
        url;
}


/* =====================================================
   CHECK ALREADY CHECKED IN
===================================================== */

async function checkAlreadyCheckedIn(
    alumniId
) {

    const response =
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


    if (response.error) {

        console.error(
            "ATTENDANCE CHECK ERROR:",
            response.error
        );

        return false;

    }


    return !!(
        response.data &&
        response.data.length > 0
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


    /*
       NAME
    */

    nameEl.textContent =
        safeValue(
            person.name
        );


    /*
       MEMBER ID
    */

    memberIdEl.textContent =
        safeValue(
            person.member_id
        );


    /*
       SSC YEAR
    */

    sscYearEl.textContent =
        safeValue(
            person.ssc_year
        );


    /*
       REGISTRATION NO
    */

    registrationNoEl.textContent =
        safeValue(
            person.registration_no
        );


    /*
       PROFESSION
    */

    professionEl.textContent =
        safeValue(
            person.profession
        );


    /*
       BLOOD GROUP
    */

    bloodGroupEl.textContent =
        safeValue(
            person.blood_group
        );


    /*
       PHONE
    */

    phoneEl.textContent =
        safeValue(
            person.phone
        );


    /*
       STATUS
    */

    alumniStatusEl.textContent =
        safeValue(
            person.status
        );


    /*
       PAYMENT
    */

    paymentStatusEl.textContent =
        safeValue(
            person.payment_status
        );


    /*
       PHOTO
    */

    showPhoto(
        person
    );


    /*
       SHOW RESULT
    */

    resultBox.style.display =
        "block";


    /*
       APPROVED CHECK
    */

    if (
        String(
            person.status || ""
        ).toLowerCase() !==
        "approved"
    ) {

        checkinBtn.disabled =
            true;

        setStatus(
            "⚠️ Alumni status: " +
            safeValue(person.status) +
            ". Check-in করা যাবে না।",
            "warning"
        );

        return;
    }


    /*
       PAYMENT CHECK
    */

    if (
        String(
            person.payment_status || ""
        ).toLowerCase() !==
        "paid"
    ) {

        checkinBtn.disabled =
            true;

        setStatus(
            "⚠️ Payment status Paid নয়। Check-in করা যাবে না।",
            "warning"
        );

        return;
    }


    /*
       ALREADY CHECKED IN
    */

    const alreadyPresent =
        await checkAlreadyCheckedIn(
            person.id
        );


    if (alreadyPresent) {

        checkinBtn.disabled =
            true;

        checkinBtn.textContent =
            "✅ Already Checked In";

        setStatus(
            "⚠️ এই Alumni ইতোমধ্যে Check-in করেছেন।",
            "warning"
        );

        return;
    }


    /*
       READY
    */

    checkinBtn.disabled =
        false;

    checkinBtn.textContent =
        "✅ Check-in";


    setStatus(
        "✅ Alumni verified. Check-in করতে নিচের button চাপুন।",
        "success"
    );
}


/* =====================================================
   PROCESS QR
===================================================== */

async function processQR(
    decodedText
) {

    if (processingQR) {
        return;
    }


    processingQR =
        true;


    try {

        console.log(
            "PROCESSING QR:",
            decodedText
        );


        await stopScanner();


        const person =
            await findAlumni(
                decodedText
            );


        if (!person) {

            selectedAlumni =
                null;

            resultBox.style.display =
                "none";


            setStatus(
                "❌ এই QR Code-এর Alumni তথ্য পাওয়া যায়নি।",
                "error"
            );


            return;
        }


        await showAlumni(
            person
        );


    } catch (error) {

        console.error(
            "PROCESS QR ERROR:",
            error
        );


        setStatus(
            "❌ QR যাচাই করতে সমস্যা হয়েছে: " +
            error.message,
            "error"
        );

    } finally {

        processingQR =
            false;

    }
}


/* =====================================================
   START CAMERA
===================================================== */

async function startScanner() {

    if (scannerRunning) {
        return;
    }


    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        setStatus(
            "❌ QR Scanner library load হয়নি। Internet connection check করুন।",
            "error"
        );

        return;
    }


    if (!reader) {

        console.error(
            "#reader not found"
        );

        return;
    }


    /*
       Cleanup old scanner
    */

    try {

        if (scanner) {

            try {
                await scanner.stop();
            } catch (e) {}

            try {
                scanner.clear();
            } catch (e) {}

        }

    } catch (e) {}


    scanner =
        new Html5Qrcode(
            "reader"
        );


    setStatus(
        "📷 Camera permission নেওয়া হচ্ছে...",
        "warning"
    );


    try {

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

                aspectRatio: 1.0,

                disableFlip: false
            },

            async function(decodedText) {

                await processQR(
                    decodedText
                );

            },

            function(errorMessage) {

                /*
                   Continuous scanner
                   errors ignored
                */

            }

        );


        scannerRunning =
            true;


        setStatus(
            "📷 Camera চালু হয়েছে। Alumni QR Code স্ক্যান করুন।"
        );


        console.log(
            "CAMERA STARTED"
        );


    } catch (error) {

        console.error(
            "CAMERA ERROR:",
            error
        );


        scannerRunning =
            false;


        setStatus(
            "❌ Camera চালু হয়নি। Browser Camera Permission Allow করুন অথবা Gallery থেকে QR নির্বাচন করুন।",
            "error"
        );
    }
}


/* =====================================================
   STOP CAMERA
===================================================== */

async function stopScanner() {

    if (!scanner) {

        scannerRunning =
            false;

        return;
    }


    try {

        if (scannerRunning) {

            await scanner.stop();

        }

    } catch (error) {

        console.warn(
            "SCANNER STOP:",
            error
        );

    }


    try {

        scanner.clear();

    } catch (error) {

        console.warn(
            "SCANNER CLEAR:",
            error
        );

    }


    scannerRunning =
        false;
}


/* =====================================================
   GALLERY QR
===================================================== */

if (qrFile) {

    qrFile.addEventListener(
        "change",
        async function () {

            const file =
                this.files &&
                this.files[0];


            if (!file) {
                return;
            }


            await stopScanner();


            setStatus(
                "🖼️ Gallery image থেকে QR Code পড়া হচ্ছে...",
                "warning"
            );


            try {

                const galleryScanner =
                    new Html5Qrcode(
                        "reader"
                    );


                const decodedText =
                    await galleryScanner.scanFile(
                        file,
                        true
                    );


                try {

                    galleryScanner.clear();

                } catch (e) {}


                console.log(
                    "GALLERY QR:",
                    decodedText
                );


                await processQR(
                    decodedText
                );


            } catch (error) {

                console.error(
                    "GALLERY QR ERROR:",
                    error
                );


                setStatus(
                    "❌ এই ছবিতে valid QR Code পাওয়া যায়নি।",
                    "error"
                );

            }


            qrFile.value =
                "";

        }
    );

}


/* =====================================================
   CHECK-IN
===================================================== */

if (checkinBtn) {

    checkinBtn.addEventListener(
        "click",
        async function () {

            if (!selectedAlumni) {

                setStatus(
                    "❌ আগে Alumni QR Scan করুন।",
                    "error"
                );

                return;
            }


            checkinBtn.disabled =
                true;

            checkinBtn.textContent =
                "⏳ Checking in...";


            setStatus(
                "⏳ Attendance সংরক্ষণ করা হচ্ছে...",
                "warning"
            );


            try {

                /*
                   Final duplicate check
                */

                const duplicate =
                    await checkAlreadyCheckedIn(
                        selectedAlumni.id
                    );


                if (duplicate) {

                    checkinBtn.textContent =
                        "✅ Already Checked In";


                    setStatus(
                        "⚠️ এই Alumni ইতোমধ্যে Check-in করেছেন।",
                        "warning"
                    );


                    return;
                }


                /*
                   INSERT ATTENDANCE
                */

                const response =
                    await supabaseClient

                        .from("attendance")

                        .insert({

                            alumni_id:
                                selectedAlumni.id,

                            event_name:
                                EVENT_NAME,

                            check_in_time:
                                new Date()
                                    .toISOString(),

                            status:
                                "Present"

                        });


                if (response.error) {

                    console.error(
                        "CHECK-IN ERROR:",
                        response.error
                    );


                    if (
                        response.error.code ===
                        "23505"
                    ) {

                        checkinBtn.textContent =
                            "✅ Already Checked In";


                        setStatus(
                            "⚠️ এই Alumni ইতোমধ্যে Check-in করেছেন।",
                            "warning"
                        );


                        return;
                    }


                    setStatus(
                        "❌ Check-in ব্যর্থ: " +
                        response.error.message,
                        "error"
                    );


                    checkinBtn.disabled =
                        false;

                    checkinBtn.textContent =
                        "✅ Check-in";


                    return;
                }


                /*
                   SUCCESS
                */

                checkinBtn.textContent =
                    "✅ Checked In";

                checkinBtn.disabled =
                    true;


                setStatus(
                    "🎉 Check-in সফল হয়েছে!",
                    "success"
                );


            } catch (error) {

                console.error(
                    "CHECK-IN ERROR:",
                    error
                );


                setStatus(
                    "❌ Check-in ব্যর্থ: " +
                    error.message,
                    "error"
                );


                checkinBtn.disabled =
                    false;

                checkinBtn.textContent =
                    "✅ Check-in";
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
        async function () {

            selectedAlumni =
                null;


            resultBox.style.display =
                "none";


            checkinBtn.disabled =
                true;


            checkinBtn.textContent =
                "✅ Check-in";


            setStatus(
                "🔄 নতুন QR Scan করার জন্য প্রস্তুত...",
                "warning"
            );


            await stopScanner();


            setTimeout(
                function () {

                    startScanner();

                },
                300
            );

        }
    );

}


/* =====================================================
   INITIALIZE
===================================================== */

async function initializeQRPage() {

    console.log(
        "QR CHECK PAGE INITIALIZING..."
    );


    /*
       Wait DOM
    */

    if (
        document.readyState ===
        "loading"
    ) {

        await new Promise(
            function (resolve) {

                document.addEventListener(
                    "DOMContentLoaded",
                    resolve,
                    {
                        once: true
                    }
                );

            }
        );

    }


    /*
       Start camera
    */

    setTimeout(
        function () {

            startScanner();

        },
        500
    );

}


/* =====================================================
   PAGE LOAD
===================================================== */

initializeQRPage();


/* =====================================================
   PAGE CLOSE
===================================================== */

window.addEventListener(
    "beforeunload",
    function () {

        stopScanner();

    }
);