export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { url, method, body } = req.body;

        const start = Date.now();
        await new Promise(resolve => setTimeout(resolve, 3000));
        const response = await fetch(url, {
            method: method || "GET",
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

        return res.status(200).json({
            status: response.status,
            time: end - start,
            data: data
        });

    } catch (error) {
        return res.status(500).json({
            status: "Error",
            message: error.message
        });
    }
}