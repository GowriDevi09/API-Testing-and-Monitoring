// 📊 Graph setup
let responseTimes = [];
let labels = [];

let chart;

// 💾 Load history from localStorage
let apiHistory = JSON.parse(localStorage.getItem("history")) || [];

// 🧠 Run when page loads
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

    // 💾 Save history
    saveHistory(url);

    loading.innerText = "⏳ Testing API...";
    resultBox.innerText = "";

    let bodyData;

    // 📦 Parse JSON body
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

        // 🎨 Status color
        const statusColor = data.status >= 200 && data.status < 300 ? "green" : "red";

        // 📊 Update graph
        responseTimes.push(data.time);
        labels.push("Test " + labels.length);
        chart.update();

        // 📉 Limit large data
        let displayData = Array.isArray(data.data) ? data.data.slice(0, 5) : data.data;

        // 🖥️ Display result
        resultBox.innerHTML = `
<div>
    <strong>Status:</strong> 
    <span style="color:white; background:${statusColor}; padding:5px; border-radius:5px;">
        ${data.status}
    </span>
</div>

<div><strong>Time:</strong> ${data.time} ms</div>

<pre>${JSON.stringify(displayData, null, 2)}</pre>
`;

    } catch (error) {
        loading.innerText = "";
        resultBox.innerText = "❌ Error connecting to server";
    }
}

// 💾 Save history + persist
function saveHistory(url) {
    apiHistory.push(url);

    localStorage.setItem("history", JSON.stringify(apiHistory));

    displayHistory();
}

// 📜 Display history
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

// 🧹 Clear result
function clearResult() {
    document.getElementById("result").innerText = "";
}

// 🌙 Dark mode
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}