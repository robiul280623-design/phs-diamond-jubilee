// =====================================================
// PAHARCHANDA HIGH SCHOOL
// DIAMOND JUBILEE 2027
// HOME PAGE JAVASCRIPT
// =====================================================


document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ===============================================
           FEATURE CARDS
        =============================================== */

        const featureCards =
            document.querySelectorAll(
                ".feature-card"
            );


        featureCards.forEach(
            function (card) {


                const page =
                    card.getAttribute(
                        "data-page"
                    );


                if (!page) {
                    return;
                }


                /*
                   Make card look clickable
                */

                card.style.cursor =
                    "pointer";


                /*
                   Open page
                */

                card.addEventListener(
                    "click",
                    function () {

                        window.location.href =
                            page;

                    }
                );


            }
        );



        /* ===============================================
           EXPLORE REUNION BUTTON
        =============================================== */

        const exploreBtn =
            document.getElementById(
                "exploreBtn"
            );


        if (exploreBtn) {


            exploreBtn.addEventListener(
                "click",
                function (event) {


                    event.preventDefault();


                    const features =
                        document.getElementById(
                            "features"
                        );


                    if (features) {


                        features.scrollIntoView({
                            behavior:
                                "smooth"
                        });


                    }


                }
            );


        }



        /* ===============================================
           REGISTER NOW BUTTON
        =============================================== */

        const registerButton =
            document.querySelector(
                ".btn-secondary"
            );


        if (registerButton) {


            registerButton.addEventListener(
                "click",
                function (event) {


                    event.preventDefault();


                    window.location.href =
                        "register.html";


                }
            );


        }


    }
);
