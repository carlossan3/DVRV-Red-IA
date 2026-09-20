---
title: "U02 — Multijugador en tiempo real, ownership y sincronización"
---

## Apuntes de referencia

**Proyecto:** `Pong NGO`

**Tecnología:** Unity 2D + C# + Netcode for GameObjects

---


## Bloque I — Introducción

Este bloque presenta el propósito de la unidad, los aprendizajes esperados, su relación con los Resultados de Aprendizaje y el producto que se construirá.

### 1. Propósito de la UT

En UT01 aprendiste a crear una sesión básica con Host y Client, PlayerObjects, ownership, `NetworkVariable` y UI local.

UT02 añade una dificultad nueva:

> **un juego en tiempo real no espera a que todo esté tranquilo para sincronizarse.**

En Pong hay movimiento continuo, física, colisiones, goles, marcador, reinicio y dos instancias ejecutándose al mismo tiempo. Esto obliga a decidir cuidadosamente:

- qué controla cada cliente;
- qué debe sincronizarse;
- quién simula la pelota;
- qué es estado persistente;
- qué es evento puntual;
- cuándo usar `NetworkTransform`;
- cuándo usar `NetworkVariable`;
- cuándo usar RPC;
- cómo probar y diagnosticar en varias ventanas.

---

### 2. Qué vas a ser capaz de hacer

Al terminar esta UT podrás:

- leer un proyecto Pong local y separar responsabilidades;
- convertir un proyecto local en un proyecto network-aware;
- decidir qué GameObjects necesitan `NetworkObject`;
- usar `NetworkBehaviour` en scripts de juego;
- filtrar input con `IsOwner`;
- distinguir owner y proxy remoto;
- sincronizar palas con `NetworkTransform`;
- explicar por qué la pelota no debe simularse independientemente en cada cliente;
- implementar o verificar una pelota autoritativa;
- usar `NetworkVariable` para marcador o estado de ronda;
- usar `[Rpc]` para comunicaciones puntuales;
- hacer spawn/despawn de una pelota de red;
- coordinar ronda, punto y reinicio;
- manejar desconexiones básicas;
- observar efectos de latencia/pérdida;
- diagnosticar fallos distribuidos.

---

### 3. RA y CE relacionados

#### RA2 — Verificación y configuración de programación en red en el motor

En esta UT trabajas especialmente:

- objetos de red;
- scripts de red;
- sincronización de transformaciones;
- variables sincronizadas;
- componentes de red;
- parámetros de configuración.

En lenguaje práctico:

> debes poder demostrar que el Pong funciona con dos instancias y que sabes explicar qué componente de red resuelve cada problema.

#### RA1 — Fundamentos cliente-servidor

También refuerzas:

- envío/recepción de información;
- comunicación entre usuarios;
- cambios de estado;
- ejecución remota;
- modelo cliente-servidor.

---

### 4. Producto final

El producto será un **Pong multijugador local/multiinstancia**:

- una instancia se inicia como Host;
- otra se conecta como Client;
- cada jugador controla solo su pala;
- la pala remota se ve sincronizada;
- la pelota tiene una autoridad clara;
- los goles modifican un marcador común;
- la ronda se reinicia de forma coordinada;
- la desconexión no deja estado incoherente;
- se puede explicar y depurar con logs.

En esta unidad la comunicación se prueba en entorno local/multiinstancia. Los servicios online como Relay o Lobby se estudian más adelante.

---

### 5. Prerrequisitos

Debes recordar de UT01:

- `NetworkManager`;
- `UnityTransport`;
- Host y Client;
- `NetworkObject`;
- `NetworkBehaviour`;
- PlayerObject;
- `OwnerClientId`;
- `IsOwner`;
- `NetworkVariable`;
- `OnValueChanged`;
- UI local frente a estado sincronizado;
- `OnNetworkSpawn()` y `OnNetworkDespawn()`;
- diagnóstico por hipótesis.

También debes manejar de Unity 2D:

- `Transform`;
- `Rigidbody2D`;
- `Collider2D`;
- `OnCollisionEnter2D` o eventos equivalentes;
- prefabs;
- escena;
- Inspector.

---


## Bloque II — Del Pong local al modelo de red

Este bloque parte del Pong local para decidir qué elementos necesitan red, qué responsabilidades conserva cada objeto y qué estado debe ser compartido.

