/* ============================================================
PAHARCHANDA HIGH SCHOOL
GRAND REUNION 2027
ADMIN LOGIN
SMART PREMIUM UI VERSION
Supabase Authentication Preserved
============================================================ */

/* ============================================================
SUPABASE CONFIG
============================================================ */

const SUPABASE_URL =
"https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
"sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";

/* ============================================================
CHECK SUPABASE LIBRARY
============================================================ */

if (!window.supabase) {

console.error(
    "Supabase library was not loaded."
);

alert(
    "Supabase library load হয়নি। Internet connection এবং CDN check করুন।"
);

throw new Error(
    "Supabase library unavailable"
);

}

/* ============================================================
CREATE SUPABASE CLIENT
============================================================ */

const db =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY,
{
auth: {
autoRefreshToken: true,
persistSession: true,
detectSessionInUrl: true
}
}
);

/* ============================================================
ELEMENTS
============================================================ */

const loginForm =
document.getElementById("loginForm");

const emailInput =
document.getElementById("email");

const passwordInput =
document.getElementById("password");

const loginBtn =
document.getElementById("loginBtn");

const messageBox =
document.getElementById("message");

const showPassword =
document.getElementById("showPassword");

/* ============================================================
MESSAGE
============================================================ */

function showMessage(
text,
type = "error"
) {

if (!messageBox) {
    return;
}

messageBox.textContent =
    text;

messageBox.className =
    "message " + type;

}

function clearMessage() {

if (!messageBox) {
    return;
}

messageBox.textContent =
    "";

messageBox.className =
    "message";

}

/* ============================================================
BUTTON STATE
============================================================ */

function setLoginButton(
text,
disabled = false
) {

if (!loginBtn) {
    return;
}

loginBtn.textContent =
    text;

loginBtn.disabled =
    disabled;

}

/* ============================================================
PASSWORD SHOW / HIDE
============================================================ */

