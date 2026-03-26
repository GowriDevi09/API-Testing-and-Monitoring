// 📊 Graph setup
let responseTimes = [];
let labels = [];
let chart;

// 💾 Load history
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

// 🚀 Main API function
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

        const data = await response.json();
        loading.innerText = "";

        requestCount++;

        // 🎨 Status color
        const statusColor =
            data.status >= 200 && data.status < 300 ? "#28a745" : "#dc3545";

        // 📊 Speed indicator
        let speed =
            data.time < 200 ? "⚡ Fast" :
            data.time < 500 ? "⏳ Medium" :
            "🐢 Slow";

        // ✅ Success message
        let message =
            data.status >= 200 && data.status < 300
                ? "✅ Request Successful"
                : "❌ Request Failed";

        // 📊 Graph update
        responseTimes.push(data.time);
        labels.push("Test " + labels.length);
        chart.update();

        // 📉 Limit large data
        let displayData = Array.isArray(data.data)
            ? data.data.slice(0, 5)
            : data.data;

        // 🖥️ UI Output
        resultBox.innerHTML = `
<div style="margin-bottom:10px;">
    <strong>Status:</strong> 
    <span style="
        display:inline-block;
        background:${statusColor};
        color:white;
        padding:6px 12px;
        border-radius:6px;
        font-weight:bold;
        margin-left:10px;
    ">
        ${data.status}
    </span>
</div>

<div><strong>Status Meaning:</strong> ${getStatusMeaning(data.status)}</div>

<div>${message}</div>

<div><strong>Time:</strong> ${data.time} ms</div>

<div><strong>Speed:</strong> ${speed}</div>

<div><strong>Total Requests:</strong> ${requestCount}</div>

<pre>${JSON.stringify(displayData, null, 2)}</pre>
`;

    } catch (error) {
        loading.innerText = "";
        resultBox.innerText = "❌ Error connecting to server";
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

// 📥 Download response
function downloadResponse() {
    const data = document.getElementById("result").innerText;
    const blob = new Blob([data], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "response.json";
    a.click();
}

// 📋 Copy response
function copyResponse() {
    const text = document.getElementById("result").innerText;
    navigator.clipboard.writeText(text);
    alert("Copied!");
}

// 🔍 Search
function searchResponse() {
    const keyword = document.getElementById("search").value.toLowerCase();
    const result = document.getElementById("result").innerText;

    if (result.toLowerCase().includes(keyword)) {
        console.log("Found");
    }
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

// 🧹 Clear
function clearResult() {
    document.getElementById("result").innerText = "";
}

// 🌙 Dark mode
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

// 🎯 Method UI
document.getElementById("method").onchange = function () {
    const bodyField = document.getElementById("body");

    bodyField.style.display = this.value === "GET" ? "none" : "block";
};
function showTab(tabName) {
    const tabs = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => tab.style.display = "none");

    document.getElementById(tabName).style.display = "block";
}