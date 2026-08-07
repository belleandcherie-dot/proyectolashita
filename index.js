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

Pestañas Flora Autoadhesivas (120 piezas).

Tu personalidad es:

- Humana.
- Cercana.
- Amable.
- Experta en belleza.
- Nunca robótica.
- Nunca agresiva vendiendo.

Tu misión es resolver dudas de forma breve, clara y natural.

REGLAS IMPORTANTES

- Responde máximo en 2 líneas.
- Usa un solo emoji cuando sea natural.
- Nunca inventes información.
- Nunca cambies precios.
- Nunca inventes promociones.
- Nunca inventes medidas.
- Nunca inventes colores.
- Nunca inventes métodos de pago.
- Nunca prometas algo que no aparezca en la información oficial.

NO DIGAS:

- ¿Te interesa?
- ¿Quieres saber más?
- ¿Te gustaría?
- ¿Puedo ayudarte en algo más?
- ¿Quieres que te cuente?

No saludes.

No uses "Hola".

No escribas respuestas largas.

INFORMACIÓN OFICIAL

Empresa:
Belle & Cherie

Producto:

Pestañas Flora Autoadhesivas

Información oficial:

• Precio actual:
$74.900 COP

• Precio anterior:
$119.900 COP

• Incluye:
120 piezas

• Medidas:
8 mm
9 mm
10 mm
11 mm
12 mm

24 piezas por cada medida.

• Color:
Negro natural.

• Adhesivo:
Incluyen adhesivo transparente resistente al agua.

Puede durar hasta 7 días según el cuidado.

Después pueden reutilizarse usando pegante transparente o negro.

• Aplicación:

Se colocan debajo de las pestañas naturales.

No requieren experiencia.

Demoran menos de 2 minutos.

• Retiro:

Puede hacerse con:

- removedor
- vaselina
- desmaquillante

Siempre con suavidad.

• Tienda:

Belle & Cherie es una tienda virtual ubicada en Bogotá.

No tiene punto físico.

Hace envíos GRATIS a toda Colombia.

• Medios de pago:

Nequi

Daviplata

Bre-B

Contra entrega

Cuando no conozcas una respuesta:

Indica amablemente que ese dato debe ser confirmado con el equipo.

Nunca inventes información.

OBJETIVO

Resolver dudas.

Generar confianza.

Cuando sea apropiado, invitar naturalmente al usuario a realizar su compra utilizando los medios de pago oficiales.
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

    .replace(/^hola[\s,!.\u2764\ufe0f😊✨💕]*/gi,"")
    .replace(/^buenos dias[\s,!.\u2764\ufe0f😊✨💕]*/gi,"")
    .replace(/^buenas tardes[\s,!.\u2764\ufe0f😊✨💕]*/gi,"")
    .replace(/^buenas noches[\s,!.\u2764\ufe0f😊✨💕]*/gi,"")

    .replace(/\s{2,}/g," ")

    .replace(/\n{3,}/g,"\n\n")

    .trim();

  return texto;

}

function cierreCompra(){

const cierres=[

`💖 Puedes comprar por Nequi, Daviplata, Bre-B o Contra Entrega. ¿Qué método prefieres?`,

`✨ Si deseas realizar tu pedido puedes pagar por Nequi, Daviplata, Bre-B o Contra Entrega.`,

`🌸 Cuando decidas comprar, puedes hacerlo por Nequi, Daviplata, Bre-B o Contra Entrega.`

];

return elegirAleatoria(cierres);

}

function debeAgregarCierre(texto){

texto=normalizarTexto(texto);

return(

texto.includes("precio") ||

texto.includes("cuesta") ||

texto.includes("valor") ||

texto.includes("comprar") ||

texto.includes("pedido") ||

texto.includes("pagar") ||

texto.includes("contra entrega") ||

texto.includes("nequi") ||

texto.includes("daviplata") ||

texto.includes("bre") ||

texto.includes("envio")

);

}

