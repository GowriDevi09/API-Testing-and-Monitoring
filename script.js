let responseTimes = [];
let labels = [];
let chart;
let collectionData = [];
let requestCount = 0;

// LOAD
window.onload = function () {
    displayHistory();

    const canvas = document.getElementById("responseChart");
    if (canvas) {
        const ctx = canvas.getContext("2d");

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
    }
};

// MAIN FUNCTION
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
        alert("Invalid JSON!");
        return;
    }

    try {
        const start = performance.now();

        const response = await fetch("/api/test-api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url, method, body: bodyData })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();

        const end = performance.now();
        const time = Math.round(end - start);

        loading.innerText = "";
        requestCount++;

        let speed =
            time < 500 ? "⚡ Fast" :
            time < 1500 ? "⏳ Medium" :
            "🐢 Slow";

        responseTimes.push(time);
        labels.push("Test " + labels.length);
        if (chart) chart.update();

        resultBox.innerHTML = `
        <div class="response-card">
            <h3>📥 API Response</h3>

            <div class="top-row">
                <span>Status</span>
                <span class="status ${data.status < 300 ? 'success' : 'error'}">
                    ${data.status}
                </span>
            </div>

            <div class="info-row">
                <div>⏱ ${time} ms</div>
                <div>${speed}</div>
                <div>📦 ${requestCount}</div>
            </div>

            <hr>

            <div class="response-data">
                <pre>${formatPrettyData(data.data)}</pre>
            </div>
        </div>
        `;

    } catch (err) {
        loading.innerText = "";
        resultBox.innerText = "❌ Error connecting to server";
        console.error(err);
    }
}

// DARK MODE
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

// TABS
function showTab(tab) {
    document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
    document.getElementById(tab).style.display = "block";
}

// HISTORY
function saveHistory(url) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.unshift(url);
    history = history.slice(0, 5);
    localStorage.setItem("history", JSON.stringify(history));
    displayHistory();
}

function displayHistory() {
    const list = document.getElementById("historyList");
    list.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("history")) || [];

    history.forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;
        list.appendChild(li);
    });
}

// POSTMAN IMPORT
function importCollection() {
    const file = document.getElementById("importFile").files[0];
    if (!file) return alert("Select file");

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = JSON.parse(e.target.result);
        collectionData = data.item || [];
        displayCollection();
    };
    reader.readAsText(file);
}

function displayCollection() {
    const apiList = document.getElementById("apiList");
    apiList.innerHTML = "";

    collectionData.forEach(api => {
        const btn = document.createElement("button");
        btn.innerText = api.name;

        btn.onclick = function () {
            document.getElementById("url").value = api.request.url.raw;
            document.getElementById("method").value = api.request.method;
        };

        apiList.appendChild(btn);
    });
}

// EXTRA BUTTONS
function clearResult() {
    document.getElementById("result").innerHTML = "";
}

function copyResponse() {
    navigator.clipboard.writeText(document.getElementById("result").innerText);
}

function downloadResponse() {
    const blob = new Blob([document.getElementById("result").innerText]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "response.txt";
    a.click();
}
function formatPrettyData(data) {
    if (Array.isArray(data)) {
        return data.map(item => {
            return `
ID: ${item.id}
Name: ${item.name}
Username: ${item.username}
Email: ${item.email}
City: ${item.address?.city}
Phone: ${item.phone}
Website: ${item.website}
Company: ${item.company?.name}
----------------------------------
`;
        }).join("\n");
    }

    return JSON.stringify(data, null, 2);
}