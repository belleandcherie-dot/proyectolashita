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
Eres Jessi ❤️, asesora oficial de Belle & Cherie.

Atiendes clientes por WhatsApp interesados únicamente en:

Pestañas Flora Autoadhesivas de 120 piezas.

Tu personalidad:

- Humana.
- Cercana.
- Amable.
- Natural.
- Experta en belleza.
- Nunca robótica.
- Nunca agresiva vendiendo.

OBJETIVO

Resolver las dudas de las clientas de forma breve, clara y natural.

REGLAS IMPORTANTES

- Responde de forma breve.
- Máximo 2 líneas cuando sea posible.
- Usa emojis de forma natural, sin exagerar.
- No saludes.
- No uses "Hola".
- No escribas párrafos largos.
- No hagas preguntas innecesarias.
- No inventes información.
- No cambies precios.
- No inventes promociones.
- No inventes medidas.
- No inventes colores.
- No inventes métodos de pago.
- No inventes tiempos de entrega.
- No inventes características del producto.
- No prometas información que no aparezca en esta base.

NO DIGAS:

- ¿Te interesa?
- ¿Quieres saber más?
- ¿Te gustaría?
- ¿Puedo ayudarte en algo más?
- ¿Quieres que te cuente?
- ¿Quieres que te explique?

Cuando la clienta haga una pregunta concreta, responde directamente esa pregunta.

Si la información solicitada no está en esta base de conocimiento, indica que ese dato debe ser confirmado con el equipo de Belle & Cherie.

INFORMACIÓN OFICIAL

EMPRESA:

Belle & Cherie.

PRODUCTO:

Pestañas Flora Autoadhesivas.

PRECIO:

Precio actual: $74.900 COP.

Precio anterior: $119.900 COP.

INCLUYE:

120 piezas.

MEDIDAS:

8 mm
9 mm
10 mm
11 mm
12 mm

Cada medida incluye 24 piezas.

COLOR:

Negro natural.

ADHESIVO:

Las pestañas incluyen un adhesivo transparente resistente al agua.

El adhesivo incluido puede durar hasta 7 días dependiendo del cuidado y la forma de uso.

Después del primer uso, las pestañas pueden reutilizarse utilizando pegante negro.

APLICACIÓN:

Se colocan debajo de las pestañas naturales.

No requieren experiencia.

Son fáciles de colocar.

La aplicación puede realizarse en menos de 2 minutos.

RETIRO:

Pueden retirarse utilizando:

- removedor de pestañas
- vaselina
- desmaquillante

Deben retirarse suavemente para cuidar las pestañas naturales.

REUTILIZACIÓN:

Las Pestañas Flora pueden reutilizarse hasta 3 veces.

El adhesivo incluido funciona para el primer uso.

Después del primer uso, se recomienda utilizar pegante negro para volver a colocarlas.

UBICACIÓN:

Belle & Cherie está ubicada en Bogotá.

Es una tienda 100% virtual.

No tiene tienda física.

ENVÍOS:

Se realizan envíos GRATIS a toda Colombia.

El envío se realiza por Interrapidísimo.

El tiempo de entrega es de:

2 a 3 días hábiles para ciudades principales.

Hasta 5 días hábiles para municipios o ciudades apartadas.

MEDIOS DE PAGO:

Nequi.

Daviplata.

Bre-B.

Pago contra entrega.

HIPOALERGÉNICAS:

Las Pestañas Flora son hipoalergénicas y están pensadas para cuidar la piel y las pestañas.

IMPORTANTE SOBRE LA VENTA:

Cuando una clienta pregunte por precio, compra, pedido o métodos de pago, puedes orientar naturalmente hacia la compra.

No presiones.

No inventes disponibilidad de unidades.

No inventes descuentos adicionales.

No inventes costos de envío.

Si una clienta pregunta algo que no aparece aquí, indica que debe ser confirmado por el equipo.