if (
showPassword &&
passwordInput
) {

showPassword.addEventListener(
    "click",
    function () {

        const isPassword =
            passwordInput.type === "password";


        if (isPassword) {

            passwordInput.type =
                "text";

            showPassword.textContent =
                "◉";

            showPassword.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            passwordInput.type =
                "password";

            showPassword.textContent =
                "👁";

            showPassword.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    }
);

}

/* ============================================================
CLEAR MESSAGE WHEN USER STARTS TYPING
============================================================ */

if (emailInput) {

emailInput.addEventListener(
    "input",
    function () {

        if (
            messageBox &&
            messageBox.textContent
        ) {

            clearMessage();

        }

    }
);

}

if (passwordInput) {

passwordInput.addEventListener(
    "input",
    function () {

        if (
            messageBox &&
            messageBox.textContent
        ) {

            clearMessage();

        }

    }
);

}

/* ============================================================
LOGIN FORM
============================================================ */

if (loginForm) {

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearMessage();


        /* ==================================================
           GET VALUES
        ================================================== */

        const email =
            emailInput
                ? emailInput.value.trim()
                : "";

        const password =
            passwordInput
                ? passwordInput.value
                : "";


        /* ==================================================
           VALIDATION
        ================================================== */

        if (!email) {

            showMessage(
                "Admin email দিন।"
            );

            if (emailInput) {
                emailInput.focus();
            }

            return;
        }


        if (!password) {

            showMessage(
                "Password দিন।"
            );

            if (passwordInput) {
                passwordInput.focus();
            }

            return;
        }


        /* ==================================================
           BASIC EMAIL VALIDATION
        ================================================== */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(email)
        ) {

            showMessage(
                "সঠিক Admin Email দিন।"
            );

            if (emailInput) {
                emailInput.focus();
            }

            return;
        }


        /* ==================================================
           BUTTON LOADING
        ================================================== */

        setLoginButton(
            "Signing in...",
            true
        );


        try {

            /* ================================================
               SUPABASE AUTH LOGIN
            ================================================= */

            const result =
                await db.auth.signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });


            const data =
                result.data;

            const error =
                result.error;


            /* ================================================
               AUTH ERROR
            ================================================= */

            if (error) {

                console.error(
                    "Supabase Login Error:",
                    error
                );


                let message =
                    "Login failed.";


                const errorText =
                    (
                        error.message ||
                        ""
                    ).toLowerCase();


                /* ---------------------------------------------
                   INVALID CREDENTIALS
                --------------------------------------------- */

                if (
                    errorText.includes(
                        "invalid login credentials"
                    )
                ) {

                    message =
                        "Email অথবা Password ভুল।";

                }


                /* ---------------------------------------------
                   EMAIL NOT CONFIRMED
                --------------------------------------------- */

                else if (
                    errorText.includes(
                        "email not confirmed"
                    )
                ) {

                    message =
                        "এই Admin Email এখনো Confirm করা হয়নি। Supabase Authentication থেকে Email Confirm করুন।";

                }


                /* ---------------------------------------------
                   RATE LIMIT
                --------------------------------------------- */

                else if (
                    errorText.includes(
                        "rate limit"
                    )
                ) {

                    message =
                        "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

                }


                /* ---------------------------------------------
                   NETWORK
                --------------------------------------------- */

                else if (
                    errorText.includes(
                        "network"
                    ) ||
                    errorText.includes(
                        "fetch"
                    )
                ) {

                    message =
                        "Internet connection check করুন এবং আবার চেষ্টা করুন।";

                }


                /* ---------------------------------------------
                   OTHER ERROR
                --------------------------------------------- */

                else {

                    message =
                        error.message ||
                        "Login failed. আবার চেষ্টা করুন।";

                }


                showMessage(
                    message
                );


                setLoginButton(
                    "Sign In to Dashboard",
                    false
                );


                return;
            }


            /* =================================================
               CHECK SESSION
            ================================================= */

            if (
                !data ||
                !data.session
            ) {

                console.error(
                    "No Supabase session:",
                    data
                );


                showMessage(
                    "Login হয়েছে কিন্তু active session তৈরি হয়নি। আবার চেষ্টা করুন।"
                );


                setLoginButton(
                    "Sign In to Dashboard",
                    false
                );


                return;
            }


            /* =================================================
               LOGIN SUCCESS
            ================================================= */

            console.log(
                "ADMIN LOGIN SUCCESS"
            );

            console.log(
                "Admin:",
                data.user?.email
            );


            showMessage(
                "Login successful. Dashboard খুলছে...",
                "success"
            );


            setLoginButton(
                "Success ✓",
                true
            );


            /* =================================================
               REDIRECT
            ================================================= */

            setTimeout(
                function () {

                    window.location.replace(
                        "admin.html"
                    );

                },
                500
            );

        }


        /* =====================================================
           UNEXPECTED ERROR
        ===================================================== */

        catch (error) {

            console.error(
                "Unexpected authentication error:",
                error
            );


            showMessage(
                "Authentication server-এর সাথে সংযোগ করা যাচ্ছে না। Internet connection check করুন।"
            );


            setLoginButton(
                "Sign In to Dashboard",
                false
            );

        }

    }
);

}

/* ============================================================
AUTH STATE LISTENER
============================================================ */

db.auth.onAuthStateChange(
function (
event,
session
) {

    console.log(
        "Supabase Auth:",
        event
    );


    if (
        event ===
        "SIGNED_IN"
    ) {

        console.log(
            "Authenticated user:",
            session?.user?.email
        );

    }


    if (
        event ===
        "SIGNED_OUT"
    ) {

        console.log(
            "Admin signed out."
        );

    }

}

);

/* ============================================================
DEBUG
============================================================ */

console.log(
"Admin Login initialized."
);

console.log(
"Supabase URL:",
SUPABASE_URL
);