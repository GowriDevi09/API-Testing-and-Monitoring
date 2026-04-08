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
    resultBox.innerText = "";

    let bodyData;

    try {
        bodyData = bodyInput ? JSON.parse(bodyInput) : null;
    } catch {
        alert("Invalid JSON body!");
        return;
    }

    try {
        const response = await fetch("/api/test-api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url, method, body: bodyData })
        });

        let data;

        try {
            data = await response.json();
        } catch {
            data = await response.text();
        }

        console.log("API DATA:", data);

        loading.innerText = "";
        requestCount++;

        const statusColor =
            data.status >= 200 && data.status < 300 ? "#28a745" : "#dc3545";

        let speed =
            data.time < 200 ? "⚡ Fast" :
            data.time < 500 ? "⏳ Medium" :
            "🐢 Slow";

        let message =
            data.status >= 200 && data.status < 300
                ? "✅ Request Successful"
                : "❌ Request Failed";

        responseTimes.push(data.time);
        labels.push("Test " + labels.length);
        chart.update();

        let displayData = Array.isArray(data.data)
            ? data.data.slice(0, 3)
            : data.data;

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
        <div>⏱ ${data.time} ms</div>
        <div>⚡ ${speed}</div>
        <div>📦 ${requestCount}</div>
    </div>

    <hr>

    <!-- 🔥 ADD THIS BACK -->
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

// 💾 Save history
function saveHistory(url) {
    apiHistory.push(url);
    localStorage.setItem("history", JSON.stringify(apiHistory));
    displayHistory();
}

// 📜 Show history
function displayHistory() {
    const list = document.getElementById("historyList");
    if (!list) return;

    list.innerHTML = "";

    apiHistory.forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;

        li.onclick = () => {
            document.getElementById("url").value = item;
        };

        list.appendChild(li);
    });
}

// 📋 Copy response
function copyResponse() {
    const text = document.getElementById("result").innerText;
    navigator.clipboard.writeText(text);
    alert("Copied!");
}

// 📥 Download response
function downloadResponse() {
    const data = document.getElementById("result").innerText;
    const blob = new Blob([data], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "response.json";
    a.click();
}

// 🧹 Clear result
function clearResult() {
    document.getElementById("result").innerText = "";
}

// 🌙 Dark mode
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

// 📊 Status meaning
function getStatusMeaning(status) {
    if (status === 200) return "OK";
    if (status === 201) return "Created";
    if (status === 400) return "Bad Request";
    if (status === 401) return "Unauthorized";
    if (status === 404) return "Not Found";
    if (status === 500) return "Server Error";
    return "Unknown";
}

// 🔄 Tabs
function showTab(tabName) {
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach(tab => tab.style.display = "none");
    document.getElementById(tabName).style.display = "block";
}

// 🎯 Method toggle
document.getElementById("method").onchange = function () {
    const bodyField = document.getElementById("body");
    bodyField.style.display = this.value === "GET" ? "none" : "block";
};

// 🔥 Convert JSON → normal text
function formatData(data) {
    if (Array.isArray(data)) {
        return data.map(item => formatObject(item)).join("<hr>");
    } else {
        return formatObject(data);
    }
}

function formatObject(obj) {
    return Object.entries(obj)
        .map(([key, value]) => {
            return `<div><strong>${key}:</strong> ${
    typeof value === "object"
        ? JSON.stringify(value, null, 2)
        : value
}</div>`;
        })
        .join("");
}
function importCollection() {
    const file = document.getElementById("importFile").files[0];

    if (!file) {
        alert("Please select a file");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        const data = JSON.parse(event.target.result);

        collectionData = data.item; // store APIs

        displayCollection(); // call next function
    };

    reader.readAsText(file);
}
function displayCollection() {
    const apiList = document.getElementById("apiList");
    apiList.innerHTML = "";

    collectionData.forEach((api, index) => {
        const btn = document.createElement("button");
        btn.innerText = api.name;

        btn.onclick = () => loadAPI(index);

        apiList.appendChild(btn);
    });
}
function loadAPI(index) {
    const api = collectionData[index];

    const url =
        typeof api.request.url === "string"
            ? api.request.url
            : api.request.url.raw;

    document.getElementById("url").value = url;
    document.getElementById("method").value = api.request.method;

    if (api.request.body && api.request.body.raw) {
        document.getElementById("body").value = api.request.body.raw;
    }
}