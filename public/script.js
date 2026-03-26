async function testAPI() {
    const url = document.getElementById("url").value;
    const method = document.getElementById("method").value;
    const resultBox = document.getElementById("result");
    const loading = document.getElementById("loading");

    loading.innerText = "Testing API...";
    resultBox.innerText = "";

    try {
        const response = await fetch("/api/test-api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url, method })
        });

        const data = await response.json();

        loading.innerText = "";

        resultBox.innerText = JSON.stringify(data, null, 2);

    } catch (error) {
        loading.innerText = "";
        resultBox.innerText = "Error connecting to server";
    }
}