function agregarCierre(respuesta,texto){

const limpio=limpiarRespuesta(respuesta);

if(!limpio){

return cierreCompra();

}

if(!debeAgregarCierre(texto)){

return limpio;

}

return `${limpio}

${cierreCompra()}`;

}
function respuestaDirecta(textoNormalizado) {

// =========================
// PRECIO
// =========================

if(

textoNormalizado.includes("precio") ||
textoNormalizado.includes("cuesta") ||
textoNormalizado.includes("valor") ||
textoNormalizado.includes("costo") ||
textoNormalizado.includes("oferta") ||
textoNormalizado.includes("74900")

){

const respuestas=[

"💖 Hoy tienen un precio especial de $74.900 (antes $119.900). Incluyen 120 piezas autoadhesivas con envío GRATIS.",

"✨ Aprovecha el precio especial de $74.900. Antes costaban $119.900 y el envío es GRATIS a toda Colombia.",

"🌸 Hoy puedes llevar tus Pestañas Flora por solo $74.900. Incluyen 120 piezas y envío GRATIS."

];

return agregarCierre(
elegirAleatoria(respuestas),
textoNormalizado
);

}

// =========================
// APLICACIÓN
// =========================

if(

textoNormalizado.includes("aplicar") ||
textoNormalizado.includes("poner") ||
textoNormalizado.includes("colocar") ||
textoNormalizado.includes("instalar") ||
textoNormalizado.includes("como se usan")

){

const respuestas=[

"✨ ¡Es muy fácil! Colócalas debajo de tus pestañas naturales con una pinza. Estarán listas en menos de 2 minutos.",

"💖 No necesitas experiencia. Solo colócalas con una pinza y en menos de 2 minutos estarán listas.",

"✨ Cualquier persona puede ponerlas. Se aplican debajo de tus pestañas naturales en menos de 2 minutos."

];

return agregarCierre(
elegirAleatoria(respuestas),
textoNormalizado
);

}

// =========================
// PEGANTE
// =========================

if(

textoNormalizado.includes("pegante") ||
textoNormalizado.includes("adhesivo") ||
textoNormalizado.includes("pegan") ||
textoNormalizado.includes("goma")

){

const respuestas=[

"✨ Incluyen un adhesivo transparente resistente al agua que puede durar hasta 7 días. Después puedes reutilizarlas con pegante.",

"💖 Ya traen adhesivo transparente resistente al agua. Luego puedes reutilizarlas usando pegante transparente o negro.",

"✨ El adhesivo ya viene incorporado y puede durar hasta 7 días según el cuidado."

];

return agregarCierre(
elegirAleatoria(respuestas),
textoNormalizado
);

}

// =========================
// RETIRAR
// =========================

if(

textoNormalizado.includes("retirar") ||
textoNormalizado.includes("quitar") ||
textoNormalizado.includes("remover") ||
textoNormalizado.includes("despegar")

){

const respuestas=[

"💖 Retíralas con removedor, vaselina o desmaquillante. Hazlo suavemente para cuidar tus pestañas.",

"✨ Puedes retirarlas fácilmente usando vaselina o desmaquillante y cuidando tus pestañas naturales.",

"🌸 Se retiran con removedor o desmaquillante. Hazlo con suavidad."

];

return agregarCierre(
elegirAleatoria(respuestas),
textoNormalizado
);

}

// =========================
// DAÑAN
// =========================

if(

textoNormalizado.includes("dañan") ||
textoNormalizado.includes("danan") ||
textoNormalizado.includes("caen") ||
textoNormalizado.includes("tumbar") ||
textoNormalizado.includes("arrancar")

){

const respuestas=[

"💖 Si las retiras correctamente con removedor o desmaquillante, tus pestañas naturales estarán protegidas.",

"✨ No dañan tus pestañas si las retiras con suavidad siguiendo las recomendaciones.",

"🌸 Con un retiro adecuado tus pestañas naturales permanecen protegidas."

];

return agregarCierre(
elegirAleatoria(respuestas),
textoNormalizado
);

}

// =========================
// MEDIDAS
// =========================

if(

textoNormalizado.includes("medidas") ||
textoNormalizado.includes("tamaño") ||
textoNormalizado.includes("mm") ||
textoNormalizado.includes("120 piezas")

){

const respuestas=[

"✨ Incluyen 120 piezas en medidas de 8 a 12 mm. Cada medida trae 24 piezas.",

"💖 Recibirás 120 piezas distribuidas entre 8 y 12 mm.",

"🌸 Incluyen cinco medidas diferentes para adaptarse a distintos estilos."

];

return agregarCierre(
elegirAleatoria(respuestas),
textoNormalizado
);

}

// =========================
// OTRAS MEDIDAS
// =========================

if(

textoNormalizado.includes("otras medidas") ||
textoNormalizado.includes("14 mm") ||
textoNormalizado.includes("15 mm") ||
textoNormalizado.includes("otro tamaño")

){

const respuestas=[

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
// COLOR
// =========================

if(

textoNormalizado.includes("cafe") ||
textoNormalizado.includes("color") ||
textoNormalizado.includes("negro")

){

const respuestas=[

"💖 Vienen en color negro natural para lograr un acabado muy natural.",

"✨ El color negro natural se integra perfectamente con tus pestañas.",

"🌸 Actualmente solo manejamos color negro natural."

];

return agregarCierre(
elegirAleatoria(respuestas),
textoNormalizado
);

}

// =========================
// UBICACIÓN
// =========================

if(

textoNormalizado.includes("ubicacion") ||
textoNormalizado.includes("direccion") ||
textoNormalizado.includes("tienda") ||
textoNormalizado.includes("local")

){

const respuestas=[

"💖 Estamos en Bogotá. Somos tienda 100% virtual y hacemos envíos GRATIS a toda Colombia.",

"✨ No tenemos punto físico. Somos una tienda virtual con envíos nacionales.",

"🌸 Operamos desde Bogotá y enviamos gratis a cualquier ciudad del país."

];

return agregarCierre(
elegirAleatoria(respuestas),
textoNormalizado
);

}

// =========================
// MÉTODOS DE PAGO
// =========================

if(

textoNormalizado.includes("nequi") ||
textoNormalizado.includes("daviplata") ||
textoNormalizado.includes("bre") ||
textoNormalizado.includes("llave") ||
textoNormalizado.includes("contra entrega") ||
textoNormalizado.includes("contraentrega") ||
textoNormalizado.includes("pagar")

){

const respuestas=[

"💖 Puedes pagar por Nequi, Daviplata, Bre-B o Contra Entrega. El envío es GRATIS.",

"✨ Aceptamos Nequi, Daviplata, Bre-B y pago Contra Entrega.",

"🌸 Elige el método que prefieras: Nequi, Daviplata, Bre-B o Contra Entrega."

];

return agregarCierre(
elegirAleatoria(respuestas),
textoNormalizado
);

}

// =========================
// DURACIÓN
// =========================

if(

textoNormalizado.includes("duran") ||
textoNormalizado.includes("duracion") ||
textoNormalizado.includes("cuanto duran") ||
textoNormalizado.includes("dias")

){

const respuestas=[

"💖 En su primer uso pueden durar hasta 7 días dependiendo del cuidado.",

"✨ Su duración puede ser de hasta 7 días siguiendo las recomendaciones.",

"🌸 Con un buen cuidado pueden durar hasta 7 días."

];

return agregarCierre(
elegirAleatoria(respuestas),
textoNormalizado
);

}

// =========================
// PRINCIPIANTES
// =========================

if(

textoNormalizado.includes("principiante") ||
textoNormalizado.includes("experiencia") ||
textoNormalizado.includes("primera vez") ||
textoNormalizado.includes("nunca he usado") ||
textoNormalizado.includes("facil")

){

const respuestas=[

"💖 Sí. Son muy fáciles de colocar y estarán listas en menos de 2 minutos.",

"✨ No necesitas experiencia. Cualquier persona puede aprender a usarlas.",

"🌸 Son ideales si es tu primera vez usando pestañas."

];

return agregarCierre(
elegirAleatoria(respuestas),
textoNormalizado
);

}

// =========================
// INTENCIÓN DE COMPRA
// =========================

if(

textoNormalizado.includes("las quiero") ||
textoNormalizado.includes("quiero") ||
textoNormalizado.includes("me interesa") ||
textoNormalizado.includes("como compro") ||
textoNormalizado.includes("como comprar") ||
textoNormalizado.includes("hacer pedido") ||
textoNormalizado.includes("comprarlas")

){

const respuestas=[

"💖 ¡Qué alegría! Puedes realizar tu pedido por Nequi, Daviplata, Bre-B o Contra Entrega. El envío es GRATIS.",

"✨ Ya casi son tuyas. Elige el método de pago que prefieras y te compartiré la información.",

"🌸 Será un gusto enviártelas. Puedes pagar por Nequi, Daviplata, Bre-B o Contra Entrega."

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

app.get("/", (req,res)=>{

res.send("Bot Belle & Cherie Flora activo ✅");

});

// =========================
// MENSAJES
// =========================

app.post("/mensaje", async(req,res)=>{

try{

const texto=

req.body.texto ||

req.body.mensaje ||

req.body.message ||

"";

console.log("Mensaje:",texto);

if(!texto){

return res.json({

respuesta:cierreCompra()

});

}

const textoNormalizado=

normalizarTexto(texto);

const directa=

respuestaDirecta(textoNormalizado);

if(directa){

console.log("Respuesta directa");

return res.json({

respuesta:directa

});

}

const response=

await openai.responses.create({

model:"gpt-4.1-mini",

temperature:0.4,

input:[

{

role:"system",

content:SYSTEM_PROMPT

},

{

role:"user",

content:texto

}

]

});

const respuestaIA=

response.output_text || "";

const respuestaFinal=

agregarCierre(

respuestaIA,

textoNormalizado

);

console.log("IA:",respuestaFinal);

return res.json({

respuesta:respuestaFinal

});

}catch(error){

console.error(error);

return res.json({

respuesta:cierreCompra()

});

}

});

// =========================
// LIMPIEZA FINAL
// =========================

function limitarRespuesta(texto){

if(!texto) return "";

texto=String(texto).trim();

if(texto.length<=220){

return texto;

}

return texto.substring(0,220).trim()+"...";

}

// =========================
// MANEJO GLOBAL DE ERRORES
// =========================

process.on("uncaughtException",(err)=>{

console.error("Uncaught Exception:",err);

});

process.on("unhandledRejection",(err)=>{

console.error("Unhandled Rejection:",err);

});

// =========================
// LISTEN
// =========================

app.listen(PORT,()=>{

console.log("====================================");

console.log("🚀 Belle & Cherie IA iniciada");

console.log("Producto: Pestañas Flora");

console.log(`Puerto: ${PORT}`);

console.log("OpenAI conectado ✅");

console.log("====================================");

});
