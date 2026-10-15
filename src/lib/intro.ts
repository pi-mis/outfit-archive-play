export const INTRO_STORAGE_KEY = "bb-intro-v1";

/** L'introduzione si apre solo al primo accesso: se lo storage non è leggibile, non la mostriamo. */
export function shouldShowIntro() {
  try {
    return window.localStorage.getItem(INTRO_STORAGE_KEY) !== "visto";
  } catch {
    return false;
  }
}

export function rememberIntro() {
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, "visto");
  } catch {
    /* navigazione privata o storage bloccato: pazienza, la rivedrà. */
  }
}
