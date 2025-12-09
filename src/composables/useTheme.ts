import { ref, watch, onMounted } from "vue";

export type ThemeName = "grass" | "clay" | "hard-a" | "hard-b";

const theme = ref<ThemeName>("grass");
const nightMode = ref(false);

const THEME_COOKIE = "tennisjs_theme";
const NIGHT_COOKIE = "tennisjs_night";

export function useTheme() {
  const applyTheme = () => {
    const root = document.documentElement;

    // Apply dataset for specific overrides
    root.dataset.theme = theme.value;
    root.dataset.night = nightMode.value ? "true" : "false";

    // CSS Variables for themes
    let primaryColor = "#006400"; // Grass default

    if (theme.value === "clay") {
      primaryColor = "#b35940"; // Clay (Terra-cotta)
    } else if (theme.value === "hard-a") {
      primaryColor = "#a52a2a"; // Hard Court A: Dull Red
    } else if (theme.value === "hard-b") {
      primaryColor = "#004C93"; // Hard Court B: US Open Blue
    }

    root.style.setProperty("--primary-color", primaryColor);

    // Save to cookies
    document.cookie = `${THEME_COOKIE}=${theme.value};path=/;max-age=31536000`;
    document.cookie = `${NIGHT_COOKIE}=${nightMode.value};path=/;max-age=31536000`;
  };

  const loadTheme = () => {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (
        name === THEME_COOKIE &&
        (value === "grass" ||
          value === "clay" ||
          value === "hard-a" ||
          value === "hard-b")
      ) {
        theme.value = value as ThemeName;
      } else if (name === THEME_COOKIE && value === "hard") {
        theme.value = "hard-a"; // Migrate legacy "hard" cookie to "hard-a"
      }
      if (name === NIGHT_COOKIE) {
        nightMode.value = value === "true";
      }
    }
    applyTheme();
  };

  watch([theme, nightMode], () => {
    applyTheme();
  });

  return {
    theme,
    nightMode,
    loadTheme,
  };
}
