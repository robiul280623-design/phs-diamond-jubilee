"use strict";

/* =========================================================
PAHARCHANDA HIGH SCHOOL
HOME PAGE FINAL JS
========================================================= */

/* =========================================================
BANGLADESH TIME
========================================================= */

const EVENT_DATE =
"2027-03-13T07:30:00+06:00";

const REGISTRATION_DEADLINE =
"2027-01-31T23:59:00+06:00";

/* =========================================================
SHORTCUT
========================================================= */

const el = id =>
document.getElementById(id);

/* =========================================================
NUMBER
========================================================= */

function pad(number){

return String(number).padStart(2,"0");

}

/* =========================================================
COUNTDOWN CALCULATOR
========================================================= */

function countdown(target){

const difference =
    new Date(target).getTime() -
    Date.now();


if(difference <= 0){

    return {
        expired:true,
        days:0,
        hours:0,
        minutes:0,
        seconds:0
    };

}


const total =
    Math.floor(
        difference / 1000
    );


return {

    expired:false,

    days:
        Math.floor(
            total / 86400
        ),

    hours:
        Math.floor(
            (total % 86400) / 3600
        ),

    minutes:
        Math.floor(
            (total % 3600) / 60
        ),

    seconds:
        total % 60

};

}

/* =========================================================
GRAND REUNION COUNTDOWN
========================================================= */

function updateEventCountdown(){

const days =
    el("eventDays");

const hours =
    el("eventHours");

const minutes =
    el("eventMinutes");

const seconds =
    el("eventSeconds");


if(
    !days ||
    !hours ||
    !minutes ||
    !seconds
){

    return;

}


const time =
    countdown(EVENT_DATE);


days.textContent =
    pad(time.days);

hours.textContent =
    pad(time.hours);

minutes.textContent =
    pad(time.minutes);

seconds.textContent =
    pad(time.seconds);


if(time.expired){

    const card =
        days.closest(
            ".countdown-card"
        );


    if(card){

        const title =
            card.querySelector("h3");

        if(title){

            title.textContent =
                "Grand Reunion Started";

        }

    }

}

}

/* =========================================================
REGISTRATION DEADLINE COUNTDOWN
========================================================= */

function updateRegistrationCountdown(){

const days =
    el("regDays");

const hours =
    el("regHours");

const minutes =
    el("regMinutes");

const seconds =
    el("regSeconds");


if(
    !days ||
    !hours ||
    !minutes ||
    !seconds
){

    return;

}


const time =
    countdown(
        REGISTRATION_DEADLINE
    );


days.textContent =
    pad(time.days);

hours.textContent =
    pad(time.hours);

minutes.textContent =
    pad(time.minutes);

seconds.textContent =
    pad(time.seconds);


if(time.expired){

    const card =
        days.closest(
            ".countdown-card"
        );


    if(card){

        const title =
            card.querySelector("h3");

        const date =
            card.querySelector(".date");


        if(title){

            title.textContent =
                "Registration Closed";

        }


        if(date){

            date.textContent =
                "31 January 2027 • 11:59 PM";

        }

    }

}

}

/* =========================================================
COUNTDOWN START
========================================================= */

function startCountdown(){

updateEventCountdown();

updateRegistrationCountdown();


setInterval(
    function(){

        updateEventCountdown();

        updateRegistrationCountdown();

    },
    1000
);

}

/* =========================================================
FAST CARD NAVIGATION
========================================================= */

function setupFastCards(){

/*
   Only old data-page cards need JavaScript.

   Normal <a href=""> elements are deliberately NOT
   intercepted. Native browser navigation is faster
   and more reliable.
*/

const cards =
    document.querySelectorAll(
        "[data-page]"
    );


cards.forEach(card => {

    const page =
        card.getAttribute(
            "data-page"
        );


    if(!page){
        return;
    }


    card.style.cursor =
        "pointer";


    card.addEventListener(
        "pointerdown",
        function(event){

            /*
               Only primary touch/mouse.
            */

            if(
                event.pointerType === "mouse" &&
                event.button !== 0
            ){

                return;

            }


            /*
               Do not interfere with an
               actual link or button inside.
            */

            if(
                event.target.closest("a") ||
                event.target.closest("button")
            ){

                return;

            }


            /*
               Immediate navigation.
            */

            window.location.href =
                page;

        },
        {
            passive:true
        }
    );

});

}

/* =========================================================
MAKE REAL LINKS FAST
========================================================= */

function optimizeNativeLinks(){

const links =
    document.querySelectorAll(
        ".home-page a[href]"
    );


links.forEach(link => {

    /*
       Keep native browser navigation.

       No click interception.
       No preventDefault.
       No duplicate handler.
    */

    link.style.cursor =
        "pointer";

    link.style.pointerEvents =
        "auto";

    link.style.touchAction =
        "manipulation";

});

}

/* =========================================================
CLICKABLE CSS SAFETY
========================================================= */

function installClickableCSS(){

const style =
    document.createElement(
        "style"
    );


style.textContent = `

    /* Decorative layers never block taps */

    .home-page .hero::before,
    .home-page .hero::after{
        pointer-events:none !important;
    }


    /* Navigation */

    .home-page .nav-menu,
    .home-page .nav-menu a{
        position:relative;
        z-index:100;
        pointer-events:auto !important;
    }


    /* Main clickable cards */

    .home-page .main-action,
    .home-page .service-card,
    .home-page .feature-card,
    .home-page .btn{
        position:relative;
        z-index:20;
        pointer-events:auto !important;
        cursor:pointer !important;
        touch-action:manipulation;
    }


    /*
       Child SVG/text elements must never
       create a separate hit target.
    */

    .home-page .main-action svg,
    .home-page .service-card svg,
    .home-page .feature-card svg,
    .home-page .btn svg{
        pointer-events:none;
    }


    /*
       Remove accidental overlay elements.
    */

    .home-page .click-overlay,
    .home-page .card-overlay,
    .home-page .hero-overlay{
        pointer-events:none !important;
    }

`;


document.head.appendChild(
    style
);

}

/* =========================================================
FIX OLD REGISTER BUTTON ERROR
========================================================= */

function fixOldMagazineButton(){

/*
   Previous versions incorrectly treated
   .btn-secondary as Registration.

   Current Magazine button must remain Magazine.
*/

const magazine =
    document.querySelector(
        ".btn-secondary"
    );


if(
    magazine &&
    magazine.tagName === "A"
){

    const href =
        magazine.getAttribute(
            "href"
        );


    if(href === "register.html"){

        magazine.setAttribute(
            "href",
            "magazine.html"
        );

    }

}

}

/* =========================================================
INITIALIZE
========================================================= */

function initHomePage(){

installClickableCSS();

optimizeNativeLinks();

setupFastCards();

fixOldMagazineButton();

startCountdown();

}

/* =========================================================
START
========================================================= */

if(
document.readyState ===
"loading"
){

document.addEventListener(
    "DOMContentLoaded",
    initHomePage,
    {
        once:true
    }
);

}else{

initHomePage();

}

/* =========================================================
REFRESH COUNTDOWN WHEN RETURNING TO PAGE
========================================================= */

document.addEventListener(
"visibilitychange",
function(){

    if(
        document.visibilityState ===
        "visible"
    ){

        updateEventCountdown();

        updateRegistrationCountdown();

    }

}

);