### 6. Proyecto inicial de Pong NGO

El proyecto inicial de UT02 parte de una escena semejante a:

```text
Assets/
├── Escenas/
│   └── UT02_PongNGO.unity
├── Prefabs/
│   ├── PalaJugador.prefab
│   └── Pelota.prefab
├── Scripts/
│   ├── Red/
│   ├── Juego/
│   └── Interfaz/
└── Documentacion/
```

El proyecto inicial contiene:

- escena 2D con límites;
- palas o posiciones de spawn;
- pelota local o prefab preparado;
- UI de marcador;
- launcher Host/Client reutilizable o equivalente;
- paquetes de NGO/UTP/MPPM;
- sin solución completa de red.



---

### 7. Lectura inicial del Pong local

Antes de añadir red, hay que entender el juego local.

#### Elementos mínimos

| Elemento | Responsabilidad local |
|---|---|
| Pala izquierda | moverse verticalmente |
| Pala derecha | moverse verticalmente |
| Pelota | moverse, rebotar y cruzar límites |
| Límites superior/inferior | provocar rebote |
| Zona de gol izquierda/derecha | detectar punto |
| Marcador | representar puntuación |
| Controlador de juego | iniciar, reiniciar y coordinar ronda |

Si el Pong local no funciona, la red solo hará más difícil encontrar el error.

---

### 8. Responsabilidades antes de poner red

Completa mentalmente esta pregunta para cada elemento:

> ¿este objeto necesita existir como objeto de red o solo representar algo local?

Ejemplo:

| Elemento | ¿Necesita red? | Motivo |
|---|---|---|
| Pala de jugador | sí | debe ser visible y controlada por un jugador |
| Pelota | sí | ambos deben verla igual |
| Marcador | sí como estado, no como UI | el valor debe coincidir |
| Texto del marcador | no como objeto de red | cada ventana puede pintarlo localmente |
| Sonido de rebote | depende | puede derivarse localmente o notificarse |
| Cámara | normalmente no | puede ser local |

---


## Bloque III — Objetos de red, ownership y movimiento

Este bloque introduce los componentes de NGO necesarios para representar palas y pelota, controlar el input local y sincronizar movimiento.

### 9. `NetworkObject` en Pong

Un GameObject que participa en el mundo de red necesita `NetworkObject`.

En Pong suele aplicarse a:

- Player/Pala Prefab;
- Pelota Prefab;
- quizá un Game Controller de red, si gestiona estado compartido.

No se aplica a todo. Por ejemplo, el texto del marcador no necesita ser `NetworkObject` si se actualiza localmente desde un estado sincronizado.

---

### 10. `NetworkBehaviour` en Pong

Un script hereda de `NetworkBehaviour` cuando necesita:

- `IsOwner`;
- `IsServer`;
- `OwnerClientId`;
- `OnNetworkSpawn()`;
- `OnNetworkDespawn()`;
- `NetworkVariable`;
- RPC;
- spawn/despawn de objetos de red.

Ejemplo de clase de pala:

```csharp
using Unity.Netcode;
using UnityEngine;

public class NetworkPaddleController : NetworkBehaviour
{
    [SerializeField] private float velocidad = 6f;

    private void Update()
    {
        if (!IsOwner)
        {
            return;
        }

        float y = Input.GetAxisRaw("Vertical");
        transform.position += Vector3.up * y * velocidad * Time.deltaTime;
    }
}
```

La idea no es que este sea el código final perfecto, sino ver el patrón:

```text
si no soy owner → no leo input
```

---

### 11. Ownership aplicado al input

En un juego local, todos los scripts pueden leer teclado.  
En multijugador, eso puede causar un error típico:

> una instancia controla más de una pala.

Solución:

```csharp
if (!IsOwner)
{
    return;
}
```

Esto impide que la instancia lea input para objetos que son proxies remotos.

#### Tabla de interpretación

| Propiedad | Significado |
|---|---|
| `OwnerClientId` | cliente propietario del objeto |
| `IsOwner` | este objeto pertenece al cliente local |
| `IsServer` | esta instancia ejecuta servidor |
| `IsClient` | esta instancia ejecuta cliente |
| `IsHost` | esta instancia es servidor + cliente local |

`IsOwner=True` no significa “soy servidor”. Significa “este objeto es mío desde esta instancia”.

---

