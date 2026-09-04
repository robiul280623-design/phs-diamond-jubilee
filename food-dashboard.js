// =====================================================
// PHS ALUMNI
// FOOD TOKEN DASHBOARD
// =====================================================


// =====================================================
// SUPABASE
// =====================================================

const SUPABASE_URL =
    "https://diygnjsjlhekgmkhcnzr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5qBgqDKVMl_0DegM2W2MrA_BfSWDVxf";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =====================================================
// ELEMENTS
// =====================================================

const totalEligible =
    document.getElementById(
        "totalEligible"
    );

const totalTokens =
    document.getElementById(
        "totalTokens"
    );

const usedTokens =
    document.getElementById(
        "usedTokens"
    );

const unusedTokens =
    document.getElementById(
        "unusedTokens"
    );

const progressBar =
    document.getElementById(
        "progressBar"
    );

const progressText =
    document.getElementById(
        "progressText"
    );

const usedBody =
    document.getElementById(
        "usedBody"
    );

const unusedBody =
    document.getElementById(
        "unusedBody"
    );

const usedTable =
    document.getElementById(
        "usedTable"
    );

const unusedTable =
    document.getElementById(
        "unusedTable"
    );

const usedLoading =
    document.getElementById(
        "usedLoading"
    );

const unusedLoading =
    document.getElementById(
        "unusedLoading"
    );

const usedEmpty =
    document.getElementById(
        "usedEmpty"
    );

const unusedEmpty =
    document.getElementById(
        "unusedEmpty"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );


// =====================================================
// DATA
// =====================================================

let paidAlumni = [];

let foodTokens = [];


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    console.log(
        "Loading Food Dashboard..."
    );


    /*
       Loading state
    */

    usedLoading.style.display =
        "block";

    unusedLoading.style.display =
        "block";


    try {


        // =================================================
        // GET PAID ALUMNI
        // =================================================

        const alumniResponse =
            await supabaseClient

                .from("alumni")

                .select(
                    "id,member_id,name,ssc_year,payment_status"
                );


        if (alumniResponse.error) {

            throw alumniResponse.error;

        }


        paidAlumni =
            (alumniResponse.data || [])
                .filter(
                    person =>
                        String(
                            person.payment_status ||
                            ""
                        )
                        .trim()
                        .toLowerCase()
                        === "paid"
                );


        // =================================================
        // GET FOOD TOKENS
        // =================================================

        const tokenResponse =
            await supabaseClient

                .from("food_tokens")

                .select(
                    "id,member_id,token_status,used_at,used_by"
                );


        if (tokenResponse.error) {

            throw tokenResponse.error;

        }


        foodTokens =
            tokenResponse.data || [];


        // =================================================
        // STATISTICS
        // =================================================

        calculateStatistics();


        // =================================================
        // DISPLAY TABLES
        // =================================================

        renderTables();


        console.log(
            "Food Dashboard Loaded."
        );


    }

    catch(error) {

        console.error(
            "DASHBOARD ERROR:",
            error
        );


        alert(
            "❌ Dashboard Load Failed:\n" +
            error.message
        );

    }

}


// =====================================================
// STATISTICS
// =====================================================

function calculateStatistics() {


    /*
       Paid Alumni
    */

    const eligible =
        paidAlumni.length;


    /*
       Used tokens
    */

    const used =
        foodTokens.filter(
            token =>
                String(
                    token.token_status || ""
                )
                .trim()
                .toLowerCase()
                === "used"
        ).length;


    /*
       Total token records
    */

    const total =
        foodTokens.length;


    /*
       Unused

       Important:
       We calculate based on
       eligible paid alumni.
    */

    const unused =
        Math.max(
            eligible - used,
            0
        );


    /*
       Display
    */

    totalEligible.textContent =
        eligible;

    totalTokens.textContent =
        total;

    usedTokens.textContent =
        used;

    unusedTokens.textContent =
        unused;


    /*
       Percentage
    */

    let percentage =
        0;


    if (eligible > 0) {

        percentage =
            (
                used /
                eligible
            ) * 100;

    }


    progressBar.style.width =
        Math.min(
            percentage,
            100
        ) + "%";


    progressText.textContent =
        used +
        " / " +
        eligible +
        " collected (" +
        percentage.toFixed(1) +
        "%)";

}


// =====================================================
// GET TOKEN
// =====================================================

function getTokenForMember(
    memberId
) {

    return foodTokens.find(
        token =>
            String(
                token.member_id
            ).trim()
            ===
            String(
                memberId
            ).trim()
    );

}


