export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { url, method } = req.body;

            const start = Date.now();

            const response = await fetch(url, {
                method: method || "GET"
            });

            const data = await response.text();
            const end = Date.now();

            res.status(200).json({
                status: response.status,
                time: end - start,
                data: data.substring(0, 500) // limit output
            });

        } catch (error) {
            res.status(500).json({
                status: "Error",
                message: "API request failed"
            });
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}