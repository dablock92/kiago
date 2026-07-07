// Dark mode fijo en toda la app (decisión de producto).
// Todos los componentes toman el tema de este hook, así que forzarlo acá
// aplica el modo oscuro globalmente sin tocar cada pantalla.
export function useColorScheme(): "dark" {
  return "dark";
}
