require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 8080;

const SYSTEM_PROMPT = `
Eres Jessi ❤️, una asistente humana, cálida, experta en belleza, amigable y cercana que responde dudas por WhatsApp sobre el programa digital  "metodo lashista studio rentable".

Tu trabajo es responder dudas de forma NATURAL, BREVE y HUMANA, como si fueras una persona real atendiendo con cariño.

IMPORTANTE:
- Nunca suenes robótica.
- Nunca respondas exactamente igual cada vez.
- Varía ligeramente las palabras y estructura.
- Mantén respuestas cálidas y naturales.
- No escribas demasiado.
- Responde máximo en 1 o 2 párrafos cortos.

REGLAS:
- NO saludes.
- NO uses "Hola".
- NO hagas múltiples preguntas.
- NO hagas preguntas abiertas innecesarias.
- NO digas:
  - "¿Quieres saber más?"
  - "¿Te interesa?"
  - "¿Te gustaría?"
  - "¿Te ayudo en algo más?"
  - "¿Quieres que te cuente?"
- NO seas agresiva vendiendo.
- NO presiones.
- NO inventes información.
- NO menciones correo electrónico.
- NO digas que el material es físico.

INFORMACIÓN REAL:
- El material es DIGITAL.
- El material se compone de un conjunto de pdfs, plantillas, tutoriales ,guias y videos.
- El material NO es físico.
- El Material será enviado tan pronto se valide el pago por WhatsApp.
- Se enviara una cortesia de material "Pestañas pelo a pelo" anteriormente para que se den una idea de la calidad del material.
- El usuario  puede encontrar más arriba la guía de cortesia "Pestañas pelo a pelo" en esta misma conversación.
- El material está basado en la experiencia y conocimiento técnico como Lashista.
- El material esta enfocado para que aprendas en una metodología ordenada y sistematica.
-El programa no necesita experiencia , puedes empezar si no tienes ningún conocimiento en pestañas o maquillaje
-Puede estudiarse el material en cualquier lugar y en cualquier momento.
- El material se entregara  en links de Google drive para que accedas a la información.
- El precio de venta es:
  - 12.000  cop  Solo hoy- Precio de Lanzamiento
  - El precio regular del programa es de $99.900 COP


OBJETIVO:
Después de resolver la duda de forma amable y humana, dirige suavemente a la persona al pago del "Método Lashista Studio Rentable":
- transferencia Bre-b (Llave)
- Pago en Nequi/Daviplata

Haz que el cierre se sienta natural, amable y espiritual, nunca como presión de venta.
`;

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function elegirAleatoria(opciones) {
  return opciones[Math.floor(Math.random() * opciones.length)];
}

