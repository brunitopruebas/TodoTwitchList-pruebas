import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import tmi from "tmi.js";
import { customAlphabet } from 'nanoid'


const nanoid = customAlphabet('1234567890abcdef', 10)

class Perfil {
  constructor(username) {
    this.username = username;
    this.tareas = []
    this.actividades = 'No indicado';
    this.signo = "No indicado";
    this.puntos = 0;
    this.nacionalidad = "No indicada";
    this.nacimiento = 'Secreto';
    this.instagram = 'No indicado';
  }
}

var perfil = JSON.parse(localStorage.getItem('perfil')) || []
function App() {

  const [user, setUser] = useState('brunispet')
  const [badges, setbadges] = useState()
  const [render, setRender] = useState(Date.now());

  const guardarPerfil = (perfil) => {
    const perfilString = JSON.stringify(perfil);
    localStorage.setItem('perfil', perfilString)
  }

  useEffect(() => {
    guardarPerfil(perfil)
  }, [render])

  const usernamePerfil = (username) => perfil.find((item) => item.username === username)

  const corrobarUsername = (username) => {
    console.log('Estoy en corrobarUSername')
    console.log(usernamePerfil(username))
    if (!usernamePerfil(username)) {
      let nuevoPerfil = new Perfil(username)
      perfil.push(nuevoPerfil)
      console.log('Se ha creado un nuevo perfil')
    }
  }

  const corrobarTareas = (username, client, channel) => {
    perfil.find(item => {
      if (item.username === username) {
        var anuncio = '/me No tiene tareas registradas para recordar. !comandos para revisar todo lo que puedo hacer BegWan VirtualHug .'
        if (item.tareas.length === 0) {
          return client.say(channel, anuncio)
        }
      }
    })
  }

  useEffect(() => {
    const client = new tmi.Client({
      options: { debug: true },
      identity: {
        username: import.meta.env.VITE_APP_USERNAME,
        password: import.meta.env.VITE_APP_PASSWORD,
      },
      channels: [import.meta.env.VITE_APP_CHANNELS]
    });

    client.connect();

    client.on("message", (channel, userstate, message, self) => {
      if (self) return;
      const username = userstate.username;
      const displayName = userstate['display-name'];
      const subs = userstate?.subscriber;
      const mod = userstate?.mod;
      const type = userstate['message-type'];
      const isSub = userstate.badges?.subscriber
      const monSubs = userstate['badge-info']?.subscriber;
      const isPrime = userstate.badges?.premium
      const isVip = userstate.badges?.vip
      const isMod = userstate.badges?.moderator
      const badges =
        (isPrime ? "👑" : "") +
        (isVip ? "💎" : "") +
        (isSub ? "🏆" : "") +
        (isMod ? "🗡️" : "");
      const args = message.slice(1).split(' ');
      const id = args[1]
      const command = message.split(" ")[0];
      const tarea = message.substring(command.length + 1);

      switch (command) {

        case '!task':
          corrobarUsername(username)
          corrobarTareas(username, client, channel)
          setRender(Date.now())
          perfil.find(item => {
            if (item.username === username) {
              item.tareas.push({ tarea, id: nanoid(3) })
              item.puntos += 50;
              client.say(channel, `/me imGlitch @${item.username} imGlitch registré tu tarea: 🐱‍💻 ${tarea}  | BegWan VirtualHug`);

            }
          })
          setUser(username)
          setbadges(badges)
          break;

        case '!list':
          corrobarUsername(username)
          corrobarTareas(username, client, channel)
          setRender(Date.now())
          perfil.find(item => {
            if (item.username === username) {
              const listaTareas = item.tareas.forEach(i => {
                client.say(channel, `/me imGlitch @${item.username} imGlitch TAREA: 📖  ${i.tarea} Id: 🔖 ${i.id}`)
              })
            }
          })
          setUser(username)
          setbadges(badges)
          break;

        case '!delete':
          corrobarUsername(username)
          corrobarTareas(username, client, channel)
          setRender(Date.now())
          perfil.find(item => {
            if (item.username === username) {
              const tareaEliminada = item.tareas.find(u => u.id === id);
              client.say(channel, `Esta tarea fue eliminada: 📖 ${tareaEliminada.tarea} => con el Id: 🔖 ${tareaEliminada.id} `)
              const tareasFiltradas = item.tareas.filter(u => u.id !== id);
              console.log(tareasFiltradas)
              item.tareas = tareasFiltradas
            }
          })
          setUser(username)
          setbadges(badges)
          break;

        case '!check':
          corrobarUsername(username)
          corrobarTareas(username, client, channel)
          setRender(Date.now())
          perfil.find(item => {
            if (item.username === username) {
              const tareaMarcada = item.tareas.find(u => u.id === id);
              client.say(channel, `Esta tarea fue marcada: 📖  ${tareaMarcada.tarea} => con el Id:  🔖 ${tareaMarcada.id} `)
              const tareasFiltradas = item.tareas.filter(u => u.id !== id);
              console.log(tareasFiltradas)
              item.tareas = tareasFiltradas
            }
          })
          setUser(username)
          setbadges(badges)
          break;

        case '!clear':
          setRender(Date.now())
          perfil.find(item => {
            if (item.username === username) {
              client.say(channel, `Todas tus tareas fueron eliminadas`)
              item.tareas = []
            }
          })
          setUser(username)
          setbadges(badges)
          break;

        case '!pickup':
          setRender(Date.now())
          perfil.find(item => {
            if (item.username === username) {
              client.say(channel, `Todas tus tareas fueron marcadas`)
              const tareasFiltradas = item.tareas.filter(u => u.id !== id);
              item.tareas = []
            }
          })
          setUser(username)
          setbadges(badges)
          break;
      }
      console.log('Este es el perfil de cuarto de chenz')
      console.log(perfil)

    });
    return () => {
      client.disconnect
    }

  }, []);



  return (
    <div>
      <div className="contenedorTareas w-full p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 dark:bg-gray-800 dark:border-gray-700">
        <h1 className="mb-3 text-base text-center font-semibold text-gray-900 md:text-xl dark:text-white">
          {badges}{user}{badges}
        </h1>
        <h5 className="text-sm font-normal text-center  text-black-500 dark:text-gray-400">
          Este es tu listado de tereas:
        </h5>
        <ul className="my-4 space-y-3">
          {
            usernamePerfil(user) && (
              usernamePerfil(user).tareas.map(i => (
                <li key={i}>
                  <a href="#" className="flex items-center p-3 text-base font-bold text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
                    <span className="flex-1 ml-3 overflow-hidden">{i.tarea}</span>
                    <span className="inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium text-black-500 bg-gray-200 rounded dark:bg-green-700 dark:text-green-400">{i.id}</span>
                  </a>
                </li>
              ))
            )
          }

        </ul>
        <div>
          <a
            href="#"
            className="inline-flex items-center text-xs font-normal text-gray-500 hover:underline dark:text-gray-400"
          >
          </a>
        </div>
      </div>
    </div >
  )
}

export default App
