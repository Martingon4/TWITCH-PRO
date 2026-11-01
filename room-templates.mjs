const environments = new Set(["underwater", "space", "haunted", "jungle"]);

const templates = [
  {
    id: "space", label: "Nave espacial", keywords: /espaci|planeta|nave|luna|galax|astronaut|orbita|órbita|cohete|alien/,
    title: "La Nave sin Retorno", environment: "space", place: "una nave a la deriva",
    story: "Los motores se apagaron y la nave está perdiendo rumbo. El chat debe descifrar tres controles y reactivar la ruta antes de que se agote la energía.",
    clues: [
      ["consola", "La secuencia de la consola es 2, 6, 12, 20… ¿qué cifra ocupa las unidades del siguiente valor?", "Las diferencias son 4, 6 y 8; continúa el patrón antes de mirar las unidades.", "0"],
      ["radar", "El radar marca tres sectores: A=2, B tiene el triple que A y C tiene 5 menos que B. ¿Qué cifra queda en C?", "Calcula primero B y después resta 5.", "1"],
      ["motor", "El motor completa una vuelta cada 8 minutos. Si inició a las 14:00, ¿qué cifra ocupa las unidades de los minutos transcurridos al completar 3 vueltas?", "Tres vueltas duran 24 minutos; toma las unidades de esa cantidad.", "4"],
    ], code: "014",
  },
  {
    id: "mansion", label: "Mansión misteriosa", keywords: /fantasma|embruj|castillo|cripta|vampir|terror|mansión|mansion|hotel|casa/,
    title: "La Mansión de las Tres Llaves", environment: "haunted", place: "una mansión que cambia de pasillos",
    story: "La salida desaparece cada vez que suena el reloj. El chat debe encontrar tres llaves y descubrir qué puerta sigue siendo real.",
    clues: [
      ["reloj", "El reloj se atrasó 3 minutos por hora durante 2 horas. Estaba correcto a las 9:00. ¿Qué cifra ocupan las unidades de los minutos que marca ahora?", "Calcula cuánto se atrasó en total y réstalo a la hora inicial.", "4"],
      ["retrato", "En una fila hay 11 retratos. El primero y el último son falsos; de los demás, cada tercero es falso. ¿Cuántos retratos auténticos quedan?", "Entre las posiciones 2 y 10, identifica las que son múltiplos de 3 y réstalas del total.", "6"],
      ["llave", "Tres llaves pesan 2, 5 y 8 gramos. La llave correcta pesa más que la mediana. ¿Qué cifra indica su peso?", "Ordena los pesos y compara cada uno con el valor central.", "8"],
    ], code: "468",
  },
  {
    id: "jungle", label: "Templo en la jungla", keywords: /bosque|jungla|selva|templo|isla|jardín|jardin|ruina|pirata/,
    title: "El Templo de la Lluvia", environment: "jungle", place: "un templo cubierto por la selva",
    story: "La lluvia está llenando el templo y las compuertas se cerrarán pronto. El chat tiene que interpretar sus símbolos para abrir la salida elevada.",
    clues: [
      ["estela", "Una estela muestra 1, 4, 9, 16… ¿qué cifra ocupa las unidades del siguiente número?", "Son cuadrados consecutivos; encuentra el siguiente y toma sus unidades.", "5"],
      ["cuenco", "Cuatro cuencos contienen 3, 5, 7 y 9 semillas. Se retira la misma cantidad de cada cuenco y quedan 16 en total. ¿Qué cifra se retiró de cada uno?", "Los cuencos sumaban 24 semillas. Divide lo retirado entre los cuatro.", "2"],
      ["compuerta", "La compuerta sube 3 peldaños y baja 1 en cada ciclo. ¿En qué cifra de altura estará tras 4 ciclos si parte del nivel 0?", "Cada ciclo suma dos peldaños netos.", "8"],
    ], code: "528",
  },
  {
    id: "lab", label: "Laboratorio secreto", keywords: /laboratorio|experimento|virus|robot|quím|quim|cient|fórmula|formula/,
    title: "Protocolo Prisma", environment: "space", place: "un laboratorio aislado",
    story: "El protocolo automático bloqueó el laboratorio y mezcló las etiquetas. El chat debe recomponer tres lecturas para cancelar el cierre.",
    clues: [
      ["muestra", "Una muestra duplica su cantidad cada minuto. A los 6 minutos llena el frasco. ¿En qué minuto estaba a la mitad?", "Si se duplica cada minuto, retrocede exactamente un minuto desde el frasco lleno.", "5"],
      ["balanza", "Dos tubos y una ampolla pesan 17 g. Cada tubo pesa 6 g. ¿Qué cifra corresponde al peso de la ampolla?", "Resta el peso de los dos tubos al total.", "5"],
      ["panel", "El panel alterna 2, 3, 5, 8, 12… ¿qué cifra ocupa las unidades del siguiente número?", "Las diferencias aumentan de uno en uno: +1, +2, +3, +4…", "7"],
    ], code: "557",
  },
  {
    id: "underwater", label: "Base submarina", keywords: /mar|submar|océano|oceano|agua|buce|naufrag|acuario/,
    title: "La Base Abisal", environment: "underwater", place: "una base submarina",
    story: "La presión exterior activó el cierre de emergencia. El chat debe equilibrar la base y abrir la escotilla antes de que se corte la energía.",
    clues: [
      ["sonar", "El sonar registra 3, 7, 13, 21… ¿qué cifra ocupa las unidades del siguiente eco?", "Las diferencias son 4, 6 y 8; sigue el patrón.", "1"],
      ["valvula", "Una válvula libera 4 litros por minuto. ¿Qué cifra de litros habrá liberado en 3 minutos y medio?", "Calcula primero los litros de 3 minutos; medio minuto es la mitad de 4.", "4"],
      ["escotilla", "La escotilla requiere 24 giros repartidos por igual entre 4 manivelas. ¿Cuántos giros corresponden a cada una?", "Divide el total de giros entre las manivelas.", "6"],
    ], code: "146",
  },
  {
    id: "museum", label: "Museo de noche", keywords: /museo|arte|cuadro|galería|galeria|exhibición|exhibicion|reliquia/,
    title: "La Última Sala del Museo", environment: "haunted", place: "un museo cerrado de noche",
    story: "Una pieza desapareció y las puertas se sellaron. El chat debe ordenar las pistas de la exposición para identificar la vitrina que libera la salida.",
    clues: [
      ["vitrina", "Hay 15 piezas. Se apartan 3 falsas y luego se agrupan las auténticas en pares. ¿Qué cifra indica cuántas parejas completas hay?", "Resta las falsas; divide las restantes entre dos.", "6"],
      ["mapa", "En el mapa, la sala 2 conecta con 5; la 5 con 8; la 8 con 11. ¿Qué cifra ocupa las unidades de la siguiente sala?", "Las salas avanzan de tres en tres.", "4"],
      ["estatua", "Una estatua mira al norte. Gira 90° a la derecha, luego 180° y después 90° a la izquierda. ¿Cuántos grados habrá girado en total? Da la cifra de las centenas.", "Suma los giros aunque algunos cambien la dirección final.", "3"],
    ], code: "643",
  },
  {
    id: "arctic", label: "Estación polar", keywords: /nieve|hielo|árt|artic|polar|antárt|antart|glaciar|invierno/,
    title: "La Estación Cero", environment: "space", place: "una estación de investigación polar",
    story: "La tormenta cortó las comunicaciones y congeló el generador. El chat debe restaurar tres sistemas antes de que llegue la noche polar.",
    clues: [
      ["termometro", "La temperatura baja 4° cada hora. Si empezó en 8° y pasaron 3 horas, ¿qué cifra muestra el valor absoluto de la temperatura?", "Resta tres veces cuatro a ocho; toma el valor sin signo.", "4"],
      ["radio", "La radio repite cada 6 minutos. Si son las 10:00, ¿qué cifra ocupa las unidades de los minutos después de 5 repeticiones?", "Cinco repeticiones son 30 minutos.", "0"],
      ["generador", "El generador entrega 30 unidades a 5 refugios por igual. Cada refugio usa 2 unidades. ¿Qué cifra indica cuántas le quedan a cada uno?", "Divide primero y luego resta el consumo de cada refugio.", "4"],
    ], code: "404",
  },
  {
    id: "festival", label: "Festival en caos", keywords: /festival|concierto|escenario|música|musica|stream|directo|programa|televisión|television|show/,
    title: "En Vivo: Señal Perdida", environment: "jungle", place: "un festival con la señal en riesgo",
    story: "La transmisión está a punto de caerse y el escenario quedó a oscuras. El chat debe sincronizar el equipo técnico para recuperar la señal en vivo.",
    clues: [
      ["mezcladora", "La mezcladora recibe canales en grupos de 3: primero 3, luego 6, 9… ¿qué cifra ocupa las unidades del total en el sexto grupo?", "Multiplica el número de canales por la posición del grupo.", "8"],
      ["reflector", "Cinco reflectores consumen 35 unidades. Uno se apaga y el consumo restante se reparte por igual entre 4. ¿Qué cifra consume cada uno?", "Quita primero el reflector apagado: cada uno consumía 7.", "7"],
      ["microfono", "Una canción dura 3 minutos y 45 segundos. ¿Qué cifra representa los segundos que sobran al completar 4 minutos?", "Calcula la diferencia entre 4:00 y 3:45.", "5"],
    ], code: "875",
  },
  {
    id: "generic", label: "Aventura sorpresa", keywords: /./,
    title: "El Enigma de la Cámara", environment: "underwater", place: "una cámara de escape",
    story: "Una cámara sellada ha mezclado sus mecanismos. El chat debe analizar tres pistas y coordinarse para encontrar la combinación de salida.",
    clues: [
      ["secuencia", "La secuencia es 4, 9, 16, 25… ¿qué cifra ocupa las unidades del siguiente valor?", "Son cuadrados consecutivos: 2², 3², 4², 5²…", "6"],
      ["balanza", "Dos cajas iguales y una pieza de 3 kg pesan 15 kg. ¿Qué cifra representa el peso de cada caja?", "Resta la pieza del total y divide el resto entre dos.", "6"],
      ["candado", "Un candado avanza 2 números por giro. Parte del 1; ¿qué cifra marca después de 4 giros?", "Suma cuatro avances de dos al número inicial.", "9"],
    ], code: "669",
  },
];

