---
title: "Inicio"
description: "Apuntes del módulo Programación en red e Inteligencia Artificial del Curso de Especialización en Desarrollo de Videojuegos y Realidad Virtual."
---

# Programación en red e Inteligencia Artificial

![Programación en red e Inteligencia Artificial](/DVRV-Red-IA/portada.png)

Apuntes del módulo **Programación en red e Inteligencia Artificial** del **Curso de Especialización en Desarrollo de Videojuegos y Realidad Virtual**.

El curso comienza con los fundamentos de la programación multijugador y la arquitectura cliente-servidor, continúa con sincronización, autoridad y validación en videojuegos en red, y avanza hacia inteligencia artificial aplicada, aprendizaje por refuerzo y servicios online para partidas.

[Acceder a la U01](/DVRV-Red-IA/U01_Apuntes_referencia/)

---

## Recorrido del curso

### 1.ª evaluación

- **U01 · Fundamentos de programación en red y primer proyecto NGO** — RA1
- **U02 · Multijugador en tiempo real, ownership y sincronización** — RA2
- **U03 · Autoridad, estado discreto y validación** — RA1

### 2.ª evaluación

- **U04 · Inteligencia artificial aplicada: percepción, decisión y navegación** — RA5
- **U05 · Aprendizaje computacional y aprendizaje por refuerzo** — RA4

### 3.ª evaluación

- **Proyecto integrador intermodular** — trabajo autónomo del alumnado
- **U06 · Servicios de Internet para videojuegos en línea** — RA3

---

## Unidades de trabajo

### U01 · Fundamentos de programación en red y primer proyecto NGO

**RA1**

Arquitectura cliente-servidor, cliente, servidor, host, servidor dedicado, estado, autoridad, NetworkManager, NetworkObject, NetworkBehaviour, ownership, NetworkVariable, conexión, desconexión y diagnóstico básico.

Proyecto de referencia: **Basic NGO — Networked Player Cards**.

[👉 Acceder a la U01](/DVRV-Red-IA/U01_Apuntes_referencia/)

---

### U02 · Multijugador en tiempo real, ownership y sincronización

**RA2**

Ownership, input local, sincronización de transformaciones, servidor autoritativo, estado persistente frente a eventos, RPC, spawn y despawn, sincronización del marcador, desconexiones, latencia, jitter, pérdida y depuración distribuida.

Proyecto de referencia: **Pong NGO**.

[👉 Acceder a la U02](/DVRV-Red-IA/U02_Apuntes_referencia/)

---

### U03 · Autoridad, estado discreto y validación

**RA1**

Serialización, servidor como fuente de verdad, petición cliente-servidor, validación autoritativa, sincronización del estado, turnos, rondas, connection approval, objetos de escena, desconexión, late join y reconstrucción del estado.

Proyecto de referencia: **Conecta 4 NGO**.

[👉 Acceder a la U03](/DVRV-Red-IA/U03_Apuntes_referencia/)

---

### U04 · Inteligencia artificial aplicada: percepción, decisión y navegación

**RA5**

Vectores y percepción, campo de visión, raycast, memoria de percepción, máquinas de estados finitos, waypoints, rejillas, A*, AI Navigation, NavMesh, áreas, costes, obstáculos, steering e integración percepción-decisión-navegación.

Proyecto de referencia: **Tanks AI Lab**.

[👉 Acceder a la U04](/DVRV-Red-IA/U04_Apuntes_referencia/)

---

### U05 · Aprendizaje computacional y aprendizaje por refuerzo

**RA4**

Aprendizaje automático, aprendizaje por refuerzo, agente, entorno, política, episodio, observaciones, acciones, recompensas, diseño del entorno de entrenamiento, ML-Agents, entrenamiento, evaluación y análisis del comportamiento aprendido.

Proyecto de referencia: **ML-Agents Training Arena**.

[👉 Acceder a la U05](/DVRV-Red-IA/U05_Apuntes_referencia/)

---

### U06 · Servicios de Internet para videojuegos en línea

**RA3**

Establecimiento de partidas, publicación y descubrimiento, listado de partidas disponibles, unión a sesiones, Multiplayer Services, Sessions, Relay, gestión de errores, desconexiones e integración de servicios online sobre un videojuego multijugador.

Proyecto de referencia: **Pong Online**.

[👉 Acceder a la U06](/DVRV-Red-IA/U06_Apuntes_referencia/)

---

## Proyectos principales

1. **Basic NGO — Networked Player Cards**  
   Fundamentos de arquitectura cliente-servidor, lifecycle, ownership y estado sincronizado.

2. **Pong NGO**  
   Sincronización continua, física, autoridad, eventos y comportamiento bajo condiciones de red degradadas.

3. **Conecta 4 NGO**  
   Estado discreto, validación, turnos, late join y reconstrucción del estado.

4. **Tanks AI Lab**  
   Percepción, toma de decisiones, búsqueda de caminos, navegación y comportamiento de agentes.

5. **ML-Agents Training Arena**  
   Diseño y entrenamiento de agentes mediante aprendizaje por refuerzo.

6. **Pong Online**  
   Integración de Sessions y Relay para establecer partidas online.

---

## Tecnologías principales

- **Unity 6**
- **C#**
- **Netcode for GameObjects (NGO)**
- **Unity Transport**
- **Multiplayer Play Mode**
- **Multiplayer Services / Sessions**
- **Relay**
- **AI Navigation**
- **ML-Agents**
- **Git**

---

## Distribución por evaluaciones

| Evaluación | Unidades / bloques | RA principales |
| ---------- | ------------------ | -------------- |
| 1.ª | U01 · U02 · U03 | RA1 · RA2 |
| 2.ª | U04 · U05 | RA5 · RA4 |
| 3.ª | Proyecto integrador · U06 | RA3 |
| **Total** | **6 unidades + proyecto integrador** | **RA1–RA5** |

---

## Licencia

[![CC BY-SA 4.0](/DVRV-Red-IA/cc-by-sa.png)](https://creativecommons.org/licenses/by-sa/4.0/deed.es)

**CC BY-SA 4.0 — Carlos Sanchez y Virginia Zornoza**

Puedes compartir y adaptar este material, siempre que reconozcas la autoría y compartas las modificaciones bajo la misma licencia.

Basado en el proyecto de Redes para ASIR de [Sergi Garcia Barea](https://sergarb1.github.io/ApuntesRedes).
