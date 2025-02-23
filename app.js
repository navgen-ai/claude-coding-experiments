/* JavaScript - app.js */
async function generateAvatar() {
    const button = document.getElementById("generateButton");
    button.disabled = true;
    button.textContent = "Generating...";
    document.getElementById("avatarOutput").innerHTML = "<p>Generating avatar, please wait...</p>";
    const apiKey = document.getElementById("apiKey").value;
    const product = document.getElementById("product").value;

    if (!apiKey || !product) {
        alert("Please enter both API key and product.");
        button.disabled = false;
        button.textContent = "Generate Avatar";
        return;
    }

    const questions = [
        "What are the demographics of the customers for " + product + "?",
        "What are the goals and values for someone who buys " + product + "?",
        "What challenges and pain points might a customer face with " + product + "?",
        "Where does the customer find information about products like " + product + "?",
        "What are possible objections to buying " + product + "?"
    ];

    let avatarOutput = "<h2>Customer Avatar</h2>";

    for (let i = 0; i < questions.length; i++) {
        try {
            const response = await getGPTResponse(apiKey, questions[i] + ' Please provide the answer in a structured list format, clearly labeling each aspect like "Age: 25-34", "Gender: Male", etc.');
            const responseData = response.split('\n').filter(line => line.includes(':'));
            let tableRows = '';
            responseData.forEach(line => {
                const [key, value] = line.split(':').map(item => item.trim());
                tableRows += `<tr><td>${key}</td><td>${value}</td></tr>`;
            });
            avatarOutput += `<h3>${questions[i]}</h3><table><thead><tr><th>Aspect</th><th>Details</th></tr></thead><tbody>${tableRows}</tbody></table>`;
        } catch (error) {
            avatarOutput += `<div><strong>${questions[i]}</strong><p>Error: ${error.message}</p></div>`;
        }
    }

    document.getElementById("avatarOutput").innerHTML = avatarOutput;
    button.disabled = false;
    button.textContent = "Generate Avatar";
}

async function getGPTResponse(apiKey, prompt) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{"role": "user", "content": prompt}],
            max_tokens: 150
        })
    });

    if (!response.ok) {
        throw new Error("API request failed with status " + response.status);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}