function limpiarRespuesta(texto) {
  texto = String(texto || "").trim();

  texto = texto
    .replace(/^¡?\s*hola\s*[😊❤️✨,\.\!]*\s*/gi, "")
    .replace(/^gracias por preguntar\s*[😊❤️✨,\.\!]*\s*/gi, "")
    .replace(/^buenos días\s*[😊❤️✨,\.\!]*\s*/gi, "")
    .replace(/^buenos dias\s*[😊❤️✨,\.\!]*\s*/gi, "")
    .replace(/^buenas tardes\s*[😊❤️✨,\.\!]*\s*/gi, "")
    .replace(/^buenas noches\s*[😊❤️✨,\.\!]*\s*/gi, "");

  texto = texto
    .replace(/¿[^?]*(quieres|te interesa|te gustaría|te gustaria|te cuento|te explico|te ayudo|puedo ayudarte|hay algo más|hay algo mas|te parece|te comparto|te paso)[^?]*\?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return texto;
}

function cierrePago() {
  const cierres = [
    `💌 Puedes adquirir el método lashista por transferencia bancaria(Bre-b) o Pago por Nequi/Daviplata✨

¿Cuál método prefieres? 🩷`,

    `💌 Si deseas comprar nuestro método , puedes hacerlo por transferencia bancaria(Bre-b) o Pago por Nequi/Daviplata ✨

¿Qué método prefieres? 🩷`,

    `💌 Para obtener el método de Cejas y Pestañas  puedes elegir transferencia bancaria(Bre-b) o Pago por Nequi/Daviplata ✨



¿Cuál opción prefieres? 🩷`,
  ];

  return elegirAleatoria(cierres);
}

function agregarCierre(texto) {
  const limpio = limpiarRespuesta(texto);

  if (!limpio) {
    return cierrePago();
  }

  return `${limpio}

${cierrePago()}`;
}

function respuestaDirecta(textoNormalizado) {
  if (
    textoNormalizado.includes("incluye") ||
    textoNormalizado.includes("trae") ||
    textoNormalizado.includes("contiene") ||
    textoNormalizado.includes("viene") ||
    textoNormalizado.includes("clases") ||
    textoNormalizado.includes("tecnicas")
  ) {
    const respuestasTrae = [
      `Incluye videos paso a paso, guías en PDF, material de apoyo y 7 bonos diseñados para ayudarte a aprender pestañas, cejas y comenzar con mayor seguridad.🌿.`,

      `Recibirás una metodología completa con clases en video, manuales digitales y recursos adicionales para acompañar tu aprendizaje.🥰`,

      `El programa reúne todo lo necesario para comenzar: videos, PDFs, técnicas de pestañas y cejas, además de bonos exclusivos.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasTrae));
  }

  if (
    textoNormalizado.includes("envio") ||
    textoNormalizado.includes("enviar") ||
    textoNormalizado.includes("entrega") ||
    textoNormalizado.includes("fisico") ||
    textoNormalizado.includes("pdf") ||
    textoNormalizado.includes("digital") ||
    textoNormalizado.includes("descargar") ||
    textoNormalizado.includes("recibir") ||
    textoNormalizado.includes("pense") ||
    textoNormalizado.includes("ubicacion") ||
    textoNormalizado.includes("presencial") ||
    textoNormalizado.includes("pense")
  ) {
    const respuestasEnvio = [
      `El material es completamente digital 😊

El acceso se entrega únicamente después de confirmar el pago. Recibirás un enlace de Google Drive con todos los videos y guías del programa 🌿`,

      `El material NO  físico 🙏

Recibirás el acceso al Método Lash Studio Rentable™ directamente por WhatsApp mediante un enlace de Google Drive. Podrás ingresar cuando quieras e imprimirlo. ✨`,

      `Tan pronto nos envíen el comprobante de tu pago 😊

Te enviaremos el enlace de acceso por WhatsApp. El material es digital y podrás verlo las veces que necesites.Incluso podras imprimirlo y argollarlo para practicar🌿`,

      `La entrega es digital 😊

Te compartiremos el acceso completo al curso por WhatsApp para que empieces a estudiar de inmediato. ✨`,
    ];

    return agregarCierre(elegirAleatoria(respuestasEnvio));
  }

  if (
    textoNormalizado.includes("Pagar") ||
    textoNormalizado.includes("precio") ||
    textoNormalizado.includes("costo") ||
    textoNormalizado.includes("Formas") ||
    textoNormalizado.includes("tarjeta") ||
    textoNormalizado.includes("precio") ||
    textoNormalizado.includes("cuesta") ||
    textoNormalizado.includes("compro") ||
    textoNormalizado.includes("transferir") ||
    textoNormalizado.includes("pagar") ||
    textoNormalizado.includes("pago")
  ) {
    const respuestasPago = [
      `En Colombia puedes pagar por Nequi, Daviplata, transferencia o Bre-B. 
Si estás fuera del país, aceptamos PayPal.
💖 *SOLO HOY* 🔥
Puedes acceder por *$12.000 COP* o $10 USD Fuera de Col
~(Antes $99.900 COP)~`,

      `Para recibir el  Material puedes pagar: 😊

Muy sencillo: En Colombia Nequi/Daviplata o Llave, envías el soporte por WhatsApp y activamos tu acceso.:
💖 *SOLO HOY* 🔥
Puedes acceder por *$12.000 COP* o $10 USD Fuera de Col
~(Antes $99.900 COP)`,

      `Aceptamos varios medios de pago COL: Nequi/ Daviplata o Llave Paypal si estas fuera de COL.
Tendras acceso tan pronto validemos el pago recibirás el acceso.💖 *SOLO HOY* 🔥
Puedes acceder por *$12.000 COP* o $10 USD Fuera de Col
~(Antes $99.900 COP)`,
    ];

    return agregarCierre(elegirAleatoria(respuestasPago));
  }

  return null;
}

app.get("/", (req, res) => {
  res.send("Bot ventas activo ✅");
});

app.post("/mensaje", async (req, res) => {
  try {
    const texto = req.body.texto || req.body.mensaje || req.body.message || "";

    console.log("Texto recibido:", texto);

    if (!texto) {
      return res.json({ respuesta: cierrePago() });
    }

    const textoNormalizado = normalizarTexto(texto);
    const directa = respuestaDirecta(textoNormalizado);

    if (directa) {
      console.log("Respuesta directa:", directa);
      return res.json({ respuesta: directa });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: texto },
      ],
    });

    const respuestaIA = response.output_text || "";
    const respuestaFinal = agregarCierre(respuestaIA);

    console.log("Respuesta enviada:", respuestaFinal);

    return res.json({ respuesta: respuestaFinal });
  } catch (error) {
    console.error("Error en /mensaje:", error);

    return res.json({ respuesta: cierrePago() });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