### 12. Movimiento de palas y `NetworkTransform`

Una pala se mueve de forma continua. El otro jugador debe verla.

Para este tipo de problema puede usarse `NetworkTransform`.

`NetworkTransform` sincroniza transformaciones, pero debes preguntarte:

- ¿qué ejes realmente cambian?
- ¿necesito sincronizar rotación?
- ¿necesito sincronizar escala?
- ¿qué frecuencia/coste es razonable?
- ¿quién es la autoridad de esa transformación?

En Pong 2D, una pala normalmente solo cambia en Y. Sin embargo, el componente puede ofrecer opciones generales. Hay que configurarlo con criterio.

---

### 13. No sincronices por costumbre

Un error frecuente es activar toda sincronización posible porque “así seguro que funciona”.

Problema:

- envía datos innecesarios;
- dificulta diagnosticar;
- puede ocultar malas decisiones de arquitectura.

Pregunta útil:

> ¿Qué es lo mínimo que el otro cliente necesita para ver el juego correctamente?

---


## Bloque IV — Autoridad, física y estado compartido

Este bloque estudia por qué la física necesita una autoridad clara y cómo distinguir estado persistente de eventos puntuales.

### 14. Pelota: por qué la autoridad importa

La pelota de Pong parece sencilla, pero es peligrosa en red.

Si Host y Client simulan la pelota por separado:

- pequeñas diferencias de tiempo producen posiciones distintas;
- una colisión puede ocurrir en una instancia y no en otra;
- el marcador puede cambiar de forma distinta;
- el juego deja de tener una verdad común.

Por eso la pelota debe tener una autoridad clara.

En esta UT se recomienda:

> el servidor/Host simula la pelota y el resto observa el estado replicado.

---

### 15. Física 2D y red

La física local depende del tiempo de simulación y de colisiones locales.  
En red, no conviene que dos clientes decidan por separado el resultado de una física compartida.

Para UT02, estrategia simple:

- `Rigidbody2D` de la pelota se simula en servidor;
- clientes no aplican fuerzas propias a la pelota;
- la posición/estado observable se replica;
- goles y reinicio los decide la autoridad.

No se introduce rollback ni predicción avanzada.

---

### 16. Estado persistente y evento puntual

En Pong aparecen ambos.

#### Estado persistente

Debe poder reconstruirse.

Ejemplos:

- puntuacion izquierdo;
- puntuacion derecho;
- estado de ronda;
- quién saca;
- si la pelota está activa.

#### Evento puntual

Ocurre en un instante.

Ejemplos:

- “se ha pulsado listo”;
- “reproducir sonido de rebote”;
- “solicitar saque”;
- “mostrar efecto de gol”.

Regla:

```text
si un cliente que entra tarde necesita conocerlo → probablemente es estado
si solo ocurre una vez y no necesita persistir → probablemente es evento
```

---

### 17. `NetworkVariable` para marcador

El marcador debe coincidir.

Ejemplo:

```csharp
using Unity.Netcode;

public class NetworkScore : NetworkBehaviour
{
    public NetworkVariable<int> LeftScore = new(0);
    public NetworkVariable<int> RightScore = new(0);
}
```

Por defecto, en un diseño servidor autoritativo, el servidor escribe y los clientes leen.

```csharp
if (IsServer)
{
    LeftScore.Value++;
}
```

La UI se actualiza localmente:

```csharp
LeftScore.OnValueChanged += AlCambiarPuntuacion;
RightScore.OnValueChanged += AlCambiarPuntuacion;
```

y se aplica el valor actual al iniciar la vista.

---

### 18. UI local del marcador

No necesitas sincronizar el texto UI.

Patrón:

```text
NetworkVariable<int> cambia
→ OnValueChanged se ejecuta
→ cada instancia actualiza su texto local
```

Ejemplo simplificado:

```csharp
private void AlCambiarPuntuacion(int previous, int current)
{
    scoreText.text = $"{LeftScore.Value} - {RightScore.Value}";
}
```

Esto mantiene separadas dos cosas:

- estado real compartido;
- representación visual local.

---


## Bloque V — RPC, spawn/despawn y coordinación de ronda

Este bloque explica las comunicaciones puntuales mediante RPC, el ciclo de vida de la pelota de red y la coordinación de las transiciones de ronda.

### 19. RPC actual en NGO

