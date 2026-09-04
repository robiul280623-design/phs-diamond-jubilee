// @ts-nocheck


/* =====================================================
   SUPABASE CONFIG
===================================================== */

const SUPABASE_URL =
    "https://diygnjsjlhekgmkhcnzr.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";


const ADMIN_ID =
    "8ba2a77f-71b7-4a60-b45e-857a3d30cb44";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   ELEMENTS
===================================================== */

const table =
    document.getElementById(
        "attendanceTable"
    );

const message =
    document.getElementById(
        "message"
    );

const search =
    document.getElementById(
        "search"
    );

const totalRegistered =
    document.getElementById(
        "totalRegistered"
    );

const totalPresent =
    document.getElementById(
        "totalPresent"
    );

const notPresent =
    document.getElementById(
        "notPresent"
    );

const backBtn =
    document.getElementById(
        "backBtn"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


/* =====================================================
   VARIABLES
===================================================== */

let attendanceData = [];

let alumniData = [];


/* =====================================================
   CHECK ADMIN
===================================================== */

async function checkAdmin(){

    const result =
        await supabaseClient
            .auth
            .getUser();


    if(
        result.error ||
        !result.data.user
    ){

        window.location.href =
            "admin-login.html";

        return false;
    }


    if(
        result.data.user.id !==
        ADMIN_ID
    ){

        await supabaseClient
            .auth
            .signOut();


        window.location.href =
            "admin-login.html";

        return false;
    }


    return true;
}


/* =====================================================
   LOAD DATA
===================================================== */

async function loadData(){

    message.textContent =
        "Loading attendance...";


    /*
       Load Alumni
    */

    const alumniResult =
        await supabaseClient

            .from(
                "alumni"
            )

            .select(
                "*"
            );


    if(
        alumniResult.error
    ){

        console.error(
            "ALUMNI ERROR:",
            alumniResult.error
        );


        message.textContent =
            "Failed to load alumni.";


        return;
    }


    alumniData =
        alumniResult.data || [];


    /*
       Load Attendance
    */

    const attendanceResult =
        await supabaseClient

            .from(
                "attendance"
            )

            .select(
                "*"
            )

            .order(
                "check_in_time",
                {
                    ascending:false
                }
            );


    if(
        attendanceResult.error
    ){

        console.error(
            "ATTENDANCE ERROR:",
            attendanceResult.error
        );


        message.textContent =
            "Failed to load attendance.";


        return;
    }


    attendanceData =
        attendanceResult.data || [];


    updateStatistics();


    displayAttendance(
        attendanceData
    );

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics(){

    /*
       Approved Alumni
    */

    const approvedAlumni =
        alumniData.filter(
            function(person){

                return person.status ===
                    "Approved";

            }
        );


    /*
       Unique present alumni
    */

    const presentIds =
        new Set();


    attendanceData.forEach(
        function(item){

            if(
                item.status ===
                "Present"
            ){

                presentIds.add(
                    String(
                        item.alumni_id
                    )
                );

            }

        }
    );


    const total =
        approvedAlumni.length;


    const present =
        presentIds.size;


    const absent =
        Math.max(
            0,
            total - present
        );


    totalRegistered.textContent =
        total;


    totalPresent.textContent =
        present;


    notPresent.textContent =
        absent;

}


/* =====================================================
   DISPLAY ATTENDANCE
===================================================== */

function displayAttendance(
    data
){

    table.innerHTML =
        "";


    if(
        !data.length
    ){

        table.innerHTML =

            "<tr>" +

            "<td " +
            "colspan='8' " +
            "class='empty'>" +

            "No attendance record found." +

            "</td>" +

            "</tr>";


        message.textContent =
            "No attendance record found.";

        return;
    }


    message.textContent =
        "Showing " +
        data.length +
        " attendance record(s).";


    data.forEach(
        function(item){

            const person =
                alumniData.find(
                    function(alumni){

                        return String(
                            alumni.id
                        ) ===
                        String(
                            item.alumni_id
                        );

                    }
                );


            const row =
                document.createElement(
                    "tr"
                );


            const name =
                person
                ?
                person.name
                :
                "Unknown";


            const batch =
                person
                ?
                person.ssc_year
                :
                "-";


            const registration =
                person
                ?
                person.registration_no
                :
                "-";


            const phone =
                person
                ?
                person.phone
                :
                "-";


            const time =
                formatDateTime(
                    item.check_in_time
                );


            const status =
                item.status ||
                "Present";


            row.innerHTML =

                "<td>" +

                safeValue(
                    name
                ) +

                "</td>" +


                "<td>" +

                safeValue(
                    batch
                ) +

                "</td>" +


                "<td>" +

                safeValue(
                    registration
                ) +

                "</td>" +


                "<td>" +

                safeValue(
                    phone
                ) +

                "</td>" +


                "<td>" +

                safeValue(
                    item.event_name
                ) +

                "</td>" +


                "<td>" +

                safeValue(
                    time
                ) +

                "</td>" +


                "<td class='" +

                (
                    status ===
                    "Present"
                    ?
                    "present"
                    :
                    "cancelled"
                ) +

                "'>" +

                safeValue(
                    status
                ) +

                "</td>" +


                "<td>" +

                "<button " +

                "class='delete-btn' " +

                "data-id='" +

                safeValue(
                    item.id
                ) +

                "'>" +

                "Delete" +

                "</button>" +

                "</td>";


            table.appendChild(
                row
            );

        }
    );


    activateDelete();

}


/* =====================================================
   DELETE ATTENDANCE
===================================================== */

function activateDelete(){

    document
        .querySelectorAll(
            ".delete-btn"
        )
        .forEach(
            function(button){

                button.addEventListener(
                    "click",
                    async function(){

                        const id =
                            this.dataset.id;


                        const confirmDelete =
                            confirm(
                                "এই Attendance record কি Delete করতে চান?"
                            );


                        if(
                            !confirmDelete
                        ){

                            return;
                        }


                        const result =
                            await supabaseClient

                                .from(
                                    "attendance"
                                )

                                .delete()

                                .eq(
                                    "id",
                                    id
                                );


                        if(
                            result.error
                        ){

                            console.error(
                                "DELETE ERROR:",
                                result.error
                            );


                            alert(
                                "Attendance delete failed."
                            );


                            return;
                        }


                        alert(
                            "Attendance deleted successfully."
                        );


                        await loadData();

                    }
                );

            }
        );

}


/* =====================================================
   SEARCH
===================================================== */

search.addEventListener(
    "input",
    function(){

        const keyword =
            this.value
                .toLowerCase()
                .trim();


        if(
            !keyword
        ){

            displayAttendance(
                attendanceData
            );

            return;
        }


        const filtered =
            attendanceData.filter(
                function(item){

                    const person =
                        alumniData.find(
                            function(alumni){

                                return String(
                                    alumni.id
                                ) ===
                                String(
                                    item.alumni_id
                                );

                            }
                        );


                    const values = [

                        person
                        ?
                        person.name
                        :
                        "",

                        person
                        ?
                        person.ssc_year
                        :
                        "",

                        person
                        ?
                        person.registration_no
                        :
                        "",

                        person
                        ?
                        person.phone
                        :
                        "",

                        item.event_name,

                        item.status,

                        item.check_in_time

                    ];


                    return values.some(
                        function(value){

                            return String(
                                value ||
                                ""
                            )
                            .toLowerCase()
                            .includes(
                                keyword
                            );

                        }
                    );

                }
            );


        displayAttendance(
            filtered
        );

    }
);


/* =====================================================
   FORMAT DATE TIME
===================================================== */

function formatDateTime(
    value
){

    if(
        !value
    ){

        return "-";
    }


    const date =
        new Date(
            value
        );


    return date.toLocaleString(
        "en-BD",
        {

            dateStyle:
                "medium",

            timeStyle:
                "medium"

        }
    );

}


/* =====================================================
   SAFE VALUE
===================================================== */

function safeValue(
    value
){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return "-";
    }


    return String(
        value
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
   BACK
===================================================== */

backBtn.addEventListener(
    "click",
    function(){

        window.location.href =
            "admin.html";

    }
);


/* =====================================================
   LOGOUT
===================================================== */

logoutBtn.addEventListener(
    "click",
    async function(){

        await supabaseClient
            .auth
            .signOut();


        window.location.href =
            "admin-login.html";

    }
);


/* =====================================================
   START
===================================================== */

async function start(){

    const allowed =
        await checkAdmin();


    if(
        !allowed
    ){

        return;
    }


    await loadData();

}


start();