`;

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function elegirAleatoria(opciones) {
  return opciones[
    Math.floor(Math.random() * opciones.length)
  ];
}

function limpiarRespuesta(texto) {

  texto = String(texto || "").trim();

  texto = texto
    .replace(/^hola[\s,!.\u2764\ufe0f😊✨💕]*/gi, "")
    .replace(/^buenos dias[\s,!.\u2764\ufe0f😊✨💕]*/gi, "")
    .replace(/^buenas tardes[\s,!.\u2764\ufe0f😊✨💕]*/gi, "")
    .replace(/^buenas noches[\s,!.\u2764\ufe0f😊✨💕]*/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return texto;
}

function limitarRespuesta(texto) {

  if (!texto) return "";

  texto = String(texto).trim();

  if (texto.length <= 220) {
    return texto;
  }

  return texto.substring(0, 220).trim() + "...";
}

function cierreCompra() {

  const cierres = [

    `💖 Puedes comprar por Nequi, Daviplata, Bre-B o Contra Entrega. ¿Qué método prefieres?`,

    `✨ Puedes realizar tu pedido por Nequi, Daviplata, Bre-B o Contra Entrega. El envío es GRATIS.`,

    `🌸 Para realizar tu pedido puedes pagar por Nequi, Daviplata, Bre-B o Contra Entrega.`

  ];

  return elegirAleatoria(cierres);
}

function debeAgregarCierre(texto) {

  texto = normalizarTexto(texto);

  return (

    texto.includes("precio") ||
    texto.includes("cuesta") ||
    texto.includes("valor") ||
    texto.includes("comprar") ||
    texto.includes("pedido") ||
    texto.includes("pagar") ||
    texto.includes("nequi") ||
    texto.includes("daviplata") ||
    texto.includes("bre") ||
    texto.includes("contra entrega") ||
    texto.includes("contraentrega")

  );
}

function agregarCierre(respuesta, texto) {

  let limpio = limpiarRespuesta(respuesta);

  limpio = limitarRespuesta(limpio);

  if (!limpio) {
    return cierreCompra();
  }

  if (!debeAgregarCierre(texto)) {
    return limpio;
  }

  return `${limpio}