En NGO 2.x se recomienda el atributo general `[Rpc]`.

Ejemplo de petición al servidor:

```csharp
using Unity.Netcode;

public class ReadyButton : NetworkBehaviour
{
    [Rpc(SendTo.Server)]
    private void RequestReadyRpc()
    {
        Debug.Log("El servidor ha recibido una intención de ready.");
    }

    public void OnReadyButtonPressed()
    {
        if (!IsOwner)
        {
            return;
        }

        RequestReadyRpc();
    }
}
```

Ejemplo de notificación a clientes y Host:

```csharp
[Rpc(SendTo.ClientsAndHost)]
private void PlayBounceFeedbackRpc()
{
    // Reproducir sonido o efecto local.
}
```

Idea clave:

- RPC sirve para acciones o notificaciones puntuales;
- `NetworkVariable` sirve para estado persistente.

---

### 20. No uses RPC para todo

Si usas RPC para el marcador, un cliente que se conecte tarde podría perder el historial de eventos y no saber el puntuacion actual.

Por eso:

- puntuacion → `NetworkVariable`;
- turno/estado de ronda → `NetworkVariable`;
- sonido de rebote → RPC o efecto local;
- solicitud de saque/listo → RPC al servidor;
- posición de pala → `NetworkTransform` o solución de sincronización de transform.

---

### 21. Spawn y despawn de la pelota

La pelota no tiene por qué existir siempre.

Puede crearse al comenzar ronda y retirarse al terminar.

El servidor puede hacer:

```csharp
[SerializeField] private NetworkObject prefabPelota;

private NetworkObject currentBall;

private void CrearPelota()
{
    if (!IsServer)
    {
        return;
    }

    currentBall = Instantiate(prefabPelota, Vector3.zero, Quaternion.identity);
    currentBall.Spawn();
}
```

Y para retirar:

```csharp
private void RetirarPelota()
{
    if (!IsServer || currentBall == null)
    {
        return;
    }

    currentBall.Despawn();
    currentBall = null;
}
```

El prefab debe estar registrado como Network Prefab donde la versión de NGO lo requiera.

---

### 22. Estado de ronda

Un Pong simple puede tener una máquina de estados:

```text
Waiting → Playing → PointScored → Resetting → Playing
```

Ejemplo de enum:

```csharp
public enum RoundState
{
    Waiting,
    Playing,
    PointScored,
    Resetting
}
```

Para sincronizarlo puedes usar un tipo entero:

```csharp
public NetworkVariable<int> RoundStateValue = new((int)RoundState.Waiting);
```

O una solución equivalente compatible con tu versión de NGO.

El servidor cambia el estado. La UI de cada cliente lo representa.

---

### 23. Flujo de punto

Ejemplo:

```text
pelota cruza límite derecho
→ servidor detecta gol
→ servidor incrementa LeftScore
→ servidor cambia RoundState a PointScored
→ servidor despawnea pelota
→ clientes actualizan UI
→ servidor prepara reset
→ servidor spawnea nueva pelota
→ RoundState vuelve a Playing
```

Este flujo evita que cada cliente decida por separado el marcador.

---


## Bloque VI — Desconexión, condiciones de red y diagnóstico

Este bloque se centra en desconexiones, latencia, jitter, pérdida, logs por rol y un método sistemático de diagnóstico.

### 24. Desconexión

En red hay que diseñar qué ocurre cuando alguien sale.

Casos:

- Client abandona antes de empezar;
- Client abandona durante Playing;
- Host apaga la sesión;
- desconexión inesperada;
- intento de reconectar.

En UT02 basta con comportamiento seguro:

- registrar desconexión;
- detener o pausar la ronda;
- retirar pelota si procede;
- mostrar estado seguro en UI;
- no dejar objetos fantasma;
- permitir reiniciar la prueba.

---

### 25. Latencia, jitter y pérdida en Pong

Pong es sensible a red degradada.

#### Latencia

Puede hacer que la pala remota parezca retrasada.

#### Jitter

Puede provocar movimiento irregular.

#### Pérdida

Puede causar saltos o eventos que parecen no ocurrir.

#### Comparación

| Elemento | Síntoma probable |
|---|---|
| pala remota | retraso o saltos |
| pelota | divergencia si está mal diseñada |
| marcador | no debe quedar incoherente |
| sonido/evento | puede perderse o llegar tarde según diseño |
| input | sensación de falta de respuesta |

