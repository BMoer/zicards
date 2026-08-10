import { createContext, useContext } from 'react'

/**
 * Context und Hook liegen bewusst getrennt von `useAudio.jsx`: Fast Refresh
 * behält den Zustand einer Datei nur dann, wenn sie ausschließlich Komponenten
 * exportiert. Solange `useAudio` neben `AudioProvider` und `AudioToggle` stand,
 * verwarf jeder Edit an einer der Komponenten den Ton-Zustand.
 */
export const AudioContext = createContext()

export function useAudio() {
  return useContext(AudioContext)
}
