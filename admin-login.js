// ============================================================
// PAHARCHANDA HIGH SCHOOL
// GRAND REUNION 2027
// ADMIN LOGIN
// ============================================================


// ============================================================
// SUPABASE
// ============================================================

const SUPABASE_URL =
    "https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";


const { createClient } = supabase;


const db = createClient(
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


// ============================================================
// ELEMENTS
// ============================================================

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


// ============================================================
// MESSAGE
// ============================================================

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


// ============================================================
// PASSWORD SHOW / HIDE
// ============================================================

if (showPassword && passwordInput) {

    showPassword.addEventListener(
        "click",
        () => {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                showPassword.textContent =
                    "🙈";

            } else {

                passwordInput.type =
                    "password";

                showPassword.textContent =
                    "👁";

            }

        }
    );

}


// ============================================================
// LOGIN
// ============================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!email) {

                showMessage(
                    "Please enter your email address."
                );

                if (emailInput) {
                    emailInput.focus();
                }

                return;
            }


            if (!password) {

                showMessage(
                    "Please enter your password."
                );

                if (passwordInput) {
                    passwordInput.focus();
                }

                return;
            }


            // ------------------------------------------------
            // BUTTON LOADING
            // ------------------------------------------------

            if (loginBtn) {

                loginBtn.disabled =
                    true;

                loginBtn.textContent =
                    "Signing in...";

            }


            if (messageBox) {

                messageBox.textContent =
                    "";

                messageBox.className =
                    "message";

            }


            try {

                // ------------------------------------------------
                // SUPABASE LOGIN
                // ------------------------------------------------

                const {
                    data,
                    error
                } =
                    await db.auth.signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


                // ------------------------------------------------
                // ERROR
                // ------------------------------------------------

                if (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Invalid email or password."
                    );


                    if (loginBtn) {

                        loginBtn.disabled =
                            false;

                        loginBtn.textContent =
                            "Sign In";

                    }

                    return;
                }


                // ------------------------------------------------
                // SESSION CHECK
                // ------------------------------------------------

                if (
                    !data ||
                    !data.session
                ) {

                    showMessage(
                        "Login failed. No active session was created."
                    );


                    if (loginBtn) {

                        loginBtn.disabled =
                            false;

                        loginBtn.textContent =
                            "Sign In";

                    }

                    return;
                }


                // ------------------------------------------------
                // SUCCESS
                // ------------------------------------------------

                showMessage(
                    "Login successful. Opening dashboard...",
                    "success"
                );


                if (loginBtn) {

                    loginBtn.textContent =
                        "Success ✓";

                }


                // ------------------------------------------------
                // GO TO ADMIN DASHBOARD
                // ------------------------------------------------

                setTimeout(
                    () => {

                        window.location.replace(
                            "admin.html"
                        );

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "Authentication error:",
                    error
                );


                showMessage(
                    "Unable to connect to the authentication server."
                );


                if (loginBtn) {

                    loginBtn.disabled =
                        false;

                    loginBtn.textContent =
                        "Sign In";

                }

            }

        }
    );

}


// ============================================================
// IMPORTANT
// ============================================================
//
// Do NOT automatically redirect existing sessions here.
//
// This ensures that opening admin-login.html always shows
// the Login page.
//
// The admin dashboard itself checks the session.
// ============================================================


// ============================================================
// OPTIONAL: IF AUTH STATE CHANGES
// ============================================================

db.auth.onAuthStateChange(
    (event, session) => {

        console.log(
            "Auth state:",
            event
        );

    }
);