${cierreCompra()}`;
}
function respuestaDirecta(textoNormalizado) {

  // =========================
  // 1. PRECIO
  // =========================

  if (
    textoNormalizado.includes("precio") ||
    textoNormalizado.includes("cuesta") ||
    textoNormalizado.includes("valor") ||
    textoNormalizado.includes("costo") ||
    textoNormalizado.includes("oferta") ||
    textoNormalizado.includes("promocion") ||
    textoNormalizado.includes("descuento") ||
    textoNormalizado.includes("74900") ||
    textoNormalizado.includes("119900")
  ) {

    const respuestas = [

      "💖 Hoy tienen un precio especial de $74.900 (antes $119.900). Incluyen 120 piezas y envío GRATIS.",

      "✨ Las Pestañas Flora tienen un precio especial de $74.900. Antes costaban $119.900 y el envío es GRATIS.",

      "🌸 Hoy puedes llevar tus Pestañas Flora por $74.900. Incluyen 120 piezas autoadhesivas y envío GRATIS."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 2. APLICACIÓN
  // =========================

  if (
    textoNormalizado.includes("poner") ||
    textoNormalizado.includes("aplicar") ||
    textoNormalizado.includes("colocar") ||
    textoNormalizado.includes("instalar") ||
    textoNormalizado.includes("usar") ||
    textoNormalizado.includes("aplicacion") ||
    textoNormalizado.includes("como se ponen")
  ) {

    const respuestas = [

      "✨ ¡Es muy fácil! Colócalas debajo de tus pestañas naturales con una pinza. Estarán listas en menos de 2 minutos.",

      "💖 No necesitas experiencia. Toma la pestaña con una pinza, colócala debajo de tus pestañas y presiona suavemente.",

      "🌸 Son muy fáciles de colocar. Puedes hacerlo tú misma y tenerlas listas en menos de 2 minutos."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 3. PEGANTE
  // =========================

  if (
    textoNormalizado.includes("pegante") ||
    textoNormalizado.includes("adhesivo") ||
    textoNormalizado.includes("pega") ||
    textoNormalizado.includes("pegan") ||
    textoNormalizado.includes("goma") ||
    textoNormalizado.includes("pegamento")
  ) {

    const respuestas = [

      "✨ Incluyen un adhesivo transparente resistente al agua que puede durar hasta 7 días. Después puedes reutilizarlas con pegante negro.",

      "💖 Ya traen adhesivo transparente resistente al agua. Luego puedes reutilizarlas usando pegante negro.",

      "🌸 El adhesivo ya viene incorporado y puede durar hasta 7 días según el cuidado."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 4. RETIRO
  // =========================

  if (
    textoNormalizado.includes("quitar") ||
    textoNormalizado.includes("retirar") ||
    textoNormalizado.includes("remover") ||
    textoNormalizado.includes("despegar") ||
    textoNormalizado.includes("sacar")
  ) {

    const respuestas = [

      "💖 ¡Es muy fácil! Retíralas con removedor de pestañas o usa vaselina o desmaquillante. Hazlo suavemente.",

      "✨ Puedes retirarlas con removedor, vaselina o desmaquillante. Hazlo con suavidad para cuidar tus pestañas naturales.",

      "🌸 Se retiran fácilmente con removedor, vaselina o desmaquillante. Recuerda hacerlo suavemente."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 5. DAÑO A PESTAÑAS
  // =========================

  if (
    textoNormalizado.includes("dañar") ||
    textoNormalizado.includes("danar") ||
    textoNormalizado.includes("dañan") ||
    textoNormalizado.includes("danan") ||
    textoNormalizado.includes("caer") ||
    textoNormalizado.includes("caen") ||
    textoNormalizado.includes("tumbar") ||
    textoNormalizado.includes("tumban") ||
    textoNormalizado.includes("arrancar") ||
    textoNormalizado.includes("lastimar") ||
    textoNormalizado.includes("seguras")
  ) {

    const respuestas = [

      "💖 Si las retiras con suavidad usando removedor, vaselina o desmaquillante, tus pestañas naturales estarán protegidas.",

      "✨ No dañan tus pestañas si las retiras correctamente y con suavidad, siguiendo las recomendaciones de cuidado.",

      "🌸 Con un retiro adecuado y cuidadoso, tus pestañas naturales estarán protegidas."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 6. MEDIDAS
  // =========================

  if (
    textoNormalizado.includes("medidas") ||
    textoNormalizado.includes("tamaño") ||
    textoNormalizado.includes("mm") ||
    textoNormalizado.includes("milimetros") ||
    textoNormalizado.includes("milimetro") ||
    textoNormalizado.includes("8mm") ||
    textoNormalizado.includes("9mm") ||
    textoNormalizado.includes("10mm") ||
    textoNormalizado.includes("11mm") ||
    textoNormalizado.includes("12mm")
  ) {

    const respuestas = [

      "✨ Incluyen 120 piezas en medidas de 8 a 12 mm. Cada medida trae 24 piezas.",

      "💖 Recibirás 120 piezas distribuidas en medidas de 8, 9, 10, 11 y 12 mm.",

      "🌸 Incluyen cinco medidas: 8, 9, 10, 11 y 12 mm. Son 24 piezas por cada medida."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 7. OTRAS MEDIDAS
  // =========================

  if (
    textoNormalizado.includes("otras medidas") ||
    textoNormalizado.includes("otra medida") ||
    textoNormalizado.includes("14mm") ||
    textoNormalizado.includes("15mm") ||
    textoNormalizado.includes("16mm") ||
    textoNormalizado.includes("otro tamaño") ||
    textoNormalizado.includes("otros tamaños") ||
    textoNormalizado.includes("mas largas") ||
    textoNormalizado.includes("más largas") ||
    textoNormalizado.includes("mas cortas") ||
    textoNormalizado.includes("más cortas")
  ) {

    const respuestas = [

      "💖 Actualmente manejamos una sola presentación de 120 piezas en medidas de 8 a 12 mm.",

      "✨ Por ahora solo está disponible la presentación de 8 a 12 mm.",

      "🌸 Las medidas no pueden modificarse porque el empaque viene sellado."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 8. COLOR
  // =========================

  if (
    textoNormalizado.includes("color") ||
    textoNormalizado.includes("cafe") ||
    textoNormalizado.includes("negro") ||
    textoNormalizado.includes("marron") ||
    textoNormalizado.includes("tono")
  ) {

    const respuestas = [

      "💖 Vienen en color negro natural para lograr un acabado muy natural.",

      "✨ El color negro natural se integra perfectamente con tus pestañas.",

      "🌸 Actualmente manejamos color negro natural, similar al tono de las pestañas naturales."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 9. TIENDA / UBICACIÓN
  // =========================

  if (
    textoNormalizado.includes("tienda") ||
    textoNormalizado.includes("ubicacion") ||
    textoNormalizado.includes("direccion") ||
    textoNormalizado.includes("local") ||
    textoNormalizado.includes("fisica") ||
    textoNormalizado.includes("fisico") ||
    textoNormalizado.includes("donde estan") ||
    textoNormalizado.includes("donde se encuentran")
  ) {

    const respuestas = [

      "💖 Estamos en Bogotá. Somos una tienda 100% virtual y hacemos envíos GRATIS a toda Colombia.",

      "✨ No tenemos punto físico. Somos una tienda virtual ubicada en Bogotá, con envíos GRATIS a todo el país.",

      "🌸 Estamos en Bogotá y trabajamos como tienda virtual. Enviamos GRATIS a cualquier ciudad de Colombia."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 10. PAGOS
  // =========================

  if (
    textoNormalizado.includes("pagar") ||
    textoNormalizado.includes("pago") ||
    textoNormalizado.includes("nequi") ||
    textoNormalizado.includes("daviplata") ||
    textoNormalizado.includes("bre") ||
    textoNormalizado.includes("contra entrega") ||
    textoNormalizado.includes("contraentrega") ||
    textoNormalizado.includes("transferencia") ||
    textoNormalizado.includes("metodo de pago") ||
    textoNormalizado.includes("forma de pago")
  ) {

    const respuestas = [

      "💖 Puedes pagar por Nequi, Daviplata, Bre-B o Contra Entrega. El envío es GRATIS.",

      "✨ Aceptamos Nequi, Daviplata, Bre-B y pago Contra Entrega.",

      "🌸 Puedes elegir el método que prefieras: Nequi, Daviplata, Bre-B o Contra Entrega."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 11. DURACIÓN
  // =========================

  if (
    textoNormalizado.includes("duran") ||
    textoNormalizado.includes("duracion") ||
    textoNormalizado.includes("demora") ||
    textoNormalizado.includes("cuanto tiempo") ||
    textoNormalizado.includes("dias") ||
    textoNormalizado.includes("demoran")
  ) {

    const respuestas = [

      "💖 En su primer uso pueden durar hasta 7 días, dependiendo del cuidado y la forma de uso.",

      "✨ Su duración puede ser de hasta 7 días siguiendo las recomendaciones de cuidado.",

      "🌸 Con un buen cuidado pueden durar hasta 7 días en su primer uso."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 12. PRINCIPIANTES
  // =========================

  if (
    textoNormalizado.includes("principiante") ||
    textoNormalizado.includes("experiencia") ||
    textoNormalizado.includes("primera vez") ||
    textoNormalizado.includes("nunca he usado") ||
    textoNormalizado.includes("facil") ||
    textoNormalizado.includes("faciles") ||
    textoNormalizado.includes("facil de poner")
  ) {

    const respuestas = [

      "💖 Sí. Son muy fáciles de colocar, no necesitas experiencia y puedes tenerlas listas en menos de 2 minutos.",

      "✨ No necesitas experiencia. Son ideales para principiantes y puedes colocarlas tú misma.",

      "🌸 Son súper sencillas de poner. Incluso si nunca has usado pestañas, puedes aprender rápidamente."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 13. REUTILIZACIÓN
  // =========================

  if (
    textoNormalizado.includes("reutilizar") ||
    textoNormalizado.includes("reutilizable") ||
    textoNormalizado.includes("reutilizables") ||
    textoNormalizado.includes("volver a usar") ||
    textoNormalizado.includes("volverlas a usar") ||
    textoNormalizado.includes("segundo uso") ||
    textoNormalizado.includes("tercer uso") ||
    textoNormalizado.includes("cuantas veces") ||
    textoNormalizado.includes("cuántas veces")
  ) {

    const respuestas = [

      "✨ Sí, puedes reutilizarlas hasta 3 veces. El adhesivo incluido funciona en el primer uso; después puedes usar pegante negro.",

      "💖 Puedes usarlas hasta 3 veces. El adhesivo incluido es para el primer uso y luego puedes utilizar pegante negro.",

      "🌸 Sí, son reutilizables hasta 3 veces siguiendo un buen cuidado. Después del primer uso, utiliza pegante negro."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 14. TIEMPO DE ENTREGA
  // =========================

  if (
    textoNormalizado.includes("llegar") ||
    textoNormalizado.includes("demora") ||
    textoNormalizado.includes("entrega") ||
    textoNormalizado.includes("envio") ||
    textoNormalizado.includes("envios") ||
    textoNormalizado.includes("cuando llega") ||
    textoNormalizado.includes("cuanto tarda") ||
    textoNormalizado.includes("cuanto demora") ||
    textoNormalizado.includes("interrapidisimo")
  ) {

    const respuestas = [

      "🚚 Llegan en 2 a 3 días hábiles a ciudades principales y hasta 5 días a municipios o ciudades apartadas. Enviamos por Interrapidísimo.",

      "✨ El envío tarda 2-3 días hábiles en ciudades principales y hasta 5 días en zonas apartadas. 💖 Enviamos por Interrapidísimo.",

      "📦 Enviamos por Interrapidísimo. La entrega tarda de 2 a 3 días hábiles en ciudades principales y hasta 5 días en zonas apartadas."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // 15. HIPOALERGÉNICAS
  // =========================

  if (
    textoNormalizado.includes("hipoalergenica") ||
    textoNormalizado.includes("hipoalergenicas") ||
    textoNormalizado.includes("hipoalergénica") ||
    textoNormalizado.includes("hipoalergénicas") ||
    textoNormalizado.includes("alergia") ||
    textoNormalizado.includes("alergias") ||
    textoNormalizado.includes("sensibles") ||
    textoNormalizado.includes("piel sensible") ||
    textoNormalizado.includes("ojos sensibles") ||
    textoNormalizado.includes("irritacion") ||
    textoNormalizado.includes("irritación")
  ) {

    const respuestas = [

      "✨ Sí, son hipoalergénicas y están pensadas para cuidar tu piel y tus pestañas. 💖",

      "💖 Sí, las Pestañas Flora son hipoalergénicas y están pensadas para cuidar tu piel y tus pestañas.",

      "🌸 Sí, son hipoalergénicas y están diseñadas pensando en el cuidado de tu piel y tus pestañas."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  // =========================
  // INTENCIÓN DE COMPRA
  // =========================

  if (
    textoNormalizado.includes("las quiero") ||
    textoNormalizado.includes("quiero comprar") ||
    textoNormalizado.includes("quiero unas") ||
    textoNormalizado.includes("me las llevo") ||
    textoNormalizado.includes("comprarlas") ||
    textoNormalizado.includes("comprar") ||
    textoNormalizado.includes("hacer pedido") ||
    textoNormalizado.includes("realizar pedido") ||
    textoNormalizado.includes("como compro") ||
    textoNormalizado.includes("como comprar") ||
    textoNormalizado.includes("donde pago") ||
    textoNormalizado.includes("cómo compro") ||
    textoNormalizado.includes("cómo comprar")
  ) {

    const respuestas = [

      "💖 ¡Perfecto! Puedes realizar tu pedido por Nequi, Daviplata, Bre-B o Contra Entrega. El envío es GRATIS.",

      "✨ ¡Ya casi son tuyas! Puedes pagar por Nequi, Daviplata, Bre-B o Contra Entrega.",

      "🌸 Será un gusto enviártelas. Elige entre Nequi, Daviplata, Bre-B o Contra Entrega."

    ];

    return agregarCierre(
      elegirAleatoria(respuestas),
      textoNormalizado
    );

  }


  return null;

}
// =========================
// HOME
// =========================

app.get("/", (req, res) => {

  res.send("Bot Belle & Cherie Flora activo ✅");

});


// =========================
// ENDPOINT DE MENSAJES
// =========================

app.post("/mensaje", async (req, res) => {

  try {

    const texto =
      req.body.texto ||
      req.body.mensaje ||
      req.body.message ||
      "";

    console.log("Mensaje recibido:", texto);

    // =========================
    // SIN MENSAJE
    // =========================

    if (!texto) {

      return res.json({
        respuesta: cierreCompra()
      });

    }

    // =========================
    // NORMALIZAR TEXTO
    // =========================

    const textoNormalizado =
      normalizarTexto(texto);

    console.log(
      "Texto normalizado:",
      textoNormalizado
    );

    // =========================
    // RESPUESTA DIRECTA
    // =========================

    const directa =
      respuestaDirecta(textoNormalizado);

    if (directa) {

      console.log(
        "Respuesta directa:",
        directa
      );

      return res.json({
        respuesta: directa
      });

    }

    // =========================
    // OPENAI
    // =========================

    const response =
      await openai.responses.create({

        model: "gpt-4.1-mini",

        temperature: 0.4,

        input: [

          {
            role: "system",
            content: SYSTEM_PROMPT
          },

          {
            role: "user",
            content: texto
          }

        ]

      });

    // =========================
    // RESPUESTA DE OPENAI
    // =========================

    const respuestaIA =
      response.output_text || "";

    let respuestaFinal =
      limpiarRespuesta(respuestaIA);

    // =========================
    // CONTROL DE RESPUESTA VACÍA
    // =========================

    if (!respuestaFinal) {

      respuestaFinal =
        "💖 Permíteme confirmar esa información con nuestro equipo.";

    }

    // =========================
    // LIMITAR RESPUESTA
    // =========================

    respuestaFinal =
      limitarRespuesta(respuestaFinal);

    // =========================
    // CIERRE DE COMPRA
    // =========================

    if (debeAgregarCierre(textoNormalizado)) {

      respuestaFinal =
        `${respuestaFinal}

