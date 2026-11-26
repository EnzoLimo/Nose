export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mi IA en la Nube</title>
        <style>
          body { margin: 0; font-family: system-ui, sans-serif; background: #212121; color: #ececec; display: flex; flex-direction: column; height: 100vh; }
          #chat { flex: 1; overflow-y: auto; padding: 20px; max-width: 750px; width: 100%; margin: 0 auto; box-sizing: border-box; }
          .msg { margin-bottom: 16px; padding: 12px 16px; border-radius: 12px; line-height: 1.5; white-space: pre-wrap; }
          .user { background: #2f2f2f; align-self: flex-end; margin-left: 20%; }
          .bot { background: #171717; border: 1px solid #333; margin-right: 10%; }
          #form { display: flex; gap: 10px; padding: 15px; max-width: 750px; width: 100%; margin: 0 auto; box-sizing: border-box; background: #212121; }
          input { flex: 1; padding: 14px; border-radius: 24px; border: 1px solid #444; background: #2f2f2f; color: white; font-size: 16px; outline: none; }
          button { padding: 0 22px; border-radius: 24px; border: none; background: #10a37f; color: white; font-weight: bold; cursor: pointer; }
        </style>
      </head>
      <body>
        <div id="chat"><div class="msg bot">Hola, estoy corriendo gratis en tu nube de Cloudflare. ¿En qué te ayudo?</div></div>
        <form id="form" onsubmit="enviar(event)">
          <input id="input" placeholder="Escribe un mensaje..." autocomplete="off" required />
          <button type="submit">Enviar</button>
        </form>
        <script>
          const historial = [];
          async function enviar(e) {
            e.preventDefault();
            const input = document.getElementById("input");
            const chat = document.getElementById("chat");
            const texto = input.value.trim();
            if (!texto) return;

            chat.innerHTML += '<div class="msg user">' + texto.replace(/</g, "&lt;") + '</div>';
            input.value = "";
            historial.push({ role: "user", content: texto });

            const botDiv = document.createElement("div");
            botDiv.className = "msg bot";
            botDiv.innerText = "Escribiendo...";
            chat.appendChild(botDiv);
            chat.scrollTop = chat.scrollHeight;

            const res = await fetch("/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messages: historial })
            });
            const data = await res.json();
            const respuesta = data.response || "Error: " + JSON.stringify(data);
            botDiv.innerText = respuesta;
            historial.push({ role: "assistant", content: respuesta });
            chat.scrollTop = chat.scrollHeight;
          }
        </script>
      </body>
      </html>`;
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (request.method === "POST") {
      const { messages } = await request.json();
      const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [
          { role: "system", content: "Eres un asistente útil y claro. Responde siempre en español." },
          ...messages
        ],
      });
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