// =====================================================
// RENDER TABLES
// =====================================================

function renderTables() {

    renderUsedTable();

    renderUnusedTable();

}


// =====================================================
// SEARCH
// =====================================================

function getSearchValue() {

    return String(
        searchInput.value || ""
    )
    .trim()
    .toLowerCase();

}


// =====================================================
// USED TABLE
// =====================================================

function renderUsedTable() {

    usedBody.innerHTML = "";


    const search =
        getSearchValue();


    const usedList =
        foodTokens
            .filter(
                token =>
                    String(
                        token.token_status || ""
                    )
                    .trim()
                    .toLowerCase()
                    === "used"
            )
            .map(
                token => {

                    const alumni =
                        paidAlumni.find(
                            person =>
                                String(
                                    person.member_id
                                ).trim()
                                ===
                                String(
                                    token.member_id
                                ).trim()
                        );


                    return {
                        token,
                        alumni
                    };

                }
            )
            .filter(
                item => {

                    if (!search) {
                        return true;
                    }


                    const member =
                        String(
                            item.token.member_id ||
                            ""
                        ).toLowerCase();


                    const name =
                        String(
                            item.alumni?.name ||
                            ""
                        ).toLowerCase();


                    return (
                        member.includes(search) ||
                        name.includes(search)
                    );

                }
            );


    usedLoading.style.display =
        "none";


    if (usedList.length === 0) {

        usedTable.style.display =
            "none";

        usedEmpty.style.display =
            "block";

        return;

    }


    usedEmpty.style.display =
        "none";

    usedTable.style.display =
        "table";


    usedList.forEach(
        (item, index) => {

            const token =
                item.token;

            const alumni =
                item.alumni;


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHTML(
                        token.member_id
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        alumni?.name || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        alumni?.ssc_year || "-"
                    )}
                </td>

                <td>
                    <span class="badge badge-used">
                        USED
                    </span>
                </td>

                <td>
                    ${formatDate(
                        token.used_at
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        token.used_by || "-"
                    )}
                </td>

            `;


            usedBody.appendChild(
                row
            );

        }
    );

}


// =====================================================
// UNUSED TABLE
// =====================================================

function renderUnusedTable() {

    unusedBody.innerHTML = "";


    const search =
        getSearchValue();


    /*
       Every paid alumni who has NOT
       collected food is displayed.
    */

    const unusedList =
        paidAlumni
            .filter(
                alumni => {

                    const token =
                        getTokenForMember(
                            alumni.member_id
                        );


                    const used =
                        token &&
                        String(
                            token.token_status || ""
                        )
                        .trim()
                        .toLowerCase()
                        === "used";


                    if (used) {
                        return false;
                    }


                    if (!search) {
                        return true;
                    }


                    const member =
                        String(
                            alumni.member_id ||
                            ""
                        ).toLowerCase();


                    const name =
                        String(
                            alumni.name ||
                            ""
                        ).toLowerCase();


                    return (
                        member.includes(search) ||
                        name.includes(search)
                    );

                }
            );


    unusedLoading.style.display =
        "none";


    if (unusedList.length === 0) {

        unusedTable.style.display =
            "none";

        unusedEmpty.style.display =
            "block";

        return;

    }


    unusedEmpty.style.display =
        "none";

    unusedTable.style.display =
        "table";


    unusedList.forEach(
        (alumni, index) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHTML(
                        alumni.member_id
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        alumni.name || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        alumni.ssc_year || "-"
                    )}
                </td>

                <td>
                    <span class="badge badge-used">
                        PAID
                    </span>
                </td>

                <td>
                    <span class="badge badge-unused">
                        UNUSED
                    </span>
                </td>

            `;


            unusedBody.appendChild(
                row
            );

        }
    );

}


// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(
    value
) {

    if (!value) {
        return "-";
    }


    try {

        return new Date(
            value
        ).toLocaleString(
            "en-BD",
            {
                dateStyle:
                    "medium",
                timeStyle:
                    "short"
            }
        );

    }

    catch(error) {

        return String(
            value
        );

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
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


// =====================================================
// SEARCH EVENT
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            renderTables();

        }
    );

}


// =====================================================
// REFRESH
// =====================================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async function() {

            refreshBtn.disabled =
                true;

            refreshBtn.textContent =
                "⏳ Loading...";


            await loadDashboard();


            refreshBtn.disabled =
                false;

            refreshBtn.textContent =
                "🔄 Refresh";

        }
    );

}


// =====================================================
// START
// =====================================================

loadDashboard();