El objetivo de UT02 no es eliminar todos los problemas de red, sino reconocerlos y relacionarlos con decisiones técnicas.

---

### 26. Logs por rol

Usa logs que indiquen rol e identidad.

Ejemplo:

```csharp
private void NetLog(string mensaje)
{
    Debug.Log(
        $"[PONG] " +
        $"IsServer={IsServer} " +
        $"IsClient={IsClient} " +
        $"IsOwner={IsOwner} " +
        $"Owner={OwnerClientId} | " +
        mensaje
    );
}
```

En depuración distribuida, “he visto un log” no basta. Hay que saber:

- en qué ventana;
- en qué objeto;
- con qué `OwnerClientId`;
- con qué rol;
- antes o después de qué acción.

---


### 29. Errores frecuentes

| Error | Por qué ocurre | Cómo diagnosticar |
|---|---|---|
| todos controlan todas las palas | falta `IsOwner` | comparar ventanas y logs |
| la pala remota no se ve | falta `NetworkTransform` o prefab mal configurado | Inspector + Hierarchy |
| pelota distinta en cada ventana | física simulada en todos | logs `IsServer` y posición |
| puntuacion solo cambia en Host | variable local | revisar `NetworkVariable` |
| puntuacion no aparece al conectar | no se aplica valor actual | revisar inicialización UI |
| RPC no llega donde esperas | destino incorrecto | revisar `[Rpc(SendTo...)]` y logs |
| pelota no aparece | prefab no registrado o spawn local | revisar Network Prefabs |
| pelota no desaparece | no se llama `Despawn()` desde servidor | logs y Hierarchy |
| tras desconexión quedan objetos | cleanup incompleto | callbacks/despawn/UI |
| funciona solo en Host | no se ha probado Client real | MPPM obligatorio |

---


### 31. Método de diagnóstico

Usa siempre:

```text
síntoma → hipótesis → prueba → observación → conclusión/corrección
```

Ejemplo:

**Síntoma:** la pala remota no se mueve en Client.  
**Hipótesis 1:** el objeto no tiene `NetworkTransform`.  
**Prueba:** abrir prefab y revisar componentes.  
**Observación:** no está añadido.  
**Conclusión:** el movimiento local no se replica. Añadir/configurar `NetworkTransform`.

Otro ejemplo:

**Síntoma:** la pelota está en posiciones distintas.  
**Hipótesis:** la física se simula en Host y Client.  
**Prueba:** añadir log con `IsServer` antes de aplicar velocidad/fuerza.  
**Observación:** ambos procesos aplican movimiento.  
**Conclusión:** mover lógica de pelota al servidor.

---



## Bloque VII — Síntesis y consulta

Este bloque reúne los conceptos esenciales de la unidad y ofrece una referencia compacta y detallada de la API utilizada.

### 33. Resumen técnico de la unidad

| Problema | Solución de UT02 |
|---|---|
| ¿Quién lee input? | solo el owner |
| ¿Cómo se ve la pala remota? | sincronización de transform |
| ¿Quién simula pelota? | servidor/autoridad |
| ¿Dónde vive el puntuacion? | `NetworkVariable` |
| ¿Dónde se pinta la UI? | localmente en cada instancia |
| ¿Cómo va una acción puntual? | RPC |
| ¿Cómo aparece/desaparece pelota? | spawn/despawn desde autoridad |
| ¿Cómo se depura? | logs por rol + método H-P-O-C |

---

### 34. Mapa de API de U02

La siguiente tabla resume los componentes y elementos principales utilizados en Pong NGO.

