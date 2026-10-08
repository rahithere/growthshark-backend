import { saveFormSubmission } from "../services/formSubmission.js";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, message, source } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const saved = await saveFormSubmission({
    fullName: name,
    email: email,
    phone: "N/A",
    website: "N/A",
    service: "N/A",
    message,
    source,
    mode: "N/A"
  }, `${source} form`)

  if (!saved) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to save the data"))
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Data saved successfully"))


}