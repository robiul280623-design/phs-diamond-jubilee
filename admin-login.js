const SUPABASE_URL =
"https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
"sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";

/* =========================================
CREATE SUPABASE CLIENT
========================================= */

const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

console.log(
"Supabase client loaded successfully."
);

/* =========================================
GET FORM ELEMENTS
========================================= */

const loginForm =
document.getElementById("loginForm");

const message =
document.getElementById("message");

const loginBtn =
document.getElementById("loginBtn");

/* =========================================
CHECK FORM
========================================= */

if (!loginForm) {

console.error(
    "ERROR: loginForm not found."
);

}

if (!message) {

console.error(
    "ERROR: message element not found."
);

}

/* =========================================
LOGIN
========================================= */

loginForm.addEventListener(
"submit",
async function(event) {

    event.preventDefault();


    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const password =
        document
            .getElementById("password")
            .value;


    /* ==============================
       VALIDATION
    ============================== */

    if (!email) {

        message.textContent =
            "Please enter admin email.";

        message.style.color =
            "red";

        return;

    }


    if (!password) {

        message.textContent =
            "Please enter password.";

        message.style.color =
            "red";

        return;

    }


    /* ==============================
       BUTTON LOADING
    ============================== */

    loginBtn.disabled =
        true;

    loginBtn.textContent =
        "Logging in...";


    message.textContent =
        "Checking login...";

    message.style.color =
        "#333";


    console.log(
        "Admin login started..."
    );


    try {


        /* ==========================
           SUPABASE LOGIN
        ========================== */

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });


        console.log(
            "Login response:",
            data
        );


        console.log(
            "Login error:",
            error
        );


        /* ==========================
           LOGIN ERROR
        ========================== */

        if (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            message.textContent =
                "Login failed: " +
                error.message;


            message.style.color =
                "red";


            loginBtn.disabled =
                false;

            loginBtn.textContent =
                "Login";


            return;

        }


        /* ==========================
           CHECK SESSION
        ========================== */

        if (
            !data ||
            !data.session
        ) {

            message.textContent =
                "Login failed: No active session.";

            message.style.color =
                "red";


            loginBtn.disabled =
                false;

            loginBtn.textContent =
                "Login";


            return;

        }


        /* ==========================
           LOGIN SUCCESS
        ========================== */

        console.log(
            "Admin login successful:",
            data
        );


        message.textContent =
            "Login successful!";

        message.style.color =
            "green";


        loginBtn.textContent =
            "Success";


        /* ==========================
           REDIRECT
        ========================== */

        setTimeout(
            function() {

                window.location.href =
                    "admin.html";

            },
            800
        );


    }

    catch (error) {

        console.error(
            "LOGIN EXCEPTION:",
            error
        );


        message.textContent =
            "Login failed: " +
            error.message;


        message.style.color =
            "red";


        loginBtn.disabled =
            false;

        loginBtn.textContent =
            "Login";

    }

}

);

console.log(
"Admin login JavaScript loaded successfully."
);