| Componente / elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| `NetworkManager` | `StartHost()`, `StartClient()`, `Shutdown()` | Iniciar y detener las instancias de la sesión. |
| `NetworkObject` | componente | Dar identidad de red a palas, pelota y objetos compartidos que lo necesiten. |
| `NetworkBehaviour` | `IsOwner`, `IsServer`, `OnNetworkSpawn()` | Escribir lógica que depende del rol, ownership y lifecycle de red. |
| PlayerObject | Player Prefab | Asociar una pala a cada conexión. |
| `NetworkTransform` | componente y configuración de autoridad | Sincronizar el movimiento de las palas entre instancias. |
| `NetworkVariable<T>` | `Value`, `OnValueChanged` | Mantener marcador y estado de ronda sincronizados. |
| RPC universal | `[Rpc(SendTo.Server)]` | Enviar una solicitud puntual del cliente al servidor. |
| RPC universal | `[Rpc(SendTo.ClientsAndHost)]` | Notificar un evento puntual a clientes y Host cuando sea necesario. |
| `NetworkObject` | `Spawn()` | Incorporar una pelota creada por el servidor a la sesión de red. |
| `NetworkObject` | `Despawn()` | Retirar una pelota de la sesión de forma coordinada. |
| `Rigidbody2D` | `linearVelocity` / física 2D | Simular el movimiento de la pelota en la autoridad elegida. |
| `Collider2D` | colisiones / triggers | Detectar rebotes y zonas de gol. |
| `Debug` | `Log()` | Registrar rol, ownership y sucesos para diagnosticar. |

---

### 35. Referencia detallada de componentes y API

#### 35.1. `NetworkManager`

| Componente / elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| `NetworkManager` | `NetworkManager.Singleton` | Acceder al gestor principal de la sesión. |
| `NetworkManager` | `StartHost()` | Iniciar servidor y cliente local en el mismo proceso. |
| `NetworkManager` | `StartClient()` | Iniciar una instancia como cliente. |
| `NetworkManager` | `Shutdown()` | Detener la sesión local. |
| `NetworkManager` | `IsHost`, `IsServer`, `IsClient` | Comprobar el rol que ejecuta una instancia. |
| `NetworkManager` | Player Prefab | Indicar el prefab que representa a cada cliente conectado. |

#### 35.2. `NetworkObject`

| Componente / elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| `NetworkObject` | componente | Proporcionar identidad y lifecycle de red. |
| `NetworkObject` | `Spawn()` | Hacer visible para la sesión un objeto creado por el servidor. |
| `NetworkObject` | `Despawn()` | Retirar de la sesión un objeto de red. |
| `NetworkObject` | ownership | Relacionar determinados objetos con un cliente propietario. |

En U02 la pelota puede crearse desde el servidor y después incorporarse a la sesión mediante `Spawn()`. Su retirada coordinada se realiza con `Despawn()`.

#### 35.3. `NetworkBehaviour`

| Componente / elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| `NetworkBehaviour` | `IsOwner` | Permitir que cada cliente lea input únicamente para su propia pala. |
| `NetworkBehaviour` | `IsServer` | Ejecutar física autoritativa, puntuación o coordinación de ronda solo en servidor cuando corresponda. |
| `NetworkBehaviour` | `IsClient` | Identificar el contexto cliente. |
| `NetworkBehaviour` | `OwnerClientId` | Saber qué cliente posee un objeto. |
| `NetworkBehaviour` | `OnNetworkSpawn()` | Inicializar lógica cuando el objeto ya está activo en la red. |
| `NetworkBehaviour` | `OnNetworkDespawn()` | Limpiar lógica cuando el objeto deja de existir en red. |

#### 35.4. PlayerObject y ownership

| Elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| PlayerObject | Player Prefab | Crear una pala por cliente conectado. |
| PlayerObject | `IsOwner` | Distinguir la pala local de la pala remota. |
| PlayerObject | `OwnerClientId` | Identificar al cliente asociado a cada pala. |

Patrón básico de input:

```csharp
private void Update()
{
    if (!IsOwner)
    {
        return;
    }

    float entradaVertical = Input.GetAxisRaw("Vertical");
    // Aplicar únicamente el input de la pala local.
}
```

#### 35.5. `NetworkTransform`

| Componente / elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| `NetworkTransform` | componente | Sincronizar cambios de `Transform` entre instancias. |
| `NetworkTransform` | posición | Replicar el movimiento vertical de la pala. |
| `NetworkTransform` | configuración de ejes | Sincronizar solo las propiedades necesarias. |
| `NetworkTransform` | autoridad configurada | Determinar desde qué instancia se aceptan los cambios del transform. |

No se añade `NetworkTransform` por costumbre. Se utiliza cuando un transform realmente necesita mantenerse coherente entre las instancias.

#### 35.6. `Rigidbody2D` y física autoritativa