export function listRoomTemplates() {
  return templates.map(({ id, label }) => ({ id, label }));
}

export function buildTemplateRoom(theme = "Aventura sorpresa", requestedId = "") {
  const cleanTheme = String(theme).replace(/[<>\u0000-\u001f]/g, " ").trim().slice(0, 120) || "Aventura sorpresa";
  const normalized = cleanTheme.toLocaleLowerCase("es");
  const template = templates.find((entry) => entry.id === requestedId)
    || templates.find((entry) => entry.id !== "generic" && entry.keywords.test(normalized))
    || templates.find((entry) => entry.id === "generic");
  const cleanShort = cleanTheme.slice(0, 64);
  const title = ["aventura sorpresa", template.label.toLocaleLowerCase("es")].includes(cleanTheme.toLocaleLowerCase("es")) ? template.title : `${template.title}: ${cleanShort}`.slice(0, 74);
  const clues = {};
  for (const [index, id] of ["reloj", "estatua", "antorcha"].entries()) {
    const [name, riddle, hint, digit] = template.clues[index];
    clues[id] = {
      name: name.toLocaleUpperCase("es"), digit, answer: digit, riddle,
      hint,
      caption: `Pista de ${name}: resuelve el acertijo y usa !resolver ${name} [respuesta].`,
    };
  }
  const customContext = cleanTheme.toLowerCase() === "aventura sorpresa" ? "" : ` La situación propuesta por la comunidad es: «${cleanShort}».`;
  return {
    title, theme: cleanTheme, summary: `${template.story}${customContext} El chat resuelve tres acertijos y reúne sus cifras para abrir la salida.`,
    opening: `Escenario: ${template.place}.${customContext} Examinen los objetos, resuelvan sus acertijos y escriban !codigo [código] para escapar.`,
    environment: environments.has(template.environment) ? template.environment : "underwater",
    clues, code: template.code, source: "plantilla", templateId: template.id, templateLabel: template.label,
  };
}
