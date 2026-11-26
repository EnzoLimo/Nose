export default {
  async fetch(request, env) {
    // 1. Si abres la página en el navegador (GET), muestra un chat listo para usar
    if (request.method === "GET") {
      const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mi Chat con Claude</title>
        <style>
          body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #121212; color: #fff; }
          textarea { width: 100%; height: 100px; padding: 10px; border-radius: 8px; background: #1e1e1e; color: #fff; border: 1px solid #333; }
          button { margin-top: 10px; padding: 10px 20px; background: #d97757; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
          #respuesta { margin-top: 20px; padding: 15px; background: #1e1e1e; border-radius: 8px; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h2>Chat con Claude (Cloudflare)</h2>
        <textarea id="prompt" placeholder="Escribe tu pregunta para Claude..."></textarea>
        <button onclick="enviar()">Enviar a Claude</button>
        <div id="respuesta">Aquí aparecerá la respuesta...</div>

        <script>
          async function enviar() {
            const prompt = document.getElementById("prompt").value;
            const div = document.getElementById("respuesta");
            div.innerText = "Pensando...";
            
            const res = await fetch("/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            
            if (data.content && data.content[0]) {
              div.innerText = data.content[0].text;
            } else {
              div.innerText = "Error: " + JSON.stringify(data, null, 2);
            }
          }
        </script>
      </body>
      </html>`;
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    // 2. Si envías un mensaje (POST), llama a la API de Claude usando tu secreto
    if (request.method === "POST") {
      const { prompt } = await request.json();

      const response = await fetch("https://anthropic.com", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
