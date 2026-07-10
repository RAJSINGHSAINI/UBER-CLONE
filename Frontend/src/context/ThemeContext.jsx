import {
    createContext,
    useEffect,
    useState
} from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {

    const getInitialTheme = () => {

        const saved = localStorage.getItem("theme");

        if (saved) return saved;

        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
            ? "dark"
            : "light";
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {

        const html = document.documentElement;

        html.classList.toggle(
            "dark",
            theme === "dark"
        );

        localStorage.setItem(
            "theme",
            theme
        );

    }, [theme]);

    const toggleTheme = () => {

        setTheme(prev =>
            prev === "dark"
                ? "light"
                : "dark"
        );

    };

    return (

        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme
            }}
        >

            {children}

        </ThemeContext.Provider>

    );

}