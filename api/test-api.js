export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { url, method } = req.body;

            const start = Date.now();

            const response = await fetch(url, {
                method: method || "GET"
            });

            let data;

            try {
                data = await response.json();
            } catch {
                data = await response.text();
            }

            const end = Date.now();

            res.status(200).json({
                status: response.status,
                time: end - start,
                data: Array.isArray(data) ? data.slice(0, 5) : data
            });

        } catch (error) {
            res.status(500).json({
                status: "Error",
                message: "API request failed"
            });
        }
    }
}