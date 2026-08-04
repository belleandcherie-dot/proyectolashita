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
Eres Jessi ❤️, una asistente humana, cálida, experta en belleza, amigable y cercana que responde dudas por WhatsApp sobre las "pestañas Flora .

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
- NO digas que somos tienda  física.

INFORMACIÓN REAL:
- El producto es un Set de Pestañas Flora, el cual trae 120 piezas de pestañas de medidas entre 8 mm a 12 mm.
- El SEt incluye las 120 piezas, No incluye Pinzas.
- Las pestañas son autoadhesivas.
- Realizamos envios a cualqueir ciudad de Colombia.
- Tenemos diferentes metodos de pago como Pago por Nequi / DAviplata o Pago contraentrega.
- Las pestañas son Naturales, livianes , hermosas y faciles de poner en menso de 2 minutos.
-No tenemos tienda fisica, somos tienda virtual y envios a cualqueir ciudad del pais.
- El precio de oferta de este producto es de $74,900 , el precio anterior es de $109,900.
- Las pestañas incluyen un pegante en la base para que sean de fácil  de aplicar aplicando sobre la raiz de la pestaña .
-Se aplican o se ponen con una pinza acercando  la base de la pieza , la cual ya trae pegante sobre las base y solo necesitas acomdar , y fijar para asegurar una correcta aplicacion, de igual forma trae instrucciones. 
-REalizamos envios por medio de "Interrapidisimo" y las pestañas estan lelgando entre 2 a 3 dias para principales ciudades y entre 3 a 5 dias para ciudades o municipios.
- Para ordenar las pestañas selecciona. la forma de pago y sigue las instrucciones.
- El precio de venta  de las pestañas es:
  - 74.000  cop  Solo hoy- Precio de Lanzamiento
  - El precio regular de las pestañas  es de $109.900 COP


OBJETIVO:
Después de resolver la duda de forma amable y humana, dirige suavemente a la persona al pago de las "Pestañas Flota Set 120 Piezas":
- transferencia Bre-b (Llave)
- Pago en Nequi/Daviplata
- Contraentrega

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
    `💌 Puedes adquirir las pestañas po transferencia bancaria(Bre-b) o Pago por Nequi/Daviplata✨

¿Cuál método prefieres? 🩷`,

    `💌 Si deseas comprar nuestras Pestañas Flora , puedes hacerlo por transferencia bancaria(Bre-b) o Pago por Nequi/Daviplata ✨

¿Qué método prefieres? 🩷`,

    `💌 Para obtenerlas Pestañas Flora  puedes elegir transferencia bancaria(Bre-b) o Pago por Nequi/Daviplata ✨



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
      `Incluye  120 Piezas de Pestañas , estas ya traen el adhesivo en la base. No necesitas pegante ... No incluye la pinza, pero puedes aplicarlas con cualqueir pinza .🌿.`,

      `Recibirás el Set de Pestañas  y confirmando  tu compra en los proximos 15 miunutos , recibiras gratis unas plantillas de mapping digitales y recursos adicionales para mejorar tu técnica.🥰`,

      `Las pestañas  reúne todo lo necesario para  elevar la mirada 120 piezas Con Rizo Tipo C , de medidas entre 8 a 10 mm.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasTrae));
  }

  if (
    textoNormalizado.includes("envio") ||
    textoNormalizado.includes("enviar") ||
    textoNormalizado.includes("entrega") ||
    textoNormalizado.includes("fisico") ||
    textoNormalizado.includes("pdf") ||
    textoNormalizado.includes("dias") ||
    textoNormalizado.includes("descargar") ||
    textoNormalizado.includes("demora") ||
    textoNormalizado.includes("pense") ||
    textoNormalizado.includes("ubicacion") ||
    textoNormalizado.includes("donde") ||
    textoNormalizado.includes("pense")
  ) {
    const respuestasEnvio = [
      `El Set de Pestañas es uno de nuestros productos mas vendidos 😊

Para procesar la orden, confirmanos los datos de envio que te solicitamos , recuerda que puedes pagar por Nequi/Daviplata , Llave o contra entrega.El precio de Oferta es $74,900 (ENVIO GRATIS)🌿`,

      `El material NO  físico 🙏

Recibirás las pestañas  (120 Piezas) Entre 8 mms a 12 mms ,a la direccion que nos entregues , No entregamos en Oficinas de interrapidisimo ,o ordena directamente  en nuetra tienda web www.Belleandcherie.com✨`,

      `Tan pronto nos envíen el comprobante de tu pago 😊

Junto con los datos para la entrega ,Te enviaremos la orden al correo  ,No entregamos en Oficinas de interrapidisimo. El precio de Oferta es $74,900 Envio Gratis . Pidelas por Whatsapp u ordena directamente  en nuetra tienda web www.Belleandcherie.com✨🌿`,

      `La Pestañas elevan realmente tu mirada sin perder tiempo ni gastar mucho dinero😊

Tan pronto nos envíen el comprobante de tu pago 😊

Junto con los datos para la entrega ,Te enviaremos la orden al correo  ,No entregamos en Oficinas de interrapidisimo. El precio de Oferta es $74,900 Envio Gratis . Pidelas por Whatsapp u ordena directamente  en nuetra tienda web www.Belleandcherie.com✨ ✨`,
    ];

    return agregarCierre(elegirAleatoria(respuestasEnvio));
  }

  if (
    textoNormalizado.includes("Pagar") ||
    textoNormalizado.includes("precio") ||
    textoNormalizado.includes("costo") ||
    textoNormalizado.includes("Formas") ||
    textoNormalizado.includes("pedir") ||
    textoNormalizado.includes("precio") ||
    textoNormalizado.includes("cuesta") ||
    textoNormalizado.includes("compro") ||
    textoNormalizado.includes("transferir") ||
    textoNormalizado.includes("pagar") ||
    textoNormalizado.includes("pago")
  ) {
    const respuestasPago = [
      `Puedes pagar por Nequi, Daviplata, transferencia o Bre-B. 
💖 *SOLO HOY* 🔥
OBtenlas por *$74.900 COP* 
~(Antes $109.900 COP)~  _Ultimas 7 unidades_ `,

      `Para Ordenar las pestañas puedes pagar: 😊

Muy sencillo: Nequi/Daviplata o Llave, envías el soporte por WhatsApp y creamos tu orden:
💖 *SOLO HOY* 🔥
Puedes Tenerlas  por *$74.900 COP* 
~(Antes $109.900 COP) _Ultimas 7 unidades_ `,

      `Aceptamos varios medios de pago COL: Nequi/ Daviplata o Contraentrega.
Crearemos la orden , tan pronto nos confirmes los datos de envio-💖 
*SOLO HOY* 🔥
Puedes tenerlas por *$74.900 COP*  _Ultimas 7 unidades_
~(Antes $109.900 COP)`,
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
