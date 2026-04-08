// 📊 Graph setup
let responseTimes = [];
let labels = [];
let chart;
let collectionData = [];

let apiHistory = JSON.parse(localStorage.getItem("history")) || [];
let requestCount = 0;

// 🧠 Page load
window.onload = function () {
    displayHistory();

    const ctx = document.getElementById("responseChart").getContext("2d");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Response Time (ms)",
                data: responseTimes,
                borderWidth: 2
            }]
        }
    });
};

// 🚀 MAIN FUNCTION
async function testAPI() {
    const url = document.getElementById("url").value;
    const method = document.getElementById("method").value;
    const bodyInput = document.getElementById("body").value;

    const resultBox = document.getElementById("result");
    const loading = document.getElementById("loading");

    if (!url.startsWith("http")) {
        alert("Enter valid URL");
        return;
    }

    saveHistory(url);

    loading.innerText = "⏳ Testing API...";
    resultBox.innerHTML = "";

    let bodyData;

    try {
        bodyData = bodyInput ? JSON.parse(bodyInput) : null;
    } catch {
        alert("Invalid JSON body!");
        return;
    }

    try {
        // 🔥 FRONTEND TIMER START
        const start = performance.now();

        const response = await fetch("/api/test-api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url, method, body: bodyData })
        });

        const end = performance.now(); // 🔥 END TIMER
        const frontendTime = Math.round(end - start);

        let data;

        try {
            data = await response.json();
        } catch {
            data = await response.text();
        }

        console.log("API DATA:", data);

        loading.innerText = "";
        requestCount++;

        // 🔥 SPEED LOGIC (UPDATED)
        let speed =
            frontendTime < 500 ? "⚡ Fast" :
            frontendTime < 1500 ? "⏳ Medium" :
            "🐢 Slow";

        // GRAPH UPDATE
        responseTimes.push(frontendTime);
        labels.push("Test " + labels.length);
        chart.update();

        let displayData = Array.isArray(data.data)
            ? data.data.slice(0, 3)
            : data.data;

        // 🔥 FINAL UI OUTPUT
        resultBox.innerHTML = `
        <div class="response-card">

            <h3>📥 API Response</h3>

            <div class="top-row">
                <span>Status</span>
                <span class="status ${data.status >= 200 && data.status < 300 ? 'success' : 'error'}">
                    ${data.status}
                </span>
            </div>

            <div class="info-row">
                <div>📊 ${getStatusMeaning(data.status)}</div>
                <div>⏱ ${frontendTime} ms</div>
                <div>⚡ ${speed}</div>
                <div>📦 ${requestCount}</div>
            </div>

            <hr>

            <div class="response-data">
                ${formatData(displayData)}
            </div>

        </div>
        `;

    } catch (error) {
        loading.innerText = "";
        resultBox.innerText = "❌ Error connecting to server";
        console.error(error);
    }
}
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}
function showTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.style.display = "none";
    });

    document.getElementById(tabName).style.display = "block";
}
function displayHistory() {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const list = document.getElementById("historyList");

    list.innerHTML = "";

    history.forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;
        list.appendChild(li);
    });
}