| Componente / elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| `Rigidbody2D` | `linearVelocity` | Mantener la velocidad física de la pelota. |
| `Rigidbody2D` | simulación física | Hacer que una única autoridad calcule el estado físico válido de la pelota. |
| `Collider2D` | colisiones | Detectar rebotes contra palas y límites. |
| Collider/Trigger | zonas de gol | Detectar cuándo la pelota cruza una portería. |

La idea esencial es evitar que Host y Client simulen por separado la misma pelota y produzcan resultados divergentes.

#### 35.7. `NetworkVariable<T>`

| Componente / elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| `NetworkVariable<T>` | constructor | Crear estado persistente con un valor inicial. |
| `NetworkVariable<T>` | `Value` | Leer o modificar el marcador o el estado de ronda. |
| `NetworkVariable<T>` | `OnValueChanged` | Actualizar la UI cuando cambia el estado sincronizado. |

Ejemplo conceptual:

```csharp
private NetworkVariable<int> puntuacionIzquierda = new(0);
private NetworkVariable<int> puntuacionDerecha = new(0);
```

El marcador es **estado persistente**: un cliente que se incorpora o reconstruye la vista necesita conocer su valor actual, no solo recibir el evento histórico «alguien marcó».

#### 35.8. RPC universal `[Rpc]`

| Elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| RPC | `[Rpc(SendTo.Server)]` | Enviar una solicitud puntual desde un cliente al servidor. |
| RPC | `[Rpc(SendTo.ClientsAndHost)]` | Comunicar un evento puntual desde servidor a las instancias. |
| RPC | parámetros | Enviar únicamente la información necesaria para ejecutar la acción. |

RPC no sustituye a `NetworkVariable`. Cada herramienta resuelve un problema distinto:

```text
estado que debe seguir existiendo
→ NetworkVariable

evento puntual
→ RPC
```

#### 35.9. Spawn y despawn de la pelota

| Componente / elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| `Instantiate()` | creación local en servidor | Crear la instancia física del prefab. |
| `NetworkObject` | `Spawn()` | Incorporar esa instancia al mundo de red. |
| `NetworkObject` | `Despawn()` | Retirarla de todas las instancias de forma coordinada. |
| prefab de red | registro en Network Prefabs | Permitir que NGO conozca el prefab que debe replicar. |

#### 35.10. Estado de ronda

| Elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| `NetworkVariable<...>` | `Value` | Mantener el estado actual de la ronda. |
| enumeración propia | valores semánticos | Representar estados como espera, juego o punto. |
| lógica del servidor | transición de estados | Evitar que clientes diferentes coordinen la ronda de forma contradictoria. |

Una posible enumeración creada para el proyecto utiliza nombres en español:

```csharp
public enum EstadoRonda
{
    Esperando,
    EnJuego,
    Punto,
    Finalizada
}
```

#### 35.11. Callbacks y UI local

| Elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| `NetworkVariable<T>` | `OnValueChanged` | Actualizar textos del marcador o estado de ronda. |
| `TMP_Text` | `text` | Representar localmente valores sincronizados. |
| eventos C# | `+=`, `-=` | Suscribir y retirar callbacks de cambio. |

La UI sigue siendo local. Se sincronizan los **datos**, no el texto dibujado en cada ventana.

#### 35.12. Logs y diagnóstico

| Elemento | Propiedad / método utilizado | Para qué lo usamos |
|---|---|---|
| `Debug` | `Log()` | Registrar cambios de rol, ownership, puntos y transiciones. |
| `IsServer` | propiedad | Incluir en el log si la acción se ejecutó en servidor. |
| `IsOwner` | propiedad | Identificar si la acción pertenece al objeto local. |
| `OwnerClientId` | propiedad | Relacionar el mensaje con el cliente propietario. |

Un formato útil es:

```csharp
private void RegistrarRed(string mensaje)
{
    Debug.Log(
        $"[{name}] Propietario={OwnerClientId} " +
        $"Servidor={IsServer} IsOwner={IsOwner} | {mensaje}"
    );
}
```

---

### 36. Qué debes reconocer de un vistazo

```csharp
if (!IsOwner) return;
```

> Solo el propietario local procesa ese input.

```csharp
if (!IsServer) return;
```

> Solo el servidor ejecuta esa lógica.

```csharp
puntuacionIzquierda.Value++;
```

> Se modifica estado persistente sincronizado.

```csharp
puntuacionIzquierda.OnValueChanged += AlCambiarPuntuacion;
```

> La instancia reacciona localmente a cambios posteriores.