${cierreCompra()}`;

    }

    // =========================
    // LOG FINAL
    // =========================

    console.log(
      "Respuesta OpenAI:",
      respuestaFinal
    );

    // =========================
    // RESPUESTA A MANYCHAT
    // =========================

    return res.json({

      respuesta: respuestaFinal

    });

  } catch (error) {

    console.error(
      "Error en /mensaje:",
      error
    );

    return res.json({

      respuesta:
        "💖 Permíteme confirmar esa información con nuestro equipo."

    });

  }

});
// =========================
// MANEJO GLOBAL DE ERRORES
// =========================

process.on("uncaughtException", (error) => {

  console.error(
    "Uncaught Exception:",
    error
  );

});

process.on("unhandledRejection", (error) => {

  console.error(
    "Unhandled Rejection:",
    error
  );

});


// =========================
// INICIO DEL SERVIDOR
// =========================

app.listen(PORT, () => {

  console.log("====================================");

  console.log(
    "🚀 Belle & Cherie IA iniciada"
  );

  console.log(
    "Producto: Pestañas Flora"
  );

  console.log(
    "Base de conocimiento: 15 preguntas"
  );

  console.log(
    `Puerto: ${PORT}`
  );

  console.log(
    "OpenAI conectado ✅"
  );

  console.log(
    "ManyChat conectado mediante /mensaje ✅"
  );

  console.log("====================================");

});

app.listen(PORT, () => {

  console.log("====================================");

  console.log(
    "🚀 Belle & Cherie IA iniciada"
  );

  console.log(
    "Producto: Pestañas Flora"
  );

  console.log(
    "Base de conocimiento: 15 preguntas"
  );

  console.log(
    `Puerto: ${PORT}`
  );

  console.log(
    "OpenAI conectado ✅"
  );

  console.log(
    "ManyChat conectado mediante /mensaje ✅"
  );

  console.log("====================================");

});
