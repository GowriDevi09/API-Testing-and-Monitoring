export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { url, method, body } = req.body;

            const start = Date.now();

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: method === "POST" ? JSON.stringify(body) : undefined
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
                data: data
            });

        } catch (error) {
            res.status(500).json({
                status: "Error",
                message: error.message
            });
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}