```csharp
[Rpc(SendTo.Server)]
```

> La llamada viaja hacia el servidor.

```csharp
objetoRed.Spawn();
```

> El servidor incorpora un objeto a la sesión de red.

```csharp
objetoRed.Despawn();
```

> El objeto se retira coordinadamente del mundo de red.

---

### 37. Glosario

**Authority:** responsabilidad de decidir o validar un estado.  
**Client:** instancia que se conecta a un Host o servidor.  
**Host:** proceso que ejecuta servidor y cliente local.  
**NetworkObject:** componente que da identidad de red a un GameObject.  
**NetworkBehaviour:** script con contexto y callbacks de NGO.  
**NetworkTransform:** componente que sincroniza transformaciones.  
**NetworkVariable:** variable de estado sincronizado.  
**Owner:** cliente propietario de un objeto de red.  
**Proxy remoto:** representación local de un objeto que no pertenece al cliente local.  
**RPC:** llamada remota para ejecutar una función en otro destino de red.  
**Spawn:** creación/activación de un objeto de red en la sesión.  
**Despawn:** retirada de un objeto del mundo de red.  
**Jitter:** variación de la latencia.  
**Packet loss:** pérdida de paquetes.  
**RoundState:** estado de la ronda.

---

### 38. Autoevaluación

1. ¿Por qué empezamos con Pong local?
2. ¿Qué elementos del Pong necesitan `NetworkObject`?
3. ¿Qué diferencia hay entre Player Prefab y PlayerObject?
4. ¿Por qué el input se filtra con `IsOwner`?
5. ¿Qué problema resuelve `NetworkTransform`?
6. ¿Qué no conviene sincronizar en una pala 2D?
7. ¿Por qué la pelota debe tener autoridad clara?
8. ¿Por qué el puntuacion debe ser `NetworkVariable` y no solo RPC?
9. ¿Qué ejemplo de evento puntual aparece en Pong?
10. ¿Qué significa `[Rpc(SendTo.Server)]`?
11. ¿Qué significa `[Rpc(SendTo.ClientsAndHost)]`?
12. ¿Por qué la UI del marcador no necesita ser NetworkObject?
13. ¿Qué ocurre si una pelota se instancia localmente en cada cliente?
14. ¿Qué debe limpiarse al terminar una ronda?
15. ¿Qué debe pasar si Client se desconecta?
16. ¿Por qué “funciona en Host” no basta?
17. ¿Cómo diagnosticas que un fallo está en UI y no en red?
18. ¿Qué evidencias presentarías en el hito UT02?

---

### 39. Profundización opcional

Estas ampliaciones no forman parte del núcleo evaluable:

- selección de nombre de jugador;
- color de pala sincronizado;
- sonido de rebote con RPC;
- cuenta atrás de saque;
- modo espectador;
- límite de puntuación configurable;
- pelota con velocidad progresiva;
- pequeño menú de pausa local;
- comparación entre `NetworkTransform` y sincronización propia;
- primera reflexión sobre predicción/reconciliación.

---

### 40. Referencias públicas oficiales

Estas referencias sirven como apoyo y deben contrastarse con la versión exacta instalada en el aula:

- Netcode for GameObjects 2.7 — RPC:  
  `https://docs.unity.cn/Packages/com.unity.netcode.gameobjects@2.7/manual/advanced-topics/mensaje-system/rpc.html`
- Netcode for GameObjects — NetworkVariables y sincronización de estado:  
  `https://docs.unity.cn/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/ways-to-synchronize.html`
- Netcode for GameObjects — NetworkObject:  
  `https://docs.unity.cn/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/networkobject.html`
- Unity Learn — introducción a NGO:  
  `https://learn.unity.com/tutorial/668810b4edbc2a501c5c6d13`

La documentación puede evolucionar. En clase prevalece la versión de Unity y paquetes fijada por el docente.


---

---

## Anexo — Flujo básico de trabajo con Unity Version Control

UVCS permite conservar estados funcionales del proyecto y recuperar cambios cuando sea necesario.

Flujo habitual:

```text
guardar escena y scripts
→ comprobar Console
→ probar Host + Client
→ revisar Pending Changes
→ escribir un comentario descriptivo
→ Check in Changes
```

Conviene crear un changeset cuando el proyecto alcanza un estado estable y comprobable.

